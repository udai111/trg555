import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  BarChart2,
  Activity,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  TrendingDown,
  Brain,
  Network,
  Box,
  Cpu,
  LineChart,
  PieChart,
  Share2,
  Zap,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import IntradayPatternScanner from './IntradayPatternScanner';
import IntradayTradingPanel from './IntradayTradingPanel';
import { CandlestickChart } from './CandlestickChart';


interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface InstitutionalData {
  fii: {
    netBuy: number;
    totalBuy: number;
    totalSell: number;
    trend: string;
    weeklyChange: string;
  };
  dii: {
    netBuy: number;
    totalBuy: number;
    totalSell: number;
    trend: string;
    weeklyChange: string;
  };
}

interface MarketBreadthData {
  advanceDecline: {
    advances: number;
    declines: number;
    unchanged: number;
  };
  newHighsLows: {
    newHighs: number;
    newLows: number;
  };
  putCallRatio: number;
  vwap: number;
}

interface AlphaSignal {
  symbol: string;
  momentum: {
    momentum_1m: number;
    momentum_3m: number;
    momentum_6m: number;
    momentum_12m: number;
  };
  volatility: {
    volatility_1m: number;
    volatility_3m: number;
    parkinson_volatility: number;
  };
  value: {
    price_to_volume: number;
    turnover_ratio: number;
  };
  quality: {
    sharpe_ratio: number;
    sortino_ratio: number;
  };
  market_sentiment: {
    volume_trend: string;
    price_trend: string;
    volume_price_correlation: number;
  };
}

const MarketAnalysis = () => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [watchlistItems, setWatchlistItems] = useState<string[]>(["TSLA", "AAPL", "GOOGL"]);
  const [newSymbol, setNewSymbol] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState("TSLA");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const [selectedIndicator, setSelectedIndicator] = useState("ALL");
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [activeAlgorithm, setActiveAlgorithm] = useState("deeplearning");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const { data: alphaSignals } = useQuery({
    queryKey: ['alphaSignals', selectedSymbol],
    queryFn: async () => {
      const response = await fetch(`/api/alpha-signals?symbol=${selectedSymbol}`);
      return response.json();
    }
  });

  useEffect(() => {
    const generateCandlestickData = () => {
      const data: CandleData[] = [];
      let basePrice = 100;
      const now = new Date();

      for (let i = 0; i < 100; i++) {
        const time = new Date(now.getTime() - (100 - i) * 5 * 60000);
        const open = basePrice + Math.random() * 2 - 1;
        const high = open + Math.random() * 1;
        const low = open - Math.random() * 1;
        const close = (open + high + low) / 3 + (Math.random() - 0.5);

        basePrice = close;

        data.push({
          time: time.getTime(),
          open,
          high,
          low,
          close,
        });
      }
      return data;
    };

    setChartData(generateCandlestickData());

    const interval = setInterval(() => {
      setChartData(prevData => {
        const lastCandle = prevData[prevData.length - 1];
        const now = new Date();
        const newCandle: CandleData = {
          time: now.getTime(),
          open: lastCandle.close,
          high: lastCandle.close + Math.random(),
          low: lastCandle.close - Math.random(),
          close: lastCandle.close + (Math.random() - 0.5) * 2,
        };
        return [...prevData.slice(1), newCandle];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const drawChart = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate scaling factors
      const maxPrice = Math.max(...chartData.map(d => d.high));
      const minPrice = Math.min(...chartData.map(d => d.low));
      const priceRange = maxPrice - minPrice;
      const candleWidth = canvas.width / chartData.length;
      const scaleY = canvas.height / priceRange;

      // Draw candlesticks
      chartData.forEach((candle, i) => {
        const x = i * candleWidth;
        const y = canvas.height - (candle.close - minPrice) * scaleY;

        // Draw candle body
        ctx.fillStyle = candle.close > candle.open ? '#26a69a' : '#ef5350';
        ctx.fillRect(
          x + candleWidth * 0.2,
          canvas.height - (Math.max(candle.open, candle.close) - minPrice) * scaleY,
          candleWidth * 0.6,
          Math.abs(candle.close - candle.open) * scaleY
        );

        // Draw wicks
        ctx.beginPath();
        ctx.strokeStyle = candle.close > candle.open ? '#26a69a' : '#ef5350';
        ctx.moveTo(x + candleWidth / 2, canvas.height - (candle.high - minPrice) * scaleY);
        ctx.lineTo(x + candleWidth / 2, canvas.height - (Math.max(candle.open, candle.close) - minPrice) * scaleY);
        ctx.moveTo(x + candleWidth / 2, canvas.height - (Math.min(candle.open, candle.close) - minPrice) * scaleY);
        ctx.lineTo(x + candleWidth / 2, canvas.height - (candle.low - minPrice) * scaleY);
        ctx.stroke();
      });
    };

    drawChart();

    const handleResize = () => {
      drawChart();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [chartData]);

  const institutionalData: InstitutionalData = {
    fii: {
      netBuy: 1245.8,
      totalBuy: 8456.2,
      totalSell: 7210.4,
      trend: "Positive",
      weeklyChange: "+15.2%"
    },
    dii: {
      netBuy: -458.6,
      totalBuy: 5678.9,
      totalSell: 6137.5,
      trend: "Negative",
      weeklyChange: "-8.4%"
    }
  };

  const marketBreadthData: MarketBreadthData = {
    advanceDecline: {
      advances: 1250,
      declines: 850,
      unchanged: 100
    },
    newHighsLows: {
      newHighs: 45,
      newLows: 15
    },
    putCallRatio: 1.2,
    vwap: 18245.75
  };

  const addToWatchlist = (symbol: string) => {
    if (symbol && !watchlistItems.includes(symbol)) {
      setWatchlistItems([...watchlistItems, symbol]);
      setNewSymbol("");
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlistItems(watchlistItems.filter(item => item !== symbol));
  };

  return (
    <div className="p-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-6"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Quantum Trading Interface
          </h1>
          <p className="text-muted-foreground">Advanced Quantitative Analysis & ML-Powered Trading</p>
        </div>
      </motion.div>

      <Tabs defaultValue="quantum" className="space-y-4">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="quantum" className="flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            Quantum
          </TabsTrigger>
          <TabsTrigger value="alpha" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Alpha
          </TabsTrigger>
          <TabsTrigger value="network" className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            Network
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <Box className="w-4 h-4" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="execution" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Execution
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Risk
          </TabsTrigger>
          <TabsTrigger value="ml" className="flex items-center gap-2">
            <LineChart className="w-4 h-4" />
            ML Models
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quantum">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="col-span-2 p-6 backdrop-blur-lg bg-card/30">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Brain className="w-6 h-6 text-primary" />
                  Quantum Alpha Signals
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {alphaSignals && Object.entries(alphaSignals).map(([factor, value]) => (
                    <motion.div
                      key={factor}
                      className="p-4 rounded-lg bg-card/50 backdrop-blur"
                      whileHover={{ scale: 1.02 }}
                    >
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        {factor.toUpperCase()}
                      </h4>
                      <div className="text-2xl font-bold text-primary">
                        {typeof value === 'number' ? value.toFixed(2) : JSON.stringify(value)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </Card>

            <Card className="p-6 backdrop-blur-lg bg-card/30">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Market Regime Detection
              </h3>
              {/* Add Market Regime Visualization Here */}
            </Card>

            <Card className="p-6 backdrop-blur-lg bg-card/30">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Network className="w-5 h-5 text-primary" />
                Factor Network Analysis
              </h3>
              {/* Add Factor Network Visualization Here */}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alpha">
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Alpha Factor Heatmap
              </h3>
              {/* Add Alpha Factor Heatmap Here */}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="network">
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Network className="w-5 h-5" />
                Factor Correlation Matrix
              </h3>
              {/* Add Factor Correlation Matrix Here */}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="portfolio">
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Box className="w-5 h-5" />
                Interactive 3D Portfolio Visualization
              </h3>
              {/* Add 3D Portfolio Visualization Here */}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="execution">
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Advanced Order Flow Visualization
              </h3>
              {/* Add Advanced Order Flow Visualization Here */}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk">
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Risk Attribution Charts
              </h3>
              {/* Add Risk Attribution Charts Here */}
            </Card>
          </div>
        </TabsContent>


        <TabsContent value="ml">
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                ML Model Overlays on Indicators
              </h3>
              {/* Add ML Model Overlays on Indicators Here */}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profit">
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart2 className="w-5 h-5" />
                Live Trading View
              </h3>
              <canvas
                ref={canvasRef}
                className="w-full h-[600px] bg-background"
                style={{ width: '100%', height: '600px' }}
              />
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Pattern Recognition
                </h3>
                <div className="space-y-4">
                  {/* {patterns.slice(-3).map((pattern, index) => ( */}
                  {/*   <motion.div */}
                  {/*     key={index} */}
                  {/*     initial={{ opacity: 0, y: 20 }} */}
                  {/*     animate={{ opacity: 1, y: 0 }} */}
                  {/*     className="flex items-center justify-between" */}
                  {/*   > */}
                  {/*     <span className="flex items-center gap-2"> */}
                  {/*       {pattern.shape === 'arrowUp' ? ( */}
                  {/*         <ArrowUpCircle className="w-4 h-4 text-green-500" /> */}
                  {/*       ) : ( */}
                  {/*         <ArrowDownCircle className="w-4 h-4 text-red-500" /> */}
                  {/*       )} */}
                  {/*       {pattern.text} */}
                  {/*     </span> */}
                  {/*     <span className="text-sm text-muted-foreground"> */}
                  {/*       {new Date((pattern.time as number) * 1000).toLocaleTimeString()} */}
                  {/*     </span> */}
                  {/*   </motion.div> */}
                  {/* ))} */}
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Profit Analysis
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Today's P&L</span>
                    <span className="text-green-500 text-xl font-semibold">+₹12,500</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Week's P&L</span>
                    <span className="text-green-500 text-xl font-semibold">+₹45,000</span>
                  </div>
                  <div className="h-px bg-border my-4" />
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span>Win Rate</span>
                        <span className="font-semibold">75%</span>
                      </div>
                      <div className="w-full bg-accent/10 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }} />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Win</span>
                      <span className="text-green-500 font-semibold">₹5,200</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Loss</span>
                      <span className="text-red-500 font-semibold">₹2,100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Risk/Reward Ratio</span>
                      <span className="font-semibold">1:2.48</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="md:col-span-2 p-6">
                <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-accent/10 rounded-lg">
                    <h4 className="text-sm text-muted-foreground mb-1">Profit Factor</h4>
                    <p className="text-2xl font-bold">2.35</p>
                    <span className="text-xs text-muted-foreground">Good &gt; 2.0</span>
                  </div>
                  <div className="p-4 bg-accent/10 rounded-lg">
                    <h4 className="text-sm text-muted-foreground mb-1">Sharpe Ratio</h4>
                    <p className="text-2xl font-bold">1.85</p>
                    <span className="text-xs text-muted-foreground">Good &gt; 1.0</span>
                  </div>
                  <div className="p-4 bg-accent/10 rounded-lg">
                    <h4 className="text-sm text-muted-foreground mb-1">Max Drawdown</h4>
                    <p className="text-2xl font-bold text-red-500">-12.5%</p>
                    <span className="text-xs text-muted-foreground">Last 30 days</span>
                  </div>
                  <div className="p-4 bg-accent/10 rounded-lg">
                    <h4 className="text-sm text-muted-foreground mb-1">Expectancy</h4>
                    <p className="text-2xl font-bold text-green-500">₹2,340</p>
                    <span className="text-xs text-muted-foreground">Per trade</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Market Breadth</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Advances</span>
                  <span className="text-green-500">{marketBreadthData.advanceDecline.advances}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Declines</span>
                  <span className="text-red-500">{marketBreadthData.advanceDecline.declines}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">FII Activity</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Net Buy:</span>
                  <span className={cn(
                    institutionalData.fii.trend === 'Positive' ? 'text-green-500' : 'text-red-500'
                  )}>
                    {institutionalData.fii.netBuy > 0 ? '+' : ''}{institutionalData.fii.netBuy.toFixed(1)} Cr
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Buy:</span>
                  <span>{institutionalData.fii.totalBuy.toFixed(1)} Cr</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">DII Activity</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Net Buy:</span>
                  <span className={cn(
                    institutionalData.dii.trend === 'Positive' ? 'text-green-500' : 'text-red-500'
                  )}>
                    {institutionalData.dii.netBuy > 0 ? '+' : ''}{institutionalData.dii.netBuy.toFixed(1)} Cr
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Buy:</span>
                  <span>{institutionalData.dii.totalBuy.toFixed(1)} Cr</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="institutional">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">FII Activity</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Net Buy:</span>
                  <span className={cn(
                    institutionalData.fii.trend === 'Positive' ? 'text-green-500' : 'text-red-500'
                  )}>
                    {institutionalData.fii.netBuy > 0 ? '+' : ''}{institutionalData.fii.netBuy.toFixed(1)} Cr
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Buy:</span>
                  <span>{institutionalData.fii.totalBuy.toFixed(1)} Cr</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Sell:</span>
                  <span>{institutionalData.fii.totalSell.toFixed(1)} Cr</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Weekly Change:</span>
                  <span className={cn(
                    institutionalData.fii.trend === 'Positive' ? 'text-green-500' : 'text-red-500'
                  )}>
                    {institutionalData.fii.weeklyChange}
                  </span>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">DII Activity</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Net Buy:</span>
                  <span className={cn(
                    institutionalData.dii.trend === 'Positive' ? 'text-green-500' : 'text-red-500'
                  )}>
                    {institutionalData.dii.netBuy > 0 ? '+' : ''}{institutionalData.dii.netBuy.toFixed(1)} Cr
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Buy:</span>
                  <span>{institutionalData.dii.totalBuy.toFixed(1)} Cr</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Sell:</span>
                  <span>{institutionalData.dii.totalSell.toFixed(1)} Cr</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Weekly Change:</span>
                  <span className={cn(
                    institutionalData.dii.trend === 'Positive' ? 'text-green-500' : 'text-red-500'
                  )}>
                    {institutionalData.dii.weeklyChange}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technical">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Technical Indicators</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>RSI</span>
                  <span>55</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>MACD</span>
                  <span>Positive</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>SMA (200)</span>
                  <span>18000</span>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Volume Analysis</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Volume</span>
                  <span>100000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>OBV</span>
                  <span>Increasing</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>VWAP</span>
                  <span>{marketBreadthData.vwap.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns">
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Advanced Pattern Analysis</h3>
              <div className="mb-4">
                <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select symbol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RELIANCE">RELIANCE</SelectItem>
                    <SelectItem value="TCS">TCS</SelectItem>
                    <SelectItem value="INFY">INFY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <CandlestickChart
                data={chartData}
                onPatternDetected={(pattern) => {
                  toast({
                    title: "Pattern Detected",
                    description: `Found ${pattern} pattern`,
                    variant: "default",
                  });
                }}
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="intraday">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-1">
              <IntradayPatternScanner />
            </div>
            <div className="lg:col-span-1">
              <IntradayTradingPanel />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="p-6 backdrop-blur-lg bg-card/30">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            Model Performance
          </h3>
          <div className="space-y-4">
            <Select value={activeAlgorithm} onValueChange={setActiveAlgorithm}>
              <SelectTrigger>
                <SelectValue placeholder="Select Algorithm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deeplearning">Deep Learning</SelectItem>
                <SelectItem value="ensemble">Ensemble</SelectItem>
                <SelectItem value="reinforcement">Reinforcement Learning</SelectItem>
              </SelectContent>
            </Select>
            {/* Add Model Performance Metrics Here */}
          </div>
        </Card>

        <Card className="p-6 backdrop-blur-lg bg-card/30">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Risk Attribution
          </h3>
          {/* Add Risk Attribution Chart Here */}
        </Card>

        <Card className="p-6 backdrop-blur-lg bg-card/30">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" />
            Portfolio Allocation
          </h3>
          {/* Add Portfolio Allocation Chart Here */}
        </Card>
      </motion.div>
    </div>
  );
};

export default MarketAnalysis;