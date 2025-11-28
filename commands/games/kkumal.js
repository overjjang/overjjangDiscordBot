const {ApplicationCommandType ,MessageFlags, SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType, AttachmentBuilder,ButtonBuilder,ButtonStyle, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, ContextMenuCommandBuilder, UserSelectMenuBuilder, ChannelType} = require('discord.js');
const db = require("../../modules/connetDB");

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
        .setName("방삭제")
        .setDescription("끝말잇기 방을 삭제합니다.")
    )


module.exports = {
    data: data,
    async execute(interaction) {
        // 방 생성
        if (interaction.options.getSubcommand() === "방생성") {
            const db = require('../../modules/connetDB.js');
            // if (interaction.guild.channels.cache.find(channel => channel.name === `끝말잇기-${interaction.user.username}` && channel.type === ChannelType.GuildText)) {
            //     await interaction.reply({content: "이미 끝말잇기 방을 생성하셨습니다.", ephemeral: true});
            //     return;
            // }
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
            roomData.isStarted = true;
            // 게임 초기화 로직 추가 가능
            await roomData.save();
            await interaction.reply({content: "끝말잇기 게임이 시작되었습니다!", ephemeral: false});
            await interaction.channel.send(`게임이 시작되었습니다! 첫 번째 단어를 입력해주세요.`);
        }

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
    }
}