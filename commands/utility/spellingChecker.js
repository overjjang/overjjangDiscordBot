const { GoogleGenAI, Type } = require('@google/genai');
const dotenv = require('dotenv');
const {ApplicationCommandType ,MessageFlags, SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType, AttachmentBuilder,ButtonBuilder,ButtonStyle, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, ContextMenuCommandBuilder } = require('discord.js');


dotenv.config();
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('맞춤법 검사')
        .setType(ApplicationCommandType.Message),

    async execute(interaction, targetMessage) {
        const message = targetMessage || interaction.targetMessage;
        await interaction.deferReply({});
        if (!message) {
            console.log('메시지 내용이 없습니다.');
            return interaction.editReply({content: '메시지 내용이 없습니다.', ephemeral: true});
        }

        const question = message.content;
        try {
            console.log(`검사할 메시지: ${question}`);
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: `${question}`,
                config: {
                    systemInstruction: "You are a korean spelling and grammar checker. " +
                        "if text is transcription text, correct it to follow korean Foreign language notation. if text is correct, just return original text. " +
                        "Please check the following text for spelling and grammar errors and provide corrections and description about errors in korean in a clear format",
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            correctedText: {
                                type: Type.STRING,
                            },
                            errors: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                            }
                        },
                    }
                }
            });

            const answer = JSON.parse(response.text);
            console.log(`검사 결과: ${answer.correctedText}`);

            const container = new ContainerBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`<a:gemini_loading:1391617229933514792> 수정된 텍스트:\n${answer.correctedText}`));
            if (answer.errors) {
                container.addSeparatorComponents(new SeparatorBuilder())
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`발견된 오류:\n${answer.errors.map(e => `* ${e}`).join('\n')}`));
            }
            container.addSeparatorComponents( new SeparatorBuilder())
                .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`-# ⓘ 인공지능의 답변은 부정확할 수 있습니다. 맹신하지 마십시오.`)
            )

            await interaction.editReply({
                flags: MessageFlags.IsComponentsV2,
                components: [container],
            });
        } catch (error) {
            console.error(error);
            interaction.editReply({content: '맞춤법 검사 중 오류가 발생했습니다.', ephemeral: true});
        }
    }
}