const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('핑')
        .setDescription('핑 날려서 퐁 받기'),
    async execute(interaction) {
        await interaction.reply('퐁!');
    },
};