/**
 * Finnhub API Service
 * Real-time quotes, company news, sentiment
 */

const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_KEY || 'd81qdgpr01qrojfcp20gd81qdgpr01qrojfcp210';
const BASE_URL = 'https://finnhub.io/api/v1';

export interface FinnhubQuote {
  c: number;  // current price
  d: number;  // change
  dp: number; // percent change
  h: number;  // high
  l: number;  // low
  o: number;  // open
  pc: number; // previous close
  v?: number; // volume (not always returned)
}

export interface FinnhubNewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export interface FinnhubSentiment {
  buzz: { articlesInLastWeek: number; weeklyAverage: number; buzz: number };
  companyNewsScore: number;
  sectorAverageBullishPercent: number;
  sectorAverageNewsScore: number;
  sentiment: { bearishPercent: number; bullishPercent: number };
  symbol: string;
}

export async function fetchFinnhubQuote(symbol: string): Promise<FinnhubQuote | null> {
  try {
    // Map special symbols
    const apiSymbol = mapSymbolForFinnhub(symbol);
    const res = await fetch(`${BASE_URL}/quote?symbol=${apiSymbol}&token=${FINNHUB_KEY}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.c || data.c === 0) return null;
    return data as FinnhubQuote;
  } catch {
    return null;
  }
}

export async function fetchFinnhubNews(symbol: string, count = 20): Promise<FinnhubNewsItem[]> {
  try {
    const apiSymbol = mapSymbolForFinnhub(symbol);
    const to = new Date().toISOString().slice(0, 10);
    const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const res = await fetch(
      `${BASE_URL}/company-news?symbol=${apiSymbol}&from=${from}&to=${to}&token=${FINNHUB_KEY}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data.slice(0, count) : [];
  } catch {
    return [];
  }
}

export async function fetchFinnhubSentiment(symbol: string): Promise<FinnhubSentiment | null> {
  try {
    const apiSymbol = mapSymbolForFinnhub(symbol);
    const res = await fetch(`${BASE_URL}/news-sentiment?symbol=${apiSymbol}&token=${FINNHUB_KEY}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.sentiment) return null;
    return data as FinnhubSentiment;
  } catch {
    return null;
  }
}

export async function fetchFinnhubCandles(
  symbol: string,
  resolution: string = 'D',
  count: number = 30
): Promise<{ t: number[]; c: number[]; o: number[]; h: number[]; l: number[]; v: number[] } | null> {
  try {
    const apiSymbol = mapSymbolForFinnhub(symbol);
    const to = Math.floor(Date.now() / 1000);
    const from = to - count * 24 * 60 * 60;
    const res = await fetch(
      `${BASE_URL}/stock/candle?symbol=${apiSymbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_KEY}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.s !== 'ok') return null;
    return data;
  } catch {
    return null;
  }
}

function mapSymbolForFinnhub(symbol: string): string {
  const map: Record<string, string> = {
    'BTC-USD': 'BINANCE:BTCUSDT',
    'ETH-USD': 'BINANCE:ETHUSDT',
    'XAUUSD': 'OANDA:XAUUSD',
    'MASI': 'CASABLANCA:MASI',
    'EURUSD': 'OANDA:EURUSD',
    'GBPUSD': 'OANDA:GBPUSD',
  };
  return map[symbol] || symbol;
}

export async function fetchMultipleQuotes(
  symbols: string[]
): Promise<Record<string, FinnhubQuote>> {
  const results: Record<string, FinnhubQuote> = {};
  const promises = symbols.map(async (symbol) => {
    const quote = await fetchFinnhubQuote(symbol);
    if (quote) results[symbol] = quote;
  });
  await Promise.allSettled(promises);
  return results;
}
