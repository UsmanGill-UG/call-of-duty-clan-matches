const express = require('express');
const bcrypt = require('bcrypt');
const userRouter = express.Router();
const { userModel } = require('../db');
const jwt = require('jsonwebtoken');
const { JWT_USER_PASSWORD } = require('../config');
const { userMiddleware } = require('../middleware/user');

userRouter.post('/signup', async (req, res) => {
    const { email, password, username } = req.body;
  
    if (!email || !password || !username) {
      return res.status(400).json({ message: 'User signup failed, missing info' });
    }

    const existingEmail = await userModel.findOne({ email });
    if (existingEmail) {
        return res.status(400).json({ message: 'Email is already registered' });
    }

    const existingUsername = await userModel.findOne({ username });
    if (existingUsername) {
        return res.status(400).json({ message: 'Username is already taken' });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await userModel.create({
        username,
        email,
        password: hashedPassword
      });
      return res.status(200).json({ message: 'User signup succeeded' });
    } catch (err) {
      return res.status(400).json({ message: `User signup failed: ${err.message}` });
    }
});

userRouter.post('/signin', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'User signin failed, missing info' });
    }

    try {
      const user = await userModel.findOne({ username });

      if (!user) {
        return res.status(400).json({message: 'User not found'});
      }

      const isMatch = await bcrypt.compare(password, user.password);
  
      if (isMatch) {
        const token = jwt.sign({ userId: user._id }, JWT_USER_PASSWORD, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 3600000 }); // 1 hour
        return res.status(200).json({ message: 'Login successful!', token: token });
      } else {
        return res.status(400).send('Invalid password or username');
      }
    } catch (error) {
        console.error("Error during login:", error); // Log the error
        return res.status(500).json({ message: 'Error logging in', error: error.message }); // Return the error message
    }    
});


module.exports = userRouter;
