const { GoogleGenAI, Type } = require('@google/genai');
const dotenv = require('dotenv');
const {ApplicationCommandType ,MessageFlags, SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType, AttachmentBuilder,ButtonBuilder,ButtonStyle, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, ContextMenuCommandBuilder } = require('discord.js');


dotenv.config();
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});



module.exports = {
    data: new SlashCommandBuilder()
        .setName('제미니')
        .setDescription('젬민이에게 질문합니다')
        .addStringOption(option =>
            option.setName('질문')
                .setDescription('젬민이에게 할 질문을 입력하세요.')
                .setRequired(true)
        ),

    async execute(interaction) {
        const groundingTool = {
            googleSearch: {},
        };
        const message = interaction.options.getString('질문');
        await interaction.deferReply({});
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `You are an AI assistant. Use tool if you need. Please answer the following question in korean:\n${message}`,
                config: {
                    tools: [groundingTool],
                }
            });
            console.log(response);
            const answer = response.text

            console.log(`Gemini 답변: ${answer}`);

            const container = new ContainerBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`${answer}`));

            await interaction.editReply({
                flags: MessageFlags.IsComponentsV2,
                components: [container],
            });
        } catch (error) {
            console.error(error);
            interaction.editReply({content: '질문 처리 중 오류가 발생했습니다.', ephemeral: true});
        }
    }
}