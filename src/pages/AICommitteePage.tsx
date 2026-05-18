/**
 * AI Investment Committee Page
 * Flagship adversarial debate UI — Bull | Judge | Bear layout
 * with live confidence meters, news timeline, risk flags
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw, AlertTriangle, TrendingUp, TrendingDown, Scale,
  Newspaper, ChevronDown, CheckCircle, XCircle, Clock,
  Activity, BarChart2,
} from 'lucide-react';
import { fetchFinnhubQuote, fetchFinnhubNews } from '@/services/finnhub';
import { fetchNewsForAsset } from '@/services/newsapi';
import { runDebate, DebateResult } from '@/services/debateEngine';
import { COMMITTEE_ASSETS, MOCK_PRICES } from '@/types/market';

const T = {
  bg0: '#0C0E12', bg1: '#131722', bg2: '#1E222D', bg3: '#2A2E39',
  border0: 'rgba(255,255,255,0.06)', border1: 'rgba(255,255,255,0.08)',
  brand: '#2962FF', brandLt: '#5B8DEF',
  text0: '#FFFFFF', text1: '#D1D4DC', text2: '#787B86', text3: '#50535E',
  up: '#26A69A', upBg: 'rgba(38,166,154,0.10)', upBorder: 'rgba(38,166,154,0.25)',
  dn: '#EF5350', dnBg: 'rgba(239,83,80,0.10)', dnBorder: 'rgba(239,83,80,0.25)',
  warn: '#FF9800', warnBg: 'rgba(255,152,0,0.10)', warnBorder: 'rgba(255,152,0,0.25)',
};

const VERDICT_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  'CONVICTION BUY':  { color: T.up, bg: T.upBg, border: T.upBorder, label: 'CONVICTION BUY' },
  'BUY':             { color: T.up, bg: T.upBg, border: T.upBorder, label: 'BUY' },
  'BUY WITH CAUTION':{ color: '#CDDC39', bg: 'rgba(205,220,57,0.10)', border: 'rgba(205,220,57,0.25)', label: 'BUY WITH CAUTION' },
  'HOLD':            { color: T.warn, bg: T.warnBg, border: T.warnBorder, label: 'HOLD' },
  'AVOID':           { color: T.dn, bg: T.dnBg, border: T.dnBorder, label: 'AVOID' },
  'CONVICTION AVOID':{ color: T.dn, bg: T.dnBg, border: T.dnBorder, label: 'CONVICTION AVOID' },
  'INSUFFICIENT DATA':{ color: T.text3, bg: 'rgba(80,83,94,0.10)', border: 'rgba(80,83,94,0.25)', label: 'INSUFFICIENT DATA' },
};

type DebatePhase = 'idle' | 'fetching' | 'analyzing' | 'deliberating' | 'done';

export default function AICommitteePage() {
  const navigate = useNavigate();
  const [asset, setAsset] = useState('TSLA');
  const [debate, setDebate] = useState<DebateResult | null>(null);
  const [phase, setPhase] = useState<DebatePhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [livePrice, setLivePrice] = useState<{ price: number; change: number; changePct: number } | null>(null);
  const [newsItems, setNewsItems] = useState<Array<{ headline: string; source: string; time: string; sentiment: 'positive' | 'negative' | 'neutral'; url?: string }>>([]);
  const [roundKey, setRoundKey] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const runFullDebate = useCallback(async (sym: string) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setError(null);
    setDebate(null);
    setNewsItems([]);

    setPhase('fetching');
    await sleep(400);

    // Parallel fetches
    const [quote, finnhubNews, newsApiArticles] = await Promise.all([
      fetchFinnhubQuote(sym).catch(() => null),
      fetchFinnhubNews(sym, 15).catch(() => []),
      fetchNewsForAsset(sym, 10).catch(() => []),
    ]);

    // Merge news for display
    const displayed = [
      ...finnhubNews.slice(0, 8).map((n) => ({
        headline: n.headline,
        source: n.source,
        time: new Date(n.datetime * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        sentiment: inferSentimentSimple(n.headline) as 'positive' | 'negative' | 'neutral',
        url: n.url,
      })),
      ...newsApiArticles.slice(0, 5).map((a) => ({
        headline: a.title,
        source: a.source.name,
        time: new Date(a.publishedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        sentiment: (a.sentiment || 'neutral') as 'positive' | 'negative' | 'neutral',
        url: a.url,
      })),
    ].slice(0, 10);

    setNewsItems(displayed);

    // Set live price
    if (quote && quote.c > 0) {
      setLivePrice({ price: quote.c, change: quote.d, changePct: quote.dp });
    } else {
      const mock = MOCK_PRICES[sym];
      if (mock) setLivePrice({ price: mock.price, change: mock.change, changePct: mock.changePct });
    }

    setPhase('analyzing');
    await sleep(600);

    setPhase('deliberating');
    await sleep(700);

    try {
      const result = await runDebate({
        asset: sym,
        quote: quote || null,
        finnhubNews,
        newsApiArticles,
      });
      setDebate(result);
      setPhase('done');
      setRoundKey((k) => k + 1);
    } catch {
      setError('Debate engine encountered an error. Please retry.');
      setPhase('idle');
    }
  }, []);

  useEffect(() => {
    runFullDebate(asset);
  }, [asset, runFullDebate]);

  const handleAssetChange = (sym: string) => {
    setAsset(sym);
  };

  const phaseLabel: Record<DebatePhase, string> = {
    idle: 'Ready',
    fetching: 'Fetching live data...',
    analyzing: 'Analyzing sentiment & momentum...',
    deliberating: 'Agents deliberating...',
    done: 'Debate complete',
  };

  const isLoading = phase !== 'idle' && phase !== 'done';

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
      {/* Header Bar */}
      <div style={{
        background: T.bg1,
        borderBottom: `1px solid ${T.border0}`,
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'transparent', border: 'none',
              color: T.text3, fontSize: '11px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: 0, transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = T.text1; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = T.text3; }}
          >
            ← Home
          </button>
          <div style={{ width: '1px', height: '20px', background: T.border0 }} />
          <div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: T.text3, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              QUANTARA MARKETS
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: T.text0, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.5px' }}>
              AI INVESTMENT COMMITTEE
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Live price badge */}
          {livePrice && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: T.bg2, border: `1px solid ${T.border0}`,
              borderRadius: '4px', padding: '5px 10px',
            }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 700, color: T.text0 }}>
                {asset}
              </span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: T.text2 }}>
                {formatPrice(livePrice.price, asset)}
              </span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', fontWeight: 700, color: livePrice.changePct >= 0 ? T.up : T.dn }}>
                {livePrice.changePct >= 0 ? '▲' : '▼'} {Math.abs(livePrice.changePct).toFixed(2)}%
              </span>
            </div>
          )}

          {/* Asset selector */}
          <div style={{ position: 'relative' }}>
            <select
              value={asset}
              onChange={(e) => handleAssetChange(e.target.value)}
              disabled={isLoading}
              style={{
                background: T.bg2, border: `1px solid ${T.border1}`,
                borderRadius: '4px', padding: '6px 28px 6px 10px',
                color: T.text0, fontSize: '11px', fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 700, outline: 'none', cursor: 'pointer',
                appearance: 'none', WebkitAppearance: 'none',
              }}
            >
              {COMMITTEE_ASSETS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <ChevronDown size={10} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: T.text3, pointerEvents: 'none' }} />
          </div>

          <button
            onClick={() => runFullDebate(asset)}
            disabled={isLoading}
            style={{
              background: isLoading ? T.bg3 : T.brand,
              border: 'none', borderRadius: '4px',
              padding: '6px 14px', color: '#fff',
              fontSize: '11px', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '5px',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.opacity = '0.88'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = isLoading ? '0.7' : '1'; }}
          >
            <RefreshCw size={11} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Deliberating...' : 'Rerun Debate'}
          </button>
        </div>
      </div>

      {/* Phase indicator */}
      {isLoading && (
        <div style={{
          background: 'rgba(41,98,255,0.06)',
          borderBottom: `1px solid rgba(41,98,255,0.15)`,
          padding: '7px 16px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: T.brand, animation: 'blink 1s ease-in-out infinite',
          }} />
          <span style={{ fontSize: '11px', color: T.brandLt }}>
            {phaseLabel[phase]}
          </span>
          <div style={{ flex: 1, height: '2px', background: T.bg3, borderRadius: '1px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              background: T.brand,
              borderRadius: '1px',
              width: phase === 'fetching' ? '30%' : phase === 'analyzing' ? '60%' : '85%',
              transition: 'width 0.5s ease',
            }} />
          </div>
          <span style={{ fontSize: '10px', color: T.text3, fontFamily: 'JetBrains Mono, monospace' }}>
            {phase === 'fetching' ? 'Round 1' : phase === 'analyzing' ? 'Round 2' : 'Final Verdict'}
          </span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{
          margin: '16px', background: T.dnBg, border: `1px solid ${T.dnBorder}`,
          borderRadius: '6px', padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <AlertTriangle size={14} color={T.dn} />
          <span style={{ fontSize: '12px', color: T.dn }}>{error}</span>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
        {/* Debate header row */}
        {debate && (
          <RoundIndicator round={debate.round} />
        )}

        {/* 3-Column Debate */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 280px 1fr',
          gap: '12px',
          marginBottom: '12px',
        }}>
          {/* Bull Panel */}
          <AgentPanel
            side="bull"
            data={debate?.bull ?? null}
            loading={isLoading}
            animKey={roundKey}
          />

          {/* Judge Panel */}
          <JudgePanel
            data={debate?.judge ?? null}
            loading={isLoading}
            animKey={roundKey}
          />

          {/* Bear Panel */}
          <AgentPanel
            side="bear"
            data={debate?.bear ?? null}
            loading={isLoading}
            animKey={roundKey}
          />
        </div>

        {/* News Timeline */}
        <NewsTimeline items={newsItems} loading={isLoading} asset={asset} />
      </div>
    </div>
  );
}

// ─── Round Indicator ──────────────────────────────────────────────────────────

function RoundIndicator({ round }: { round: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      marginBottom: '10px', padding: '0 2px',
    }}>
      {['Round 1', 'Round 2', 'Final Verdict'].map((r, i) => (
        <React.Fragment key={r}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            opacity: i < round ? 1 : 0.35,
          }}>
            <div style={{
              width: '16px', height: '16px', borderRadius: '50%',
              background: i < round ? T.brand : T.bg3,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '8px', fontWeight: 700, color: '#fff',
            }}>{i + 1}</div>
            <span style={{ fontSize: '10px', color: i < round ? T.text1 : T.text3, fontWeight: i < round ? 600 : 400 }}>
              {r}
            </span>
          </div>
          {i < 2 && (
            <div style={{
              flex: 0,
              width: '24px', height: '1px',
              background: i < round - 1 ? T.brand : T.bg3,
              transition: 'background 0.3s',
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Agent Panel (Bull / Bear) ────────────────────────────────────────────────

function AgentPanel({ side, data, loading, animKey }: {
  side: 'bull' | 'bear';
  data: DebateResult['bull'] | null;
  loading: boolean;
  animKey: number;
}) {
  const isBull = side === 'bull';
  const color = isBull ? T.up : T.dn;
  const bg = isBull ? T.upBg : T.dnBg;
  const border = isBull ? T.upBorder : T.dnBorder;
  const icon = isBull ? <TrendingUp size={16} color={color} /> : <TrendingDown size={16} color={color} />;
  const label = isBull ? 'BULL AGENT' : 'BEAR AGENT';
  const role = isBull ? 'Optimist · Catalyst Hunter' : 'Pessimist · Risk Analyst';
  const items = isBull ? data?.catalysts : data?.risks;
  const itemLabel = isBull ? 'CATALYSTS' : 'KEY RISKS';
  const conf = data?.overallConfidence ?? 0;

  if (loading) return <AgentSkeleton />;

  return (
    <div className="animate-fade-in" key={`${side}-${animKey}`} style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: '8px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
    }}>
      {/* Agent header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: color + '22', border: `1px solid ${color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {icon}
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: T.text0, letterSpacing: '0.5px' }}>{label}</div>
            <div style={{ fontSize: '10px', color: T.text3 }}>{role}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '22px', fontWeight: 800, color, lineHeight: 1 }}>
            {(conf * 100).toFixed(0)}%
          </div>
          <div style={{ fontSize: '9px', color: T.text3, letterSpacing: '0.5px' }}>CONVICTION</div>
        </div>
      </div>

      {/* Confidence bar */}
      <ConfidenceBar value={conf} color={color} animKey={animKey} />

      {/* Thesis */}
      <div style={{ fontSize: '12px', color: T.text1, lineHeight: 1.65 }}>
        {data?.synthesis || '—'}
      </div>

      {/* Sub-agent arguments */}
      <div>
        <div style={{ fontSize: '9px', fontWeight: 700, color: T.text3, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '8px' }}>
          AGENT ARGUMENTS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {data?.arguments.map((arg, i) => (
            <SubAgentRow key={i} arg={arg} color={color} animKey={animKey} index={i} />
          ))}
        </div>
      </div>

      {/* Catalysts / Risks */}
      {items && items.length > 0 && (
        <div>
          <div style={{ fontSize: '9px', fontWeight: 700, color, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '8px' }}>
            {itemLabel}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {items.map((item, i) => (
              <span key={i} style={{
                background: T.bg3,
                border: `1px solid ${color}28`,
                borderRadius: '10px',
                padding: '3px 9px',
                fontSize: '10px',
                color: T.text1,
              }}>{item}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SubAgentRow({ arg, color, animKey, index }: {
  arg: { agentType: string; content: string; confidence: number };
  color: string; animKey: number; index: number;
}) {
  const icons: Record<string, React.ReactNode> = {
    news: <Newspaper size={10} />,
    quant: <Activity size={10} />,
    macro: <BarChart2 size={10} />,
  };
  const labels: Record<string, string> = {
    news: 'News Agent', quant: 'Quant Agent', macro: 'Macro Agent',
  };

  return (
    <div style={{
      background: T.bg2,
      border: `1px solid ${T.border0}`,
      borderRadius: '5px',
      padding: '8px 10px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: T.text3, fontSize: '9px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
          {icons[arg.agentType]}
          {labels[arg.agentType] || arg.agentType}
        </div>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', fontWeight: 700, color }}>
          {(arg.confidence * 100).toFixed(0)}%
        </span>
      </div>
      <div style={{ fontSize: '11px', color: T.text2, lineHeight: 1.5 }}>
        {arg.content.slice(0, 100)}{arg.content.length > 100 ? '...' : ''}
      </div>
    </div>
  );
}

// ─── Judge Panel ──────────────────────────────────────────────────────────────

function JudgePanel({ data, loading, animKey }: {
  data: DebateResult['judge'] | null;
  loading: boolean;
  animKey: number;
}) {
  if (loading) return <JudgeSkeleton />;

  const vc = data ? (VERDICT_CONFIG[data.verdict] ?? VERDICT_CONFIG['HOLD']) : null;

  return (
    <div className="animate-fade-in" key={`judge-${animKey}`} style={{
      background: T.bg1,
      border: `1px solid ${T.border1}`,
      borderRadius: '8px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      alignItems: 'center',
    }}>
      {/* Judge icon */}
      <div style={{
        width: '44px', height: '44px', borderRadius: '50%',
        background: 'rgba(41,98,255,0.15)',
        border: '1px solid rgba(41,98,255,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Scale size={20} color={T.brandLt} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '12px', fontWeight: 800, color: T.text0, letterSpacing: '0.5px' }}>JUDGE AGENT</div>
        <div style={{ fontSize: '10px', color: T.text3 }}>Investment Committee Chair</div>
      </div>

      {/* Verdict */}
      {vc && data && (
        <div className="verdict-reveal" key={`verdict-${animKey}`} style={{
          background: vc.bg,
          border: `1px solid ${vc.border}`,
          borderRadius: '6px',
          padding: '14px',
          textAlign: 'center',
          width: '100%',
        }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: T.text3, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '6px' }}>
            FINAL VERDICT
          </div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '16px',
            fontWeight: 800,
            color: vc.color,
            letterSpacing: '0.5px',
            marginBottom: '8px',
          }}>
            {vc.label}
          </div>
          <ConfidenceBar value={data.confidence} color={vc.color} animKey={animKey} />
          <div style={{ marginTop: '8px', fontSize: '10px', color: T.text2 }}>
            Confidence: <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: vc.color }}>{(data.confidence * 100).toFixed(0)}%</span>
          </div>
        </div>
      )}

      {/* Rationale */}
      {data && (
        <div style={{ width: '100%' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: T.text3, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '6px' }}>
            RATIONALE
          </div>
          <div style={{ fontSize: '11px', color: T.text1, lineHeight: 1.65 }}>
            {data.rationale}
          </div>
        </div>
      )}

      {/* Risk flags */}
      {data && data.riskFlags.length > 0 && (
        <div style={{ width: '100%' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: T.text3, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '6px' }}>
            RISK FLAGS
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {data.riskFlags.map((f, i) => (
              <span key={i} style={{
                background: T.warnBg,
                border: `1px solid ${T.warnBorder}`,
                borderRadius: '10px',
                padding: '3px 9px',
                fontSize: '10px',
                color: T.warn,
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                <AlertTriangle size={9} /> {f}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Confidence Bar ───────────────────────────────────────────────────────────

function ConfidenceBar({ value, color, animKey }: { value: number; color: string; animKey: number }) {
  const pct = Math.min(100, Math.max(0, value * 100));

  return (
    <div style={{
      background: T.bg3,
      height: '7px',
      borderRadius: '4px',
      overflow: 'hidden',
      width: '100%',
    }}>
      <div
        key={`bar-${animKey}`}
        style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: '4px',
          animation: 'barFill 1s ease-out forwards',
          ['--target-width' as string]: `${pct}%`,
        }}
      />
    </div>
  );
}

// ─── News Timeline ────────────────────────────────────────────────────────────

function NewsTimeline({ items, loading, asset }: {
  items: Array<{ headline: string; source: string; time: string; sentiment: 'positive' | 'negative' | 'neutral'; url?: string }>;
  loading: boolean;
  asset: string;
}) {
  const sentColor: Record<string, string> = {
    positive: T.up, negative: T.dn, neutral: T.text3,
  };
  const sentLabel: Record<string, string> = {
    positive: 'BULLISH', negative: 'BEARISH', neutral: 'NEUTRAL',
  };
  const sentIcon: Record<string, React.ReactNode> = {
    positive: <CheckCircle size={9} />,
    negative: <XCircle size={9} />,
    neutral: <Clock size={9} />,
  };

  return (
    <div style={{
      background: T.bg1,
      border: `1px solid ${T.border0}`,
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '10px 14px',
        borderBottom: `1px solid ${T.border0}`,
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <Newspaper size={13} color={T.text3} />
        <span style={{ fontSize: '11px', fontWeight: 700, color: T.text0 }}>NEWS IMPACT TIMELINE</span>
        <span style={{ fontSize: '10px', color: T.text3 }}>— {asset} recent headlines feeding the debate</span>
        {loading && (
          <div style={{ marginLeft: 'auto', width: '12px', height: '12px', borderRadius: '50%', border: `2px solid ${T.brand}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        )}
      </div>

      {loading ? (
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-shimmer" style={{ height: '44px', borderRadius: '4px' }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: T.text3, fontSize: '12px' }}>
          No recent news found for {asset}. API may be rate-limited.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {items.map((item, i) => (
            <div
              key={i}
              className="animate-fade-in"
              style={{
                padding: '10px 14px',
                borderBottom: i < items.length - 1 ? `1px solid ${T.border0}` : 'none',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                transition: 'background 0.15s',
                animationDelay: `${i * 60}ms`,
                cursor: item.url ? 'pointer' : 'default',
              }}
              onClick={() => item.url && window.open(item.url, '_blank')}
              onMouseEnter={(e) => { e.currentTarget.style.background = T.bg2; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: '3px',
                color: sentColor[item.sentiment],
                fontSize: '8px', fontWeight: 700,
                letterSpacing: '0.8px',
                minWidth: '64px',
                marginTop: '2px',
              }}>
                {sentIcon[item.sentiment]}
                {sentLabel[item.sentiment]}
              </div>
              <div style={{ flex: 1, fontSize: '11px', color: T.text1, lineHeight: 1.5 }}>
                {item.headline}
              </div>
              <div style={{
                fontSize: '10px', color: T.text3,
                fontFamily: 'JetBrains Mono, monospace',
                minWidth: '80px', textAlign: 'right',
              }}>
                <div>{item.source}</div>
                <div style={{ color: T.text3 }}>{item.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Skeleton Loaders ─────────────────────────────────────────────────────────

function AgentSkeleton() {
  return (
    <div style={{ background: T.bg1, border: `1px solid ${T.border0}`, borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {[60, 100, 30, 80, 50, 70].map((w, i) => (
        <div key={i} className="animate-shimmer" style={{ height: i === 0 ? '36px' : '14px', width: `${w}%`, borderRadius: '4px' }} />
      ))}
    </div>
  );
}

function JudgeSkeleton() {
  return (
    <div style={{ background: T.bg1, border: `1px solid ${T.border0}`, borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
      {[40, 60, 100, 80, 90, 60].map((w, i) => (
        <div key={i} className="animate-shimmer" style={{ height: i === 0 ? '44px' : '14px', width: `${w}%`, borderRadius: i === 0 ? '50%' : '4px' }} />
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function formatPrice(price: number, symbol: string): string {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (symbol.includes('USD') && price < 10) return price.toFixed(4);
  return price.toFixed(2);
}

function inferSentimentSimple(text: string): string {
  const pos = ['surge', 'rally', 'gain', 'rise', 'beat', 'profit', 'growth', 'strong', 'record', 'up'];
  const neg = ['fall', 'drop', 'decline', 'loss', 'miss', 'weak', 'crash', 'cut', 'lower', 'down'];
  const lower = text.toLowerCase();
  let score = 0;
  pos.forEach((w) => { if (lower.includes(w)) score++; });
  neg.forEach((w) => { if (lower.includes(w)) score--; });
  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}
