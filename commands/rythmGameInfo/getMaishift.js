const {SlashCommandBuilder, EmbedBuilder,StringSelectMenuBuilder,StringSelectMenuOptionBuilder,ActionRowBuilder, MessageFlags,  TextDisplayBuilder, SeparatorBuilder, ContainerBuilder} = require('discord.js');
const fh = require('../../modules/fetchHelper');

const data = new SlashCommandBuilder()
.setName("마이시프트")
.setDescription("마이시프트 관련 정보 명령어입니다.")
.addSubcommand(
    subcommand =>
        subcommand
    .setName("레이팅")
    .setDescription("마이시프트에 등록된 레이팅을 불러옵니다.")
    .setDescriptionLocalizations({
        "en-US": "Fetches the rating registered in MyShift.",
        "ko": "마이시프트에 등록된 레이팅을 불러옵니다."
    })
    .addStringOption(
        option =>
        option
            .setName("아이디")
            .setDescription("마이시프트에 등록된 아이디를 입력해주세요.")
            .setRequired(true)
    )
)

module.exports = {
    data: data,
    execute: async (interaction) => {
        const id = interaction.options.getString("아이디");
        const urlBase = "https://maimai.shiftpsh.com/api/v1/profiles/"
        const setRegion = "?region=intl"
        const url = urlBase + id + setRegion
        console.log(url)
        await interaction.deferReply();
        const res = await fetch(
            url,{
                headers: {
                    'X-API-Key': process.env.MAISHIFT_API_KEY
                }
            }
        );
        const data = await res.json();
        console.log(data)
        if (data.error) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle("Error")
                .setDescription(`Error: ${data.error}`)
                .setTimestamp();
            await interaction.editReply({ embeds: [embed], ephemeral: true });
            return;
        }

        const profile = data.profile;
        const container = new ContainerBuilder()
        .setAccentColor(0xf97316)
        .addTextDisplayComponents((textDisplay) =>
            textDisplay.setContent(`# ${profile.name}\n\`  ${profile.title.text}  \``)
        )
        .addSeparatorComponents(new SeparatorBuilder())
        // .addSectionComponents((section) =>
        //     section.addTextDisplayComponents((textDisplay) => 
        //         textDisplay.setContent(`# ${profile.name}`)
        //     )
        //     // .setThumbnailAccessory(
		//     //     (thumbnail) => thumbnail.setDescription('유저 아이콘').setURL(profile.iconUrl)
        //     // )
        // )
        .addTextDisplayComponents((textDisplay) =>
            textDisplay.setContent(`## ${profile.rating}\n플레이 카운트: ${profile.playCount.total}(${profile.playCount.current})\nCLASS: ${profile.classRank}\n투어 멤버: :star:x${profile.stars}`)
        )
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents((textDisplay) =>
            textDisplay.setContent(`-# 최근 업데이트: ${new Date(profile.syncedAt).toLocaleString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).replace(/\. /g, ". ").replace(", ", " ")}\n-# 출처: [마이시프트 공식 API](https://maimai.shiftpsh.com/)\n-# 이 앱은 SEGA와 관계없는 비공식 앱입니다`)
        );
        console.log(container)

        await interaction.editReply({
                flags: MessageFlags.IsComponentsV2,
                components: [container],
        });
    }
}