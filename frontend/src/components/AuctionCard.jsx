import React, { useState, useEffect } from 'react';
import { Clock, Users, Sparkles, TrendingUp } from 'lucide-react';
import { formatCurrency, getTimeRemaining } from '../utils/formatters';

export default function AuctionCard({ auction, onSelect, isRecentlyUpdated }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeRemaining(auction.endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(auction.endTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [auction.endTime]);

  const predicted = auction.predictedPrice || auction.currentBid * 1.25;
  const difference = predicted - auction.currentBid;
  const upsidePct = auction.currentBid > 0 ? Math.round((difference / auction.currentBid) * 100) : 0;

  return (
    <div
      className="glass-panel glass-auction-card"
      onClick={() => onSelect(auction)}
      style={{
        borderColor: isRecentlyUpdated ? '#ff6b35' : undefined,
        boxShadow: isRecentlyUpdated
          ? '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 107, 53, 0.45)'
          : undefined,
      }}
    >
      <div className="auction-media-box">
        <img
          src={auction.imageUrl}
          alt={auction.itemName}
          className="auction-media-img"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
          }}
        />
        <div className="frosted-tag">{auction.category}</div>
        <div className="frosted-timer">
          <Clock size={12} />
          <span>{timeLeft.display}</span>
        </div>
      </div>

      <div className="auction-body-content">
        <h3 className="auction-card-title">{auction.itemName}</h3>
        <p className="auction-card-snippet">{auction.description || 'Authentic listing verified by community.'}</p>

        <div className="auction-price-split">
          <div>
            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 2 }}>
              Current Bid
            </div>
            <div className="live-price-huge">{formatCurrency(auction.currentBid)}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Users size={12} color="var(--accent-cyan)" /> {auction.numBidders || 1} bidders
            </div>
          </div>

          <div className="ml-prediction-capsule" title="ML prediction based on category, duration, and bidding competition">
            <div className="ml-capsule-label">
              <Sparkles size={11} />
              <span>ML Predict</span>
            </div>
            <div className="ml-capsule-price">{formatCurrency(predicted)}</div>
            {upsidePct > 0 && (
              <div style={{ fontSize: '0.68rem', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, marginTop: 2 }}>
                <TrendingUp size={10} /> +{upsidePct}% upside
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
