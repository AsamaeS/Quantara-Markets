/**
 * Database service — Supabase persistence layer
 * Handles debate_sessions, watchlist, price_snapshots
 */
import { supabase } from '@/db/supabase';
import { DebateResult } from './debateEngine';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DbDebateSession {
  id: string;
  asset: string;
  verdict: string;
  confidence: number;
  bull_confidence: number;
  bear_confidence: number;
  bull_synthesis: string | null;
  bear_synthesis: string | null;
  judge_rationale: string | null;
  risk_flags: string[];
  bull_catalysts: string[];
  bear_risks: string[];
  raw_result: DebateResult | null;
  created_at: string;
}

export interface DbWatchlistItem {
  id: string;
  session_id: string;
  symbol: string;
  name: string | null;
  category: string | null;
  added_at: string;
}

export interface DbPriceSnapshot {
  symbol: string;
  price: number;
  change: number;
  change_pct: number;
  high: number | null;
  low: number | null;
  open: number | null;
  prev_close: number | null;
  updated_at: string;
}

// ─── Session ID ───────────────────────────────────────────────────────────────

/** Returns or creates a stable anonymous session ID stored in localStorage */
export function getSessionId(): string {
  const key = 'qm_session_id';
  let sid = localStorage.getItem(key);
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem(key, sid);
  }
  return sid;
}

// ─── Debate Sessions ──────────────────────────────────────────────────────────

/** Persist a completed debate result */
export async function saveDebateSession(result: DebateResult): Promise<string | null> {
  const { data, error } = await supabase
    .from('debate_sessions')
    .insert({
      asset: result.asset,
      verdict: result.judge.verdict,
      confidence: result.judge.confidence,
      bull_confidence: result.bull.overallConfidence,
      bear_confidence: result.bear.overallConfidence,
      bull_synthesis: result.bull.synthesis,
      bear_synthesis: result.bear.synthesis,
      judge_rationale: result.judge.rationale,
      risk_flags: result.judge.riskFlags,
      bull_catalysts: result.bull.catalysts ?? [],
      bear_risks: result.bear.risks ?? [],
      raw_result: result as unknown as Record<string, unknown>,
    })
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('[DB] saveDebateSession error:', error.message);
    return null;
  }
  return data?.id ?? null;
}

/** Load the N most recent debates for a given asset (or all assets) */
export async function loadRecentDebates(
  asset?: string,
  limit = 10
): Promise<DbDebateSession[]> {
  let query = supabase
    .from('debate_sessions')
    .select('id, asset, verdict, confidence, bull_confidence, bear_confidence, bull_synthesis, bear_synthesis, judge_rationale, risk_flags, bull_catalysts, bear_risks, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (asset) query = query.eq('asset', asset);

  const { data, error } = await query;
  if (error) {
    console.error('[DB] loadRecentDebates error:', error.message);
    return [];
  }
  return Array.isArray(data) ? (data as DbDebateSession[]) : [];
}

/** Load verdict stats per asset (count by verdict) */
export async function loadDebateStats(
  asset: string
): Promise<{ verdict: string; count: number }[]> {
  const { data, error } = await supabase
    .from('debate_sessions')
    .select('verdict')
    .eq('asset', asset)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !Array.isArray(data)) return [];

  const counts: Record<string, number> = {};
  for (const row of data) {
    counts[row.verdict] = (counts[row.verdict] ?? 0) + 1;
  }
  return Object.entries(counts).map(([verdict, count]) => ({ verdict, count }));
}

// ─── Watchlist ────────────────────────────────────────────────────────────────

/** Load watchlist for current session */
export async function loadWatchlist(): Promise<DbWatchlistItem[]> {
  const sid = getSessionId();
  const { data, error } = await supabase
    .from('watchlist')
    .select('*')
    .eq('session_id', sid)
    .order('added_at', { ascending: false });

  if (error) {
    console.error('[DB] loadWatchlist error:', error.message);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

/** Add asset to watchlist */
export async function addToWatchlist(
  symbol: string,
  name?: string,
  category?: string
): Promise<boolean> {
  const sid = getSessionId();
  const { error } = await supabase
    .from('watchlist')
    .insert({ session_id: sid, symbol, name: name ?? null, category: category ?? null });

  if (error) {
    // Ignore unique constraint violations (already added)
    if (error.code === '23505') return true;
    console.error('[DB] addToWatchlist error:', error.message);
    return false;
  }
  return true;
}

/** Remove asset from watchlist */
export async function removeFromWatchlist(symbol: string): Promise<boolean> {
  const sid = getSessionId();
  const { error } = await supabase
    .from('watchlist')
    .delete()
    .eq('session_id', sid)
    .eq('symbol', symbol);

  if (error) {
    console.error('[DB] removeFromWatchlist error:', error.message);
    return false;
  }
  return true;
}

/** Check if symbol is in current session watchlist */
export async function isInWatchlist(symbol: string): Promise<boolean> {
  const sid = getSessionId();
  const { data } = await supabase
    .from('watchlist')
    .select('id')
    .eq('session_id', sid)
    .eq('symbol', symbol)
    .maybeSingle();
  return data !== null;
}

// ─── Price Snapshots ──────────────────────────────────────────────────────────

/** Upsert a batch of price snapshots (after live API fetch) */
export async function savePriceSnapshots(
  prices: Array<{
    symbol: string;
    price: number;
    change: number;
    changePct: number;
    high?: number;
    low?: number;
    open?: number;
    prevClose?: number;
  }>
): Promise<void> {
  if (!prices.length) return;

  const rows = prices.map((p) => ({
    symbol: p.symbol,
    price: p.price,
    change: p.change,
    change_pct: p.changePct,
    high: p.high ?? null,
    low: p.low ?? null,
    open: p.open ?? null,
    prev_close: p.prevClose ?? null,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('price_snapshots')
    .upsert(rows, { onConflict: 'symbol' });

  if (error) {
    console.error('[DB] savePriceSnapshots error:', error.message);
  }
}

/** Load cached price snapshots (fallback when live API fails) */
export async function loadCachedPrices(symbols: string[]): Promise<Record<string, DbPriceSnapshot>> {
  if (!symbols.length) return {};

  const { data, error } = await supabase
    .from('price_snapshots')
    .select('*')
    .in('symbol', symbols);

  if (error || !Array.isArray(data)) return {};

  const result: Record<string, DbPriceSnapshot> = {};
  for (const row of data) result[row.symbol] = row;
  return result;
}
