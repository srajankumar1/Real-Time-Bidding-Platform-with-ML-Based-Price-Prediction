import React, { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';

export default function MLForecastChart() {
  const [activePoint, setActivePoint] = useState(2); // Default to 'Mar'
  const [filter, setFilter] = useState('All Bids');

  // Spline points for Jan, Feb, Mar, Apr, May, Jun
  const dataPoints = [
    { month: 'Jan', starting: 380, liveBid: 490, mlPredict: 720 },
    { month: 'Feb', starting: 420, liveBid: 680, mlPredict: 890 },
    { month: 'Mar', starting: 350, liveBid: 950, mlPredict: 1250 },
    { month: 'Apr', starting: 510, liveBid: 820, mlPredict: 1100 },
    { month: 'May', starting: 480, liveBid: 710, mlPredict: 980 },
    { month: 'Jun', starting: 590, liveBid: 890, mlPredict: 1350 },
  ];

  // SVG viewBox coordinates: 0 0 600 180
  // Normalized points for Orange curve (ML Predicted / Peak curve)
  const orangePath = 'M 40,140 C 90,130 110,80 160,75 C 210,70 230,40 280,35 C 330,30 350,65 400,60 C 450,55 470,110 520,105 C 550,100 570,120 580,125';
  const orangeArea = `${orangePath} L 580,170 L 40,170 Z`;

  // Normalized points for White/Cyan curve (Live Bidding curve)
  const whitePath = 'M 40,150 C 90,145 120,110 170,105 C 220,100 240,75 290,70 C 340,65 370,120 420,125 C 470,130 490,140 540,135 L 580,140';
  const whiteArea = `${whitePath} L 580,170 L 40,170 Z`;

  // Key coordinates for hover points
  const coords = [
    { x: 40, y: 140 },
    { x: 160, y: 75 },
    { x: 280, y: 35 },
    { x: 400, y: 60 },
    { x: 520, y: 105 },
    { x: 580, y: 125 },
  ];

  const current = dataPoints[activePoint];
  const curPos = coords[activePoint];

  return (
    <div className="glass-panel statistic-card">
      <div className="card-head-row">
        <div>
          <h2 className="card-heading">Statistic</h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Real-Time Bids vs ML Forecasted Clearing Value
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Legend */}
          <div className="stat-legend">
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#38bdf8' }} />
              <span>Live Bids</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#ffffff' }} />
              <span>Starting Value</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#ff6b35' }} />
              <span>ML Forecast</span>
            </div>
          </div>

          {/* Time Filter Pill */}
          <div className="glass-pill" style={{ padding: '6px 14px', fontSize: '0.78rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <span>All Auctions</span>
            <ChevronDown size={14} color="var(--text-muted)" />
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="chart-container">
        <svg className="chart-svg" viewBox="0 0 620 180" preserveAspectRatio="none">
          <defs>
            <linearGradient id="orangeGlowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ff6b35" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="whiteGlowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>

            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          <line x1="40" y1="160" x2="580" y2="160" stroke="rgba(255, 255, 255, 0.06)" strokeDasharray="4 4" />
          <line x1="40" y1="100" x2="580" y2="100" stroke="rgba(255, 255, 255, 0.06)" strokeDasharray="4 4" />
          <line x1="40" y1="40" x2="580" y2="40" stroke="rgba(255, 255, 255, 0.06)" strokeDasharray="4 4" />

          {/* Area fills */}
          <path d={orangeArea} fill="url(#orangeGlowGrad)" />
          <path d={whiteArea} fill="url(#whiteGlowGrad)" />

          {/* Spline Lines */}
          <path
            d={whitePath}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.85"
          />

          <path
            d={orangePath}
            fill="none"
            stroke="#ff6b35"
            strokeWidth="3.2"
            strokeLinecap="round"
            filter="url(#glow)"
          />

          {/* Interactive clickable anchor points */}
          {coords.map((pt, idx) => (
            <g
              key={idx}
              style={{ cursor: 'pointer' }}
              onClick={() => setActivePoint(idx)}
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={activePoint === idx ? 7 : 4}
                fill="#ffffff"
                stroke="#ff6b35"
                strokeWidth={activePoint === idx ? 3.5 : 2}
                filter={activePoint === idx ? 'url(#glow)' : undefined}
              />
            </g>
          ))}
        </svg>

        {/* Floating Glass Tooltip matching reference screenshot */}
        <div
          className="chart-tooltip"
          style={{
            left: `${(curPos.x / 620) * 100}%`,
            top: `${(curPos.y / 180) * 100}%`,
          }}
        >
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{current.month} Forecast</div>
          <div style={{ color: '#ff6b35', fontSize: '0.85rem' }}>${current.mlPredict.toFixed(2)}</div>
        </div>
      </div>

      {/* X-Axis Months */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 30px', marginTop: 14 }}>
        {dataPoints.map((pt, idx) => (
          <span
            key={pt.month}
            onClick={() => setActivePoint(idx)}
            style={{
              fontSize: '0.78rem',
              fontWeight: activePoint === idx ? 700 : 500,
              color: activePoint === idx ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
          >
            {pt.month}
          </span>
        ))}
      </div>
    </div>
  );
}
