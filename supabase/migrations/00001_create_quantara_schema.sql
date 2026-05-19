
-- ─── 1. debate_sessions ──────────────────────────────────────────────────────
-- Stores every AI debate result run by any visitor
CREATE TABLE debate_sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset         text NOT NULL,
  verdict       text NOT NULL,
  confidence    numeric(5,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  bull_confidence  numeric(5,2) NOT NULL DEFAULT 50,
  bear_confidence  numeric(5,2) NOT NULL DEFAULT 50,
  bull_synthesis   text,
  bear_synthesis   text,
  judge_rationale  text,
  risk_flags       text[] DEFAULT '{}',
  bull_catalysts   text[] DEFAULT '{}',
  bear_risks       text[] DEFAULT '{}',
  raw_result       jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── 2. watchlist ────────────────────────────────────────────────────────────
-- Lets anonymous visitors pin/unpin assets (identified by session_id)
CREATE TABLE watchlist (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  text NOT NULL,
  symbol      text NOT NULL,
  name        text,
  category    text,
  added_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, symbol)
);

-- ─── 3. price_snapshots ──────────────────────────────────────────────────────
-- Caches the latest known price for each symbol (upserted on refresh)
CREATE TABLE price_snapshots (
  symbol       text PRIMARY KEY,
  price        numeric(18,6) NOT NULL,
  change       numeric(18,6) NOT NULL DEFAULT 0,
  change_pct   numeric(10,4) NOT NULL DEFAULT 0,
  high         numeric(18,6),
  low          numeric(18,6),
  open         numeric(18,6),
  prev_close   numeric(18,6),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE debate_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist        ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_snapshots  ENABLE ROW LEVEL SECURITY;

-- debate_sessions: anyone can insert + read
CREATE POLICY "debates_insert_public" ON debate_sessions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "debates_select_public" ON debate_sessions FOR SELECT TO anon USING (true);

-- watchlist: anyone can manage their own rows (by session_id)
CREATE POLICY "watchlist_insert_public" ON watchlist FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "watchlist_select_public" ON watchlist FOR SELECT TO anon USING (true);
CREATE POLICY "watchlist_delete_public" ON watchlist FOR DELETE TO anon USING (true);

-- price_snapshots: anyone can read + upsert
CREATE POLICY "prices_select_public" ON price_snapshots FOR SELECT TO anon USING (true);
CREATE POLICY "prices_insert_public" ON price_snapshots FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "prices_update_public" ON price_snapshots FOR UPDATE TO anon USING (true);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX idx_debate_asset    ON debate_sessions (asset, created_at DESC);
CREATE INDEX idx_watchlist_sess  ON watchlist (session_id);
CREATE INDEX idx_prices_updated  ON price_snapshots (updated_at DESC);

-- ─── Realtime ─────────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE debate_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE watchlist;
