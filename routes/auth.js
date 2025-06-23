

// routes/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { deriveWallet } = require('../utils/wallet');
const { generateToken } = require('../utils/jwt');






router.post('/register', async (req, res) => {
    const { email, password, transactionPassword, inviteCode } = req.body;
    if (!email || !password || !transactionPassword || !inviteCode)
        return res.status(400).json({ error: 'All fields required' });

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ error: 'User already exists' });

        const userCount = await User.countDocuments();
        const wallet = deriveWallet(userCount); // BSC Testnet wallet

        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedTxnPass = await bcrypt.hash(transactionPassword, 10);

        const newUser = new User({
            email,
            password: hashedPassword,
            transactionPassword: hashedTxnPass,
            inviteCode,
            wallet,
        });

        await newUser.save();

        const token = generateToken(newUser._id);

        res.status(200).json({
            message: 'User registered successfully',
            token,
            walletAddress: newUser.wallet.address
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'Email and password required' });

    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ error: 'Invalid email' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ error: 'Invalid password' });

        const token = generateToken(user._id);

        res.status(200).json({
            message: 'Login successful',
            token,
            walletAddress: user.wallet.address
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});



module.exports = router;
