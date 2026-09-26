import React from 'react';
import {
  MoreVertical,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  PlusCircle,
  Wifi,
  Sparkles,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function BidderCard({ onOpenCreate, onQuickBid }) {
  return (
    <div className="right-sidebar-stack">
      {/* 1. Profile Bar */}
      <div className="glass-panel profile-glass-bar">
        <div className="profile-identity">
          <div className="avatar-ring">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
              alt="Avnik Italiya"
              className="avatar-img"
            />
          </div>
          <div>
            <div className="profile-name">Avnik Italiya</div>
            <div className="profile-role">VIP Platinum Bidder</div>
          </div>
        </div>

        <button
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <MoreVertical size={18} />
        </button>
      </div>

      {/* 2. Quick Action Circle Buttons matching screenshot */}
      <div className="quick-action-strip">
        <button className="quick-action-item" onClick={onQuickBid}>
          <div className="quick-action-circle">
            <ArrowUpRight size={18} color="#fff" />
          </div>
          <span>Transfer</span>
        </button>

        <button className="quick-action-item" onClick={onQuickBid}>
          <div className="quick-action-circle">
            <ArrowDownLeft size={18} color="#fff" />
          </div>
          <span>Receive</span>
        </button>

        <button className="quick-action-item" onClick={onOpenCreate}>
          <div className="quick-action-circle">
            <Receipt size={18} color="#fff" />
          </div>
          <span>Bill / List</span>
        </button>

        <button className="quick-action-item" onClick={onQuickBid}>
          <div className="quick-action-circle">
            <PlusCircle size={18} color="#fff" />
          </div>
          <span>Top-Up</span>
        </button>
      </div>

      {/* 3. Luxury VISA / VIP Bidder Glass Card matching screenshot */}
      <div className="luxury-bid-card" title="Click to view limits & billing">
        <div className="luxury-card-pattern" />

        <div className="card-top-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="card-emv-chip" />
            <Wifi size={18} color="rgba(255, 255, 255, 0.7)" style={{ transform: 'rotate(90deg)' }} />
          </div>

          <div className="card-brand-logo">VISA</div>
        </div>

        <div className="card-bottom-row">
          <div>
            <div className="card-balance-label">Total Balance</div>
            <div className="card-balance-num">$654,987.23</div>
          </div>

          <div>
            <div className="card-balance-label" style={{ textAlign: 'right' }}>Expired</div>
            <div className="card-expiry">07/28</div>
          </div>
        </div>
      </div>
    </div>
  );
}
