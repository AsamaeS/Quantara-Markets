import React from 'react';
import type { ReactNode } from 'react';
import HomePage from './pages/HomePage';
import AICommitteePage from './pages/AICommitteePage';
import DashboardPage from './pages/DashboardPage';
import PlaceholderPage from './pages/PlaceholderPage';
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
  { name: 'US Markets', path: '/markets/us', element: withShell(<PlaceholderPage />), public: true },
  { name: 'Casablanca Exchange', path: '/markets/casablanca', element: withShell(<PlaceholderPage />), public: true },
  { name: 'Commodities', path: '/markets/commodities', element: withShell(<PlaceholderPage />), public: true },
  { name: 'ETFs', path: '/markets/etfs', element: withShell(<PlaceholderPage />), public: true },
  { name: 'Crypto', path: '/markets/crypto', element: withShell(<PlaceholderPage />), public: true },
  { name: 'Forex', path: '/markets/forex', element: withShell(<PlaceholderPage />), public: true },
  // Intelligence pages
  { name: 'AI Signals', path: '/intelligence', element: withShell(<PlaceholderPage />), public: true },
  { name: 'Sentiment Engine', path: '/sentiment', element: withShell(<PlaceholderPage />), public: true },
  { name: 'Prediction Engine', path: '/prediction', element: withShell(<PlaceholderPage />), public: true },
  // News pages
  { name: 'Market Intelligence', path: '/news/market', element: withShell(<PlaceholderPage />), public: true },
  { name: 'Economic Calendar', path: '/news/calendar', element: withShell(<PlaceholderPage />), public: true },
  { name: 'Earnings Events', path: '/news/earnings', element: withShell(<PlaceholderPage />), public: true },
  // Analytics pages
  { name: 'Portfolio', path: '/portfolio', element: withShell(<PlaceholderPage />), public: true },
  { name: 'Risk Dashboard', path: '/risk', element: withShell(<PlaceholderPage />), public: true },
  { name: 'Correlation Matrix', path: '/correlation', element: withShell(<PlaceholderPage />), public: true },
];
