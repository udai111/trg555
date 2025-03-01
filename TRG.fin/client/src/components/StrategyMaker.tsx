import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Settings,
  Save,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  ChevronRight,
  Plus,
  Trash2,
  Wand2,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
  Activity,
  AlertCircle,
  ArrowUpDown,
  Sigma,
} from 'lucide-react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ReferenceLine,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  LineChart,
} from 'recharts';

interface StrategyRule {
  id: string;
  indicator: string;
  condition: string;
  value: number;
  enabled: boolean;
  timeframe?: string;
  lookback?: number;
  confidence?: number;
}

interface StrategyTest {
  startDate: string;
  endDate: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  profitLoss: number;
  maxDrawdown: number;
  sharpeRatio: number;
  trades: {
    date: string;
    type: 'buy' | 'sell';
    price: number;
    result: 'win' | 'loss';
    profit: number;
  }[];
}

interface RiskParameters {
  maxPositionSize: number;
  stopLoss: number;
  takeProfit: number;
  maxDrawdown: number;
  riskPerTrade: number;
  positionSizing: 'fixed' | 'kelly' | 'fractional';
}

interface MarketRegime {
  type: 'trending' | 'ranging' | 'volatile' | 'calm';
  confidence: number;
  indicators: {
    name: string;
    value: number;
    weight: number;
  }[];
}

interface StrategyMakerProps {
  onStrategyChange?: (strategy: {
    name: string;
    rules: StrategyRule[];
    settings: {
      riskLevel: number;
      useML: boolean;
      riskParameters: RiskParameters;
      adaptiveParameters: {
        enabled: boolean;
        regimeDetection: boolean;
        dynamicSizing: boolean;
        volatilityAdjustment: boolean;
      };
    };
  }) => void;
  onBacktest?: (params: {
    strategy: string;
    timeframe: string;
    startDate: string;
    endDate: string;
    includeCosts: boolean;
    riskParameters: RiskParameters;
  }) => void;
}

export const StrategyMaker: React.FC<StrategyMakerProps> = ({ onStrategyChange, onBacktest }) => {
  const [strategyName, setStrategyName] = useState<string>('My Custom Strategy');
  const [rules, setRules] = useState<StrategyRule[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [timeframe, setTimeframe] = useState<string>('1d');
  const [isBacktesting, setIsBacktesting] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<StrategyTest | null>(null);
  const [riskLevel, setRiskLevel] = useState<number>(50);
  const [positionSize, setPositionSize] = useState<number>(1000);
  const [stopLoss, setStopLoss] = useState<number>(2);
  const [takeProfit, setTakeProfit] = useState<number>(6);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [realTimeEnabled, setRealTimeEnabled] = useState<boolean>(false);
  const [monitoringInterval, setMonitoringInterval] = useState<number>(5);
  const [showAdvancedBacktest, setShowAdvancedBacktest] = useState<boolean>(false);
  const [backtestSettings, setBacktestSettings] = useState({
    startDate: '',
    endDate: '',
    initialCapital: 10000,
    positionSize: 1000,
    maxDrawdown: 20,
    trailingStop: false,
    trailingStopDistance: 5,
    useVolatilityFilter: false,
    volatilityThreshold: 2,
    includeFees: true,
    feePerTrade: 0.1,
    riskPerTrade: 1,
    maxPositions: 5,
    useTimeFilter: false,
    tradingHours: {
      start: '09:30',
      end: '16:00'
    },
    profitTarget: 3,
    consecutiveLossLimit: 3,
    useMarginTrading: false,
    marginRequirement: 50,
    pyramiding: false,
    pyramidingLevels: 3
  });
  const [performanceData, setPerformanceData] = useState([
    { date: '2024-01', equity: 10000, drawdown: 0, profit: 0 },
    { date: '2024-02', equity: 11200, drawdown: -300, profit: 1200 },
    { date: '2024-03', equity: 12500, drawdown: -500, profit: 2500 }
  ]);
  const [monitoringStats, setMonitoringStats] = useState({
    activeSignals: [],
    openPositions: [],
    recentAlerts: [],
    performance: {
      todayPnL: 0,
      weeklyPnL: 0,
      monthlyPnL: 0,
      totalPnL: 0,
      rollingVolatility: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      calmarRatio: 0,
      winLossRatio: 0,
      profitFactor: 0,
      averageWin: 0,
      averageLoss: 0,
      largestWin: 0,
      largestLoss: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0,
      timeInMarket: 0,
      marginUtilization: 0
    }
  });
  const [activeTab, setActiveTab] = useState('rules');
  const [currentRegime, setCurrentRegime] = useState<MarketRegime | null>(null);
  const [riskParams, setRiskParams] = useState<RiskParameters>({
    maxPositionSize: 5,
    stopLoss: 2,
    takeProfit: 3,
    maxDrawdown: 15,
    riskPerTrade: 1,
    positionSizing: 'fractional'
  });
  const [adaptiveSettings, setAdaptiveSettings] = useState({
    enabled: false,
    regimeDetection: false,
    dynamicSizing: false,
    volatilityAdjustment: false
  });

  const indicators = [
    { value: 'rsi', label: 'RSI' },
    { value: 'macd', label: 'MACD' },
    { value: 'sma', label: 'Simple Moving Average' },
    { value: 'ema', label: 'Exponential Moving Average' },
    { value: 'bollinger', label: 'Bollinger Bands' },
    { value: 'stochastic', label: 'Stochastic Oscillator' },
    { value: 'adx', label: 'Average Directional Index' },
    { value: 'atr', label: 'Average True Range' },
    { value: 'obv', label: 'On-Balance Volume' },
    { value: 'mfi', label: 'Money Flow Index' },
    { value: 'roc', label: 'Rate of Change' },
    { value: 'cmf', label: 'Chaikin Money Flow' },
    { value: 'vwap', label: 'Volume Weighted Average Price' },
    { value: 'ichimoku', label: 'Ichimoku Cloud' },
    { value: 'volume', label: 'Volume' },
    { value: 'price', label: 'Price' },
    { value: 'sentiment', label: 'Market Sentiment' },
    { value: 'ml_price_prediction', label: 'ML Price Prediction' },
    { value: 'ml_sentiment_score', label: 'ML Sentiment Score' },
    { value: 'ml_rl_signal', label: 'RL Trading Signal' },
    { value: 'ml_anomaly_score', label: 'Anomaly Detection' },
    { value: 'ml_regime_state', label: 'Market Regime State' }
  ];

  const conditions = [
    { value: 'above', label: 'Is Above' },
    { value: 'below', label: 'Is Below' },
    { value: 'crosses_above', label: 'Crosses Above' },
    { value: 'crosses_below', label: 'Crosses Below' },
  ];

  const strategyPresets = [
    {
      name: 'RSI Oversold/Overbought',
      description: 'Buy when RSI is oversold (below 30) and sell when overbought (above 70)',
      rules: [
        {
          id: '1',
          indicator: 'rsi',
          condition: 'below',
          value: 30,
          timeframe: '1d',
          enabled: true
        }
      ]
    },
    {
      name: 'Golden Cross',
      description: 'Buy when 50-day MA crosses above 200-day MA',
      rules: [
        {
          id: '1',
          indicator: 'sma',
          condition: 'crosses_above',
          value: 200,
          timeframe: '1d',
          enabled: true
        }
      ]
    },
    {
      name: 'MACD Momentum',
      description: 'Buy when MACD crosses above signal line with positive momentum',
      rules: [
        {
          id: '1',
          indicator: 'macd',
          condition: 'crosses_above',
          value: 0,
          timeframe: '1d',
          enabled: true
        }
      ]
    },
    {
      name: 'Bollinger Band Bounce',
      description: 'Buy when price touches lower band and RSI shows oversold',
      rules: [
        {
          id: '1',
          indicator: 'bollinger',
          condition: 'below',
          value: -2,
          timeframe: '1d',
          enabled: true
        },
        {
          id: '2',
          indicator: 'rsi',
          condition: 'below',
          value: 30,
          timeframe: '1d',
          enabled: true
        }
      ]
    },
    {
      name: 'Triple Screen Trading',
      description: 'Uses multiple timeframes and indicators for confirmation',
      rules: [
        {
          id: '1',
          indicator: 'macd',
          condition: 'above',
          value: 0,
          timeframe: '1w',
          enabled: true
        },
        {
          id: '2',
          indicator: 'rsi',
          condition: 'below',
          value: 30,
          timeframe: '1d',
          enabled: true
        },
        {
          id: '3',
          indicator: 'stochastic',
          condition: 'crosses_above',
          value: 20,
          timeframe: '4h',
          enabled: true
        }
      ]
    },
    {
      name: 'Volume Price Trend',
      description: 'Combines volume analysis with price action',
      rules: [
        {
          id: '1',
          indicator: 'volume',
          condition: 'above',
          value: 200,
          timeframe: '1d',
          enabled: true
        },
        {
          id: '2',
          indicator: 'price',
          condition: 'above',
          value: 0,
          timeframe: '1d',
          enabled: true
        },
        {
          id: '3',
          indicator: 'obv',
          condition: 'above',
          value: 0,
          timeframe: '1d',
          enabled: true
        }
      ]
    },
    {
      name: 'Ichimoku Cloud Strategy',
      description: 'Uses Ichimoku Cloud components for trend analysis',
      rules: [
        {
          id: '1',
          indicator: 'ichimoku',
          condition: 'above',
          value: 0,
          timeframe: '1d',
          enabled: true
        },
        {
          id: '2',
          indicator: 'volume',
          condition: 'above',
          value: 150,
          timeframe: '1d',
          enabled: true
        }
      ]
    },
    {
      name: 'Mean Reversion',
      description: 'Trade price reversions to the mean',
      rules: [
        {
          id: '1',
          indicator: 'bollinger',
          condition: 'below',
          value: -2,
          timeframe: '1d',
          enabled: true
        },
        {
          id: '2',
          indicator: 'rsi',
          condition: 'below',
          value: 30,
          timeframe: '1d',
          enabled: true
        },
        {
          id: '3',
          indicator: 'mfi',
          condition: 'below',
          value: 20,
          timeframe: '1d',
          enabled: true
        }
      ]
    },
    {
      name: 'Volatility Breakout',
      description: 'Trade breakouts from volatility contraction periods',
      rules: [
        {
          id: '1',
          indicator: 'atr',
          condition: 'above',
          value: 1.5,
          timeframe: '1d',
          enabled: true
        },
        {
          id: '2',
          indicator: 'volume',
          condition: 'above',
          value: 200,
          timeframe: '1d',
          enabled: true
        }
      ]
    },
    {
      name: 'Trend Following with Volume',
      description: 'Follow strong trends confirmed by volume',
      rules: [
        {
          id: '1',
          indicator: 'ema',
          condition: 'above',
          value: 20,
          timeframe: '1d',
          enabled: true
        },
        {
          id: '2',
          indicator: 'obv',
          condition: 'above',
          value: 0,
          timeframe: '1d',
          enabled: true
        }
      ]
    },
    {
      name: 'Multi-Timeframe Momentum',
      description: 'Align momentum across multiple timeframes',
      rules: [
        {
          id: '1',
          indicator: 'rsi',
          condition: 'above',
          value: 50,
          timeframe: '1d',
          enabled: true
        },
        {
          id: '2',
          indicator: 'macd',
          condition: 'above',
          value: 0,
          timeframe: '4h',
          enabled: true
        }
      ]
    },
    {
      name: 'Price Action with Support/Resistance',
      description: 'Trade bounces from key levels with volume confirmation',
      rules: [
        {
          id: '1',
          indicator: 'price',
          condition: 'above',
          value: 0,
          timeframe: '1d',
          enabled: true
        },
        {
          id: '2',
          indicator: 'volume',
          condition: 'above',
          value: 150,
          timeframe: '1d',
          enabled: true
        }
      ]
    },
    {
      name: 'Market Regime Adaptive',
      description: 'Adapts strategy based on market volatility and trend regime',
      rules: [
        {
          id: '1',
          indicator: 'atr',
          condition: 'above',
          value: 2,
          timeframe: '1d',
          enabled: true
        },
        {
          id: '2',
          indicator: 'adx',
          condition: 'above',
          value: 25,
          timeframe: '1d',
          enabled: true
        }
      ]
    },
    {
      name: 'Sentiment-Volume Analysis',
      description: 'Combines market sentiment with volume analysis for trend confirmation',
      rules: [
        {
          id: '1',
          indicator: 'sentiment',
          condition: 'above',
          value: 70,
          timeframe: '1d',
          enabled: true
        },
        {
          id: '2',
          indicator: 'volume',
          condition: 'above',
          value: 200,
          timeframe: '1d',
          enabled: true
        }
      ]
    },
    {
      name: 'Volatility Breakout with ML',
      description: 'Uses machine learning to predict breakout probability',
      rules: [
        {
          id: '1',
          indicator: 'ml_breakout',
          condition: 'above',
          value: 0.8,
          timeframe: '1d',
          enabled: true
        },
        {
          id: '2',
          indicator: 'atr',
          condition: 'above',
          value: 1.5,
          timeframe: '1d',
          enabled: true
        }
      ]
    },
    {
      name: 'Deep Learning Price Prediction',
      description: 'Uses LSTM neural networks to predict price movements',
      rules: [
        {
          id: '1',
          indicator: 'ml_price_prediction',
          condition: 'above',
          value: 0.7,
          timeframe: '1d',
          enabled: true
        },
        {
          id: '2',
          indicator: 'volume',
          condition: 'above',
          value: 200,
          timeframe: '1d',
          enabled: true
        }
      ]
    },
    {
      name: 'NLP Sentiment Trading',
      description: 'Analyzes news and social media sentiment using NLP',
      rules: [
        {
          id: '1',
          indicator: 'ml_sentiment_score',
          condition: 'above',
          value: 0.8,
          timeframe: '1d',
          enabled: true
        },
        {
          id: '2',
          indicator: 'volume',
          condition: 'above',
          value: 150,
          timeframe: '1d',
          enabled: true
        }
      ]
    },
    {
      name: 'Reinforcement Learning Strategy',
      description: 'Dynamic strategy adaptation using RL algorithms',
      rules: [
        {
          id: '1',
          indicator: 'ml_rl_signal',
          condition: 'above',
          value: 0.6,
          timeframe: '1d',
          enabled: true
        },
        {
          id: '2',
          indicator: 'atr',
          condition: 'below',
          value: 2,
          timeframe: '1d',
          enabled: true
        }
      ]
    },
    {
      name: 'Anomaly Detection Trading',
      description: 'Identifies market anomalies using ML clustering',
      rules: [
        {
          id: '1',
          indicator: 'ml_anomaly_score',
          condition: 'above',
          value: 0.9,
          timeframe: '1d',
          enabled: true
        },
        {
          id: '2',
          indicator: 'volume',
          condition: 'above',
          value: 300,
          timeframe: '1d',
          enabled: true
        }
      ]
    }
  ];

  const addRule = () => {
    const newRule: StrategyRule = {
      id: Date.now().toString(),
      indicator: 'rsi',
      condition: 'above',
      value: 50,
      enabled: true,
    };
    setRules([...rules, newRule]);
  };

  const removeRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  const updateRule = (id: string, updates: Partial<StrategyRule>) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, ...updates } : rule
    ));
  };

  const runBacktest = async () => {
    setIsBacktesting(true);
    try {
      // Simulate API call for backtesting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResults: StrategyTest = {
        startDate: '2024-01-01',
        endDate: '2024-03-20',
        totalTrades: 50,
        winningTrades: 32,
        losingTrades: 18,
        profitLoss: 15250.75,
        maxDrawdown: -3420.30,
        sharpeRatio: 1.85,
        trades: [
          {
            date: '2024-03-15',
            type: 'buy',
            price: 150.25,
            result: 'win',
            profit: 450.75
          },
          // Add more mock trades here
        ]
      };
      
      setTestResults(mockResults);
    } catch (error) {
      console.error('Backtest error:', error);
    } finally {
      setIsBacktesting(false);
    }
  };

  // Enhanced chart components with interactive features
  const EquityCurveChart = ({ data }: { data: any[] }) => (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date"
          tickFormatter={(value) => new Date(value).toLocaleDateString()}
        />
        <YAxis 
          domain={['dataMin - 1000', 'dataMax + 1000']}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-background p-2 border rounded-lg shadow">
                  <p className="font-semibold">{new Date(payload[0].payload.date).toLocaleDateString()}</p>
                  <p className="text-green-500">Equity: ${payload[0].value.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Click to view details</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Area 
          type="monotone" 
          dataKey="equity" 
          stroke="#2563eb" 
          fill="#3b82f6" 
          fillOpacity={0.1}
          activeDot={{ r: 8, onClick: (data) => console.log('Clicked:', data) }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const DrawdownChart = ({ data }: { data: any[] }) => (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="drawdown" stroke="#dc2626" fill="#ef4444" fillOpacity={0.1} />
      </AreaChart>
    </ResponsiveContainer>
  );

  const MonthlyReturnsChart = ({ data }: { data: any[] }) => (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="return" fill="#22c55e" />
      </BarChart>
    </ResponsiveContainer>
  );

  // New chart components
  const VolatilityRegimeChart = ({ data }: { data: any[] }) => (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="realized_vol" stroke="#8884d8" name="Realized Volatility" />
        <Line type="monotone" dataKey="implied_vol" stroke="#82ca9d" name="Implied Volatility" />
      </LineChart>
    </ResponsiveContainer>
  );

  const RiskDecompositionChart = ({ data }: { data: any[] }) => (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="factor" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="contribution" fill="#8884d8" name="Risk Contribution" />
      </BarChart>
    </ResponsiveContainer>
  );

  const PerformanceHeatmap = ({ data }: { data: any[] }) => (
    <div className="grid grid-cols-7 gap-1">
      {data.map((day, index) => (
        <div
          key={index}
          className={`h-8 rounded ${
            day.return > 2 ? 'bg-green-500' :
            day.return > 1 ? 'bg-green-400' :
            day.return > 0 ? 'bg-green-300' :
            day.return > -1 ? 'bg-red-300' :
            day.return > -2 ? 'bg-red-400' : 'bg-red-500'
          }`}
          title={`${day.date}: ${day.return}%`}
        />
      ))}
    </div>
  );

  // Enhanced risk management parameters
  const [riskSettings, setRiskSettings] = useState({
    // Existing parameters
    riskLevel: 50,
    positionSize: 1000,
    stopLoss: 2,
    takeProfit: 6,
    
    // New parameters
    maxPortfolioRisk: 5, // Maximum portfolio risk percentage
    correlationLimit: 0.7, // Maximum correlation between positions
    leverageLimit: 3, // Maximum leverage per position
    marginBuffer: 30, // Minimum margin buffer percentage
    volatilityAdjustment: true, // Adjust position size based on volatility
    hedgingRatio: 0.3, // Percentage of portfolio to hedge
    stressTestScenarios: ['market_crash', 'high_volatility', 'correlation_breakdown'],
    riskMetrics: {
      valueatrisk: 0,
      expectedShortfall: 0,
      stressTestLoss: 0,
      concentrationRisk: 0
    }
  });

  // Additional performance metrics
  const [advancedMetrics, setAdvancedMetrics] = useState({
    riskAdjusted: {
      treynorRatio: 0,
      jensenAlpha: 0,
      informationRatio: 0,
      omega: 0,
      kappaRatio: 0
    },
    riskMetrics: {
      downside_deviation: 0,
      tail_risk: 0,
      beta: 0,
      correlation_matrix: [],
      var_95: 0,
      cvar_95: 0
    },
    tradingMetrics: {
      profit_factor: 0,
      recovery_factor: 0,
      payoff_ratio: 0,
      kelly_criterion: 0,
      risk_reward_score: 0
    },
    marketRegime: {
      current_regime: '',
      regime_probability: 0,
      regime_duration: 0,
      regime_transition: []
    }
  });

  // Enhanced risk scenarios
  const [riskScenarios, setRiskScenarios] = useState({
    scenarios: [
      {
        name: 'Market Crash',
        description: 'Simulates a sudden market crash scenario',
        parameters: {
          priceChange: -20,
          volatilityIncrease: 200,
          volumeSpike: 300,
          correlationBreakdown: true
        }
      },
      {
        name: 'Liquidity Crisis',
        description: 'Simulates a market liquidity crisis',
        parameters: {
          spreadWidening: 500,
          volumeDrop: -80,
          priceGaps: true,
          counterpartyRisk: 'high'
        }
      },
      {
        name: 'Flash Crash',
        description: 'Simulates a flash crash scenario',
        parameters: {
          duration: '5min',
          priceChange: -15,
          recovery: true,
          volumeProfile: 'extreme'
        }
      },
      {
        name: 'Correlation Breakdown',
        description: 'Simulates market correlation breakdown',
        parameters: {
          correlationChange: -0.8,
          sectorRotation: true,
          volatilityRegime: 'high',
          hedgeEffectiveness: -60
        }
      }
    ],
    results: {
      worstDrawdown: 0,
      recoveryTime: 0,
      survivabilityScore: 0,
      capitalRequired: 0
    }
  });

  // Market Regime Detection
  const [marketRegime, setMarketRegime] = useState({
    current: {
      state: 'neutral',
      confidence: 0.8,
      duration: 15,
      characteristics: {
        volatility: 'medium',
        trend: 'sideways',
        liquidity: 'normal'
      }
    },
    transitions: {
      probability: {
        bullish: 0.3,
        bearish: 0.2,
        neutral: 0.5
      },
      nextStateETA: 5
    },
    indicators: {
      trendStrength: 0,
      volatilityRegime: 'normal',
      marketBreadth: 0,
      sentimentScore: 0
    }
  });

  // Enhanced interactive chart components
  const InteractiveEquityCurve = ({ data }: { data: any[] }) => {
    const [zoomDomain, setZoomDomain] = useState<any>(null);
    const [selectedPoint, setSelectedPoint] = useState<any>(null);

    return (
      <div className="space-y-4">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
              domain={zoomDomain?.x || ['dataMin', 'dataMax']}
            />
            <YAxis 
              domain={zoomDomain?.y || ['dataMin - 1000', 'dataMax + 1000']}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background p-4 border rounded-lg shadow-lg">
                      <p className="font-semibold">{new Date(payload[0].payload.date).toLocaleDateString()}</p>
                      <p className="text-green-500">Equity: ${payload[0].value.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Daily Return: {((payload[0].value / payload[0].payload.previousEquity - 1) * 100).toFixed(2)}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Drawdown: {payload[0].payload.drawdown}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="equity" 
              stroke="#2563eb" 
              fill="#3b82f6" 
              fillOpacity={0.1}
              activeDot={{ 
                r: 8, 
                onClick: (data) => setSelectedPoint(data),
                style: { cursor: 'pointer' }
              }}
            />
            {selectedPoint && (
              <ReferenceLine 
                x={selectedPoint.payload.date} 
                stroke="#2563eb" 
                strokeDasharray="3 3" 
              />
            )}
          </AreaChart>
        </ResponsiveContainer>

        {/* Chart Controls */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoomDomain(null)}
            >
              Reset Zoom
            </Button>
            <Select
              value="1m"
              onValueChange={(value) => {
                // Implement zoom level change
              }}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Zoom" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1w">1 Week</SelectItem>
                <SelectItem value="1m">1 Month</SelectItem>
                <SelectItem value="3m">3 Months</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={true}
                onCheckedChange={() => {
                  // Toggle drawdown overlay
                }}
              />
              <Label>Show Drawdown</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={true}
                onCheckedChange={() => {
                  // Toggle volatility overlay
                }}
              />
              <Label>Show Volatility</Label>
            </div>
          </div>
        </div>

        {/* Selected Point Details */}
        {selectedPoint && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Trade Details</CardTitle>
              <CardDescription>
                {new Date(selectedPoint.payload.date).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Position Size</Label>
                  <div className="text-xl font-bold">
                    ${selectedPoint.payload.positionSize?.toLocaleString() || 0}
                  </div>
                </div>
                <div>
                  <Label>Daily P&L</Label>
                  <div className={`text-xl font-bold ${selectedPoint.payload.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${selectedPoint.payload.pnl?.toLocaleString() || 0}
                  </div>
                </div>
                <div>
                  <Label>Risk Level</Label>
                  <div className="text-xl font-bold">
                    {selectedPoint.payload.riskLevel || 'Low'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Strategy Maker</h2>
          <p className="text-muted-foreground">Create and test custom trading strategies</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedPreset} onValueChange={(value) => {
            setSelectedPreset(value);
            const preset = strategyPresets.find(p => p.name === value);
            if (preset) {
              setRules(preset.rules);
            }
          }}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Load Preset" />
            </SelectTrigger>
            <SelectContent>
              {strategyPresets.map((preset) => (
                <SelectItem key={preset.name} value={preset.name}>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setRules([])}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Save Strategy
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strategy Configuration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Strategy Configuration</CardTitle>
            <CardDescription>Define your trading rules and conditions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Strategy Name */}
            <div className="space-y-2">
              <Label>Strategy Name</Label>
              <Input
                value={strategyName}
                onChange={(e) => setStrategyName(e.target.value)}
                placeholder="Enter strategy name"
              />
            </div>

            {/* Trading Rules */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Trading Rules</Label>
                <Button variant="outline" size="sm" onClick={addRule}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Rule
                </Button>
              </div>

              {rules.map((rule) => (
                <Card key={rule.id} className="p-4">
                  <div className="flex items-center space-x-4">
                    <Select
                      value={rule.indicator}
                      onValueChange={(value) => updateRule(rule.id, { indicator: value })}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select indicator" />
                      </SelectTrigger>
                      <SelectContent>
                        {indicators.map((ind) => (
                          <SelectItem key={ind.value} value={ind.value}>
                            {ind.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={rule.condition}
                      onValueChange={(value) => updateRule(rule.id, { condition: value as any })}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map((cond) => (
                          <SelectItem key={cond.value} value={cond.value}>
                            {cond.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      value={rule.value}
                      onChange={(e) => updateRule(rule.id, { value: parseFloat(e.target.value) })}
                      className="w-[100px]"
                    />

                    <Select
                      value={rule.timeframe}
                      onValueChange={(value) => updateRule(rule.id, { timeframe: value })}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1m">1m</SelectItem>
                        <SelectItem value="5m">5m</SelectItem>
                        <SelectItem value="15m">15m</SelectItem>
                        <SelectItem value="1h">1h</SelectItem>
                        <SelectItem value="4h">4h</SelectItem>
                        <SelectItem value="1d">1d</SelectItem>
                      </SelectContent>
                    </Select>

                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(checked) => updateRule(rule.id, { enabled: checked })}
                    />

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRule(rule.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Risk Management */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Risk Management</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Risk Level</Label>
                  <span>{riskLevel}%</span>
                </div>
                <Slider
                  value={[riskLevel]}
                  onValueChange={(value) => setRiskLevel(value[0])}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Position Size ($)</Label>
                <Input
                  type="number"
                  value={positionSize}
                  onChange={(e) => setPositionSize(parseFloat(e.target.value))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stop Loss (%)</Label>
                  <Input
                    type="number"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(parseFloat(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Take Profit (%)</Label>
                  <Input
                    type="number"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backtest Results */}
        <Card>
          <CardHeader>
            <CardTitle>Backtest Results</CardTitle>
            <CardDescription>Strategy performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              className="w-full"
              onClick={runBacktest}
              disabled={isBacktesting || rules.length === 0}
            >
              {isBacktesting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Running Backtest...
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Run Backtest
                </>
              )}
            </Button>

            {testResults && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Total Trades</Label>
                    <div className="text-2xl font-bold">{testResults.totalTrades}</div>
                  </div>
                  <div className="space-y-1">
                    <Label>Win Rate</Label>
                    <div className="text-2xl font-bold text-green-500">
                      {((testResults.winningTrades / testResults.totalTrades) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Profit/Loss</Label>
                  <div className={`text-2xl font-bold ${testResults.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${testResults.profitLoss.toFixed(2)}
                  </div>
                  <Progress
                    value={testResults.profitLoss > 0 ? 75 : 25}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max Drawdown</Label>
                  <div className="text-xl font-semibold text-red-500">
                    ${Math.abs(testResults.maxDrawdown).toFixed(2)}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Sharpe Ratio</Label>
                  <div className="text-xl font-semibold">
                    {testResults.sharpeRatio.toFixed(2)}
                  </div>
                </div>

                {testResults.trades.length > 0 && (
                  <div className="space-y-2">
                    <Label>Recent Trades</Label>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Result</TableHead>
                          <TableHead>Profit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {testResults.trades.map((trade, index) => (
                          <TableRow key={index}>
                            <TableCell>{trade.date}</TableCell>
                            <TableCell>
                              <Badge variant={trade.type === 'buy' ? 'default' : 'secondary'}>
                                {trade.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={trade.result === 'win' ? 'success' : 'destructive'}>
                                {trade.result}
                              </Badge>
                            </TableCell>
                            <TableCell className={trade.profit >= 0 ? 'text-green-500' : 'text-red-500'}>
                              ${trade.profit.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>Advanced Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="equity">
              <TabsList>
                <TabsTrigger value="equity">Equity Curve</TabsTrigger>
                <TabsTrigger value="drawdown">Drawdown Analysis</TabsTrigger>
                <TabsTrigger value="returns">Monthly Returns</TabsTrigger>
                <TabsTrigger value="volatility">Volatility Regime</TabsTrigger>
                <TabsTrigger value="risk">Risk Decomposition</TabsTrigger>
                <TabsTrigger value="heatmap">Performance Heatmap</TabsTrigger>
                <TabsTrigger value="monitor">Real-time Monitor</TabsTrigger>
                <TabsTrigger value="ml">ML Insights</TabsTrigger>
                <TabsTrigger value="scenarios">Risk Scenarios</TabsTrigger>
              </TabsList>
              
              <TabsContent value="equity">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Equity Curve</h3>
                  <InteractiveEquityCurve data={performanceData} />
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm font-medium">Total Return</div>
                        <div className="text-2xl font-bold text-green-500">
                          +{((testResults.profitLoss / backtestSettings.initialCapital) * 100).toFixed(2)}%
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm font-medium">Sharpe Ratio</div>
                        <div className="text-2xl font-bold">
                          {testResults.sharpeRatio.toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm font-medium">Max Drawdown</div>
                        <div className="text-2xl font-bold text-red-500">
                          {testResults.maxDrawdown.toFixed(2)}%
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="drawdown">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Drawdown Analysis</h3>
                  <DrawdownChart data={performanceData} />
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm font-medium">Average Drawdown</div>
                        <div className="text-2xl font-bold text-red-500">
                          {(Math.abs(testResults.maxDrawdown) / 2).toFixed(2)}%
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm font-medium">Recovery Time</div>
                        <div className="text-2xl font-bold">
                          15 days
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm font-medium">Drawdown Frequency</div>
                        <div className="text-2xl font-bold">
                          Monthly
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="returns">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Monthly Returns</h3>
                  <MonthlyReturnsChart data={performanceData} />
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm font-medium">Best Month</div>
                        <div className="text-2xl font-bold text-green-500">
                          +12.5%
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm font-medium">Worst Month</div>
                        <div className="text-2xl font-bold text-red-500">
                          -5.8%
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm font-medium">Average Monthly</div>
                        <div className="text-2xl font-bold">
                          +3.2%
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="volatility">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Volatility Analysis</h3>
                  <VolatilityRegimeChart data={performanceData} />
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm font-medium">Current Regime</div>
                        <div className="text-2xl font-bold">
                          {advancedMetrics.marketRegime.current_regime}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm font-medium">Regime Probability</div>
                        <div className="text-2xl font-bold">
                          {(advancedMetrics.marketRegime.regime_probability * 100).toFixed(1)}%
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm font-medium">Regime Duration</div>
                        <div className="text-2xl font-bold">
                          {advancedMetrics.marketRegime.regime_duration} days
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="risk">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Risk Decomposition</h3>
                  <RiskDecompositionChart data={performanceData} />
                  <div className="grid grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm font-medium">VaR (95%)</div>
                        <div className="text-2xl font-bold text-red-500">
                          {advancedMetrics.riskMetrics.var_95.toFixed(2)}%
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm font-medium">CVaR (95%)</div>
                        <div className="text-2xl font-bold text-red-500">
                          {advancedMetrics.riskMetrics.cvar_95.toFixed(2)}%
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm font-medium">Beta</div>
                        <div className="text-2xl font-bold">
                          {advancedMetrics.riskMetrics.beta.toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm font-medium">Tail Risk</div>
                        <div className="text-2xl font-bold text-red-500">
                          {advancedMetrics.riskMetrics.tail_risk.toFixed(2)}%
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="heatmap">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Performance Heatmap</h3>
                  <PerformanceHeatmap data={performanceData} />
                  <div className="grid grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm font-medium">Profit Factor</div>
                        <div className="text-2xl font-bold">
                          {advancedMetrics.tradingMetrics.profit_factor.toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm font-medium">Kelly Criterion</div>
                        <div className="text-2xl font-bold">
                          {(advancedMetrics.tradingMetrics.kelly_criterion * 100).toFixed(1)}%
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm font-medium">Risk-Reward Score</div>
                        <div className="text-2xl font-bold">
                          {advancedMetrics.tradingMetrics.risk_reward_score.toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm font-medium">Recovery Factor</div>
                        <div className="text-2xl font-bold">
                          {advancedMetrics.tradingMetrics.recovery_factor.toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="monitor">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Real-time Monitor</h3>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={realTimeEnabled}
                        onCheckedChange={setRealTimeEnabled}
                      />
                      <Label>Live Updates</Label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Active Signals</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {monitoringStats.activeSignals.map((signal, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span>{signal.symbol}</span>
                              <Badge>{signal.type}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Open Positions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {monitoringStats.openPositions.map((position, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span>{position.symbol}</span>
                              <span className={position.pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                                {position.pnl >= 0 ? '+' : ''}{position.pnl}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label>Today</Label>
                          <div className={`text-xl font-bold ${monitoringStats.performance.todayPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {monitoringStats.performance.todayPnL >= 0 ? '+' : ''}{monitoringStats.performance.todayPnL}%
                          </div>
                        </div>
                        <div>
                          <Label>This Week</Label>
                          <div className={`text-xl font-bold ${monitoringStats.performance.weeklyPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {monitoringStats.performance.weeklyPnL >= 0 ? '+' : ''}{monitoringStats.performance.weeklyPnL}%
                          </div>
                        </div>
                        <div>
                          <Label>This Month</Label>
                          <div className={`text-xl font-bold ${monitoringStats.performance.monthlyPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {monitoringStats.performance.monthlyPnL >= 0 ? '+' : ''}{monitoringStats.performance.monthlyPnL}%
                          </div>
                        </div>
                        <div>
                          <Label>Total</Label>
                          <div className={`text-xl font-bold ${monitoringStats.performance.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {monitoringStats.performance.totalPnL >= 0 ? '+' : ''}{monitoringStats.performance.totalPnL}%
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {monitoringStats.recentAlerts.map((alert, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className="w-4 h-4" />
                              <span>{alert.message}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{alert.time}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Advanced Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label>Sharpe Ratio</Label>
                          <div className="text-xl font-bold">
                            {monitoringStats.performance.sharpeRatio.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <Label>Sortino Ratio</Label>
                          <div className="text-xl font-bold">
                            {monitoringStats.performance.sortinoRatio.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <Label>Calmar Ratio</Label>
                          <div className="text-xl font-bold">
                            {monitoringStats.performance.calmarRatio.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <Label>Win/Loss Ratio</Label>
                          <div className="text-xl font-bold">
                            {monitoringStats.performance.winLossRatio.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Trade Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label>Average Win</Label>
                          <div className="text-xl font-bold text-green-500">
                            ${monitoringStats.performance.averageWin.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <Label>Average Loss</Label>
                          <div className="text-xl font-bold text-red-500">
                            ${Math.abs(monitoringStats.performance.averageLoss).toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <Label>Largest Win</Label>
                          <div className="text-xl font-bold text-green-500">
                            ${monitoringStats.performance.largestWin.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <Label>Largest Loss</Label>
                          <div className="text-xl font-bold text-red-500">
                            ${Math.abs(monitoringStats.performance.largestLoss).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Risk Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Rolling Volatility</Label>
                          <div className="text-xl font-bold">
                            {monitoringStats.performance.rollingVolatility.toFixed(2)}%
                          </div>
                        </div>
                        <div>
                          <Label>Time in Market</Label>
                          <div className="text-xl font-bold">
                            {monitoringStats.performance.timeInMarket.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <Label>Margin Utilization</Label>
                          <div className="text-xl font-bold">
                            {monitoringStats.performance.marginUtilization.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="ml">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Machine Learning Insights</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Price Prediction</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>Confidence Score</span>
                            <span className="text-xl font-bold">85%</span>
                          </div>
                          <Progress value={85} className="h-2" />
                          <p className="text-sm text-muted-foreground">
                            Based on LSTM model predictions for the next 5 trading days
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Sentiment Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>Market Sentiment</span>
                            <Badge variant="success">Bullish</Badge>
                          </div>
                          <Progress value={75} className="h-2" />
                          <p className="text-sm text-muted-foreground">
                            Aggregated from news and social media sources
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Market Regime Detection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label>Current Regime</Label>
                          <div className="text-xl font-bold">
                            {marketRegime.current.state}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Confidence: {(marketRegime.current.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div>
                          <Label>Duration</Label>
                          <div className="text-xl font-bold">
                            {marketRegime.current.duration} days
                          </div>
                        </div>
                        <div>
                          <Label>Volatility</Label>
                          <div className="text-xl font-bold">
                            {marketRegime.current.characteristics.volatility}
                          </div>
                        </div>
                        <div>
                          <Label>Trend</Label>
                          <div className="text-xl font-bold">
                            {marketRegime.current.characteristics.trend}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Label>Regime Transition Probabilities</Label>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          {Object.entries(marketRegime.transitions.probability).map(([regime, prob]) => (
                            <div key={regime} className="text-center">
                              <div className="text-sm font-medium capitalize">{regime}</div>
                              <div className="text-xl font-bold">{(prob * 100).toFixed(0)}%</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="scenarios">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Risk Scenarios</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {riskScenarios.scenarios.map((scenario) => (
                      <Card key={scenario.name}>
                        <CardHeader>
                          <CardTitle>{scenario.name}</CardTitle>
                          <CardDescription>{scenario.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {Object.entries(scenario.parameters).map(([param, value]) => (
                              <div key={param} className="flex justify-between items-center">
                                <span className="capitalize">{param.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <span className="font-bold">
                                  {typeof value === 'number' ? `${value}%` : value.toString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Stress Test Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label>Worst Drawdown</Label>
                          <div className="text-xl font-bold text-red-500">
                            {riskScenarios.results.worstDrawdown}%
                          </div>
                        </div>
                        <div>
                          <Label>Recovery Time</Label>
                          <div className="text-xl font-bold">
                            {riskScenarios.results.recoveryTime} days
                          </div>
                        </div>
                        <div>
                          <Label>Survivability Score</Label>
                          <div className="text-xl font-bold">
                            {riskScenarios.results.survivabilityScore}%
                          </div>
                        </div>
                        <div>
                          <Label>Required Capital</Label>
                          <div className="text-xl font-bold">
                            ${riskScenarios.results.capitalRequired.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 