/**
 * Market Overview Dashboard
 * Live market data grid with category tabs, sparklines, top movers
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw, TrendingUp, TrendingDown, Building2,
  Bitcoin, Wheat, DollarSign, Globe, ArrowRight,
  Star, StarOff, Database,
} from 'lucide-react';
import { fetchMultipleQuotes } from '@/services/finnhub';
import { ASSETS_BY_CATEGORY, MOCK_PRICES, MarketAsset } from '@/types/market';
import { Sparkline, generateSparkline } from '@/components/Sparkline';
import {
  savePriceSnapshots,
  loadCachedPrices,
  loadWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  DbWatchlistItem,
} from '@/services/db';

const T = {
  bg0: '#0C0E12', bg1: '#131722', bg2: '#1E222D', bg3: '#2A2E39',
  border0: 'rgba(255,255,255,0.06)', border1: 'rgba(255,255,255,0.08)',
  brand: '#2962FF', brandLt: '#5B8DEF',
  text0: '#FFFFFF', text1: '#D1D4DC', text2: '#787B86', text3: '#50535E',
  up: '#26A69A', upBg: 'rgba(38,166,154,0.10)',
  dn: '#EF5350', dnBg: 'rgba(239,83,80,0.10)',
  warn: '#FF9800',
};

type Category = 'us-equities' | 'crypto' | 'commodities' | 'forex' | 'moroccan';

const CATEGORIES: { id: Category; label: string; icon: React.ReactNode }[] = [
  { id: 'us-equities', label: 'US Equities', icon: <Building2 size={12} /> },
  { id: 'crypto', label: 'Crypto', icon: <Bitcoin size={12} /> },
  { id: 'commodities', label: 'Commodities', icon: <Wheat size={12} /> },
  { id: 'forex', label: 'Forex', icon: <DollarSign size={12} /> },
  { id: 'moroccan', label: 'Moroccan (MASI)', icon: <Globe size={12} /> },
];

type AssetWithSparkline = MarketAsset & { sparkline: number[] };

function buildInitialAssets(cat: Category): AssetWithSparkline[] {
  return ASSETS_BY_CATEGORY[cat].map((a) => {
    const m = MOCK_PRICES[a.symbol];
    const price = m?.price ?? 0;
    const changePct = m?.changePct ?? 0;
    return {
      ...a,
      price,
      change: m?.change ?? 0,
      changePct,
      sparkline: generateSparkline(price, changePct),
    };
  });
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Category>('us-equities');
  const [assets, setAssets] = useState<Record<Category, AssetWithSparkline[]>>(() => ({
    'us-equities': buildInitialAssets('us-equities'),
    'crypto': buildInitialAssets('crypto'),
    'commodities': buildInitialAssets('commodities'),
    'forex': buildInitialAssets('forex'),
    'moroccan': buildInitialAssets('moroccan'),
  }));
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const fetchedRef = useRef<Record<Category, boolean>>({
    'us-equities': false,
    'crypto': false,
    'commodities': false,
    'forex': false,
    'moroccan': false,
  });

  // ── Watchlist DB state ────────────────────────────────────────────────────
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [watchlistItems, setWatchlistItems] = useState<DbWatchlistItem[]>([]);
  const [dbSynced, setDbSynced] = useState(false);

  // Load watchlist from DB on mount
  useEffect(() => {
    loadWatchlist().then((items) => {
      setWatchlistItems(items);
      setWatchlist(new Set(items.map((i) => i.symbol)));
      setDbSynced(true);
    });
  }, []);

  const toggleWatchlist = useCallback(async (asset: AssetWithSparkline) => {
    const inList = watchlist.has(asset.symbol);
    if (inList) {
      await removeFromWatchlist(asset.symbol);
      setWatchlist((prev) => { const s = new Set(prev); s.delete(asset.symbol); return s; });
      setWatchlistItems((prev) => prev.filter((i) => i.symbol !== asset.symbol));
    } else {
      await addToWatchlist(asset.symbol, asset.name, activeTab);
      setWatchlist((prev) => new Set(prev).add(asset.symbol));
      setWatchlistItems((prev) => [...prev, {
        id: crypto.randomUUID(),
        session_id: '',
        symbol: asset.symbol,
        name: asset.name ?? null,
        category: activeTab,
        added_at: new Date().toISOString(),
      }]);
    }
  }, [watchlist, activeTab]);

  const fetchCategory = useCallback(async (cat: Category) => {
    setLoading(true);
    const symbols = ASSETS_BY_CATEGORY[cat].map((a) => a.symbol);
    const quotes = await fetchMultipleQuotes(symbols);

    // If live API returned nothing, try DB cache
    const liveCount = Object.keys(quotes).length;
    const cached = liveCount === 0 ? await loadCachedPrices(symbols) : {};

    // Build updated list
    const updated: AssetWithSparkline[] = [];

    setAssets((prev) => {
      const next = prev[cat].map((a) => {
        const q = quotes[a.symbol];
        if (q && q.c > 0) {
          const row = { ...a, price: q.c, change: q.d, changePct: q.dp, high: q.h, low: q.l, sparkline: generateSparkline(q.c, q.dp) };
          updated.push(row);
          return row;
        }
        const c = cached[a.symbol];
        if (c) {
          return { ...a, price: c.price, change: c.change, changePct: c.change_pct, high: c.high ?? undefined, low: c.low ?? undefined, sparkline: generateSparkline(c.price, c.change_pct) };
        }
        return a;
      });
      return { ...prev, [cat]: next };
    });

    // Persist live prices to DB
    if (updated.length > 0) {
      savePriceSnapshots(updated.map((a) => ({
        symbol: a.symbol,
        price: a.price,
        change: a.change,
        changePct: a.changePct,
        high: a.high,
        low: a.low,
      })));
    }

    setLastUpdated(new Date().toLocaleTimeString('fr-FR', { hour12: false }));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!fetchedRef.current[activeTab]) {
      fetchedRef.current[activeTab] = true;
      fetchCategory(activeTab);
    }
  }, [activeTab, fetchCategory]);

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(() => fetchCategory(activeTab), 30000);
    return () => clearInterval(id);
  }, [activeTab, fetchCategory]);

  const currentAssets = assets[activeTab];

  // Top movers (across all loaded categories)
  const allLoaded = Object.values(assets).flat();
  const sorted = [...allLoaded].filter((a) => a.price > 0).sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));
  const topGainers = sorted.filter((a) => a.changePct > 0).slice(0, 4);
  const topLosers = sorted.filter((a) => a.changePct < 0).slice(0, 4);

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
      {/* Header */}
      <div style={{
        background: T.bg1,
        borderBottom: `1px solid ${T.border0}`,
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: '9px', fontWeight: 700, color: T.text3, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            QUANTARA MARKETS
          </div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: T.text0, fontFamily: 'JetBrains Mono, monospace' }}>
            MARKET OVERVIEW
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {lastUpdated && (
            <span style={{ fontSize: '10px', color: T.text3, fontFamily: 'JetBrains Mono, monospace' }}>
              Mis à jour {lastUpdated}
            </span>
          )}
          {/* DB sync indicator */}
          {dbSynced && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '9px', color: T.up }}>
              <Database size={9} />
              Sync
            </div>
          )}
          {/* Watchlist toggle */}
          <button
            onClick={() => setShowWatchlist((v) => !v)}
            style={{
              background: showWatchlist ? 'rgba(255,152,0,0.1)' : 'transparent',
              border: `1px solid ${showWatchlist ? T.warn : T.border1}`,
              borderRadius: '4px', padding: '5px 10px',
              color: showWatchlist ? T.warn : T.text2,
              fontSize: '11px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '5px',
              transition: 'all 0.15s',
            }}
          >
            <Star size={11} />
            Favoris ({watchlist.size})
          </button>
          <button
            onClick={() => fetchCategory(activeTab)}
            disabled={loading}
            style={{
              background: 'transparent',
              border: `1px solid ${T.border1}`,
              borderRadius: '4px', padding: '5px 10px',
              color: T.text2, fontSize: '11px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '5px',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.color = T.text0; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border1; e.currentTarget.style.color = T.text2; }}
          >
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
          <button
            onClick={() => navigate('/ai-committee')}
            style={{
              background: T.brand, border: 'none', borderRadius: '4px',
              padding: '5px 12px', color: '#fff', fontSize: '11px',
              fontWeight: 700, cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: '5px', transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            Comité IA <ArrowRight size={10} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Watchlist panel */}
        {showWatchlist && (
          <WatchlistPanel
            items={watchlistItems}
            onRemove={async (symbol) => {
              await removeFromWatchlist(symbol);
              setWatchlist((prev) => { const s = new Set(prev); s.delete(symbol); return s; });
              setWatchlistItems((prev) => prev.filter((i) => i.symbol !== symbol));
            }}
            onAnalyze={(symbol) => navigate('/ai-committee?asset=' + symbol)}
          />
        )}

        {/* Top Movers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <MoversSection title="TOP HAUSSES" assets={topGainers} type="gain" onSelect={(s) => navigate('/ai-committee?asset=' + s)} />
          <MoversSection title="TOP BAISSES" assets={topLosers} type="loss" onSelect={(s) => navigate('/ai-committee?asset=' + s)} />
        </div>

        {/* Category tabs + data grid */}
        <div style={{
          background: T.bg1,
          border: `1px solid ${T.border0}`,
          borderRadius: '8px',
          overflow: 'hidden',
          flex: 1,
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: `1px solid ${T.border0}`,
            background: T.bg2,
          }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                style={{
                  padding: '10px 14px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === cat.id ? `2px solid ${T.brand}` : '2px solid transparent',
                  color: activeTab === cat.id ? T.text0 : T.text2,
                  fontSize: '11px',
                  fontWeight: activeTab === cat.id ? 700 : 400,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '5px',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => { if (activeTab !== cat.id) e.currentTarget.style.color = T.text1; }}
                onMouseLeave={(e) => { if (activeTab !== cat.id) e.currentTarget.style.color = T.text2; }}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>

          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '180px 1fr 100px 100px 90px 80px 100px',
            padding: '7px 14px',
            borderBottom: `1px solid ${T.border0}`,
            background: T.bg2,
          }}>
            {['ACTIF', 'COURS', 'VAR. 24H', 'HAUT', 'BAS', 'TENDANCE', 'ACTION'].map((h, i) => (
              <div key={h} style={{
                fontSize: '9px', fontWeight: 700,
                color: T.text3, letterSpacing: '1px', textTransform: 'uppercase',
                textAlign: i >= 1 ? 'right' : 'left',
              }}>{h}</div>
            ))}
          </div>

          {/* Asset rows */}
          <div style={{ overflow: 'auto' }}>
            {currentAssets.map((asset, i) => (
              <AssetRow
                key={asset.symbol}
                asset={asset}
                index={i}
                watched={watchlist.has(asset.symbol)}
                onCommittee={() => navigate('/ai-committee')}
                onToggleWatch={() => toggleWatchlist(asset)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Watchlist Panel ──────────────────────────────────────────────────────────

function WatchlistPanel({
  items,
  onRemove,
  onAnalyze,
}: {
  items: DbWatchlistItem[];
  onRemove: (symbol: string) => void;
  onAnalyze: (symbol: string) => void;
}) {
  return (
    <div style={{
      background: T.bg1,
      border: `1px solid rgba(255,152,0,0.2)`,
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '9px 14px',
        borderBottom: `1px solid ${T.border0}`,
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <Star size={12} color={T.warn} />
        <span style={{ fontSize: '11px', fontWeight: 700, color: T.text0 }}>
          MES FAVORIS
        </span>
        <span style={{ fontSize: '10px', color: T.text3 }}>
          {items.length} actif{items.length !== 1 ? 's' : ''} suivi{items.length !== 1 ? 's' : ''}
        </span>
        <Database size={9} color={T.brand} style={{ marginLeft: 'auto' }} />
        <span style={{ fontSize: '9px', color: T.text3 }}>Synchronisé</span>
      </div>
      {items.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: T.text3, fontSize: '12px' }}>
          Aucun favori. Cliquez sur ⭐ sur un actif pour l'ajouter.
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px' }}>
          {items.map((item) => (
            <div key={item.symbol} style={{
              background: T.bg2,
              border: `1px solid ${T.border1}`,
              borderRadius: '6px',
              padding: '8px 12px',
              display: 'flex', alignItems: 'center', gap: '10px',
              minWidth: '160px',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 700, color: T.text0 }}>
                  {item.symbol}
                </div>
                {item.name && (
                  <div style={{ fontSize: '10px', color: T.text3 }}>{item.name}</div>
                )}
              </div>
              <button
                onClick={() => onAnalyze(item.symbol)}
                title="Analyser avec l'IA"
                style={{
                  background: 'rgba(41,98,255,0.12)', border: 'none', borderRadius: '3px',
                  padding: '3px 7px', color: T.brandLt, fontSize: '9px',
                  fontWeight: 700, cursor: 'pointer',
                }}
              >
                IA
              </button>
              <button
                onClick={() => onRemove(item.symbol)}
                title="Retirer des favoris"
                style={{
                  background: 'transparent', border: 'none',
                  color: T.text3, cursor: 'pointer', padding: '2px',
                  fontSize: '13px', lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Asset Row ────────────────────────────────────────────────────────────────

function AssetRow({ asset, index, onCommittee, watched, onToggleWatch }: {
  asset: AssetWithSparkline;
  index: number;
  onCommittee: () => void;
  watched: boolean;
  onToggleWatch: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isPositive = asset.changePct >= 0;

  const fmtPrice = (p: number) => {
    if (!p) return '—';
    if (p >= 10000) return p.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    if (p >= 1000) return p.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (p < 10) return p.toFixed(4);
    return p.toFixed(2);
  };

  return (
    <div
      className="animate-fade-in"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '180px 1fr 100px 100px 90px 80px 100px',
        padding: '10px 14px',
        borderBottom: `1px solid ${T.border0}`,
        background: hovered ? T.bg2 : 'transparent',
        transition: 'background 0.15s',
        alignItems: 'center',
        animationDelay: `${index * 40}ms`,
      }}
    >
      {/* Asset name + watchlist star */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={onToggleWatch}
          title={watched ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          style={{
            background: 'transparent', border: 'none',
            color: watched ? T.warn : T.text3,
            cursor: 'pointer', padding: '2px',
            opacity: hovered || watched ? 1 : 0.4,
            transition: 'all 0.15s',
            flexShrink: 0,
          }}
        >
          {watched ? <Star size={10} fill={T.warn} /> : <StarOff size={10} />}
        </button>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: T.text0, fontFamily: 'JetBrains Mono, monospace' }}>
            {asset.symbol}
          </div>
          <div style={{ fontSize: '10px', color: T.text3 }}>{asset.name}</div>
        </div>
      </div>

      {/* Price */}
      <div style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 700, color: T.text0 }}>
        {fmtPrice(asset.price)}
      </div>

      {/* Change */}
      <div style={{ textAlign: 'right' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '3px',
          background: isPositive ? T.upBg : T.dnBg,
          borderRadius: '3px', padding: '2px 6px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '11px', fontWeight: 700,
          color: isPositive ? T.up : T.dn,
        }}>
          {isPositive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
          {Math.abs(asset.changePct).toFixed(2)}%
        </div>
        <div style={{ fontSize: '10px', color: T.text3, fontFamily: 'JetBrains Mono, monospace', marginTop: '2px' }}>
          {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}
        </div>
      </div>

      {/* High */}
      <div style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: T.text2 }}>
        {asset.high ? fmtPrice(asset.high) : '—'}
      </div>

      {/* Low */}
      <div style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: T.text2 }}>
        {asset.low ? fmtPrice(asset.low) : '—'}
      </div>

      {/* Sparkline */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Sparkline data={asset.sparkline} width={72} height={32} positive={isPositive} />
      </div>

      {/* Action */}
      <div style={{ textAlign: 'right' }}>
        <button
          onClick={onCommittee}
          style={{
            background: hovered ? T.brand : 'transparent',
            border: `1px solid ${hovered ? T.brand : T.border1}`,
            borderRadius: '3px', padding: '3px 8px',
            color: hovered ? '#fff' : T.text3,
            fontSize: '9px', fontWeight: 700, cursor: 'pointer',
            letterSpacing: '0.5px',
            transition: 'all 0.15s',
          }}
        >
          ANALYSER
        </button>
      </div>
    </div>
  );
}

// ─── Movers Section ───────────────────────────────────────────────────────────

function MoversSection({ title, assets, type, onSelect }: {
  title: string;
  assets: AssetWithSparkline[];
  type: 'gain' | 'loss';
  onSelect: (symbol: string) => void;
}) {
  const color = type === 'gain' ? T.up : T.dn;
  const bg = type === 'gain' ? T.upBg : T.dnBg;
  const icon = type === 'gain' ? <TrendingUp size={12} color={color} /> : <TrendingDown size={12} color={color} />;

  return (
    <div style={{
      background: T.bg1,
      border: `1px solid ${T.border0}`,
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '9px 12px',
        borderBottom: `1px solid ${T.border0}`,
        display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        {icon}
        <span style={{ fontSize: '10px', fontWeight: 700, color: T.text0, letterSpacing: '1px' }}>{title}</span>
      </div>
      <div>
        {assets.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', fontSize: '11px', color: T.text3 }}>
            Loading...
          </div>
        ) : (
          assets.map((a, i) => (
            <div
              key={a.symbol}
              onClick={() => onSelect(a.symbol)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px',
                borderBottom: i < assets.length - 1 ? `1px solid ${T.border0}` : 'none',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = T.bg2; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 700, color: T.text0 }}>
                  {a.symbol}
                </span>
                <span style={{ fontSize: '10px', color: T.text3 }}>{a.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkline data={a.sparkline} width={52} height={24} positive={a.changePct >= 0} />
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 700,
                  color, background: bg, padding: '2px 6px', borderRadius: '3px',
                }}>
                  {a.changePct >= 0 ? '+' : ''}{a.changePct.toFixed(2)}%
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
