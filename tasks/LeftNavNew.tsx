/**
 * Left Navigation — Bloomberg-style
 * Categorized menu with expandable sections
 */
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const T = {
  brand: '#2962FF', brandLt: '#5B8DEF', brandDk: '#1E4FCC',
  bg0: '#0C0E12', bg1: '#131722', bg2: '#1E222D', bg3: '#2A2E39',
  border0: '#1E222D', border1: '#2A2E39',
  text0: '#FFF', text1: '#D1D4DC', text2: '#787B86', text3: '#50535E',
  up: '#26A69A', dn: '#EF5350', warn: '#FF9800',
  fontSans: "'Inter','Segoe UI',system-ui,sans-serif",
  fontMono: "'JetBrains Mono','Fira Code',monospace",
};

interface NavItem {
  label: string;
  path: string;
  icon?: string;
  badge?: string;
}

interface NavSection {
  label: string;
  icon: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'MARKETS',
    icon: '📈',
    items: [
      { label: 'Overview', path: '/ui2/dashboard', icon: '📊' },
      { label: 'US Equities', path: '/ui2/markets/us', icon: '🇺🇸' },
      { label: 'Casablanca Exchange', path: '/ui2/markets/casablanca', icon: '🇲🇦' },
      { label: 'Commodities', path: '/ui2/markets/commodities', icon: '🏭' },
      { label: 'ETFs', path: '/ui2/markets/etfs', icon: '📊' },
      { label: 'Crypto & Blockchain', path: '/ui2/markets/crypto', icon: '🔗' },
      { label: 'Forex', path: '/ui2/markets/forex', icon: '💱' },
    ],
  },
  {
    label: 'AI INTELLIGENCE',
    icon: '🧠',
    items: [
      { label: 'AI Signals', path: '/ui2/intelligence', icon: '🎯' },
      { label: 'AI Investment Committee', path: '/ui2/ai-committee', icon: '⚖️' },
      { label: 'Bull vs Bear Debate', path: '/ui2/categorized-dashboard', icon: '⚔️' },
      { label: 'Sentiment Engine', path: '/ui2/sentiment', icon: '📰' },
      { label: 'Prediction Engine', path: '/ui2/intelligence', icon: '🔍' },
    ],
  },
  {
    label: 'NEWS',
    icon: '📰',
    items: [
      { label: 'Bloomberg Markets', path: '/ui2/news/bloomberg', icon: '📊' },
      { label: 'Reuters Feed', path: '/ui2/news/reuters', icon: '📡' },
      { label: 'Economic Calendar', path: '/ui2/economic-calendar', icon: '📅' },
      { label: 'Earnings Events', path: '/ui2/news/earnings', icon: '💰' },
    ],
  },
  {
    label: 'ANALYTICS',
    icon: '📈',
    items: [
      { label: 'Portfolio', path: '/ui2/portfolio', icon: '💼' },
      { label: 'Risk Dashboard', path: '/ui2/risk', icon: '🛡️' },
      { label: 'Correlation Matrix', path: '/ui2/correlation', icon: '🔗' },
      { label: 'Historical Trends', path: '/ui2/trends', icon: '📉' },
    ],
  },
];

export function LeftNavNew() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'MARKETS': true,
    'AI INTELLIGENCE': true,
    'NEWS': false,
    'ANALYTICS': false,
  });

  const toggleSection = (label: string) => {
    setExpanded(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div style={{
      height: '100%',
      background: T.bg1,
      borderRight: `1px solid ${T.border0}`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      width: '240px',
    }}>
      {/* Logo */}
      <div style={{
        padding: '16px 16px 12px',
        borderBottom: `1px solid ${T.border0}`,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          background: T.brand,
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 800,
          color: '#fff',
        }}>
          QM
        </div>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 800, color: T.text0, fontFamily: T.fontMono }}>
            QUANTARA
          </div>
          <div style={{ fontSize: '10px', color: T.text3, letterSpacing: '0.3px' }}>
            Markets Intelligence
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} style={{ marginBottom: '4px' }}>
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.label)}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left',
                color: T.text2,
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px' }}>{section.icon}</span>
                {section.label}
              </span>
              <span style={{ fontSize: '10px', opacity: expanded[section.label] ? 1 : 0.6 }}>
                {expanded[section.label] ? '▼' : '▶'}
              </span>
            </button>

            {/* Section Items */}
            {expanded[section.label] && (
              <div style={{ paddingLeft: '8px' }}>
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      style={{
                        width: '100%',
                        padding: '8px 16px 8px 24px',
                        background: isActive ? `${T.brand}22` : 'transparent',
                        border: 'none',
                        borderLeft: isActive ? `3px solid ${T.brand}` : '3px solid transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: isActive ? T.brandLt : T.text1,
                        fontSize: '11px',
                        fontFamily: T.fontSans,
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = T.bg2;
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.icon && <span style={{ fontSize: '12px' }}>{item.icon}</span>}
                        {item.label}
                      </span>
                      {item.badge && (
                        <span style={{
                          background: T.brand,
                          color: '#fff',
                          fontSize: '9px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '10px',
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Status Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: `1px solid ${T.border0}`,
        background: T.bg2,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: T.up,
            boxShadow: `0 0 8px ${T.up}66`,
          }} />
          <span style={{ fontSize: '10px', color: T.text2, fontWeight: 600 }}>
            LIVE
          </span>
        </div>
        <div style={{ fontSize: '9px', color: T.text3 }}>
          Last update: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
