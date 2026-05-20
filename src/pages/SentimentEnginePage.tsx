/**
 * Sentiment Engine Page Component
 * Displays market sentiment analysis from various sources
 */
import React, { useState } from 'react';
import { Activity, MessageSquare, TrendingUp, TrendingDown, Smile, Frown, Meh, Newspaper, Twitter, Globe, BarChart3 } from 'lucide-react';

const T = {
  bg0: '#0C0E12', bg1: '#131722', bg2: '#1E222D', bg3: '#2A2E39',
  border0: 'rgba(255,255,255,0.06)', border1: 'rgba(255,255,255,0.08)',
  brand: '#2962FF', brandLt: '#5B8DEF',
  text0: '#FFFFFF', text1: '#D1D4DC', text2: '#787B86', text3: '#50535E',
  up: '#26A69A', upBg: 'rgba(38,166,154,0.10)',
  dn: '#EF5350', dnBg: 'rgba(239,83,80,0.10)',
  neu: '#787B86', neuBg: 'rgba(120,123,134,0.10)',
};

interface SentimentData {
  symbol: string;
  name: string;
  overall: number;
  news: number;
  social: number;
  analyst: number;
  volatility: number;
  mentions: number;
  trend: 'up' | 'down' | 'neutral';
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  time: string;
  url: string;
}

const MOCK_SENTIMENTS: SentimentData[] = [
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    overall: 72,
    news: 68,
    social: 78,
    analyst: 70,
    volatility: 45,
    mentions: 12450,
    trend: 'up',
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    overall: 85,
    news: 82,
    social: 88,
    analyst: 85,
    volatility: 38,
    mentions: 8920,
    trend: 'up',
  },
  {
    symbol: 'BTC-USD',
    name: 'Bitcoin',
    overall: 65,
    news: 60,
    social: 72,
    analyst: 62,
    volatility: 68,
    mentions: 45600,
    trend: 'neutral',
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    overall: 58,
    news: 55,
    social: 62,
    analyst: 57,
    volatility: 22,
    mentions: 15800,
    trend: 'neutral',
  },
  {
    symbol: 'XAUUSD',
    name: 'Or',
    overall: 42,
    news: 38,
    social: 45,
    analyst: 43,
    volatility: 28,
    mentions: 6200,
    trend: 'down',
  },
];

const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Tesla dévoile de nouveaux véhicules électriques avec une autonomie record',
    source: 'Bloomberg',
    sentiment: 'positive',
    time: 'Il y a 2h',
    url: '#',
  },
  {
    id: '2',
    title: 'NVIDIA annonce des résultats trimestriels dépassant les attentes du marché',
    source: 'Reuters',
    sentiment: 'positive',
    time: 'Il y a 4h',
    url: '#',
  },
  {
    id: '3',
    title: 'La Fed maintient ses taux, les marchés réagissent positivement',
    source: 'CNBC',
    sentiment: 'positive',
    time: 'Il y a 6h',
    url: '#',
  },
  {
    id: '4',
    title: 'Les prix de l\'or baissent face à la force du dollar américain',
    source: 'Financial Times',
    sentiment: 'negative',
    time: 'Il y a 8h',
    url: '#',
  },
  {
    id: '5',
    title: 'Régulation crypto : de nouvelles propositions discutées au Congrès',
    source: 'CoinDesk',
    sentiment: 'neutral',
    time: 'Il y a 10h',
    url: '#',
  },
];

export default function SentimentEnginePage() {
  const [selectedAsset, setSelectedAsset] = useState<string>('TSLA');

  const selected = MOCK_SENTIMENTS.find(s => s.symbol === selectedAsset) || MOCK_SENTIMENTS[0];

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
            AI INTELLIGENCE
          </div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: T.text0, fontFamily: 'JetBrains Mono, monospace', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={14} color={T.brand} />
            SENTIMENT ENGINE
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '12px' }}>
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
              <span style={{ fontSize: '10px', fontWeight: 700, color: T.text0, letterSpacing: '1px' }}>ACTIFS</span>
            </div>
            <div>
              {MOCK_SENTIMENTS.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => setSelectedAsset(asset.symbol)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: selectedAsset === asset.symbol ? 'rgba(41,98,255,0.1)' : 'transparent',
                    border: 'none',
                    borderBottom: `1px solid ${T.border0}`,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { if (selectedAsset !== asset.symbol) e.currentTarget.style.background = T.bg2; }}
                  onMouseLeave={(e) => { if (selectedAsset !== asset.symbol) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: T.text0, fontFamily: 'JetBrains Mono, monospace' }}>
                        {asset.symbol}
                      </div>
                      <div style={{ fontSize: '10px', color: T.text3 }}>{asset.name}</div>
                    </div>
                    <SentimentBadge score={asset.overall} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            background: T.bg1,
            border: `1px solid ${T.border0}`,
            borderRadius: '8px',
            padding: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: T.text0, fontFamily: 'JetBrains Mono, monospace' }}>
                  {selected.symbol}
                </div>
                <div style={{ fontSize: '11px', color: T.text3 }}>{selected.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '9px', color: T.text3, marginBottom: '2px' }}>SENTIMENT GLOBAL</div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: getSentimentColor(selected.overall), fontFamily: 'JetBrains Mono, monospace' }}>
                  {selected.overall}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              <MetricCard icon={<Newspaper size={14} />} label="News" value={selected.news} />
              <MetricCard icon={<Twitter size={14} />} label="Social" value={selected.social} />
              <MetricCard icon={<BarChart3 size={14} />} label="Analystes" value={selected.analyst} />
              <MetricCard icon={<Activity size={14} />} label="Volatilité" value={selected.volatility} isInverse />
            </div>

            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: T.text3 }}>
                <Globe size={10} />
                {selected.mentions.toLocaleString('fr-FR')} mentions
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: T.text3 }}>
                {selected.trend === 'up' ? <TrendingUp size={10} color={T.up} /> : selected.trend === 'down' ? <TrendingDown size={10} color={T.dn} /> : <Meh size={10} color={T.neu} />}
                Tendance {selected.trend === 'up' ? 'haussière' : selected.trend === 'down' ? 'baissière' : 'neutre'}
              </div>
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
              <span style={{ fontSize: '10px', fontWeight: 700, color: T.text0, letterSpacing: '1px' }}>DERNIÈRES NOUVELLES</span>
            </div>
            <div style={{ overflow: 'auto' }}>
              {MOCK_NEWS.map((news) => (
                <NewsItemCard key={news.id} news={news} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SentimentBadge({ score }: { score: number }) {
  const color = getSentimentColor(score);
  const bg = score >= 60 ? T.upBg : score <= 40 ? T.dnBg : T.neuBg;

  return (
    <div style={{
      padding: '4px 8px',
      borderRadius: '4px',
      background: bg,
      color: color,
      fontSize: '11px',
      fontWeight: 700,
      fontFamily: 'JetBrains Mono, monospace',
    }}>
      {score}
    </div>
  );
}

function getSentimentColor(score: number) {
  if (score >= 60) return T.up;
  if (score <= 40) return T.dn;
  return T.neu;
}

function MetricCard({ icon, label, value, isInverse }: { icon: React.ReactNode; label: string; value: number; isInverse?: boolean }) {
  const color = isInverse ? (value <= 40 ? T.up : value >= 60 ? T.dn : T.neu) : getSentimentColor(value);

  return (
    <div style={{
      background: T.bg2,
      padding: '12px',
      borderRadius: '6px',
      textAlign: 'center',
    }}>
      <div style={{ color: color, marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>
        {icon}
      </div>
      <div style={{ fontSize: '18px', fontWeight: 700, color, fontFamily: 'JetBrains Mono, monospace', marginBottom: '2px' }}>
        {value}
      </div>
      <div style={{ fontSize: '9px', color: T.text3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </div>
    </div>
  );
}

function NewsItemCard({ news }: { news: NewsItem }) {
  const color = news.sentiment === 'positive' ? T.up : news.sentiment === 'negative' ? T.dn : T.neu;
  const icon = news.sentiment === 'positive' ? <Smile size={12} /> : news.sentiment === 'negative' ? <Frown size={12} /> : <Meh size={12} />;

  return (
    <div style={{
      padding: '12px',
      borderBottom: `1px solid ${T.border0}`,
      cursor: 'pointer',
      transition: 'background 0.15s',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.background = T.bg2; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{
          padding: '6px',
          borderRadius: '4px',
          background: news.sentiment === 'positive' ? T.upBg : news.sentiment === 'negative' ? T.dnBg : T.neuBg,
          color: color,
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '12px', color: T.text0, marginBottom: '4px', lineHeight: 1.4 }}>
            {news.title}
          </div>
          <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: T.text3 }}>
            <span>{news.source}</span>
            <span>{news.time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
