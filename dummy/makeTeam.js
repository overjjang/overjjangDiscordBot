const {VoiceChannel, SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType } = require('discord.js');


const data = new SlashCommandBuilder()
    .setName('팀만들기')
    .setNameLocalizations({
        ko: '팀만들기',
        'en-US': 'make_team'
    })
    .setDescription('팀을 만듭니다')
    .setDescriptionLocalizations({
        ko: '팀을 만듭니다',
        'en-US': 'Make a team'
    })
    .addStringOption(option =>
        option.setName('팀명')
            .setNameLocalizations({
                ko: '팀명',
                'en-US': 'team_name'
            })
            .setDescription('팀 이름을 입력해주세요')
            .setDescriptionLocalizations({
                ko: '팀 이름을 입력해주세요',
                'en-US': 'Enter the team name'
            })
            .setRequired(true))

module.exports = {
    data : data,
    async execute(interaction) {
        const teamName = interaction.options.getString('팀명');
        const teamEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('팀 만들기')
            .setDescription('팀을 만들었습니다')
            .setFields(
                {
                    name: '팀 이름',
                    value: teamName
                }
            )
        interaction.reply({ embeds: [teamEmbed]});
    }
}