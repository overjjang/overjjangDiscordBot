const { Events, MessageFlags } = require('discord.js');

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        if (oldState.channelId === null && newState.channelId !== null) {
            console.log(`${newState.member.user.tag} joined the voice channel ${newState.channel.name}`);
        } else if (oldState.channelId !== null && newState.channelId === null) {
            console.log(`${oldState.member.user.tag} left the voice channel ${oldState.channel.name}`);
        } else if (oldState.channelId !== null && newState.channelId !== null && oldState.channelId !== newState.channelId) {
            console.log(`${oldState.member.user.tag} moved from the voice channel ${oldState.channel.name} to ${newState.channel.name}`);
        }
    },
}