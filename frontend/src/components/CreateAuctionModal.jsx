import React, { useState } from 'react';
import { X, PlusCircle, AlertCircle, Sparkles } from 'lucide-react';

const CATEGORIES = ['Electronics', 'Collectibles', 'Fine Art', 'Jewelry', 'Fashion', 'Home & Garden'];

const PRESET_IMAGES = [
  { label: 'Camera / Tech Workstation', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=700&auto=format&fit=crop&q=80' },
  { label: 'Vintage Chronograph Watch', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=700&auto=format&fit=crop&q=80' },
  { label: 'Fine Art Oil Painting', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=700&auto=format&fit=crop&q=80' },
  { label: 'Natural Colombian Emerald Ring', url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=700&auto=format&fit=crop&q=80' },
  { label: 'Hermès Designer Leather Bag', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=700&auto=format&fit=crop&q=80' },
];

export default function CreateAuctionModal({ onClose, onCreated }) {
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [startingPrice, setStartingPrice] = useState('');
  const [durationHours, setDurationHours] = useState('24');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!itemName.trim()) {
      setErrorMsg('Please enter an item name');
      return;
    }

    const price = parseFloat(startingPrice);
    if (!price || price <= 0) {
      setErrorMsg('Starting price must be greater than $0');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auctions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: itemName.trim(),
          description: description.trim(),
          category,
          startingPrice: price,
          durationHours: parseInt(durationHours, 10),
          imageUrl: imageUrl.trim() || PRESET_IMAGES[0].url,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to list item');
      }

      if (onCreated) onCreated(data);
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass-panel glass-modal-panel" style={{ maxWidth: 540, padding: 32 }}>
        <button className="modal-close-pill" onClick={onClose}>
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #ff6b35, #ff9f1c)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 18px var(--accent-orange-glow)' }}>
            <PlusCircle size={22} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>List New Auction Item</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              ML model will forecast final price ceiling upon listing
            </p>
          </div>
        </div>

        {errorMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f87171', fontSize: '0.85rem', marginBottom: 16 }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Item Name *
            </label>
            <input
              type="text"
              required
              className="bid-input"
              style={{ width: '100%', fontSize: '0.92rem', background: 'rgba(255, 255, 255, 0.04)' }}
              placeholder="e.g. Sony Alpha 7 IV Full-Frame Camera"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Category
              </label>
              <select
                className="bid-input"
                style={{ width: '100%', fontSize: '0.88rem', padding: '10px 12px', background: 'rgba(20, 26, 40, 0.95)' }}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} style={{ background: '#0f172a', color: '#fff' }}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Starting Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                className="bid-input"
                style={{ width: '100%', fontSize: '0.92rem', background: 'rgba(255, 255, 255, 0.04)' }}
                placeholder="100.00"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Duration
              </label>
              <select
                className="bid-input"
                style={{ width: '100%', fontSize: '0.88rem', padding: '10px 12px', background: 'rgba(20, 26, 40, 0.95)' }}
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
              >
                <option value="12" style={{ background: '#0f172a', color: '#fff' }}>12 Hours (Flash)</option>
                <option value="24" style={{ background: '#0f172a', color: '#fff' }}>24 Hours (Standard)</option>
                <option value="48" style={{ background: '#0f172a', color: '#fff' }}>48 Hours (2 Days)</option>
                <option value="72" style={{ background: '#0f172a', color: '#fff' }}>72 Hours (3 Days)</option>
                <option value="168" style={{ background: '#0f172a', color: '#fff' }}>7 Days (1 Week)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Preset Photo
              </label>
              <select
                className="bid-input"
                style={{ width: '100%', fontSize: '0.88rem', padding: '10px 12px', background: 'rgba(20, 26, 40, 0.95)' }}
                onChange={(e) => setImageUrl(e.target.value)}
              >
                {PRESET_IMAGES.map((img) => (
                  <option key={img.url} value={img.url} style={{ background: '#0f172a', color: '#fff' }}>
                    {img.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Item Description
            </label>
            <textarea
              className="bid-input"
              rows={3}
              style={{ width: '100%', fontSize: '0.88rem', resize: 'vertical', background: 'rgba(255, 255, 255, 0.04)' }}
              placeholder="Describe provenance, condition, verified authenticity..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
            <button type="button" className="glass-chip-btn" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ background: 'linear-gradient(135deg, #ff6b35, #ff8c42)', boxShadow: '0 4px 18px var(--accent-orange-glow)' }}
              disabled={submitting}
            >
              <Sparkles size={16} />
              <span>{submitting ? 'Forecasting & Listing...' : 'List Auction Now'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
