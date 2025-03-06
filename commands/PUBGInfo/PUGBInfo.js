const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType, AttachmentBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('배그')
    .setDescription('배틀그라운드 정보를 제공합니다')
    .addSubcommand(subcommand =>
        subcommand
            .setName('비밀의방')
            .setDescription('비밀의방 정보를 제공합니다')
            .addStringOption(option =>
                option.setName('맵')
                    .setDescription('비밀의을 찾으려는 맵을 입력해주세요')
                    .setRequired(true)
                    .addChoices([
                        {name : '에란겔', value: 'erangel'},
                        {name : '태이고', value: 'taego'},
                        {name : '비켄디', value: 'vikendi'},
                        {name : '파라모', value: 'paramo'}
                    ]))
    )
    .addSubcommand(subcommand =>
    subcommand
        .setName('전적')
        .setDescription('전적 정보를 제공합니다')
        .addStringOption(option => option.setName('닉네임').setRequired(true))
    );

module.exports = {
    data: data,
    async execute(interaction) {
        if (interaction.options.getSubcommand() === '비밀의방') {
            const map = interaction.options.getString('맵');
            let mapName;
            let mapImage;
            if (map === 'erangel') {
                mapName = '에란겔';
                mapImage = 'erangel';
            } else if (map === 'taego') {
                mapName = '태이고';
                mapImage = 'taego';
            } else if (map === 'vikendi') {
                mapName = '비켄디';
                mapImage = 'vikendi';
            } else if (map === 'paramo') {
                mapName = '파라모';
                mapImage = 'paramo';
            } else {
                interaction.reply('뭐하세요');
                return;
            }
            const mapEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('비밀의방 정보')
                .setDescription(`${mapName}의 비밀의방 정보를 제공합니다`)
                .setImage(`https://overjjang.xyz/api/asset/PUBG/${mapImage}`);

            interaction.reply({embeds: [mapEmbed]});
        }
    }
}