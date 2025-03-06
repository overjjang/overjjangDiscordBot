const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType } = require('discord.js');

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

module.exports = {
    data: data,
    async execute(interaction) {
        const map = interaction.options.getString('맵');
        let mapName;
        let mapImage;
        let from;
        if (map === 'erangel') {
            mapName = '에란겔';
            mapImage = 'https://t1.kakaocdn.net/gamepub/gaia/image/pubg/337fe838439e83f3a71f6daf06d88147a3a9e608';
            from = 'https://bbs.pubg.game.daum.net/gaia/do/pubg/free/read?articleId=185634&bbsId=PC002&pageIndex=1'
        } else if(map === 'taego') {
            mapName = '태이고';
            mapImage = 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FoSqZd%2FbtrBFcRPQBI%2F1PpdvqO0qaPxpg8uUfzVx0%2Fimg.png';
            from = 'https://sosohan132.tistory.com/entry/%EB%B0%B0%ED%8B%80%EA%B7%B8%EB%9D%BC%EC%9A%B4%EB%93%9C-%ED%83%9C%EC%9D%B4%EA%B3%A0-%EB%B9%84%EB%B0%80%EC%9D%98%EB%B0%A9-%EC%A7%80%EB%8F%84-%ED%91%9C%EC%8B%9C'
        } else if (map === 'vikendi') {
            mapName = '비켄디';
            mapImage = 'https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fc4o9ij%2FbtsJPopP0YL%2FIVAzHRnp04YRiqkgmkxJ11%2Fimg.png';
            from = 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fbzooryu.tistory.com%2F315&psig=AOvVaw3axvye3vmjYe0Tsp6oN10J&ust=1735645737987000&source=images&cd=vfe&opi=89978449&ved=0CBcQjhxqFwoTCKCV_K62z4oDFQAAAAAdAAAAABAd'
        } else if (map === 'paramo') {
            mapName = '파라모';
            mapImage = 'https://static.inven.co.kr/column/2020/11/03/news/i15039674520.jpg';
            from = 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.inven.co.kr%2Fwebzine%2Fnews%2F%3Fnews%3D246624%26site%3Dbattlegrounds&psig=AOvVaw1CAuXyMYQOcSxlgWsxuXSy&ust=1735645797930000&source=images&cd=vfe&opi=89978449&ved=0CBcQjhxqFwoTCICh6su2z4oDFQAAAAAdAAAAABAE'
        }
        const mapEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('비밀의방 정보')
            .setDescription(`${mapName}의 비밀의방 정보를 제공합니다`)
            .setImage(mapImage)
            .setURL(from)

        interaction.reply({ embeds: [mapEmbed] });
    }
}