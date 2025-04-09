const { Events, MessageFlags } = require('discord.js');
const ep = require("../module/embedPrefix")

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds:[ep.errorEmbed(error.message)]});
            } else {
                await interaction.reply({ embeds:[ep.errorEmbed(error.message)]});
            }
        }
    },
};