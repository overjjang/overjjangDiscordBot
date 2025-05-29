const { SlashCommandBuilder, EmbedBuilder, MessageFlags, TextDisplayBuilder, SeparatorBuilder, ContainerBuilder } = require('discord.js');

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('핑')
        .setNameLocalizations({
                ko: '핑',
                'en-US': 'ping'
            })
        .setDescription('핑 날려서 퐁 받기')
        .setDescriptionLocalizations({
                ko: '핑 날려서 퐁 받기',
                'en-US': 'Send a ping and receive a pong'
            }),
    async execute(interaction) {
        // await interaction.reply({embeds:[
        //     new EmbedBuilder()
        //         .setColor('#0099ff')
        //         .setTitle('퐁')
        //         .setDescription(`${interaction.client.ws.ping}ms`)
        //     ]})
        //await interaction.reply(`퐁! (${interaction.client.ws.ping}ms)`);
        const textDisplay = new TextDisplayBuilder()
            .setContent('## 퐁!')
        const separator = new SeparatorBuilder()
        const ping = new TextDisplayBuilder().setContent(`${interaction.client.ws.ping}ms`)
        const container = new ContainerBuilder()
            .addTextDisplayComponents(textDisplay)
            .addSeparatorComponents(separator)
            .addTextDisplayComponents(ping);
        await interaction.reply({
            flags: MessageFlags.IsComponentsV2,
            components:[container]
        })
    },
};