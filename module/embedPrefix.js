const {EmbedBuilder} = require('discord.js');
const cm = require('./color-model');

const prefixEmbed = {
    // 임베드 베이스 생성(title, description, color, ...fields)
    embedBase: (title,description,color=cm.success, ...fields) => {
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(description)
        if (fields) {
            embed.setFields(fields);
        }
        return embed;
    },
    // 에러 임베드 생성(description)
    errorEmbed: (description) =>
        new EmbedBuilder()
            .setColor(cm.danger)
            .setTitle(":warning:ERROR")
            .setDescription(description),
    // 경고 임베드 생성(description)
    warningEmbed: (description) =>
        new EmbedBuilder()
            .setColor(cm.warning)
            .setTitle(":warning:WARNING")
            .setDescription(description),
};

module.exports = prefixEmbed;