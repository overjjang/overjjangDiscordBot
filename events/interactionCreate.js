const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // 명령어 타입인 경우 처리
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`명령어 ${interaction.commandName}를 찾을 수 없습니다.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`명령어 실행 중 오류 발생: ${error}`);
                await interaction.reply({ content: '명령어 실행 중 오류가 발생했습니다.', ephemeral: true });
            }
        }

        // 자동완성 요청인 경우 처리
        else if (interaction.isAutocomplete()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command || !command.autocomplete) {
                console.error(`자동완성을 위한 명령어 ${interaction.commandName}를 찾을 수 없습니다.`);
                return;
            }

            try {
                await command.autocomplete(interaction);
            } catch (error) {
                console.error(`자동완성 처리 중 오류 발생: ${error}`);
            }
        }
    },
};