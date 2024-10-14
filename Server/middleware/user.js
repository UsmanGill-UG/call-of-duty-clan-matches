const jwt = require('jsonwebtoken');
const {JWT_USER_PASSWORD } = require('../config');

function userMiddleware(req, res, next) {
    const token = req.headers.token;
    console.log('token: ', token)

    if (!token) {
        return res.status(401).json({ message: 'Authentication token missing' });
    }

    try {
        const decoded = jwt.verify(token, JWT_USER_PASSWORD);

        if (decoded && decoded.userId) {
            req.userId = decoded.userId;
            next()
        } else {
            return res.status(403).json({ message: 'User not authenticated' });
        }
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

module.exports = {
    userMiddleware: userMiddleware,
}
