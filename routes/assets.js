// routes/assets.js 
const express = require('express');
const router = express.Router();
const { getUserAssets } = require('../controllers/assetController');
const { auth } = require('../middleware/authMiddleware');

router.get('/', auth, getUserAssets);

module.exports = router;
