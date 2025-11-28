const db = require('./connetDB.js');
const { Client } = require("pg");
const dotenv = require('dotenv');
dotenv.config();
const {ApplicationCommandType ,MessageFlags, SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType, AttachmentBuilder,ButtonBuilder,ButtonStyle, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, ContextMenuCommandBuilder, UserSelectMenuBuilder, ChannelType,
    Embed
} = require('discord.js');

const client = new Client({
    user: process.env.PSQL_USER,
    host: "127.0.0.1",
    database: "kkumal",
    password: process.env.PSQL_PASSWORD,
    port: 5432,
});
client.connect();

async function exsists(word) {
    try {
        const query = `
        SELECT _id
        FROM public.kkutu_ko
        WHERE _id = $1
        LIMIT 1;
        `;
        const result = await client.query(query, [word]);
        console.log(result);
        if (result.rowCount > 0) return true;

        const inQuery = `
        SELECT _id
        FROM public.kkutu_injeong
        WHERE _id = $1
        LIMIT 1;
        `;
        const inResult = await client.query(inQuery, [word]);
        console.log(inResult);
        return inResult.rowCount > 0;



    } catch (err) {
        console.error('단어 조회 중 오류 발생:', err);
        return false;
    }
}

function getDueumVariants(lastChar) {
    const code = lastChar.charCodeAt(0);
    const HANGUL_BASE = 0xAC00;
    const HANGUL_LAST = 0xD7A3;
    if (code < HANGUL_BASE || code > HANGUL_LAST) return [lastChar];

    const S = code - HANGUL_BASE;
    const jong = S % 28;
    const jung = Math.floor(S / 28) % 21;
    const cho = Math.floor(S / (21 * 28));

    const CHO_N = 2;  // ㄴ
    const CHO_R = 5;  // ㄹ
    const CHO_O = 11; // ㅇ

    const dueumYVowelIdx = new Set([2, 3, 6, 7, 12, 16, 17, 20]); // ㅑ,ㅒ,ㅕ,ㅖ,ㅛ,ㅟ,ㅠ,ㅣ

    const compose = (c, v, t) =>
        String.fromCharCode(HANGUL_BASE + ((c * 21 + v) * 28 + t));

    const out = new Set([lastChar]); // 기본: 동일 글자 허용

    // ㄴ 두음(ㅣ/반모음 y 계열) → ㅇ
    if (cho === CHO_N && dueumYVowelIdx.has(jung)) {
        out.add(compose(CHO_O, jung, jong)); // 여, 요, 유, 이, 양/영 등
    }

    // ㄹ 두음
    if (cho === CHO_R) {
        if (dueumYVowelIdx.has(jung)) {
            out.add(compose(CHO_O, jung, jong)); // 려/료/류/리/량/령 → 여/요/유/이/양/영
        } else {
            out.add(compose(CHO_N, jung, jong)); // 라/래/로/루/락/람 → 나/내/노/누/낙/남
        }
    }

    return Array.from(out);
}

async function playGame(message) {
    if (message.channel.parent && message.channel.parent.name === "버짱이-게임") {
        const roomData = await db.findByRoomId(message.channel.id);
        if (!roomData) console.log("게임 방 데이터를 찾을 수 없습니다.");
        if (roomData.gameType === "kkumal") {
            // 끝말잇기 게임 로직 처리
            if (roomData.isStarted) {
                const gameData = roomData.gameData || {};
                gameData.usedWords = gameData.usedWords || [];
                const lastWord = gameData.lastWord || null;
                const newWord = message.content.trim();
                if (message.author.id !== gameData.playerSeq[gameData.currentTurnIndex].userId) {
                    return await message.reply({
                        content: `지금은 ${gameData.playerSeq[gameData.currentTurnIndex].userName}님의 차례입니다.`,
                        ephemeral: true
                    });
                }
                if (!/^[가-힣]+$/.test(newWord)) {
                    await message.reply("한글 단어만 입력해주세요.");
                    return;
                }
                if (lastWord) {
                    const lastChar = lastWord.charAt(lastWord.length - 1);
                    const firstChar = newWord.charAt(0);
                    const allowedFirstChars = getDueumVariants(lastChar);

                    if (!allowedFirstChars.includes(firstChar)) {
                        const hint = allowedFirstChars.join(', ');
                        await message.reply({ content: `"${hint}"(으)로 시작해야 합니다.`, ephemeral: true });
                        return;
                    }
                }
                if (newWord.length < 2) {
                    await message.reply({content: "두 글자 이상의 단어를 입력해주세요.", ephemeral: true});
                    return;
                }
                if (gameData.usedWords && gameData.usedWords.includes(newWord)) {
                    await message.reply({content: "이미 사용된 단어입니다.", ephemeral: true});
                    return;
                }
                const wordExists = await exsists(newWord);
                if (!wordExists) {
                    await message.reply({content: "등록되지 않은 단어입니다.", ephemeral: true});
                    return;
                }
                gameData.usedWords.push(newWord);

                gameData.lastWord = newWord;
                gameData.currentTurnIndex = (gameData.currentTurnIndex + 1) % roomData.players.length;
                const newAllowedFirstChars = getDueumVariants(newWord.charAt(newWord.length - 1));
                await message.channel.send({components: [new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${lastWord} ➔ ${newWord}`)).addSeparatorComponents(new SeparatorBuilder()).addTextDisplayComponents(new TextDisplayBuilder().setContent(`다음 차례: <@${gameData.playerSeq[gameData.currentTurnIndex].userId}>\n${newAllowedFirstChars.join(', ')}`))],flags: MessageFlags.IsComponentsV2});

                console.log(roomData, gameData);
                roomData.gameData = gameData;
                roomData.markModified('gameData');
                await roomData.save();
            } else {
                await message.reply("게임이 아직 시작되지 않았습니다. 방장이 게임을 시작해야 합니다.");
            }
        }
    }
}
module.exports = {
    playGame,
}