/**
 * server.js
 * Express & Socket.IO Real-Time Auction Backend Server.
 */

require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { connectDB } = require('./config/db');
const createAuctionRouter = require('./routes/auctionRoutes');

const app = express();
const server = http.createServer(app);

// Enable Cross-Origin Resource Sharing
app.use(cors());
app.use(express.json());

// Setup Socket.IO with relaxed CORS for modern frontend dev
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Real-time connection management
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('join_auction', (auctionId) => {
    socket.join(`auction_${auctionId}`);
    console.log(`[Socket.IO] Client ${socket.id} joined room auction_${auctionId}`);
  });

  socket.on('leave_auction', (auctionId) => {
    socket.leave(`auction_${auctionId}`);
    console.log(`[Socket.IO] Client ${socket.id} left room auction_${auctionId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Auction Backend API',
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// Mount Auction REST API with Socket.IO instance
app.use('/api', createAuctionRouter(io));

// Serve static frontend build if present
const path = require('path');
const fs = require('fs');
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// macOS ControlCenter listens on 5000 by default, so default to 5002
const PORT = process.env.PORT || 5002;

const Auction = require('./models/Auction');
const seedDatabase = require('./seed');

async function startServer() {
  await connectDB();

  // Auto-seed if database is empty
  const count = await Auction.countDocuments();
  if (count === 0) {
    console.log('Database is empty. Populating initial seed auctions...');
    await seedDatabase(false);
  }

  server.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`Auction Backend Server running on port ${PORT}`);
    console.log(`Socket.IO listening for real-time events`);
    console.log(`===============================================`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = { app, server, io };
