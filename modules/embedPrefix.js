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
    /**
     * 기본적인 임베드 메시지를 생성합니다.
     * @async
     * @function embedBase
     * @param {string} title - 임베드의 제목
     * @param {string} description - 임베드의 설명
     * @param {string} [color=cm.success] - 임베드의 색상 (기본값: 성공 색상)
     * @param {...Array<Object|FieldsBuilder>} fields - 임베드에 추가할 필드들
     * @returns {Promise<EmbedBuilder>} 생성된 임베드 객체
     */
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
    /**
     * 에러 메시지를 포함한 임베드를 생성합니다.
     * @function errorEmbed
     * @param {string} description - 에러 메시지
     * @returns {EmbedBuilder} 에러 메시지 임베드 객체
     */
    errorEmbed: (description) =>
        new EmbedBuilder()
            .setColor(cm.danger)
            .setTitle(":warning:ERROR")
            .setDescription(description),

    /**
     * 경고 메시지를 포함한 임베드를 생성합니다.
     * @function warningEmbed
     * @param {string} description - 경고 메시지
     * @returns {EmbedBuilder} 경고 메시지 임베드 객체
    */
     warningEmbed: (description) =>
            new EmbedBuilder()
                .setColor(cm.warning)
                .setTitle(":warning:WARNING")
                .setDescription(description),
};

module.exports = prefixEmbed;