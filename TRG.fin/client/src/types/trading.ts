export interface Position {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  entry: number;
  size: number;
  leverage?: number;
  stopLoss?: number;
  takeProfit?: number;
  maxRisk?: number;
  commission?: number;
  slippage?: number;
  pnl: number;
  pnlPercent: number;
  timestamp: number;
  riskMetrics?: {
    riskRewardRatio: number;
    positionSizePercent: number;
    marginUsagePercent: number;
  };
}

export interface PricePoint {
  timestamp: number;
  price: number;
  volume: number;
  indicators?: {
    sma?: number;
    ema?: number;
    rsi?: number;
    macd?: number;
    signal?: number;
    histogram?: number;
    upperBand?: number;
    lowerBand?: number;
    middleBand?: number;
  };
}

export interface GameState {
  level: number;
  experience: number;
  experienceToNextLevel: number;
  achievements: string[];
  highScore: number;
  totalTrades: number;
  winningTrades: number;
}

export interface OrderBook {
  bids: Array<[number, number]>; // [price, size]
  asks: Array<[number, number]>;
}

export interface Order extends Position {
  orderType: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
  limitPrice?: number;
  stopPrice?: number;
  status: 'PENDING' | 'FILLED' | 'CANCELLED';
}

export interface TechnicalIndicator {
  name: string;
  value: number;
  color: string;
  visible?: boolean;
  period?: number;
  type?: 'TREND' | 'MOMENTUM' | 'VOLATILITY' | 'VOLUME';
}

export interface MarginAccount {
  equity: number;
  maintenance: number;
  marginUsed: number;
  marginAvailable: number;
  leverage: number;
}

export interface MarketDepth {
  price: number;
  size: number;
  total: number;
  percent: number;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: number;
  sentiment: number;
  source: string;
  url?: string;
}

export interface TradingBot {
  id: string;
  name: string;
  strategy: 'MEAN_REVERSION' | 'TREND_FOLLOWING' | 'GRID_TRADING' | 'ARBITRAGE';
  active: boolean;
  parameters: Record<string, number>;
  performance: {
    totalTrades: number;
    winRate: number;
    profitLoss: number;
    sharpeRatio?: number;
    maxDrawdown?: number;
  };
}

export interface Portfolio {
  cash: number;
  equity: number;
  dayPnL: number;
  totalPnL: number;
  positions: Position[];
  marginUsed: number;
  marginAvailable: number;
  riskMetrics: {
    var: number; // Value at Risk
    sharpeRatio: number;
    beta: number;
    alpha: number;
    maxDrawdown?: number;
    sortino?: number;
    treynor?: number;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  reward: number;
  unlocked: boolean;
  progress: number;
  category: 'TRADING' | 'RISK' | 'PROFIT' | 'STRATEGY';
  requirements?: {
    trades?: number;
    profitTarget?: number;
    winRate?: number;
    timeFrame?: number;
  };
}

export interface MarketCondition {
  trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
  volatility: 'LOW' | 'MEDIUM' | 'HIGH';
  volume: 'LOW' | 'MEDIUM' | 'HIGH';
  sentiment: number; // -1 to 1
  correlations: Record<string, number>;
  momentum?: 'STRONG' | 'WEAK' | 'NEUTRAL';
  marketPhase?: 'ACCUMULATION' | 'MARKUP' | 'DISTRIBUTION' | 'MARKDOWN';
}

export interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  signals: {
    entry: boolean;
    exit: boolean;
    direction: 'LONG' | 'SHORT' | 'NEUTRAL';
    strength: number;
  };
  parameters: Record<string, number>;
  performance: {
    winRate: number;
    profitFactor: number;
    drawdown: number;
    sharpeRatio?: number;
    sortino?: number;
    calmar?: number;
  };
}

export interface RiskManagement {
  maxPositionSize: number;
  maxDrawdown: number;
  stopLossPercentage: number;
  takeProfitPercentage: number;
  riskPerTrade: number;
  marginCallThreshold: number;
  maxLeverage?: number;
  portfolioDiversification?: {
    maxSectorExposure: number;
    maxSinglePositionSize: number;
    correlationLimit: number;
  };
}

export interface GameSettings {
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  marketHours: boolean;
  realismLevel: number;
  tutorialMode: boolean;
  notifications: boolean;
  soundEffects: boolean;
  tradingFees?: boolean;
  slippage?: boolean;
  realTimeData?: boolean;
  volatilityLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface MarketSentiment {
  overall: 'very_bearish' | 'bearish' | 'neutral' | 'bullish' | 'very_bullish';
  indicators: {
    volatilityIndex: number;
    advanceDeclineRatio: number;
    marketBreadth: number;
    tradingVolume: number;
    putCallRatio?: number;
    fearGreedIndex?: number;
    marketMomentum?: number;
  };
  technicalSignals?: {
    shortTerm: 'BUY' | 'SELL' | 'NEUTRAL';
    mediumTerm: 'BUY' | 'SELL' | 'NEUTRAL';
    longTerm: 'BUY' | 'SELL' | 'NEUTRAL';
  };
}

export interface User {
  username: string;
  wallet: number;
  portfolio: {
    [key: string]: {
      quantity: number;
      avgCost: number;
      market: 'NSE' | 'CRYPTO';
    };
  };
}

export interface PriceAlert {
  symbol: string;
  targetPrice: number;
  type: 'above' | 'below';
  id: string;
} 