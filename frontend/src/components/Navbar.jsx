import React from 'react';
import { Gavel, Sparkles, PlusCircle } from 'lucide-react';

export default function Navbar({ onOpenCreate, isConnected }) {
  return (
    <header className="navbar">
      <div className="logo-group">
        <div className="logo-badge">
          <Gavel size={22} color="#fff" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="logo-text">BidPulse</span>
          <span className="logo-tag">ML Real-Time</span>
        </div>
      </div>

      <div className="nav-actions">
        <div className="status-pill" title={isConnected ? 'Live WebSocket active' : 'Connecting...'}>
          <div className="pulse-dot" style={{ backgroundColor: isConnected ? '#10b981' : '#f59e0b' }} />
          <span>{isConnected ? 'Real-Time Sync' : 'Reconnecting...'}</span>
        </div>

        <button className="btn-primary" onClick={onOpenCreate}>
          <PlusCircle size={18} />
          <span>List Item</span>
        </button>
      </div>
    </header>
  );
}
