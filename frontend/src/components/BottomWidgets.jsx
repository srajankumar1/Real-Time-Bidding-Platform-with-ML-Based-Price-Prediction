import React from 'react';
import { ArrowRight, Plus, Sparkles } from 'lucide-react';
import { formatCurrency, formatTimeAgo } from '../utils/formatters';

export default function BottomWidgets({ latestBid, onSelectLatestAuction }) {
  return (
    <div className="bottom-stats-row">
      {/* 1. Goals Widget */}
      <div className="sub-glass-card">
        <div className="sub-card-title">
          <span>Goals</span>
          <span style={{ color: 'var(--accent-orange)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.74rem' }}>
            Add Goals <Plus size={12} />
          </span>
        </div>

        <div className="goal-chips-group">
          {/* Goal 1 */}
          <div className="goal-box">
            <div className="goal-pct">78%</div>
            <div className="goal-track">
              <div className="goal-fill" style={{ width: '78%' }} />
            </div>
            <div className="goal-label">Reserve Met</div>
          </div>

          {/* Goal 2 */}
          <div className="goal-box">
            <div className="goal-pct">97%</div>
            <div className="goal-track">
              <div className="goal-fill" style={{ width: '97%' }} />
            </div>
            <div className="goal-label">ML Price Reached</div>
          </div>
        </div>
      </div>

      {/* 2. Other Savings / Category Allocation Widget */}
      <div className="sub-glass-card">
        <div className="sub-card-title">
          <span>Bidding Vault</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Auto-Replenish</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Liquidity</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
              $439,456.23
            </div>
            <span style={{ fontSize: '0.68rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: 999, border: '1px solid rgba(56, 189, 248, 0.3)', display: 'inline-block', marginTop: 6 }}>
              +14.8% APY
            </span>
          </div>

          {/* Mini Bar Chart matching screenshot */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 48 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 12, height: 24, borderRadius: 3, background: 'rgba(255, 107, 53, 0.4)' }} />
              <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>Feb</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 12, height: 38, borderRadius: 3, background: 'linear-gradient(to top, #ff6b35, #ff9f1c)', boxShadow: '0 0 8px rgba(255, 107, 53, 0.5)' }} />
              <span style={{ fontSize: '0.65rem', color: '#fff' }}>Mar</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 12, height: 48, borderRadius: 3, background: 'linear-gradient(to top, #ff6b35, #ffb703)', boxShadow: '0 0 10px rgba(255, 107, 53, 0.7)' }} />
              <span style={{ fontSize: '0.65rem', color: '#fff' }}>Apr</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Last Transaction / Live Bid Stream */}
      <div className="sub-glass-card">
        <div className="sub-card-title">
          <span>Last Transaction</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="pulse-dot" style={{ width: 6, height: 6 }} /> Live
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src={latestBid?.bidderAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=GogoAckerman'}
              alt="Bidder"
              style={{ width: 34, height: 34, borderRadius: '50%', background: '#1e293b' }}
            />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                {latestBid?.highestBidder || 'Gogo Ackerman'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {latestBid?.timestamp ? formatTimeAgo(latestBid.timestamp) : '12.03.2026, 11:45 AM'}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 800, color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '2px 8px', borderRadius: 999 }}>
              +${latestBid?.currentBid ? latestBid.currentBid.toFixed(2) : '250.00'}
            </span>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>Bonus Entry</div>
          </div>
        </div>

        <div
          onClick={onSelectLatestAuction}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: '0.74rem', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          <span>See all Transactions</span>
          <ArrowRight size={13} />
        </div>
      </div>
    </div>
  );
}
