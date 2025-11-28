const mongoose = require('mongoose');
const dotenv = require('dotenv');
const gameRoom = require('./models/gameRoom.model.js');

dotenv.config({path:'../.env'});
const DB_URL = process.env.DB_URL

mongoose.connect(DB_URL, {})
    .then(() => console.log('MongoDB 연결 성공'))
    .catch((error) => console.error('MongoDB 연결 실패:', error));


// ID 디코 체널 아이디, 게임 룸 번호로 사용
async function createGameRoom(channelId, gameType, maxPlayers, interaction) {
    const bangjangInfo = {userId: interaction.user.id, userName: interaction.user.username};
    try {
        const roomData = {
            roomId: channelId,
            date: new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0],
            gameType: gameType,
            maxPlayers: maxPlayers,
            bangJang: bangjangInfo || {},
            players: [{ userId: interaction.user.id, userName: interaction.user.username }]
        };
        const newRoom = new gameRoom(roomData);
        const savedRoom = await newRoom.save();
        console.log('게임 방 생성 성공:', savedRoom);
        return savedRoom;
    } catch (error) {
        console.error('게임 방 생성 실패:', error);
    }
}

async function findByRoomId(channelId) {
    try {
        const data = await gameRoom.findOne({ roomId: channelId });
        console.log(data);
        return data;
    } catch (error) {
        console.error("데이터 조회 오류:", error);
    }
}

async function deleteByRoomId(channelId) {
    try {
        const result = await gameRoom.deleteOne({roomId: channelId});
        console.log('게임 방 삭제 성공:', result);
        return result;
    } catch (error) {
        console.error('게임 방 삭제 실패:', error);
    }
}



module.exports = {
    createGameRoom,
    findByRoomId,
    deleteByRoomId,
};