/**
 * seed.js
 * Seeds diverse, realistic auction items for instant testing and interactive demonstration.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, closeDB } = require('./config/db');
const Auction = require('./models/Auction');
const Bid = require('./models/Bid');
const { predictFinalPrice } = require('./services/mlClient');

const SEED_AUCTIONS = [
  {
    itemName: 'Vintage 1968 Omega Speedmaster Chronograph',
    description: 'Iconic pre-moon manual-wind chronograph in exceptional collector condition with original tritium dial.',
    category: 'Collectibles',
    startingPrice: 850.00,
    currentBid: 1250.00,
    highestBidder: 'Marcus Aurelius',
    numBidders: 9,
    durationHours: 24,
    timeOfDayListed: 'Evening',
    hoursRemaining: 14,
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=700&auto=format&fit=crop&q=80',
    initialBids: [
      { bidderName: 'Alex Mercer', amount: 900.00, minsAgo: 90 },
      { bidderName: 'Sophia Lin', amount: 1050.00, minsAgo: 45 },
      { bidderName: 'Marcus Aurelius', amount: 1250.00, minsAgo: 10 },
    ],
  },
  {
    itemName: 'Apple MacBook Pro M3 Max (16-inch, 64GB RAM, Space Black)',
    description: 'Pristine condition flagship workstation. 16-core CPU, 40-core GPU, 2TB high-speed SSD with AppleCare+.',
    category: 'Electronics',
    startingPrice: 1200.00,
    currentBid: 1750.00,
    highestBidder: 'Devon Vance',
    numBidders: 11,
    durationHours: 48,
    timeOfDayListed: 'Afternoon',
    hoursRemaining: 26,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&auto=format&fit=crop&q=80',
    initialBids: [
      { bidderName: 'Elena Rostova', amount: 1350.00, minsAgo: 120 },
      { bidderName: 'Liam Chen', amount: 1550.00, minsAgo: 50 },
      { bidderName: 'Devon Vance', amount: 1750.00, minsAgo: 15 },
    ],
  },
  {
    itemName: "Original Oil on Canvas 'Solitude at Dawn' (1974)",
    description: 'Framed impressionist coastal landscape by listed European artist. Museum-grade archival varnish.',
    category: 'Fine Art',
    startingPrice: 450.00,
    currentBid: 780.00,
    highestBidder: 'Claire Dupont',
    numBidders: 6,
    durationHours: 72,
    timeOfDayListed: 'Evening',
    hoursRemaining: 42,
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=700&auto=format&fit=crop&q=80',
    initialBids: [
      { bidderName: 'Julian Grey', amount: 550.00, minsAgo: 180 },
      { bidderName: 'Claire Dupont', amount: 780.00, minsAgo: 30 },
    ],
  },
  {
    itemName: 'Art Deco Natural Colombian Emerald & Diamond Ring (18K White Gold)',
    description: 'Certified 2.4ct vivid green octagonal step-cut emerald flanked by tapered baguette diamonds.',
    category: 'Jewelry',
    startingPrice: 650.00,
    currentBid: 1100.00,
    highestBidder: 'Victoria Sterling',
    numBidders: 8,
    durationHours: 24,
    timeOfDayListed: 'Evening',
    hoursRemaining: 8,
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=700&auto=format&fit=crop&q=80',
    initialBids: [
      { bidderName: 'James Thorne', amount: 800.00, minsAgo: 110 },
      { bidderName: 'Victoria Sterling', amount: 1100.00, minsAgo: 25 },
    ],
  },
  {
    itemName: 'Hermès Vintage Togo Leather Kelly 32 in Gold with Palladium Hardware',
    description: 'Exquisite heritage leather craftsmanship, includes clochette, lock, two keys, and original dust bag.',
    category: 'Fashion',
    startingPrice: 500.00,
    currentBid: 950.00,
    highestBidder: 'Camilla Rossi',
    numBidders: 7,
    durationHours: 48,
    timeOfDayListed: 'Afternoon',
    hoursRemaining: 19,
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=700&auto=format&fit=crop&q=80',
    initialBids: [
      { bidderName: 'Tara Sharma', amount: 700.00, minsAgo: 140 },
      { bidderName: 'Camilla Rossi', amount: 950.00, minsAgo: 60 },
    ],
  },
  {
    itemName: 'Handcrafted Solid Teakwood Sculptural Patio Lounge Set',
    description: 'Sustainably harvested Grade-A teak with Sunbrella performance fabric cushions and rain covers.',
    category: 'Home & Garden',
    startingPrice: 220.00,
    currentBid: 380.00,
    highestBidder: 'Oscar Bennett',
    numBidders: 5,
    durationHours: 48,
    timeOfDayListed: 'Morning',
    hoursRemaining: 31,
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=700&auto=format&fit=crop&q=80',
    initialBids: [
      { bidderName: 'Noah Patel', amount: 280.00, minsAgo: 200 },
      { bidderName: 'Oscar Bennett', amount: 380.00, minsAgo: 75 },
    ],
  },
];

async function seedDatabase(shouldClose = true) {
  console.log('Checking auction listings in database...');
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  // Clear existing records
  await Auction.deleteMany({});
  await Bid.deleteMany({});

  const now = Date.now();

  for (const item of SEED_AUCTIONS) {
    const startTime = new Date(now - (item.durationHours - item.hoursRemaining) * 3600 * 1000);
    const endTime = new Date(startTime.getTime() + item.durationHours * 3600 * 1000);

    // Call ML prediction client
    const mlResult = await predictFinalPrice({
      item_category: item.category,
      starting_price: item.startingPrice,
      num_bidders: item.numBidders,
      auction_duration_hours: item.durationHours,
      time_of_day_listed: item.timeOfDayListed,
      current_bid: item.currentBid,
    });

    const auction = new Auction({
      itemName: item.itemName,
      description: item.description,
      category: item.category,
      startingPrice: item.startingPrice,
      currentBid: item.currentBid,
      highestBidder: item.highestBidder,
      numBidders: item.numBidders,
      durationHours: item.durationHours,
      timeOfDayListed: item.timeOfDayListed,
      startTime,
      endTime,
      imageUrl: item.imageUrl,
      predictedPrice: mlResult.predicted_price,
      status: 'active',
    });

    await auction.save();

    // Create bid history
    for (const b of item.initialBids) {
      const bid = new Bid({
        auctionId: auction._id,
        userId: `seed-user-${Math.floor(Math.random() * 1000)}`,
        bidderName: b.bidderName,
        bidderAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(b.bidderName)}`,
        amount: b.amount,
        timestamp: new Date(now - b.minsAgo * 60 * 1000),
      });
      await bid.save();
    }

    console.log(`+ Seeded: "${auction.itemName}" | Current: $${auction.currentBid} | ML Predicted: $${auction.predictedPrice}`);
  }

  console.log('\nSeeding completed successfully!');
  if (shouldClose) {
    await closeDB();
  }
}

if (require.main === module) {
  seedDatabase(true).catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}

module.exports = seedDatabase;
