const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        wallet_address: {
            type: String,
            required: true,
            trim: true
        },
        token: {
            type: String,
            required: true,
            uppercase: true, // e.g., USDT, BNB
            trim: true
        },
        token_amount: {
            type: Number,
            required: true,
            min: 0
        },
        txHash: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        status: {
            type: String,
            enum: ["Pending", "Success", "Failed"],
            default: "Pending"
        },
        rejection_reason: {
            type: String,
            default: "",
            trim: true
        },
        isSuspicious: {
            type: Boolean,
            default: false
        },
        reviewed_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin" // optional, only if you have an Admin model
        },
        reviewed_at: {
            type: Date
        }
    },
    {
        timestamps: true // ✅ adds createdAt and updatedAt
    }
);

module.exports = mongoose.model("Deposit", depositSchema);
