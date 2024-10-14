const { matchModel, mapModel, clanModel } = require('../db');

const express = require('express');
const mapRouter = express.Router();
const { userMiddleware } = require('../middleware/user');
const { isClanMember } = require('../middleware/isClanMember');

mapRouter.post('/create', async (req, res) => {});


module.exports = mapRouter;