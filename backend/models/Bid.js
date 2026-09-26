const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true,
  },
  userId: {
    type: String,
    default: 'anonymous-user',
  },
  bidderName: {
    type: String,
    required: true,
    default: 'Anonymous Bidder',
  },
  bidderAvatar: {
    type: String,
    default: 'https://api.dicebear.com/7.x/bottts/svg?seed=Bidder',
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Bid', bidSchema);
