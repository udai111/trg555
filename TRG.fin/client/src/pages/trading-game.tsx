import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Play, Pause, RefreshCw, TrendingUp, TrendingDown, DollarSign,
  Activity, Trophy, Star, Timer, Coins, Settings, ChevronDown,
  BarChart2, LineChart as LineChartIcon, CandlestickChart, Percent, Lock, Unlock
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Area, AreaChart
} from 'recharts';
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { MarketDepthView } from '@/components/trading-game/MarketDepthView';
import { MarginAccountPanel } from '@/components/trading-game/MarginAccountPanel';
import { NewsPanel } from '@/components/trading-game/NewsPanel';
import { TradingHistory } from '@/components/trading-game/TradingHistory';
import {
  getAvailableSymbols,
  fetchQuote,
  fetchHistoricalData,
  fetchMarketDepth,
  fetchMarketSentiment,
  calculateTechnicalIndicators,
  API_BASE_URL
} from '@/services/yahoo-finance';
import { fetchLatestNews, generateSimulatedNews } from '@/services/news-service';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface Position {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  entry: number;
  size: number;
  pnl: number;
  pnlPercent: number;
  timestamp: number;
}

interface PricePoint {
  timestamp: number;
  price: number;
  volume: number;
}

interface GameState {
  level: number;
  experience: number;
  experienceToNextLevel: number;
  achievements: string[];
  highScore: number;
  totalTrades: number;
  winningTrades: number;
}

interface OrderBook {
  bids: Array<[number, number]>; // [price, size]
  asks: Array<[number, number]>;
}

interface Order extends Position {
  orderType: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
  limitPrice?: number;
  stopPrice?: number;
  status: 'PENDING' | 'FILLED' | 'CANCELLED';
}

interface TechnicalIndicator {
  name: string;
  value: number;
  color: string;
}

interface MarginAccount {
  equity: number;
  maintenance: number;
  marginUsed: number;
  marginAvailable: number;
  leverage: number;
}

interface MarketDepth {
  price: number;
  size: number;
  total: number;
  percent: number;
}

interface NewsItem {
  id: string;
  title: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: number;
}

interface TradingBot {
  id: string;
  name: string;
  strategy: 'MEAN_REVERSION' | 'TREND_FOLLOWING' | 'GRID_TRADING' | 'ARBITRAGE';
  active: boolean;
  parameters: Record<string, number>;
  performance: {
    totalTrades: number;
    winRate: number;
    profitLoss: number;
  };
}

interface Portfolio {
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
  };
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  reward: number;
  unlocked: boolean;
  progress: number;
  category: 'TRADING' | 'RISK' | 'PROFIT' | 'STRATEGY';
}

interface MarketCondition {
  trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
  volatility: 'LOW' | 'MEDIUM' | 'HIGH';
  volume: 'LOW' | 'MEDIUM' | 'HIGH';
  sentiment: number; // -1 to 1
  correlations: Record<string, number>;
}

interface TradingStrategy {
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
  };
}

interface RiskManagement {
  maxPositionSize: number;
  maxDrawdown: number;
  stopLossPercentage: number;
  takeProfitPercentage: number;
  riskPerTrade: number;
  marginCallThreshold: number;
}

interface TechnicalIndicatorSettings {
  name: string;
  type: 'TREND' | 'MOMENTUM' | 'VOLATILITY' | 'VOLUME';
  parameters: Record<string, number>;
  visible: boolean;
  color: string;
}

interface GameSettings {
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  marketHours: boolean;
  realismLevel: number;
  tutorialMode: boolean;
  notifications: boolean;
  soundEffects: boolean;
}

interface MarketSentiment {
  overall: 'very_bearish' | 'bearish' | 'neutral' | 'bullish' | 'very_bullish';
  indicators: {
    volatilityIndex: number;
    advanceDeclineRatio: number;
    marketBreadth: number;
    tradingVolume: number;
  };
}

const INITIAL_BALANCE = 100000;
const PRICE_HISTORY_LENGTH = 100;
const VOLATILITY = 0.002;
const TICK_INTERVAL = 1000;
const EXPERIENCE_PER_TRADE = 10;
const EXPERIENCE_PER_PROFIT = 0.1;
const ORDER_BOOK_DEPTH = 10;
const COMMISSION_RATE = 0.001; // 0.1% commission per trade
const MAX_LEVERAGE = 10;
const MARGIN_REQUIREMENT = 0.1; // 10% initial margin requirement
const MAINTENANCE_MARGIN = 0.05; // 5% maintenance margin
const LIQUIDATION_THRESHOLD = 0.03; // 3% margin level triggers liquidation

export default function TradingGame() {
  const { toast } = useToast();
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState('1x');
  const [symbol, setSymbol] = useState('AAPL');
  const [orderSize, setOrderSize] = useState('');
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState(150); // Starting price
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    experience: 0,
    experienceToNextLevel: 1000,
    achievements: [],
    highScore: 0,
    totalTrades: 0,
    winningTrades: 0
  });
  const [orderBook, setOrderBook] = useState<OrderBook>({
    bids: [],
    asks: []
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT'>('MARKET');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'candle' | 'area'>('line');
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h'>('1m');
  const chartRef = useRef<any>(null);
  const [marginAccount, setMarginAccount] = useState<MarginAccount>({
    equity: INITIAL_BALANCE,
    maintenance: 0,
    marginUsed: 0,
    marginAvailable: INITIAL_BALANCE,
    leverage: 1
  });
  const [useMargin, setUseMargin] = useState(false);
  const [leverage, setLeverage] = useState(1);
  const [marketDepth, setMarketDepth] = useState<{ bids: MarketDepth[], asks: MarketDepth[] }>({
    bids: [],
    asks: []
  });
  const [news, setNews] = useState<NewsItem[]>([]);
  const [showNews, setShowNews] = useState(false);
  const [volatilityMultiplier, setVolatilityMultiplier] = useState(1);
  const [tradeHistory, setTradeHistory] = useState<Position[]>([]);
  const [tradingBots, setTradingBots] = useState<TradingBot[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio>({
    cash: INITIAL_BALANCE,
    equity: INITIAL_BALANCE,
    dayPnL: 0,
    totalPnL: 0,
    positions: [],
    marginUsed: 0,
    marginAvailable: INITIAL_BALANCE,
    riskMetrics: {
      var: 0,
      sharpeRatio: 0,
      beta: 0,
      alpha: 0
    }
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [marketCondition, setMarketCondition] = useState<MarketCondition>({
    trend: 'SIDEWAYS',
    volatility: 'MEDIUM',
    volume: 'MEDIUM',
    sentiment: 0,
    correlations: {}
  });
  const [activeStrategies, setActiveStrategies] = useState<TradingStrategy[]>([]);
  const [riskManagement, setRiskManagement] = useState<RiskManagement>({
    maxPositionSize: INITIAL_BALANCE * 0.1,
    maxDrawdown: 20,
    stopLossPercentage: 2,
    takeProfitPercentage: 4,
    riskPerTrade: 1,
    marginCallThreshold: 50
  });
  const [indicatorSettings, setIndicatorSettings] = useState<TechnicalIndicatorSettings[]>([]);
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    difficulty: 'BEGINNER',
    marketHours: true,
    realismLevel: 1,
    tutorialMode: true,
    notifications: true,
    soundEffects: true
  });
  const [availableSymbols, setAvailableSymbols] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [technicalIndicators, setTechnicalIndicators] = useState<TechnicalIndicators | null>(null);
  const [marketSentiment, setMarketSentiment] = useState<MarketSentiment | null>(null);
  const [showIndicators, setShowIndicators] = useState(true);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getSpeedMultiplier = () => {
    return parseFloat(speed.replace('x', ''));
  };

  const updateOrderBook = useCallback(() => {
    const spread = currentPrice * 0.002; // 0.2% spread
    const bids: Array<[number, number]> = [];
    const asks: Array<[number, number]> = [];

    for (let i = 0; i < ORDER_BOOK_DEPTH; i++) {
      const bidPrice = currentPrice - spread * (i + 1);
      const askPrice = currentPrice + spread * (i + 1);
      const size = Math.round(Math.random() * 1000) * (ORDER_BOOK_DEPTH - i);
      bids.push([bidPrice, size]);
      asks.push([askPrice, size]);
    }

    setOrderBook({ bids, asks });
  }, [currentPrice]);

  const calculateIndicators = () => {
    const prices = priceHistory.map(p => p.price);
    const volumes = priceHistory.map(p => p.volume);
    
    // Moving Averages
    const sma20 = prices.slice(-20).reduce((sum, p) => sum + p, 0) / 20;
    const sma50 = prices.slice(-50).reduce((sum, p) => sum + p, 0) / 50;
    const sma200 = prices.slice(-200).reduce((sum, p) => sum + p, 0) / 200;
    
    // Exponential Moving Average
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    
    // MACD
    const macd = ema12 - ema26;
    const signalLine = calculateEMA([...Array(9).fill(0), macd], 9);
    const macdHistogram = macd - signalLine;
    
    // RSI
    const rsi = calculateRSI(prices, 14);
    
    // Bollinger Bands
    const { upper, lower, middle } = calculateBollingerBands(prices, 20, 2);
    
    // Volume Indicators
    const obv = calculateOBV(prices, volumes);
    const vwap = calculateVWAP(prices, volumes);
    
    // Momentum Indicators
    const momentum = calculateMomentum(prices, 14);
    const roc = calculateROC(prices, 14);
    
    // Volatility Indicators
    const atr = calculateATR(prices, 14);
    const standardDeviation = calculateStandardDeviation(prices, 20);
    
    // Support and Resistance
    const { support, resistance } = calculateSupportResistance(prices);
    
    // Fibonacci Levels
    const fibLevels = calculateFibonacciLevels(prices);
    
    return {
      movingAverages: {
        sma20,
        sma50,
        sma200,
        ema12,
        ema26
      },
      momentum: {
        macd,
        signalLine,
        macdHistogram,
        rsi,
        momentum,
        roc
      },
      volatility: {
        bollingerBands: {
          upper,
          lower,
          middle
        },
        atr,
        standardDeviation
      },
      volume: {
        obv,
        vwap
      },
      levels: {
        support,
        resistance,
        fibonacci: fibLevels
      }
    };
  };

  // Helper functions for technical indicators
  const calculateEMA = (prices: number[], period: number) => {
    const multiplier = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }
    
    return ema;
  };

  const calculateRSI = (prices: number[], period: number) => {
    const changes = prices.map((p, i) => i > 0 ? p - prices[i-1] : 0).slice(1);
    const gains = changes.map(c => c > 0 ? c : 0);
    const losses = changes.map(c => c < 0 ? -c : 0);
    
    const avgGain = gains.slice(-period).reduce((sum, g) => sum + g, 0) / period;
    const avgLoss = losses.slice(-period).reduce((sum, l) => sum + l, 0) / period;
    
    return 100 - (100 / (1 + avgGain / (avgLoss || 1)));
  };

  const calculateBollingerBands = (prices: number[], period: number, stdDev: number) => {
    const sma = prices.slice(-period).reduce((sum, p) => sum + p, 0) / period;
    const variance = prices.slice(-period)
      .reduce((sum, p) => sum + Math.pow(p - sma, 2), 0) / period;
    const std = Math.sqrt(variance);
    
    return {
      upper: sma + stdDev * std,
      middle: sma,
      lower: sma - stdDev * std
    };
  };

  const calculateOBV = (prices: number[], volumes: number[]) => {
    let obv = 0;
    
    for (let i = 1; i < prices.length; i++) {
      if (prices[i] > prices[i-1]) {
        obv += volumes[i];
      } else if (prices[i] < prices[i-1]) {
        obv -= volumes[i];
      }
    }
    
    return obv;
  };

  const calculateVWAP = (prices: number[], volumes: number[]) => {
    let volumeSum = 0;
    let priceVolumeSum = 0;
    
    for (let i = 0; i < prices.length; i++) {
      volumeSum += volumes[i];
      priceVolumeSum += prices[i] * volumes[i];
    }
    
    return priceVolumeSum / volumeSum;
  };

  const calculateMomentum = (prices: number[], period: number) => {
    if (prices.length < period) return 0;
    return prices[prices.length - 1] - prices[prices.length - period];
  };

  const calculateROC = (prices: number[], period: number) => {
    if (prices.length < period) return 0;
    return ((prices[prices.length - 1] - prices[prices.length - period]) / 
            prices[prices.length - period]) * 100;
  };

  const calculateATR = (prices: number[], period: number) => {
    const ranges = prices.map((p, i) => {
      if (i === 0) return 0;
      const tr = Math.max(
        Math.abs(p - prices[i-1]),
        Math.abs(p - prices[i-1]),
        Math.abs(prices[i-1] - prices[i-1])
      );
      return tr;
    }).slice(1);
    
    return ranges.slice(-period).reduce((sum, r) => sum + r, 0) / period;
  };

  const calculateStandardDeviation = (prices: number[], period: number) => {
    const mean = prices.slice(-period).reduce((sum, p) => sum + p, 0) / period;
    const variance = prices.slice(-period)
      .reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / period;
    return Math.sqrt(variance);
  };

  const calculateSupportResistance = (prices: number[]) => {
    const pivots = findPivots(prices);
    return {
      support: Math.min(...pivots),
      resistance: Math.max(...pivots)
    };
  };

  const findPivots = (prices: number[]) => {
    const pivots: number[] = [];
    
    for (let i = 2; i < prices.length - 2; i++) {
      if (isPivotHigh(prices, i) || isPivotLow(prices, i)) {
        pivots.push(prices[i]);
      }
    }
    
    return pivots;
  };

  const isPivotHigh = (prices: number[], i: number) => {
    return prices[i] > prices[i-1] && 
           prices[i] > prices[i-2] && 
           prices[i] > prices[i+1] && 
           prices[i] > prices[i+2];
  };

  const isPivotLow = (prices: number[], i: number) => {
    return prices[i] < prices[i-1] && 
           prices[i] < prices[i-2] && 
           prices[i] < prices[i+1] && 
           prices[i] < prices[i+2];
  };

  const calculateFibonacciLevels = (prices: number[]) => {
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const diff = high - low;
    
    return {
      level0: low,
      level236: low + diff * 0.236,
      level382: low + diff * 0.382,
      level500: low + diff * 0.5,
      level618: low + diff * 0.618,
      level786: low + diff * 0.786,
      level1000: high
    };
  };

  const updateMarketDepth = useCallback(() => {
    const spread = currentPrice * 0.002;
    const bids: MarketDepth[] = [];
    const asks: MarketDepth[] = [];
    let bidTotal = 0;
    let askTotal = 0;

    for (let i = 0; i < ORDER_BOOK_DEPTH; i++) {
      const bidPrice = currentPrice - spread * (i + 1);
      const askPrice = currentPrice + spread * (i + 1);
      const bidSize = Math.round(Math.random() * 1000) * (ORDER_BOOK_DEPTH - i);
      const askSize = Math.round(Math.random() * 1000) * (ORDER_BOOK_DEPTH - i);
      
      bidTotal += bidSize;
      askTotal += askSize;

      bids.push({
        price: bidPrice,
        size: bidSize,
        total: bidTotal,
        percent: 0 // Will be calculated after
      });

      asks.push({
        price: askPrice,
        size: askSize,
        total: askTotal,
        percent: 0 // Will be calculated after
      });
    }

    // Calculate percentages
    const maxTotal = Math.max(bidTotal, askTotal);
    bids.forEach(bid => bid.percent = (bid.total / maxTotal) * 100);
    asks.forEach(ask => ask.percent = (ask.total / maxTotal) * 100);

    setMarketDepth({ bids, asks });
  }, [currentPrice]);

  const generateNews = useCallback(async () => {
    try {
      const latestNews = await fetchLatestNews(symbol);
      if (latestNews.length > 0) {
        setNews(latestNews);
      } else {
        // Fallback to simulated news if no real news is available
        const simulatedNews = generateSimulatedNews(symbol);
        setNews(prev => [simulatedNews, ...prev].slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      // Fallback to simulated news on error
      const simulatedNews = generateSimulatedNews(symbol);
      setNews(prev => [simulatedNews, ...prev].slice(0, 5));
    }
  }, [symbol]);

  const updateMarginAccount = useCallback(() => {
    const positionValue = positions.reduce((sum, pos) => sum + pos.size * currentPrice, 0);
    const unrealizedPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);
    const marginUsed = positionValue * MARGIN_REQUIREMENT;
    const equity = balance + unrealizedPnL;
    const marginAvailable = equity - marginUsed;
    const maintenance = positionValue * MAINTENANCE_MARGIN;

    setMarginAccount({
      equity,
      maintenance,
      marginUsed,
      marginAvailable,
      leverage
    });

    // Check for liquidation
    if (marginAvailable / equity < LIQUIDATION_THRESHOLD) {
      liquidatePositions();
    }
  }, [positions, currentPrice, balance, leverage]);

  const liquidatePositions = () => {
    positions.forEach(position => closePosition(position));
    toast({
      title: "Margin Call",
      description: "All positions have been liquidated due to insufficient margin.",
      variant: "destructive"
    });
  };

  const updatePrice = useCallback(() => {
    // Market hours check
    if (gameSettings.marketHours) {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const isWeekend = now.getDay() === 0 || now.getDay() === 6;
      const isMarketHours = hour >= 9 && (hour < 16 || (hour === 16 && minute <= 30));
      
      if (isWeekend || !isMarketHours) {
        return;
      }
    }

    // Enhanced price movement calculation
    const trend = marketCondition.trend;
    const baseVolatility = VOLATILITY * volatilityMultiplier;
    
    // Add market sentiment impact
    const sentimentImpact = (marketSentiment?.sentiment || 0) * 0.2;
    
    // Add volume impact
    const volumeImpact = marketCondition.volume === 'HIGH' ? 1.5 : 
                        marketCondition.volume === 'LOW' ? 0.5 : 1;
    
    // Calculate price movement
    let movement = 0;
    
    // Add trend bias
    if (trend === 'UPTREND') movement += baseVolatility * 0.3;
    else if (trend === 'DOWNTREND') movement -= baseVolatility * 0.3;
    
    // Add random walk component
    movement += (Math.random() - 0.5) * baseVolatility * 2;
    
    // Add sentiment impact
    movement += sentimentImpact * baseVolatility;
    
    // Add volume impact
    movement *= volumeImpact;
    
    // Add market depth impact
    const bidAskImbalance = calculateBidAskImbalance();
    movement += bidAskImbalance * baseVolatility * 0.1;
    
    // Add news impact
    const newsImpact = calculateNewsImpact();
    movement += newsImpact * baseVolatility;
    
    // Calculate new price
    const newPrice = Math.max(0.01, currentPrice * (1 + movement));
    
    // Create new price point with enhanced volume calculation
    const volumeMultiplier = Math.abs(movement) > baseVolatility ? 1.5 : 1;
    const newVolume = Math.floor(
      Math.random() * 10000 * volumeMultiplier * 
      (marketCondition.volume === 'HIGH' ? 2 : marketCondition.volume === 'LOW' ? 0.5 : 1)
    );
    
    const newPricePoint: PricePoint = {
      timestamp: Date.now(),
      price: newPrice,
      volume: newVolume,
      indicators: calculateIndicators()
    };

    // Update price history
    setPriceHistory(prev => {
      const updated = [...prev, newPricePoint];
      return updated.length > PRICE_HISTORY_LENGTH ? updated.slice(-PRICE_HISTORY_LENGTH) : updated;
    });
    setCurrentPrice(newPrice);

    // Update all game components
    updateOrderBook();
    calculateIndicators();
    generateNews();
    updateMarketDepth();
    updateMarginAccount();
    calculateRiskMetrics();
    updateMarketCondition();
    updateTradingBots();
    checkAchievements();

    // Update portfolio P&L
    const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);
    const dayPnL = totalPnL - (portfolio.totalPnL || 0);
    setPortfolio(prev => ({
      ...prev,
      dayPnL,
      totalPnL,
      equity: balance + totalPnL
    }));

    // Check stop loss and take profit for all positions
    positions.forEach(position => {
      const pnlPercent = position.pnlPercent;
      if (pnlPercent <= -riskManagement.stopLossPercentage) {
        closePosition(position);
        if (gameSettings.soundEffects) {
          // Play stop loss sound
          new Audio('/sounds/stop-loss.mp3').play().catch(() => {});
        }
        toast({
          title: "Stop Loss Triggered",
          description: `Position closed at ${formatPercent(pnlPercent)} loss`,
          variant: "destructive"
        });
      } else if (pnlPercent >= riskManagement.takeProfitPercentage) {
        closePosition(position);
        if (gameSettings.soundEffects) {
          // Play take profit sound
          new Audio('/sounds/take-profit.mp3').play().catch(() => {});
        }
        toast({
          title: "Take Profit Triggered",
          description: `Position closed at ${formatPercent(pnlPercent)} profit`,
        });
      }
    });

    // Check and execute pending orders
    setOrders(prev => {
      const updatedOrders = prev.map(order => {
        if (order.status !== 'PENDING') return order;

        let shouldExecute = false;
        switch (order.orderType) {
          case 'LIMIT':
            shouldExecute = order.type === 'LONG' 
              ? newPrice <= (order.limitPrice || 0)
              : newPrice >= (order.limitPrice || 0);
            break;
          case 'STOP':
            shouldExecute = order.type === 'LONG'
              ? newPrice >= (order.stopPrice || 0)
              : newPrice <= (order.stopPrice || 0);
            break;
          case 'STOP_LIMIT':
            const stopTriggered = order.type === 'LONG'
              ? newPrice >= (order.stopPrice || 0)
              : newPrice <= (order.stopPrice || 0);
            shouldExecute = stopTriggered && (order.type === 'LONG'
              ? newPrice <= (order.limitPrice || 0)
              : newPrice >= (order.limitPrice || 0));
            break;
        }

        if (shouldExecute) {
          executeOrder(order);
          if (gameSettings.soundEffects) {
            // Play order executed sound
            new Audio('/sounds/order-executed.mp3').play().catch(() => {});
          }
          return { ...order, status: 'FILLED' };
        }
        return order;
      });

      return updatedOrders.filter(order => order.status === 'PENDING');
    });

    // Update positions P&L
    setPositions(prev => prev.map(pos => {
      const pnl = pos.type === 'LONG'
        ? (newPrice - pos.entry) * pos.size
        : (pos.entry - newPrice) * pos.size;
      const pnlPercent = (pnl / (pos.entry * pos.size)) * 100;
      return { ...pos, pnl, pnlPercent };
    }));

    // Show tutorial tooltips if enabled
    if (gameSettings.tutorialMode && gameState.totalTrades === 0) {
      toast({
        title: "Tutorial",
        description: "Try placing your first trade! Click the Buy or Sell button to get started.",
      });
    }
  }, [
    currentPrice,
    speed,
    volatilityMultiplier,
    news,
    marketCondition,
    positions,
    portfolio,
    riskManagement,
    gameSettings,
    gameState,
    balance
  ]);

  const executeOrder = (order: Order) => {
    const leveragedSize = useMargin ? order.size * leverage : order.size;
    const commission = leveragedSize * currentPrice * COMMISSION_RATE;
    const marginRequired = useMargin ? leveragedSize * currentPrice * MARGIN_REQUIREMENT : leveragedSize * currentPrice;

    if (marginRequired > marginAccount.marginAvailable) {
      toast({
        title: "Order Failed",
        description: "Insufficient margin available",
        variant: "destructive"
      });
      return;
    }

    const newPosition: Position = {
      id: Date.now().toString(),
      symbol: order.symbol,
      type: order.type,
      entry: currentPrice,
      size: order.size,
      pnl: -commission,
      pnlPercent: (-commission / (order.size * currentPrice)) * 100,
      timestamp: Date.now()
    };

    setPositions(prev => [...prev, newPosition]);
    setBalance(prev => prev - commission);
    addExperience(EXPERIENCE_PER_TRADE);

    toast({
      title: "Order Executed",
      description: `${order.type} position opened at ${formatCurrency(currentPrice)}`,
    });

    setGameState(prev => ({
      ...prev,
      totalTrades: prev.totalTrades + 1
    }));

    // Add to trade history
    setTradeHistory(prev => [newPosition, ...prev].slice(0, 50));
  };

  const handleAdvancedOrder = () => {
    const size = parseFloat(orderSize);
    if (isNaN(size) || size <= 0) {
      toast({
        title: "Invalid Order",
        description: "Please enter a valid position size.",
        variant: "destructive"
      });
      return;
    }

    const newOrder: Order = {
      id: Date.now().toString(),
      symbol,
      type: 'LONG',
      entry: currentPrice,
      size,
      pnl: 0,
      pnlPercent: 0,
      timestamp: Date.now(),
      orderType,
      status: 'PENDING'
    };

    if (orderType !== 'MARKET') {
      if (orderType === 'LIMIT' || orderType === 'STOP_LIMIT') {
        const limit = parseFloat(limitPrice);
        if (isNaN(limit) || limit <= 0) {
          toast({
            title: "Invalid Order",
            description: "Please enter a valid limit price.",
            variant: "destructive"
          });
          return;
        }
        newOrder.limitPrice = limit;
      }

      if (orderType === 'STOP' || orderType === 'STOP_LIMIT') {
        const stop = parseFloat(stopPrice);
        if (isNaN(stop) || stop <= 0) {
          toast({
            title: "Invalid Order",
            description: "Please enter a valid stop price.",
            variant: "destructive"
          });
          return;
        }
        newOrder.stopPrice = stop;
      }

      setOrders(prev => [...prev, newOrder]);
      toast({
        title: "Order Placed",
        description: `${orderType} order placed for ${symbol}`,
      });
    } else {
      executeOrder(newOrder);
    }

    setOrderSize('');
    setLimitPrice('');
    setStopPrice('');
  };

  const addExperience = (amount: number) => {
    setGameState(prev => {
      const newExperience = prev.experience + amount;
      if (newExperience >= prev.experienceToNextLevel) {
        // Level up
        toast({
          title: "Level Up!",
          description: `Congratulations! You've reached level ${prev.level + 1}!`,
        });
        return {
          ...prev,
          level: prev.level + 1,
          experience: newExperience - prev.experienceToNextLevel,
          experienceToNextLevel: prev.experienceToNextLevel * 1.5
        };
      }
      return {
        ...prev,
        experience: newExperience
      };
    });
  };

  const handleTrade = (type: 'LONG' | 'SHORT', size: number, botId?: string) => {
    // Enhanced risk checks
    const positionValue = size * currentPrice;
    const leveragedValue = useMargin ? positionValue * leverage : positionValue;
    
    // Check account risk limits
    const totalExposure = positions.reduce((sum, pos) => 
      sum + (pos.size * currentPrice * (useMargin ? leverage : 1)), 0);
    const newTotalExposure = totalExposure + leveragedValue;
    
    // Maximum account risk check
    const maxAccountRisk = portfolio.equity * (riskManagement.riskPerTrade / 100);
    if (leveragedValue > maxAccountRisk) {
      toast({
        title: "Position Size Too Large",
        description: `Maximum position size exceeded. Max allowed: ${formatCurrency(maxAccountRisk)}`,
        variant: "destructive"
      });
      return;
    }
    
    // Portfolio concentration check
    const maxConcentration = portfolio.equity * 0.25; // Max 25% in single position
    if (newTotalExposure > maxConcentration) {
      toast({
        title: "Portfolio Concentration Risk",
        description: "Position would exceed maximum portfolio concentration",
        variant: "destructive"
      });
      return;
    }
    
    // Margin requirements check
    if (useMargin) {
      const requiredMargin = leveragedValue * MARGIN_REQUIREMENT;
      if (requiredMargin > marginAccount.marginAvailable) {
        toast({
          title: "Insufficient Margin",
          description: `Required margin: ${formatCurrency(requiredMargin)}`,
          variant: "destructive"
        });
        return;
      }
      
      // Check maintenance margin for existing positions
      const newMarginUsed = marginAccount.marginUsed + requiredMargin;
      const newEquity = marginAccount.equity - (positionValue + commission);
      const newMarginLevel = (newEquity / newMarginUsed) * 100;
      
      if (newMarginLevel < MAINTENANCE_MARGIN * 100) {
        toast({
          title: "Margin Warning",
          description: "Trade would put account below maintenance margin requirement",
          variant: "destructive"
        });
        return;
      }
    }
    
    // Calculate position risk metrics
    const stopLossPrice = type === 'LONG' 
      ? currentPrice * (1 - riskManagement.stopLossPercentage / 100)
      : currentPrice * (1 + riskManagement.stopLossPercentage / 100);
    
    const takeProfitPrice = type === 'LONG'
      ? currentPrice * (1 + riskManagement.takeProfitPercentage / 100)
      : currentPrice * (1 - riskManagement.takeProfitPercentage / 100);
    
    const maxLoss = Math.abs(currentPrice - stopLossPrice) * size;
    const potentialProfit = Math.abs(currentPrice - takeProfitPrice) * size;
    const riskRewardRatio = potentialProfit / maxLoss;
    
    // Check if risk/reward ratio is acceptable
    if (riskRewardRatio < 1.5) {
      toast({
        title: "Poor Risk/Reward",
        description: "Trade has unfavorable risk/reward ratio",
        variant: "warning"
      });
    }
    
    // Calculate commission and slippage
    const commission = leveragedValue * COMMISSION_RATE;
    const estimatedSlippage = calculateSlippage(type, size);
    const totalCost = leveragedValue + commission + estimatedSlippage;
    
    // Check if we have enough balance
    if (totalCost > balance) {
      toast({
        title: "Insufficient Funds",
        description: `Required: ${formatCurrency(totalCost)} (including fees)`,
        variant: "destructive"
      });
      return;
    }

    // Create the position with enhanced tracking
    const newPosition: Position = {
      id: Date.now().toString(),
      symbol,
      type,
      entry: currentPrice,
      size,
      leverage: useMargin ? leverage : 1,
      stopLoss: stopLossPrice,
      takeProfit: takeProfitPrice,
      maxRisk: maxLoss,
      commission,
      slippage: estimatedSlippage,
      pnl: -(commission + estimatedSlippage),
      pnlPercent: 0,
      timestamp: Date.now(),
      riskMetrics: {
        riskRewardRatio,
        positionSizePercent: (leveragedValue / portfolio.equity) * 100,
        marginUsagePercent: useMargin ? (requiredMargin / marginAccount.marginAvailable) * 100 : 0
      }
    };

    // Update positions and account state
    setPositions(prev => [...prev, newPosition]);
    setBalance(prev => prev - totalCost);
    addExperience(EXPERIENCE_PER_TRADE);
    
    // Update margin account if using leverage
    if (useMargin) {
      setMarginAccount(prev => ({
        ...prev,
        marginUsed: prev.marginUsed + requiredMargin,
        marginAvailable: prev.marginAvailable - requiredMargin
      }));
    }

    // Update portfolio metrics
    updatePortfolioMetrics();
    
    toast({
      title: "Trade Executed",
      description: `${type} position opened at ${formatCurrency(currentPrice)}`,
    });

    setGameState(prev => ({
      ...prev,
      totalTrades: prev.totalTrades + 1
    }));

    // Add to trade history
    setTradeHistory(prev => [newPosition, ...prev].slice(0, 50));
  };

  // Helper function to calculate estimated slippage
  const calculateSlippage = (type: 'LONG' | 'SHORT', size: number) => {
    const marketDepthSide = type === 'LONG' ? marketDepth.asks : marketDepth.bids;
    let remainingSize = size;
    let totalSlippage = 0;
    
    for (const level of marketDepthSide) {
      if (remainingSize <= 0) break;
      
      const fillSize = Math.min(remainingSize, level.size);
      const slippage = Math.abs(level.price - currentPrice) * fillSize;
      totalSlippage += slippage;
      remainingSize -= fillSize;
    }
    
    return totalSlippage;
  };

  const updatePortfolioMetrics = () => {
    // Implement the logic to update portfolio metrics
  };

  // Initialize available symbols
  useEffect(() => {
    const symbols = getAvailableSymbols();
    setAvailableSymbols(symbols);
    setSymbol(symbols[0]); // Set first symbol as default
  }, []);

  // Fetch initial market data
  useEffect(() => {
    const initializeMarketData = async () => {
      if (!symbol) return;
      
      try {
        setIsLoading(true);
        setError(null);

        // Fetch historical data
        const historicalData = await fetchHistoricalData(symbol, timeframe);
        const pricePoints: PricePoint[] = historicalData.timestamp.map((timestamp, i) => ({
          timestamp: timestamp * 1000,
          price: historicalData.close[i] || historicalData.close[i-1],
          volume: historicalData.volume[i] || 0
        })).filter(point => point.price);

        setPriceHistory(pricePoints.slice(-PRICE_HISTORY_LENGTH));
        setCurrentPrice(pricePoints[pricePoints.length - 1].price);

        // Fetch market depth
        const depth = await fetchMarketDepth(symbol);
        setMarketDepth(depth);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch market data');
        toast({
          title: "Error",
          description: "Failed to fetch market data. Using simulation mode.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeMarketData();
  }, [symbol, timeframe]);

  // Update market data in real-time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const updateMarketData = async () => {
      if (!isPlaying || !symbol) return;
      
      try {
        // Fetch latest quote
        const quote = await fetchQuote(symbol);
        const newPricePoint: PricePoint = {
          timestamp: Date.now(),
          price: quote.regularMarketPrice,
          volume: quote.regularMarketVolume
        };

        setPriceHistory(prev => {
          const updated = [...prev, newPricePoint];
          return updated.length > PRICE_HISTORY_LENGTH ? updated.slice(-PRICE_HISTORY_LENGTH) : updated;
        });
        setCurrentPrice(quote.regularMarketPrice);

        // Update market depth
        const depth = await fetchMarketDepth(symbol);
        setMarketDepth(depth);

        // Update other components
        calculateIndicators();
        generateNews();
        updateMarginAccount();
        calculateRiskMetrics();
        updateMarketCondition();
        updateTradingBots();
        checkAchievements();

        // Update positions P&L
        setPositions(prev => prev.map(pos => {
          const pnl = pos.type === 'LONG'
            ? (quote.regularMarketPrice - pos.entry) * pos.size
            : (pos.entry - quote.regularMarketPrice) * pos.size;
          const pnlPercent = (pnl / (pos.entry * pos.size)) * 100;
          return { ...pos, pnl, pnlPercent };
        }));

      } catch (err) {
        console.error('Failed to update market data:', err);
      }
    };

    if (isPlaying) {
      interval = setInterval(updateMarketData, TICK_INTERVAL);
    }

    return () => clearInterval(interval);
  }, [isPlaying, symbol]);

  // Add to your useEffect for data fetching
  useEffect(() => {
    const fetchMarketData = async () => {
      if (!symbol) return;
      
      try {
        const sentiment = await fetchMarketSentiment();
        setMarketSentiment(sentiment);
      } catch (error) {
        console.error('Error fetching market data:', error);
      }
    };
    
    fetchMarketData();
    const interval = setInterval(fetchMarketData, TICK_INTERVAL);
    
    return () => clearInterval(interval);
  }, [symbol]);

  // Add new components for technical analysis
  const TechnicalIndicatorsPanel = () => {
    if (!technicalIndicators) return null;
    
    const { rsi, macd, bollingerBands } = technicalIndicators;
    const latestRSI = rsi[rsi.length - 1];
    const latestMACD = {
      value: macd.macdLine[macd.macdLine.length - 1],
      signal: macd.signalLine[macd.signalLine.length - 1],
      histogram: macd.histogram[macd.histogram.length - 1]
    };
    
    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Technical Indicators</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowIndicators(!showIndicators)}
            >
              {showIndicators ? 'Hide' : 'Show'}
            </Button>
          </div>
        </CardHeader>
        {showIndicators && (
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>RSI (14)</Label>
                <div className="flex items-center gap-2">
                  <Progress value={latestRSI} max={100} className="flex-1" />
                  <span className={cn(
                    "font-medium",
                    latestRSI > 70 ? "text-red-500" :
                    latestRSI < 30 ? "text-green-500" :
                    "text-gray-500"
                  )}>
                    {latestRSI.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div>
                <Label>MACD</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">MACD Line</span>
                    <div className={cn(
                      "font-medium",
                      latestMACD.value > 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {latestMACD.value.toFixed(4)}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Signal Line</span>
                    <div className="font-medium">
                      {latestMACD.signal.toFixed(4)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Bollinger Bands</Label>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Upper</span>
                    <div className="font-medium">
                      {bollingerBands.upper[bollingerBands.upper.length - 1]?.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Middle</span>
                    <div className="font-medium">
                      {bollingerBands.middle[bollingerBands.middle.length - 1]?.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Lower</span>
                    <div className="font-medium">
                      {bollingerBands.lower[bollingerBands.lower.length - 1]?.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  const MarketSentimentPanel = () => {
    if (!marketSentiment) return null;
    
    const sentimentColors = {
      very_bearish: "bg-red-500",
      bearish: "bg-red-300",
      neutral: "bg-gray-300",
      bullish: "bg-green-300",
      very_bullish: "bg-green-500"
    };
    
    return (
      <Card className="mb-4">
        <CardHeader>
          <h3 className="text-lg font-semibold">Market Sentiment</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Overall Sentiment</Label>
              <div className="flex items-center gap-2">
                <Badge className={sentimentColors[marketSentiment.overall]}>
                  {marketSentiment.overall.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
            
            <div>
              <Label>Market Indicators</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Volatility Index</span>
                  <div className="font-medium">
                    {marketSentiment.indicators.volatilityIndex.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Advance/Decline Ratio</span>
                  <div className="font-medium">
                    {marketSentiment.indicators.advanceDeclineRatio.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Market Breadth</span>
                  <div className={cn(
                    "font-medium",
                    marketSentiment.indicators.marketBreadth > 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {marketSentiment.indicators.marketBreadth}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          {/* Existing chart and order components */}
        </div>
        <div>
          <TechnicalIndicatorsPanel />
          <MarketSentimentPanel />
          {/* Existing components */}
        </div>
      </div>
    </div>
  );
} 