const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  itemName: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Collectibles', 'Fine Art', 'Jewelry', 'Fashion', 'Home & Garden'],
    default: 'Electronics',
  },
  startingPrice: { type: Number, required: true, min: 0 },
  currentBid: { type: Number, required: true, min: 0 },
  highestBidder: { type: String, default: 'Starting Seller' },
  highestBidderId: { type: String, default: null },
  numBidders: { type: Number, default: 1 },
  durationHours: { type: Number, default: 24 },
  timeOfDayListed: {
    type: String,
    enum: ['Morning', 'Afternoon', 'Evening', 'Night'],
    default: 'Evening',
  },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, required: true },
  imageUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
  },
  predictedPrice: { type: Number, default: null },
  status: {
    type: String,
    enum: ['active', 'ended'],
    default: 'active',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Auction', auctionSchema);
