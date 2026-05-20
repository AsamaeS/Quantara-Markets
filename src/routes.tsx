import React from 'react';
import type { ReactNode } from 'react';
import HomePage from './pages/HomePage';
import AICommitteePage from './pages/AICommitteePage';
import DashboardPage from './pages/DashboardPage';
import MarketPage from './pages/MarketPage';
import AISignalsPage from './pages/AISignalsPage';
import SentimentEnginePage from './pages/SentimentEnginePage';
import NewsPage from './pages/NewsPage';
import PortfolioPage from './pages/PortfolioPage';
import RiskDashboardPage from './pages/RiskDashboardPage';
import { TerminalShell } from './components/TerminalShell';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

// Wrap pages that need the terminal sidebar
function withShell(element: ReactNode) {
  return <TerminalShell>{element}</TerminalShell>;
}

export const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <HomePage />,
    public: true,
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    element: withShell(<DashboardPage />),
    public: true,
  },
  {
    name: 'AI Investment Committee',
    path: '/ai-committee',
    element: withShell(<AICommitteePage />),
    public: true,
  },
  // Market sub-pages
  { name: 'US Equities', path: '/markets/us', element: withShell(<MarketPage category="us-equities" />), public: true },
  { name: 'Casablanca Exchange', path: '/markets/casablanca', element: withShell(<MarketPage category="moroccan" />), public: true },
  { name: 'Commodities', path: '/markets/commodities', element: withShell(<MarketPage category="commodities" />), public: true },
  { name: 'ETFs', path: '/markets/etfs', element: withShell(<MarketPage category="etfs" />), public: true },
  { name: 'Crypto & Blockchain', path: '/markets/crypto', element: withShell(<MarketPage category="crypto" />), public: true },
  { name: 'Forex', path: '/markets/forex', element: withShell(<MarketPage category="forex" />), public: true },
  // Intelligence pages
  { name: 'AI Signals', path: '/intelligence', element: withShell(<AISignalsPage />), public: true },
  { name: 'Sentiment Engine', path: '/sentiment', element: withShell(<SentimentEnginePage />), public: true },
  // News pages
  { name: 'Market Intelligence', path: '/news/market', element: withShell(<NewsPage />), public: true },
  // Analytics pages
  { name: 'Portfolio', path: '/portfolio', element: withShell(<PortfolioPage />), public: true },
  { name: 'Risk Dashboard', path: '/risk', element: withShell(<RiskDashboardPage />), public: true },
];
