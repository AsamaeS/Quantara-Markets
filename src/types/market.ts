/**
 * Quantara Markets — Shared Types
 */

export interface MarketAsset {
  symbol: string;
  name: string;
  category: 'us-equities' | 'crypto' | 'commodities' | 'forex' | 'moroccan';
  price: number;
  change: number;
  changePct: number;
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
  prevClose?: number;
  lastUpdated?: string;
  sparkline?: number[];
  loading?: boolean;
  error?: boolean;
}

export interface TickerItem {
  symbol: string;
  price: number;
  changePct: number;
}

export const ASSETS_BY_CATEGORY: Record<string, MarketAsset[]> = {
  'us-equities': [
    { symbol: 'TSLA', name: 'Tesla Inc.', category: 'us-equities', price: 0, change: 0, changePct: 0 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', category: 'us-equities', price: 0, change: 0, changePct: 0 },
    { symbol: 'AAPL', name: 'Apple Inc.', category: 'us-equities', price: 0, change: 0, changePct: 0 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', category: 'us-equities', price: 0, change: 0, changePct: 0 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', category: 'us-equities', price: 0, change: 0, changePct: 0 },
    { symbol: 'META', name: 'Meta Platforms', category: 'us-equities', price: 0, change: 0, changePct: 0 },
    { symbol: 'GOOG', name: 'Alphabet Inc.', category: 'us-equities', price: 0, change: 0, changePct: 0 },
    { symbol: 'JPM', name: 'JPMorgan Chase', category: 'us-equities', price: 0, change: 0, changePct: 0 },
  ],
  'crypto': [
    { symbol: 'BTC-USD', name: 'Bitcoin', category: 'crypto', price: 0, change: 0, changePct: 0 },
    { symbol: 'ETH-USD', name: 'Ethereum', category: 'crypto', price: 0, change: 0, changePct: 0 },
  ],
  'commodities': [
    { symbol: 'XAUUSD', name: 'Gold Spot', category: 'commodities', price: 0, change: 0, changePct: 0 },
    { symbol: 'XAGUSD', name: 'Silver Spot', category: 'commodities', price: 0, change: 0, changePct: 0 },
    { symbol: 'CL=F', name: 'Crude Oil WTI', category: 'commodities', price: 0, change: 0, changePct: 0 },
    { symbol: 'NG=F', name: 'Natural Gas', category: 'commodities', price: 0, change: 0, changePct: 0 },
  ],
  'forex': [
    { symbol: 'EURUSD', name: 'EUR/USD', category: 'forex', price: 0, change: 0, changePct: 0 },
    { symbol: 'GBPUSD', name: 'GBP/USD', category: 'forex', price: 0, change: 0, changePct: 0 },
    { symbol: 'USDJPY', name: 'USD/JPY', category: 'forex', price: 0, change: 0, changePct: 0 },
    { symbol: 'USDCHF', name: 'USD/CHF', category: 'forex', price: 0, change: 0, changePct: 0 },
  ],
  'moroccan': [
    { symbol: 'MASI', name: 'MASI Index', category: 'moroccan', price: 0, change: 0, changePct: 0 },
    { symbol: 'ATW', name: 'Attijariwafa Bank', category: 'moroccan', price: 0, change: 0, changePct: 0 },
    { symbol: 'IAM', name: 'Maroc Telecom', category: 'moroccan', price: 0, change: 0, changePct: 0 },
    { symbol: 'OCP', name: 'OCP Group', category: 'moroccan', price: 0, change: 0, changePct: 0 },
  ],
};

export const TICKER_ASSETS = [
  'TSLA', 'NVDA', 'AAPL', 'MSFT', 'AMZN', 'META',
  'BTC-USD', 'XAUUSD', 'GOOG', 'JPM',
];

export const COMMITTEE_ASSETS = [
  'TSLA', 'NVDA', 'AAPL', 'MSFT', 'AMZN', 'META', 'BTC-USD', 'XAUUSD', 'MASI',
];

// Fallback mock prices when APIs unavailable
export const MOCK_PRICES: Record<string, { price: number; change: number; changePct: number }> = {
  'TSLA': { price: 282.40, change: 5.20, changePct: 1.88 },
  'NVDA': { price: 1035.80, change: -8.50, changePct: -0.81 },
  'AAPL': { price: 211.50, change: 1.30, changePct: 0.62 },
  'MSFT': { price: 428.70, change: -2.10, changePct: -0.49 },
  'AMZN': { price: 193.40, change: 3.60, changePct: 1.90 },
  'META': { price: 547.20, change: 7.80, changePct: 1.45 },
  'GOOG': { price: 178.90, change: -0.85, changePct: -0.47 },
  'JPM': { price: 208.60, change: 1.15, changePct: 0.55 },
  'BTC-USD': { price: 69420, change: 1250, changePct: 1.83 },
  'ETH-USD': { price: 3540, change: -45, changePct: -1.26 },
  'XAUUSD': { price: 2345.80, change: 12.40, changePct: 0.53 },
  'XAGUSD': { price: 29.45, change: 0.32, changePct: 1.10 },
  'CL=F': { price: 78.45, change: -0.85, changePct: -1.07 },
  'NG=F': { price: 2.15, change: 0.08, changePct: 3.86 },
  'EURUSD': { price: 1.0845, change: 0.0012, changePct: 0.11 },
  'GBPUSD': { price: 1.2680, change: -0.0025, changePct: -0.20 },
  'USDJPY': { price: 155.20, change: 0.45, changePct: 0.29 },
  'USDCHF': { price: 0.9025, change: 0.0015, changePct: 0.17 },
  'MASI': { price: 14260.0, change: 45.20, changePct: 0.32 },
  'ATW': { price: 458.50, change: -3.20, changePct: -0.69 },
  'IAM': { price: 128.75, change: 1.50, changePct: 1.18 },
  'OCP': { price: 185.30, change: 2.80, changePct: 1.54 },
};
