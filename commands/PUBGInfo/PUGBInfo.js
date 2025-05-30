const { MessageFlags, SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType, AttachmentBuilder,ButtonBuilder,ButtonStyle, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder } = require('discord.js');
const dotenv = require('dotenv');
const ep = require('../../modules/embedPrefix');
const cm = require('../../modules/color-model');

dotenv.config();

const data = new SlashCommandBuilder()
    .setName('배그')
    .setDescription('배틀그라운드 정보를 제공합니다')
    .addSubcommand(subcommand =>
        subcommand
            .setName('비밀의방')
            .setDescription('비밀의방 정보를 제공합니다')
            .addStringOption(option =>
                option.setName('맵')
                    .setDescription('비밀의을 찾으려는 맵을 입력해주세요')
                    .setRequired(true)
                    .addChoices([
                        {name : '에란겔', value: 'erangel'},
                        {name : '태이고', value: 'taego'},
                        {name : '비켄디', value: 'vikendi'},
                        {name : '파라모', value: 'paramo'}
                    ]))
    )
    .addSubcommand(subcommand =>
    subcommand
        .setName('전적')
        .setDescription('전적 정보를 제공합니다')
        .addStringOption(option =>
        option
            .setName('플렛폼')
            .setDescription('전적을 찾으려는 플랫폼을 입력해주세요')
            .setRequired(true)
            .addChoices(
                {name: 'Steam', value: 'steam'},
                {name: 'Kakao', value: 'kakao'}
        ))
        .addStringOption(option =>
            option
                .setName('닉네임')
                .setRequired(true)
                .setDescription('전적을 찾으려는 닉네임을 입력해주세요')
        )
        .addStringOption(option =>
        option
            .setName('모드')
            .setDescription('전적을 찾으려는 모드를 입력해주세요')
            .addChoices(
                {name: '솔로', value:'solo'},
                {name: '듀오', value: 'duo'},
                {name: '스쿼드', value: 'squad'},
                {name: '솔로-FFP', value: 'solo-fpp'},
                {name: '듀오-FFP', value: 'duo-fpp'},
                {name: '스쿼드-FFP', value: 'squad-fpp'}
            )
            .setRequired(false)
        )
    ).addSubcommand(subcommand =>
            subcommand
                .setName('메치')
                .setDescription("메치 정보를 제공합니다")
                .addStringOption(option =>
                    option
                        .setName('플렛폼')
                        .setDescription("메치를 찾으려는 플랫폼을 입력해주세요")
                        .setRequired(true)
                        .addChoices(
                            {name: 'Steam', value: 'steam'},
                            {name: 'Kakao', value: 'kakao'}
                        ))
                .addStringOption(option =>
                    option
                        .setName('메치id')
                        .setDescription("메치를 찾으려는 매치ID를 입력해주세요")
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option
                        .setName('닉네임')
                        .setDescription("메치를 찾으려는 닉네임을 입력해주세요")
                        .setRequired(false)
                )
    )



//배그 전적 정보 가져오기
async function getPlayerData(nickName,playerID, mode, season, platform, moreStats = false) {
    let embedData;
    await fetch(`https://api.pubg.com/shards/steam/players/${playerID}/seasons/lifetime?filter[gamepad]=false`, {
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + process.env.PUBG_KEY,
            "Accept": "application/vnd.api+json"
        }
    })
        .then(json => json.json())
        .then(async json => {
            const stats = json.data.attributes.gameModeStats;
            const aggregateStats = (modes) => modes.reduce((acc, mode) => {
                const modeStats = stats[mode];
                for (const key in modeStats) {
                    acc[key] = (acc[key] || 0) + modeStats[key];
                }
                return acc;
            }, {});

            const modes = mode ? [mode] : Object.keys(stats);
            const aggregated = aggregateStats(modes);
            embedData = {
                mode: mode || "lifetime",
                kills: aggregated.kills,
                deaths: aggregated.deaths,
                assists: aggregated.assists,
                wins: aggregated.wins,
                top10s: aggregated.top10s,
                roundsPlayed: aggregated.roundsPlayed,
                headshotKills: aggregated.headshotKills,
                damageDealt: aggregated.damageDealt,
                DBNOs: aggregated.dBNOs,
                teamKills: aggregated.teamKills,
                timeSurvived: aggregated.timeSurvived,
                roadKills: aggregated.roadKills,
                boosts: aggregated.boosts,
                heals: aggregated.heals,
                weaponsAcquired: aggregated.weaponsAcquired,
                revives: aggregated.revives,
                vehicleDestroys: aggregated.vehicleDestroys
            };
        })
    //     const embed = await ep.embedBase(
    //         `${nickName}님의 전적 정보`,
    //         `플렛폼: ${platform}\n모드: ${embedData.mode === 'lifetime' ? '전체' : embedData.mode}`,
    //         cm.success,
    //         [
    //             { name: "🔫 킬 / 다운 / 어시스트", value: `${embedData.kills}킬 / ${embedData.DBNOs}다운 / ${embedData.assists}어시`, inline: false },
    //             { name: "🍗 / top10 / 라운드", value: `${embedData.wins} / ${embedData.top10s} / ${embedData.roundsPlayed}`, inline: false },
    //             { name: "❌ 헤드샷 킬 / 비율", value: `${embedData.headshotKills} / ${(embedData.headshotKills / embedData.kills).toFixed(2)}%`, inline: false },
    //             { name: "🚙 고라니", value: embedData.roadKills.toString(), inline: true },
    //             { name: "😜 팀킬", value: embedData.teamKills.toString(), inline: true },
    //             { name: "🏥 팀원 소생", value: embedData.revives.toString(), inline: true }
    //         ]
    //     );
    //
    //     if (moreStats) {
    //         embed.addFields(
    //             {
    //                 name: "⏱생존 시간 / 라운드 평균",
    //                 value: `${(embedData.timeSurvived / 60).toFixed(2).toString()}분 / ${(embedData.timeSurvived / embedData.roundsPlayed / 60).toFixed(2)}분`
    //             },
    //             {name: "🚑 부스트 / 힐 아이템", value: `${embedData.boosts} / ${embedData.heals}`, inline: true},
    //             {name: "🔫 무기 획득", value: embedData.weaponsAcquired.toString(), inline: true},
    //             {name: "🚙 차량 파괴", value: embedData.vehicleDestroys.toString(), inline: true},
    //             {name: "😎 승률", value: ((embedData.wins / embedData.roundsPlayed) * 100).toFixed(2).toString() + "%"},
    //             {name: "평균 킬", value: (embedData.kills / embedData.roundsPlayed).toFixed(2).toString(), inline: true},
    //             {name: "평균 데미지", value: (embedData.damageDealt / embedData.roundsPlayed).toFixed(2).toString(), inline: true},
    //             {name: "평균 어시스트", value: (embedData.assists / embedData.roundsPlayed).toFixed(2).toString(), inline: true}
    //         );
    //     }
    // embed.setFooter({ text: '데이터 제공: PUBG API' }).setTimestamp().setFooter({text:'데이터 제공: PUBG API'}).setTimestamp();
    // 구분선 컴포넌트 생성
    const separator = new SeparatorBuilder().setSpacing(2);
    const defaultSeparator = new SeparatorBuilder();

    // 텍스트 컴포넌트 생성
    const textComponents = [
        new TextDisplayBuilder().setContent(`## ${nickName}님의 전적 정보\n플렛폼: ${platform}\n모드: ${embedData.mode === 'lifetime' ? '전체' : embedData.mode}`),
        new TextDisplayBuilder().setContent(`### 🔫 Kill / Down / Assist\n${embedData.kills}킬 / ${embedData.DBNOs}다운 / ${embedData.assists}어시`),
        new TextDisplayBuilder().setContent(`### 🍗 승리 / 탑10 / 라운드\n ${embedData.wins}승 / ${embedData.top10s}회 / ${embedData.roundsPlayed}라운드`),
        new TextDisplayBuilder().setContent(`### ❌ 헤드샷 킬\n${embedData.headshotKills}킬 / ${(embedData.headshotKills / embedData.kills * 100).toFixed(2)}%`),
    ];

    // 컨테이너에 컴포넌트 추가
    const container = new ContainerBuilder()
        .addTextDisplayComponents(textComponents[0])
        .addSeparatorComponents(separator)
        .addTextDisplayComponents(textComponents[1])
        .addSeparatorComponents(defaultSeparator)
        .addTextDisplayComponents(textComponents[2])
        .addSeparatorComponents(defaultSeparator)
        .addTextDisplayComponents(textComponents[3])
        .addSeparatorComponents(defaultSeparator)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`⌚ 생존 시간 / 라운드 평균\n${(embedData.timeSurvived / 60).toFixed(2)}min / ${(embedData.timeSurvived / embedData.roundsPlayed / 60).toFixed(2)}min`))
        .setAccentColor(0xffff00)
    if (moreStats) {
        container
            .addSeparatorComponents(defaultSeparator)
            .addSeparatorComponents(defaultSeparator)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`고라니: ${embedData.roadKills} \n팀킬: ${embedData.teamKills}\n팀원 소생: ${embedData.revives}`))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`부스트 아이템 사용: ${embedData.boosts} \n힐 아이템 사용:${embedData.heals}`))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`무기 획득: ${embedData.weaponsAcquired}`))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`차량 파괴: ${embedData.vehicleDestroys}`))
            .addSeparatorComponents(defaultSeparator)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`승률: ${((embedData.wins / embedData.roundsPlayed) * 100).toFixed(2)}%`))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`탑10 비율: ${((embedData.top10s / embedData.roundsPlayed) * 100).toFixed(2)}%`))
            .addSeparatorComponents(defaultSeparator)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`평균 킬: ${(embedData.kills / embedData.roundsPlayed).toFixed(2)}`))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`평균 데미지: ${(embedData.damageDealt / embedData.roundsPlayed).toFixed(2)}`))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`평균 어시스트: ${(embedData.assists / embedData.roundsPlayed).toFixed(2)}`));
    }

    return container
}


module.exports = {
    data: data,
    async execute(interaction) {
        try {
            await interaction.deferReply()
            if (interaction.options.getSubcommand() === '비밀의방') {
                const map = interaction.options.getString('맵');
                let mapName;
                let mapImage;
                if (map === 'erangel') {
                    mapName = '에란겔';
                    mapImage = 'erangel';
                } else if (map === 'taego') {
                    mapName = '태이고';
                    mapImage = 'taego';
                } else if (map === 'vikendi') {
                    mapName = '비켄디';
                    mapImage = 'vikendi';
                } else if (map === 'paramo') {
                    mapName = '파라모';
                    mapImage = 'paramo';
                } else {
                    interaction.reply('뭐하세요');
                    return;
                }
                const mapEmbed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('비밀의방 정보')
                    .setDescription(`${mapName}의 비밀의방 정보를 제공합니다`)
                    .setImage(`https://overjjang.xyz/api/asset/PUBG/${mapImage}`);

                interaction.editReply({embeds: [mapEmbed]});
            }

            //전적
            if (interaction.options.getSubcommand() === '전적') {

                const nickname = interaction.options.getString('닉네임');
                const platform = interaction.options.getString('플렛폼');
                const mode = interaction.options.getString('모드');
                await fetch(`https://api.pubg.com/shards/${platform}/players?filter[playerNames]=${nickname}`, {
                    method: 'GET',
                    headers: {
                        "Authorization": "Bearer " + process.env.PUBG_KEY,
                        "Accept": "application/vnd.api+json"
                    }
                })
                    .then(json => json.json())
                    .then(async json => {
                        console.log(json);
                        // if (json.data.length === 0) {
                        //     const embed = new EmbedBuilder()
                        //         .setColor('#0099ff')
                        //         .setTitle('전적 정보')
                        //         .setDescription(`${nickname}인 유저를 찾을 수 없습니다`)
                        //     return interaction.reply({embeds: [embed]});
                        // } else if (json.data.length > 1) {
                        //     const selectEmbed = new EmbedBuilder()
                        //         .setColor('#0099ff')
                        //         .setTitle('플레이어 선택')
                        //         .setDescription(`닉네임이 ${nickname}인 플레이어가 ${json.data.length}명입니다. 선택해주세요`);
                        //
                        //     const selectMenu = new StringSelectMenuBuilder()
                        //         .setCustomId('selectMenu')
                        //         .setPlaceholder('플레이어 선택')
                        //         .addOptions(json.data.map(player => new StringSelectMenuOptionBuilder()
                        //             .setLabel(player.attributes.name)
                        //             .setValue(player.id)
                        //             .setDescription(player.attributes.name)
                        //             .setEmoji('👤')
                        //         ))
                        //     const actionRow = new ActionRowBuilder()
                        //         .addComponents(selectMenu);
                        //     const response = await interaction.reply({embeds: [selectEmbed], components: [actionRow]});
                        //
                        //     const collector = response.createMessageComponentCollector({
                        //         componentType: ComponentType.StringSelect,
                        //         time: 3_600_000
                        //     });
                        //
                        //     collector.on('collect', async i => {
                        //         const playerId = i.values[0];
                        //         const mode = interaction.options.getString('모드');
                        //         await interaction.editReply({embeds: [await getPlayerData(playerId, mode, 'lifetime')]});
                        //     })
                        // }
                        if (!json.data) {
                            await interaction.editReply(
                                {
                                    embeds: [new EmbedBuilder()
                                        .setColor('#ff0000')
                                        .setTitle('플레이어를 찾을 수 없습니다')
                                    ]
                                }
                            );
                        } else if (json.data.length === 1) {
                            const playerId = json.data[0].id;
                            const container = await getPlayerData(nickname, playerId, mode, 'lifetime', platform);
                            const moreStateButton = new ButtonBuilder()
                                .setEmoji("📊")
                                .setLabel("더보기 ▽")
                                .setStyle(ButtonStyle.Secondary)
                                .setCustomId("moreStats");
                            const moreStateActionRow = new ActionRowBuilder()
                                .addComponents(moreStateButton)
                            container
                                .addActionRowComponents(moreStateActionRow)
                                .addTextDisplayComponents(new TextDisplayBuilder().setContent("-# 데이터 제공: PUBG API"))
                            const response = await interaction.editReply({
                                flags: MessageFlags.IsComponentsV2,
                                components: [container]
                            });

                            const collector = response.createMessageComponentCollector({
                                componentType: ComponentType.Button,
                                time: 3_600_000
                            });
                            collector.on('collect', async i => {
                                if (i.customId === 'moreStats') {
                                    const moreContainer = await getPlayerData(nickname, playerId, mode, 'lifetime', platform, true);
                                    const lessStateButton = new ButtonBuilder()
                                        .setEmoji("📉")
                                        .setLabel("접기 △")
                                        .setStyle(ButtonStyle.Secondary)
                                        .setCustomId("lessStats");
                                    const lessStateActionRow = new ActionRowBuilder()
                                        .addComponents(lessStateButton);
                                    moreContainer
                                        .addActionRowComponents(lessStateActionRow)
                                        .addTextDisplayComponents(new TextDisplayBuilder().setContent("-# 데이터 제공: PUBG API"))
                                    await interaction.editReply({
                                        flags: MessageFlags.IsComponentsV2,
                                        components: [moreContainer]
                                    })
                                } else if (i.customId === 'lessStats') {
                                    const lessContainer = await getPlayerData(nickname, playerId, mode, 'lifetime', platform);
                                    const moreStateButton = new ButtonBuilder()
                                        .setEmoji("📊")
                                        .setLabel("더보기 ▽")
                                        .setStyle(ButtonStyle.Secondary)
                                        .setCustomId("moreStats");
                                    const moreStateActionRow = new ActionRowBuilder()
                                        .addComponents(moreStateButton);
                                    lessContainer
                                        .addActionRowComponents(moreStateActionRow)
                                        .addTextDisplayComponents(new TextDisplayBuilder().setContent("-# 데이터 제공: PUBG API"))
                                    await interaction.editReply({
                                        flags: MessageFlags.IsComponentsV2,
                                        components: [lessContainer]
                                    })
                                }
                            })
                        }

                    })
            }

            if (interaction.options.getSubcommand() === '메치') {
                const platform = interaction.options.getString('플렛폼');
                const matchID = interaction.options.getString('메치id');
                const nickname = interaction.options.getString('닉네임');

                if (interaction.options.getString('메치id') === null && interaction.options.getString('닉네임') === null) {
                    await interaction.reply({content: '메치ID 혹은 닉네임을 입력해주세요', ephemeral: true});
                } else if (matchID !== null && nickname !== null) {
                    await interaction.editReply({
                        content: '닉네임과 메치ID는 오류 방지를 위해 동시에 입력할 수 없습니다. 추후 기능 수정 예정입니다.',
                        ephemeral: true
                    });
                } else if (matchID !== null) {
                    if (matchID.length === 36 && /^[A-Za-z0-9-]+$/.test(matchID)) {
                        await fetch(`https://api.pubg.com/shards/${platform}/matches/${matchID}`, {
                            method: 'GET',
                            headers: {
                                "Authorization": "Bearer " + process.env.PUBG_KEY,
                                "Accept": "application/vnd.api+json"
                            }
                        })
                            .then(json => json.json())
                            .then(async json => {
                                console.log(json);
                            })
                    } else {
                        await interaction.editReply({content: '메치ID 형식이 옳지 않습니다.', ephemeral: true});
                    }
                } else if (nickname !== null) {
                    await fetch(``, {})
                }
            }
        } catch (err) {
            console.error(err);
            await interaction.editReply({embeds: [ep.errorEmbed(err)]});
        }
    }
}