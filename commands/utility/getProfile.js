const { SlashCommandBuilder, EmbedBuilder, MessageFlags, TextDisplayBuilder, SeparatorBuilder, ContainerBuilder, UserSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("프로필사진")
        .setDescription("프로필 사진을 가져옵니다.")
    ,
    async execute(interaction) {
        const textDisplay = new TextDisplayBuilder()
            .setContent('### 프로필 사진 가져오기\n프로필 사진을 가져올 유저를 선택하세요.');

        const userSelect = new UserSelectMenuBuilder()
            .setCustomId('select_user_profile')
            .setPlaceholder('프로필 사진을 가져올 유저를 선택하세요')
            .setMinValues(1)
            .setMaxValues(1);

        const separator = new SeparatorBuilder();

        // ActionRowBuilder로 컴포넌트들을 감싸기
        const textRow = new ContainerBuilder().addTextDisplayComponents(textDisplay);
        const separatorRow = new ContainerBuilder().addSeparatorComponents(separator);
        const userSelectRow = new ContainerBuilder().addUserSelectComponents(userSelect);

        await interaction.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [textRow, separatorRow, userSelectRow],
            ephemeral: true
        });

        try {
            const filter = i => i.customId === 'select_user_profile' && i.user.id === interaction.user.id;
            const userResponse = await interaction.channel.awaitMessageComponent({ filter, time: 60000, componentType: 'UserSelect' });

            const selectedUser = userResponse.users.first();
            await userResponse.update({
                content: `${selectedUser.toString()}님의 프로필 사진을 가져옵니다.`,
                components: [],
            });

            // 프로필 사진 URL 가져오기
            const profilePictureUrl = selectedUser.displayAvatarURL({ size: 1024, dynamic: true });
            
            await interaction.followUp({
                content: `**${selectedUser.username}**님의 프로필 사진:\n${profilePictureUrl}`,
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            await interaction.followUp({
                content: '프로필 사진을 가져오는 중 오류가 발생했습니다.',
                ephemeral: true
            });
        }
    }
}