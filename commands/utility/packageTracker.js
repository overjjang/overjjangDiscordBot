const {SlashCommandBuilder, EmbedBuilder,StringSelectMenuBuilder,StringSelectMenuOptionBuilder,ActionRowBuilder} = require('discord.js');
const fs = require('fs');
const path = require('path');

// JSON 파일 경로 설정
const jsonPath = path.join(__dirname, '../../companyList.json');

// JSON 파일 읽기
function readJsonFile() {
    if (fs.existsSync(jsonPath)) {
        const data = fs.readFileSync(jsonPath, 'utf8');
        return JSON.parse(data);
    } else {
        return { Company: [] };
    }
}

const companyList = readJsonFile().Company;

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
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "조회") {
            const companyNameInput = interaction.options.getString('운송회사').toLowerCase();
            const filteredCompanies = companyList.filter(company => company.Name.toLowerCase().includes(companyNameInput));

            if (filteredCompanies.length === 1) {
                const companyCode = filteredCompanies[0].Code;
                const trackingNumber = interaction.options.getString('운송장번호');
                await fetch(`https://gubsicapi.overjjang.xyz/api?mode=package&companyCode=${companyCode}&packageCode=${trackingNumber}`)
                    .then(res => res.json())
                    .then(async json => {
                        const embed = new EmbedBuilder()
                            .setColor('#0099ff')
                            .setTitle(`상태:${json.lastDetail.kind} | 위치:${json.lastDetail.where} | 시간:${json.lastDetail.timeString}`)
                            .setDescription(`상품명:${json.itemName} | 보내는 분:${json.senderName} | 받는 분:${json.receiverName}`)
                            .setFields(
                                json.trackingDetails.map((item, index) => ({
                                    name : json.trackingDetails[index].kind,
                                    value : `위치:${json.trackingDetails[index].where} | 시간:${json.trackingDetails[index].timeString}`
                                }))
                            )

                        await interaction.reply({ embeds: [embed] });
                    });
            } else if (filteredCompanies.length > 1) {
                const select = new StringSelectMenuBuilder()
                    .setCustomId('company')
                    .setPlaceholder('택배사를 선택해주세요')
                    .addOptions(
                        filteredCompanies.map(company =>
                            new StringSelectMenuOptionBuilder()
                                .setLabel(company.Name)
                                .setValue(company.Code)
                        )
                    );
                const row = new ActionRowBuilder().addComponents(select);
                const embed = new EmbedBuilder()
                    .setColor("#0099ff")
                    .setTitle("택배사를 선택해주세요");

                await interaction.reply({ embeds: [embed], components: [row] });
            } else {
                await interaction.reply({ content: '해당 이름의 택배사를 찾을 수 없습니다.', ephemeral: true });
            }
        }
    }
};