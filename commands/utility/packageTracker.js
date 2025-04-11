const {SlashCommandBuilder, EmbedBuilder,StringSelectMenuBuilder,StringSelectMenuOptionBuilder,ActionRowBuilder} = require('discord.js');
const fs = require('fs');
const path = require('path');
const ep = require('../../modules/embedPrefix');
const cm = require('../../modules/color-model');
const fh = require('../../modules/fetchHelper');

// JSON 파일 경로 설정
const jsonPath = path.join(__dirname, '../../companyList.json');

// JSON 파일 읽기
function readJsonFile(query) {
    if(!fs.existsSync(jsonPath)) return [];
    const data = fs.readFileSync(jsonPath, 'utf8');
    const parsedData = JSON.parse(data);
    const companyList = parsedData.Company
    return companyList.filter(company => company.Name.toLowerCase().includes(query.toLowerCase())).slice(0,25);
}


const data = new SlashCommandBuilder()
.setName("운송장")
    .setNameLocalizations(
        {
            ko: "운송장",
            "en-US": "package"
        }
    )
.setDescription("운송장을 조회합니다")
.addSubcommand(
    subcommand =>
    subcommand
        .setName("조회")
        .setDescription("운송장을 조회합니다")
        .setDescriptionLocalizations(
            {
                ko: "운송장을 조회합니다",
                "en-US": "Check the package"
            }
        )
        .addStringOption(
            option =>
            option
                .setName('운송회사')
                .setDescription('운송회사를 선택해주세요')
                .setDescriptionLocalizations(
                    {
                        ko: "운송회사를 선택해주세요",
                        "en-US": "Please select the delivery company"
                    }
                )
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption(
        option =>
        option
            .setName("운송장번호")
            .setDescription("운송장 번호를 입력해주세요")
            .setDescriptionLocalizations(
                {
                    ko: "운송장 번호를 입력해주세요",
                    "en-US": "Please enter the tracking number"
                }
            )
            .setRequired(true)
        )
);



module.exports = {
    data: data,
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused(); // 사용자가 입력한 값
        const filteredCompanies = readJsonFile(focusedValue); // 필터링된 회사 목록 가져오기
        await interaction.respond(
            filteredCompanies.map(company => ({
                name: company.Name,
                value: company.Code, // 선택 시 사용할 값
            }))
        );
    },
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "조회") {
            const companyCode = interaction.options.getString('운송회사');
            const trackingNumber = interaction.options.getString('운송장번호');
            await interaction.deferReply();
            try{
                const response = await fh.fetchData(
                    `https://gubsicapi.overjjang.xyz/api?mode=package&companyCode=${companyCode}&packageCode=${trackingNumber}`
                )
                if (!response.code) {
                    // 성공적으로 조회된 경우
                    const embed = await ep.embedBase(
                        `운송장 조회 결과`,
                        '운송장 조회 결과',
                        cm.success,
                        response.trackingDetails.map((item, index) => ({
                            name: response.trackingDetails[index].kind,
                            value: `위치:${response.trackingDetails[index].where} | 시간:${response.trackingDetails[index].timeString}`
                        }))
                    );
                    await interaction.editReply({ embeds: [embed] });
                } else {
                    // API에서 오류가 반환된 경우
                    await interaction.editReply({ embeds: [ep.warningEmbed(`${response.code} | ${response.msg}`)] });
                }
            } catch (error) {
                console.error('Error fetching package details:', error);
                await interaction.editReply({ embeds: [ep.errorEmbed('운송장 조회 중 오류가 발생했습니다. 다시 시도해주세요!')] });
            }
        }
    }
};