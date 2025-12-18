const db = require('./connetDB.js');
const dotenv = require('dotenv');
dotenv.config({path:'../.env'});
const {ApplicationCommandType ,MessageFlags, SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType, AttachmentBuilder,ButtonBuilder,ButtonStyle, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, ContextMenuCommandBuilder, UserSelectMenuBuilder, ChannelType,
    Embed
} = require('discord.js');

// type 0,1:명사 5:동사
// ToDo: 시간제한 처리 로직 통합

function getTimeLimitState(gameData) {
    const now = new Date();
    const lastTime = gameData.lastTimeStamp ? new Date(gameData.lastTimeStamp) : now;
    const elapsed = now - lastTime;
    const turnTimeLimit = gameData.turnTimeLimit || 0;
    const remainingTurnTime = turnTimeLimit - elapsed;

    return {
        now,
        elapsed,
        remainingTurnTime,
        isTurnTimeout: remainingTurnTime < 0,
    };
}

async function turnOverHandler(message, roomData, remainingTurnTime) {
    const gameData = roomData.gameData;
    if (gameData.currentRound + 1 >= roomData.gameSettings.rounds) {

        const container = new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 게임 종료!`))
            .addSeparatorComponents(new SeparatorBuilder())
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`### 최종 점수:`)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`${gameData.playerSeq.map(player => `- <@${player.userId}>: ${player.userScore}점`).join('\n')}`)
            );

        await message.channel.send({components: [container], flags: MessageFlags.IsComponentsV2});
        roomData.isStarted = false;
        roomData.markModified('gameData');
        await roomData.save();
        return;
    }

    // 다음 라운드 시작
    await message.reply({content: `타임오버!${(remainingTurnTime/1000).toFixed(2)}초 늦었습니다. 5초 후 다음 라운드가 시작됩니다.`});
    // 5초후 안내 메시지
    setTimeout(
        async () => {
            roomData.isStarted = true;
            gameData.lastTimeStamp = new Date();
            gameData.remainingTime = 0;
            gameData.currentRound += 1;
            gameData.remainingTime = roomData.gameSettings.timeLimit
            gameData.turnTimeLimit = roomData.gameSettings.timeLimit / 5;
            gameData.usedWords = []
            gameData.lastWord = gameData.firstWord.charAt(gameData.currentRound)
            roomData.gameData = gameData;
            const container = new ContainerBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${gameData.currentRound + 1}라운드`))
                .addSeparatorComponents(new SeparatorBuilder())
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${gameData.firstWord.slice(0,gameData.currentRound)}[${gameData.firstWord.charAt(gameData.currentRound)}]${gameData.firstWord.slice(gameData.currentRound+1)} `))
                .addSeparatorComponents(new SeparatorBuilder())
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`다음 차례: <@${gameData.playerSeq[gameData.currentTurnIndex].userId}>`))
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ➔ ${getDueumVariants(gameData.lastWord).join(', ')}`));

            await message.channel.send({components: [container],flags: MessageFlags.IsComponentsV2});
            const saveRoomData = await db.findByRoomId(message.channel.id);
            saveRoomData.gameData = roomData.gameData;
            saveRoomData.isStarted = true;
            saveRoomData.markModified('gameData');
            await saveRoomData.save();
        },5000
    )
}


// 두음법칙에 따른 가능한 첫 글자 변형 반환
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

// 게임 진행 함수
async function playGame(message) {
    if (message.channel.parent && message.channel.parent.name === "버짱이-게임") {
        const roomData = await db.findByRoomId(message.channel.id);
        if (!roomData) console.log("게임 방 데이터를 찾을 수 없습니다.");
        if (roomData.gameType === "kkumal") {
            // 게임이 시작되었는지 확인
            if (roomData.isStarted) {
                const gameData = roomData.gameData || {};
                gameData.usedWords = gameData.usedWords || [];
                const lastWord = gameData.lastWord || null;
                const newWord = message.content.trim();

                // 예외처리들

                // 타임오버 체크 (다음 메시지의 타임스템프와 비교)
                const { now, elapsed: timeDelta, remainingTurnTime } = getTimeLimitState(gameData);
                console.log(`이전 타임스템프: ${gameData.lastTimeStamp}, 현재 타임스템프: ${now}, 시간 차이: ${timeDelta}ms`);
                if (remainingTurnTime < 0) {
                    roomData.isStarted = false;
                    roomData.markModified('gameData');
                    await roomData.save();

                    await turnOverHandler(message, roomData, remainingTurnTime);
                    return;
                }
                // 플레이어가 게임 방에 속해있는지 확인
                if (!roomData.players.some(player => player.userId === message.author.id)) {
                    return;
                }
                // 현재 플레이어 차례인지 확인
                if (message.author.id !== gameData.playerSeq[gameData.currentTurnIndex].userId) {
                    return await message.reply({
                        content: `지금은 ${gameData.playerSeq[gameData.currentTurnIndex].userName}님의 차례입니다.`,
                        ephemeral: true
                    });
                }
                // 단어 유효성 검사
                if (!/^[가-힣]+$/.test(newWord)) {
                    await message.reply("한글 단어만 입력해주세요.");
                    return;
                }
                // 첫 글자 검사
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
                // 단어 길이 검사
                if (newWord.length < 2) {
                    await message.reply({content: "두 글자 이상의 단어를 입력해주세요.", ephemeral: true});
                    return;
                }
                // 중복 단어 검사
                if (gameData.usedWords && gameData.usedWords.includes(newWord)) {
                    await message.reply({content: "이미 사용된 단어입니다.", ephemeral: true});
                    return;
                }
                // 단어 데이터베이스 검사
                const wordExists = await db.exists(newWord);
                if (!wordExists) {
                    await message.reply({content: "등록되지 않은 단어입니다.", ephemeral: true});
                    return;
                }
                // 매너 단어 검사
                const isNotMannerWord = await db.isNotMannerWord(newWord);
                if (!isNotMannerWord) {
                    await message.reply({content: `한방단어: ${newWord}`, ephemeral: true});
                    return;
                }

                // 게임 진행

                // 점수 로직
                const score = Math.floor((newWord.length*10) + (10*(remainingTurnTime/gameData.turnTimeLimit)));
                if (!gameData.playerSeq[gameData.currentTurnIndex].userScore) {
                    gameData.playerSeq[gameData.currentTurnIndex].userScore = 0;
                }
                gameData.playerSeq[gameData.currentTurnIndex].userScore += score;
                // 상태 업데이트
                gameData.usedWords.push(newWord);
                gameData.lastWord = newWord;
                gameData.currentTurnIndex = (gameData.currentTurnIndex + 1) % roomData.players.length;
                gameData.remainingTime = gameData.remainingTime - timeDelta;
                gameData.turnTimeLimit = gameData.remainingTime / 5;
                if (gameData.turnTimeLimit < 3000) {
                    gameData.turnTimeLimit = gameData.turnTimeLimit+1000;
                }
                gameData.lastTimeStamp = now;

                // 안내 메시지
                const newAllowedFirstChars = getDueumVariants(newWord.charAt(newWord.length - 1));
                const container = new ContainerBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${lastWord} ➔ ${newWord}\n(+${score}) total: ${gameData.playerSeq[gameData.currentTurnIndex].userScore}`))
                    .addSeparatorComponents(new SeparatorBuilder())
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`다음 차례: <@${gameData.playerSeq[gameData.currentTurnIndex].userId}>`))
                    .addSeparatorComponents(new SeparatorBuilder())
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ➔ ${newAllowedFirstChars.join(', ')}`))
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`라운드 남은 시간: ${(gameData.remainingTime / 1000).toFixed(2)}초, 턴 제한시간: ${(gameData.turnTimeLimit / 1000).toFixed(2)}초`))
                await message.channel.send({components: [container],flags: MessageFlags.IsComponentsV2});
                console.log(roomData, gameData);
                roomData.gameData = gameData;
                roomData.markModified('gameData');
                await roomData.save();
                const lastRoomData = roomData;
                // 정상 게임 진행 로직 끝

                console.log(`남은 턴 시간: ${gameData.turnTimeLimit}ms`);
                // 타임오버 체크 (타임아웃 설정)
                setTimeout(
                    async () => {
                        const currentRoomData = await db.findByRoomId(message.channel.id);

                        const currentGameData = currentRoomData.gameData;
                        const nowTurnIndex = currentGameData.usedWords.length
                        const lastTurnIndex = lastRoomData.gameData.usedWords.length;
                        const nowRound = currentGameData.currentRound;
                        const lastRound = lastRoomData.gameData.currentRound;
                        console.log(`타임아웃 체크: 현재 턴 인덱스 ${nowTurnIndex}, 이전 턴 인덱스 ${lastTurnIndex}, 게임 시작 여부: ${currentRoomData.isStarted}`);
                        if (nowTurnIndex === lastTurnIndex && nowRound === lastRound && currentRoomData.isStarted) {
                            roomData.isStarted = false;
                            roomData.markModified('gameData');
                            await roomData.save();
                            await turnOverHandler(message, currentRoomData, 1000);
                        }
                    },gameData.turnTimeLimit + 1000
                )

            } else {
                await message.reply("게임이 아직 시작되지 않았습니다.");
            }
        }
    }
}
module.exports = {
    playGame,
}
