const { Events } = require('discord.js');

const activeVoiceChannels = new Map(); // 음성 채널 상태를 저장할 Map

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        const userId = newState.member.user.id;
        if (newState.member.user.bot) return; // 봇은 무시
        if (oldState.channelId === null && newState.channelId !== null) {
            // 사용자가 음성 채널에 입장
            activeVoiceChannels.set(userId, newState.channelId);
            console.log(`${newState.member.user.tag} joined the voice channel ${newState.channel.name}`);
        } else if (oldState.channelId !== null && newState.channelId === null) {
            // 사용자가 음성 채널에서 퇴장
            activeVoiceChannels.delete(userId);
            console.log(`${oldState.member.user.tag} left the voice channel ${oldState.channel.name}`);
        } else if (oldState.channelId !== null && newState.channelId !== null && oldState.channelId !== newState.channelId) {
            // 사용자가 음성 채널을 이동
            activeVoiceChannels.set(userId, newState.channelId);
            console.log(`${oldState.member.user.tag} moved from the voice channel ${oldState.channel.name} to ${newState.channel.name}`);
        }
    },
    activeVoiceChannels, // activeVoiceChannels를 내보내기
};
