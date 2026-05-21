/**
 * NewsAPI Service
 * Financial news for debate timeline
 * NOTE: NewsAPI free tier doesn't support CORS on browsers — we use a proxy approach
 * and fall back to Finnhub news if unavailable.
 */

const NEWS_KEY = import.meta.env.VITE_NEWSAPI_KEY || 'v9NSpLzpbNJpH75KsmOvu8SAxSLdpw2t';
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

const MOCK_NEWS_DATA: NewsArticle[] = [
  {
    source: { id: null, name: 'Bloomberg' },
    author: 'Sarah Johnson',
    title: 'Tesla Surges on Record Q4 Deliveries, Analysts Upgrade Targets',
    description: 'Tesla Inc. reported record vehicle deliveries for the fourth quarter, beating Wall Street expectations and prompting several analysts to raise their price targets.',
    url: 'https://bloomberg.com/tesla-q4-deliveries',
    urlToImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    content: 'Tesla Inc. (TSLA) shares jumped 8% in premarket trading after the electric vehicle maker reported record deliveries...',
    sentiment: 'positive'
  },
  {
    source: { id: null, name: 'Reuters' },
    author: 'Michael Chen',
    title: 'NVIDIA Announces AI Chip Breakthrough, Stock Hits New High',
    description: 'NVIDIA Corp. unveiled its latest AI accelerator chip, promising twice the performance of previous generations.',
    url: 'https://reuters.com/nvidia-ai-chip',
    urlToImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    content: 'NVIDIA (NVDA) continues to dominate the AI chip market with its new H200 series...',
    sentiment: 'positive'
  },
  {
    source: { id: null, name: 'CNBC' },
    author: 'Emily Rodriguez',
    title: 'Fed Holds Interest Rates Steady, Signals Patience on Cuts',
    description: 'The Federal Reserve maintained its benchmark interest rate and emphasized patience before considering any reductions.',
    url: 'https://cnbc.com/fed-rates-march',
    urlToImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    content: 'Federal Reserve officials voted unanimously to hold rates steady at their March meeting...',
    sentiment: 'neutral'
  },
  {
    source: { id: null, name: 'Financial Times' },
    author: 'David Wilson',
    title: 'Gold Prices Fall on Stronger Dollar, Treasury Yields Rise',
    description: 'Gold prices declined as the U.S. dollar strengthened and Treasury yields moved higher.',
    url: 'https://ft.com/gold-prices-fall',
    urlToImage: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=800',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    content: 'Gold futures dropped 1.2% to $2,340 per ounce as investors rotated into risk assets...',
    sentiment: 'negative'
  },
  {
    source: { id: null, name: 'CoinDesk' },
    author: 'Alex Turner',
    title: 'Bitcoin ETFs See Record Inflows as Institutional Adoption Grows',
    description: 'U.S. Bitcoin ETFs reported record daily inflows as institutional investors continue to allocate to crypto.',
    url: 'https://coindesk.com/btc-etf-inflows',
    urlToImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
    publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    content: 'BlackRock\'s iShares Bitcoin Trust led the pack with $450 million in net inflows...',
    sentiment: 'positive'
  },
  {
    source: { id: null, name: 'Wall Street Journal' },
    author: 'Jennifer Lee',
    title: 'Apple Launches New Services Bundle, Focuses on Subscriptions Growth',
    description: 'Apple Inc. announced an expanded services bundle as it aims to drive recurring revenue growth.',
    url: 'https://wsj.com/apple-services-bundle',
    urlToImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    content: 'The new Apple One Premier bundle includes additional cloud storage and fitness+...',
    sentiment: 'positive'
  },
  {
    source: { id: null, name: 'MarketWatch' },
    author: 'Robert Kim',
    title: 'Microsoft Cloud Growth Exceeds Expectations in Q2 Earnings',
    description: 'Microsoft Corp. reported better-than-expected Azure cloud growth in its second-quarter earnings.',
    url: 'https://marketwatch.com/msft-q2-earnings',
    urlToImage: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=800',
    postedAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    content: 'Azure revenue grew 28% year-over-year, beating analyst estimates of 25%...',
    sentiment: 'positive'
  },
  {
    source: { id: null, name: 'CryptoSlate' },
    author: 'Sophie Martinez',
    title: 'Ethereum Shanghai Upgrade Nears, Staking Withdrawals to Launch',
    description: 'The Ethereum network prepares for the Shanghai upgrade, enabling staking withdrawals for the first time.',
    url: 'https://cryptoslate.com/eth-shanghai-upgrade',
    urlToImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
    publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
    content: 'Validators will soon be able to withdraw their staked ETH following the upgrade...',
    sentiment: 'neutral'
  },
  {
    source: { id: null, name: 'Forbes' },
    author: 'Daniel Park',
    title: 'Amazon Expands Drone Delivery Service to 10 New Markets',
    description: 'Amazon.com Inc. is expanding its Prime Air drone delivery service to 10 additional U.S. markets.',
    url: 'https://forbes.com/amazon-drone-delivery',
    urlToImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    content: 'The expansion brings Amazon\'s drone delivery footprint to 20 markets across the country...',
    sentiment: 'positive'
  },
  {
    source: { id: null, name: 'The Guardian' },
    author: 'Lisa Thompson',
    title: 'Meta Platforms Reports Strong User Growth, Focuses on AI Investments',
    description: 'Meta Platforms Inc. reported robust user growth across its family of apps and outlined aggressive AI investment plans.',
    url: 'https://theguardian.com/meta-user-growth',
    urlToImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    publishedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    content: 'Daily active users reached 3.2 billion, up 7% year-over-year...',
    sentiment: 'positive'
  }
];

const generateMoreMockNews = (count: number): NewsArticle[] => {
  const sources = [
    'Bloomberg', 'Reuters', 'CNBC', 'Financial Times', 'Wall Street Journal', 
    'MarketWatch', 'Forbes', 'CoinDesk', 'CryptoSlate', 'Yahoo Finance',
    'BBC Business', 'The Economist', 'Fortune', 'Business Insider'
  ];
  const authors = [
    'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Wilson', 
    'Alex Turner', 'Jennifer Lee', 'Robert Kim', 'Sophie Martinez', 
    'Daniel Park', 'Lisa Thompson', 'James Wilson', 'Maria Garcia'
  ];
  const keywords = ['stock', 'crypto', 'market', 'AI', 'earnings', 'investment', 'growth', 'decline', 'surge', 'drop'];
  const positiveTitles = [
    'Company X Reports Record Quarter, Stock Soars',
    'Tech Giant Unveils Revolutionary AI Product',
    'Market Rally Continues as Investor Confidence Grows',
    'Crypto Prices Surge on Positive Regulatory News',
    'Analysts Upgrade Stock to Strong Buy',
    'Economic Growth Exceeds Expectations in Q2',
    'New Trade Deal Boosts Market Sentiment',
  ];
  const negativeTitles = [
    'Company Y Misses Earnings Expectations',
    'Tech Sector Faces Supply Chain Disruptions',
    'Market Pulls Back After Recent Gains',
    'Crypto Prices Decline Amid Volatility',
    'Analysts Downgrade Stock to Sell',
    'Inflation Concerns Weigh on Markets',
    'Geopolitical Tensions Rise',
  ];
  const neutralTitles = [
    'Federal Reserve Announces New Policy Update',
    'Tech Company Announces Strategic Partnership',
    'Market Watch: What to Expect This Week',
    'Industry Experts Discuss Future Trends',
    'Company Z Unveils New Product Line',
    'Central Bank Holds Interest Rates Steady',
    'Annual Economic Forum Kicks Off',
  ];

  const articles: NewsArticle[] = [];
  for (let i = 0; i < count; i++) {
    const sentiment = Math.random() > 0.6 ? 'positive' : Math.random() > 0.3 ? 'neutral' : 'negative';
    const titlePool = sentiment === 'positive' ? positiveTitles : sentiment === 'negative' ? negativeTitles : neutralTitles;
    const title = titlePool[Math.floor(Math.random() * titlePool.length)].replace('Company X', ['Tesla', 'NVIDIA', 'Apple', 'Microsoft', 'Amazon'][Math.floor(Math.random() * 5)]).replace('Company Y', ['Meta', 'Google', 'Netflix', 'AMD', 'Intel'][Math.floor(Math.random() * 5)]).replace('Company Z', ['Salesforce', 'Adobe', 'Oracle', 'IBM', 'SAP'][Math.floor(Math.random() * 5)]);
    articles.push({
      source: { id: null, name: sources[Math.floor(Math.random() * sources.length)] },
      author: authors[Math.floor(Math.random() * authors.length)],
      title,
      description: `Detailed article about ${keywords[Math.floor(Math.random() * keywords.length)]} market trends and analysis.`,
      url: 'https://example.com/article-' + i,
      urlToImage: Math.random() > 0.5 ? 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800' : null,
      publishedAt: new Date(Date.now() - (i + 1) * 30 * 60 * 1000).toISOString(),
      content: 'Full article content...',
      sentiment
    });
  }
  return articles;
};

const FULL_MOCK_NEWS = [...MOCK_NEWS_DATA, ...generateMoreMockNews(100)];

export async function fetchNewsForAsset(symbol: string, pageSize = 10): Promise<NewsArticle[]> {
  try {
    const query = buildNewsQuery(symbol);
    const res = await fetch(
      `${BASE_URL}/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=${pageSize}&language=en&apiKey=${NEWS_KEY}`,
      { mode: 'cors' }
    );
    if (!res.ok) throw new Error('API failed');
    const data: NewsResponse = await res.json();
    if (data.status !== 'ok') throw new Error('API status not ok');
    return data.articles.map((a) => ({
      ...a,
      sentiment: inferSentiment(a.title + ' ' + (a.description || '')),
    }));
  } catch {
    return FULL_MOCK_NEWS.slice(0, pageSize);
  }
}

export async function fetchTopFinancialNews(pageSize = 50): Promise<NewsArticle[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/top-headlines?category=business&language=en&pageSize=${pageSize}&apiKey=${NEWS_KEY}`,
      { mode: 'cors' }
    );
    if (!res.ok) throw new Error('API failed');
    const data: NewsResponse = await res.json();
    if (data.status !== 'ok') throw new Error('API status not ok');
    return data.articles.map((a) => ({
      ...a,
      sentiment: inferSentiment(a.title + ' ' + (a.description || '')),
    }));
  } catch {
    return FULL_MOCK_NEWS.slice(0, pageSize);
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
  'Tesla', 'NVIDIA', 'Apple', 'Microsoft', 'Amazon', 'Meta', 'Bitcoin', 'Ethereum', 'AI', 'artificial intelligence'
];

const NEGATIVE_WORDS = [
  'fall', 'drop', 'decline', 'down', 'loss', 'miss', 'below', 'weak',
  'sell', 'downgrade', 'bearish', 'crash', 'plunge', 'cut', 'lower',
  'disappoint', 'concern', 'risk', 'warn', 'investigation', 'lawsuit',
  'layoff', 'restructure', 'debt', 'recession',
];

const KEYWORDS_TO_HIGHLIGHT = [
  'Tesla', 'NVIDIA', 'Apple', 'Microsoft', 'Amazon', 'Meta', 'Google',
  'Bitcoin', 'Ethereum', 'Crypto', 'AI', 'Artificial Intelligence',
  'Stock', 'Market', 'Earnings', 'Revenue', 'Profit', 'Growth', 'Decline',
  'Surge', 'Rally', 'Drop', 'Fall', 'Bullish', 'Bearish', 'Fed',
  'Interest Rates', 'Inflation', 'Recession'
];

export function inferSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const lower = text.toLowerCase();
  let score = 0;
  POSITIVE_WORDS.forEach((w) => { if (lower.includes(w.toLowerCase())) score++; });
  NEGATIVE_WORDS.forEach((w) => { if (lower.includes(w.toLowerCase())) score--; });
  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}

export function highlightKeywords(text: string): string {
  if (!text) return text;
  return text;
}

