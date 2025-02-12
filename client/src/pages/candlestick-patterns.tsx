import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createChart, IChartApi, CandlestickData, Time } from "lightweight-charts";
import { motion } from "framer-motion";
import { Activity, TrendingUp, TrendingDown, BarChart2, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const chartRef = useRef<IChartApi | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const patterns = [
    "Doji",
    "Hammer",
    "Shooting Star",
    "Engulfing",
    "Morning Star",
    "Evening Star",
    "Harami",
    "Three White Soldiers",
    "Three Black Crows",
    "Piercing Line",
    "Dark Cloud Cover",
    "Rising Three Methods",
    "Falling Three Methods",
    "Three Inside Up",
    "Three Inside Down"
  ];

  const mockStockData = [
    "RELIANCE",
    "TCS",
    "INFY",
    "HDFCBANK",
    "ICICIBANK"
  ];

  useEffect(() => {
    // Initialize chart
    if (containerRef.current) {
      const chart = createChart(containerRef.current, {
        layout: {
          background: { color: 'transparent' },
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
      });

      chartRef.current = chart;

      // Add candlestick series
      const candlestickSeries = chart.addCandlestickSeries();

      // Generate mock data
      const currentDate = new Date();
      const data: CandlestickData[] = Array.from({ length: 50 }).map((_, i) => {
        const date = new Date(currentDate);
        date.setMinutes(date.getMinutes() - (50 - i) * 15);

        const basePrice = 1000;
        const variance = Math.random() * 20 - 10;
        const open = basePrice + variance;
        const high = open + Math.random() * 10;
        const low = open - Math.random() * 10;
        const close = (open + high + low) / 3 + (Math.random() - 0.5) * 5;

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
      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartRef.current) {
          chartRef.current.remove();
        }
      };
    }
  }, []);

  useEffect(() => {
    // Simulate real-time pattern detection
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
              entry: 1000,
              target: 1000 + Math.round(Math.random() * 50),
              stopLoss: 1000 - Math.round(Math.random() * 30),
            },
            description: `A ${name} pattern indicates a potential ${Math.random() > 0.5 ? 'reversal' : 'continuation'} in the current trend.`,
          })),
      }));
      setActivePatterns(newPatterns);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Live Pattern Recognition</h1>
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 animate-pulse text-green-500" />
          <span>Live Scanning</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-2xl font-semibold mb-4">HD Chart Analysis</h2>
          <div ref={containerRef} className="h-[500px]" />
        </Card>

        <Card className="p-6 overflow-auto max-h-[500px]">
          <h2 className="text-2xl font-semibold mb-4">Active Patterns</h2>
          <div className="space-y-4">
            {activePatterns.map((stock) => (
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