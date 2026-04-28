# Requirements Document

## 1. Application Overview

### 1.1 Application Name
Quantara Markets - Institutional-Grade AI Financial Terminal

### 1.2 Application Description
A production-ready financial intelligence platform with Bloomberg Terminal aesthetic, providing real-time market data, AI-powered investment analysis, and comprehensive market overview capabilities. The application integrates multiple financial data APIs to deliver institutional-grade insights for retail and professional traders.

## 2. Users and Usage Scenarios

### 2.1 Target Users
- Retail traders seeking institutional-grade tools
- Financial analysts requiring real-time market intelligence
- Investment professionals needing AI-assisted decision support

### 2.2 Core Usage Scenarios
- Monitor real-time market data across multiple asset classes
- Analyze investment opportunities through AI committee debate system
- Track portfolio performance and market movements
- Access financial news and sentiment analysis

## 3. Page Structure and Functionality

### 3.1 Page Hierarchy

```
Quantara Markets Terminal
├── Landing/Home Page
├── AI Investment Committee Page
├── Market Overview Dashboard
└── Left Navigation (persistent across all pages)
```

### 3.2 Page-by-Page Functionality

#### 3.2.1 Landing/Home Page

**Purpose**: Entry point showcasing platform capabilities and driving user engagement

**Core Elements**:
- Hero section with animated background (subtle particle/grid effect)
- Live scrolling ticker bar displaying real-time prices from Finnhub API (key: d81qdgpr01qrojfcp20gd81qdgpr01qrojfcp210)
- Feature cards highlighting: AI Committee, Real-Time Signals, Moroccan Market coverage
- Animated stat counters showing: assets tracked, signals generated, accuracy metrics
- Two primary CTA buttons: \"Enter Terminal\" (navigates to Market Overview Dashboard), \"AI Committee\" (navigates to AI Investment Committee Page)

**Animations**:
- Fade/slide-in animations on page load for hero section and feature cards
- Smooth transitions for all interactive elements

#### 3.2.2 AI Investment Committee Page

**Purpose**: Provide AI-powered investment analysis through multi-agent debate system

**Layout Structure**:
- Three-column debate panel: Bull Agent | Judge Agent | Bear Agent
- News timeline section below debate panel
- Asset selector and control panel

**Bull Agent Column**:
- Displays bullish arguments with confidence meter (animated progress bar with pulse effect)
- Sub-arguments from: News Agent, Quant Agent, Macro Agent
- Individual confidence scores per sub-agent

**Bear Agent Column**:
- Displays bearish arguments with confidence meter
- Sub-arguments from: News Agent, Quant Agent, Macro Agent
- Individual confidence scores per sub-agent

**Judge Agent Column**:
- Renders final verdict: BUY/HOLD/SELL with animated reveal
- Risk flags with color coding (green/orange/red)
- Overall confidence score

**Asset Selector**:
- Dropdown or button group for: TSLA, NVDA, AAPL, MSFT, AMZN, META, BTC-USD, XAUUSD, MASI
- Selecting an asset triggers debate regeneration

**Debate Controls**:
- \"Rerun Debate\" button: fetches fresh data and regenerates entire debate
- Debate round indicator: displays Round 1, Round 2, Final Verdict

**News Timeline Section**:
- Displays recent news articles fetched from NewsAPI (key: v9NSpLzpbNJpH75KsmOvu8SAxSLdpw2t)
- Shows headlines, timestamps, and sentiment indicators
- Articles are filtered by selected asset

**Data Sources**:
- News data: NewsAPI
- Price data: Finnhub API or Alpha Vantage API (key: Q07QPO53RBL3OQWA)
- Sentiment analysis: derived from news headlines

#### 3.2.3 Market Overview Dashboard

**Purpose**: Comprehensive view of live market data across asset classes

**Core Components**:

**Category Tabs**:
- US Equities
- Crypto
- Commodities
- Forex
- Moroccan (MASI)

**Market Data Grid**:
- Displays for each asset: symbol, current price, percentage change, volume
- Mini sparkline chart per asset showing recent price movement
- Color coding: green for positive change, red for negative change

**Top Movers Section**:
- Highlights assets with largest percentage gains
- Highlights assets with largest percentage losses
- Updates in real-time

**Data Refresh**:
- Live updates from Finnhub API and Alpha Vantage API

#### 3.2.4 Left Navigation (Persistent)

**Purpose**: Primary navigation interface across all pages

**Structure**:
- Collapsible sections with Bloomberg-style design
- MARKETS section: links to Market Overview Dashboard, individual asset categories
- AI INTELLIGENCE section: link to AI Investment Committee Page
- NEWS section: link to news feed (if implemented)
- ANALYTICS section: link to analytics tools (if implemented)

**Status Indicator**:
- Live status indicator at bottom showing API connection status
- Displays: Connected (green) / Disconnected (red)

**Active Route Highlighting**:
- Current page highlighted in navigation menu

## 4. Business Rules and Logic

### 4.1 AI Committee Debate Logic

**Data Fetching**:
- When user selects an asset, system fetches:
  - Recent news articles from NewsAPI filtered by asset symbol
  - Current and historical price data from Finnhub or Alpha Vantage
  - Company information and sentiment data from Finnhub

**Argument Generation (Rule-Based Engine)**:

**Bull Agent Logic**:
- News Agent: analyzes positive sentiment in recent headlines, assigns confidence based on number and recency of positive articles
- Quant Agent: evaluates price momentum (recent price increases), assigns confidence based on percentage gain over lookback period
- Macro Agent: applies pre-defined bullish macro factors per asset category (e.g., tech sector growth for AAPL, gold demand for XAUUSD)
- Overall Bull confidence: weighted average of three sub-agents

**Bear Agent Logic**:
- News Agent: analyzes negative sentiment in recent headlines
- Quant Agent: evaluates price weakness (recent price decreases, high volatility)
- Macro Agent: applies pre-defined bearish macro factors per asset category
- Overall Bear confidence: weighted average of three sub-agents

**Judge Agent Logic**:
- Calculates confidence differential: Bull confidence minus Bear confidence
- Verdict rules:
  - If differential > +20: BUY verdict
  - If differential between -20 and +20: HOLD verdict
  - If differential < -20: SELL verdict
- Risk flags: generated based on volatility, news sentiment variance, data quality
- Judge confidence: reflects data completeness and consistency

**Debate Rounds**:
- Round 1: Initial arguments based on latest data
- Round 2: Refined arguments incorporating counter-arguments
- Final Verdict: Judge renders decision

### 4.2 Live Data Update Rules

**Ticker Bar (Home Page)**:
- Fetches quotes from Finnhub API every 5 seconds
- Displays: symbol, price, percentage change
- Scrolls continuously from right to left

**Market Overview Dashboard**:
- Fetches quotes for all displayed assets every 10 seconds
- Updates sparkline charts with new data points
- Recalculates top movers on each update

**AI Committee Page**:
- News timeline refreshes when \"Rerun Debate\" is clicked or asset is changed
- Confidence meters animate to new values on debate regeneration

### 4.3 API Key Management

**Finnhub API**:
- Key: d81qdgpr01qrojfcp20gd81qdgpr01qrojfcp210
- Used for: real-time quotes, company news, sentiment data

**Alpha Vantage API**:
- Key: Q07QPO53RBL3OQWA
- Used for: quote data, technical indicators

**NewsAPI**:
- Key: v9NSpLzpbNJpH75KsmOvu8SAxSLdpw2t
- Used for: financial news articles for debate timeline

### 4.4 Design System Application

**Color Palette**:
- bg0: #0C0E12 (deepest background)
- bg1: #131722 (panel background)
- bg2: #1E222D (card background)
- bg3: #2A2E39 (hover/elevated states)
- brand: #2962FF (Bloomberg blue for primary actions)
- up: #26A69A (green for positive values)
- dn: #EF5350 (red for negative values)
- warn: #FF9800 (orange for warnings)
- text0: #FFF (primary text)
- text1: #D1D4DC (secondary text)
- text2: #787B86 (tertiary text)
- text3: #50535E (disabled text)

**Typography**:
- UI text: Inter font family
- Data/numbers: JetBrains Mono font family

**Animation Principles**:
- Professional micro-animations: fade in, slide up, pulse on live data updates
- Smooth transitions for all state changes
- No flashy or neon effects

## 5. Exception and Boundary Cases

| Scenario | Handling |
|----------|----------|
| API request fails (network error) | Display error state with retry button, show toast notification with error message |
| API rate limit exceeded | Display warning message, implement exponential backoff for retries |
| No news articles found for selected asset | Display \"No recent news available\" message in news timeline |
| Invalid API key | Display error state, prompt user to check configuration |
| Asset data unavailable | Show \"Data unavailable\" placeholder in market grid, exclude from top movers |
| Debate generation fails | Display error message, allow user to retry with \"Rerun Debate\" button |
| Slow API response | Show loading skeleton while fetching data, timeout after 30 seconds |
| User selects asset not supported by API | Display \"Asset not supported\" message, disable debate generation |

## 6. Acceptance Criteria

1. User opens application and lands on Home Page, sees animated hero section with live ticker bar displaying real-time prices from Finnhub API
2. User clicks \"AI Committee\" button, navigates to AI Investment Committee Page
3. User selects TSLA from asset selector, system fetches news from NewsAPI and price data from Finnhub/Alpha Vantage
4. System displays three-column debate with Bull/Bear/Judge agents, each showing confidence meters and sub-agent arguments
5. User clicks \"Rerun Debate\" button, system fetches fresh data and regenerates debate with updated confidence scores and verdict
6. User clicks \"Enter Terminal\" from Home Page, navigates to Market Overview Dashboard
7. User sees market data grid with live prices, percentage changes, and mini sparkline charts across all category tabs
8. User observes live updates: prices refresh every 10 seconds, top movers section updates automatically

## 7. Out of Scope for This Release

- User authentication and login system
- Portfolio management and trade execution capabilities
- Historical data charting beyond mini sparklines
- Customizable watchlists
- Alert and notification system
- Mobile app version
- Backend server implementation (all API calls from frontend)
- Database for storing user preferences or historical data
- Advanced technical indicators beyond what APIs provide
- Multi-language support
- Dark/light theme toggle (dark theme only)
- Export functionality for reports or data
- Integration with brokerage accounts
- Real-time WebSocket streaming (using polling instead)
- Options chain data
- Backtesting capabilities
- Social features (sharing, commenting)
- Advanced filtering and search across news/data
- Custom alert rules
- Performance optimization for screens smaller than 1920px width