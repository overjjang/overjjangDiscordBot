const { SlashCommandBuilder, EmbedBuilder, Embed} = require('discord.js');
const urlBase = "https://gubsicapi.overjjang.xyz/api";

const data = new SlashCommandBuilder()
        .setName('오늘점심')
        .setDescription('오늘의 점심 메뉴를 확인합니다')
        .addStringOption(option =>
            option.setName('학교이름')
                .setDescription('학교 이름을 입력해주세요')
                .setRequired(true))
        // 날자 옵션
        .addStringOption(option =>
            option.setName('날짜')
                .setDescription('날짜를 입력해주세요(YYYY-MM-DD)')
                .setRequired(false));

module.exports = {
    data : data,
    async execute(interaction) {
        const schoolName = interaction.options.getString('학교이름');
        await fetch(urlBase + `?mode=name&schoolName=${schoolName}`)
            .then(res => res.json())
            .then(async json => {
                const date = interaction.options.getString('날짜') ? new Date(interaction.options.getString('날짜')).toISOString().slice(0,10) : new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
                if (json.schoolInfo[0].head[0].list_total_count === 1 || json.schoolInfo[1].row[0].SCHUL_NM === schoolName) {
                    //@TODO:여러 학교가 검색되었을 때 처리
                    await fetch(urlBase + `?mode=menu&atptCode=${json.schoolInfo[1].row[0].ATPT_OFCDC_SC_CODE}&schoolCode=${json.schoolInfo[1].row[0].SD_SCHUL_CODE}&date=${date.replace(/-/g, '')}`)
                        .then(res => res.json())
                        .then(json => {
                            if (json.mealServiceDietInfo[0].head[0].list_total_count > 0) {
                                const menuEmbed = new EmbedBuilder()
                                    .setColor('#0099ff')
                                    .setTitle(`${json.mealServiceDietInfo[1].row[0].SCHUL_NM}의 급식 정보`)
                                    .setDescription(`급식 정보는 ${date}일 기준입니다`)
                                    .setFields(
                                        json.mealServiceDietInfo[1].row.map(item => ({
                                            name: item.MMEAL_SC_NM,
                                            value: item.DDISH_NM.replace(/<br\/>/g, '\n')+"\n",
                                            inline: true
                                        }))
                                    )
                                    .setFooter({ text: '급식 정보 제공: 교육청 NEIS API' });
                                interaction.reply({ embeds: [menuEmbed] });
                            } else {
                                interaction.reply("메뉴 정보 없음");
                            }
                        })
                        .catch(err => {
                            console.error(err);
                            interaction.reply("서버와의 통신 중 오류 발생");
                        });
                    }
                else if(json.schoolInfo[0].head[0].list_total_count === 0){
                    interaction.reply("검색된 학교가 없습니다. 학교 이름을 다시 확인해주세요");
                } else {
                    const schoolEmbed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle(`"${interaction.options.getString('학교이름')}"단어가 들어간 학교가 여러개입니다`)
                        .setDescription('학교 이름을 다시 입력해주세요')
                        .setFields(
                            json.schoolInfo[1].row.map(item => ({
                                name: item.SCHUL_NM,
                                value: item.ORG_RDNMA.replace(/<br\/>/g, '\n')+"\n",
                                inline: true
                            }))
                        )
                        .setFooter({ text: '학교 정보 제공: 교육청 NEIS API' });
                    interaction.reply({ embeds: [schoolEmbed] });
                }
                }
            )
            .catch(err => {
                    console.error(err);
                    interaction.reply("서버와의 통신 중 오류 발생");
                }
            );
    }
}