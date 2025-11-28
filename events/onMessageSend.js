const { Events } = require('discord.js');
const games = require("../modules/playGame");

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // 봇 메시지 무시
        if (message.author.bot) return;

        // DM
        if (message.channel.type === 'DM') {
            console.log(`DM from ${message.author.tag}: ${message.content}`);
            return;
        }
        console.log(`Message from ${message.author.tag} in ${message.channel.name}: ${message.content}`);
        await games.playGame(message);
    },
}