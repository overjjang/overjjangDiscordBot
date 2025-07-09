const { GoogleGenAI, Type } = require('@google/genai');
const dotenv = require('dotenv');
const {ApplicationCommandType ,MessageFlags, SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType, AttachmentBuilder,ButtonBuilder,ButtonStyle, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, ContextMenuCommandBuilder } = require('discord.js');


dotenv.config();
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});


// function byteIndexToCharIndex(str, targetByteIndex) {
//     const encoder = new TextEncoder();
//     const encoded = encoder.encode(str);
//
//     if (targetByteIndex < 0 || targetByteIndex > encoded.length) {
//         return -1;
//     }
//
//     let byteCount = 0;
//     for (let i = 0; i < str.length; i++) {
//         const charByteLength = encoder.encode(str[i]).length;
//         if (byteCount + charByteLength > targetByteIndex) {
//             return i;
//         }
//         byteCount += charByteLength;
//     }
//     return str.length;
// }
//
// function addCitations(response) {
//     const text = response?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
//     const supports = response?.candidates?.[0]?.groundingMetadata?.groundingSupports ?? [];
//     const chunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
//
//     let updatedText = text;
//     const sortedSupports = [...supports].sort(
//         (a, b) => (a.segment?.endIndex ?? 0) - (b.segment?.endIndex ?? 0)
//     );
//
//     let offset = 0;
//
//     for (const support of sortedSupports) {
//         const byteEnd = support.segment?.endIndex;
//         const indices = support.groundingChunkIndices;
//
//         if (typeof byteEnd !== "number" || !Array.isArray(indices) || indices.length === 0) {
//             continue;
//         }
//
//         const citationLinks = indices
//             .map(i => {
//                 const uri = chunks[i]?.web?.uri;
//                 return uri ? `[[${i + 1}]](${uri})` : null;
//             })
//             .filter(Boolean);
//
//         if (citationLinks.length > 0) {
//             const citationString = citationLinks.join(", ");
//
//             const charEnd = byteIndexToCharIndex(text, byteEnd);
//             const adjustedEnd = charEnd + offset;
//
//             if (adjustedEnd < 0 || adjustedEnd > updatedText.length) {
//                 console.warn("삽입 위치 이상:", adjustedEnd);
//                 continue;
//             }
//
//             updatedText = updatedText.slice(0, adjustedEnd) + citationString + updatedText.slice(adjustedEnd);
//             offset += citationString.length;
//         }
//     }
//
//     return updatedText;
// }
// 글자수 초과로 일단 사용 안함


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
        const date = new Date( new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10).replace(/-/g, '');
        await interaction.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`${message}`)
                    )
                    .addSeparatorComponents(new SeparatorBuilder())
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent('응답을 생성하는중...<a:gemini_loading:1391617229933514792>')
                    )
            ]
        })
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `${message}`,
                config: {
                    systemInstruction: `You are an AI assistant. Use tool if you need. it is ${date} Please answer the following question in korean`,
                    tools: [groundingTool],
                    thinkingConfig: {
                        maxThoughtTokens: 4096,
                    }
                }
            });
            console.log(response);

            let answer = response.text;

            console.log(`Gemini 답변: ${answer}`);

            const container = new ContainerBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`${message} <a:gemini_loading:1391617229933514792>`))
                .addSeparatorComponents(new SeparatorBuilder())
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`${answer}`))
                .addSeparatorComponents(new SeparatorBuilder());

            let ground = ""
            if (response.candidates[0].groundingMetadata?.groundingSupports?.length > 0) {
                ground = '출처: ' + response.candidates[0].groundingMetadata.groundingChunks.map(support => {
                        const uri = support.web?.uri;
                        return uri ? `[${support.web.title}](${uri})` : null;
                    }
                )
                if (ground.length>2000){
                    console.log("출처가 너무 깁니다. 일부만 표시합니다.");
                    ground = '출처: ' + response.candidates[0].groundingMetadata.groundingChunks.map(support => {
                            const uri = support.web?.uri;
                            return uri ? `[${support.web.title}](https://${support.web.title})` : null;
                        }
                    )
                    ground = ground + '\n-# ... (출처 URL이 너무 길어 일부만 표시합니다.)';
                }
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(ground)
                )
            }


            container.addSeparatorComponents(new SeparatorBuilder())
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('-# ⓘ 인공지능의 답변은 부정확할 수 있습니다. 맹신하지 마십시오.')
                )

            await interaction.editReply({
                flags: MessageFlags.IsComponentsV2,
                components: [container],
            });
        } catch (error) {
            const errorContainer = new ContainerBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`${message} <a:gemini_loading:1391617229933514792>`))
                .addSeparatorComponents(new SeparatorBuilder())
                .addTextDisplayComponents(new TextDisplayBuilder().setContent('오류가 발생했습니다. 다시 시도해 주세요.'))
                .addSeparatorComponents(new SeparatorBuilder())
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('-# ⓘ 인공지능의 답변은 부정확할 수 있습니다. 맹신하지 마십시오.')
                );
            await interaction.editReply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
            console.error(error);
        }
    }
}