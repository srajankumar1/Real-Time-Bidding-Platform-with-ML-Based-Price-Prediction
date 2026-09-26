import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Search, Sparkles, Gavel, Bell, Plus } from 'lucide-react';

import SidebarDock from './components/SidebarDock';
import DashboardStats from './components/DashboardStats';
import MLForecastChart from './components/MLForecastChart';
import BottomWidgets from './components/BottomWidgets';
import BidderCard from './components/BidderCard';
import AuctionCard from './components/AuctionCard';
import AuctionDetail from './components/AuctionDetail';
import CreateAuctionModal from './components/CreateAuctionModal';
import { formatCurrency } from './utils/formatters';

const CATEGORIES = ['All', 'Electronics', 'Collectibles', 'Fine Art', 'Jewelry', 'Fashion', 'Home & Garden'];
const SOCKET_URL = window.location.port === '3000' ? 'http://127.0.0.1:5002' : '/';

export default function App() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuctionId, setSelectedAuctionId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [recentlyUpdatedId, setRecentlyUpdatedId] = useState(null);
  const [latestBidEvent, setLatestBidEvent] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch initial auctions
  const fetchAuctions = async () => {
    try {
      const res = await fetch('/api/auctions');
      if (res.ok) {
        const data = await res.json();
        setAuctions(data);
      }
    } catch (err) {
      console.error('Failed to load auctions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  // Setup Socket.IO real-time bidding connection
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
    });

    socket.on('connect', () => {
      console.log('Connected to real-time bidding WebSocket server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from bidding server');
      setIsConnected(false);
    });

    socket.on('new_bid', (data) => {
      console.log('Real-time bid received:', data);

      setLatestBidEvent({
        highestBidder: data.highestBidder,
        currentBid: data.currentBid,
        timestamp: new Date(),
        auctionId: data.auctionId,
      });

      setAuctions((prev) =>
        prev.map((item) => {
          if (item._id === data.auctionId) {
            return {
              ...item,
              currentBid: data.currentBid,
              highestBidder: data.highestBidder,
              numBidders: data.numBidders,
              predictedPrice: data.predictedPrice,
            };
          }
          return item;
        })
      );

      setRecentlyUpdatedId(data.auctionId);
      setTimeout(() => setRecentlyUpdatedId(null), 2500);

      setToastMessage({
        text: `New bid of ${formatCurrency(data.currentBid)} placed by ${data.highestBidder}!`,
        subtext: `ML Price adjusted to ${formatCurrency(data.predictedPrice)}`,
      });
      setTimeout(() => setToastMessage(null), 4000);
    });

    socket.on('auction_created', (newAuction) => {
      setAuctions((prev) => [newAuction, ...prev]);
      setToastMessage({
        text: `New auction listed: ${newAuction.itemName}`,
        subtext: `ML Forecast: ${formatCurrency(newAuction.predictedPrice)}`,
      });
      setTimeout(() => setToastMessage(null), 4000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Filtered auctions
  const filteredAuctions = auctions.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="dashboard-layout">
      {/* Warm & cool atmospheric backdrops shining through glass */}
      <div className="glass-ambient-container">
        <div className="glow-warm-1" />
        <div className="glow-cool-1" />
        <div className="glow-emerald-1" />
      </div>

      {/* Floating Vertical Sidebar Dock matching screenshot */}
      <SidebarDock
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreate={() => setShowCreateModal(true)}
      />

      {/* Main Workspace */}
      <main className="dashboard-main">
        {/* Header: Title and Metric Pills */}
        <header className="dash-header">
          <div className="dash-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1>My Dashboard</h1>
              <div
                className="status-pill"
                style={{
                  background: isConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                  borderColor: isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)',
                  color: isConnected ? '#34d399' : '#fbbf24',
                }}
              >
                <div
                  className="pulse-dot"
                  style={{ backgroundColor: isConnected ? '#10b981' : '#f59e0b' }}
                />
                <span style={{ fontSize: '0.74rem' }}>{isConnected ? 'Live WebSocket' : 'Syncing...'}</span>
              </div>
            </div>
          </div>

          {/* Three top metrics strip */}
          <DashboardStats auctions={auctions} />
        </header>

        {/* Two-Column Grid matching reference screenshot */}
        <div className="dashboard-grid">
          {/* Left Column: Statistic Chart + Bottom Widgets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* 1. Statistic Chart with glowing spline lines */}
            <MLForecastChart />

            {/* 2. Bottom Widgets (Goals, Other Savings, Last Transaction) */}
            <BottomWidgets
              latestBid={latestBidEvent}
              onSelectLatestAuction={() => {
                if (latestBidEvent?.auctionId) {
                  setSelectedAuctionId(latestBidEvent.auctionId);
                } else if (auctions.length > 0) {
                  setSelectedAuctionId(auctions[0]._id);
                }
              }}
            />
          </div>

          {/* Right Column: User Profile + Action Buttons + Luxury VISA Card */}
          <BidderCard
            onOpenCreate={() => setShowCreateModal(true)}
            onQuickBid={() => {
              if (auctions.length > 0) setSelectedAuctionId(auctions[0]._id);
            }}
          />
        </div>

        {/* Live Auctions Section */}
        <section style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="glass-panel filter-glass-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Gavel size={18} color="var(--accent-orange)" />
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                  Live Real-Time Auctions
                </h2>
              </div>

              <button
                className="glass-chip-btn"
                onClick={() => setShowCreateModal(true)}
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.25), rgba(255, 140, 66, 0.15))',
                  borderColor: 'var(--accent-orange)',
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Plus size={14} /> List Item
              </button>
            </div>

            {/* Category Chips & Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div className="category-chips-list">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={`glass-chip-btn ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={14} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="glass-search-input"
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Auction Cards Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <div className="pulse-dot" style={{ margin: '0 auto 12px auto' }} />
              Connecting to live auctions...
            </div>
          ) : filteredAuctions.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
              <Gavel size={32} style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />
              <h3>No matching auctions found</h3>
              <p style={{ fontSize: '0.82rem', marginTop: 4 }}>Try clearing search or picking another category filter.</p>
            </div>
          ) : (
            <div className="glass-auction-grid">
              {filteredAuctions.map((auction) => (
                <AuctionCard
                  key={auction._id}
                  auction={auction}
                  isRecentlyUpdated={recentlyUpdatedId === auction._id}
                  onSelect={(item) => setSelectedAuctionId(item._id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Auction Detail Modal */}
      {selectedAuctionId && (
        <AuctionDetail
          auctionId={selectedAuctionId}
          onClose={() => setSelectedAuctionId(null)}
          userName="Avnik Italiya"
          userId="vip-user-01"
        />
      )}

      {/* Create Auction Modal */}
      {showCreateModal && (
        <CreateAuctionModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(newAuction) => {
            setAuctions((prev) => [newAuction, ...prev]);
          }}
        />
      )}

      {/* Real-time Bid Toast Notification */}
      {toastMessage && (
        <div className="glass-toast">
          <Bell size={18} color="var(--accent-orange)" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{toastMessage.text}</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{toastMessage.subtext}</div>
          </div>
        </div>
      )}
    </div>
  );
}
