/**
 * Landing / Home Page — Quantara Markets
 * Professional hero with animated grid background, live ticker, feature cards
 */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Brain, Globe, TrendingUp, BarChart2, Shield, Activity } from 'lucide-react';
import { fetchMultipleQuotes } from '@/services/finnhub';
import { TICKER_ASSETS, MOCK_PRICES } from '@/types/market';

const T = {
  bg0: '#0C0E12', bg1: '#131722', bg2: '#1E222D', bg3: '#2A2E39',
  border0: 'rgba(255,255,255,0.06)', border1: 'rgba(255,255,255,0.10)',
  brand: '#2962FF', brandLt: '#5B8DEF',
  text0: '#FFFFFF', text1: '#D1D4DC', text2: '#787B86', text3: '#50535E',
  up: '#26A69A', dn: '#EF5350', warn: '#FF9800',
};

interface TickerItem {
  symbol: string;
  price: number;
  changePct: number;
}

const FEATURES = [
  {
    icon: <Brain size={20} color={T.brandLt} />,
    title: 'AI Investment Committee',
    desc: 'Bull vs. Bear vs. Judge adversarial debate powered by real-time data and rule-based AI',
    path: '/ai-committee',
    accent: T.brand,
  },
  {
    icon: <Zap size={20} color="#26A69A" />,
    title: 'Real-Time Signals',
    desc: '60% sentiment + 40% momentum composite scoring across 50+ global assets',
    path: '/intelligence',
    accent: T.up,
  },
  {
    icon: <Globe size={20} color="#FF9800" />,
    title: 'Moroccan Market',
    desc: 'MASI index and Casablanca Stock Exchange with dedicated analytics and news coverage',
    path: '/markets/casablanca',
    accent: T.warn,
  },
  {
    icon: <BarChart2 size={20} color={T.brandLt} />,
    title: 'Market Overview',
    desc: 'US equities, crypto, commodities, forex — live prices with sparkline charts',
    path: '/dashboard',
    accent: T.brandLt,
  },
  {
    icon: <Activity size={20} color="#EF5350" />,
    title: 'Sentiment Engine',
    desc: 'NewsAPI + Finnhub news processed for bullish/bearish sentiment scoring per asset',
    path: '/sentiment',
    accent: T.dn,
  },
  {
    icon: <Shield size={20} color="#26A69A" />,
    title: 'Risk Analytics',
    desc: 'Volatility metrics, risk flags, and macro headwinds synthesized into decision support',
    path: '/risk',
    accent: T.up,
  },
];

const STATS = [
  { value: '50+', label: 'Assets Tracked' },
  { value: '3', label: 'AI Agents' },
  { value: '5', label: 'Data Sources' },
  { value: '24/7', label: 'Live Markets' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [ticker, setTicker] = useState<TickerItem[]>([]);
  const [visible, setVisible] = useState(false);
  const fetchedRef = useRef(false);

  // Animate on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Init ticker with mocks then fetch real
  useEffect(() => {
    const mocks: TickerItem[] = TICKER_ASSETS.map((sym) => ({
      symbol: sym,
      price: MOCK_PRICES[sym]?.price ?? 0,
      changePct: MOCK_PRICES[sym]?.changePct ?? 0,
    }));
    setTicker(mocks);

    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetchMultipleQuotes(TICKER_ASSETS).then((quotes) => {
      setTicker((prev) =>
        prev.map((t) => {
          const q = quotes[t.symbol];
          if (!q || !q.c) return t;
          return { ...t, price: q.c, changePct: q.dp };
        })
      );
    });
  }, []);

  const fmtPrice = (p: number, sym: string) => {
    if (sym.includes('USD') && !sym.startsWith('BTC') && !sym.startsWith('ETH')) {
      return p.toFixed(4);
    }
    if (p >= 1000) return p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (p >= 100) return p.toFixed(2);
    return p.toFixed(2);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: T.bg0,
      color: T.text1,
      fontFamily: 'Inter, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Grid pattern background */}
      <div className="grid-pattern" style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Subtle radial glow */}
      <div style={{
        position: 'fixed',
        top: '-20%', left: '50%', transform: 'translateX(-50%)',
        width: '80vw', height: '60vh',
        background: 'radial-gradient(ellipse, rgba(41,98,255,0.05) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Top Bar */}
        <div style={{
          background: 'rgba(19,23,34,0.95)',
          borderBottom: `1px solid ${T.border0}`,
          padding: '0 24px',
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '30px', height: '30px', background: T.brand, borderRadius: '5px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 800, color: '#fff',
              fontFamily: 'JetBrains Mono, monospace',
            }}>QM</div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: T.text0, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.8px' }}>
                QUANTARA MARKETS
              </div>
              <div style={{ fontSize: '9px', color: T.text3, letterSpacing: '0.5px' }}>
                AI-POWERED FINANCIAL INTELLIGENCE
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                background: 'transparent',
                border: `1px solid ${T.border1}`,
                borderRadius: '4px',
                padding: '6px 14px',
                color: T.text1,
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.color = T.text0; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border1; e.currentTarget.style.color = T.text1; }}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/ai-committee')}
              style={{
                background: T.brand,
                border: 'none',
                borderRadius: '4px',
                padding: '6px 16px',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              AI Committee <ArrowRight size={11} />
            </button>
          </div>
        </div>

        {/* Live Ticker */}
        <div style={{
          background: T.bg2,
          borderBottom: `1px solid ${T.border0}`,
          height: '36px',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Left fade */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: '40px',
            background: `linear-gradient(to right, ${T.bg2}, transparent)`,
            zIndex: 2, pointerEvents: 'none',
          }} />
          {/* Right fade */}
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: '40px',
            background: `linear-gradient(to left, ${T.bg2}, transparent)`,
            zIndex: 2, pointerEvents: 'none',
          }} />

          {ticker.length > 0 && (
            <div className="ticker-track" style={{ alignItems: 'center', height: '36px' }}>
              {[...ticker, ...ticker].map((item, i) => (
                <div
                  key={i}
                  onClick={() => navigate('/dashboard')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0 24px',
                    cursor: 'pointer',
                    borderRight: `1px solid ${T.border0}`,
                    height: '36px',
                    minWidth: 'max-content',
                  }}
                >
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    fontSize: '11px',
                    color: T.text0,
                  }}>{item.symbol}</span>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11px',
                    color: T.text2,
                  }}>{fmtPrice(item.price, item.symbol)}</span>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '10px',
                    fontWeight: 600,
                    color: item.changePct >= 0 ? T.up : T.dn,
                  }}>
                    {item.changePct >= 0 ? '▲' : '▼'} {Math.abs(item.changePct).toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hero Section */}
        <div style={{
          padding: '80px 24px 60px',
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
          {/* Live badge */}
          <div
            className={visible ? 'animate-fade-in-up' : ''}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(38,166,154,0.08)',
              border: '1px solid rgba(38,166,154,0.25)',
              borderRadius: '999px',
              padding: '5px 14px',
              marginBottom: '28px',
              opacity: visible ? undefined : 0,
            }}
          >
            <div className="live-dot" style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: T.up, boxShadow: `0 0 10px ${T.up}88`,
            }} />
            <span style={{ fontSize: '10px', fontWeight: 700, color: T.up, letterSpacing: '1px' }}>
              LIVE MARKETS ACTIVE
            </span>
          </div>

          {/* Main headline */}
          <h1
            className={visible ? 'animate-fade-in-up delay-100' : ''}
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 800,
              color: T.text0,
              lineHeight: 1.1,
              marginBottom: '16px',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '-0.5px',
              opacity: visible ? undefined : 0,
            }}
          >
            AI-Powered
            <span style={{
              background: `linear-gradient(135deg, ${T.brand} 0%, ${T.brandLt} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>{' '}Financial Intelligence</span>
          </h1>

          <p
            className={visible ? 'animate-fade-in-up delay-200' : ''}
            style={{
              fontSize: '16px',
              color: T.text2,
              maxWidth: '580px',
              margin: '0 auto 36px',
              lineHeight: 1.7,
              opacity: visible ? undefined : 0,
            }}
          >
            Institutional-grade market analysis with adversarial AI debate, real-time data,
            and Moroccan market coverage. Built for investors, researchers, and finance professionals.
          </p>

          {/* CTA Buttons */}
          <div
            className={visible ? 'animate-fade-in-up delay-300' : ''}
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              marginBottom: '56px',
              flexWrap: 'wrap',
              opacity: visible ? undefined : 0,
            }}
          >
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                background: T.brand,
                border: 'none',
                borderRadius: '4px',
                padding: '12px 26px',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <TrendingUp size={14} /> Enter Terminal
            </button>
            <button
              onClick={() => navigate('/ai-committee')}
              style={{
                background: 'transparent',
                border: `1px solid ${T.border1}`,
                borderRadius: '4px',
                padding: '12px 26px',
                color: T.text1,
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.color = T.text0; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border1; e.currentTarget.style.color = T.text1; }}
            >
              <Brain size={14} /> AI Committee
            </button>
          </div>

          {/* Stats Bar */}
          <div
            className={visible ? 'animate-fade-in-up delay-400' : ''}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1px',
              background: T.border0,
              border: `1px solid ${T.border0}`,
              borderRadius: '8px',
              overflow: 'hidden',
              maxWidth: '600px',
              margin: '0 auto 64px',
              opacity: visible ? undefined : 0,
            }}
          >
            {STATS.map((stat, i) => (
              <div key={i} style={{
                background: T.bg1,
                padding: '16px 12px',
                textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '22px',
                  fontWeight: 800,
                  color: T.brand,
                  lineHeight: 1,
                  marginBottom: '4px',
                }}>{stat.value}</div>
                <div style={{ fontSize: '10px', color: T.text3, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Cards */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px 80px',
        }}>
          <div
            className={visible ? 'animate-fade-in-up delay-400' : ''}
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: T.text3,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              textAlign: 'center',
              marginBottom: '24px',
              opacity: visible ? undefined : 0,
            }}
          >
            Platform Capabilities
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '12px',
          }}>
            {FEATURES.map((f, i) => (
              <FeatureCard key={i} feature={f} index={i} visible={visible} onNavigate={() => navigate(f.path)} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          borderTop: `1px solid ${T.border0}`,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: T.bg1,
        }}>
          <span style={{ fontSize: '11px', color: T.text3 }}>
            Quantara Markets © 2026 — Institutional AI Financial Terminal
          </span>
          <span style={{
            fontSize: '10px',
            color: T.text3,
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            Data: Finnhub · Alpha Vantage · NewsAPI
          </span>
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  feature: typeof FEATURES[number];
  index: number;
  visible: boolean;
  onNavigate: () => void;
}

function FeatureCard({ feature, index, visible, onNavigate }: FeatureCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={visible ? `animate-fade-in-up delay-${Math.min((index + 5) * 100, 700)}` : ''}
      onClick={onNavigate}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.bg1,
        border: `1px solid ${hovered ? feature.accent + '44' : T.border0}`,
        borderRadius: '8px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        opacity: visible ? undefined : 0,
      }}
    >
      <div style={{
        width: '36px',
        height: '36px',
        background: feature.accent + '18',
        border: `1px solid ${feature.accent}33`,
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '12px',
      }}>
        {feature.icon}
      </div>
      <div style={{
        fontSize: '13px',
        fontWeight: 700,
        color: T.text0,
        marginBottom: '6px',
      }}>
        {feature.title}
      </div>
      <div style={{ fontSize: '12px', color: T.text2, lineHeight: 1.6 }}>
        {feature.desc}
      </div>
      <div style={{
        marginTop: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '11px',
        color: hovered ? feature.accent : T.text3,
        fontWeight: 600,
        transition: 'color 0.2s',
      }}>
        Explore <ArrowRight size={11} />
      </div>
    </div>
  );
}
