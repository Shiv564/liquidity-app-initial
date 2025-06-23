// routes/admin.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { auth, isAdmin } = require("../middleware/authMiddleware");

// GET all users
// GET all users with pagination + search
router.get('/users', auth, isAdmin, async (req, res) => {
    try {
        const rawPage = parseInt(req.query.page);
        const rawLimit = parseInt(req.query.limit);
        const searchQuery = req.query.search || "";

        const limit = (rawLimit > 0 && rawLimit <= 100) ? rawLimit : 10;
        let page = (!rawPage || rawPage < 1) ? 1 : rawPage;

        // Build dynamic search filter
        const searchRegex = new RegExp(searchQuery, 'i');
        const filter = {
            $or: [
                { email: searchRegex },
                { username: searchRegex },
                { walletAddress: searchRegex },
                { phone: searchRegex },
                { role: searchRegex },
            ]
        };

        const totalUsers = await User.countDocuments(filter);
        const totalPages = Math.max(Math.ceil(totalUsers / limit), 1);
        if (page > totalPages) page = totalPages;

        const skip = (page - 1) * limit;

        const users = await User.find(filter)
            .skip(skip)
            .limit(limit)
            .select('-password') // exclude sensitive data
            .sort({ createdAt: -1 }); // sort by newest first

        res.json({
            users,
            totalUsers,
            totalPages,
            currentPage: page,
            perPage: limit,
        });

    } catch (err) {
        console.error("Error in GET /admin/users:", err);
        res.status(500).json({ message: "Server error while fetching users." });
    }
});



// Block a user
router.post("/block-user/:id", auth, isAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isBlocked: true },
            { new: true }
        );

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({
            message: "User blocked successfully",
            user,
        });
    } catch (error) {
        res.status(500).json({ message: "Error blocking user", error });
    }
});

// Unblock a user
router.post("/unblock-user/:id", auth, isAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isBlocked: false },
            { new: true }
        );

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({
            message: "User unblocked successfully",
            user,
        });
    } catch (error) {
        res.status(500).json({ message: "Error unblocking user", error });
    }
});


module.exports = router;
