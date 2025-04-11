const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder, ComponentType } = require('discord.js');
const ep = require('../../modules/embedPrefix.js'); // embedPrefix 모듈
const cm = require('../../modules/color-model.js'); // 색상 모델
const fh = require('../../modules/fetchHelper.js'); // fetchHelper 모듈

const urlBase = "https://gubsicapi.overjjang.xyz/api";

// 공통 임베드 생성 함수
async function createEmbed(title, description, color, fields = [], footer = '급식 정보 제공: 교육청 NEIS API') {
    const embed = await ep.embedBase(title, description, color, fields)
    embed.setFooter({text: footer});
    return embed;
}

// 명령어 데이터 정의
const data = new SlashCommandBuilder()
    .setName('오늘급식')
    .setDescription('오늘의 급식 메뉴를 확인합니다')
    .addStringOption(option =>
        option.setName('학교이름')
            .setDescription('학교 이름을 입력해주세요')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('날짜')
            .setDescription('날짜를 입력해주세요(YYYY-MM-DD)')
            .setRequired(false));

module.exports = {
    category: 'utility',
    data: data,
    async execute(interaction) {
        try {
            const schoolName = interaction.options.getString('학교이름');
            const date = interaction.options.getString('날짜')
                ? new Date(interaction.options.getString('날짜')).toISOString().slice(0, 10).replace(/-/g, '')
                : new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10).replace(/-/g, '');

            await interaction.deferReply(); // 응답 지연 처리

            // 학교 정보 가져오기
            const schoolUrl = `${urlBase}?mode=name&schoolName=${schoolName}`;
            const schoolResponse = await fh.fetchData(schoolUrl);

            if (!schoolResponse.RESULT) {
                const schoolList = schoolResponse.schoolInfo[1].row;

                if (schoolList.length === 1) {
                    const { ATPT_OFCDC_SC_CODE, SD_SCHUL_CODE } = schoolList[0]; // 교육청 코드 및 학교 코드
                    const menuEmbed = await fetchMenu(ATPT_OFCDC_SC_CODE, SD_SCHUL_CODE, date);
                    return interaction.editReply({ embeds: [menuEmbed] });
                } else {
                    // 여러 학교가 검색된 경우
                    const embed = createEmbed(
                        `"${schoolName}" 단어가 포함된 학교 목록`,
                        '다음 중 선택해주세요',
                        cm.info,
                        schoolList.map(item => ({
                            name: item.SCHUL_NM,
                            value: item.ORG_RDNMA.replace(/<br\/>/g, '\n'),
                            inline: true
                        }))
                    );

                    // 선택 메뉴 생성
                    const schoolSelect = new StringSelectMenuBuilder()
                        .setCustomId('schoolSelect')
                        .setPlaceholder('학교 선택')
                        .addOptions(
                            schoolList.map(item => ({
                                label: item.SCHUL_NM,
                                value: item.SD_SCHUL_CODE,
                                description: item.ORG_RDNMA
                            }))
                        );
                    const row = new ActionRowBuilder().setComponents(schoolSelect);

                    const reply = await interaction.editReply({ embeds: [embed], components: [row] });
                    const collector = reply.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3600000 });

                    collector.on('collect', async i => {
                        const selectedSchool = schoolList.find(item => item.SD_SCHUL_CODE === i.values[0]);
                        const menuEmbed = await fetchMenu(selectedSchool.ATPT_OFCDC_SC_CODE, selectedSchool.SD_SCHUL_CODE, date);
                        await interaction.editReply({ embeds: [menuEmbed], components: [] });
                    });
                }
            } else if (schoolResponse.RESULT.CODE === 'INFO-200') {
                return interaction.editReply({ embeds: [createEmbed('학교 정보가 없습니다', '학교명을 확인해주세요', cm.warning)] });
            } else {
                return interaction.editReply({ embeds: [ep.errorEmbed(schoolResponse.RESULT)] });
            }
        } catch (error) {
            console.error('Error executing command:', error);
            return interaction.editReply({ embeds: [ep.errorEmbed(error)] });
        }
    }
};

// 급식 정보 가져오기
async function fetchMenu(atptCode, schoolCode, date) {
    const menuUrl = `${urlBase}?mode=menu&atptCode=${atptCode}&schoolCode=${schoolCode}&date=${date}`;
    const menuResponse = await fh.fetchData(menuUrl);

    if (menuResponse.mealServiceDietInfo && menuResponse.mealServiceDietInfo[0].head[0].list_total_count > 0) {
        const schoolData = menuResponse.mealServiceDietInfo[1].row;
        return createEmbed(
            `급식 정보`,
            `${date.slice(0, 4)}년 ${date.slice(4, 6)}월 ${date.slice(6, 8)}일`,
            cm.success,
            schoolData.map(item => ({
                name: item.MMEAL_SC_NM,
                value: item.DDISH_NM.replace(/<br\/>/g, '\n'),
                inline: true
            }))
        );
    } else {
        return createEmbed('급식 정보가 없습니다', '학교명과 일자를 확인해주세요.', cm.warning);
    }
}