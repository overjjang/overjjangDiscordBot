const { GoogleGenAI, Type } = require('@google/genai');
const dotenv = require('dotenv');
const {ApplicationCommandType ,MessageFlags, SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType, AttachmentBuilder,ButtonBuilder,ButtonStyle, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, ContextMenuCommandBuilder } = require('discord.js');


dotenv.config();
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

// module.exports = {
//     data : new SlashCommandBuilder()
// }