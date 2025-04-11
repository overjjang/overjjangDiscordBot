const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType } = require('discord.js');
const ep = require('../../module/embedPrefix.js');
const cm = require('../../module/color-model.js');

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
            .setAutocomplete(false)
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
        await interaction.deferReply()
        await fetch(urlBase + `?mode=name&schoolName=${schoolName}`)
            .then(res => res.json())
            .then(async json => {
                const date = interaction.options.getString('날짜') ? new Date(interaction.options.getString('날짜')).toISOString().slice(0, 10).replace(/-/g, '') : new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10).replace(/-/g, '');
                if (!json.RESULT){
                    // 학교 정보가 1개인 경우
                    if (json.schoolInfo[0].head[0].list_total_count === 1) {
                        const atptCode = json.schoolInfo[1].row[0].ATPT_OFCDC_SC_CODE; // 교육청 코드
                        const schoolCode = json.schoolInfo[1].row[0].SD_SCHUL_CODE; // 학교 코드
                        const embed = await fetchMenu(atptCode, schoolCode, date);
                        await interaction.reply({embeds:[embed]});
                    } else { // 학교 정보가 여러개인 경우
                        const schoolEmbed = await ep.embedBase(`"${interaction.options.getString('학교이름')}" 단어가 들어간 학교가 여러개입니다`, '다음 중 선택해주세요', cm.success,
                                json.schoolInfo[1].row.map(item => ({
                                    name: item.SCHUL_NM,
                                    value: item.ORG_RDNMA.replace(/<br\/>/g, '\n') + "\n",
                                    inline: true
                                }))
                            );
                            schoolEmbed.setFooter({ text: '학교 정보 제공: 교육청 NEIS API' });
                        const schoolSelect = new StringSelectMenuBuilder()
                            .setCustomId('schoolSelect')
                            .setPlaceholder('학교 선택')
                            .addOptions(
                                json.schoolInfo[1].row.map(item => new StringSelectMenuOptionBuilder()
                                    .setLabel(item.SCHUL_NM)
                                    .setValue(item.SD_SCHUL_CODE)
                                    .setDescription(item.ORG_RDNMA)
                                    .setEmoji('🏫'))
                            )
                        const row = new ActionRowBuilder()
                            .setComponents(schoolSelect);
                        const response = await interaction.reply({ embeds: [schoolEmbed] , components: [row] });

                        const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });

                        collector.on('collect', async i => {
                            const selectedSchool = json.schoolInfo[1].row.find(item => item.SD_SCHUL_CODE === i.values[0]);
                            await interaction.editReply({embeds:[await fetchMenu(selectedSchool.ATPT_OFCDC_SC_CODE,selectedSchool.SD_SCHUL_CODE, date,true)],components:[]});
                        })
                    }
                } else if ( json.RESULT.CODE === 'INFO-200') {
                    interaction.reply({embeds: [await ep.embedBase("학교 정보가 없습니다", "학교명을 확인해주세요", cm.warning).setFooter({text: '급식 정보 제공: 교육청 NEIS API'})]});
                } else {
                    interaction.reply(ep.errorEmbed(json.RESULT));
                }
            })
            .catch(err => {
                console.error(err);
                interaction.reply(ep.errorEmbed(err));
            });
    }
}

async function fetchMenu(atptCode, schoolCode, date, ...display_atpt) {
    display_atpt = display_atpt[0] || false;
    console.log("trying fetch to API: " + urlBase + `?mode=menu&atptCode=${atptCode}&schoolCode=${schoolCode}&date=${date}`);
    return await fetch(urlBase + `?mode=menu&atptCode=${atptCode}&schoolCode=${schoolCode}&date=${date}`)
        .then(res => res.json())
        .then(async json => {
            if (json.mealServiceDietInfo && json.mealServiceDietInfo[0].head[0].list_total_count > 0) {
                const selectedSchool = json.mealServiceDietInfo[1].row[0];
                const embed = await ep.embedBase(
                    `${selectedSchool.SCHUL_NM}${display_atpt ? "("+selectedSchool.ATPT_OFCDC_SC_NM+")" : ""}의 급식 정보`,
                    `급식 정보는 ${date.slice(0, 4)}년 ${date.slice(4, 6)}월 ${date.slice(6, 8)}일 기준입니다`,
                    cm.success,
                    json.mealServiceDietInfo[1].row.map(item => ({
                        name: item.MMEAL_SC_NM,
                        value: item.DDISH_NM.replace(/<br\/>/g, '\n') + "\n",
                        inline: true
                    }))
                );
                return embed.setFooter({ text: '급식 정보 제공: 교육청 NEIS API' }).setURL(`https://lunch.overjjang.xyz?schoolCode=${schoolCode}&atptCode=${atptCode}&date=${date}`);
            } else {
                return ep.embedBase("급식 정보가 없습니다.", "학교명과 일자를 확인해주세요", cm.warning)
                    .setFooter({ text: '급식 정보 제공: 교육청 NEIS API' });
            }
        })
        .catch(err => {
            console.error(err);
            return ep.errorEmbed(err); // 명시적으로 반환
        });
}