const mongoose = require('mongoose');
const { Client } = require("pg");
const dotenv = require('dotenv');
const gameRoom = require('./models/gameRoom.model.js');
const kkumalSchema = require('./models/kkumal.model.js');

dotenv.config({path:'../.env'});
const DB_URL = process.env.DB_URL

mongoose.connect(DB_URL, {})
    .then(() => console.log('MongoDB 연결 성공'))
    .catch((error) => console.error('MongoDB 연결 실패:', error));

const client = new Client({
    user: process.env.PSQL_USER,
    host: "127.0.0.1",
    database: "kkumal",
    password: process.env.PSQL_PASSWORD,
    port: 5432,
});
client.connect().then(r =>
    console.log("PostgreSQL connected")
).catch(err =>
    console.error("PostgreSQL connection error:", err)
);


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
            players: [{ userId: interaction.user.id, userName: interaction.user.username }],
        };
        const newRoom = new gameRoom(roomData);
        if (gameType === "kkumal") {
            newRoom.gameData = new kkumalSchema.kkumalDataSchema();
            newRoom.gameSettings = new kkumalSchema.kkumalSettingSchema();
        }
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

async function deleteByRoomId(channelId,doArchive=false) {
    try {
        if (doArchive) {
            const result = await gameRoom.updateOne({roomId: channelId}, {$set: {archived: true}});
            console.log('게임 방 아카이브 성공:', result);
            return result;
        }
        const result = await gameRoom.deleteOne({roomId: channelId});
        console.log('게임 방 삭제 성공:', result);
        return result;
    } catch (error) {
        console.error('게임 방 삭제 실패:', error);
    }
}

async function exists(word) {
    try {
        const query = `
        SELECT _id
        FROM public.kkutu_ko
        WHERE _id = $1
        LIMIT 1;
        `;
        const result = await client.query(query, [word]);
        console.log(result);
        // if (result.rowCount > 0) return true;
        //
        // const inQuery = `
        // SELECT _id
        // FROM public.kkutu_injeong
        // WHERE _id = $1
        // LIMIT 1;
        // `;
        // const inResult = await client.query(inQuery, [word]);
        // console.log(inResult);
        return result.rowCount > 0;
    } catch (err) {
        console.error('단어 조회 중 오류 발생:', err);
        return false;
    }
}

async function getRandomWord(length) {
    try{
        const query = `
                SELECT _id
                FROM public.kkutu_ko
                WHERE LENGTH(_id) = $1
                ORDER BY RANDOM()
                LIMIT 1;
                `
        const result = await client.query(query, [length]);
        if (result.rowCount > 0) {
            return result.rows[0]._id;
        }
        return null;
    } catch(err){
        console.error('단어 조회 중 오류 발생:', err);
    }
}
async function isNotMannerWord(word) {
    const lastWord = word.charAt(word.length - 1);
    console.log("Checking manner word for:", lastWord);
    try {
        const query = `
            SELECT *
            FROM public.kkutu_manner_ko
            WHERE _id = $1
            LIMIT 1;
        `;
        const result = await client.query(query, [lastWord]);
        console.log(result);
        if (result.rowCount === 0) return false;
        const row = result.rows[0];
        return row.KSH_ ?? row.ksh_ ?? false;
    }
    catch (err) {
        console.error('단어 조회 중 오류 발생:', err);
        return false;
    }
}

module.exports = {
    createGameRoom,
    findByRoomId,
    deleteByRoomId,
    exists,
    getRandomWord,
    isNotMannerWord,
};