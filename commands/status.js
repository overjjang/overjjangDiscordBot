const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");


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
            await fetch("https://overjjang.xyz/")
            const stateEmbed = new EmbedBuilder()
                .setColor("#0099ff")
                .setTitle("호스팅 상태")
                .setDescription("호스팅 상태를 확인합니다")
                .setFields(
                    {

                    }
                )
            interaction.reply({embeds: [stateEmbed]});
        }
    }
}