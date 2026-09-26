import React from 'react';
import {
  LayoutGrid,
  Gavel,
  Sparkles,
  CreditCard,
  Settings,
  LogOut,
  Flame,
} from 'lucide-react';

export default function SidebarDock({ activeTab, setActiveTab, onOpenCreate }) {
  return (
    <aside className="sidebar-dock">
      {/* Top branding / active fire icon */}
      <div className="dock-group">
        <button
          className="dock-btn active"
          title="BidPulse Platform"
          onClick={() => setActiveTab('dashboard')}
          style={{ marginBottom: 8 }}
        >
          <Flame size={22} color="#fff" />
        </button>

        <button
          className={`dock-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
          title="Dashboard & Analytics"
        >
          <LayoutGrid size={20} />
        </button>

        <button
          className={`dock-btn ${activeTab === 'auctions' ? 'active' : ''}`}
          onClick={() => setActiveTab('auctions')}
          title="Live Auctions Feed"
        >
          <Gavel size={20} />
        </button>

        <button
          className={`dock-btn ${activeTab === 'ml' ? 'active' : ''}`}
          onClick={() => setActiveTab('ml')}
          title="ML Forecast Engine"
        >
          <Sparkles size={20} />
        </button>

        <button
          className={`dock-btn ${activeTab === 'wallet' ? 'active' : ''}`}
          onClick={() => setActiveTab('wallet')}
          title="VIP Bidder Wallet"
        >
          <CreditCard size={20} />
        </button>

        <button
          className={`dock-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Bottom exit icon */}
      <div className="dock-group">
        <button
          className="dock-btn"
          title="Log Out / Reset"
          onClick={() => window.location.reload()}
        >
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
}
