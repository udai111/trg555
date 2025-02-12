import { useEffect, useState, useRef, memo } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createChart, ColorType, IChartApi, CandlestickData, Time } from "lightweight-charts";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, TrendingUp, TrendingDown, BarChart2, HelpCircle,
  Bitcoin, LineChart, Globe, CandlestickChart, Bell,
  Pencil, Settings, Info, AlertTriangle, CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";

// Extended pattern types
interface PatternData {
  name: string;
  probability: number;
  strength: number;
  successRate: number;
  recentSignals: number;
  signalType: 'buy' | 'sell' | 'neutral';
  timeframe: string;
  example: {
    entry: number;
    target: number;
    stopLoss: number;
  };
  description: string;
}

interface StockPattern {
  symbol: string;
  patterns: PatternData[];
}

interface CustomDrawing {
  type: 'trendline' | 'fibonacci' | 'rectangle' | 'circle';
  points: { x: number; y: number }[];
  color: string;
}

// Extended pattern list
const ALL_PATTERNS = [
  // Basic Patterns
  "Doji", "Hammer", "Shooting Star", "Engulfing", "Morning Star",
  "Evening Star", "Harami", "Three White Soldiers", "Three Black Crows",
  "Piercing Line", "Dark Cloud Cover", "Rising Three Methods",
  "Falling Three Methods", "Three Inside Up", "Three Inside Down",
  // Advanced Patterns
  "Head and Shoulders", "Inverse Head and Shoulders", "Double Top",
  "Double Bottom", "Triple Top", "Triple Bottom", "Rounding Bottom",
  "Cup and Handle", "Flag", "Pennant", "Wedge", "Triangle",
  "Diamond Top", "Diamond Bottom", "Butterfly", "Gartley",
  "Bat Pattern", "Crab Pattern", "Shark Pattern", "ABCD Pattern"
];

// Chart Components
const NormalChart = memo(({
  data,
  patterns,
  drawings,
  onDrawingComplete,
  isDrawingMode
}: {
  data: CandlestickData[];
  patterns: PatternData[];
  drawings: CustomDrawing[];
  onDrawingComplete: (drawing: CustomDrawing) => void;
  isDrawingMode: boolean;
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    setIsLoading(true);

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid' as ColorType, color: '#131722' },
        textColor: '#D9D9D9',
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#2B2B43',
      },
      rightPriceScale: {
        borderColor: '#2B2B43',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      crosshair: {
        mode: 1,
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
    });

    const mainSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderUpColor: '#26a69a',
      borderDownColor: '#ef5350',
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Add markers for patterns with success rate coloring
    const markers = patterns.map(pattern => ({
      time: data[data.length - 1].time,
      position: 'aboveBar' as const,
      color: pattern.successRate > 70 ? '#26a69a' :
        pattern.successRate > 50 ? '#f0ad4e' : '#ef5350',
      shape: pattern.signalType === 'buy' ? 'arrowUp' : 'arrowDown' as const,
      text: `${pattern.name} (${pattern.successRate}% success)`
    }));

    mainSeries.setData(data);
    mainSeries.setMarkers(markers);

    // Render custom drawings
    drawings.forEach(drawing => {
      if (drawing.type === 'trendline' && drawing.points.length === 2) {
        const line = chart.addLineSeries({
          color: drawing.color,
          lineWidth: 2,
        });
        line.setData([
          { time: drawing.points[0].x as Time, value: drawing.points[0].y },
          { time: drawing.points[1].x as Time, value: drawing.points[1].y }
        ]);
      }
    });

    // Drawing mode handlers
    if (isDrawingMode) {
      let drawingPoints: { x: number; y: number }[] = [];

      chartContainerRef.current.addEventListener('click', (e) => {
        const rect = chartContainerRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        drawingPoints.push({ x, y });

        if (drawingPoints.length === 2) {
          onDrawingComplete({
            type: 'trendline',
            points: drawingPoints,
            color: '#ffffff'
          });
          drawingPoints = [];
        }
      });
    }

    setTimeout(() => setIsLoading(false), 500);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, patterns, drawings, isDrawingMode]);

  return (
    <div className="relative">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 flex items-center justify-center z-50"
          >
            <div className="flex flex-col items-center gap-4">
              <Activity className="w-8 h-8 animate-pulse" />
              <p>Loading Chart...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={chartContainerRef} className="h-[500px] w-full" />
    </div>
  );
});

NormalChart.displayName = 'NormalChart';

// Main Component
export default function CandlestickPatternsPage() {
  const [activePatterns, setActivePatterns] = useState<StockPattern[]>([]);
  const [selectedStock, setSelectedStock] = useState("RELIANCE");
  const [marketType, setMarketType] = useState<'indian' | 'international' | 'crypto'>('indian');
  const [chartType, setChartType] = useState<'normal' | 'lightweight' | 'tradingview'>('normal');
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const [drawings, setDrawings] = useState<CustomDrawing[]>([]);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [successRateThreshold, setSuccessRateThreshold] = useState(70);

  // Market Data
  const indianStocks = [
    "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "WIPRO",
    "BAJFINANCE", "BHARTIARTL", "ASIANPAINT", "MARUTI"
  ];

  const internationalStocks = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META",
    "NVDA", "JPM", "V", "WMT"
  ];

  const cryptoData = [
    "BTC/USDT", "ETH/USDT", "BNB/USDT", "XRP/USDT", "ADA/USDT",
    "SOL/USDT", "DOT/USDT", "DOGE/USDT", "MATIC/USDT", "LINK/USDT"
  ];

  // Price calculation functions
  const getBasePrice = (symbol: string): number => {
    const prices = {
      indian: {
        'RELIANCE': 2432.50, 'TCS': 3890.75, 'INFY': 1567.25,
        'HDFCBANK': 1678.90, 'ICICIBANK': 987.45, 'WIPRO': 456.78,
        'BAJFINANCE': 6789.30, 'BHARTIARTL': 876.54,
        'ASIANPAINT': 3456.78, 'MARUTI': 9876.54,
      },
      international: {
        'AAPL': 185.85, 'MSFT': 420.55, 'GOOGL': 145.75,
        'AMZN': 175.35, 'TSLA': 185.85, 'META': 465.20,
        'NVDA': 725.35, 'JPM': 185.45, 'V': 275.85, 'WMT': 175.45,
      },
      crypto: {
        'BTC/USDT': 48000, 'ETH/USDT': 2800, 'BNB/USDT': 320,
        'XRP/USDT': 0.55, 'ADA/USDT': 0.50, 'SOL/USDT': 95,
        'DOT/USDT': 15, 'DOGE/USDT': 0.08, 'MATIC/USDT': 0.85,
        'LINK/USDT': 18,
      }
    };
    return prices[marketType]?.[symbol] || 100;
  };

  const getAvailableSymbols = () => {
    const symbolMap = {
      indian: indianStocks,
      international: internationalStocks,
      crypto: cryptoData
    };
    return symbolMap[marketType] || indianStocks;
  };

  // Effects
  useEffect(() => {
    const currentDate = new Date();
    const basePrice = getBasePrice(selectedStock);
    const volatility = marketType === 'crypto' ? 0.02 : 0.01;

    const data: CandlestickData[] = Array.from({ length: 50 }).map((_, i) => {
      const date = new Date(currentDate);
      date.setMinutes(date.getMinutes() - (50 - i) * 15);

      const variance = Math.random() * (basePrice * volatility) - (basePrice * volatility / 2);
      const open = basePrice + variance;
      const high = open + Math.random() * (basePrice * volatility);
      const low = open - Math.random() * (basePrice * volatility);
      const close = (open + high + low) / 3 + (Math.random() - 0.5) * (basePrice * volatility / 2);

      return {
        time: Math.floor(date.getTime() / 1000) as Time,
        open,
        high,
        low,
        close,
      };
    });

    setChartData(data);
  }, [selectedStock, marketType]);

  // Pattern generation and alerts
  useEffect(() => {
    const interval = setInterval(() => {
      const availableStocks = getAvailableSymbols();
      const newPatterns = availableStocks.map(symbol => ({
        symbol,
        patterns: ALL_PATTERNS
          .filter(() => Math.random() > 0.7)
          .map(name => {
            const successRate = Math.round(Math.random() * 100);
            const pattern: PatternData = {
              name,
              probability: Math.round(Math.random() * 100),
              strength: Math.round(Math.random() * 100),
              successRate,
              recentSignals: Math.round(Math.random() * 10),
              signalType: Math.random() > 0.5 ? 'buy' : 'sell',
              timeframe: ['1H', '4H', '1D'][Math.floor(Math.random() * 3)],
              example: {
                entry: getBasePrice(symbol),
                target: getBasePrice(symbol) * 1.02,
                stopLoss: getBasePrice(symbol) * 0.98,
              },
              description: `A ${name} pattern indicates a potential ${Math.random() > 0.5 ? 'reversal' : 'continuation'} in the current trend.`,
            };

            // Show alerts for high probability patterns
            if (alertsEnabled && successRate >= successRateThreshold) {
              toast({
                title: "Pattern Alert",
                description: `${name} detected on ${symbol} with ${successRate}% success rate`,
                variant: "default"
              });
            }

            return pattern;
          }),
      }));
      setActivePatterns(newPatterns);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedStock, marketType, alertsEnabled, successRateThreshold]);

  // Event Handlers
  const handleMarketTypeChange = (type: string) => {
    if (type === 'indian' || type === 'international' || type === 'crypto') {
      setMarketType(type as 'indian' | 'international' | 'crypto');
      const defaultSymbols = {
        indian: 'RELIANCE',
        international: 'AAPL',
        crypto: 'BTC/USDT'
      };
      setSelectedStock(defaultSymbols[type as keyof typeof defaultSymbols]);
    }
  };

  const handleDrawingComplete = (drawing: CustomDrawing) => {
    setDrawings(prev => [...prev, drawing]);
    toast({
      title: "Drawing Added",
      description: "Custom drawing has been added to the chart",
      variant: "default"
    });
  };

  // Tutorial Component
  const Tutorial = () => (
    <AnimatePresence>
      {showTutorial && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 bg-background/80 flex items-center justify-center z-50"
        >
          <Card className="w-[600px] p-6 space-y-4">
            <h3 className="text-2xl font-bold">Welcome to Pattern Recognition</h3>
            <div className="space-y-4">
              <p>🎯 Quick Start Guide:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Switch between Indian, International, and Crypto markets</li>
                <li>Use drawing tools to mark your own patterns</li>
                <li>Enable alerts for high-probability patterns</li>
                <li>View success rates and historical performance</li>
              </ul>
              <Button onClick={() => setShowTutorial(false)} className="w-full">
                Get Started
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="p-6 space-y-6">
      <Tutorial />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Live Pattern Recognition</h1>
        <div className="flex items-center gap-4">
          <ToggleGroup type="single" value={marketType} onValueChange={handleMarketTypeChange}>
            <ToggleGroupItem value="indian" aria-label="Indian">
              <BarChart2 className="h-4 w-4 mr-2" />
              Indian
            </ToggleGroupItem>
            <ToggleGroupItem value="international" aria-label="International">
              <Globe className="h-4 w-4 mr-2" />
              International
            </ToggleGroupItem>
            <ToggleGroupItem value="crypto" aria-label="Crypto">
              <Bitcoin className="h-4 w-4 mr-2" />
              Crypto
            </ToggleGroupItem>
          </ToggleGroup>

          <ToggleGroup
            type="single"
            value={chartType}
            onValueChange={(value: string) => {
              if (value === 'normal' || value === 'lightweight' || value === 'tradingview') {
                setChartType(value as 'normal' | 'lightweight' | 'tradingview');
              }
            }}
          >
            <ToggleGroupItem value="normal" aria-label="Normal Chart">
              <CandlestickChart className="h-4 w-4 mr-2" />
              Pattern Chart
            </ToggleGroupItem>
            <ToggleGroupItem value="lightweight" aria-label="Lightweight Charts">
              <LineChart className="h-4 w-4 mr-2" />
              Custom Chart
            </ToggleGroupItem>
            <ToggleGroupItem value="tradingview" aria-label="TradingView">
              <BarChart2 className="h-4 w-4 mr-2" />
              TradingView
            </ToggleGroupItem>
          </ToggleGroup>

          <Select value={selectedStock} onValueChange={setSelectedStock}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select asset" />
            </SelectTrigger>
            <SelectContent>
              {getAvailableSymbols().map((asset) => (
                <SelectItem key={asset} value={asset}>
                  {asset}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 animate-pulse text-green-500" />
            <span>Live Scanning</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">{selectedStock} Analysis</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="drawing-mode"
                  checked={isDrawingMode}
                  onCheckedChange={setIsDrawingMode}
                />
                <Label htmlFor="drawing-mode">Drawing Mode</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="alerts"
                  checked={alertsEnabled}
                  onCheckedChange={setAlertsEnabled}
                />
                <Label htmlFor="alerts">Alerts</Label>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowTutorial(true)}>
                <Info className="w-4 h-4 mr-2" />
                Help
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <Label>Success Rate Alert Threshold: {successRateThreshold}%</Label>
            <Slider
              value={[successRateThreshold]}
              onValueChange={([value]) => setSuccessRateThreshold(value)}
              max={100}
              step={1}
            />
          </div>

          <NormalChart
            data={chartData}
            patterns={activePatterns.find(p => p.symbol === selectedStock)?.patterns || []}
            drawings={drawings}
            onDrawingComplete={handleDrawingComplete}
            isDrawingMode={isDrawingMode}
          />
        </Card>

        <Card className="p-6 overflow-auto max-h-[calc(500px+2rem)]">
          <h2 className="text-2xl font-semibold mb-4">Active Patterns</h2>
          <div className="space-y-4">
            {activePatterns
              .filter(stock => stock.symbol === selectedStock)
              .map((stock) => (
                <div key={stock.symbol} className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {stock.symbol}
                    {stock.patterns.length > 0 && (
                      <span className="text-sm text-green-500">
                        {stock.patterns.length} active patterns
                      </span>
                    )}
                  </h3>
                  {stock.patterns.map((pattern) => (
                    <motion.div
                      key={`${stock.symbol}-${pattern.name}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-accent/10 p-3 rounded-lg space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium flex items-center gap-2">
                          {pattern.name}
                          {pattern.successRate >= successRateThreshold && (
                            <Bell className="w-4 h-4 text-primary animate-pulse" />
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-1 rounded text-xs",
                            pattern.signalType === 'buy' ? "bg-green-500/20 text-green-500" :
                              pattern.signalType === 'sell' ? "bg-red-500/20 text-red-500" :
                                "bg-yellow-500/20 text-yellow-500"
                          )}>
                            {pattern.signalType.toUpperCase()}
                          </span>
                          <span className={cn(
                            "px-2 py-1 rounded text-xs",
                            pattern.successRate > 70 ? "bg-green-500/20 text-green-500" :
                              pattern.successRate > 40 ? "bg-yellow-500/20 text-yellow-500" :
                                "bg-red-500/20 text-red-500"
                          )}>
                            {pattern.successRate}% Success
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Entry</span>
                          <span>{marketType === 'crypto' ? '$' : '₹'}{pattern.example.entry.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-green-500">
                          <span>Target</span>
                          <span>{marketType === 'crypto' ? '$' : '₹'}{pattern.example.target.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-red-500">
                          <span>Stop Loss</span>
                          <span>{marketType === 'crypto' ? '$' : '₹'}{pattern.example.stopLoss.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Recent Signals: {pattern.recentSignals}</span>
                        <span>Timeframe: {pattern.timeframe}</span>
                      </div>
                      <div className="h-2 bg-accent/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${pattern.strength}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {pattern.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}