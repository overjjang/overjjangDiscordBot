const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType } = require('discord.js');

const urlBase = "https://gubsicapi.overjjang.xyz/api";

const data = new SlashCommandBuilder()
    .setName('오늘급식')
    .setNameLocalizations({
        ko: '오늘급식',
        'en-US': 'today_lunch'
    })
    .setDescription('오늘의 급식 메뉴를 확인합니다')
    .setDescriptionLocalizations({
        ko: '오늘의 급식 메뉴를 확인합니다',
        'en-US': 'Check today\'s lunch menu'
    })
    .addStringOption(option =>
        option.setName('학교이름')
            .setNameLocalizations({
                ko: '학교이름',
                'en-US': 'school_name'
            })
            .setDescription('학교 이름을 입력해주세요')
            .setDescriptionLocalizations({
                ko: '학교 이름을 입력해주세요',
                'en-US': 'Enter the name of the school'
            })
            .setAutocomplete(true)
            .setRequired(true))
    .addStringOption(option =>
        option.setName('날짜')
            .setNameLocalizations({
                ko: '날짜',
                'en-US': 'date'
            })
            .setDescription('날짜를 입력해주세요(YYYY-MM-DD)')
            .setDescriptionLocalizations({
                ko: '날짜를 입력해주세요(YYYY-MM-DD)',
                'en-US': 'Enter the date(YYYY-MM-DD)'
            })
            .setRequired(false));

module.exports = {
    category: 'utility',
    data: data,
    async execute(interaction) {
        const schoolName = interaction.options.getString('학교이름');
        await fetch(urlBase + `?mode=name&schoolName=${schoolName}`)
            .then(res => res.json())
            .then(async json => {
                const date = interaction.options.getString('날짜') ? new Date(interaction.options.getString('날짜')).toISOString().slice(0, 10) : new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
                if (json.schoolInfo[0].head[0].list_total_count) {
                    if (json.schoolInfo[0].head[0].list_total_count === 1) {
                        const atptCode = json.schoolInfo[1].row[0].ATPT_OFCDC_SC_CODE;
                        const schoolCode = json.schoolInfo[1].row[0].SD_SCHUL_CODE;
                        console.log(urlBase + `?mode=menu&atptCode=${atptCode}&schoolCode=${schoolCode}&date=${date.replace(/-/g, '')}`);
                        await fetch(urlBase + `?mode=menu&atptCode=${atptCode}&schoolCode=${schoolCode}&date=${date.replace(/-/g, '')}`)
                            .then(res => res.json())
                            .then(async json => {
                                if (!json.RESULT) {
                                    const menuEmbed = new EmbedBuilder()
                                        .setColor('#0099ff')
                                        .setTitle(`${json.mealServiceDietInfo[1].row[0].SCHUL_NM}의 급식 정보`)
                                        .setDescription(`급식 정보는 ${date}일 기준입니다`)
                                        .setFields(
                                            json.mealServiceDietInfo[1].row.map(item => ({
                                                name: item.MMEAL_SC_NM,
                                                value: item.DDISH_NM.replace(/<br\/>/g, '\n') + "\n",
                                                inline: true
                                            }))
                                        )
                                        .setFooter({text: '급식 정보 제공: 교육청 NEIS API'});
                                    await interaction.reply({embeds: [menuEmbed]});
                                } else {
                                    await interaction.reply("급식 정보가 없습니다");
                                }
                            })
                            .catch(async err => {
                                console.error(err);
                                await interaction.reply("서버와의 통신 중 오류 발생");
                            })
                    } else {
                        const schoolEmbed = new EmbedBuilder()
                            .setColor('#0099ff')
                            .setTitle(`"${interaction.options.getString('학교이름')}"단어가 들어간 학교가 여러개입니다`)
                            .setDescription('다음 중 선택해주세요')
                            .setFields(
                                json.schoolInfo[1].row.map(item => ({
                                    name: item.SCHUL_NM,
                                    value: item.ORG_RDNMA.replace(/<br\/>/g, '\n') + "\n",
                                    inline: true
                                }))
                            )
                            .setFooter({ text: '학교 정보 제공: 교육청 NEIS API' });
                        const schoolSelect = new StringSelectMenuBuilder()
                            .setCustomId('schoolSelect')
                            .setPlaceholder('학교 선택')
                            .addOptions(
                                json.schoolInfo[1].row.map(item => new StringSelectMenuOptionBuilder()
                                    .setLabel(item.SCHUL_NM)
                                    .setValue(item.SCHUL_NM)
                                    .setDescription(item.ORG_RDNMA)
                                    .setEmoji('🏫'))
                            )
                        const row = new ActionRowBuilder()
                            .addComponents(schoolSelect);
                        const response = await interaction.reply({ embeds: [schoolEmbed] , components: [row] });

                        const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });

                        collector.on('collect', async i => {
                            const selectedSchool = json.schoolInfo[1].row.find(item => item.SCHUL_NM === i.values[0]);
                            const atptCode = selectedSchool.ATPT_OFCDC_SC_CODE;
                            const schoolCode = selectedSchool.SD_SCHUL_CODE;
                            await fetch(urlBase + `?mode=menu&atptCode=${atptCode}&schoolCode=${schoolCode}&date=${date.replace(/-/g, '')}`)
                                .then(res => res.json())
                                .then(async json => {
                                    if (json.mealServiceDietInfo[0].head[0].list_total_count > 0) {
                                        const menuEmbed = new EmbedBuilder()
                                            .setColor('#0099ff')
                                            .setTitle(`${json.mealServiceDietInfo[1].row[0].SCHUL_NM}의 급식 정보`)
                                            .setDescription(`급식 정보는 ${date}일 기준입니다`)
                                            .setFields(
                                                json.mealServiceDietInfo[1].row.map(item => ({
                                                    name: item.MMEAL_SC_NM,
                                                    value: item.DDISH_NM.replace(/<br\/>/g, '\n') + "\n",
                                                    inline: true
                                                }))
                                            )
                                            .setFooter({text: '급식 정보 제공: 교육청 NEIS API'});
                                        await interaction.editReply({embeds: [menuEmbed], components: []});
                                    } else {
                                        await i.reply("급식 정보가 없습니다");
                                    }
                                })
                                .catch(async err => {
                                    console.error(err);
                                    await i.reply("서버와의 통신 중 오류 발생");
                                })
                        })
                    }
                } else if (!json.schoolInfo[0].head[0].list_total_count) {
                    interaction.reply("검색된 학교가 없습니다. 학교 이름을 다시 확인해주세요");
                } else {
                    interaction.reply("오류가 발생했습니다. 다시 시도해주세요");
                }
            })
            .catch(err => {
                console.error(err);
                interaction.reply("서버와의 통신 중 오류 발생");
            });
    }
}