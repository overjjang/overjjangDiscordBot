const { SlashCommandBuilder, EmbedBuilder, MessageFlags, TextDisplayBuilder, SeparatorBuilder, ContainerBuilder, UserSelectMenuBuilder, ActionRowBuilder, MediaGalleryBuilder, ComponentType } = require('discord.js');
const { cm } = require('../../modules/color-model');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("프로필사진")
        .setDescription("프로필 사진을 가져옵니다.")
    ,
    async execute(interaction) {
        const selectText = new TextDisplayBuilder()
            .setContent("프로필을 가져올 유저를 선택해주세요.")
        const userSelect = new UserSelectMenuBuilder()
            .setCustomId("getProfile")
            .setPlaceholder("유저를 선택하세요.");
        const separator = new SeparatorBuilder()
        const actionRow = new ActionRowBuilder()
            .addComponents(userSelect)
        const container = new ContainerBuilder()
            .addTextDisplayComponents(selectText)
            .addSeparatorComponents(separator)
            .addActionRowComponents(actionRow)
            .setAccentColor(0x00ffff)

        const response = await interaction.reply(
            {
                flags: MessageFlags.IsComponentsV2,
                components: [container],
            }
        )
        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.userSelect,
            time: 60000, // 1분
        });
        collector.on('collect', async (collectedInteraction) => {
            const user = collectedInteraction.values[0];
            const userProfile = collectedInteraction.guild.members.cache.get(user)?.user.displayAvatarURL({ size: 256, dynamic: true }) || collectedInteraction.guild.members.cache.get(user)?.user.defaultAvatarURL;
            const userName = collectedInteraction.guild.members.cache.get(user)?.user.username || "Unknown User";
            const mediaGallery = new MediaGalleryBuilder()
                .addItems([
                    {
                        media: {
                            url : userProfile,

                        }
                    }
                ])
            const container = new ContainerBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**${userName}**님의 프로필 사진입니다.`))
                .addSeparatorComponents(new SeparatorBuilder())
                .addMediaGalleryComponents(mediaGallery)
                .setAccentColor(0x00ffff);
            interaction.editReply({
                flags: MessageFlags.IsComponentsV2,
                components: [container]
            })
        });
    }
}