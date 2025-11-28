const { Events, ActivityType, PresenceUpdateStatus} = require('discord.js');

function getDDayMessage(targetDate) {
    const now = new Date();
    const diff = targetDate - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `D-Day: ${days}일 남음`;
}

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);

        const targetDate = new Date('2026-01-01T00:00:00+09:00');
        let toggle = true;
        setInterval(() => {
            if (toggle){
                client.user.setPresence({ activities: [{ name: '/도움말 | 아직 개발하는중' }], status: PresenceUpdateStatus.DoNotDisturb });
            }
            else {
                client.user.setPresence({ activities: [{ name: getDDayMessage(targetDate)}], status: PresenceUpdateStatus.DoNotDisturb });
            }
            toggle = !toggle;
        },30000)
    },
};