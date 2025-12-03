const {ApplicationCommandType,MessageFlags, SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType, AttachmentBuilder,ButtonBuilder,ButtonStyle, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, ContextMenuCommandBuilder, UserSelectMenuBuilder, ChannelType,
    Embed
} = require('discord.js');

async function makeSettingContainer(roomData) {
    const container = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 방 설정`))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`라운드 수`))
        .addActionRowComponents(
            new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('setRounds')
                        .setOptions(
                            Array.from({ length: 10 }, (_, i) => i + 2).map(num =>
                                new StringSelectMenuOptionBuilder()
                                    .setLabel(`${num}`)
                                    .setValue(num.toString())
                            )
                        )
                        .setPlaceholder(`${roomData.gameSettings?.rounds}`)
                )
        )
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`매너 모드`))
        .addActionRowComponents(
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('setMannerToggle')
                        .setLabel(`${roomData.gameSettings?.mannerMode ? '켜짐' : '꺼짐'}`)
                        .setStyle(roomData.gameSettings?.mannerMode ? ButtonStyle.Primary : ButtonStyle.Secondary)
                )
        );
    return container;
}

const data = new SlashCommandBuilder()
        .setName("끝말잇기")
        .setDescription("끝말잇기")

        .addSubcommand(subcommand =>
            subcommand
                .setName("방생성")
                .setDescription("끝말잇기 방을 생성합니다.")
        )
    .addSubcommand(subcommand =>
    subcommand
        .setName("입장")
        .setDescription("끝말잇기 방에 입장합니다.")
    )
    .addSubcommand(subcommand =>
    subcommand
        .setName("퇴장")
        .setDescription("끝말잇기 방에서 퇴장합니다.")
    )
    .addSubcommand(
    subcommand =>
        subcommand
            .setName("시작")
            .setDescription("끝말잇기 게임을 시작합니다.")
    )
    .addSubcommand(subcommand =>
    subcommand
    .setName("중지")
    .setDescription("끝말잇기 게임을 중지합니다.")
    )
    .addSubcommand(subcommand =>
    subcommand
        .setName("방삭제")
        .setDescription("끝말잇기 방을 삭제합니다.")
    )
    .addSubcommand(subcommand =>
    subcommand
        .setName("설정")
        .setDescription("끝말잇기 방의 설정을 변경합니다.")
    )

//gameData : 순서, 현재턴, 마지막단어, 사용된단어목록
//gameSettings : 라운드수, 매너, 시간제한 등 설정

module.exports = {
    data: data,
    async execute(interaction) {
        // 방 생성
        if (interaction.options.getSubcommand() === "방생성") {
            const db = require('../../modules/connetDB.js');
            if (interaction.guild.channels.cache.find(channel => channel.name === `끝말잇기-${interaction.user.username}` && channel.type === ChannelType.GuildText)) {
                await interaction.reply({content: "이미 끝말잇기 방을 생성하셨습니다.", ephemeral: true});
                return;
            }
            // 게임이라는 카테고리가 없으면 생성
            if (interaction.guild.channels.cache.find(channel => channel.name === "버짱이-게임" && channel.type === ChannelType.GuildCategory) == null) {
                await interaction.guild.channels.create({
                    name: "게임",
                    type: ChannelType.GuildCategory,
                });
            }
            // 끝말잇기 체널 생성
            await interaction.guild.channels.create({
                name: `끝말잇기-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: interaction.guild.channels.cache.find(channel => channel.name === "버짱이-게임" && channel.type === ChannelType.GuildCategory)
            });
            const channelId = interaction.guild.channels.cache.find(channel => channel.name === `끝말잇기-${interaction.user.username}` && channel.type === ChannelType.GuildText).id;
            await db.createGameRoom(channelId, "kkumal", 8,interaction);
            await interaction.reply({content: `끝말잇기 방이 생성되었습니다! <#${channelId}>`, ephemeral: true});
            await interaction.guild.channels.cache.get(channelId).send(`${interaction.user}님이 끝말잇기 방을 생성하셨습니다! 게임에 참여하려면 이 채널에서 명령어를 입력하세요.`);
        }
        // 입장
        if (interaction.options.getSubcommand() === "입장") {
            const db = require('../../modules/connetDB.js');
            const roomData = await db.findByRoomId(interaction.channel.id);
            if (!roomData) {
                await interaction.reply({
                    content: "이 채널은 끝말잇기 방이 아닙니다. 버짱이-게임 카테고리 안에 있는 끝말잇기 체널에서 명령어를 사용해주세요",
                    ephemeral: true
                });
                return;
            }
            if (roomData.players.find(player => player.userId === interaction.user.id)) {
                await interaction.reply({content: "이미 게임에 참여 중입니다.", ephemeral: true});
                return;
            }
            if (roomData.players.length >= roomData.maxPlayers) {
                await interaction.reply({content: "게임 방이 가득 찼습니다.", ephemeral: true});
                return;
            }
            if (roomData.isStarted) {
                await interaction.reply({content:"이미 시작된 방에는 입장하실 수 없습니다."});
                return;
            }
            roomData.players.push({userId: interaction.user.id, userName: interaction.user.username});
            await roomData.save();
            await interaction.reply({content: "게임에 성공적으로 입장했습니다!", ephemeral: true});
            await interaction.channel.send(`${interaction.user}님이 게임에 참여하셨습니다!`);
        }
        // 퇴장
        if (interaction.options.getSubcommand() === "퇴장") {
            const db = require('../../modules/connetDB.js');
            const roomData = await db.findByRoomId(interaction.channel.id);
            if (!roomData) {
                await interaction.reply({
                    content: "이 채널은 끝말잇기 방이 아닙니다. 버짱이-게임 카테고리 안에 있는 끝말잇기 체널에서 명령어를 사용해주세요",
                    ephemeral: true
                });
                return;
            }
            const playerIndex = roomData.players.findIndex(player => player.userId === interaction.user.id);
            if (playerIndex === -1) {
                await interaction.reply({content: "게임에 참여하고 있지 않습니다.", ephemeral: true});
                return;
            }
            if (roomData.isStarted) {
                await interaction.reply({content: "이미 시작된 게임에서는 퇴장할 수 없습니다.", ephemeral: true});
                return;
            }
            if (roomData.bangJang.userId === interaction.user.id) {
                await interaction.reply({content: "방장은 퇴장할 수 없습니다. 방을 삭제해주세요", ephemeral: true});
                return;
            }
            roomData.players.splice(playerIndex, 1);
            await roomData.save();
            await interaction.reply({content: "게임에서 성공적으로 퇴장했습니다!", ephemeral: true});
            await interaction.channel.send(`${interaction.user}님이 게임에서 퇴장하셨습니다!`);
        }
        // 시작
        if (interaction.options.getSubcommand() === "시작") {
            const db = require('../../modules/connetDB.js');
            const roomData = await db.findByRoomId(interaction.channel.id);
            if (!roomData) {
                await interaction.reply({
                    content: "이 채널은 끝말잇기 방이 아닙니다. 버짱이-게임 카테고리 안에 있는 끝말잇기 체널에서 명령어를 사용해주세요",
                    ephemeral: true
                });
                return;
            }
            if (roomData.isStarted) {
                await interaction.reply({content: "이미 게임이 시작되었습니다.", ephemeral: true});
                return;
            }
            if (roomData.players.length < 2) {
                await interaction.reply({content: "최소 2명 이상의 플레이어가 필요합니다.", ephemeral: true});
                return;
            }
            await interaction.deferReply();
            const firstWordLength = roomData.gameSettings.rounds || 5;
            roomData.gameSettings.rounds = firstWordLength;
            roomData.gameSettings.mannerMode = roomData.gameSettings.mannerMode || true;
            // 초기화
            roomData.gameData = {};
            roomData.gameData.remainingTime = roomData.gameSettings.timeLimit
            roomData.gameData.lastTimeStamp = new Date();
            roomData.gameData.currentRound = 0;
            roomData.gameData.timeLimit = roomData.gameSettings.timeLimit / 5
            const firstWordResult = await db.getRandomWord(firstWordLength)
            roomData.gameData.lastWord = firstWordResult.charAt(0);
            roomData.gameData.firstWord = firstWordResult;
            roomData.gameData.playerSeq = roomData.players.sort(() => Math.random() - 0.5);
            roomData.gameData.currentTurnIndex = 0;

            const container = new ContainerBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 게임 시작!`))
                .addSeparatorComponents(new SeparatorBuilder())
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`순서: ${roomData.gameData.playerSeq.map(player => `<@${player.userId}>`).join(' ➔ ')}`))
                .addSeparatorComponents(new SeparatorBuilder())
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## [${firstWordResult.charAt(0)}]${firstWordResult.slice(1)}`));
            await interaction.editReply({components:[container], flags: MessageFlags.IsComponentsV2});
            await interaction.channel.send(`<@${roomData.gameData.playerSeq[0].userId}>님의 차례입니다! 단어를 입력해주세요.\n 남은 시간: ${roomData.gameData.remainingTime / 1000}초, 턴 제한 시간: ${roomData.gameData.timeLimit / 1000}초`);
            roomData.isStarted = true;
            await roomData.save();
        }
        // 삭제
        if (interaction.options.getSubcommand() === "방삭제") {
            const db = require('../../modules/connetDB.js');
            const roomData = await db.findByRoomId(interaction.channel.id);
            if (!roomData) {
                await interaction.reply({
                    content: "이 채널은 끝말잇기 방이 아닙니다. 버짱이-게임 카테고리 안에 있는 끝말잇기 체널에서 명령어를 사용해주세요",
                    ephemeral: true
                });
                return;
            }
            if (roomData.bangJang.userId !== interaction.user.id) {
                await interaction.reply({content: "방장만 방을 삭제할 수 있습니다.", ephemeral: true});
                return;
            }
            await db.deleteByRoomId(interaction.channel.id);
            await interaction.reply({content: "끝말잇기 방의 데이터가 삭제되었습니다. 잠시후 체널이 삭제됩니다"});
            setTimeout(async () => {
                await interaction.channel.delete();
            }, 10000);
        }
        // 중지
        if (interaction.options.getSubcommand() === "중지") {
            const db = require('../../modules/connetDB.js');
            const roomData = await db.findByRoomId(interaction.channel.id);
            if (!roomData) {
                await interaction.reply({
                    content: "이 채널은 끝말잇기 방이 아닙니다. 버짱이-게임 카테고리 안에 있는 끝말잇기 체널에서 명령어를 사용해주세요",
                    ephemeral: true
                });
                return;
            }
            if (roomData.bangJang.userId !== interaction.user.id) {
                await interaction.reply({content: "방장만 게임을 중지할 수 있습니다.", ephemeral: true});
                return;
            }
            if (!roomData.isStarted) {
                await interaction.reply({content: "게임이 시작되지 않았습니다.", ephemeral: true});
                return;
            }
            roomData.isStarted = false;
            await roomData.save();
            await interaction.reply({
                content: "끝말잇기 게임이 중지되었습니다. 다시 시작하려면 /끝말잇기 시작 명령어를 사용하세요.",
            });
        }
        if (interaction.options.getSubcommand() === "설정") {
            const db = require('../../modules/connetDB.js');
            const roomData = await db.findByRoomId(interaction.channel.id);
            if (!roomData) {
                await interaction.reply({
                    content: "이 채널은 끝말잇기 방이 아닙니다. 버짱이-게임 카테고리 안에 있는 끝말잇기 체널에서 명령어를 사용해주세요",
                    ephemeral: true
                });
                return;
            }
            if (roomData.bangJang.userId !== interaction.user.id) {
                await interaction.reply({content: "방장만 설정을 변경할 수 있습니다.", ephemeral: true});
                return;
            }
            await interaction.deferReply();

            const container = await makeSettingContainer(roomData);
            const response = await interaction.editReply({components:[container],flags: MessageFlags.IsComponentsV2});
            const roundCollector = response.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                time: 60000,
            })
            const buttonCollector = response.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 60000,
            });
            roundCollector.on('collect', async collectedInteraction => {
                if (collectedInteraction.user.id !== interaction.user.id) {
                    return collectedInteraction.reply({content: "이 명령어는 당신을 위해 만들어진 것이 아닙니다.(<--코파일럿이 씀 ㄷㄷ)", ephemeral: true});
                }
                const selectedRounds = parseInt(collectedInteraction.values[0]);
                roomData.gameSettings.rounds = selectedRounds;
                roomData.markModified('gameSettings.rounds');
                await roomData.save();
                await collectedInteraction.reply({content: `라운드 수가 ${selectedRounds}로 설정되었습니다.`});
                await interaction.editReply({components: [await makeSettingContainer(roomData)], flags: MessageFlags.IsComponentsV2});
            });
            buttonCollector.on('collect', async collectedInteraction => {
                if (collectedInteraction.user.id !== interaction.user.id) {
                    return collectedInteraction.reply({content: "이 명령어는 당신을 위해 만들어진 것이 아닙니다.(<--코파일럿이 씀 ㄷㄷ)", ephemeral: true});
                }
                roomData.gameSettings.mannerMode = !roomData.gameSettings.mannerMode;
                roomData.markModified('gameSettings.mannerMode');
                await roomData.save();
                await collectedInteraction.reply({content: `매너모드가 ${roomData.gameSettings.mannerMode ? '켜짐' : '꺼짐'}으로 설정되었습니다.`});
                await interaction.editReply({components:[await makeSettingContainer(roomData)], flags: MessageFlags.IsComponentsV2});
            });
        }
    }
}