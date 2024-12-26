const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data : new SlashCommandBuilder()
        .setName('레코드확인')
        .setDescription('Check the status of the recording'),
    async execute(interaction) {
        await fetch("https://overjjang.xyz/api/getWorkStatus")
            .then(res => res.json())
            .then(json => {
                if (json.cronTasks.isOn) {
                    interaction.reply(`스케쥴 작업 진행중: 매 ${json.cronTasks.time} 분`);
                } else if (!json.recordingStatus.isOn) {
                    interaction.reply("스케쥴 설정 없음");
                } else {
                    interaction.reply("스케쥴 설정 확인중 오류 발생");
                }
            })
            .catch(err => {
                console.error(err);
                interaction.reply("서버와의 통신 중 오류 발생");
            });
    }
}