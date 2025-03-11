const { SlashCommandBuilder, EmbedBuilder,StringSelectMenuBuilder,StringSelectMenuOptionBuilder,ActionRowBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const data = new SlashCommandBuilder()
    .setName('도움말')
    .setNameLocalizations({
        ko: '도움말',
        'en-US': 'help'
    })
    .setDescription('명령어 목록을 확인합니다')
    .setDescriptionLocalizations({
        ko: '명령어 목록을 확인합니다',
        'en-US': 'Check the command list'
    });

const jsonPath = path.join(__dirname, '../../commandInfo.json');

function readJsonFile() {
    if (fs.existsSync(jsonPath)) {
        const data = fs.readFileSync(jsonPath, 'utf8');
        return JSON.parse(data);
    } else {
        return [];
    }
}

module.exports = {
    category: 'utility',
    data : data,
    async execute(interaction) {
        const commandList = readJsonFile();
        console.log(commandList);
        const helpEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('명령어 목록')
            .setDescription('아레에서 명령어를 선택해주세요')
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('helpSelect')
            .setPlaceholder('명령어를 선택해주세요')
            .addOptions(
                commandList.commands.map(item => new StringSelectMenuOptionBuilder()
                    .setLabel(item.name)
                    .setValue(item.name)
                    .setDescription(item.description)
                )
            )
        const respons = interaction.reply({ embeds: [helpEmbed], components: [new ActionRowBuilder().addComponents(selectMenu)] });
    }
}