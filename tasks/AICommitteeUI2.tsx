/**
 * AI Investment Committee Page
 * Professional institutional-grade adversarial AI debate system
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const T = {
  brand: '#2962FF', brandLt: '#5B8DEF', brandDk: '#1E4FCC',
  bg0: '#0C0E12', bg1: '#131722', bg2: '#1E222D', bg3: '#2A2E39', bg4: '#363A45',
  border0: '#1E222D', border1: '#2A2E39', border2: '#363A45',
  text0: '#FFF', text1: '#D1D4DC', text2: '#787B86', text3: '#50535E',
  up: '#26A69A', dn: '#EF5350', upBg: 'rgba(38,166,154,0.12)', dnBg: 'rgba(239,83,80,0.12)',
  warn: '#FF9800', warnBg: 'rgba(255,152,0,0.12)',
  fontSans: "'Inter','Segoe UI',system-ui,sans-serif",
  fontMono: "'JetBrains Mono','Fira Code',monospace",
  radius: '6px',
};

const TOP_ASSETS = [
  'TSLA', 'NVDA', 'AAPL', 'MSFT', 'AMZN', 'META', 'GOOG', 'BTC-USD', 'XAUUSD', 'MASI'
];

const SAMPLE_DEBATES: Record<string, any> = {
  'TSLA': {
    bull: {
      confidence: 0.78,
      thesis: 'Strong AI-driven vehicle demand, improving margins, and expanding Supercharger network.',
      catalysts: ['AI chip integration', 'Cybertruck production ramp', 'China sales recovery', 'Energy storage growth'],
    },
    bear: {
      confidence: 0.54,
      thesis: 'Valuation stretched relative to auto peers, rising competition in EV space.',
      risks: ['Price compression', 'Regulatory headwinds', 'Delivery volatility', 'Margin pressure'],
    },
    judge: {
      verdict: 'BUY WITH CAUTION',
      confidence: 0.72,
      rationale: 'Positive momentum driven by AI optimism and delivery growth, but valuation remains stretched relative to automotive peers.',
      riskFlags: ['Valuation', 'Competition'],
    },
  },
  'NVDA': {
    bull: {
      confidence: 0.85,
      thesis: 'Dominant position in AI accelerators, insatiable cloud demand, and software ecosystem.',
      catalysts: ['H100/H200 demand', 'CUDA moat', 'Data center growth', 'Generative AI tailwinds'],
    },
    bear: {
      confidence: 0.48,
      thesis: 'AI bubble risk, supply chain constraints, and valuation extremes.',
      risks: ['Valuation bubble', 'Competition from AMD/Intel', 'Order cancellations', 'Macro sensitivity'],
    },
    judge: {
      verdict: 'CONVICTION BUY',
      confidence: 0.88,
      rationale: 'Bull case is significantly stronger with dominant market share in AI training and inference.',
      riskFlags: ['Valuation'],
    },
  },
  'AAPL': {
    bull: {
      confidence: 0.62,
      thesis: 'Services growth, iPhone ecosystem stickiness, and capital return program.',
      catalysts: ['Services revenue', 'Share buybacks', 'Installed base', 'Vision Pro potential'],
    },
    bear: {
      confidence: 0.58,
      thesis: 'iPhone saturation, China risks, and limited near-term catalysts.',
      risks: ['China exposure', 'Smartphone saturation', 'Regulatory antitrust', 'Services growth deceleration'],
    },
    judge: {
      verdict: 'HOLD',
      confidence: 0.65,
      rationale: 'Balanced arguments with stable but unspectacular outlook.',
      riskFlags: ['China', 'Saturation'],
    },
  },
};

export default function AICommitteeUI2() {
  const [selectedAsset, setSelectedAsset] = useState('TSLA');
  const [loading, setLoading] = useState(false);
  const [debate, setDebate] = useState(SAMPLE_DEBATES['TSLA']);

  const navigate = useNavigate();

  useEffect(() => {
    if (SAMPLE_DEBATES[selectedAsset]) {
      setLoading(true);
      const timer = setTimeout(() => {
        setDebate(SAMPLE_DEBATES[selectedAsset]);
        setLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [selectedAsset]);

  const getVerdictColor = (verdict: string) => {
    if (verdict.includes('BUY')) return T.up;
    if (verdict.includes('SELL')) return T.dn;
    return T.warn;
  };

  const getVerdictBg = (verdict: string) => {
    if (verdict.includes('BUY')) return T.upBg;
    if (verdict.includes('SELL')) return T.dnBg;
    return T.warnBg;
  };

  return (
    <div style={{
      height: '100%',
      background: T.bg0,
      color: T.text1,
      fontFamily: T.fontSans,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Top Bar */}
      <div style={{
        background: T.bg1,
        borderBottom: `1px solid ${T.border0}`,
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ cursor: 'pointer' }} onClick={() => navigate('/ui2/dashboard')}>
            <span style={{ fontSize: '12px', color: T.text3 }}>← Dashboard</span>
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '1px' }}>
              QUANTARA MARKETS
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: T.text0, fontFamily: T.fontMono }}>
              AI INVESTMENT COMMITTEE
            </div>
          </div>
        </div>

        {/* Asset Selector */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: T.text3 }}>Select Asset:</span>
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            style={{
              background: T.bg2,
              border: `1px solid ${T.border1}`,
              borderRadius: T.radius,
              padding: '6px 10px',
              color: T.text0,
              fontSize: '12px',
              fontFamily: T.fontMono,
              outline: 'none',
            }}
          >
            {TOP_ASSETS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <button
            style={{
              background: T.brand,
              border: 'none',
              borderRadius: T.radius,
              padding: '6px 14px',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: T.fontSans,
            }}
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
              }, 1500);
            }}
          >
            {loading ? 'Deliberating...' : 'Rerun Debate'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: '16px',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: '16px',
        overflow: 'hidden',
      }}>
        {/* Bull Agent Panel */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          overflow: 'hidden',
        }}>
          <div style={{
            background: `${T.up}11`,
            border: `1px solid ${T.up}44`,
            borderRadius: '10px',
            padding: '16px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: T.up,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  color: '#fff',
                }}>
                  🟢
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: T.text0 }}>
                    BULL AGENT
                  </div>
                  <div style={{ fontSize: '11px', color: T.text3 }}>
                    Optimist • Catalyst Hunter
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: T.up, fontFamily: T.fontMono }}>
                  {(debate.bull.confidence * 100).toFixed(0)}%
                </div>
                <div style={{ fontSize: '10px', color: T.text3 }}>Confidence</div>
              </div>
            </div>

            {/* Confidence Bar */}
            <div style={{
              background: T.bg3,
              height: '8px',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '14px',
            }}>
              <div style={{
                width: `${debate.bull.confidence * 100}%`,
                height: '100%',
                background: T.up,
                transition: 'width 0.5s ease',
              }} />
            </div>

            <div style={{
              fontSize: '12px',
              color: T.text1,
              lineHeight: '1.6',
              marginBottom: '14px',
            }}>
              {debate.bull.thesis}
            </div>

            <div>
              <div style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: T.up,
                marginBottom: '8px',
              }}>
                CATALYSTS
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {debate.bull.catalysts.map((c: string, i: number) => (
                  <div
                    key={i}
                    style={{
                      background: T.bg3,
                      border: `1px solid ${T.up}33`,
                      borderRadius: '12px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      color: T.text1,
                    }}
                  >
                    {c}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Judge Panel */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '360px',
        }}>
          <div style={{
            background: T.bg1,
            border: `1px solid ${T.border1}`,
            borderRadius: '10px',
            padding: '20px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '16px',
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: T.brand,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: '#fff',
                margin: '0 auto 12px',
              }}>
                ⚖️
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: T.text0 }}>
                JUDGE AGENT
              </div>
              <div style={{ fontSize: '11px', color: T.text3 }}>
                Investment Committee Chair
              </div>
            </div>

            {/* Verdict */}
            <div style={{
              background: getVerdictBg(debate.judge.verdict),
              border: `1px solid ${getVerdictColor(debate.judge.verdict)}`,
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
              marginBottom: '16px',
            }}>
              <div style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: T.text3,
                marginBottom: '6px',
              }}>
                FINAL VERDICT
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: 800,
                color: getVerdictColor(debate.judge.verdict),
                fontFamily: T.fontMono,
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}>
                {debate.judge.verdict}
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: T.text2,
              }}>
                Confidence: {(debate.judge.confidence * 100).toFixed(0)}%
              </div>
            </div>

            {/* Rationale */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: T.text3,
                marginBottom: '8px',
              }}>
                RATIONALE
              </div>
              <div style={{
                fontSize: '12px',
                color: T.text1,
                lineHeight: '1.6',
                marginBottom: '16px',
              }}>
                {debate.judge.rationale}
              </div>

              <div style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: T.text3,
                marginBottom: '8px',
              }}>
                RISK FLAGS
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {debate.judge.riskFlags.map((r: string, i: number) => (
                  <div
                    key={i}
                    style={{
                      background: T.warnBg,
                      border: `1px solid ${T.warn}33`,
                      borderRadius: '12px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      color: T.warn,
                    }}
                  >
                    ⚠️ {r}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bear Agent Panel */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          overflow: 'hidden',
        }}>
          <div style={{
            background: `${T.dn}11`,
            border: `1px solid ${T.dn}44`,
            borderRadius: '10px',
            padding: '16px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: T.dn,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  color: '#fff',
                }}>
                  🔴
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: T.text0 }}>
                    BEAR AGENT
                  </div>
                  <div style={{ fontSize: '11px', color: T.text3 }}>
                    Pessimist • Risk Analyst
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: T.dn, fontFamily: T.fontMono }}>
                  {(debate.bear.confidence * 100).toFixed(0)}%
                </div>
                <div style={{ fontSize: '10px', color: T.text3 }}>Confidence</div>
              </div>
            </div>

            {/* Confidence Bar */}
            <div style={{
              background: T.bg3,
              height: '8px',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '14px',
            }}>
              <div style={{
                width: `${debate.bear.confidence * 100}%`,
                height: '100%',
                background: T.dn,
                transition: 'width 0.5s ease',
              }} />
            </div>

            <div style={{
              fontSize: '12px',
              color: T.text1,
              lineHeight: '1.6',
              marginBottom: '14px',
            }}>
              {debate.bear.thesis}
            </div>

            <div>
              <div style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: T.dn,
                marginBottom: '8px',
              }}>
                RISKS
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {debate.bear.risks.map((r: string, i: number) => (
                  <div
                    key={i}
                    style={{
                      background: T.bg3,
                      border: `1px solid ${T.dn}33`,
                      borderRadius: '12px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      color: T.text1,
                    }}
                  >
                    {r}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
