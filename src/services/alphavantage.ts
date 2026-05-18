/**
 * Alpha Vantage API Service
 * Quote data, global search, time series
 */

const AV_KEY = 'Q07QPO53RBL3OQWA';
const BASE_URL = 'https://www.alphavantage.co/query';

export interface AVGlobalQuote {
  symbol: string;
  open: number;
  high: number;
  low: number;
  price: number;
  volume: number;
  latestTradingDay: string;
  previousClose: number;
  change: number;
  changePercent: number;
}

export interface AVTimeSeriesPoint {
  timestamp: string;
  close: number;
}

export async function fetchAVQuote(symbol: string): Promise<AVGlobalQuote | null> {
  try {
    const res = await fetch(
      `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${AV_KEY}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const q = data['Global Quote'];
    if (!q || !q['05. price']) return null;
    return {
      symbol: q['01. symbol'],
      open: parseFloat(q['02. open']),
      high: parseFloat(q['03. high']),
      low: parseFloat(q['04. low']),
      price: parseFloat(q['05. price']),
      volume: parseInt(q['06. volume']),
      latestTradingDay: q['07. latest trading day'],
      previousClose: parseFloat(q['08. previous close']),
      change: parseFloat(q['09. change']),
      changePercent: parseFloat(q['10. change percent'].replace('%', '')),
    };
  } catch {
    return null;
  }
}

export async function fetchAVDailyTimeSeries(
  symbol: string,
  outputSize: 'compact' | 'full' = 'compact'
): Promise<AVTimeSeriesPoint[]> {
  try {
    const res = await fetch(
      `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=${outputSize}&apikey=${AV_KEY}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    const series = data['Time Series (Daily)'];
    if (!series) return [];
    return Object.entries(series)
      .slice(0, 30)
      .map(([timestamp, values]) => ({
        timestamp,
        close: parseFloat((values as Record<string, string>)['4. close']),
      }))
      .reverse();
  } catch {
    return [];
  }
}
