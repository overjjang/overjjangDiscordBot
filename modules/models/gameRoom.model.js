const mongoose = require('mongoose');
const stream = require("node:stream");
const string_decoder = require("node:string_decoder");
// const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const gameRoomSchema = new Schema({
    isStarted: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
    roomId: { type: String, required: true, unique: true },
    date : { type: Date, required: true },
    gameType: { type: String, required: true },
    players:{
        type: [{ userId: String, userName: String, userScore: Number },],
        default: []
    },
    bangJang:{
        type: { userId: String, userName: String },
        default: {}
    },
    maxPlayers: { type: Number, required: true },
    gameSettings: { type: Schema.Types.Mixed, default: {} },
    gameData: { type: Schema.Types.Mixed, default: {} }
    });

module.exports = mongoose.model('gameRoom', gameRoomSchema);