import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
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
} from "lucide-react";
import IntradayPatternScanner from './IntradayPatternScanner';
import IntradayTradingPanel from './IntradayTradingPanel';
import { CandlestickChart } from './CandlestickChart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Market Analysis</h1>
          <p className="text-muted-foreground">Live Trading View with Pattern Recognition</p>
        </div>
      </div>

      <Tabs defaultValue="profit" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="profit">Profit</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="institutional">Institutional</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="intraday">Intraday Scanner</TabsTrigger>
        </TabsList>

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
    </div>
  );
};

export default MarketAnalysis;