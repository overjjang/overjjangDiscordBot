const {VoiceChannel, SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const data = new SlashCommandBuilder()
    .setName('admin')
    .setDescription('관리자 명령어')

    .addSubcommand(subcommand =>
        subcommand
            .setName('reload')
            .setDescription('명령어를 리로드합니다')
            .addStringOption(option =>
                option.setName('파일')
                    .setDescription('리로드할 파일을 입력해주세요')
                    .setRequired(true)
            )
    )

    .addSubcommand(subcommand =>
        subcommand
            .setName('load')
            .setDescription('명령어를 로드합니다')
            .addStringOption(option =>
                option.setName('파일')
                    .setDescription('로드할 파일을 입력해주세요')
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('unload')
            .setDescription('명령어를 언로드합니다')
            .addStringOption(option =>
                option.setName('파일')
                    .setDescription('언로드할 파일을 입력해주세요')
                    .setRequired(true)
            )
    )

module.exports = {
    data: data,
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const file = interaction.options.getString('파일');
        const commandPath = `./commands/${file}/`;
        if (!process.env.DEV_ID.split(',').includes(interaction.user.id)) {
            return interaction.reply("버짱 전용임 ㅅㄱ");
        }
        if (!fs.existsSync(commandPath)) {
            return interaction.reply("파일이 존재하지 않습니다");
        }
        const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));

        if (subcommand === 'reload') {
            try {
                delete require.cache[require.resolve(`../${file}/${commandFiles[0]}`)];
                const newCommand = require(`../${file}/${commandFiles[0]}`);
                interaction.client.commands.set(newCommand.data.name, newCommand);
                await interaction.reply(`리로드 완료!`);
            } catch (error) {
                console.error(error);
                await interaction.reply(`오류 발생: \`${error.message}\``);
            }
        }
        if (subcommand === 'load') {
            try {
                const newCommand = require(`../${file}/${commandFiles[0]}`);
                interaction.client.commands.set(newCommand.data.name, newCommand);
                await interaction.reply(`로드 완료!`);
            } catch (error) {
                console.error(error);
                await interaction.reply(`오류 발생: \`${error.message}\``);
            }
        }
        if (subcommand === 'unload') {
            try {
                delete require.cache[require.resolve(`../${file}/${commandFiles[0]}`)];
                interaction.client.commands.delete(file);
                await interaction.reply(`언로드 완료!`);
            } catch (error) {
                console.error(error);
                await interaction.reply(`오류 발생: \`${error.message}\``);
            }
        }
    }
}