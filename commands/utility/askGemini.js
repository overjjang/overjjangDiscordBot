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
        await interaction.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
                new ContainerBuilder()
                    .addSeparatorComponents(new SeparatorBuilder())
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`${message}`)
                    )
                    .addSeparatorComponents(new SeparatorBuilder())
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent('<a:gemini_loading:1391617229933514792>응답을 생성하는중...')
                    )
            ]
        })
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `${message}`,
                config: {
                    systemInstruction: "You are an AI assistant. timezone is KST. Use tool if you need. Please answer the following question in korean",
                    tools: [groundingTool],
                    groundingMetadata:null,
                }
            });
            console.log(response);
            const answer = response.text

            console.log(`Gemini 답변: ${answer}`);

            const container = new ContainerBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`<:gemini_loading:1391617229933514792> ${message}`))
                .addSeparatorComponents(new SeparatorBuilder())
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