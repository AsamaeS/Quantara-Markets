/**
 * Left Navigation — Bloomberg-style collapsible sidebar
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, Brain, Newspaper, BarChart2,
  ChevronDown, ChevronRight, Globe, Bitcoin, Wheat, DollarSign,
  Scale, Target, Activity, Calendar, Briefcase, Shield, Link2,
  Radio, Cpu, Building2,
} from 'lucide-react';

const T = {
  bg1: '#131722', bg2: '#1E222D', bg3: '#2A2E39',
  border0: '#1E222D', border1: '#2A2E39',
  brand: '#2962FF', brandLt: '#5B8DEF',
  text0: '#FFF', text1: '#D1D4DC', text2: '#787B86', text3: '#50535E',
  up: '#26A69A',
};

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavSection {
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
  defaultOpen?: boolean;
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'MARKETS',
    icon: <TrendingUp size={12} />,
    defaultOpen: true,
    items: [
      { label: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={12} /> },
      { label: 'US Equities', path: '/markets/us', icon: <Building2 size={12} /> },
      { label: 'Casablanca Exchange', path: '/markets/casablanca', icon: <Globe size={12} /> },
      { label: 'Commodities', path: '/markets/commodities', icon: <Wheat size={12} /> },
      { label: 'ETFs', path: '/markets/etfs', icon: <BarChart2 size={12} /> },
      { label: 'Crypto & Blockchain', path: '/markets/crypto', icon: <Bitcoin size={12} /> },
      { label: 'Forex', path: '/markets/forex', icon: <DollarSign size={12} /> },
    ],
  },
  {
    label: 'AI INTELLIGENCE',
    icon: <Brain size={12} />,
    defaultOpen: true,
    items: [
      { label: 'AI Signals', path: '/intelligence', icon: <Target size={12} /> },
      { label: 'AI Investment Committee', path: '/ai-committee', icon: <Scale size={12} />, badge: 'LIVE' },
      { label: 'Sentiment Engine', path: '/sentiment', icon: <Activity size={12} /> },
      { label: 'Prediction Engine', path: '/prediction', icon: <Cpu size={12} /> },
    ],
  },
  {
    label: 'NEWS',
    icon: <Newspaper size={12} />,
    defaultOpen: false,
    items: [
      { label: 'Market Intelligence', path: '/news/market', icon: <Radio size={12} /> },
      { label: 'Economic Calendar', path: '/news/calendar', icon: <Calendar size={12} /> },
      { label: 'Earnings Events', path: '/news/earnings', icon: <DollarSign size={12} /> },
    ],
  },
  {
    label: 'ANALYTICS',
    icon: <BarChart2 size={12} />,
    defaultOpen: false,
    items: [
      { label: 'Portfolio', path: '/portfolio', icon: <Briefcase size={12} /> },
      { label: 'Risk Dashboard', path: '/risk', icon: <Shield size={12} /> },
      { label: 'Correlation Matrix', path: '/correlation', icon: <Link2 size={12} /> },
    ],
  },
];

interface LeftNavProps {
  onNavigate?: () => void;
}

export function LeftNav({ onNavigate }: LeftNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    NAV_SECTIONS.forEach((s) => { init[s.label] = s.defaultOpen ?? false; });
    return init;
  });
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const toggleSection = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <div style={{
      height: '100%',
      width: '220px',
      background: T.bg1,
      borderRight: `1px solid ${T.border0}`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div
        onClick={() => handleNavigate('/')}
        style={{
          padding: '14px 14px 12px',
          borderBottom: `1px solid ${T.border0}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
        }}
      >
        <div style={{
          width: '30px',
          height: '30px',
          background: T.brand,
          borderRadius: '5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 800,
          color: '#fff',
          fontFamily: 'JetBrains Mono, monospace',
          flexShrink: 0,
        }}>
          QM
        </div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 800, color: T.text0, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.5px' }}>
            QUANTARA
          </div>
          <div style={{ fontSize: '9px', color: T.text3, letterSpacing: '0.3px' }}>
            Markets Intelligence
          </div>
        </div>
      </div>

      {/* Nav Sections */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} style={{ marginBottom: '2px' }}>
            <button
              onClick={() => toggleSection(section.label)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                color: T.text3,
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = T.text2; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = T.text3; }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {section.icon}
                {section.label}
              </span>
              <span style={{ transition: 'transform 0.2s', transform: expanded[section.label] ? 'rotate(0)' : 'rotate(-90deg)' }}>
                <ChevronDown size={10} />
              </span>
            </button>

            {expanded[section.label] && (
              <div style={{ paddingLeft: '0px' }}>
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      style={{
                        width: '100%',
                        padding: '7px 12px 7px 22px',
                        background: isActive ? 'rgba(41,98,255,0.12)' : 'transparent',
                        border: 'none',
                        borderLeft: isActive ? `2px solid ${T.brand}` : '2px solid transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        color: isActive ? T.brandLt : T.text1,
                        fontSize: '11px',
                        fontWeight: isActive ? 600 : 400,
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = T.bg2;
                          e.currentTarget.style.color = T.text0;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = T.text1;
                        }
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        {item.icon}
                        {item.label}
                      </span>
                      {item.badge && (
                        <span style={{
                          background: 'rgba(38,166,154,0.15)',
                          color: T.up,
                          border: `1px solid rgba(38,166,154,0.3)`,
                          fontSize: '8px',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: '3px',
                          letterSpacing: '0.5px',
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
        padding: '10px 14px',
        borderTop: `1px solid ${T.border0}`,
        background: T.bg2,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
          <div className="live-dot" style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: T.up,
            boxShadow: `0 0 6px ${T.up}88`,
            flexShrink: 0,
          }} />
          <span style={{ fontSize: '9px', color: T.up, fontWeight: 700, letterSpacing: '0.8px' }}>
            LIVE MARKETS
          </span>
        </div>
        <div style={{ fontSize: '9px', color: T.text3, fontFamily: 'JetBrains Mono, monospace' }}>
          {time.toLocaleTimeString('en-US', { hour12: false })} UTC
        </div>
      </div>
    </div>
  );
}
