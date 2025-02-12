import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createChart, IChartApi, CandlestickData, Time } from "lightweight-charts";
import { motion } from "framer-motion";
import { Activity, TrendingUp, TrendingDown, BarChart2, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PatternData {
  name: string;
  probability: number;
  strength: number;
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

export default function CandlestickPatternsPage() {
  const [activePatterns, setActivePatterns] = useState<StockPattern[]>([]);
  const [selectedStock, setSelectedStock] = useState("RELIANCE");
  const chartRef = useRef<IChartApi | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const candlestickSeriesRef = useRef<any>(null);

  const patterns = [
    "Doji", "Hammer", "Shooting Star", "Engulfing", "Morning Star",
    "Evening Star", "Harami", "Three White Soldiers", "Three Black Crows",
    "Piercing Line", "Dark Cloud Cover", "Rising Three Methods",
    "Falling Three Methods", "Three Inside Up", "Three Inside Down"
  ];

  const mockStockData = [
    "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "WIPRO",
    "BAJFINANCE", "BHARTIARTL", "ASIANPAINT", "MARUTI"
  ];

  const initializeChart = () => {
    if (!containerRef.current) return;

    try {
      // Clear existing chart
      if (chartRef.current) {
        chartRef.current.remove();
      }

      const chart = createChart(containerRef.current, {
        layout: {
          background: { 
            color: 'transparent' 
          },
          textColor: 'rgba(255, 255, 255, 0.9)',
        },
        grid: {
          vertLines: { color: 'rgba(197, 203, 206, 0.1)' },
          horzLines: { color: 'rgba(197, 203, 206, 0.1)' },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
        width: containerRef.current.clientWidth,
        height: 500,
      });

      chartRef.current = chart;

      const candlestickSeries = chart.addSeriesCustom('Candlestick', {
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      candlestickSeriesRef.current = candlestickSeries;

      // Generate mock data for the selected stock
      const currentDate = new Date();
      const data: CandlestickData[] = Array.from({ length: 50 }).map((_, i) => {
        const date = new Date(currentDate);
        date.setMinutes(date.getMinutes() - (50 - i) * 15);

        const basePrice = selectedStock === "RELIANCE" ? 2500 : 1000;
        const variance = Math.random() * (basePrice * 0.02) - (basePrice * 0.01);
        const open = basePrice + variance;
        const high = open + Math.random() * (basePrice * 0.01);
        const low = open - Math.random() * (basePrice * 0.01);
        const close = (open + high + low) / 3 + (Math.random() - 0.5) * (basePrice * 0.005);

        return {
          time: date.getTime() / 1000 as Time,
          open,
          high,
          low,
          close,
        };
      });

      candlestickSeries.setData(data);

      // Handle resize
      const handleResize = () => {
        if (containerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: containerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    } catch (error) {
      console.error('Error initializing chart:', error);
    }
  };

  useEffect(() => {
    initializeChart();
  }, [selectedStock]); // Reinitialize chart when selected stock changes

  useEffect(() => {
    const interval = setInterval(() => {
      const newPatterns = mockStockData.map(symbol => ({
        symbol,
        patterns: patterns
          .filter(() => Math.random() > 0.7)
          .map(name => ({
            name,
            probability: Math.round(Math.random() * 100),
            strength: Math.round(Math.random() * 100),
            example: {
              entry: selectedStock === "RELIANCE" ? 2500 : 1000,
              target: selectedStock === "RELIANCE" ? 2550 : 1050,
              stopLoss: selectedStock === "RELIANCE" ? 2450 : 950,
            },
            description: `A ${name} pattern indicates a potential ${Math.random() > 0.5 ? 'reversal' : 'continuation'} in the current trend.`,
          })),
      }));
      setActivePatterns(newPatterns);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedStock]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Live Pattern Recognition</h1>
        <div className="flex items-center gap-4">
          <Select value={selectedStock} onValueChange={setSelectedStock}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select stock" />
            </SelectTrigger>
            <SelectContent>
              {mockStockData.map((stock) => (
                <SelectItem key={stock} value={stock}>
                  {stock}
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
            <h2 className="text-2xl font-semibold">HD Chart Analysis</h2>
            <div className="text-sm text-muted-foreground">
              {selectedStock} Live Chart
            </div>
          </div>
          <div ref={containerRef} className="h-[500px] w-full" />
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
                        <span className="font-medium">{pattern.name}</span>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-1 rounded text-xs",
                            pattern.probability > 70 ? "bg-green-500/20 text-green-500" :
                              pattern.probability > 40 ? "bg-yellow-500/20 text-yellow-500" :
                                "bg-red-500/20 text-red-500"
                          )}>
                            {pattern.probability}% Probability
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Entry</span>
                          <span>₹{pattern.example.entry}</span>
                        </div>
                        <div className="flex justify-between text-green-500">
                          <span>Target</span>
                          <span>₹{pattern.example.target}</span>
                        </div>
                        <div className="flex justify-between text-red-500">
                          <span>Stop Loss</span>
                          <span>₹{pattern.example.stopLoss}</span>
                        </div>
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

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Pattern Guide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patterns.map((pattern) => (
            <div key={pattern} className="p-4 bg-accent/10 rounded-lg">
              <h3 className="font-semibold flex items-center gap-2">
                {pattern}
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Learn how to trade the {pattern} pattern with live examples and success rates.
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}