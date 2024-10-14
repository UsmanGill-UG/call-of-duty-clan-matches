const express = require('express');
const { clanModel } = require('../db');
const clanRouter = express.Router();
const { userMiddleware } = require('../middleware/user');
const jwt = require('jsonwebtoken');
const { JWT_USER_PASSWORD } = require('../config');


clanRouter.post('/create', userMiddleware, async (req, res) => {
    const { name, facebook, youtube } = req.body;
    const { userId } = req;

    if (!name) {
        return res.status(400).json({ message: 'Clan creation failed, missing info' });
    }

    try {
        console.log(userId)
        const existingClan = await clanModel.findOne({ members: userId });
        console.log(existingClan)
        if (existingClan) {
            return res.status(400).json({ message: 'User is already a member of a clan. Cannot create a new clan.' });
        }

        await clanModel.create({
            name,
            facebook,
            youtube,
            members: [userId],
        });
        return res.status(200).json({ message: 'Clan creation succeeded' });
    } catch (err) {
        return res.status(400).json({ message: `Clan creation failed: ${err.message}` });
    }
})

clanRouter.get('/list', async (req, res) => {
    try {
        const clans = await clanModel.find();
        return res.status(200).json(clans);
    } catch (err) {
        return res.status(400).json({ message: `Clan list failed: ${err.message}` });
    }
})


clanRouter.post('/join/:clanId', userMiddleware, async(req, res) => {
    const { clanId } = req.params;
    const { userId } = req;

    try {
        const clan = await clanModel.findById(clanId);

        if (!clan) {
            return res.status(404).json({ message: 'Clan not found' });
        }

        if (clan.members.includes(userId)) {
            return res.status(400).json({ message: 'You are already a member of this clan' });
        }

        if (clan.joinRequests.includes(userId)) {
            return res.status(400).json({ message: 'You have already requested to join this clan' });
        }

        clan.joinRequests.push(userId);

        await clan.save();

        return res.status(200).json({ message: 'Join request sent successfully' });
    } catch (err) {
        return res.status(500).json({ message: `Error sending join request: ${err.message}` });
    }
})

clanRouter.post('/accept/:clanId/:userId', userMiddleware, async (req, res) => {
    const { clanId, userId: requestUserId } = req.params;
    const { userId } = req;

    try {
        const clan = await clanModel.findById(clanId);

        if (!clan) {
            return res.status(404).json({ message: 'Clan not found' });
        }

        if (!clan.members.includes(userId)) {
            return res.status(403).json({ message: 'Only clan members can accept join requests' });
        }

        const requestIndex = clan.joinRequests.indexOf(requestUserId);
        if (requestIndex === -1) {
            return res.status(400).json({ message: 'No join request found for this user' });
        }

        clan.joinRequests.splice(requestIndex, 1);
        clan.members.push(requestUserId);

        await clan.save();

        return res.status(200).json({ message: 'Join request accepted' });
    } catch (err) {
        return res.status(500).json({ message: `Error accepting join request: ${err.message}` });
    }
});

clanRouter.post('/reject/:clanId/:userId', userMiddleware, async (req, res) => {
    const { clanId, userId: requestUserId } = req.params;
    const { userId } = req;

    try {
        const clan = await clanModel.findById(clanId);

        if (!clan) {
            return res.status(404).json({ message: 'Clan not found' });
        }

        if (!clan.members.includes(userId)) {
            return res.status(403).json({ message: 'Only clan members can reject join requests' });
        }

        const requestIndex = clan.joinRequests.indexOf(requestUserId);
        if (requestIndex === -1) {
            return res.status(400).json({ message: 'No join request found for this user' });
        }

        clan.joinRequests.splice(requestIndex, 1);

        await clan.save();

        return res.status(200).json({ message: 'Join request rejected' });
    } catch (err) {
        return res.status(500).json({ message: `Error rejecting join request: ${err.message}` });
    }
});

clanRouter.get('/join-requests', userMiddleware, async (req, res) => {
    const { userId } = req;

    try {
        const clansWithJoinRequests = await clanModel.find({ members: userId });

        if (clansWithJoinRequests.length === 0) {
            return res.status(404).json({ message: 'No join requests found' });
        }

        return res.status(200).json({
            message: 'Join requests retrieved successfully',
            joinRequests: clansWithJoinRequests,
        });
    } catch (err) {
        return res.status(500).json({ message: `Error retrieving join requests: ${err.message}` });
    }
});


module.exports = clanRouter;
