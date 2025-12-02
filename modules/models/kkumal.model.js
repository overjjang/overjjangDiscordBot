const mongoose = require('mongoose');
const stream = require("node:stream");
const string_decoder = require("node:string_decoder");
// const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const kkumalDataSchema = new Schema({
    playerSeq: { type: [{ userId: String, userName: String }], default: [] },
    currentTurnIndex: { type: Number, default: 0 },
    lastWord: { type: String, default: null },
    usedWords: { type: [String], default: [] },
})

const kkumalSettingSchema = new Schema({
    rounds: { type: Number, default: 5 },
    mannerMode: { type: Boolean, default: true },
    timeLimit: { type: Number, default: 30 },
})

module.exports = {
    kkumalDataSchema: mongoose.model('kkumalData', kkumalDataSchema),
    kkumalSettingSchema: mongoose.model('kkumalSetting', kkumalSettingSchema),
}
// 일단은 참고용