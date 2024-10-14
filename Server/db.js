const mongoose = require('mongoose');
const { MONGO_URL } = require('./config');
mongoose.connect(MONGO_URL);
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const userSchema = new Schema({
    email: {
        type: String,
        unique: true,
    }, 
    username: {
        type: String,
        unique: true,
    },
    password: String,
    facebook: String,
});

const clanSchema = new Schema({
    name: String,
    image: String, 
    members: [ObjectId],
    facebook: String,
    youtube: String,
    joinRequests: [ObjectId],
    matchRequests: [{
        matchId: { type: ObjectId, ref: 'Match' },
        fromClan: { type: ObjectId, ref: 'Clan' },
        status: { type: String, default: 'pending' }
    }]
});

const matchSchema = new Schema({
    clan1: { type: Schema.Types.ObjectId, ref: 'Clan' }, // The clan sending the request
    clan2: { type: Schema.Types.ObjectId, ref: 'Clan' }, // The clan receiving the request
    finished: { type: Boolean, default: false },
    winner: { type: Schema.Types.ObjectId, ref: 'Clan', default: null },
    date: { type: Date, default: Date.now },
    maps: [{ type: Schema.Types.ObjectId, ref: 'Map' }], // Maps associated with the match
    status: { type: String, default: 'pending' }, // "pending", "accepted", "declined"
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // User who sent the request
    clan2RespondedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null } // User who responded
});

const mapSchema = new Schema({
    name: { type: String, required: true },
    gameMode: { type: String, required: true },
    clan1Score: { type: Schema.Types.ObjectId, ref: 'Clan' },
    clan2Score: { type: Schema.Types.ObjectId, ref: 'Clan' }
});

const userModel = mongoose.model('User', userSchema);
const clanModel = mongoose.model('Clan', clanSchema);
const matchModel = mongoose.model('Match', matchSchema);
const mapModel = mongoose.model('Map', mapSchema);

module.exports = { 
    userModel, 
    clanModel,
    matchModel,
    mapModel,
};