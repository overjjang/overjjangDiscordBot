const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType, AttachmentBuilder } = require('discord.js');
const dotenv = require('dotenv');

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
                .setAutocomplete(true)
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
        );



//배그 전적 정보 가져오기
async function getPlayerData(nickName,playerID, mode, season) {
    let embedData;
    await fetch(`https://api.pubg.com/shards/steam/players/${playerID}/seasons/lifetime?filter[gamepad]=false`, {
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + process.env.PUBG_KEY,
            "Accept": "application/vnd.api+json"
        }
    })
        .then(json => json.json())
        .then(async json=> {
            let kills=0, deaths=0, assists=0, wins=0, top10s=0, roundsPlayed=0, headshotKills=0, damageDealt = 0, DBNOs = 0,teamKills = 0, timeSurvived = 0, roadKills = 0, longestKill = 0, vehicleDestroys = 0, revives = 0, boosts = 0, heals = 0, weaponsAcquired = 0
            if(mode === null) {
                for (const key in json.data.attributes.gameModeStats) {
                    kills += json.data.attributes.gameModeStats[key].kills;
                    deaths += json.data.attributes.gameModeStats[key].deaths;
                    assists += json.data.attributes.gameModeStats[key].assists;
                    wins += json.data.attributes.gameModeStats[key].wins;
                    top10s += json.data.attributes.gameModeStats[key].top10s;
                    roundsPlayed += json.data.attributes.gameModeStats[key].roundsPlayed;
                    headshotKills += json.data.attributes.gameModeStats[key].headshotKills;
                    damageDealt += json.data.attributes.gameModeStats[key].damageDealt;
                    DBNOs += json.data.attributes.gameModeStats[key].dBNOs;
                    teamKills += json.data.attributes.gameModeStats[key].teamKills;
                    timeSurvived += json.data.attributes.gameModeStats[key].timeSurvived;
                    roadKills += json.data.attributes.gameModeStats[key].roadKills;
                    boosts += json.data.attributes.gameModeStats[key].boosts;
                    heals += json.data.attributes.gameModeStats[key].heals;
                    weaponsAcquired += json.data.attributes.gameModeStats[key].weaponsAcquired;
                    revives += json.data.attributes.gameModeStats[key].revives;
                    vehicleDestroys += json.data.attributes.gameModeStats[key].vehicleDestroys;
                }
                embedData = {
                    mode: "lifetime",
                    kills: kills,
                    deaths: deaths,
                    assists: assists,
                    wins: wins,
                    top10s: top10s,
                    roundsPlayed: roundsPlayed,
                    headshotKills: headshotKills,
                    damageDealt: damageDealt,
                    DBNOs : DBNOs,
                    teamKills : teamKills,
                    timeSurvived : timeSurvived,
                    roadKills : roadKills,
                    boosts : boosts,
                    heals : heals,
                    weaponsAcquired : weaponsAcquired,
                    revives : revives,
                    vehicleDestroys : vehicleDestroys
                }
            } else {
                embedData = {
                    mode: mode,
                    kills: json.data.attributes.gameModeStats[mode].kills,
                    deaths: json.data.attributes.gameModeStats[mode].deaths,
                    assists: json.data.attributes.gameModeStats[mode].assists,
                    wins: json.data.attributes.gameModeStats[mode].wins,
                    top10s: json.data.attributes.gameModeStats[mode].top10s,
                    roundsPlayed: json.data.attributes.gameModeStats[mode].roundsPlayed,
                    headshotKills: json.data.attributes.gameModeStats[mode].headshotKills,
                    damageDealt: json.data.attributes.gameModeStats[mode].damageDealt,
                    DBNOs : json.data.attributes.gameModeStats[mode].dBNOs,
                    teamKills : json.data.attributes.gameModeStats[mode].teamKills,
                    timeSurvived : json.data.attributes.gameModeStats[mode].timeSurvived,
                    roadKills : json.data.attributes.gameModeStats[mode].roadKills,
                    boosts : json.data.attributes.gameModeStats[mode].boosts,
                    heals : json.data.attributes.gameModeStats[mode].heals,
                    weaponsAcquired : json.data.attributes.gameModeStats[mode].weaponsAcquired,
                    revives : json.data.attributes.gameModeStats[mode].revives,
                    vehicleDestroys : json.data.attributes.gameModeStats[mode].vehicleDestroys
                }
            }
        })
    return new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('전적 정보')
        .setDescription(`${nickName}님의 ${mode === null ? "전체" : mode } 전적 정보입니다`)
        .setFields(
            {name: "킬", value: embedData.kills.toString(), inline: true},
            {name: "다운", value: embedData.DBNOs.toString(), inline: true},
            {name: "다운당 킬", value: (embedData.kills / embedData.DBNOs).toFixed(2).toString(), inline: true},
            {name: "어시스트", value: embedData.assists.toString(), inline: true},
            {name: "승리", value: embedData.wins.toString(), inline: true},
            {name: "탑10", value: embedData.top10s.toString(), inline: true},
            {name: "라운드 플레이", value: embedData.roundsPlayed.toString(), inline: true},
            {name: "헤드샷 킬", value: embedData.headshotKills.toString(), inline: true},
            {name: "헤드샷 비울", value: (embedData.headshotKills / embedData.kills).toFixed(2).toString(), inline: true},
            {name: "데미지", value: embedData.damageDealt.toFixed(2).toString(), inline: true},
            {name:"고라니", value: embedData.roadKills.toString(), inline: true},
            {name: "팀킬", value: embedData.teamKills.toString(), inline: true},
            {name: "생존 시간", value: (embedData.timeSurvived / 60).toFixed(2).toString(), inline: true},
            {name: "평균 생존 시간", value: (embedData.timeSurvived / embedData.roundsPlayed / 60).toFixed(2).toString(), inline: true},
            {name: "부스트 아이템 사용", value: embedData.boosts.toString(), inline: true},
            {name: "힐 아이템 사용", value: embedData.heals.toString(), inline: true},
            {name: "무기 획득", value: embedData.weaponsAcquired.toString(), inline: true},
            {name: "팀원 소생", value: embedData.revives.toString(), inline: true},
            {name: "차량 파괴", value: embedData.vehicleDestroys.toString(), inline: true},
            {
                name: "승률",
                value: ((embedData.wins / embedData.roundsPlayed) * 100).toFixed(2).toString()+"%",
                inline: true
            },
            {name: "라운드 평균 킬", value: (embedData.kills / embedData.roundsPlayed).toFixed(2).toString(), inline: true},
            {name: "라운드 평균 데미지", value: (embedData.damageDealt / embedData.roundsPlayed).toFixed(2).toString(), inline: true},
            {name: "라운드 평균 어시스트", value: (embedData.assists / embedData.roundsPlayed).toFixed(2).toString(), inline: true},
            {name: "라운드 평균 헤드샷 킬", value: (embedData.headshotKills / embedData.roundsPlayed).toFixed(2).toString(), inline: true},
        );
}


module.exports = {
    data: data,
    async execute(interaction) {
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

            interaction.reply({embeds: [mapEmbed]});
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
                    if(!json.data) {
                        await interaction.reply(
                            {
                                embeds:[new EmbedBuilder()
                                    .setColor('#ff0000')
                                    .setTitle('플레이어를 찾을 수 없습니다')
                                ]
                            }
                        );
                    }
                    else if (json.data.length === 1) {
                        const playerId = json.data[0].id;
                        const embed = await getPlayerData(nickname,playerId, mode, 'lifetime')
                        await interaction.reply({embeds: [embed]});
                    }

                })
        }
    }
}