import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { 
  ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown, Brain, 
  Settings, Play, BarChart2, Loader2, Calendar as CalendarIcon, 
  PlayCircle, PauseCircle, RefreshCcw, AlertTriangle, BookOpen,
  LineChart, PieChart, Activity, Zap, Target, Eye
} from "lucide-react";
import { 
  LineChart as RechartsLineChart, Line, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, Area, AreaChart, CartesianGrid, Legend,
  ComposedChart, Bar, Scatter
} from "recharts";
import { Progress } from "@/components/ui/progress";
import { apiService } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import {
  CHART_CONFIG,
  ML_CONFIG,
  TRADING_CONFIG,
  PORTFOLIO_CONFIG,
  SCREENER_CONFIG,
  ALERT_CONFIG
} from '@/lib/config';
import { calculateIndicators } from '@/lib/indicators';
import { RiskMetrics } from '@/components/RiskMetrics';
import { PortfolioAnalytics } from '@/components/PortfolioAnalytics';
import { AlertManager } from '@/components/AlertManager';
import { NewsPanel } from '@/components/NewsPanel';
import { OptionChain } from '@/components/OptionChain';
import VolumeProfile from '@/components/VolumeProfile';
import { MarketDepth } from '@/components/MarketDepth';
import { OrderBook } from '@/components/OrderBook';

// Types for NSE stock data and predictions
interface NSEStockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  sector: string;
}

interface NSEPrediction {
  symbol: string;
  currentPrice: number;
  predictions: {
    intraday: { price: number; confidence: number };
    shortTerm: { price: number; confidence: number }; // 1-3 days
    mediumTerm: { price: number; confidence: number }; // 1-2 weeks
    longTerm: { price: number; confidence: number }; // 1-3 months
  };
  technicalIndicators: {
    rsi: number;
    macd: { value: number; signal: number; histogram: number };
    bollingerBands: { upper: number; middle: number; lower: number };
    volume: number;
    vwap: number;
    supports: number[];
    resistances: number[];
  };
  fundamentals: {
    pe: number;
    pb: number;
    eps: number;
    roe: number;
    debtToEquity: number;
    currentRatio: number;
    quickRatio: number;
  };
  sectorAnalysis: {
    sectorPerformance: number;
    sectorPE: number;
    peerComparison: { better: number; worse: number; similar: number };
    marketShare: number;
  };
  sentimentAnalysis: {
    overall: number; // -1 to 1
    newsScore: number;
    socialScore: number;
    institutionalActivity: number;
    putCallRatio: number;
  };
}

interface BacktestSettings {
  initialCapital: number;
  riskPerTrade: number;
  stopLoss: number;
  takeProfit: number;
  maxOpenPositions: number;
  useTrailingStop: boolean;
  trailingStopDistance: number;
}

interface DryRunState {
  isRunning: boolean;
  positions: Array<{
    symbol: string;
    entryPrice: number;
    quantity: number;
    side: 'buy' | 'sell';
    pnl: number;
    entryTime: Date;
  }>;
  balance: number;
  equity: number;
  openPnL: number;
}

interface AdvancedIndicators {
  pivotPoints: {
    r3: number;
    r2: number;
    r1: number;
    pivot: number;
    s1: number;
    s2: number;
    s3: number;
  };
  fibonacci: {
    retracement: number[];
    extension: number[];
    fan: number[];
  };
  ichimoku: {
    conversionLine: number;
    baseLine: number;
    leadingSpanA: number;
    leadingSpanB: number;
    laggingSpan: number;
  };
}

// Add new interfaces for enhanced features
interface MLModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rmsError: number;
  maeError: number;
}

interface MarketRegime {
  type: 'trending' | 'ranging' | 'volatile';
  strength: number;
  duration: number;
  confidence: number;
}

interface AdvancedPrediction extends NSEPrediction {
  modelMetrics: {
    [key: string]: MLModelMetrics;
  };
  ensembleWeights: {
    [key: string]: number;
  };
  marketRegime: MarketRegime;
  supportResistance: {
    supports: number[];
    resistances: number[];
    strength: number[];
  };
  patterns: {
    name: string;
    probability: number;
    priceTarget: number;
    timeframe: string;
  }[];
  correlations: {
    symbol: string;
    correlation: number;
    lag: number;
  }[];
}

// Add new state variables and configurations
const ML_MODELS = {
  lstm: {
    name: "LSTM Deep Learning",
    description: "Long Short-Term Memory neural network for sequence prediction",
    features: ["Price", "Volume", "Technical Indicators"]
  },
  xgboost: {
    name: "XGBoost",
    description: "Gradient boosting for pattern recognition",
    features: ["Price Patterns", "Market Microstructure"]
  },
  transformer: {
    name: "Transformer",
    description: "Attention-based model for temporal dependencies",
    features: ["Multi-timeframe", "Cross-asset Correlation"]
  },
  prophet: {
    name: "Prophet",
    description: "Decomposition model for trend and seasonality",
    features: ["Trend Analysis", "Seasonality Patterns"]
  },
  wavenet: {
    name: "WaveNet",
    description: "Deep generative model for price movement",
    features: ["Price Action", "Market Regime"]
  },
  ensemble: {
    name: "Ensemble",
    description: "Dynamic weighted combination of all models",
    features: ["Adaptive Weights", "Model Selection"]
  }
};

const TECHNICAL_INDICATORS = {
  momentum: ["RSI", "MACD", "Stochastic", "MFI", "CCI"],
  trend: ["EMA", "SMA", "VWAP", "Supertrend", "ADX"],
  volatility: ["Bollinger Bands", "ATR", "Keltner Channels"],
  volume: ["OBV", "Volume Profile", "Accumulation/Distribution"],
  custom: ["Supply Zones", "Demand Zones", "Market Profile"]
};

const TIMEFRAMES = {
  intraday: ["1m", "5m", "15m", "30m", "1h", "4h"],
  daily: ["1D", "3D", "1W"],
  weekly: ["1W", "2W", "1M"],
  monthly: ["1M", "3M", "6M"]
};

const IndianPrediction = () => {
  // State management
  const [selectedStock, setSelectedStock] = useState<string>("RELIANCE");
  const [stockData, setStockData] = useState<NSEStockData | null>(null);
  const [predictions, setPredictions] = useState<NSEPrediction | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const [selectedModel, setSelectedModel] = useState("ensemble");
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  // Add new state for technical analysis
  const [technicalState, setTechnicalState] = useState({
    selectedIndicators: ["RSI", "MACD"],
    timeRange: "1M",
    chartType: "candlestick"
  });

  // Add new state for fundamental analysis
  const [fundamentalState, setFundamentalState] = useState({
    comparisonMetric: "pe",
    peerGroup: [],
    quarterlyData: []
  });

  // Add new state for sentiment analysis
  const [sentimentState, setSentimentState] = useState({
    newsFilter: "all",
    socialMediaMetrics: {},
    institutionalData: {}
  });

  // Fetch initial data
  useEffect(() => {
    fetchPredictions();
  }, [selectedStock, selectedTimeframe]);

  // Enhanced error handling
  const handleError = (error: any, context: string) => {
    console.error(`Error in ${context}:`, error);
    let errorMessage = "An unexpected error occurred";
    
    if (error.response) {
      errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
    } else if (error.request) {
      errorMessage = "No response from server. Please check your connection.";
    } else {
      errorMessage = error.message || errorMessage;
    }

    toast({
      title: `Error in ${context}`,
      description: errorMessage,
      variant: "destructive",
      duration: 5000
    });
  };

  // Enhanced data fetching
  const fetchPredictions = async () => {
    setIsLoading(true);
    try {
      const [stockResponse, predictionResponse, historicalResponse] = await Promise.all([
        apiService.stocks.getNSEStock(selectedStock),
        apiService.predictions.getStockPrediction(selectedStock),
        apiService.stocks.getNSEHistory(selectedStock, selectedTimeframe)
      ]);

      setStockData(stockResponse);
      setPredictions(predictionResponse);
      setHistoricalData(historicalResponse);
    } catch (error) {
      handleError(error, "fetching predictions");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Indian Market Predictions</h1>
          <p className="text-muted-foreground">Advanced Analytics & ML-based Predictions</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TIMEFRAMES).map(([category, timeframes]) => (
                <div key={category}>
                  <div className="text-sm font-semibold px-2 py-1.5">{category.toUpperCase()}</div>
                  {timeframes.map((tf) => (
                    <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStock} onValueChange={setSelectedStock}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RELIANCE">Reliance Industries</SelectItem>
              <SelectItem value="TCS">Tata Consultancy Services</SelectItem>
              <SelectItem value="HDFCBANK">HDFC Bank</SelectItem>
              <SelectItem value="INFY">Infosys</SelectItem>
              <SelectItem value="ICICIBANK">ICICI Bank</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="fundamental">Fundamental</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="volume">Volume Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Stock Overview Card */}
              <Card className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{stockData?.name}</h3>
                    <p className="text-sm text-muted-foreground">{stockData?.symbol}</p>
                  </div>
                  {stockData && (
                    <div className={`text-lg font-bold ${stockData.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ₹{stockData.price.toFixed(2)}
                      <span className="text-sm ml-2">
                        {stockData.change >= 0 ? '+' : ''}{stockData.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Prediction Cards */}
              {predictions && (
                <>
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Short Term Prediction</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Target Price</span>
                        <span className="font-mono">₹{predictions.predictions.shortTerm.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Confidence</span>
                        <span>{(predictions.predictions.shortTerm.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Technical Indicators</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>RSI</span>
                        <span className="font-mono">{predictions.technicalIndicators.rsi.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>MACD</span>
                        <span className="font-mono">{predictions.technicalIndicators.macd.value.toFixed(2)}</span>
                      </div>
                    </div>
                  </Card>
                </>
              )}

              {/* Price Chart */}
              <Card className="p-6 col-span-full">
                <h3 className="text-lg font-semibold mb-4">Price Action</h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={historicalData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Area
                        type="monotone"
                        dataKey="price"
                        fill="hsl(var(--primary))"
                        stroke="hsl(var(--primary))"
                        fillOpacity={0.1}
                      />
                      <Line
                        type="monotone"
                        dataKey="prediction"
                        stroke="hsl(var(--primary))"
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Technical Indicators</h3>
              <div className="space-y-4">
                {predictions?.technicalIndicators && (
                  <>
                    <div className="flex justify-between items-center">
                      <span>RSI (14)</span>
                      <span className={`font-mono ${
                        predictions.technicalIndicators.rsi > 70 ? 'text-red-500' :
                        predictions.technicalIndicators.rsi < 30 ? 'text-green-500' :
                        'text-muted-foreground'
                      }`}>
                        {predictions.technicalIndicators.rsi.toFixed(2)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>MACD</span>
                        <span className="font-mono">{predictions.technicalIndicators.macd.value.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Signal</span>
                        <span className="font-mono">{predictions.technicalIndicators.macd.signal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Histogram</span>
                        <span className={`font-mono ${
                          predictions.technicalIndicators.macd.histogram > 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {predictions.technicalIndicators.macd.histogram.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Support & Resistance</h3>
              <div className="space-y-4">
                {predictions?.technicalIndicators && (
                  <>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Support Levels</h4>
                      <div className="space-y-2">
                        {predictions.technicalIndicators.supports.map((level, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">S{index + 1}</span>
                            <span className="font-mono">₹{level.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Resistance Levels</h4>
                      <div className="space-y-2">
                        {predictions.technicalIndicators.resistances.map((level, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">R{index + 1}</span>
                            <span className="font-mono">₹{level.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fundamental" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Key Ratios</h3>
              <div className="space-y-4">
                {predictions?.fundamentals && (
                  <>
                    <div className="flex justify-between items-center">
                      <span>P/E Ratio</span>
                      <span className="font-mono">{predictions.fundamentals.pe.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>P/B Ratio</span>
                      <span className="font-mono">{predictions.fundamentals.pb.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>EPS</span>
                      <span className="font-mono">₹{predictions.fundamentals.eps.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>ROE</span>
                      <span className="font-mono">{(predictions.fundamentals.roe * 100).toFixed(2)}%</span>
                    </div>
                  </>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Sector Analysis</h3>
              <div className="space-y-4">
                {predictions?.sectorAnalysis && (
                  <>
                    <div className="flex justify-between items-center">
                      <span>Sector Performance</span>
                      <span className={`font-mono ${
                        predictions.sectorAnalysis.sectorPerformance > 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {predictions.sectorAnalysis.sectorPerformance > 0 ? '+' : ''}
                        {predictions.sectorAnalysis.sectorPerformance.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Sector P/E</span>
                      <span className="font-mono">{predictions.sectorAnalysis.sectorPE.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Market Share</span>
                      <span className="font-mono">{(predictions.sectorAnalysis.marketShare * 100).toFixed(2)}%</span>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Market Sentiment</h3>
              <div className="space-y-4">
                {predictions?.sentimentAnalysis && (
                  <>
                    <div>
                      <label className="text-sm font-medium">Overall Sentiment</label>
                      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            predictions.sentimentAnalysis.overall > 0.5 ? 'bg-green-500' :
                            predictions.sentimentAnalysis.overall < -0.5 ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`}
                          style={{ width: `${((predictions.sentimentAnalysis.overall + 1) / 2) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>News Sentiment</span>
                      <span className="font-mono">{(predictions.sentimentAnalysis.newsScore * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Social Media Sentiment</span>
                      <span className="font-mono">{(predictions.sentimentAnalysis.socialScore * 100).toFixed(1)}%</span>
                    </div>
                  </>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Institutional Activity</h3>
              <div className="space-y-4">
                {predictions?.sentimentAnalysis && (
                  <>
                    <div className="flex justify-between items-center">
                      <span>Institutional Activity</span>
                      <span className={`font-mono ${
                        predictions.sentimentAnalysis.institutionalActivity > 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {predictions.sentimentAnalysis.institutionalActivity > 0 ? 'Bullish' : 'Bearish'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Put/Call Ratio</span>
                      <span className="font-mono">{predictions.sentimentAnalysis.putCallRatio.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RiskMetrics stockData={stockData} predictions={predictions} />
            <PortfolioAnalytics stockData={stockData} />
            <AlertManager symbol={selectedStock} />
            <NewsPanel symbol={selectedStock} />
            <OptionChain symbol={selectedStock} />
            <MarketDepth symbol={selectedStock} />
            <OrderBook symbol={selectedStock} />
          </div>
        </TabsContent>

        <TabsContent value="volume">
          <VolumeProfile data={historicalData.map(item => ({
            price: item.price,
            volume: item.volume,
            timestamp: item.timestamp
          }))} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IndianPrediction; 