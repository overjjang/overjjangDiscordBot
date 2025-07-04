const { GoogleGenAI, Type } = require('@google/genai');
const dotenv = require('dotenv');
const {ApplicationCommandType ,MessageFlags, SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType, AttachmentBuilder,ButtonBuilder,ButtonStyle, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, ContextMenuCommandBuilder } = require('discord.js');


dotenv.config();
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('번역: 일본어')
        .setType(ApplicationCommandType.Message),

    async execute(interaction, targetMessage) {
        const message = targetMessage || interaction.targetMessage;
        await interaction.deferReply({})
        if (!message ) {
            console.log('메시지 내용이 없습니다.');
        }
        const question = message.content;
        try {
            console.log(`원문: ${question}`);
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash-lite',
                contents: `Translate the following text to Japanese:\n${question}\n\n please send just the translation only with original text's language. if the text is already in Japanese, just return the original text. if the text has marked down, please return the translation with markdown.`,
                config:{
                    responseMimeType:'application/json',
                    responseSchema:{
                        type: Type.OBJECT,
                        properties: {
                            text: {
                                type: Type.STRING,
                            },
                            sourceLanguage: {
                                type: Type.STRING,
                            }
                        },
                    }
                }
            });
            const answer = JSON.parse(response.text);
            console.log(response);

            console.log(`번역 결과: ${answer.text}`);

            const container = new ContainerBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`${answer.text}`))
            await interaction.editReply({
                flags: MessageFlags.IsComponentsV2,
                components: [container],
            });
        } catch (error) {
            console.error(error);
            interaction.editReply({content: '번역 중 오류가 발생했습니다.', ephemeral: true});
        }
    }
}