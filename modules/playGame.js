db = require('./connetDB.js');


async function playGame(message) {
    if (message.channel.parent && message.channel.parent.name === "버짱이-게임") {
        const roomData = await db.findByRoomId(message.channel.id);
        if (!roomData) console.log("게임 방 데이터를 찾을 수 없습니다.");
        if (roomData.gameType === "kkumal") {
            // 끝말잇기 게임 로직 처리
            if (roomData.isStarted) {
                const gameData = roomData.gameData || {};
                const lastWord = gameData.lastWord || null;
                const newWord = message.content.trim();

            } else {
                await message.reply("게임이 아직 시작되지 않았습니다. 방장이 게임을 시작해야 합니다.");
            }
        }
    }
}

module.exports = {
    playGame,
}