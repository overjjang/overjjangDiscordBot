const {VoiceChannel, SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const { activeVoiceChannels } = require('../../events/voiceChange'); // voiceChange.js에서 가져오기
const fs = require('fs');
const path = require('path');
const jsonPath = path.join(__dirname, 'teamList.json');

function writeJsonFile(data) {
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
}
function readJsonFile() {
    if (fs.existsSync(jsonPath)) {
        const data = fs.readFileSync(jsonPath, 'utf8');
        return JSON.parse(data);
    } else {
        return [];
    }
}

const data = new SlashCommandBuilder()
    .setName("팀")
    .setNameLocalizations({
        ko: '팀',
        'en-US': 'team'
    })
    .setDescription('팀 관련 명령어')
    .setDescriptionLocalizations({
        ko: '팀 관련 명령어',
        'en-US': 'Team related commands'
    })
    // .addSubcommand(subcommand =>
    //     subcommand
    //         .setName('만들기')
    //         .setNameLocalizations({
    //             ko: '만들기',
    //             'en-US': 'make'
    //         })
    //         .setDescription('팀을 만듭니다')
    //         .setDescriptionLocalizations({
    //             ko: '팀을 만듭니다',
    //             'en-US': 'Make a team'
    //         })
    //         .addStringOption(option =>
    //             option.setName('팀명')
    //                 .setNameLocalizations({
    //                     ko: '팀명',
    //                     'en-US': 'team_name'
    //                 })
    //                 .setDescription('팀 이름을 입력해주세요')
    //                 .setDescriptionLocalizations({
    //                     ko: '팀 이름을 입력해주세요',
    //                     'en-US': 'Enter the team name'
    //                 })
    //                 .setRequired(true))
    // )
    .addSubcommand(subcommand =>
        subcommand
            .setName("나누기")
            .setNameLocalizations({
                ko: '나누기',
                'en-US': 'divide'
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
                        ko: '한 팀당 팀원의 수를 (N:N:N) 형식으로 입력해주세요',
                        'en-US': 'Enter the number of team members per team in the format (N:N:N)'
                    })
                    .setRequired(false))

    )
    // .addSubcommand(subcommand =>
    //     subcommand
    //         .setName('목록')
    //         .setNameLocalizations({
    //             ko: '목록',
    //             'en-US': 'list'
    //         })
    //         .setDescription('팀 목록을 확인합니다')
    //         .setDescriptionLocalizations({
    //             ko: '팀 목록을 확인합니다',
    //             'en-US': 'Check the team list'
    //         })
    // )

module.exports = {
    data : data,
    async execute(interaction) {
        await interaction.deferReply();
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "나누기") {
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
                // 음성 채널의 멤버들을 배열로 가져오기, 봇 제외
                const members = Array.from(channel.members.values()).filter(member => !member.user.bot);
                if (members.length < teamCount) {
                    return interaction.editReply("팀 수가 인원 수보다 많습니다. 다시 입력해주세요!");
                }

                if (teamCount < 2) {
                    return interaction.editReply("팀 수는 2개 이상이어야 합니다.");
                }

                const tramFormat = interaction.options.getString('팀원수');
                const teams = Array.from({ length: teamCount }, () => []);

                if (tramFormat) {
                    const teamSizes = tramFormat.split(':').map(Number);
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
        // else if (subcommand === "만들기") {
        //     const userId = interaction.user.id;
        //     const teamName = interaction.options.getString('팀명');
        //     const teamData = {
        //         teamName: teamName,
        //         members: [userId]
        //     }
        //     let teamList =  readJsonFile();
        //     const teamEmbed = new EmbedBuilder()
        //         .setColor('#0099ff')
        //         .setTitle('팀 만들기')
        //         .setDescription('팀을 만들었습니다')
        //         .setFields(
        //             {
        //                 name: '팀 이름',
        //                 value: teamName
        //             }
        //         )
        //     interaction.editReply({ embeds: [teamEmbed]});
        // } else if(subcommand==="목록"){
        //     let teamList = [];
        //     if (fs.existsSync(jsonPath)) {
        //         teamList = JSON.parse(fs.readFileSync(jsonPath));
        //     }
        //     const teamEmbed = new EmbedBuilder()
        //         .setColor('#0099ff')
        //         .setTitle('팀 목록')
        //         .setDescription('팀 목록을 확인합니다')
        //         .setFields(
        //             teamList.map((team, index) => ({
        //                 name: team.teamName,
        //                 value: team.members.join(', ')
        //             }))
        //         );
        //     interaction.editReply({ embeds: [teamEmbed]});
        // }
    }
}