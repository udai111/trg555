import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, TrendingUp, TrendingDown, BarChart2, LineChart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface MarketData {
  symbol: string;
  probability: number;
  direction: 'up' | 'down' | 'sideways';
  strength: number;
  timeframe: string;
  lastUpdate: string;
  technicalScore: number;
  volumeProfile: number;
  trendStrength: number;
  supportLevel: number;
  resistanceLevel: number;
  keyLevels: {
    entry: number;
    target: number;
    stopLoss: number;
  };
}

interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'buy' | 'sell' | 'neutral';
  timeframe: string;
}

const fetchMarketData = async (symbol: string) => {
  const response = await fetch(`/api/patterns/active/${symbol}`);
  if (!response.ok) throw new Error('Failed to fetch market data');
  return response.json();
};

const fetchTechnicalData = async (symbol: string) => {
  const response = await fetch(`/api/indicators/latest/${symbol}`);
  if (!response.ok) throw new Error('Failed to fetch technical data');
  return response.json();
};

const fetchScreenerResults = async (symbol: string) => {
  const response = await fetch(`/api/screener/latest/${symbol}`);
  if (!response.ok) throw new Error('Failed to fetch screener results');
  return response.json();
};

export default function IntradayProbabilityPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE");
  const [timeframe, setTimeframe] = useState("5min");
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  const { data: marketData, isLoading: marketLoading } = useQuery({
    queryKey: ['/api/patterns/active', selectedSymbol],
    queryFn: () => fetchMarketData(selectedSymbol),
    refetchInterval: isAutoRefresh ? 5000 : false,
  });

  const { data: technicalData, isLoading: technicalLoading } = useQuery({
    queryKey: ['/api/indicators/latest', selectedSymbol],
    queryFn: () => fetchTechnicalData(selectedSymbol),
    refetchInterval: isAutoRefresh ? 5000 : false,
  });

  const { data: screenerData, isLoading: screenerLoading } = useQuery({
    queryKey: ['/api/screener/latest', selectedSymbol],
    queryFn: () => fetchScreenerResults(selectedSymbol),
    refetchInterval: isAutoRefresh ? 5000 : false,
  });

  const stockOptions = [
    "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK",
    "WIPRO", "BAJFINANCE", "BHARTIARTL", "ASIANPAINT", "MARUTI"
  ];

  const timeframeOptions = ["1min", "5min", "15min", "30min", "1H", "4H", "1D"];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Live Intraday Probability</h1>
        <div className="flex items-center gap-4">
          <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select stock" />
            </SelectTrigger>
            <SelectContent>
              {stockOptions.map((stock) => (
                <SelectItem key={stock} value={stock}>
                  {stock}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              {timeframeOptions.map((tf) => (
                <SelectItem key={tf} value={tf}>
                  {tf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={isAutoRefresh ? "default" : "outline"}
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
          >
            <Activity className={cn(
              "w-4 h-4 mr-2",
              isAutoRefresh && "animate-pulse"
            )} />
            {isAutoRefresh ? "Live" : "Paused"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Probability Score Card */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Probability Score</h2>
          {marketLoading ? (
            <div className="flex items-center justify-center h-40">
              <Activity className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {marketData?.map((pattern: any) => (
                <div key={pattern.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">
                      {pattern.pattern_type}
                    </span>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium",
                      parseFloat(pattern.probability) > 70 
                        ? "bg-green-500/20 text-green-500"
                        : parseFloat(pattern.probability) > 40
                        ? "bg-yellow-500/20 text-yellow-500"
                        : "bg-red-500/20 text-red-500"
                    )}>
                      {parseFloat(pattern.probability).toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Signal Time: {new Date(pattern.signal_time).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Technical Indicators */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Technical Analysis</h2>
          {technicalLoading ? (
            <div className="flex items-center justify-center h-40">
              <Activity className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {technicalData?.map((indicator: any) => (
                <div key={indicator.id} className="bg-accent/10 p-3 rounded-lg">
                  <div className="text-sm font-medium">
                    {indicator.indicator_type}
                  </div>
                  <div className="text-2xl font-semibold">
                    {parseFloat(indicator.value).toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(indicator.calculation_time).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Screener Results */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Screener Analysis</h2>
          {screenerLoading ? (
            <div className="flex items-center justify-center h-40">
              <Activity className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {screenerData?.map((result: any) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-accent/10 p-4 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{result.screening_type}</span>
                    <span className={cn(
                      "px-2 py-1 rounded text-sm",
                      parseFloat(result.probability_score) > 70
                        ? "bg-green-500/20 text-green-500"
                        : parseFloat(result.probability_score) > 40
                        ? "bg-yellow-500/20 text-yellow-500"
                        : "bg-red-500/20 text-red-500"
                    )}>
                      {parseFloat(result.probability_score).toFixed(1)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Entry</span>
                      <div>₹{parseFloat(result.trigger_price).toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Target</span>
                      <div className="text-green-500">₹{parseFloat(result.target_price).toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Stop</span>
                      <div className="text-red-500">₹{parseFloat(result.stop_loss).toFixed(2)}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}