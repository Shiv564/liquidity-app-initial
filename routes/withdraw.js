// routes/withdraw.js

const express = require("express");
const router = express.Router();
const { submitWithdrawal, getWithdrawalHistory } = require("../controllers/withdrawController");
const { auth } = require("../middleware/authMiddleware");

router.post("/submit", auth, submitWithdrawal);

// ✅ Withdrawal history
router.get("/history", auth, getWithdrawalHistory);

module.exports = router;
