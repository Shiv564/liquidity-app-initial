// models/Asset.js
const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  icon: {
    type: String, // coin name (e.g., babydoge, floki, etc.)
    required: true,
  },
  amount: {
    type: Number,
    default: 0,
  }
});

assetSchema.index({ user: 1, icon: 1 }, { unique: true }); // avoid duplicate assets

module.exports = mongoose.model('Asset', assetSchema);
