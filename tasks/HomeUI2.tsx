/**
 * Home Page — Quantara Markets
 * Hero section with AI-powered financial intelligence platform
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const T = {
  brand: '#2962FF', brandLt: '#5B8DEF', brandDk: '#1E4FCC',
  bg0: '#0C0E12', bg1: '#131722', bg2: '#1E222D', bg3: '#2A2E39',
  border0: '#1E222D', border1: '#2A2E39',
  text0: '#FFF', text1: '#D1D4DC', text2: '#787B86', text3: '#50535E',
  up: '#26A69A', dn: '#EF5350', warn: '#FF9800', info: '#42A5F5',
  fontSans: "'Inter','Segoe UI',system-ui,sans-serif",
  fontMono: "'JetBrains Mono','Fira Code',monospace",
  radius: '6px',
};

const TOP_ASSETS = [
  { symbol: 'TSLA', name: 'Tesla', price: 445.70, change: 2.34, changePct: 0.53 },
  { symbol: 'NVDA', name: 'NVIDIA', price: 225.80, change: -1.25, changePct: -0.55 },
  { symbol: 'AAPL', name: 'Apple', price: 299.23, change: 0.87, changePct: 0.29 },
  { symbol: 'BTC-USD', name: 'Bitcoin', price: 79659.23, change: 452.30, changePct: 0.57 },
  { symbol: 'XAUUSD', name: 'Gold', price: 2345.80, change: 8.50, changePct: 0.36 },
  { symbol: 'MASI', name: 'MASI Index', price: 12260.0, change: -15.20, changePct: -0.12 },
];

export default function HomeUI2() {
  const navigate = useNavigate();
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % TOP_ASSETS.length);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      minHeight: '100%',
      background: T.bg0,
      color: T.text1,
      fontFamily: T.fontSans,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top Bar */}
      <div style={{
        background: T.bg1,
        borderBottom: `1px solid ${T.border0}`,
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: T.brand,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 800,
            color: '#fff',
          }}>
            QM
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: T.text0, fontFamily: T.fontMono }}>
              QUANTARA MARKETS
            </div>
            <div style={{ fontSize: '11px', color: T.text3 }}>
              AI-Powered Financial Intelligence
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/ui2/dashboard')}
            style={{
              background: 'transparent',
              border: `1px solid ${T.border1}`,
              borderRadius: T.radius,
              padding: '8px 16px',
              color: T.text1,
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: T.fontSans,
            }}
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/ui2/intelligence')}
            style={{
              background: T.brand,
              border: 'none',
              borderRadius: T.radius,
              padding: '8px 18px',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: T.fontSans,
            }}
          >
            Launch Terminal
          </button>
        </div>
      </div>

      {/* Live Ticker */}
      <div style={{
        background: T.bg2,
        borderBottom: `1px solid ${T.border0}`,
        padding: '8px 24px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', gap: '32px', whiteSpace: 'nowrap', animation: 'ticker 20s linear infinite' }}>
          {TOP_ASSETS.concat(TOP_ASSETS).map((asset, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontFamily: T.fontMono, fontWeight: 700, color: T.text0 }}>
                {asset.symbol}
              </span>
              <span style={{ fontFamily: T.fontMono, color: T.text2 }}>
                ${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span style={{
                fontFamily: T.fontMono,
                color: asset.change >= 0 ? T.up : T.dn,
                fontWeight: 600,
              }}>
                {asset.change >= 0 ? '▲' : '▼'} {Math.abs(asset.changePct).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
      }}>
        <div style={{
          maxWidth: '900px',
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: `${T.brand}11`,
            border: `1px solid ${T.brand}44`,
            borderRadius: '999px',
            padding: '6px 16px',
            marginBottom: '24px',
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: T.up,
              boxShadow: `0 0 12px ${T.up}88`,
            }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: T.brandLt }}>
              LIVE MARKETS
            </span>
          </div>

          <h1 style={{
            fontSize: '52px',
            fontWeight: 800,
            color: T.text0,
            lineHeight: '1.1',
            marginBottom: '16px',
            fontFamily: T.fontMono,
          }}>
            AI-Powered
            <span style={{
              background: `linear-gradient(135deg, ${T.brand} 0%, ${T.brandLt} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}> Financial Intelligence</span>
          </h1>

          <p style={{
            fontSize: '18px',
            color: T.text2,
            maxWidth: '600px',
            margin: '0 auto 32px',
            lineHeight: '1.6',
          }}>
            Real-time market analysis, adversarial AI debate, and institutional-grade financial monitoring.
            Built for traders, researchers, and Moroccan market participants.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '48px' }}>
            <button
              onClick={() => navigate('/ui2/dashboard')}
              style={{
                background: T.brand,
                border: 'none',
                borderRadius: T.radius,
                padding: '14px 28px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: T.fontSans,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              🚀 Enter Terminal
            </button>
            <button
              onClick={() => navigate('/ui2/categorized-dashboard')}
              style={{
                background: 'transparent',
                border: `1px solid ${T.border1}`,
                borderRadius: T.radius,
                padding: '14px 28px',
                color: T.text1,
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: T.fontSans,
              }}
            >
              Watch Demo
            </button>
          </div>

          {/* Feature Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '16px',
            marginTop: '32px',
          }}>
            {[
              { icon: '🧠', title: 'AI Investment Committee', desc: 'Bull vs Bear vs Judge institutional-grade debate' },
              { icon: '⚡', title: 'Real-Time Signals', desc: 'Explainable AI signals with 60% sentiment / 40% momentum' },
              { icon: '🇲🇦', title: 'Moroccan Market', desc: 'MASI index & Casablanca Stock Exchange integration' },
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  background: T.bg1,
                  border: `1px solid ${T.border0}`,
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                }}
                onClick={() => navigate('/ui2/ai-committee')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = T.brand;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = T.border0;
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{f.icon}</div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: T.text0,
                  marginBottom: '4px',
                }}>
                  {f.title}
                </div>
                <div style={{ fontSize: '12px', color: T.text2 }}>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
