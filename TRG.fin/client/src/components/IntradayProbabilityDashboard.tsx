import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, BarChart3, TrendingUp } from "lucide-react";
import CandlestickPatternAnalyzer from '@/components/CandlestickPatternAnalyzer';
import CandlestickChart from '@/components/CandlestickChart';
import IntradayPatternScanner from '@/components/IntradayPatternScanner';

interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

interface ChartData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

const IntradayProbabilityDashboard: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("AAPL");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("5m");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const [detectedPattern, setDetectedPattern] = useState<string | null>(null);
  const [symbolInput, setSymbolInput] = useState<string>("");

  // Generate mock data for demonstration
  const generateMockData = (symbol: string, timeframe: string) => {
    const data: CandleData[] = [];
    let lastClose = Math.random() * 1000 + 100;
    const now = Date.now();
    const timeframeMinutes = parseInt(timeframe.replace('m', ''));
    
    for (let i = 0; i < 100; i++) {
      const timestamp = now - (100 - i) * timeframeMinutes * 60 * 1000;
      const open = lastClose + (Math.random() - 0.5) * 10;
      const high = Math.max(open * (1 + Math.random() * 0.02), open);
      const low = Math.min(open * (1 - Math.random() * 0.02), open);
      const close = (open + high + low) / 3 + (Math.random() - 0.5) * 5;
      const volume = Math.floor(Math.random() * 100000 + 10000);
      
      data.push({ open, high, low, close, volume, timestamp });
      lastClose = close;
    }
    
    return data;
  };

  // Convert CandleData to ChartData format for CandlestickChart component
  const convertToChartData = (data: CandleData[]): ChartData[] => {
    return data.map(candle => ({
      time: candle.timestamp,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close
    }));
  };

  const loadData = () => {
    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      const data = generateMockData(selectedSymbol, selectedTimeframe);
      setCandleData(data);
      setIsLoading(false);
    }, 800);
  };

  const handleSymbolChange = () => {
    if (symbolInput.trim()) {
      setSelectedSymbol(symbolInput.toUpperCase());
      setSymbolInput("");
    }
  };

  const handlePatternDetected = (pattern: string) => {
    setDetectedPattern(pattern);
    // Could add notification or alert here
  };

  useEffect(() => {
    loadData();
  }, [selectedSymbol, selectedTimeframe]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Intraday Probability Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Input 
              value={symbolInput}
              onChange={(e) => setSymbolInput(e.target.value.toUpperCase())}
              placeholder="Enter symbol..."
              className="w-32"
            />
            <Button onClick={handleSymbolChange}>Change</Button>
          </div>
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1m</SelectItem>
              <SelectItem value="5m">5m</SelectItem>
              <SelectItem value="15m">15m</SelectItem>
              <SelectItem value="30m">30m</SelectItem>
              <SelectItem value="1h">1h</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadData} disabled={isLoading}>
            {isLoading ? (
              <>
                <Activity className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{selectedSymbol} Chart</h2>
              {detectedPattern && (
                <div className="px-3 py-1 bg-accent/20 rounded-full text-sm">
                  Pattern: {detectedPattern}
                </div>
              )}
            </div>
            <CandlestickChart 
              data={convertToChartData(candleData)} 
              onPatternDetected={handlePatternDetected}
            />
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <CandlestickPatternAnalyzer 
            symbol={selectedSymbol}
            data={candleData}
            timeframe={selectedTimeframe}
          />
        </div>
      </div>

      <Tabs defaultValue="scanner">
        <TabsList>
          <TabsTrigger value="scanner">Pattern Scanner</TabsTrigger>
          <TabsTrigger value="analysis">Market Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="scanner">
          <IntradayPatternScanner />
        </TabsContent>
        <TabsContent value="analysis">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Market Analysis</h2>
            <p className="text-muted-foreground">
              This section will display advanced market analysis based on the detected patterns and probability metrics.
            </p>
            <div className="mt-4 p-4 bg-accent/10 rounded">
              <div className="flex items-center mb-2">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span className="font-medium">Market Insights</span>
              </div>
              <p className="text-sm">
                The current market conditions for {selectedSymbol} on the {selectedTimeframe} timeframe 
                suggest a {Math.random() > 0.5 ? "bullish" : "bearish"} bias. 
                Volume analysis indicates {Math.random() > 0.5 ? "increasing" : "decreasing"} participation.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntradayProbabilityDashboard; 