const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('핑')
        .setNameLocalizations({
                ko: '핑',
                'en-US': 'ping'
            })
        .setDescription('핑 날려서 퐁 받기')
        .setDescriptionLocalizations({
                ko: '핑 날려서 퐁 받기',
                'en-US': 'Send a ping and receive a pong'
            }),
    async execute(interaction) {
        await interaction.reply('퐁!');
    },
};