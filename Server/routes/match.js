const express = require('express');
const matchRouter = express.Router();
const { userMiddleware } = require('../middleware/user');
const { isClanMember } = require('../middleware/isClanMember');
const { matchModel, mapModel, clanModel } = require('../db');

matchRouter.post('/request', async (req, res) => {
    const { userId } = req;
    const { clanId, clan2Id, maps } = req.body;

    try {
        const clan2 = await clanModel.findById(clan2Id);

        if (!clan2) {
            return res.status(404).json({ message: 'Target clan not found' });
        }

        const match = await matchModel.create({
            clan1: clanId,
            clan2: clan2Id,
            maps: [],
            status: 'pending',
            requestedBy: userId
        });

        for (let mapData of maps) {
            const map = await mapModel.create({
                name: mapData.name,
                gameMode: mapData.matchType,
                matchId: match._id
            });
            match.maps.push(map._id);
        }

        await match.save();

        clan2.matchRequests.push({
            matchId: match._id,
            fromClan: clanId,
            status: 'pending'
        });

        await clan2.save();

        res.status(200).json({ message: 'Match request sent successfully', match });
    } catch (err) {
        res.status(500).json({ message: `Error sending match request: ${err.message}` });
    }
});

module.exports = matchRouter;
