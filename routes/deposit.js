// routes/Deposit.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Deposit = require('../models/Deposit');

// ✅ POST /api/deposit — receive deposit info
router.post("/", auth, async (req, res) => {
    try {
        const { token, token_amount, txHash } = req.body;

        if (!token || !token_amount || !txHash) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findById(req.user.id);


        if (!user) return res.status(404).json({ message: "User not found" });

        const isDuplicateTx = await Deposit.findOne({ txHash });

        // ✅ If txid is already used — flag user as suspicious and do NOT save
        if (isDuplicateTx) {
            if (!user.isFlaggedForSuspiciousActivity) {
                user.isFlaggedForSuspiciousActivity = true;
                await user.save();
            }

            return res.status(400).json({
                message: "Duplicate transaction ID detected. Deposit not accepted.",
                suspicious: true,
            });
        }

        // ✅ Save deposit if txid is new
        const deposit = new Deposit({
            user: user._id,
            wallet_address: user.wallet?.address,
            token,
            token_amount,
            txHash,
            isSuspicious: user.isFlaggedForSuspiciousActivity || false,
        });

        await deposit.save();

        res.status(201).json({
            message: "Deposit submitted successfully",
            deposit,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});


// GET user's wallet address
router.get('/address', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        console.log("Fetched User:", user);

        if (!user || !user.wallet || !user.wallet.address) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        res.status(200).json({ walletAddress: user.wallet.address });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not fetch wallet address' });
    }
});


// GET /api/deposit/history?page=1&limit=10
router.get("/history", auth, async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        const limit = 10;

        if (page < 1) page = 1;

        const userId = req.user._id;
        const totalCount = await Deposit.countDocuments({ user: userId });
        const totalPages = Math.ceil(totalCount / limit);
        if (page > totalPages) page = totalPages;

        const deposits = await Deposit.find({ user: userId })
            .sort({ created_at: -1 }) // recent first
            .skip((page - 1) * limit)
            .limit(limit)
            .select("createdAt reviewed_at token token_amount status txHash rejection_reason")

        res.status(200).json({
            currentPage: page,
            totalPages,
            totalCount,
            deposits
        });

    } catch (err) {
        console.error("Error fetching deposit history:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});


// GET list of all depositable assets/icons
router.get('/icons', (req, res) => {
    const icons = [
        'bnb', 'btc', 'xrp', 'bob', 'trump', 'babydoge', 'mubarak',
        'bid', 'bnbxbt', 'avax', 'hbar', 'shib', 'dot', 'pepe', 'icp',
        'broccoli714',
        'bub', 'ca', 'ckp', 'fhe', 'floki', 'jager', 'bnbcard', 'koma', 'port3',
        'puffer', 'rwa', 'cat', 'taiko', 'tgt', 'tst', 'tut',
        'eth', 'usdt', 'sol', 'usdc', 'doge', 'trx', 'ada', 'sui', 'link',
        'near', 'render', 'fdusd'
    ];

    res.status(200).json({ icons });
});

module.exports = router;
