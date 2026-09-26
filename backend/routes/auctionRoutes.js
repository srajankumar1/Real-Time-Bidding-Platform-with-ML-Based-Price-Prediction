/**
 * routes/auctionRoutes.js
 * REST endpoints for auctions and real-time bidding.
 */

const express = require('express');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const { predictFinalPrice } = require('../services/mlClient');

function createAuctionRouter(io) {
  const router = express.Router();

  /**
   * Helper: compute time-of-day category for new listings
   */
  function getCurrentTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 22) return 'Evening';
    return 'Night';
  }

  // GET /api/auctions - List all auctions
  router.get('/auctions', async (req, res) => {
    try {
      const { category, status } = req.query;
      const filter = {};
      if (category && category !== 'All') filter.category = category;
      if (status) filter.status = status;

      const auctions = await Auction.find(filter).sort({ createdAt: -1 }).lean();
      return res.json(auctions);
    } catch (err) {
      console.error('Error fetching auctions:', err);
      return res.status(500).json({ error: 'Failed to retrieve auctions' });
    }
  });

  // GET /api/auctions/:id - Get single auction with bid history
  router.get('/auctions/:id', async (req, res) => {
    try {
      const auction = await Auction.findById(req.params.id);
      if (!auction) {
        return res.status(404).json({ error: 'Auction not found' });
      }

      // Check if auction has expired and update status if needed
      if (auction.status === 'active' && new Date() > new Date(auction.endTime)) {
        auction.status = 'ended';
        await auction.save();
      }

      const bids = await Bid.find({ auctionId: auction._id }).sort({ timestamp: -1 }).limit(50).lean();

      return res.json({
        ...auction.toObject(),
        bids,
      });
    } catch (err) {
      console.error('Error fetching auction detail:', err);
      return res.status(500).json({ error: 'Failed to retrieve auction' });
    }
  });

  // POST /api/auctions - Create a new auction
  router.post('/auctions', async (req, res) => {
    try {
      const {
        itemName,
        description,
        category,
        startingPrice,
        durationHours = 24,
        imageUrl,
      } = req.body;

      if (!itemName || startingPrice === undefined || Number(startingPrice) <= 0) {
        return res.status(400).json({ error: 'Item name and positive starting price are required' });
      }

      const parsedPrice = Math.round(Number(startingPrice) * 100) / 100;
      const parsedDuration = Math.max(1, Number(durationHours));
      const timeOfDay = getCurrentTimeOfDay();
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + parsedDuration * 3600 * 1000);

      // Call ML service for initial predicted price (at 1 initial bidder)
      const mlResult = await predictFinalPrice({
        item_category: category || 'Electronics',
        starting_price: parsedPrice,
        num_bidders: 1,
        auction_duration_hours: parsedDuration,
        time_of_day_listed: timeOfDay,
        current_bid: parsedPrice,
      });

      const newAuction = new Auction({
        itemName,
        description: description || '',
        category: category || 'Electronics',
        startingPrice: parsedPrice,
        currentBid: parsedPrice,
        highestBidder: 'Starting Price',
        numBidders: 1,
        durationHours: parsedDuration,
        timeOfDayListed: timeOfDay,
        startTime,
        endTime,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
        predictedPrice: mlResult.predicted_price,
        status: 'active',
      });

      await newAuction.save();

      // Broadcast new auction event to all clients
      io.emit('auction_created', newAuction);

      return res.status(201).json(newAuction);
    } catch (err) {
      console.error('Error creating auction:', err);
      return res.status(500).json({ error: 'Failed to create auction' });
    }
  });

  // POST /api/auctions/:id/bid - Place a live bid
  router.post('/auctions/:id/bid', async (req, res) => {
    try {
      const { amount, bidderName, userId } = req.body;
      const bidAmount = Math.round(Number(amount) * 100) / 100;

      if (!bidAmount || isNaN(bidAmount)) {
        return res.status(400).json({ error: 'A valid numeric bid amount is required' });
      }

      const auction = await Auction.findById(req.params.id);
      if (!auction) {
        return res.status(404).json({ error: 'Auction not found' });
      }

      // Check if auction is ended
      if (auction.status === 'ended' || new Date() > new Date(auction.endTime)) {
        auction.status = 'ended';
        await auction.save();
        return res.status(400).json({ error: 'This auction has ended' });
      }

      // Verify bid is higher than current bid
      if (bidAmount <= auction.currentBid) {
        return res.status(400).json({
          error: `Bid of $${bidAmount.toFixed(2)} must be strictly higher than current bid of $${auction.currentBid.toFixed(2)}`,
        });
      }

      const activeBidderName = (bidderName && bidderName.trim()) || 'Bidder ' + Math.floor(1000 + Math.random() * 9000);
      const activeUserId = userId || `user-${Math.floor(100000 + Math.random() * 900000)}`;

      // Calculate distinct bidders for this auction
      const existingBids = await Bid.find({ auctionId: auction._id });
      const uniqueBidderIds = new Set(existingBids.map((b) => b.userId));
      uniqueBidderIds.add(activeUserId);
      const updatedNumBidders = Math.max(auction.numBidders + 1, uniqueBidderIds.size);

      // Create and save new Bid record
      const newBid = new Bid({
        auctionId: auction._id,
        userId: activeUserId,
        bidderName: activeBidderName,
        bidderAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(activeBidderName)}`,
        amount: bidAmount,
        timestamp: new Date(),
      });
      await newBid.save();

      // Call ML Service to predict new final price given increased bidder competition and updated values
      const mlResult = await predictFinalPrice({
        item_category: auction.category,
        starting_price: auction.startingPrice,
        num_bidders: updatedNumBidders,
        auction_duration_hours: auction.durationHours,
        time_of_day_listed: auction.timeOfDayListed,
        current_bid: bidAmount,
      });

      // Update Auction document
      auction.currentBid = bidAmount;
      auction.highestBidder = activeBidderName;
      auction.highestBidderId = activeUserId;
      auction.numBidders = updatedNumBidders;
      auction.predictedPrice = mlResult.predicted_price;
      await auction.save();

      const broadcastPayload = {
        auctionId: auction._id.toString(),
        currentBid: auction.currentBid,
        highestBidder: auction.highestBidder,
        numBidders: auction.numBidders,
        predictedPrice: auction.predictedPrice,
        isFallbackML: mlResult.is_fallback,
        bid: {
          _id: newBid._id,
          auctionId: newBid.auctionId,
          bidderName: newBid.bidderName,
          bidderAvatar: newBid.bidderAvatar,
          amount: newBid.amount,
          timestamp: newBid.timestamp,
        },
      };

      // Broadcast bid update in real time to all connected clients!
      io.emit('new_bid', broadcastPayload);
      io.emit('auction_updated', auction);

      return res.status(200).json({
        success: true,
        auction,
        bid: newBid,
        mlInfo: {
          predictedPrice: auction.predictedPrice,
          isFallback: mlResult.is_fallback,
        },
      });
    } catch (err) {
      console.error('Error processing bid:', err);
      return res.status(500).json({ error: 'Failed to place bid' });
    }
  });

  return router;
}

module.exports = createAuctionRouter;
