const {EmbedBuilder} = require('discord.js');
const cm = require('color-model');

const prefixEmbed = {
    errorEmbed: (title="⚠ERROR", description) =>
        new EmbedBuilder()
            .setColor(cm.danger)
            .setTitle(title)
            .setDescription(description)

};

module.exports = {prefixEmbed};