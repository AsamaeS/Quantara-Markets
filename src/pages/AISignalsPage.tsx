/**
 * AI Signals Page Component
 * Displays AI-generated trading signals and insights
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, TrendingUp, TrendingDown, Brain, AlertTriangle, CheckCircle, Clock, Zap, BarChart2 } from 'lucide-react';

const T = {
  bg0: '#0C0E12', bg1: '#131722', bg2: '#1E222D', bg3: '#2A2E39',
  border0: 'rgba(255,255,255,0.06)', border1: 'rgba(255,255,255,0.08)',
  brand: '#2962FF', brandLt: '#5B8DEF',
  text0: '#FFFFFF', text1: '#D1D4DC', text2: '#787B86', text3: '#50535E',
  up: '#26A69A', upBg: 'rgba(38,166,154,0.10)',
  dn: '#EF5350', dnBg: 'rgba(239,83,80,0.10)',
  warn: '#FF9800', warnBg: 'rgba(255,152,0,0.10)',
};

interface Signal {
  id: string;
  symbol: string;
  name: string;
  type: 'BUY' | 'SELL' | 'HOLD';
  strength: number;
  price: number;
  target: number;
  stopLoss: number;
  timeHorizon: string;
  confidence: number;
  timestamp: string;
  reasoning: string[];
}

const MOCK_SIGNALS: Signal[] = [
  {
    id: '1',
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    type: 'BUY',
    strength: 85,
    price: 282.40,
    target: 320.00,
    stopLoss: 265.00,
    timeHorizon: '4-6 semaines',
    confidence: 88,
    timestamp: 'Il y a 2h',
    reasoning: [
      'Momentum technique fort avec RSI > 60',
      'Volume de trading supérieur à la moyenne de 2.5x',
      'Analyse fondamentale positive sur les livraisons Q4',
      'Sentiment du marché en amélioration',
    ],
  },
  {
    id: '2',
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    type: 'HOLD',
    strength: 60,
    price: 1035.80,
    target: 1100.00,
    stopLoss: 980.00,
    timeHorizon: '2-3 mois',
    confidence: 72,
    timestamp: 'Il y a 5h',
    reasoning: [
      'Phase de consolidation après rallye historique',
      'Attente des résultats trimestriels',
      'Valorisation élevée mais justifiée par la croissance',
      'Maintien de la position longue',
    ],
  },
  {
    id: '3',
    symbol: 'BTC-USD',
    name: 'Bitcoin',
    type: 'BUY',
    strength: 78,
    price: 69420,
    target: 78000,
    stopLoss: 65000,
    timeHorizon: '3 mois',
    confidence: 82,
    timestamp: 'Il y a 1j',
    reasoning: [
      'Halving 2024 approche',
      'Adoption institutionnelle en hausse',
      'Flux positifs sur les ETF Bitcoin',
      'Technical breakout confirmé',
    ],
  },
  {
    id: '4',
    symbol: 'XAUUSD',
    name: 'Or',
    type: 'SELL',
    strength: 55,
    price: 2345.80,
    target: 2250.00,
    stopLoss: 2400.00,
    timeHorizon: '2 semaines',
    confidence: 65,
    timestamp: 'Il y a 3j',
    reasoning: [
      'Dollar américain en renforcement',
      'Rendements des obligations en hausse',
      'Résistance technique atteinte',
      'Prise de profits recommandée',
    ],
  },
];

export default function AISignalsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'BUY' | 'SELL' | 'HOLD'>('ALL');

  const filteredSignals = activeFilter === 'ALL'
    ? MOCK_SIGNALS
    : MOCK_SIGNALS.filter(s => s.type === activeFilter);

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
            <Brain size={14} color={T.brand} />
            AI SIGNALS
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['ALL', 'BUY', 'SELL', 'HOLD'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: `1px solid ${activeFilter === filter ? T.brand : T.border1}`,
                background: activeFilter === filter ? 'rgba(41,98,255,0.15)' : 'transparent',
                color: activeFilter === filter ? T.brandLt : T.text2,
                fontSize: '11px',
                fontWeight: activeFilter === filter ? 700 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '12px', alignContent: 'start' }}>
        {filteredSignals.map((signal) => (
          <SignalCard key={signal.id} signal={signal} onAnalyze={() => navigate('/ai-committee?asset=' + signal.symbol)} />
        ))}
      </div>
    </div>
  );
}

function SignalCard({ signal, onAnalyze }: { signal: Signal; onAnalyze: () => void }) {
  const [expanded, setExpanded] = useState(false);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BUY': return { color: T.up, bg: T.upBg, icon: <TrendingUp size={12} /> };
      case 'SELL': return { color: T.dn, bg: T.dnBg, icon: <TrendingDown size={12} /> };
      default: return { color: T.warn, bg: T.warnBg, icon: <Clock size={12} /> };
    }
  };

  const typeStyle = getTypeColor(signal.type);

  return (
    <div style={{
      background: T.bg1,
      border: `1px solid ${T.border0}`,
      borderRadius: '8px',
      overflow: 'hidden',
      transition: 'all 0.2s',
    }}>
      <div style={{
        padding: '12px 14px',
        borderBottom: `1px solid ${T.border0}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            padding: '6px 10px',
            borderRadius: '4px',
            background: typeStyle.bg,
            color: typeStyle.color,
            fontSize: '10px',
            fontWeight: 800,
            fontFamily: 'JetBrains Mono, monospace',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            {typeStyle.icon}
            {signal.type}
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: T.text0, fontFamily: 'JetBrains Mono, monospace' }}>
              {signal.symbol}
            </div>
            <div style={{ fontSize: '10px', color: T.text3 }}>{signal.name}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: T.text3 }}>Confiance</div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: T.brandLt, fontFamily: 'JetBrains Mono, monospace' }}>
            {signal.confidence}%
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <PriceBox label="Actuel" value={signal.price} color={T.text0} />
          <PriceBox label="Cible" value={signal.target} color={T.up} prefix="→" />
          <PriceBox label="Stop" value={signal.stopLoss} color={T.dn} prefix="↓" />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '10px', color: T.text3 }}>
            <span>Force du signal</span>
            <span>{signal.strength}%</span>
          </div>
          <div style={{
            height: '6px',
            background: T.bg2,
            borderRadius: '3px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${signal.strength}%`,
              background: `linear-gradient(90deg, ${signal.type === 'BUY' ? T.up : signal.type === 'SELL' ? T.dn : T.warn}, ${signal.type === 'BUY' ? '#2EC7B7' : signal.type === 'SELL' ? '#FF6A67' : '#FFB74D'})`,
              borderRadius: '3px',
              transition: 'width 0.5s',
            }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: T.text3 }}>
            <Clock size={10} />
            {signal.timeHorizon}
          </div>
          <div style={{ fontSize: '10px', color: T.text3 }}>
            {signal.timestamp}
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            width: '100%',
            padding: '8px',
            background: 'transparent',
            border: `1px solid ${T.border1}`,
            borderRadius: '4px',
            color: T.text2,
            fontSize: '10px',
            cursor: 'pointer',
            transition: 'all 0.15s',
            marginBottom: '10px',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.color = T.brandLt; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border1; e.currentTarget.style.color = T.text2; }}
        >
          {expanded ? 'Masquer le raisonnement' : 'Voir le raisonnement'}
        </button>

        {expanded && (
          <div style={{
            background: T.bg2,
            borderRadius: '4px',
            padding: '10px',
            marginBottom: '10px',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: T.text3, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Raisonnement IA
            </div>
            {signal.reasoning.map((reason, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px', fontSize: '11px', color: T.text1 }}>
                <CheckCircle size={14} color={T.up} style={{ flexShrink: 0 }} />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onAnalyze}
          style={{
            width: '100%',
            padding: '10px',
            background: T.brand,
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'opacity 0.15s',
          }}
        >
          <Zap size={12} />
          ANALYSER EN DÉTAIL
        </button>
      </div>
    </div>
  );
}

function PriceBox({ label, value, color, prefix }: { label: string; value: number; color: string; prefix?: string }) {
  return (
    <div style={{
      background: T.bg2,
      padding: '8px',
      borderRadius: '4px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '9px', color: T.text3, marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '12px', fontWeight: 700, color, fontFamily: 'JetBrains Mono, monospace' }}>
        {prefix && <span style={{ opacity: 0.7 }}>{prefix} </span>}
        {value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    </div>
  );
}
