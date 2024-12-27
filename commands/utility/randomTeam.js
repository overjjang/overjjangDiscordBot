const {VoiceChannel, SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');

const data = new SlashCommandBuilder()
    .setName("팀나누기")
    .setNameLocalizations({
        ko: '팀나누기',
        'en-US': 'random_team'
    })
    .setDescription('렌덤으로 팀을 나눕니다')
    .setDescriptionLocalizations({
        ko: '통화방의 사람들을 렌덤으로 팀을 나눕니다',
        'en-US': 'Randomly divide the team'
    })
    .addIntegerOption(option =>
        option.setName('팀수')
            .setNameLocalizations({
                ko: '팀수',
                'en-US': 'team_count'
            })
            .setDescription('나눌 팀의 수를 입력해주세요')
            .setDescriptionLocalizations({
                ko: '나눌 팀의 수를 입력해주세요',
                'en-US': 'Enter the number of teams to divide'
            })
            .setRequired(true))

module.exports = {
    data: data,
    async execute(interaction) {
    }
}