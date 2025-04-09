const {EmbedBuilder} = require('discord.js');
const cm = require('./color-model');

const prefixEmbed = {
    embedBase: (title,description,color=cm.success) =>
        new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(description),
    errorEmbed: (description) =>
        new EmbedBuilder()
            .setColor(cm.danger)
            .setTitle("⚠ERROR")
            .setDescription(description),
};

module.exports = prefixEmbed;