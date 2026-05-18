/**
 * AI Debate Engine (Frontend Rule-Based)
 * Mirrors the Python debate_engine.py logic
 * Uses real Finnhub + NewsAPI data to generate Bull/Bear/Judge arguments
 */

import { FinnhubQuote, FinnhubNewsItem, fetchFinnhubSentiment } from './finnhub';
import { NewsArticle, inferSentiment } from './newsapi';

export type Verdict =
  | 'CONVICTION BUY'
  | 'BUY'
  | 'BUY WITH CAUTION'
  | 'HOLD'
  | 'AVOID'
  | 'CONVICTION AVOID'
  | 'INSUFFICIENT DATA';

export interface SubAgentArgument {
  agentType: 'news' | 'quant' | 'macro';
  content: string;
  confidence: number;
}

export interface CoalitionArgument {
  side: 'bull' | 'bear';
  arguments: SubAgentArgument[];
  overallConfidence: number;
  synthesis: string;
  catalysts?: string[];
  risks?: string[];
}

export interface DebateResult {
  asset: string;
  bull: CoalitionArgument;
  bear: CoalitionArgument;
  judge: {
    verdict: Verdict;
    confidence: number;
    rationale: string;
    riskFlags: string[];
  };
  round: number;
  timestamp: string;
}

interface DebateInput {
  asset: string;
  quote: FinnhubQuote | null;
  finnhubNews: FinnhubNewsItem[];
  newsApiArticles: NewsArticle[];
  previousClose?: number;
}

export async function runDebate(input: DebateInput): Promise<DebateResult> {
  const { asset, quote, finnhubNews, newsApiArticles } = input;

  // Combine news sources
  const combinedHeadlines = [
    ...finnhubNews.map((n) => n.headline),
    ...newsApiArticles.map((a) => a.title),
  ];

  // Sentiment from headlines
  const positiveCount = combinedHeadlines.filter(
    (h) => inferSentiment(h) === 'positive'
  ).length;
  const negativeCount = combinedHeadlines.filter(
    (h) => inferSentiment(h) === 'negative'
  ).length;
  const totalNews = combinedHeadlines.length;

  // Fetch Finnhub sentiment if available
  let finnhubBullish = 0.5;
  try {
    const sentiment = await fetchFinnhubSentiment(asset);
    if (sentiment?.sentiment) {
      finnhubBullish = sentiment.sentiment.bullishPercent;
    }
  } catch {
    // ignore
  }

  // Price momentum
  const priceMomentum = quote ? (quote.dp || 0) / 100 : 0;
  const priceChange = quote ? quote.d || 0 : 0;
  const currentPrice = quote ? quote.c : 0;

  // === BULL COALITION ===
  const bullNewsConf = totalNews > 0
    ? Math.min(0.92, 0.4 + (positiveCount / totalNews) * 0.6 + finnhubBullish * 0.3)
    : 0.45;
  const bullNewsContent = buildBullNewsContent(positiveCount, totalNews, finnhubNews, newsApiArticles);

  const bullQuantConf = priceMomentum > 0
    ? Math.min(0.90, 0.5 + priceMomentum * 3)
    : Math.max(0.25, 0.45 + priceMomentum * 2);
  const bullQuantContent = buildBullQuantContent(asset, priceMomentum, priceChange, currentPrice);

  const bullMacroConf = getMacroConf(asset, 'bull');
  const bullMacroContent = getMacroContent(asset, 'bull');

  const bullCatalysts = getBullCatalysts(asset, quote, positiveCount, totalNews);

  const bullOverall = (bullNewsConf * 0.4 + bullQuantConf * 0.35 + bullMacroConf * 0.25);

  const bullArg: CoalitionArgument = {
    side: 'bull',
    arguments: [
      { agentType: 'news', content: bullNewsContent, confidence: bullNewsConf },
      { agentType: 'quant', content: bullQuantContent, confidence: bullQuantConf },
      { agentType: 'macro', content: bullMacroContent, confidence: bullMacroConf },
    ],
    overallConfidence: bullOverall,
    synthesis: `Constructive outlook: ${bullNewsContent.slice(0, 80)}...`,
    catalysts: bullCatalysts,
  };

  // === BEAR COALITION ===
  const bearNewsConf = totalNews > 0
    ? Math.min(0.92, 0.4 + (negativeCount / totalNews) * 0.6 + (1 - finnhubBullish) * 0.3)
    : 0.45;
  const bearNewsContent = buildBearNewsContent(negativeCount, totalNews, finnhubNews, newsApiArticles);

  const bearQuantConf = priceMomentum < 0
    ? Math.min(0.90, 0.5 + Math.abs(priceMomentum) * 3)
    : Math.max(0.25, 0.45 - priceMomentum * 2);
  const bearQuantContent = buildBearQuantContent(asset, priceMomentum, priceChange, currentPrice);

  const bearMacroConf = getMacroConf(asset, 'bear');
  const bearMacroContent = getMacroContent(asset, 'bear');

  const bearRisks = getBearRisks(asset, quote, negativeCount, totalNews);

  const bearOverall = (bearNewsConf * 0.4 + bearQuantConf * 0.35 + bearMacroConf * 0.25);

  const bearArg: CoalitionArgument = {
    side: 'bear',
    arguments: [
      { agentType: 'news', content: bearNewsContent, confidence: bearNewsConf },
      { agentType: 'quant', content: bearQuantContent, confidence: bearQuantConf },
      { agentType: 'macro', content: bearMacroContent, confidence: bearMacroConf },
    ],
    overallConfidence: bearOverall,
    synthesis: `Risk concerns: ${bearNewsContent.slice(0, 80)}...`,
    risks: bearRisks,
  };

  // === JUDGE VERDICT ===
  const diff = bullOverall - bearOverall;
  const judgeConf = Math.min(0.95, 0.5 + Math.abs(diff));
  let verdict: Verdict;
  let rationale: string;

  if (bullOverall < 0.35 && bearOverall < 0.35) {
    verdict = 'INSUFFICIENT DATA';
    rationale = 'Both coalitions have low confidence due to limited data. Position sizing should be minimal.';
  } else if (diff > 0.25) {
    verdict = 'CONVICTION BUY';
    rationale = `Bull coalition significantly stronger (gap: ${(diff * 100).toFixed(0)}pp). Strong momentum and positive sentiment support upside.`;
  } else if (diff > 0.12) {
    verdict = 'BUY';
    rationale = `Bull case prevails with moderate conviction (gap: ${(diff * 100).toFixed(0)}pp). Risk/reward appears favorable.`;
  } else if (diff > 0.03) {
    verdict = 'BUY WITH CAUTION';
    rationale = `Slight bull edge (gap: ${(diff * 100).toFixed(0)}pp). Position sizing should be conservative given mixed signals.`;
  } else if (diff < -0.25) {
    verdict = 'CONVICTION AVOID';
    rationale = `Bear coalition significantly stronger (gap: ${(Math.abs(diff) * 100).toFixed(0)}pp). High risk environment.`;
  } else if (diff < -0.12) {
    verdict = 'AVOID';
    rationale = `Bear case prevails (gap: ${(Math.abs(diff) * 100).toFixed(0)}pp). Downside risks outweigh upside potential.`;
  } else {
    verdict = 'HOLD';
    rationale = `Balanced arguments with no clear directional bias. Market is in equilibrium — maintain existing position.`;
  }

  const riskFlags = buildRiskFlags(asset, priceMomentum, negativeCount, totalNews, quote);

  return {
    asset,
    bull: bullArg,
    bear: bearArg,
    judge: { verdict, confidence: judgeConf, rationale, riskFlags },
    round: 3,
    timestamp: new Date().toISOString(),
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildBullNewsContent(
  positiveCount: number,
  totalNews: number,
  finnhubNews: FinnhubNewsItem[],
  newsApiArticles: NewsArticle[]
): string {
  if (totalNews === 0) return 'No major negative catalysts detected; market sentiment appears stable.';
  const pct = totalNews > 0 ? ((positiveCount / totalNews) * 100).toFixed(0) : '0';

  const allHeadlines: string[] = [
    ...finnhubNews.map((n) => n.headline),
    ...newsApiArticles.map((a) => a.title),
  ];
  const topPositiveHeadline = allHeadlines.find((h) => inferSentiment(h) === 'positive') ?? '';

  return `${pct}% of ${totalNews} recent headlines are bullish${topPositiveHeadline ? `: "${topPositiveHeadline.slice(0, 80)}"` : ''}. Positive sentiment supports upside thesis.`;
}

function buildBearNewsContent(
  negativeCount: number,
  totalNews: number,
  finnhubNews: FinnhubNewsItem[],
  newsApiArticles: NewsArticle[]
): string {
  if (totalNews === 0) return 'Lack of positive catalysts and macro uncertainty pose headwinds.';
  const pct = totalNews > 0 ? ((negativeCount / totalNews) * 100).toFixed(0) : '0';

  const allHeadlines: string[] = [
    ...finnhubNews.map((n) => n.headline),
    ...newsApiArticles.map((a) => a.title),
  ];
  const topNegativeHeadline = allHeadlines.find((h) => inferSentiment(h) === 'negative') ?? '';

  return `${pct}% of ${totalNews} recent headlines carry bearish tone${topNegativeHeadline ? `: "${topNegativeHeadline.slice(0, 80)}"` : ''}. Negative sentiment pressure persists.`;
}

function buildBullQuantContent(
  asset: string,
  momentum: number,
  change: number,
  price: number
): string {
  if (momentum > 0.02)
    return `Strong positive price momentum (+${(momentum * 100).toFixed(2)}% intraday). Bullish price action with buyers in control.`;
  if (momentum > 0)
    return `Modest intraday gain (+${(momentum * 100).toFixed(2)}%). Price action constructive above prior close.`;
  if (momentum > -0.02)
    return `Minor pullback (${(momentum * 100).toFixed(2)}%) within normal range. No structural breakdown pattern.`;
  return `Price under pressure (${(momentum * 100).toFixed(2)}%), but support levels may provide floor for reversal.`;
}

function buildBearQuantContent(
  asset: string,
  momentum: number,
  change: number,
  price: number
): string {
  if (momentum < -0.02)
    return `Significant selling pressure (${(momentum * 100).toFixed(2)}% intraday). Distribution pattern suggests institutional selling.`;
  if (momentum < 0)
    return `Negative intraday momentum (${(momentum * 100).toFixed(2)}%). Short-term trend is unfavorable.`;
  if (momentum < 0.02)
    return `Tepid upside (+${(momentum * 100).toFixed(2)}%) despite bullish narrative — market lacks conviction.`;
  return `While prices are up, high valuation metrics limit further upside potential.`;
}

const MACRO_DATA: Record<string, { bullContent: string; bullConf: number; bearContent: string; bearConf: number }> = {
  'TSLA': {
    bullContent: 'EV adoption curve accelerating globally; Supercharger licensing revenue opens new TAM. AI/robotics optionality significant.',
    bullConf: 0.62,
    bearContent: 'Price wars compressing EV margins industry-wide; China competitive pressure intensifying from BYD, NIO.',
    bearConf: 0.58,
  },
  'NVDA': {
    bullContent: 'AI training and inference demand outpacing GPU supply. CUDA moat creates switching costs; data center capex cycles secular.',
    bullConf: 0.82,
    bearContent: 'Extreme valuation (>30x revenue) prices in perfection; AMD MI300X gaining traction in inference workloads.',
    bearConf: 0.44,
  },
  'AAPL': {
    bullContent: 'Services segment growing at 15%+ CAGR; capital return program among largest in market history. Installed base loyalty unmatched.',
    bullConf: 0.60,
    bearContent: 'iPhone unit saturation in developed markets; China regulatory risk and Huawei competition eroding premium share.',
    bearConf: 0.58,
  },
  'MSFT': {
    bullContent: 'Azure AI integration driving premium pricing; Copilot monetization just beginning. Enterprise digital transformation secular tailwind.',
    bullConf: 0.74,
    bearContent: 'Antitrust scrutiny on AI partnerships; government cloud concentration risk; high valuation for maturing growth.',
    bearConf: 0.46,
  },
  'AMZN': {
    bullContent: 'AWS margins expanding; advertising segment re-accelerating; logistics network delivering above-market ROIC.',
    bullConf: 0.70,
    bearContent: 'Retail margins structurally low; regulatory antitrust risk elevated in EU/US; capex intensity increasing for AI buildout.',
    bearConf: 0.50,
  },
  'META': {
    bullContent: 'Ad platform recovery with AI targeting improvements; WhatsApp monetization optionality; Reality Labs cost discipline improving.',
    bullConf: 0.68,
    bearContent: 'Metaverse capex burning billions; teen demographic erosion; GDPR/privacy regulation increasing compliance costs.',
    bearConf: 0.52,
  },
  'BTC-USD': {
    bullContent: 'Spot ETF approval legitimizing institutional access; halving cycle historically precedes 12-18 month bull runs.',
    bullConf: 0.65,
    bearContent: 'Regulatory uncertainty in major markets; energy consumption concerns; correlation to risk-off sentiment.',
    bearConf: 0.55,
  },
  'XAUUSD': {
    bullContent: 'Central bank buying at record pace; geopolitical uncertainty premium; real interest rate trajectory supportive.',
    bullConf: 0.68,
    bearContent: 'Dollar strength headwind; opportunity cost vs risk assets in growth environment; ETF outflows signal retail exhaustion.',
    bearConf: 0.48,
  },
  'MASI': {
    bullContent: 'Moroccan economy outperforming MENA peers; OCP Group fertilizer exports benefiting from global food security demand.',
    bullConf: 0.58,
    bearContent: 'Limited liquidity vs global peers; currency risk (MAD peg); concentrated in banking/fertilizer sectors.',
    bearConf: 0.54,
  },
};

function getMacroConf(asset: string, side: 'bull' | 'bear'): number {
  const data = MACRO_DATA[asset];
  if (!data) return side === 'bull' ? 0.50 : 0.50;
  return side === 'bull' ? data.bullConf : data.bearConf;
}

function getMacroContent(asset: string, side: 'bull' | 'bear'): string {
  const data = MACRO_DATA[asset];
  if (!data) {
    return side === 'bull'
      ? 'Broader market liquidity and sector tailwinds provide constructive backdrop.'
      : 'Macro uncertainty and elevated valuations pose meaningful headwinds.';
  }
  return side === 'bull' ? data.bullContent : data.bearContent;
}

function getBullCatalysts(
  asset: string,
  quote: FinnhubQuote | null,
  positiveNews: number,
  totalNews: number
): string[] {
  const catalystMap: Record<string, string[]> = {
    'TSLA': ['AI chip integration', 'Cybertruck production ramp', 'Supercharger licensing', 'Energy storage growth'],
    'NVDA': ['H100/H200/B200 demand', 'CUDA ecosystem moat', 'Data center build-out', 'Inference market share'],
    'AAPL': ['Services revenue acceleration', 'Share buyback program', 'Installed base monetization', 'AI device cycle'],
    'MSFT': ['Azure AI Copilot', 'Enterprise software pricing', 'Gaming/cloud convergence', 'LinkedIn monetization'],
    'AMZN': ['AWS margin expansion', 'Advertising ARPU growth', 'Logistics ROIC improvement', 'Prime ecosystem deepening'],
    'META': ['Advantage+ AI ads', 'WhatsApp business', 'Threads monetization', 'Llama open-source ecosystem'],
    'BTC-USD': ['Spot ETF inflows', 'Halving supply shock', 'Institutional adoption', 'Lightning Network scaling'],
    'XAUUSD': ['Central bank demand', 'Geopolitical hedge', 'Rate cut tailwind', 'Inflation hedge'],
    'MASI': ['OCP phosphate export growth', 'Bank sector profitability', 'Morocco-EU trade deal', 'Tourism recovery'],
  };
  const base = catalystMap[asset] || ['Strong fundamentals', 'Sector tailwinds', 'Improving sentiment', 'Technical support'];
  if (quote && quote.dp > 1) base.unshift('Strong momentum');
  if (positiveNews > totalNews * 0.5) base.unshift('Positive news flow');
  return base.slice(0, 5);
}

function getBearRisks(
  asset: string,
  quote: FinnhubQuote | null,
  negativeNews: number,
  totalNews: number
): string[] {
  const riskMap: Record<string, string[]> = {
    'TSLA': ['Margin compression', 'China competition', 'Valuation premium', 'Delivery execution'],
    'NVDA': ['Valuation bubble risk', 'AMD/Intel competition', 'Export restrictions', 'Cyclical capex'],
    'AAPL': ['China regulatory risk', 'iPhone saturation', 'Antitrust pressure', 'Services slowdown'],
    'MSFT': ['AI competition intensity', 'Valuation vs growth', 'Antitrust scrutiny', 'Azure growth deceleration'],
    'AMZN': ['Retail margin pressure', 'AWS competition', 'Regulatory risk', 'Capital intensity'],
    'META': ['Metaverse spending', 'Teen demographic loss', 'Privacy regulation', 'Ad market cyclicality'],
    'BTC-USD': ['Regulatory crackdown', 'Exchange counterparty risk', 'Macro correlation', 'Energy regulation'],
    'XAUUSD': ['Dollar strength', 'Rising real rates', 'ETF outflows', 'Risk-on rotation'],
    'MASI': ['Liquidity constraints', 'Currency risk', 'Sector concentration', 'Global macro spillover'],
  };
  const base = riskMap[asset] || ['Macro headwinds', 'Valuation concerns', 'Competitive pressure', 'Execution risk'];
  if (quote && quote.dp < -1) base.unshift('Negative momentum');
  if (negativeNews > totalNews * 0.4) base.unshift('Adverse news flow');
  return base.slice(0, 5);
}

function buildRiskFlags(
  asset: string,
  momentum: number,
  negativeCount: number,
  totalNews: number,
  quote: FinnhubQuote | null
): string[] {
  const flags: string[] = [];
  if (Math.abs(momentum) > 0.03) flags.push('High Volatility');
  if (negativeCount > totalNews * 0.5) flags.push('Negative News Flow');
  if (['TSLA', 'NVDA', 'BTC-USD'].includes(asset)) flags.push('Valuation Premium');
  if (['BTC-USD', 'ETH-USD'].includes(asset)) flags.push('Regulatory Risk');
  if (['MASI'].includes(asset)) flags.push('Liquidity Risk');
  if (quote && Math.abs(quote.dp) > 3) flags.push('Intraday Volatility');
  if (flags.length === 0) flags.push('Standard Market Risk');
  return flags.slice(0, 4);
}
