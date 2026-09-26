/**
 * config/db.js
 * Database connection manager supporting standard MongoDB URI
 * and automatic fallback to MongoMemoryServer for immediate local development.
 */

const mongoose = require('mongoose');

let mongodInstance = null;

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/auction_db';

  try {
    // Attempt standard connection with 2.5s timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`Connected to MongoDB at ${uri}`);
  } catch (err) {
    console.warn(`Could not connect to external MongoDB (${err.message}). Starting in-memory MongoDB...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const memUri = mongodInstance.getUri();
      await mongoose.connect(memUri);
      console.log(`Connected to in-memory MongoDB at ${memUri}`);
    } catch (memErr) {
      console.error('Fatal: Failed to start in-memory MongoDB:', memErr.message);
      process.exit(1);
    }
  }
}

async function closeDB() {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
}

module.exports = { connectDB, closeDB };
