const {VoiceChannel, SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const { activeVoiceChannels } = require('../../events/voiceChange'); // voiceChange.js에서 가져오기


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
    .addStringOption(option =>
        option.setName('팀원수')
            .setNameLocalizations({
                ko: '팀원수',
                'en-US': 'team_member_count'
            })
            .setDescription('한 팀당 팀원의 수를 입력해주세요')
            .setDescriptionLocalizations({
                ko: '한 팀당 팀원의 수를 (N-N-N) 형식으로 입력해주세요',
                'en-US': 'Enter the number of team members per team in the format (N-N-N)'
            })
            .setRequired(false));

module.exports = {
    data: data,
    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.user.id;
        const teamCount = interaction.options.getInteger('팀수');

        // 사용자 음성 채널 ID 가져오기
        const voiceChId = activeVoiceChannels.get(userId);

        if (!voiceChId) {
            return interaction.editReply("음성 채널에 참여한 후 다시 시도해주세요!");
        }

        try {
            const channel = await interaction.guild.channels.fetch(voiceChId, {force: true});
            console.log(`사용자가 있는 음성 채널: ${channel.name}`);
            // 음성 채널의 멤버들을 배열로 가져오기
            const members = Array.from(channel.members.values());
            if (members.length <= teamCount) {
                return interaction.editReply("팀 수가 인원 수보다 많거나 같습니다. 인원 수보다 적은 팀 수를 입력해주세요!");
            }

            if (teamCount < 2) {
                return interaction.editReply("팀 수는 2개 이상이어야 합니다!");
            }

            const tramFormat = interaction.options.getString('팀원수');
            const teams = Array.from({ length: teamCount }, () => []);
            
            if (tramFormat) {
                const teamSizes = tramFormat.split('-').map(Number);
                if (teamSizes.length !== teamCount) {
                    return interaction.editReply("형식과 팀 수가 일치하지 않습니다. 다시 입력해주세요!");
                }
                if (teamSizes.reduce((acc, cur) => acc + cur, 0) !== members.length) {
                    return interaction.editReply("팀원 수와 인원 수가 일치하지 않습니다. 다시 입력해주세요!");
                }
                // 팀 나누기 로직
                let memberIndex = 0;
                for (let i = 0; i < teamCount; i++) {
                    for (let j = 0; j < teamSizes[i]; j++) {
                        teams[i].push(members[memberIndex].user.toString());
                        memberIndex++;
                    }
                }
            } else {
                // 팀 나누기 로직
                members.sort(() => Math.random() - 0.5); // 멤버들을 랜덤으로 섞기
                members.forEach((member, index) => {
                    teams[index % teamCount].push(member.user.toString());
                });
            }

            const randomEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('팀 나누기 결과')
                .setDescription(`음성 채널 "${channel.name}"에서 팀을 ${teamCount}개로 나누었습니다`)
                .setFields(
                    teams.map((team, index) => ({
                        name: `팀 ${index + 1}`,
                        value: team.join(', ')
                    }))
                );
            return interaction.editReply({embeds: [randomEmbed]});
        } catch (error) {
            console.error(error);
            return interaction.editReply("오류가 발생했습니다. 다시 시도해주세요!");
        }
    }
};