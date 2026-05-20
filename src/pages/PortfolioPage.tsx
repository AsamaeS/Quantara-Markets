/**
 * Portfolio Page Component
 * Displays portfolio holdings and performance
 */
import React, { useState } from 'react';
import { Briefcase, TrendingUp, TrendingDown, Plus, Trash2, PieChart, BarChart3, DollarSign, Clock, Activity } from 'lucide-react';

const T = {
  bg0: '#0C0E12', bg1: '#131722', bg2: '#1E222D', bg3: '#2A2E39',
  border0: 'rgba(255,255,255,0.06)', border1: 'rgba(255,255,255,0.08)',
  brand: '#2962FF', brandLt: '#5B8DEF',
  text0: '#FFFFFF', text1: '#D1D4DC', text2: '#787B86', text3: '#50535E',
  up: '#26A69A', upBg: 'rgba(38,166,154,0.10)',
  dn: '#EF5350', dnBg: 'rgba(239,83,80,0.10)',
};

interface Holding {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  category: string;
  purchaseDate: string;
}

const MOCK_HOLDINGS: Holding[] = [
  {
    id: '1',
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    shares: 50,
    avgPrice: 450.00,
    currentPrice: 1035.80,
    category: 'Tech',
    purchaseDate: '2024-01-15',
  },
  {
    id: '2',
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    shares: 25,
    avgPrice: 220.50,
    currentPrice: 282.40,
    category: 'Tech',
    purchaseDate: '2024-02-20',
  },
  {
    id: '3',
    symbol: 'BTC-USD',
    name: 'Bitcoin',
    shares: 1.5,
    avgPrice: 45000,
    currentPrice: 69420,
    category: 'Crypto',
    purchaseDate: '2024-01-05',
  },
  {
    id: '4',
    symbol: 'SPY',
    name: 'SPDR S&P 500 ETF',
    shares: 100,
    avgPrice: 480.00,
    currentPrice: 512.30,
    category: 'ETF',
    purchaseDate: '2024-01-01',
  },
  {
    id: '5',
    symbol: 'XAUUSD',
    name: 'Or',
    shares: 10,
    avgPrice: 2000,
    currentPrice: 2345.80,
    category: 'Commodities',
    purchaseDate: '2024-02-10',
  },
];

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>(MOCK_HOLDINGS);

  const totalValue = holdings.reduce((sum, h) => sum + (h.shares * h.currentPrice), 0);
  const totalCost = holdings.reduce((sum, h) => sum + (h.shares * h.avgPrice), 0);
  const totalPnL = totalValue - totalCost;
  const totalPnLPct = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  const categoryAllocations = holdings.reduce((acc, h) => {
    const value = h.shares * h.currentPrice;
    acc[h.category] = (acc[h.category] || 0) + value;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{
      height: '100%',
      background: T.bg0,
      color: T.text1,
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        background: T.bg1,
        borderBottom: `1px solid ${T.border0}`,
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: '9px', fontWeight: 700, color: T.text3, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            ANALYTICS
          </div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: T.text0, fontFamily: 'JetBrains Mono, monospace', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={14} color={T.brand} />
            PORTFOLIO
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <StatCard
              icon={<DollarSign size={18} />}
              label="Valeur Totale"
              value={totalValue}
              isCurrency
            />
            <StatCard
              icon={totalPnL >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              label="P&L Total"
              value={totalPnL}
              isCurrency
              isPnL
              pnlValue={totalPnLPct}
            />
            <StatCard
              icon={<BarChart3 size={18} />}
              label="Coût Total"
              value={totalCost}
              isCurrency
            />
            <StatCard
              icon={<Activity size={18} />}
              label="Nb. Actifs"
              value={holdings.length}
            />
          </div>

          <div style={{
            background: T.bg1,
            border: `1px solid ${T.border0}`,
            borderRadius: '8px',
            overflow: 'hidden',
            flex: 1,
          }}>
            <div style={{
              padding: '9px 12px',
              borderBottom: `1px solid ${T.border0}`,
              background: T.bg2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: T.text0, letterSpacing: '1px' }}>MES POSITIONS</span>
              <button style={{
                padding: '6px 12px',
                background: T.brand,
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <Plus size={10} />
                Ajouter
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr 80px 100px 100px 100px 60px',
              padding: '7px 12px',
              borderBottom: `1px solid ${T.border0}`,
              background: T.bg2,
            }}>
              {['ACTIF', 'NOM', 'Qté', 'Prix Moy.', 'Prix Actuel', 'P&L', ''].map((h, i) => (
                <div key={h} style={{
                  fontSize: '9px', fontWeight: 700,
                  color: T.text3, letterSpacing: '1px', textTransform: 'uppercase',
                  textAlign: i >= 2 ? 'right' : 'left',
                }}>{h}</div>
              ))}
            </div>

            <div style={{ overflow: 'auto' }}>
              {holdings.map((holding) => (
                <HoldingRow key={holding.id} holding={holding} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            background: T.bg1,
            border: `1px solid ${T.border0}`,
            borderRadius: '8px',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '9px 12px',
              borderBottom: `1px solid ${T.border0}`,
              background: T.bg2,
            }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: T.text0, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PieChart size={10} />
                ALLOCATION
              </span>
            </div>
            <div style={{ padding: '12px' }}>
              {Object.entries(categoryAllocations).map(([category, value]) => {
                const percentage = (value / totalValue) * 100;
                return (
                  <div key={category} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '10px' }}>
                      <span style={{ color: T.text2 }}>{category}</span>
                      <span style={{ color: T.text0, fontFamily: 'JetBrains Mono, monospace' }}>{percentage.toFixed(1)}%</span>
                    </div>
                    <div style={{
                      height: '6px',
                      background: T.bg2,
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${percentage}%`,
                        background: T.brand,
                        borderRadius: '3px',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{
            background: T.bg1,
            border: `1px solid ${T.border0}`,
            borderRadius: '8px',
            overflow: 'hidden',
            flex: 1,
          }}>
            <div style={{
              padding: '9px 12px',
              borderBottom: `1px solid ${T.border0}`,
              background: T.bg2,
            }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: T.text0, letterSpacing: '1px' }}>PERFORMANCE</span>
            </div>
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '200px', color: T.text3, fontSize: '11px' }}>
              <BarChart3 size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
              <span>Graphique de performance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, isCurrency, isPnL, pnlValue }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  isCurrency?: boolean;
  isPnL?: boolean;
  pnlValue?: number;
}) {
  const isPositive = value >= 0;
  const color = isPnL ? (isPositive ? T.up : T.dn) : T.text0;

  return (
    <div style={{
      background: T.bg1,
      border: `1px solid ${T.border0}`,
      borderRadius: '8px',
      padding: '14px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <span style={{ fontSize: '10px', color: T.text3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </span>
        <div style={{ color: isPnL ? color : T.brand }}>
          {icon}
        </div>
      </div>
      <div style={{
        fontSize: '20px',
        fontWeight: 800,
        color,
        fontFamily: 'JetBrains Mono, monospace',
        lineHeight: 1,
      }}>
        {isCurrency ? (
          <span>
            {value >= 0 ? '' : '-'}
            ${Math.abs(value).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        ) : (
          value.toLocaleString('fr-FR')
        )}
      </div>
      {isPnL && pnlValue !== undefined && (
        <div style={{
          fontSize: '11px',
          color,
          fontFamily: 'JetBrains Mono, monospace',
          marginTop: '4px',
        }}>
          {pnlValue >= 0 ? '+' : ''}{pnlValue.toFixed(2)}%
        </div>
      )}
    </div>
  );
}

function HoldingRow({ holding }: { holding: Holding }) {
  const [hovered, setHovered] = useState(false);

  const marketValue = holding.shares * holding.currentPrice;
  const costBasis = holding.shares * holding.avgPrice;
  const pnl = marketValue - costBasis;
  const pnlPct = (pnl / costBasis) * 100;
  const isPositive = pnl >= 0;

  const fmtPrice = (p: number) => {
    if (p >= 1000) return p.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (p < 10) return p.toFixed(4);
    return p.toFixed(2);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr 80px 100px 100px 100px 60px',
        padding: '10px 12px',
        borderBottom: `1px solid ${T.border0}`,
        background: hovered ? T.bg2 : 'transparent',
        transition: 'background 0.15s',
        alignItems: 'center',
      }}
    >
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 700, color: T.text0 }}>
        {holding.symbol}
      </div>

      <div style={{ fontSize: '11px', color: T.text2 }}>
        {holding.name}
      </div>

      <div style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: T.text1 }}>
        {holding.shares.toLocaleString('fr-FR')}
      </div>

      <div style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: T.text2 }}>
        ${fmtPrice(holding.avgPrice)}
      </div>

      <div style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: T.text0 }}>
        ${fmtPrice(holding.currentPrice)}
      </div>

      <div style={{ textAlign: 'right' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
          background: isPositive ? T.upBg : T.dnBg,
          borderRadius: '3px',
          padding: '2px 6px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '10px',
          fontWeight: 700,
          color: isPositive ? T.up : T.dn,
        }}>
          {isPositive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
          {isPositive ? '+' : ''}{pnlPct.toFixed(1)}%
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <button
          style={{
            background: 'transparent',
            border: 'none',
            color: hovered ? T.dn : T.text3,
            cursor: 'pointer',
            padding: '4px',
            opacity: hovered ? 1 : 0.4,
            transition: 'all 0.15s',
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
