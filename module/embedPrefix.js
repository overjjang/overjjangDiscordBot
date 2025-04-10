const {EmbedBuilder} = require('discord.js');
const cm = require('./color-model');

function FieldsBuilder(name, value, inline = false) {
    {
        this.name = name;
        this.value = value;
        this.inline = inline;
    }
}

const prefixEmbed = {
    // 임베드 베이스 생성(title, description, color, ...fields)
    embedBase: async (title, description, color = cm.success, ...fields) => {
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(description)
        if (fields) {
            fields = fields[0];
            for (let i = 0; i < fields.length; i++) {
                if (fields[i] instanceof FieldsBuilder) {
                    embed.addFields(fields[i]);
                } else if (typeof fields[i] === 'object') {
                    embed.addFields(fields[i]);
                } else {
                    console.log("Invalid field type");
                }
            }
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