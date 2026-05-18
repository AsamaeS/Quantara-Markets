/**
 * NewsAPI Service
 * Financial news for debate timeline
 * NOTE: NewsAPI free tier doesn't support CORS on browsers — we use a proxy approach
 * and fall back to Finnhub news if unavailable.
 */

const NEWS_KEY = 'v9NSpLzpbNJpH75KsmOvu8SAxSLdpw2t';
const BASE_URL = 'https://newsapi.org/v2';

export interface NewsArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

export async function fetchNewsForAsset(symbol: string, pageSize = 10): Promise<NewsArticle[]> {
  try {
    const query = buildNewsQuery(symbol);
    const res = await fetch(
      `${BASE_URL}/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=${pageSize}&language=en&apiKey=${NEWS_KEY}`,
      { mode: 'cors' }
    );
    if (!res.ok) return [];
    const data: NewsResponse = await res.json();
    if (data.status !== 'ok') return [];
    return data.articles.map((a) => ({
      ...a,
      sentiment: inferSentiment(a.title + ' ' + (a.description || '')),
    }));
  } catch {
    return [];
  }
}

export async function fetchTopFinancialNews(pageSize = 20): Promise<NewsArticle[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/top-headlines?category=business&language=en&pageSize=${pageSize}&apiKey=${NEWS_KEY}`,
      { mode: 'cors' }
    );
    if (!res.ok) return [];
    const data: NewsResponse = await res.json();
    if (data.status !== 'ok') return [];
    return data.articles.map((a) => ({
      ...a,
      sentiment: inferSentiment(a.title + ' ' + (a.description || '')),
    }));
  } catch {
    return [];
  }
}

function buildNewsQuery(symbol: string): string {
  const nameMap: Record<string, string> = {
    'TSLA': 'Tesla stock',
    'NVDA': 'NVIDIA stock',
    'AAPL': 'Apple stock',
    'MSFT': 'Microsoft stock',
    'AMZN': 'Amazon stock',
    'META': 'Meta Facebook stock',
    'GOOG': 'Google Alphabet stock',
    'BTC-USD': 'Bitcoin crypto',
    'ETH-USD': 'Ethereum crypto',
    'XAUUSD': 'Gold price',
    'MASI': 'Casablanca Bourse Morocco MASI',
    'EURUSD': 'Euro dollar forex',
    'GBPUSD': 'British pound forex',
  };
  return nameMap[symbol] || symbol;
}

const POSITIVE_WORDS = [
  'surge', 'rally', 'gain', 'rise', 'up', 'beat', 'exceed', 'profit',
  'growth', 'positive', 'strong', 'record', 'buy', 'upgrade', 'bullish',
  'soar', 'jump', 'boost', 'higher', 'outperform', 'recover', 'rebound',
];

const NEGATIVE_WORDS = [
  'fall', 'drop', 'decline', 'down', 'loss', 'miss', 'below', 'weak',
  'sell', 'downgrade', 'bearish', 'crash', 'plunge', 'cut', 'lower',
  'disappoint', 'concern', 'risk', 'warn', 'investigation', 'lawsuit',
  'layoff', 'restructure', 'debt', 'recession',
];

export function inferSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const lower = text.toLowerCase();
  let score = 0;
  POSITIVE_WORDS.forEach((w) => { if (lower.includes(w)) score++; });
  NEGATIVE_WORDS.forEach((w) => { if (lower.includes(w)) score--; });
  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}
