const { SlashCommandBuilder, EmbedBuilder, MessageFlags, TextDisplayBuilder, SeparatorBuilder, ContainerBuilder, UserSelectMenuBuilder, ActionRowBuilder, MediaGalleryBuilder, ComponentType, StringSelectMenuBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('처벌')
        .setDescription('처벌 관련 명령어')
        .addSubcommand(subcommand =>
        subcommand
                .setName('추가')
                .setDescription('처벌을 추가합니다.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('목록')
                .setDescription('처벌 목록을 확인합니다.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('삭제')
                .setDescription('처벌을 삭제합니다.')
                .addIntegerOption(option =>
                    option.setName('처벌번호')
                        .setDescription('삭제할 처벌의 번호를 입력하세요.')
                        .setRequired(true)
                )
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case '추가':
                if (!interaction.member.permissions.has('ManageMessages')) {
                    return interaction.reply({ content: '되겠노', ephemeral: true });
                }
                const userSelect = new UserSelectMenuBuilder()
                    .setCustomId('punishmentUserSelect')
                    .setPlaceholder('처벌할 유저를 선택하세요.');
                const actionRow = new ActionRowBuilder()
                    .addComponents(userSelect);
                const container = new ContainerBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent('처벌할 유저를 선택해주세요.'))
                    .addSeparatorComponents(new SeparatorBuilder())
                    .addActionRowComponents(actionRow)
                    .setAccentColor(0x00ffff);
                const response = await interaction.reply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                    // ephemeral: true,
                });
                const collector = response.createMessageComponentCollector({
                    componentType: ComponentType.userSelect,
                    time: 60000, // 1분
                });
                collector.on('collect', async (collectedInteraction) => {
                    await collectedInteraction.deferUpdate();
                    const user = collectedInteraction.values[0];
                    const option = new StringSelectMenuBuilder()
                        .setCustomId("punishmentSelect")
                        .setPlaceholder("처벌 종류를 선택하세요.")
                        .addOptions([
                            {
                                label: '경고',
                                value: 'warning',
                                description: '유저에게 경고를 부여합니다.',
                            },
                            {
                                label: '타임아웃',
                                value: 'timeout',
                                description: '유저에게 타임아웃을 부여합니다.',
                            },
                            {
                                label: '로동교화형',
                                value: 'labor',
                                description: '너아오지',
                            }
                        ]);
                    const actionRow = new ActionRowBuilder()
                        .addComponents(option);
                    const container = new ContainerBuilder()
                        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**${collectedInteraction.guild.members.cache.get(user)?.user.username}**님의 처벌 종류를 선택해주세요.`))
                        .addSeparatorComponents(new SeparatorBuilder())
                        .addActionRowComponents(actionRow)
                        .setAccentColor(0x00ffff);
                    await interaction.editReply({
                        flags: MessageFlags.IsComponentsV2,
                        components: [container]
                    });
                });
        }
    }
}