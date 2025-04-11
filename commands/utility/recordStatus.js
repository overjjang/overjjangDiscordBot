const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const dotenv = require('dotenv');
const ep = require('../../modules/embedPrefix.js');
const cm = require('../../modules/color-model.js');

dotenv.config();

module.exports = {
    category: 'utility',
    data : new SlashCommandBuilder()
        .setName('레코드확인')
        .setNameLocalizations({
            ko: '레코드확인',
            'en-US' : 'record_status'
        })
        .setDescription('레코드 상태를 확인합니다')
        .setDescriptionLocalizations({
            ko: '레코드 상태를 확인합니다',
            'en-US': 'Check the status of the recording'
        }),
    async execute(interaction) {
        await fetch(process.env.RECORD_STATUS)
            .then(res => res.json())
            .then(json => {
                    const stateEmbed= ep.embedBase(`데이터 수집 상태:${json.cronTasks.isOn ? `On 🟩 | ${json.cronTasks.time}분 마다` : 'Off 🟥'}`,"데이터 수집 상태를 확인합니다")
                        .setFields(
                            json.serverNames.map((item, index) => ({
                                name: item,
                                    value: `최근 기록 시간: ${json.latestRecord[index].time}\n유저 수: ${json.latestRecord[index].userCount}\n서버 상태: ${json.latestRecord[index].isServerOn ? 'On 🟩' : 'Off 🟥'}\n`
                            }))
                        )
                    interaction.reply({ embeds: [stateEmbed] });
            })
            .catch(err => {
                console.error(err);
                interaction.reply({embeds:[ep.errorEmbed(err)]});
            });
    }
}