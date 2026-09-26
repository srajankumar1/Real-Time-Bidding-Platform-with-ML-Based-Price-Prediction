import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Users,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Cpu,
} from 'lucide-react';
import { formatCurrency, getTimeRemaining, formatTimeAgo } from '../utils/formatters';

export default function AuctionDetail({
  auctionId,
  onClose,
  userName = 'Avnik Italiya',
  userId = 'vip-user-01',
}) {
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);

  // Fetch initial auction data + bid history
  const fetchAuctionDetail = async () => {
    try {
      const res = await fetch(`/api/auctions/${auctionId}`);
      if (!res.ok) throw new Error('Auction not found');
      const data = await res.json();
      setAuction(data);
      setBids(data.bids || []);
      setBidAmount(Math.round((data.currentBid + 15) * 100) / 100);
      setTimeLeft(getTimeRemaining(data.endTime));
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctionDetail();
  }, [auctionId]);

  useEffect(() => {
    if (!auction?.endTime) return;
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(auction.endTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [auction?.endTime]);

  const handlePlaceBid = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const numericAmount = parseFloat(bidAmount);
    if (!numericAmount || isNaN(numericAmount)) {
      setErrorMsg('Please enter a valid numeric bid amount');
      return;
    }

    if (numericAmount <= auction.currentBid) {
      setErrorMsg(`Bid must be strictly higher than current bid of ${formatCurrency(auction.currentBid)}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/auctions/${auctionId}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numericAmount,
          bidderName: userName,
          userId: userId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place bid');
      }

      setSuccessMsg(`Bid of ${formatCurrency(numericAmount)} placed successfully!`);
      setAuction(data.auction);
      setBids((prev) => [data.bid, ...prev]);
      setBidAmount(Math.round((data.auction.currentBid + 20) * 100) / 100);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickAdd = (increment) => {
    if (!auction) return;
    const nextVal = Math.round((auction.currentBid + increment) * 100) / 100;
    setBidAmount(nextVal);
  };

  if (loading) {
    return (
      <div className="glass-modal-backdrop">
        <div className="glass-panel glass-modal-panel" style={{ padding: 40, textAlign: 'center', maxWidth: 400 }}>
          <div className="pulse-dot" style={{ margin: '0 auto 12px auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>Retrieving live glass auction...</p>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="glass-modal-backdrop" onClick={onClose}>
        <div className="glass-panel glass-modal-panel" style={{ padding: 40, textAlign: 'center', maxWidth: 400 }}>
          <p style={{ color: 'var(--accent-orange)' }}>{errorMsg || 'Auction not found'}</p>
          <button className="glass-chip-btn" onClick={onClose} style={{ marginTop: 16 }}>
            Close
          </button>
        </div>
      </div>
    );
  }

  const startingPrice = auction.startingPrice || 100;
  const currentBid = auction.currentBid || startingPrice;
  const predictedPrice = auction.predictedPrice || currentBid * 1.25;

  const progressRatio = Math.min(1.0, currentBid / (predictedPrice || currentBid));
  const progressPct = Math.round(progressRatio * 100);
  const upsideDollars = Math.max(0, predictedPrice - currentBid);

  return (
    <div className="glass-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass-panel glass-modal-panel">
        <button className="modal-close-pill" onClick={onClose} title="Close window">
          <X size={18} />
        </button>

        <div className="detail-layout">
          {/* Left Column: Image & ML Gauge */}
          <div className="detail-media-wrap">
            <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden' }}>
              <img
                src={auction.imageUrl}
                alt={auction.itemName}
                className="detail-image"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
                }}
              />
              <div className="frosted-tag">{auction.category}</div>
              <div className="frosted-timer">
                <Clock size={12} />
                <span>{timeLeft?.display || 'Active'}</span>
              </div>
            </div>

            {/* ML Prediction Visual Gauge Card */}
            <div className="ml-gauge-card" style={{ background: 'rgba(18, 24, 38, 0.65)', border: '1px solid rgba(56, 189, 248, 0.3)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.15)' }}>
              <div className="gauge-header">
                <div className="gauge-title" style={{ color: '#38bdf8' }}>
                  <Cpu size={16} />
                  <span>ML Price Forecast Engine</span>
                </div>
                <div className="gauge-badge">Gradient Boosting (R² 0.99)</div>
              </div>

              <div className="gauge-values-row">
                <div className="gauge-val-item">
                  <span className="gauge-val-label">Current Highest Bid</span>
                  <span className="gauge-val-number" style={{ color: '#fff' }}>
                    {formatCurrency(currentBid)}
                  </span>
                </div>

                <div className="gauge-val-item" style={{ textAlign: 'right' }}>
                  <span className="gauge-val-label" style={{ color: '#38bdf8' }}>
                    Predicted Final Price
                  </span>
                  <span className="gauge-val-number" style={{ color: '#38bdf8' }}>
                    {formatCurrency(predictedPrice)}
                  </span>
                </div>
              </div>

              {/* Progress bar towards ML prediction */}
              <div className="gauge-bar-track">
                <div
                  className="gauge-bar-fill"
                  style={{
                    width: `${progressPct}%`,
                    background: 'linear-gradient(to right, #ff6b35, #ff9f1c, #38bdf8)',
                    boxShadow: '0 0 10px rgba(255, 107, 53, 0.6)',
                  }}
                />
              </div>

              <div className="gauge-insight">
                <span>{progressPct}% of predicted valuation realized</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>
                  {upsideDollars > 0 ? `+${formatCurrency(upsideDollars)} expected upside` : 'At predicted ceiling'}
                </span>
              </div>

              <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Parameters: {auction.category} • {auction.durationHours}h • {auction.timeOfDayListed}</span>
                <span>Active bidders: {auction.numBidders}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Actions & Bid Stream */}
          <div className="detail-info-wrap">
            <div>
              <h2 className="detail-title">{auction.itemName}</h2>
              <p className="detail-desc" style={{ marginTop: 6 }}>{auction.description}</p>
            </div>

            {/* Modern Bidding Console */}
            <div className="modern-bid-console">
              <div className="current-bid-banner">
                <div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 4 }}>
                    Current Highest Bid
                  </div>
                  <div className="current-bid-huge">
                    {formatCurrency(auction.currentBid)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 4 }}>
                    Leading Bidder
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--accent-orange)', fontSize: '1.05rem' }}>
                    {auction.highestBidder}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {auction.numBidders} active participants
                  </div>
                </div>
              </div>

              {/* Quick increment chips */}
              <div style={{ marginBottom: 8, fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Quick Increment:
              </div>
              <div className="quick-chips-bar">
                <button type="button" className="modern-quick-chip" onClick={() => handleQuickAdd(10)}>
                  +$10
                </button>
                <button type="button" className="modern-quick-chip" onClick={() => handleQuickAdd(25)}>
                  +$25
                </button>
                <button type="button" className="modern-quick-chip" onClick={() => handleQuickAdd(50)}>
                  +$50
                </button>
                <button type="button" className="modern-quick-chip" onClick={() => handleQuickAdd(100)}>
                  +$100
                </button>
              </div>

              {/* Modern Input & Submit Button */}
              <form onSubmit={handlePlaceBid}>
                <div className="bid-action-form">
                  <div className="bid-input-container">
                    <span className="bid-currency-sign">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min={auction.currentBid + 1}
                      className="modern-bid-field"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="0.00"
                      disabled={submitting || timeLeft?.isEnded}
                    />
                  </div>

                  <button
                    type="submit"
                    className="modern-submit-bid-btn"
                    disabled={submitting || timeLeft?.isEnded}
                  >
                    <DollarSign size={18} />
                    <span>{submitting ? 'Placing...' : 'Place Bid'}</span>
                  </button>
                </div>
              </form>

              {/* Alerts */}
              {errorMsg && (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, color: '#f87171', fontSize: '0.82rem' }}>
                  <AlertCircle size={15} />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, color: '#34d399', fontSize: '0.82rem' }}>
                  <CheckCircle2 size={15} />
                  <span>{successMsg}</span>
                </div>
              )}
            </div>

            {/* Real-time Bid History Stream */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>
                  Live Bids Feed ({bids.length})
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="pulse-dot" style={{ width: 6, height: 6 }} /> Real-Time Synced
                </span>
              </div>

              <div className="bid-history-feed">
                {bids.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No bids yet. Be the first to place a bid!
                  </div>
                ) : (
                  bids.map((b) => (
                    <div key={b._id || b.timestamp} className="bid-item">
                      <div className="bid-user-info">
                        <img
                          src={b.bidderAvatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Bidder'}
                          alt={b.bidderName}
                          className="bidder-avatar"
                          style={{
                            width: 38,
                            height: 38,
                            minWidth: 38,
                            maxWidth: 38,
                            minHeight: 38,
                            maxHeight: 38,
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }}
                        />
                        <div>
                          <div className="bidder-name">{b.bidderName}</div>
                          <div className="bid-time">{formatTimeAgo(b.timestamp)}</div>
                        </div>
                      </div>
                      <div className="bid-amount">
                        {formatCurrency(b.amount)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
