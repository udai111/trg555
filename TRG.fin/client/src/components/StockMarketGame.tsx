import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { createChart, ColorType, IChartApi } from 'lightweight-charts';
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, Wallet, Clock, User as UserIcon, Terminal, BarChart2, X, Trophy,
  Users, Award, Gamepad, LineChart, Settings, Bell, BellOff, Star, PieChart, BarChart, ArrowUpRight,
  ArrowDownRight, DollarSign, Percent, Target, Zap
} from "lucide-react";

// Import trading game components
import { TechnicalIndicators } from './trading-game/TechnicalIndicators';
import { PortfolioAnalytics } from './trading-game/PortfolioAnalytics';
import { NewsFeed } from './trading-game/NewsFeed';
import { MarketSentimentView } from './trading-game/MarketSentimentView';
import { MarketDepthView } from './trading-game/MarketDepthView';
import { TradingHistory } from './trading-game/TradingHistory';
import { MarginAccountPanel } from './trading-game/MarginAccountPanel';
import { MLPredictionComponent } from './trading-game/MLPredictionComponent';

// Import types
import {
  Position,
  PricePoint,
  GameState,
  OrderBook,
  Order,
  TechnicalIndicator,
  MarginAccount,
  MarketDepth,
  NewsItem,
  TradingBot,
  Portfolio,
  Achievement,
  MarketCondition,
  TradingStrategy,
  RiskManagement,
  GameSettings,
  MarketSentiment,
  User,
  PriceAlert
} from '@/types/trading';

// Import market data
import { StockData, INITIAL_NSE_STOCKS, INITIAL_CRYPTO } from './data/market-data';

// Constants
const INITIAL_BALANCE = 100000;
const PRICE_HISTORY_LENGTH = 100;
const VOLATILITY = 0.002;
const TICK_INTERVAL = 1000;
const EXPERIENCE_PER_TRADE = 10;
const EXPERIENCE_PER_PROFIT = 0.1;
const ORDER_BOOK_DEPTH = 10;
const COMMISSION_RATE = 0.001;
const MAX_LEVERAGE = 10;
const MARGIN_REQUIREMENT = 0.1;
const MAINTENANCE_MARGIN = 0.05;
const LIQUIDATION_THRESHOLD = 0.03;

export default function StockMarketGame() {
  const { toast } = useToast();
  const [activeMarket, setActiveMarket] = useState<'NSE' | 'CRYPTO'>('NSE');
  const [nseStocks, setNseStocks] = useState<StockData[]>(INITIAL_NSE_STOCKS);
  const [cryptos, setCryptos] = useState<StockData[]>(INITIAL_CRYPTO);
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<StockData | null>(null);
  const [quantity, setQuantity] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showRetroMode, setShowRetroMode] = useState(false);
  const [showProMode, setShowProMode] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // Game State
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    experience: 0,
    experienceToNextLevel: 1000,
    achievements: [],
    highScore: 0,
    totalTrades: 0,
    winningTrades: 0
  });

  // Trading State
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [speed, setSpeed] = useState('1x');
  const [symbol, setSymbol] = useState('AAPL');
  const [orderSize, setOrderSize] = useState('');
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState(150);
  const [orderBook, setOrderBook] = useState<OrderBook>({ bids: [], asks: [] });

  // Advanced trading state
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT'>('MARKET');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'candle' | 'area'>('line');
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h'>('1m');

  // Technical analysis state
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([]);
  const [showIndicators, setShowIndicators] = useState(true);

  // Risk management state
  const [marginAccount, setMarginAccount] = useState<MarginAccount>({
    equity: INITIAL_BALANCE,
    maintenance: 0,
    marginUsed: 0,
    marginAvailable: INITIAL_BALANCE,
    leverage: 1
  });
  const [useMargin, setUseMargin] = useState(false);
  const [leverage, setLeverage] = useState(1);

  // Market data state
  const [marketDepth, setMarketDepth] = useState<{ bids: MarketDepth[], asks: MarketDepth[] }>({
    bids: [],
    asks: []
  });
  const [marketSentiment, setMarketSentiment] = useState<MarketSentiment | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [tradeHistory, setTradeHistory] = useState<Position[]>([]);

  // Game settings state
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    difficulty: 'BEGINNER',
    marketHours: true,
    realismLevel: 1,
    tutorialMode: true,
    notifications: true,
    soundEffects: true
  });

  // Portfolio state
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

  // Trading bots and strategies
  const [tradingBots, setTradingBots] = useState<TradingBot[]>([]);
  const [activeStrategies, setActiveStrategies] = useState<TradingStrategy[]>([]);

  // Risk management settings
  const [riskManagement, setRiskManagement] = useState<RiskManagement>({
    maxPositionSize: INITIAL_BALANCE * 0.1,
    maxDrawdown: 20,
    stopLossPercentage: 2,
    takeProfitPercentage: 4,
    riskPerTrade: 1,
    marginCallThreshold: 50
  });

  // Market condition tracking
  const [marketCondition, setMarketCondition] = useState<MarketCondition>({
    trend: 'SIDEWAYS',
    volatility: 'MEDIUM',
    volume: 'MEDIUM',
    sentiment: 0,
    correlations: {}
  });

  // Price alerts
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertPrice, setAlertPrice] = useState('');

  // Game Controls
  const [showTutorial, setShowTutorial] = useState(true);

  // Add additional state for position management
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [stopLossPrice, setStopLossPrice] = useState('');
  const [takeProfitPrice, setTakeProfitPrice] = useState('');
  const [portfolioHistory, setPortfolioHistory] = useState<{timestamp: number, equity: number}[]>([]);
  const [showPortfolioChart, setShowPortfolioChart] = useState(false);
  const portfolioChartRef = useRef<HTMLDivElement>(null);
  const portfolioChartInstance = useRef<IChartApi | null>(null);

  // Add trading bot state and functions
  const [activeBots, setActiveBots] = useState<TradingBot[]>([]);
  const [showBotModal, setShowBotModal] = useState(false);
  const [botSymbol, setBotSymbol] = useState('');
  const [botStrategy, setBotStrategy] = useState<'TREND_FOLLOWING' | 'MEAN_REVERSION' | 'BREAKOUT'>('TREND_FOLLOWING');
  const [botAmount, setBotAmount] = useState('1000');
  const [botInterval, setBotInterval] = useState(5); // Minutes

  // Add news impact on prices
  const [marketNews, setMarketNews] = useState<{
    timestamp: number;
    headline: string;
    impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    magnitude: number; // 0-1
    affectedSymbols: string[];
  }[]>([]);

  // Add new state variables for market simulation
  const [marketHours, setMarketHours] = useState({
    isOpen: true,
    nextEvent: '',
    nextEventTime: 0
  });

  const [volatilitySpikes, setVolatilitySpikes] = useState({
    current: VOLATILITY,
    events: [] as { trigger: string; magnitude: number; duration: number }[]
  });

  const [bidAskSpread, setBidAskSpread] = useState<{[key: string]: number}>({});
  const [orderBookDepth, setOrderBookDepth] = useState<{[key: string]: {
    bids: { price: number; volume: number }[];
    asks: { price: number; volume: number }[];
  }[]}>({});

  // Utility functions
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

  // Game mechanics
  const handleLogin = () => {
    if (!username) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive"
      });
      return;
    }

    setUser({
      username,
      wallet: INITIAL_BALANCE,
      portfolio: {}
    });
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('stockGameUser');
    toast({
      title: "Logged out",
      description: "Come back soon!"
    });
  };

  // Trading functions
  const handleTrade = useCallback((type: 'LONG' | 'SHORT', size: number) => {
    if (!selectedAsset) {
      toast({
        title: "No Asset Selected",
        description: "Please select an asset to trade",
        variant: "destructive"
      });
      return;
    }

    if (!size || size <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity",
        variant: "destructive"
      });
      return;
    }

    // Calculate trade value
    const tradeValue = size * selectedAsset.price;
    const leveragedValue = useMargin ? tradeValue * leverage : tradeValue;
    
    // Check if user has enough funds
    if (leveragedValue > portfolio.cash) {
      toast({
        title: "Insufficient Funds",
        description: `You need ${formatCurrency(leveragedValue)} for this trade`,
        variant: "destructive"
      });
      return;
    }

    // Calculate commission
    const commission = tradeValue * COMMISSION_RATE;
    
    // Calculate slippage (0.1% to 0.5% based on size)
    const slippagePercent = 0.1 + (size / 1000) * 0.4; // Larger trades have more slippage
    const slippage = tradeValue * (slippagePercent / 100);
    
    // Calculate execution price with slippage
    const executionPrice = type === 'LONG' 
      ? selectedAsset.price * (1 + slippagePercent / 100) 
      : selectedAsset.price * (1 - slippagePercent / 100);
    
    // Handle different order types
    if (orderType !== 'MARKET') {
      // For non-market orders, create an order and add it to the orders list
      const newOrder: Order = {
        id: Math.random().toString(36).substr(2, 9),
        symbol: selectedAsset.symbol,
        type,
        orderType,
        size,
        price: selectedAsset.price,
        limitPrice: orderType === 'LIMIT' || orderType === 'STOP_LIMIT' ? Number(limitPrice) : undefined,
        stopPrice: orderType === 'STOP' || orderType === 'STOP_LIMIT' ? Number(stopPrice) : undefined,
        status: 'PENDING',
        createdAt: Date.now()
      };
      
      setOrders(prev => [...prev, newOrder]);
      
      toast({
        title: "Order Placed",
        description: `${orderType} order for ${size} ${selectedAsset.symbol} has been placed`,
        variant: "default"
      });
      
      return;
    }
    
    // For market orders, execute immediately
    
    // Create new position
    const newPosition: Position = {
      id: Math.random().toString(36).substr(2, 9),
      symbol: selectedAsset.symbol,
      type,
      entry: executionPrice,
      size,
      pnl: 0,
      pnlPercent: 0,
      timestamp: Date.now(),
      commission,
      leveraged: useMargin,
      leverage: useMargin ? leverage : 1
    };

    // Update positions
    setPositions(prev => [...prev, newPosition]);
    
    // Update portfolio
    setPortfolio(prev => {
      const totalCost = tradeValue + commission;
      
      return {
        ...prev,
        cash: prev.cash - totalCost,
        positions: [...prev.positions, newPosition],
        marginUsed: useMargin ? prev.marginUsed + (tradeValue * (leverage - 1)) : prev.marginUsed,
        marginAvailable: useMargin 
          ? prev.marginAvailable - (tradeValue * (leverage - 1)) 
          : prev.marginAvailable
      };
    });

    // Update game state
    setGameState(prev => ({
      ...prev,
      totalTrades: prev.totalTrades + 1,
      experience: prev.experience + EXPERIENCE_PER_TRADE
    }));

    // Clear inputs
    setQuantity('');
    setLimitPrice('');
    setStopPrice('');

    toast({
      title: "Trade Executed",
      description: `${type} ${size} ${selectedAsset.symbol} at ${formatCurrency(executionPrice)}`,
      variant: "default"
    });
  }, [selectedAsset, portfolio.cash, orderType, limitPrice, stopPrice, useMargin, leverage, toast]);

  // Process pending orders
  useEffect(() => {
    if (!isPlaying || orders.length === 0) return;
    
    const interval = setInterval(() => {
      setOrders(prevOrders => {
        const updatedOrders = [...prevOrders];
        let ordersChanged = false;
        
        updatedOrders.forEach(order => {
          if (order.status !== 'PENDING') return;
          
          // Find the current price for the order's symbol
          const asset = [...nseStocks, ...cryptos].find(a => a.symbol === order.symbol);
          if (!asset) return;
          
          let shouldExecute = false;
          
          switch (order.orderType) {
            case 'LIMIT':
              // Execute limit buy when price falls below limit, limit sell when price rises above limit
              shouldExecute = order.type === 'LONG' 
                ? asset.price <= (order.limitPrice || 0)
                : asset.price >= (order.limitPrice || 0);
              break;
              
            case 'STOP':
              // Execute stop buy when price rises above stop, stop sell when price falls below stop
              shouldExecute = order.type === 'LONG'
                ? asset.price >= (order.stopPrice || 0)
                : asset.price <= (order.stopPrice || 0);
              break;
              
            case 'STOP_LIMIT':
              // First check if stop price is triggered
              const stopTriggered = order.type === 'LONG'
                ? asset.price >= (order.stopPrice || 0)
                : asset.price <= (order.stopPrice || 0);
                
              // Then check if limit condition is met
              if (stopTriggered) {
                shouldExecute = order.type === 'LONG'
                  ? asset.price <= (order.limitPrice || 0)
                  : asset.price >= (order.limitPrice || 0);
              }
              break;
          }
          
          if (shouldExecute) {
            // Execute the order
            order.status = 'FILLED';
            ordersChanged = true;
            
            // Calculate trade value
            const tradeValue = order.size * asset.price;
            const commission = tradeValue * COMMISSION_RATE;
            
            // Create new position
            const newPosition: Position = {
              id: Math.random().toString(36).substr(2, 9),
              symbol: order.symbol,
              type: order.type,
              entry: asset.price,
              size: order.size,
              pnl: 0,
              pnlPercent: 0,
              timestamp: Date.now(),
              commission,
              leveraged: false,
              leverage: 1
            };
            
            // Update positions
            setPositions(prev => [...prev, newPosition]);
            
            // Update portfolio
            setPortfolio(prev => ({
              ...prev,
              cash: prev.cash - (tradeValue + commission),
              positions: [...prev.positions, newPosition]
            }));
            
            // Update game state
            setGameState(prev => ({
              ...prev,
              totalTrades: prev.totalTrades + 1,
              experience: prev.experience + EXPERIENCE_PER_TRADE
            }));
            
            toast({
              title: "Order Filled",
              description: `${order.type} ${order.size} ${order.symbol} at ${formatCurrency(asset.price)}`,
              variant: "default"
            });
          }
        });
        
        return ordersChanged ? updatedOrders : prevOrders;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPlaying, orders, nseStocks, cryptos, toast]);

  // Level Up System
  const checkLevelUp = useCallback(() => {
    setGameState(prev => {
      if (prev.experience >= prev.experienceToNextLevel) {
        const newLevel = prev.level + 1;
        toast({
          title: "Level Up!",
          description: `Congratulations! You've reached level ${newLevel}`,
          variant: "default"
        });
        return {
          ...prev,
          level: newLevel,
          experience: prev.experience - prev.experienceToNextLevel,
          experienceToNextLevel: Math.floor(prev.experienceToNextLevel * 1.5)
        };
      }
      return prev;
    });
  }, [toast]);

  // Game Loop
  useEffect(() => {
    if (!isPlaying) return;

    const gameLoop = setInterval(() => {
      try {
        // Update time elapsed
        setTimeElapsed(prev => prev + 1);
        
        // Update market sentiment periodically
        if (timeElapsed % 10 === 0) {
          try {
            // Generate new market sentiment
            const sentimentOptions = ['bullish', 'bearish', 'neutral'] as const;
            const newSentiment = sentimentOptions[Math.floor(Math.random() * 3)];
            const newVix = 10 + Math.random() * 20; // VIX between 10 and 30
            const newAdvanceDeclineRatio = 0.7 + Math.random() * 0.6; // Between 0.7 and 1.3
            
            setMarketSentiment({
              sentiment: newSentiment,
              vix: newVix,
              advanceDeclineRatio: newAdvanceDeclineRatio
            });
            
            // Update market condition based on sentiment
            setMarketCondition(prev => ({
              ...prev,
              trend: newSentiment === 'bullish' ? 'UPTREND' : 
                    newSentiment === 'bearish' ? 'DOWNTREND' : 'SIDEWAYS',
              volatility: newVix > 25 ? 'HIGH' : newVix > 15 ? 'MEDIUM' : 'LOW',
              sentiment: newSentiment === 'bullish' ? 1 : 
                        newSentiment === 'bearish' ? -1 : 0
            }));
          } catch (error) {
            console.error("Error updating market sentiment:", error);
            toast({
              title: "Error",
              description: "Problem updating market sentiment",
              variant: "destructive"
            });
          }
        }
        
        // Update NSE stocks
        try {
          setNseStocks(prevStocks => {
            return prevStocks.map(stock => {
              // Base volatility depends on market condition
              const baseVolatility = marketCondition.volatility === 'HIGH' ? VOLATILITY * 2 :
                                    marketCondition.volatility === 'MEDIUM' ? VOLATILITY :
                                    VOLATILITY * 0.5;
              
              // Trend bias based on market condition
              const trendBias = marketCondition.trend === 'UPTREND' ? 0.2 :
                             marketCondition.trend === 'DOWNTREND' ? -0.2 : 0;
              
              // Sentiment impact
              const sentimentImpact = marketCondition.sentiment * 0.1;
              
              // Calculate price change with all factors
              const randomFactor = (Math.random() - 0.5) * 2; // Between -1 and 1
              const priceChange = (
                (baseVolatility * randomFactor) + // Random component
                (trendBias / 100) + // Trend bias
                (sentimentImpact / 100) // Sentiment impact
              ) * gameSpeed;
              
              // Calculate new price
              const newPrice = stock.price * (1 + priceChange);
              
              // Calculate new change percentage (daily)
              const newChange = ((newPrice / stock.open) - 1) * 100;
              
              // Generate new volume
              const volumeMultiplier = 1 + Math.abs(priceChange) * 10; // Higher price changes = higher volume
              const newVolume = stock.volume * (0.9 + Math.random() * 0.2 * volumeMultiplier);
              
              return {
                ...stock,
                price: newPrice,
                change: newChange,
                volume: newVolume,
                high: Math.max(stock.high, newPrice),
                low: Math.min(stock.low, newPrice)
              };
            });
          });
        } catch (error) {
          console.error("Error updating NSE stocks:", error);
          toast({
            title: "Error",
            description: "Problem updating NSE stocks",
            variant: "destructive"
          });
        }
        
        // Update crypto prices similarly
        setCryptos(prevCryptos => {
          return prevCryptos.map(crypto => {
            // Crypto has higher volatility
            const baseVolatility = marketCondition.volatility === 'HIGH' ? VOLATILITY * 3 :
                                  marketCondition.volatility === 'MEDIUM' ? VOLATILITY * 2 :
                                  VOLATILITY;
            
            // Trend bias based on market condition
            const trendBias = marketCondition.trend === 'UPTREND' ? 0.3 :
                             marketCondition.trend === 'DOWNTREND' ? -0.3 : 0;
            
            // Sentiment impact (crypto reacts more to sentiment)
            const sentimentImpact = marketCondition.sentiment * 0.2;
            
            // Calculate price change with all factors
            const randomFactor = (Math.random() - 0.5) * 2; // Between -1 and 1
            const priceChange = (
              (baseVolatility * randomFactor) + // Random component
              (trendBias / 100) + // Trend bias
              (sentimentImpact / 100) // Sentiment impact
            ) * gameSpeed;
            
            // Calculate new price
            const newPrice = crypto.price * (1 + priceChange);
            
            // Calculate new change percentage (daily)
            const newChange = ((newPrice / crypto.open) - 1) * 100;
            
            // Generate new volume
            const volumeMultiplier = 1 + Math.abs(priceChange) * 15; // Higher price changes = higher volume
            const newVolume = crypto.volume * (0.9 + Math.random() * 0.2 * volumeMultiplier);
            
            return {
              ...crypto,
              price: newPrice,
              change: newChange,
              volume: newVolume,
              high: Math.max(crypto.high, newPrice),
              low: Math.min(crypto.low, newPrice)
            };
          });
        });
        
        // If we have a selected asset, update its price history
        if (selectedAsset) {
          const asset = [...nseStocks, ...cryptos].find(a => a.symbol === selectedAsset.symbol);
          if (asset) {
            // Update selected asset
            setSelectedAsset(asset);
            
            // Add to price history
            setPriceHistory(history => {
              const newHistory = [...history, {
                timestamp: Date.now(),
                price: asset.price,
                volume: asset.volume
              }];
              
              // Keep history at a reasonable length
              if (newHistory.length > PRICE_HISTORY_LENGTH) {
                return newHistory.slice(newHistory.length - PRICE_HISTORY_LENGTH);
              }
              
              return newHistory;
            });
          }
        }

        // Update positions P&L
        setPositions(positions => positions.map(pos => {
          // Find current price for the position's symbol
          const asset = [...nseStocks, ...cryptos].find(a => a.symbol === pos.symbol);
          if (!asset) return pos;
          
          const currentPrice = asset.price;
          const leverageFactor = pos.leveraged ? pos.leverage : 1;
          
          const pnl = pos.type === 'LONG' 
            ? (currentPrice - pos.entry) * pos.size * leverageFactor
            : (pos.entry - currentPrice) * pos.size * leverageFactor;
            
          const pnlPercent = (pnl / (pos.entry * pos.size)) * 100;
          
          return { ...pos, pnl, pnlPercent };
        }));
        
        // Update portfolio metrics
        setPortfolio(prev => {
          // Calculate total position value and P&L
          let totalPositionValue = 0;
          let totalPnL = 0;
          
          positions.forEach(pos => {
            const asset = [...nseStocks, ...cryptos].find(a => a.symbol === pos.symbol);
            if (!asset) return;
            
            const currentPrice = asset.price;
            const positionValue = pos.size * currentPrice;
            
            totalPositionValue += positionValue;
            totalPnL += pos.pnl;
          });
          
          // Calculate new equity
          const newEquity = prev.cash + totalPositionValue;
          
          return {
            ...prev,
            equity: newEquity,
            totalPnL,
            dayPnL: totalPnL // In a real app, this would be reset daily
          };
        });

        checkLevelUp();
      } catch (error) {
        console.error("Error in game loop:", error);
        toast({
          title: "Error",
          description: "Problem in game loop",
          variant: "destructive"
        });
      }
    }, TICK_INTERVAL / gameSpeed);

    return () => clearInterval(gameLoop);
  }, [isPlaying, gameSpeed, selectedAsset, nseStocks, cryptos, positions, marketCondition, timeElapsed, checkLevelUp]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || !selectedAsset) return;

    if (chartRef.current) {
      chartRef.current.remove();
    }

    const isDarkMode = document.documentElement.classList.contains('dark');
    
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
      layout: {
        background: { type: ColorType.Solid, color: isDarkMode ? '#1E1E1E' : '#FFFFFF' },
        textColor: isDarkMode ? '#FFFFFF' : '#1E1E1E',
      },
      grid: {
        vertLines: { color: isDarkMode ? '#2B2B2B' : '#E5E7EB' },
        horzLines: { color: isDarkMode ? '#2B2B2B' : '#E5E7EB' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add price series based on chart type
    let mainSeries;
    
    if (chartType === 'candle') {
      mainSeries = chart.addCandlestickSeries({
        upColor: '#10B981',
        downColor: '#EF4444',
        borderVisible: false,
        wickUpColor: '#10B981',
        wickDownColor: '#EF4444',
      });
    } else if (chartType === 'area') {
      mainSeries = chart.addAreaSeries({
        lineColor: '#2563EB',
        topColor: 'rgba(37, 99, 235, 0.4)',
        bottomColor: 'rgba(37, 99, 235, 0.1)',
      });
    } else {
      // Default to line chart
      mainSeries = chart.addLineSeries({
        color: '#2563EB',
        lineWidth: 2,
      });
    }
    
    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#9CA3AF',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // Generate initial data if we don't have price history
    if (priceHistory.length === 0) {
      // Generate some historical data
      const historicalData = [];
      const volumeData = [];
      
      const now = Date.now();
      const basePrice = selectedAsset.price;
      
      for (let i = 0; i < 100; i++) {
        const time = now - (100 - i) * 60000; // 1 minute intervals
        const volatility = VOLATILITY * (Math.random() + 0.5); // Random volatility
        const change = (Math.random() - 0.5) * volatility * basePrice;
        const price = basePrice * (1 + (i - 50) * 0.0001) + change;
        const volume = Math.random() * 1000 + 500;
        
        if (chartType === 'candle') {
          const open = price * (1 - Math.random() * 0.01);
          const high = Math.max(price, open) * (1 + Math.random() * 0.005);
          const low = Math.min(price, open) * (1 - Math.random() * 0.005);
          const close = price;
          
          historicalData.push({
            time: time / 1000,
            open,
            high,
            low,
            close
          });
        } else {
          historicalData.push({
            time: time / 1000,
            value: price
          });
        }
        
        volumeData.push({
          time: time / 1000,
          value: volume,
          color: change >= 0 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'
        });
      }
      
      mainSeries.setData(historicalData);
      volumeSeries.setData(volumeData);
    } else {
      // Use existing price history
      const chartData = [];
      const volumeData = [];
      
      // Group price history into 1-minute candles
      const groupedData = new Map();
      
      priceHistory.forEach(point => {
        const minuteTimestamp = Math.floor(point.timestamp / 60000) * 60000;
        
        if (!groupedData.has(minuteTimestamp)) {
          groupedData.set(minuteTimestamp, {
            open: point.price,
            high: point.price,
            low: point.price,
            close: point.price,
            volume: point.volume
          });
        } else {
          const candle = groupedData.get(minuteTimestamp);
          candle.high = Math.max(candle.high, point.price);
          candle.low = Math.min(candle.low, point.price);
          candle.close = point.price;
          candle.volume += point.volume;
        }
      });
      
      // Convert grouped data to chart format
      groupedData.forEach((candle, timestamp) => {
        if (chartType === 'candle') {
          chartData.push({
            time: timestamp / 1000,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close
          });
        } else {
          chartData.push({
            time: timestamp / 1000,
            value: candle.close
          });
        }
        
        volumeData.push({
          time: timestamp / 1000,
          value: candle.volume,
          color: candle.close >= candle.open ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'
        });
      });
      
      mainSeries.setData(chartData);
      volumeSeries.setData(volumeData);
    }

    // Handle resize
    const handleResize = createResizeHandler(chartContainerRef, chart);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [selectedAsset, chartType, priceHistory]);

  // Add function to close a position
  const closePosition = useCallback((position: Position) => {
    // Find current price for the position's symbol
    const asset = [...nseStocks, ...cryptos].find(a => a.symbol === position.symbol);
    if (!asset) {
      toast({
        title: "Error",
        description: `Could not find asset with symbol ${position.symbol}`,
        variant: "destructive"
      });
      return;
    }
    
    const currentPrice = asset.price;
    const positionValue = position.size * currentPrice;
    const commission = positionValue * COMMISSION_RATE;
    
    // Calculate P&L
    const pnl = position.type === 'LONG' 
      ? (currentPrice - position.entry) * position.size * (position.leveraged ? position.leverage : 1)
      : (position.entry - currentPrice) * position.size * (position.leveraged ? position.leverage : 1);
    
    // Update portfolio
    setPortfolio(prev => {
      const newCash = prev.cash + positionValue - commission;
      
      return {
        ...prev,
        cash: newCash,
        positions: prev.positions.filter(p => p.id !== position.id),
        marginUsed: position.leveraged 
          ? prev.marginUsed - (position.size * position.entry * (position.leverage - 1)) 
          : prev.marginUsed,
        marginAvailable: position.leveraged
          ? prev.marginAvailable + (position.size * position.entry * (position.leverage - 1))
          : prev.marginAvailable
      };
    });
    
    // Update positions
    setPositions(prev => prev.filter(p => p.id !== position.id));
    
    // Add to trade history
    setTradeHistory(prev => [...prev, {
      ...position,
      exitPrice: currentPrice,
      exitTime: Date.now(),
      finalPnl: pnl
    }]);
    
    // Update game state
    setGameState(prev => {
      const isWinningTrade = pnl > 0;
      const experienceGain = EXPERIENCE_PER_TRADE + (isWinningTrade ? pnl * EXPERIENCE_PER_PROFIT : 0);
      
      return {
        ...prev,
        experience: prev.experience + experienceGain,
        winningTrades: isWinningTrade ? prev.winningTrades + 1 : prev.winningTrades
      };
    });
    
    toast({
      title: "Position Closed",
      description: `${position.type} ${position.size} ${position.symbol} closed with ${pnl >= 0 ? 'profit' : 'loss'} of ${formatCurrency(pnl)}`,
      variant: pnl >= 0 ? "default" : "destructive"
    });
  }, [nseStocks, cryptos, toast]);

  // Add function to set stop-loss and take-profit
  const setPositionLimits = useCallback((position: Position, sl?: number, tp?: number) => {
    setPositions(prev => prev.map(p => {
      if (p.id === position.id) {
        return {
          ...p,
          stopLoss: sl,
          takeProfit: tp
        };
      }
      return p;
    }));
    
    setSelectedPosition(null);
    setShowPositionModal(false);
    setStopLossPrice('');
    setTakeProfitPrice('');
    
    toast({
      title: "Position Updated",
      description: `Stop-loss and take-profit set for ${position.symbol}`,
      variant: "default"
    });
  }, [toast]);

  // Add effect to check stop-loss and take-profit
  useEffect(() => {
    if (!isPlaying || positions.length === 0) return;
    
    const interval = setInterval(() => {
      positions.forEach(position => {
        if (!position.stopLoss && !position.takeProfit) return;
        
        // Find current price for the position's symbol
        const asset = [...nseStocks, ...cryptos].find(a => a.symbol === position.symbol);
        if (!asset) return;
        
        const currentPrice = asset.price;
        
        // Check stop-loss
        if (position.stopLoss) {
          const stopTriggered = position.type === 'LONG'
            ? currentPrice <= position.stopLoss
            : currentPrice >= position.stopLoss;
            
          if (stopTriggered) {
            closePosition(position);
            toast({
              title: "Stop-Loss Triggered",
              description: `${position.symbol} position closed at ${formatCurrency(currentPrice)}`,
              variant: "destructive"
            });
            return;
          }
        }
        
        // Check take-profit
        if (position.takeProfit) {
          const profitTriggered = position.type === 'LONG'
            ? currentPrice >= position.takeProfit
            : currentPrice <= position.takeProfit;
            
          if (profitTriggered) {
            closePosition(position);
            toast({
              title: "Take-Profit Triggered",
              description: `${position.symbol} position closed at ${formatCurrency(currentPrice)}`,
              variant: "default"
            });
            return;
          }
        }
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPlaying, positions, nseStocks, cryptos, closePosition, toast]);

  // Add effect to track portfolio history
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setPortfolioHistory(prev => {
        const newHistory = [...prev, {
          timestamp: Date.now(),
          equity: portfolio.equity
        }];
        
        // Keep history at a reasonable length
        if (newHistory.length > 100) {
          return newHistory.slice(newHistory.length - 100);
        }
        
        return newHistory;
      });
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [isPlaying, portfolio.equity]);

  // Add effect to initialize portfolio chart
  useEffect(() => {
    if (!portfolioChartRef.current || !showPortfolioChart || portfolioHistory.length === 0) return;
    
    if (portfolioChartInstance.current) {
      portfolioChartInstance.current.remove();
    }
    
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    const chart = createChart(portfolioChartRef.current, {
      width: portfolioChartRef.current.clientWidth,
      height: 200,
      layout: {
        background: { type: ColorType.Solid, color: isDarkMode ? '#1E1E1E' : '#FFFFFF' },
        textColor: isDarkMode ? '#FFFFFF' : '#1E1E1E',
      },
      grid: {
        vertLines: { color: isDarkMode ? '#2B2B2B' : '#E5E7EB' },
        horzLines: { color: isDarkMode ? '#2B2B2B' : '#E5E7EB' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });
    
    portfolioChartInstance.current = chart;
    
    // Add equity series
    const equitySeries = chart.addAreaSeries({
      lineColor: '#10B981',
      topColor: 'rgba(16, 185, 129, 0.4)',
      bottomColor: 'rgba(16, 185, 129, 0.1)',
    });
    
    // Format data for chart
    const chartData = portfolioHistory.map(point => ({
      time: point.timestamp / 1000,
      value: point.equity
    }));
    
    equitySeries.setData(chartData);
    
    // Handle resize
    const handleResize = createResizeHandler(portfolioChartRef, chart);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [showPortfolioChart, portfolioHistory]);

  // Function to create a new trading bot
  const createBot = useCallback(() => {
    if (!botSymbol || Number(botAmount) <= 0) {
      toast({
        title: "Invalid Bot Configuration",
        description: "Please select a symbol and enter a valid amount",
        variant: "destructive"
      });
      return;
    }
    
    const newBot: TradingBot = {
      id: Math.random().toString(36).substr(2, 9),
      symbol: botSymbol,
      strategy: botStrategy,
      amount: Number(botAmount),
      interval: botInterval * 60 * 1000, // Convert to milliseconds
      lastTradeTime: 0,
      active: true,
      profitLoss: 0
    };
    
    setActiveBots(prev => [...prev, newBot]);
    setShowBotModal(false);
    
    toast({
      title: "Trading Bot Created",
      description: `${botStrategy} bot for ${botSymbol} activated`,
      variant: "default"
    });
  }, [botSymbol, botStrategy, botAmount, botInterval, toast]);

  // Function to toggle bot active state
  const toggleBot = useCallback((botId: string) => {
    setActiveBots(prev => prev.map(bot => 
      bot.id === botId ? { ...bot, active: !bot.active } : bot
    ));
  }, []);

  // Function to delete a bot
  const deleteBot = useCallback((botId: string) => {
    setActiveBots(prev => prev.filter(bot => bot.id !== botId));
    
    toast({
      title: "Trading Bot Deleted",
      description: "Bot has been removed",
      variant: "default"
    });
  }, [toast]);

  // Effect to run trading bots
  useEffect(() => {
    if (!isPlaying || activeBots.length === 0) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      
      setActiveBots(prevBots => {
        const updatedBots = [...prevBots];
        let botsChanged = false;
        
        updatedBots.forEach(bot => {
          if (!bot.active) return;
          
          // Check if it's time for the bot to trade
          if (now - bot.lastTradeTime < bot.interval) return;
          
          // Find the asset
          const asset = [...nseStocks, ...cryptos].find(a => a.symbol === bot.symbol);
          if (!asset) return;
          
          // Determine trade direction based on strategy
          let tradeType: 'LONG' | 'SHORT' | null = null;
          
          switch (bot.strategy) {
            case 'TREND_FOLLOWING':
              // Follow the trend - buy in uptrends, sell in downtrends
              if (marketCondition.trend === 'UPTREND') {
                tradeType = 'LONG';
              } else if (marketCondition.trend === 'DOWNTREND') {
                tradeType = 'SHORT';
              }
              break;
              
            case 'MEAN_REVERSION':
              // Go against short-term moves - buy on dips, sell on rallies
              if (asset.change < -1) {
                tradeType = 'LONG';
              } else if (asset.change > 1) {
                tradeType = 'SHORT';
              }
              break;
              
            case 'BREAKOUT':
              // Trade breakouts - buy on upside breakouts, sell on downside breakouts
              const recentPrices = priceHistory
                .filter(p => p.timestamp > now - 5 * 60 * 1000) // Last 5 minutes
                .map(p => p.price);
                
              if (recentPrices.length > 0) {
                const avg = recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;
                const stdDev = Math.sqrt(
                  recentPrices.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) / recentPrices.length
                );
                
                if (asset.price > avg + stdDev) {
                  tradeType = 'LONG';
                } else if (asset.price < avg - stdDev) {
                  tradeType = 'SHORT';
                }
              }
              break;
          }
          
          // Execute trade if direction determined
          if (tradeType) {
            // Calculate quantity based on bot amount and current price
            const quantity = Math.floor(bot.amount / asset.price);
            
            if (quantity > 0) {
              // Check if we have enough funds
              if (bot.amount <= portfolio.cash) {
                // Create new position
                const newPosition: Position = {
                  id: Math.random().toString(36).substr(2, 9),
                  symbol: bot.symbol,
                  type: tradeType,
                  entry: asset.price,
                  size: quantity,
                  pnl: 0,
                  pnlPercent: 0,
                  timestamp: now,
                  commission: quantity * asset.price * COMMISSION_RATE,
                  leveraged: false,
                  leverage: 1,
                  bot: bot.id
                };
                
                // Update positions
                setPositions(prev => [...prev, newPosition]);
                
                // Update portfolio
                setPortfolio(prev => ({
                  ...prev,
                  cash: prev.cash - (quantity * asset.price)
                }));
                
                // Update bot
                bot.lastTradeTime = now;
                botsChanged = true;
                
                toast({
                  title: "Bot Trade Executed",
                  description: `${bot.strategy} bot ${tradeType} ${quantity} ${bot.symbol}`,
                  variant: "default"
                });
              }
            }
          }
        });
        
        return botsChanged ? updatedBots : prevBots;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPlaying, activeBots, nseStocks, cryptos, portfolio.cash, priceHistory, marketCondition, toast]);

  // Effect to generate market news
  useEffect(() => {
    if (!isPlaying) return;
    
    // Generate news every 2-5 minutes
    const interval = setInterval(() => {
      try {
        const newsTypes = [
          { headline: "Central Bank Announces Interest Rate Decision", impact: Math.random() > 0.5 ? 'POSITIVE' : 'NEGATIVE', magnitude: 0.5 + Math.random() * 0.5 },
          { headline: "Quarterly Earnings Reports Released", impact: Math.random() > 0.5 ? 'POSITIVE' : 'NEGATIVE', magnitude: 0.3 + Math.random() * 0.7 },
          { headline: "Economic Data Shows Unexpected Results", impact: Math.random() > 0.5 ? 'POSITIVE' : 'NEGATIVE', magnitude: 0.2 + Math.random() * 0.4 },
          { headline: "Market Sentiment Shifts on Global Events", impact: Math.random() > 0.6 ? 'POSITIVE' : Math.random() > 0.5 ? 'NEGATIVE' : 'NEUTRAL', magnitude: 0.1 + Math.random() * 0.3 },
          { headline: "Regulatory Changes Announced for Financial Markets", impact: Math.random() > 0.5 ? 'POSITIVE' : 'NEGATIVE', magnitude: 0.4 + Math.random() * 0.4 }
        ];
        
        const selectedNews = newsTypes[Math.floor(Math.random() * newsTypes.length)];
        
        // Select random symbols to be affected
        const allSymbols = [...nseStocks, ...cryptos].map(a => a.symbol);
        if (allSymbols.length === 0) {
          console.error("No symbols available for news generation");
          return;
        }
        
        const numAffected = Math.floor(Math.random() * 3) + 1; // 1-3 symbols affected
        const affectedSymbols: string[] = [];
        
        for (let i = 0; i < numAffected; i++) {
          const randomSymbol = allSymbols[Math.floor(Math.random() * allSymbols.length)];
          if (!affectedSymbols.includes(randomSymbol)) {
            affectedSymbols.push(randomSymbol);
          }
        }
        
        const newNews = {
          timestamp: Date.now(),
          headline: selectedNews.headline,
          impact: selectedNews.impact as 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL',
          magnitude: selectedNews.magnitude,
          affectedSymbols
        };
        
        setMarketNews(prev => [...prev, newNews]);
        
        // Apply immediate impact to affected symbols
        try {
          affectedSymbols.forEach(symbol => {
            const impactMultiplier = newNews.impact === 'POSITIVE' ? 1 : newNews.impact === 'NEGATIVE' ? -1 : 0;
            const priceImpact = newNews.magnitude * impactMultiplier * 0.01; // 0-1% impact
            
            // Update NSE stocks
            setNseStocks(prev => prev.map(stock => {
              if (stock.symbol === symbol) {
                const newPrice = stock.price * (1 + priceImpact);
                return {
                  ...stock,
                  price: newPrice,
                  change: ((newPrice / stock.open) - 1) * 100
                };
              }
              return stock;
            }));
            
            // Update cryptos
            setCryptos(prev => prev.map(crypto => {
              if (crypto.symbol === symbol) {
                const newPrice = crypto.price * (1 + priceImpact);
                return {
                  ...crypto,
                  price: newPrice,
                  change: ((newPrice / crypto.open) - 1) * 100
                };
              }
              return crypto;
            }));
          });
        } catch (error) {
          console.error("Error applying news impact to symbols:", error);
        }
        
        // Notify user
        if (newNews.impact !== 'NEUTRAL') {
          toast({
            title: "Market News",
            description: `${newNews.headline} - Affecting ${affectedSymbols.join(', ')}`,
            variant: newNews.impact === 'POSITIVE' ? "default" : "destructive"
          });
        }
      } catch (error) {
        console.error("Error generating market news:", error);
      }
    }, 120000 + Math.random() * 180000); // 2-5 minutes
    
    return () => clearInterval(interval);
  }, [isPlaying, nseStocks, cryptos, toast]);

  // Add market hours simulation
  useEffect(() => {
    if (!isPlaying) return;

    const checkMarketHours = () => {
      try {
        const now = new Date();
        const day = now.getDay();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const timeInMinutes = hours * 60 + minutes;

        // Validate that we have valid date and time values
        if (isNaN(day) || isNaN(hours) || isNaN(minutes)) {
          console.error("Invalid date/time values detected");
          return;
        }

        // Market is closed on weekends
        if (day === 0 || day === 6) {
          setMarketHours({
            isOpen: false,
            nextEvent: 'Market Opens',
            nextEventTime: getNextMarketOpen(now)
          });
          return false;
        }

        // Regular market hours: 9:30 AM - 4:00 PM
        const marketOpen = 9 * 60 + 30;  // 9:30 AM
        const marketClose = 16 * 60;     // 4:00 PM

        const isOpen = timeInMinutes >= marketOpen && timeInMinutes < marketClose;
        
        setMarketHours({
          isOpen,
          nextEvent: isOpen ? 'Market Closes' : 'Market Opens',
          nextEventTime: isOpen ? marketClose : getNextMarketOpen(now)
        });

        return isOpen;
      } catch (error) {
        console.error("Error checking market hours:", error);
        // Set reasonable defaults if there's an error
        setMarketHours({
          isOpen: true,
          nextOpen: new Date(),
          nextClose: new Date(Date.now() + 3600000) // 1 hour from now
        });
      }
    };

    const interval = setInterval(checkMarketHours, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Add volatility spikes simulation
  useEffect(() => {
    if (!isPlaying) return;

    const generateVolatilityEvent = () => {
      const events = [
        { name: 'Economic Data Release', probability: 0.3, maxMagnitude: 3 },
        { name: 'Breaking News', probability: 0.2, maxMagnitude: 4 },
        { name: 'Market Sentiment Shift', probability: 0.15, maxMagnitude: 2.5 },
        { name: 'Technical Breakout', probability: 0.25, maxMagnitude: 2 },
        { name: 'Sector Rotation', probability: 0.1, maxMagnitude: 1.5 }
      ];

      const roll = Math.random();
      let cumulativeProbability = 0;
      
      for (const event of events) {
        cumulativeProbability += event.probability;
        if (roll <= cumulativeProbability) {
          const magnitude = 1 + Math.random() * (event.maxMagnitude - 1);
          const duration = Math.floor(Math.random() * 10) + 5; // 5-15 minutes
          
          setVolatilitySpikes(prev => ({
            current: VOLATILITY * magnitude,
            events: [...prev.events, { trigger: event.name, magnitude, duration }]
          }));

          toast({
            title: "Market Alert",
            description: `${event.name} causing increased volatility (${magnitude.toFixed(1)}x normal)`,
            variant: "default"
          });

          // Schedule volatility normalization
          setTimeout(() => {
            setVolatilitySpikes(prev => ({
              ...prev,
              current: VOLATILITY,
              events: prev.events.filter(e => e.trigger !== event.name)
            }));
          }, duration * 60 * 1000);
          
          break;
        }
      }
    };

    const interval = setInterval(generateVolatilityEvent, 300000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, [isPlaying, toast]);

  // Add bid-ask spread simulation
  useEffect(() => {
    if (!isPlaying) return;

    const updateBidAskSpreads = () => {
      const newSpreads: {[key: string]: number} = {};
      
      [...nseStocks, ...cryptos].forEach(asset => {
        // Base spread is 0.1% for stocks, 0.2% for crypto
        const baseSpread = asset.symbol.includes('USDT') ? 0.002 : 0.001;
        
        // Factors affecting spread
        const volumeFactor = 1 + (1 / Math.sqrt(asset.volume / 1000));
        const volatilityFactor = 1 + (volatilitySpikes.current / VOLATILITY - 1) * 2;
        const marketHoursFactor = marketHours.isOpen ? 1 : 1.5;
        
        // Calculate final spread
        const spread = baseSpread * volumeFactor * volatilityFactor * marketHoursFactor;
        newSpreads[asset.symbol] = spread;
      });
      
      setBidAskSpread(newSpreads);
    };

    const interval = setInterval(updateBidAskSpreads, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, nseStocks, cryptos, volatilitySpikes, marketHours]);

  // Add order book depth simulation
  useEffect(() => {
    if (!isPlaying || !selectedAsset) return;

    const generateOrderBook = () => {
      const spread = bidAskSpread[selectedAsset.symbol] || 0.001;
      const midPrice = selectedAsset.price;
      const bidPrice = midPrice * (1 - spread/2);
      const askPrice = midPrice * (1 + spread/2);
      
      const bids: { price: number; volume: number }[] = [];
      const asks: { price: number; volume: number }[] = [];
      
      // Generate 10 levels of bids and asks
      for (let i = 0; i < 10; i++) {
        const bidPriceLevel = bidPrice * (1 - 0.001 * i);
        const askPriceLevel = askPrice * (1 + 0.001 * i);
        
        // Volume decreases as we move away from the mid price
        const baseVolume = selectedAsset.volume / 100;
        const volumeDecay = Math.exp(-i/3);
        
        bids.push({
          price: bidPriceLevel,
          volume: baseVolume * volumeDecay * (0.8 + Math.random() * 0.4)
        });
        
        asks.push({
          price: askPriceLevel,
          volume: baseVolume * volumeDecay * (0.8 + Math.random() * 0.4)
        });
      }
      
      setOrderBookDepth(prev => ({
        ...prev,
        [selectedAsset.symbol]: { bids, asks }
      }));
    };

    const interval = setInterval(generateOrderBook, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, selectedAsset, bidAskSpread]);

  // Update price calculation in game loop to consider market hours and volatility
  useEffect(() => {
    if (!isPlaying || !marketHours.isOpen) return;

    const gameLoop = setInterval(() => {
      // Update NSE stocks
      setNseStocks(prevStocks => {
        return prevStocks.map(stock => {
          // Enhanced price movement calculation
          const spread = bidAskSpread[stock.symbol] || 0.001;
          const baseVolatility = volatilitySpikes.current;
          const marketDepth = orderBookDepth[stock.symbol];
          
          // Calculate order book imbalance
          let bidAskImbalance = 0;
          if (marketDepth) {
            const totalBidVolume = marketDepth.bids.reduce((sum, level) => sum + level.volume, 0);
            const totalAskVolume = marketDepth.asks.reduce((sum, level) => sum + level.volume, 0);
            bidAskImbalance = (totalBidVolume - totalAskVolume) / (totalBidVolume + totalAskVolume);
          }
          
          // Calculate price change components
          const randomWalk = (Math.random() - 0.5) * 2 * baseVolatility;
          const trendComponent = marketCondition.trend === 'UPTREND' ? baseVolatility * 0.2 :
                               marketCondition.trend === 'DOWNTREND' ? -baseVolatility * 0.2 : 0;
          const depthImpact = bidAskImbalance * baseVolatility * 0.3;
          const newsImpact = calculateNewsImpact(stock.symbol);
          
          // Combine all components for final price change
          const priceChange = (
            randomWalk +
            trendComponent +
            depthImpact +
            newsImpact
          ) * gameSpeed;
          
          // Calculate new price
          const newPrice = stock.price * (1 + priceChange);
          
          // Update stock data
          return {
            ...stock,
            price: newPrice,
            change: ((newPrice / stock.open) - 1) * 100,
            high: Math.max(stock.high, newPrice),
            low: Math.min(stock.low, newPrice),
            volume: calculateNewVolume(stock, priceChange)
          };
        });
      });

      // Similar updates for crypto prices...
    }, TICK_INTERVAL);

    return () => clearInterval(gameLoop);
  }, [isPlaying, marketHours.isOpen, volatilitySpikes, bidAskSpread, orderBookDepth, gameSpeed, marketCondition]);

  // Helper functions
  const getNextMarketOpen = (now: Date) => {
    const nextOpen = new Date(now);
    nextOpen.setHours(9, 30, 0, 0);
    
    // If we're past today's opening, move to next business day
    if (now.getHours() >= 9 && now.getMinutes() >= 30) {
      nextOpen.setDate(nextOpen.getDate() + 1);
    }
    
    // Skip weekends
    while (nextOpen.getDay() === 0 || nextOpen.getDay() === 6) {
      nextOpen.setDate(nextOpen.getDate() + 1);
    }
    
    return nextOpen.getTime();
  };

  const calculateNewsImpact = (symbol: string) => {
    const recentNews = marketNews
      .filter(news => 
        news.affectedSymbols.includes(symbol) &&
        Date.now() - news.timestamp < 30 * 60 * 1000 // News affects price for 30 minutes
      );
      
    return recentNews.reduce((impact, news) => {
      const timeFactor = Math.exp(-(Date.now() - news.timestamp) / (15 * 60 * 1000));
      const direction = news.impact === 'POSITIVE' ? 1 : news.impact === 'NEGATIVE' ? -1 : 0;
      return impact + (direction * news.magnitude * timeFactor * VOLATILITY);
    }, 0);
  };

  const calculateNewVolume = (stock: StockData, priceChange: number) => {
    const baseVolume = stock.volume;
    const volatilityImpact = Math.abs(priceChange) / VOLATILITY;
    const timeOfDay = new Date().getHours() + new Date().getMinutes() / 60;
    
    // Volume tends to be higher at market open and close
    const timeFactorOpen = Math.exp(-((timeOfDay - 9.5) ** 2) / 2);
    const timeFactorClose = Math.exp(-((timeOfDay - 16) ** 2) / 2);
    const timeFactor = Math.max(timeFactorOpen, timeFactorClose);
    
    return baseVolume * (0.8 + volatilityImpact * 0.4 + timeFactor * 0.3);
  };

  // Render functions
  const renderGameHeader = () => (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6" />
          <span className="text-lg font-bold">Level {gameState.level}</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="w-6 h-6" />
          <span>XP: {gameState.experience}/{gameState.experienceToNextLevel}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button
          onClick={() => setIsPlaying(!isPlaying)}
          variant={isPlaying ? "destructive" : "default"}
        >
          {isPlaying ? "Pause" : "Start"}
        </Button>
        <div className="flex items-center gap-2">
          <Label>Game Speed</Label>
          <Input
            type="number"
            min="1"
            max="10"
            value={gameSpeed}
            onChange={(e) => setGameSpeed(Number(e.target.value))}
            className="w-20"
          />
        </div>
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          <span className="font-bold">{formatCurrency(portfolio.cash)}</span>
        </div>
      </div>
    </div>
  );

  const renderPortfolioPerformance = () => (
    <Card className="mt-4">
      <CardHeader className="py-3">
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <LineChart className="w-5 h-5" />
            Portfolio Performance
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => setShowPortfolioChart(!showPortfolioChart)}
          >
            {showPortfolioChart ? <X className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {showPortfolioChart ? (
          <div ref={portfolioChartRef} className="w-full h-[200px]" />
        ) : (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-sm font-medium">Total Equity</div>
                <div className="text-2xl font-bold">{formatCurrency(portfolio.equity)}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Daily P&L</div>
                <div className={`text-2xl font-bold ${portfolio.dayPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {portfolio.dayPnL >= 0 ? '+' : ''}{formatCurrency(portfolio.dayPnL)}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Cash Balance</span>
                <span>{formatCurrency(portfolio.cash)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Positions Value</span>
                <span>{formatCurrency(portfolio.equity - portfolio.cash)}</span>
              </div>
              {portfolio.marginUsed > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Margin Used</span>
                  <span>{formatCurrency(portfolio.marginUsed)}</span>
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Win Rate</div>
              <div className="w-full bg-accent/20 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500"
                  style={{ 
                    width: `${gameState.totalTrades > 0 
                      ? (gameState.winningTrades / gameState.totalTrades) * 100 
                      : 0}%` 
                  }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>{gameState.winningTrades} / {gameState.totalTrades} trades</span>
                <span>
                  {gameState.totalTrades > 0 
                    ? ((gameState.winningTrades / gameState.totalTrades) * 100).toFixed(1) 
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderActivePositions = () => (
    <Card className="mt-4">
      <CardHeader className="py-3">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Active Positions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[300px] overflow-y-auto">
          {positions.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No active positions
            </div>
          ) : (
            <div className="divide-y">
              {positions.map(position => {
                const asset = [...nseStocks, ...cryptos].find(a => a.symbol === position.symbol);
                const currentPrice = asset?.price || position.entry;
                
                return (
                  <div 
                    key={position.id} 
                    className="p-3 hover:bg-accent/5 cursor-pointer"
                    onClick={() => {
                      setSelectedPosition(position);
                      setStopLossPrice(position.stopLoss?.toString() || '');
                      setTakeProfitPrice(position.takeProfit?.toString() || '');
                      setShowPositionModal(true);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium flex items-center gap-1">
                          {position.type === 'LONG' ? (
                            <ArrowUpRight className="w-4 h-4 text-green-500" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-500" />
                          )}
                          {position.symbol}
                          {position.leveraged && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-700 px-1 rounded">
                              {position.leverage}x
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {position.size} @ {formatCurrency(position.entry)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${position.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(position.pnl)}
                        </div>
                        <div className={`text-xs ${position.pnlPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatPercent(position.pnlPercent)}
                        </div>
                      </div>
                    </div>
                    
                    {(position.stopLoss || position.takeProfit) && (
                      <div className="mt-2 flex gap-2 text-xs">
                        {position.stopLoss && (
                          <div className="bg-red-500/10 text-red-700 px-2 py-1 rounded-full">
                            SL: {formatCurrency(position.stopLoss)}
                          </div>
                        )}
                        {position.takeProfit && (
                          <div className="bg-green-500/10 text-green-700 px-2 py-1 rounded-full">
                            TP: {formatCurrency(position.takeProfit)}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-2 flex justify-between">
                      <div className="text-xs text-muted-foreground">
                        {new Date(position.timestamp).toLocaleTimeString()}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          closePosition(position);
                        }}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderTradingBots = () => (
    <Card className="mt-4">
      <CardHeader className="py-3">
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Trading Bots
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowBotModal(true)}
          >
            Create Bot
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[300px] overflow-y-auto">
          {activeBots.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No active trading bots
            </div>
          ) : (
            <div className="divide-y">
              {activeBots.map(bot => {
                // Find bot positions
                const botPositions = positions.filter(p => p.bot === bot.id);
                const totalValue = botPositions.reduce((sum, pos) => {
                  const asset = [...nseStocks, ...cryptos].find(a => a.symbol === pos.symbol);
                  return sum + (pos.size * (asset?.price || pos.entry));
                }, 0);
                
                const totalPnL = botPositions.reduce((sum, pos) => sum + pos.pnl, 0);
                
                return (
                  <div key={bot.id} className="p-3 hover:bg-accent/5">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium flex items-center gap-1">
                          {bot.symbol}
                          <span className={`text-xs px-1 rounded ${
                            bot.strategy === 'TREND_FOLLOWING' ? 'bg-blue-500/20 text-blue-700' :
                            bot.strategy === 'MEAN_REVERSION' ? 'bg-purple-500/20 text-purple-700' :
                            'bg-yellow-500/20 text-yellow-700'
                          }`}>
                            {bot.strategy.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(bot.amount)} every {bot.interval / (60 * 1000)} min
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={bot.active}
                          onCheckedChange={() => toggleBot(bot.id)}
                          className="data-[state=checked]:bg-green-500"
                        />
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => deleteBot(bot.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex justify-between text-xs">
                      <span>Positions: {botPositions.length}</span>
                      <span className={totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}>
                        P&L: {formatCurrency(totalPnL)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderTradingPanel = () => (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Trading Game</h1>
              <div className="flex items-center gap-4">
                <Switch
                  checked={showAdvanced}
                  onCheckedChange={setShowAdvanced}
                  id="advanced-mode"
                />
                <Label htmlFor="advanced-mode">Advanced Mode</Label>
              </div>
            </div>

            {/* Stock Selection */}
            <div className="mb-4">
              <Tabs defaultValue={activeMarket} onValueChange={(value) => setActiveMarket(value as 'NSE' | 'CRYPTO')}>
                <TabsList className="mb-2">
                  <TabsTrigger value="NSE">NSE Stocks</TabsTrigger>
                  <TabsTrigger value="CRYPTO">Crypto</TabsTrigger>
                </TabsList>
                <TabsContent value="NSE" className="mt-0">
                  <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-2 border rounded-md">
                    {nseStocks.map(stock => (
                      <div 
                        key={stock.symbol}
                        className={`p-2 rounded cursor-pointer flex justify-between items-center ${selectedAsset?.symbol === stock.symbol ? 'bg-primary/20' : 'hover:bg-accent/10'}`}
                        onClick={() => setSelectedAsset(stock)}
                      >
                        <div>
                          <div className="font-medium">{stock.symbol}</div>
                          <div className="text-xs text-muted-foreground">{stock.name}</div>
                        </div>
                        <div className="text-right">
                          <div>₹{stock.price.toFixed(2)}</div>
                          <div className={`text-xs ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="CRYPTO" className="mt-0">
                  <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-2 border rounded-md">
                    {cryptos.map(crypto => (
                      <div 
                        key={crypto.symbol}
                        className={`p-2 rounded cursor-pointer flex justify-between items-center ${selectedAsset?.symbol === crypto.symbol ? 'bg-primary/20' : 'hover:bg-accent/10'}`}
                        onClick={() => setSelectedAsset(crypto)}
                      >
                        <div>
                          <div className="font-medium">{crypto.symbol}</div>
                          <div className="text-xs text-muted-foreground">{crypto.name}</div>
                        </div>
                        <div className="text-right">
                          <div>${crypto.price.toFixed(2)}</div>
                          <div className={`text-xs ${crypto.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {crypto.change >= 0 ? '+' : ''}{crypto.change.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Chart Container */}
            <div className="mb-2">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Label>Chart Type:</Label>
                  <select 
                    className="p-1 border rounded-md bg-background text-sm"
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value as 'line' | 'candle' | 'area')}
                  >
                    <option value="line">Line</option>
                    <option value="candle">Candlestick</option>
                    <option value="area">Area</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Label>Timeframe:</Label>
                  <select 
                    className="p-1 border rounded-md bg-background text-sm"
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value as '1m' | '5m' | '15m' | '1h')}
                  >
                    <option value="1m">1m</option>
                    <option value="5m">5m</option>
                    <option value="15m">15m</option>
                    <option value="1h">1h</option>
                  </select>
                </div>
              </div>
              <div ref={chartContainerRef} className="w-full h-[300px]" />
            </div>

            {/* Selected Asset Info */}
            {selectedAsset && (
              <div className="mb-4 p-3 bg-accent/10 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold">{selectedAsset.symbol}</h3>
                    <p className="text-sm text-muted-foreground">{selectedAsset.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">
                      {activeMarket === 'NSE' ? '₹' : '$'}{selectedAsset.price.toFixed(2)}
                    </div>
                    <div className={`text-sm ${selectedAsset.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {selectedAsset.change >= 0 ? '+' : ''}{selectedAsset.change.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Trading Controls */}
            {selectedAsset ? (
              <div className="space-y-4">
                {showAdvanced && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Order Type</Label>
                      <select 
                        className="w-full p-2 border rounded-md bg-background"
                        value={orderType}
                        onChange={(e) => setOrderType(e.target.value as any)}
                      >
                        <option value="MARKET">Market</option>
                        <option value="LIMIT">Limit</option>
                        <option value="STOP">Stop</option>
                        <option value="STOP_LIMIT">Stop Limit</option>
                      </select>
                    </div>
                    
                    {(orderType === 'LIMIT' || orderType === 'STOP_LIMIT') && (
                      <div>
                        <Label>Limit Price</Label>
                        <Input
                          type="number"
                          value={limitPrice}
                          onChange={(e) => setLimitPrice(e.target.value)}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    )}
                    
                    {(orderType === 'STOP' || orderType === 'STOP_LIMIT') && (
                      <div>
                        <Label>Stop Price</Label>
                        <Input
                          type="number"
                          value={stopPrice}
                          onChange={(e) => setStopPrice(e.target.value)}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    )}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min="0"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      Value: {formatCurrency(Number(quantity) * selectedAsset.price)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => handleTrade('LONG', Number(quantity))}
                      className="flex-1 bg-green-500 hover:bg-green-600"
                      disabled={!selectedAsset || !quantity || Number(quantity) <= 0}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Buy {selectedAsset.symbol}
                    </Button>
                    <Button
                      onClick={() => handleTrade('SHORT', Number(quantity))}
                      className="flex-1 bg-red-500 hover:bg-red-600"
                      disabled={!selectedAsset || !quantity || Number(quantity) <= 0}
                    >
                      <TrendingDown className="w-4 h-4 mr-2" />
                      Sell {selectedAsset.symbol}
                    </Button>
                  </div>
                </div>
                
                {showAdvanced && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={useMargin}
                          onCheckedChange={setUseMargin}
                          id="use-margin"
                        />
                        <Label htmlFor="use-margin">Use Margin</Label>
                      </div>
                    </div>
                    {useMargin && (
                      <div>
                        <Label>Leverage (x{leverage})</Label>
                        <Input
                          type="range"
                          min="1"
                          max={MAX_LEVERAGE}
                          value={leverage}
                          onChange={(e) => setLeverage(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-6 bg-accent/5 rounded-lg">
                <p className="text-muted-foreground">Select a stock or cryptocurrency to start trading</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add ML Prediction Component */}
        {showAdvanced && selectedAsset && (
          <div className="mt-4">
            <MLPredictionComponent 
              symbol={selectedAsset.symbol}
              currentPrice={selectedAsset.price}
              onPredictionComplete={(prediction) => {
                // Handle prediction results
                toast({
                  title: "Prediction Ready",
                  description: `${prediction.trend} trend predicted with ${(prediction.confidence * 100).toFixed(1)}% confidence`,
                  variant: "default"
                });
              }}
            />
          </div>
        )}

        {/* Trading Bots */}
        {showAdvanced && renderTradingBots()}

        {/* Portfolio Performance Chart */}
        {renderPortfolioPerformance()}

        {/* Active Positions */}
        {renderActivePositions()}

        {/* Technical Analysis */}
        {showAdvanced && selectedAsset && <TechnicalIndicators />}
      </div>

      {/* Right Sidebar */}
      <div className="col-span-4 space-y-4">
        <PortfolioAnalytics portfolio={portfolio} />
        
        {/* Orders Panel */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="pending">
              <TabsList className="w-full rounded-none border-b">
                <TabsTrigger value="pending" className="flex-1">Pending</TabsTrigger>
                <TabsTrigger value="filled" className="flex-1">Filled</TabsTrigger>
              </TabsList>
              <TabsContent value="pending" className="p-0">
                <div className="max-h-[200px] overflow-y-auto">
                  {orders.filter(o => o.status === 'PENDING').length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      No pending orders
                    </div>
                  ) : (
                    <div className="divide-y">
                      {orders
                        .filter(o => o.status === 'PENDING')
                        .map(order => (
                          <div key={order.id} className="p-3 hover:bg-accent/5">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">
                                  {order.type} {order.size} {order.symbol}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {order.orderType} @ {
                                    order.orderType === 'LIMIT' ? formatCurrency(order.limitPrice || 0) :
                                    order.orderType === 'STOP' ? formatCurrency(order.stopPrice || 0) :
                                    order.orderType === 'STOP_LIMIT' ? 
                                      `Stop: ${formatCurrency(order.stopPrice || 0)}, Limit: ${formatCurrency(order.limitPrice || 0)}` :
                                      formatCurrency(order.price)
                                  }
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => {
                                    setOrders(prev => prev.filter(o => o.id !== order.id));
                                    toast({
                                      title: "Order Cancelled",
                                      description: `${order.type} order for ${order.size} ${order.symbol} cancelled`,
                                      variant: "default"
                                    });
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(order.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="filled" className="p-0">
                <div className="max-h-[200px] overflow-y-auto">
                  {orders.filter(o => o.status === 'FILLED').length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      No filled orders
                    </div>
                  ) : (
                    <div className="divide-y">
                      {orders
                        .filter(o => o.status === 'FILLED')
                        .map(order => (
                          <div key={order.id} className="p-3 hover:bg-accent/5">
                            <div className="flex justify-between">
                              <div>
                                <div className="font-medium">
                                  {order.type} {order.size} {order.symbol}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {order.orderType} @ {formatCurrency(order.price)}
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(order.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <MarketDepthView symbol={selectedAsset?.symbol} />
        <MarketSentimentView />
        <NewsFeed symbol={selectedAsset?.symbol} />
        <TradingHistory trades={positions} />
        <MarginAccountPanel />
      </div>
    </div>
  );

  // Render welcome screen
  if (!user) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Virtual Trading Game</h1>
            <p className="text-muted-foreground">Experience the thrill of stock trading without financial risk</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="p-6 h-full">
              <div className="flex flex-col justify-center h-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="max-w-lg mx-auto"
                >
                  <h2 className="text-2xl font-bold mb-6 text-center">Welcome to the Stock Market Game</h2>
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-full text-primary">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Practice Trading</h3>
                        <p className="text-muted-foreground">
                          Learn to trade stocks and cryptocurrencies with virtual money in a realistic market environment.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-full text-primary">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Compete with Friends</h3>
                        <p className="text-muted-foreground">
                          Challenge your friends to see who can build the most valuable portfolio.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-full text-primary">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Learn & Improve</h3>
                        <p className="text-muted-foreground">
                          Develop your trading skills without risking real money. Perfect for beginners and experienced traders alike.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                    <h3 className="text-lg font-semibold mb-4">Start Trading Now</h3>
                    <p className="text-muted-foreground mb-4">
                      Enter a username to begin with ₹10,00,000 in virtual cash.
                    </p>
                    <div className="flex gap-3">
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Your username"
                        className="flex-1"
                      />
                      <Button onClick={handleLogin} disabled={!username}>
                        <Gamepad className="mr-2 h-4 w-4" />
                        Start Trading
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Market Overview</h3>
              <div className="space-y-3">
                {INITIAL_NSE_STOCKS.slice(0, 5).map(stock => (
                  <div key={stock.symbol} className="flex justify-between items-center p-2 rounded-lg bg-accent/10">
                    <div>
                      <div className="font-medium">{stock.symbol}</div>
                      <div className="text-xs text-muted-foreground">{stock.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono">₹{stock.price.toFixed(2)}</div>
                      <div className={`text-xs ${stock.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Leaderboard</h3>
              <div className="space-y-3">
                {[
                  { name: "TraderPro", value: 1425000 },
                  { name: "StockWizard", value: 1356000 },
                  { name: "CryptoKing", value: 1289000 },
                  { name: "MarketMaster", value: 1187000 },
                  { name: "BullRider", value: 1095000 }
                ].map((player, index) => (
                  <div key={player.name} className="flex justify-between items-center p-2 rounded-lg bg-accent/10">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                        {index + 1}
                      </div>
                      <div className="font-medium">{player.name}</div>
                    </div>
                    <div className="font-mono">₹{player.value.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Render main game interface
  return (
    <div className="container mx-auto p-4">
      {renderGameHeader()}
      {renderTradingPanel()}

      {/* Tutorial Overlay */}
      {showTutorial && gameSettings.tutorialMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <Card className="w-[500px]">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Welcome to Trading Game!</h2>
              <p className="mb-4">Learn to trade in a risk-free environment. Start with $100,000 virtual money and try to grow your portfolio.</p>
              <Button onClick={() => setShowTutorial(false)} className="w-full">
                Start Trading
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Position Management Modal */}
      {showPositionModal && renderPositionModal()}
      
      {/* Trading Bot Modal */}
      {showBotModal && renderBotModal()}
    </div>
  );
}

// Add position management modal
const renderPositionModal = () => {
  if (!selectedPosition) return null;
  
  const asset = [...nseStocks, ...cryptos].find(a => a.symbol === selectedPosition.symbol);
  if (!asset) return null;
  
  const currentPrice = asset.price;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Manage Position</span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowPositionModal(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <div>
              <div className="font-medium">{selectedPosition.symbol}</div>
              <div className="text-sm text-muted-foreground">
                {selectedPosition.type} {selectedPosition.size} @ {formatCurrency(selectedPosition.entry)}
              </div>
            </div>
            <div className="text-right">
              <div className={`font-medium ${selectedPosition.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(selectedPosition.pnl)}
              </div>
              <div className={`text-xs ${selectedPosition.pnlPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPercent(selectedPosition.pnlPercent)}
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label>Stop-Loss Price</Label>
              <Input
                type="number"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(e.target.value)}
                placeholder={selectedPosition.type === 'LONG' ? 'Below entry price' : 'Above entry price'}
                min="0"
                step="0.01"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Current: {selectedPosition.stopLoss ? formatCurrency(selectedPosition.stopLoss) : 'Not set'}
              </div>
            </div>
            
            <div>
              <Label>Take-Profit Price</Label>
              <Input
                type="number"
                value={takeProfitPrice}
                onChange={(e) => setTakeProfitPrice(e.target.value)}
                placeholder={selectedPosition.type === 'LONG' ? 'Above entry price' : 'Below entry price'}
                min="0"
                step="0.01"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Current: {selectedPosition.takeProfit ? formatCurrency(selectedPosition.takeProfit) : 'Not set'}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              className="flex-1"
              onClick={() => setPositionLimits(
                selectedPosition, 
                stopLossPrice ? Number(stopLossPrice) : undefined, 
                takeProfitPrice ? Number(takeProfitPrice) : undefined
              )}
            >
              <Target className="w-4 h-4 mr-2" />
              Set Limits
            </Button>
            <Button 
              className="flex-1 bg-red-500 hover:bg-red-600"
              onClick={() => {
                closePosition(selectedPosition);
                setShowPositionModal(false);
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Close Position
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Add the trading bot modal to the main render
const renderBotModal = () => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Create Trading Bot</span>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowBotModal(false)}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Symbol</Label>
          <select 
            className="w-full p-2 border rounded-md bg-background"
            value={botSymbol}
            onChange={(e) => setBotSymbol(e.target.value)}
          >
            <option value="">Select Symbol</option>
            {[...nseStocks, ...cryptos].map(asset => (
              <option key={asset.symbol} value={asset.symbol}>
                {asset.symbol} - {asset.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <Label>Strategy</Label>
          <select 
            className="w-full p-2 border rounded-md bg-background"
            value={botStrategy}
            onChange={(e) => setBotStrategy(e.target.value as any)}
          >
            <option value="TREND_FOLLOWING">Trend Following</option>
            <option value="MEAN_REVERSION">Mean Reversion</option>
            <option value="BREAKOUT">Breakout</option>
          </select>
          <div className="text-xs text-muted-foreground mt-1">
            {botStrategy === 'TREND_FOLLOWING' && 'Follows market trends - buys in uptrends, sells in downtrends'}
            {botStrategy === 'MEAN_REVERSION' && 'Trades against short-term moves - buys dips, sells rallies'}
            {botStrategy === 'BREAKOUT' && 'Trades breakouts - buys upside breakouts, sells downside breakouts'}
          </div>
        </div>
        
        <div>
          <Label>Trading Amount</Label>
          <Input
            type="number"
            value={botAmount}
            onChange={(e) => setBotAmount(e.target.value)}
            min="100"
            step="100"
          />
          <div className="text-xs text-muted-foreground mt-1">
            Maximum amount to use per trade
          </div>
        </div>
        
        <div>
          <Label>Trading Interval (minutes)</Label>
          <Input
            type="number"
            value={botInterval}
            onChange={(e) => setBotInterval(Number(e.target.value))}
            min="1"
            max="60"
          />
          <div className="text-xs text-muted-foreground mt-1">
            How often the bot will check for trading opportunities
          </div>
        </div>
        
        <Button className="w-full" onClick={createBot}>
          <Zap className="w-4 h-4 mr-2" />
          Create Bot
        </Button>
      </CardContent>
    </Card>
  </div>
);

// Create a reusable resize handler utility function
const createResizeHandler = (chartRef: React.RefObject<HTMLDivElement>, chart: any) => {
  const handleResize = () => {
    if (chartRef.current && chart) {
      chart.applyOptions({
        width: chartRef.current.clientWidth
      });
    }
  };
  
  return handleResize;
};