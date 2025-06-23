// controllers/withdrawController.js 
const Withdrawal = require("../models/Withdrawal");
const Asset = require("../models/Asset");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.submitWithdrawal = async (req, res) => {
    try {
        const { token, amount, destination_address, transaction_password } = req.body;
        const user_id = req.user.id;

        if (!token || !amount || !destination_address || !transaction_password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // ✅ Check transaction password
        const isPasswordCorrect = await bcrypt.compare(transaction_password, user.transactionPassword);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid transaction password." });
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount < 1) {
            return res.status(400).json({ message: "Minimum withdrawal amount is 1." });
        }

        // ✅ Check if user already has 5 withdrawals today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const withdrawalCountToday = await Withdrawal.countDocuments({
            user: user_id,
            requested_at: { $gte: todayStart, $lte: todayEnd }
        });

        if (withdrawalCountToday >= 10) {
            return res.status(400).json({ message: "Daily withdrawal limit reached. Try again after 24 hours." });
        }

        // ✅ Check balance
        const asset = await Asset.findOne({ user: user_id, icon: token.toLowerCase() });
        if (!asset || asset.amount < numericAmount) {
            return res.status(400).json({ message: "Insufficient balance for withdrawal." });
        }

        // ✅ Deduct balance
        asset.amount = parseFloat((asset.amount - numericAmount).toFixed(8));
        await asset.save();

        // ✅ Save withdrawal request
        const newWithdrawal = new Withdrawal({
            user: user_id,
            wallet_address: user.wallet.address, // ✅ correct

            token,
            amount: numericAmount,
            destination_address,
            status: "pending",
            requested_at: new Date()
        });

        await newWithdrawal.save();

        return res.status(200).json({ message: "Withdrawal request submitted successfully." });

    } catch (error) {
        console.error("Withdrawal error:", error);
        return res.status(500).json({ message: "Server error. Try again later." });
    }
};


// getWithdrawalHistory 
// GET /api/withdraw/history?page=1&limit=10
exports.getWithdrawalHistory = async (req, res) => {
    try {
        const userId = req.user._id;

        let page = parseInt(req.query.page) || 1;
        const limit = 10;

        if (page < 1) page = 1;

        const totalCount = await Withdrawal.countDocuments({ user: userId });
        const totalPages = Math.ceil(totalCount / limit);
        if (page > totalPages && totalPages !== 0) page = totalPages;

        const withdrawals = await Withdrawal.find({ user: userId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .select("createdAt destination_address processed_at fee rejection_reason token amount wallet_address status user");

        const formatted = withdrawals.map(w => ({
            created_at: w.createdAt,
            destination_address: w.destination_address,
            processed_at: w.processed_at,
            fee: w.fee || 0,
            rejection_reason: w.rejection_reason || "",
            icon: w.token,
            amount: w.amount,
            wallet_address: w.wallet_address,
            user_id: w.user,
            status: w.status
        }));

        return res.status(200).json({
            currentPage: page,
            totalPages,
            totalCount,
            withdrawals: formatted
        });

    } catch (err) {
        console.error("Error fetching withdrawal history:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
