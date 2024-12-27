const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('도움말')
    .setNameLocalizations({
        ko: '도움말',
        'en-US': 'help'
    })
    .setDescription('명령어 목록을 확인합니다')
    .setDescriptionLocalizations({
        ko: '명령어 목록을 확인합니다',
        'en-US': 'Check the command list'
    });

module.exports = {
    data : data,
    async execute(interaction) {
        const helpEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('명령어 목록')
            .setDescription('명령어 목록을 확인합니다')
            .setFields(
                // 자동으로 명령어 목록을 생성합니다
                interaction.client.commands.map(command => ({
                    name: "/" + command.data.name,
                    value: command.data.description,
                }))
            )
        interaction.reply({ embeds: [helpEmbed] });
    }
}