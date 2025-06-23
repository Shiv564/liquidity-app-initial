// models/Withdrawal.js

const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        wallet_address: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        network: {
            type: String,
            default: "BEP20" // optional, if you're only supporting BEP20, otherwise make it required
        },
        destination_address: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },
        rejection_reason: {
            type: String
        },
        processed_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User" // or "Admin" if you have a separate admin schema
        },
        transaction_id: {
            type: String // from blockchain if needed
        },
        requested_at: {
            type: Date,
            default: Date.now
        },
        processed_at: {
            type: Date
        }
        ,
        fee: {
            type: Number,
            default: 0
        },

    },
    {
        timestamps: true // adds createdAt and updatedAt fields automatically
    }
);

module.exports = mongoose.model("Withdrawal", withdrawalSchema);
