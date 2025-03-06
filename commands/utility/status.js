const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const dotenv = require("dotenv");

dotenv.config();

const data = new SlashCommandBuilder()
    .setName("호스팅")
    .setNameLocalizations(
        {
            ko: "호스팅",
            "en-US": "hosting"
        }
    )
    .setDescription("호스팅 정보를 제공합니다")
    .setDescriptionLocalizations(
        {
            ko: "호스팅 정보를 제공합니다",
            "en-US": "Provide hosting information"
        }
    )
    .addSubcommand(subcommand =>
    subcommand
            .setName("상태")
            .setDescription("호스팅 상태를 확인합니다")
            .setDescriptionLocalizations(
                {
                    ko: "호스팅 상태를 확인합니다",
                    "en-US": "Check the hosting status"
                }
            )
    )

module.exports = {
    category: "utility",
    data: data,
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        if(subcommand === "상태") {
            await fetch("https://overjjang.xyz/api/getHostStatus")
                .then(response => response.json())
                .then(async json => {
                    console.log(json);
                    const stateEmbed = new EmbedBuilder()
                        .setColor("#0099ff")
                        .setTitle("호스팅 상태")
                        .setDescription(`${json.total}개 중 ${json.up}개 서버가 켜져있습니다`)
                        .setFields(
                            json.hosts.map((item, index) => ({
                                name: item.name,
                                value: `상태: ${json.hosts[index].up ? "On 🟩" : "Off 🟥"} | ${json.hosts[index].description} | ${json.hosts[index].state? `${json.hosts[index].state}` : ""}`
                            }))
                        )
                    console.log(stateEmbed);
                    await interaction.reply({embeds:[stateEmbed]});
                })
        }
    }
}