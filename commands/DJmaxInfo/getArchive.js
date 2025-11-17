const {SlashCommandBuilder, EmbedBuilder,StringSelectMenuBuilder,StringSelectMenuOptionBuilder,ActionRowBuilder, MessageFlags,  TextDisplayBuilder, SeparatorBuilder, ContainerBuilder} = require('discord.js');
const fh = require('../../modules/fetchHelper');

const data = new SlashCommandBuilder()
.setName("디맥")
.setDescription("DJMAX 관련 정보 명령어입니다.")
.addSubcommand(
    subcommand =>
        subcommand
    .setName("티어")
    .setDescription("V-archive 티어를 불러옵니다.")
    .addStringOption(
        option =>
        option
            .setName('아이디')
            .setDescription('V-archive 아이디를 입력해주세요.')
            .setRequired(true)
    )
            .addStringOption(
                option =>
                option
                    .setName('버튼')
                    .setDescription('티어를 확인할 버튼을 선택해주세요.')
                    .setRequired(true)
                    .addChoices(
                        {name: '4B', value: '4'},
                        {name: '5B', value: '5'},
                        {name: '6B', value: '6'},
                        {name: '8B', value: '8'},
                    )
            )
)
    .addSubcommand(
        subcommand =>
            subcommand
                .setName("t50")
                .setDescription("상위 50곡의 정보를 불러옵니다")
                .addStringOption(
                    option =>
                        option
                            .setName('아이디')
                            .setDescription('V-archive 아이디를 입력해주세요.')
                            .setRequired(true)
                )
                .addStringOption(
                    option =>
                        option
                            .setName('버튼')
                            .setDescription('티어를 확인할 버튼을 선택해주세요.')
                            .setRequired(true)
                            .addChoices(
                                {name: '4B', value: '4'},
                                {name: '5B', value: '5'},
                                {name: '6B', value: '6'},
                                {name: '8B', value: '8'},
                            )
                )
    );

module.exports = {
    data: data,
    async execute(interaction) {
        const urlBase = "https://v-archive.net/api/archive";
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "티어") {
            const userId = interaction.options.getString('아이디');
            const button = interaction.options.getString('버튼');

            await interaction.deferReply();

            const url = `${urlBase}/${userId}/tier/${button}`;
            const response = await fh.fetchData(url);

            if (response.success) {
                const tierInfo = response.tier
                const container = new ContainerBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${userId} | ${button}버튼`))
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${tierInfo.name} | ${tierInfo.rating}`))
                    .addSeparatorComponents(new SeparatorBuilder())
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`상위 50곡 점수: ${response.top50sum}\n티어포인트: ${response.tierPoint}`))
                    .addSeparatorComponents(new SeparatorBuilder());
                const top10 = response.topList.slice(0, 10);
                let topString = `상위 10곡\n`;
                top10.forEach((song, index) => {
                    topString += `${song.pattern}${String(song.level).padStart(2, "0")} | ${song.score}% - ${song.name}`;
                    if (song.score === "100.00") {
                        topString += `<:perfect:1439794561760100452>\n`;
                    } else if (song.maxCombo === 1) {
                        topString += `<:maxcombo:1439794612016517180>\n`;
                    } else {
                        topString += `\n`;
                    }
                });
                container.addTextDisplayComponents(new TextDisplayBuilder().setContent(topString));

                interaction.editReply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                });
            }
        }
        if (subcommand === "t50") {
            const userId = interaction.options.getString('아이디');
            const button = interaction.options.getString('버튼');

            await interaction.deferReply();
            const url = `${urlBase}/${userId}/tier/${button}`;
            const response = await fh.fetchData(url);

            if (response.success) {
                const container = new ContainerBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${userId} | ${button}버튼`))
                    .addSeparatorComponents(new SeparatorBuilder());
                let topString = `상위 50곡\n`;
                response.topList.forEach((song, index) => {
                    topString += `${index + 1}. ${song.pattern}${String(song.level).padStart(2 , "0")} | ${song.score}% - ${song.name}`;
                    if (song.score === "100.00") {
                        topString += `<:perfect:1439794561760100452>\n`;
                    } else if (song.maxCombo === 1) {
                        topString += `<:maxcombo:1439794612016517180>\n`;
                    } else {
                        topString += `\n`;
                    }
                });
                container.addTextDisplayComponents(new TextDisplayBuilder().setContent(topString));

                interaction.editReply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                });
            }
        }
    }
}