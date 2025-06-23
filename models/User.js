// models/UserSchema.js 


const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: String,
    transactionPassword: String,
    inviteCode: String,
    wallet: {
        address: String,
        privateKey: String,
        balance: { type: String, default: "0" }
    },
    isFlaggedForSuspiciousActivity: {
        type: Boolean,
        default: false
    },
    isWithdrawalBlocked: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
