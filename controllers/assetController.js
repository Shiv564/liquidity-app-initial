// controllers/assetController.js
const Asset = require('../models/Asset');

const defaultAssets = [
    'bnb', 'btc', 'xrp', 'bob', 'trump', 'babydoge', 'mubarak',
    'bid', 'bnbxbt', 'avax', 'hbar', 'shib', 'dot', 'pepe', 'icp',
    'broccoli714',
    'bub', 'ca', 'ckp', 'fhe', 'floki', 'jager', 'bnbcard', 'koma', 'port3',
    'puffer', 'rwa', 'cat', 'taiko', 'tgt', 'tst', 'tut',
    'eth', 'usdt', 'sol', 'usdc', 'doge', 'trx', 'ada', 'sui', 'link',
    'near', 'render', 'fdusd'
];

exports.getUserAssets = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1️⃣ Check which icons user already has
        const existingAssets = await Asset.find({ user: userId });
        const existingIcons = new Set(existingAssets.map(a => a.icon));
        const missingAssets = defaultAssets
            .filter(icon => !existingIcons.has(icon))
            .map(icon => ({ user: userId, icon, amount: 0 }));

        if (missingAssets.length > 0) {
            await Asset.insertMany(missingAssets);
        }

        const userAssets = await Asset.find({ user: userId }).sort({ amount: -1 });

        const formatted = userAssets.map(({ icon, amount }) => ({
            icon,
            amount,
        }));
        res.status(200).json(formatted);    
    } catch (err) {
        console.error("Error in getUserAssets:", err);
        res.status(500).json({ error: 'Could not fetch assets' });
    }
};
