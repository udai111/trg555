import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, BarChart3, Activity, AlertTriangle } from "lucide-react";

interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

interface PatternResult {
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  probability: number;
  description: string;
  candles: number; // Number of candles in the pattern
}

interface ProbabilityMetric {
  name: string;
  value: number;
  description: string;
}

const CandlestickPatternAnalyzer: React.FC<{
  symbol: string;
  data: CandleData[];
  timeframe: string;
}> = ({ symbol, data, timeframe }) => {
  const [detectedPatterns, setDetectedPatterns] = useState<PatternResult[]>([]);
  const [probabilityMetrics, setProbabilityMetrics] = useState<ProbabilityMetric[]>([]);
  const [overallBullishProbability, setOverallBullishProbability] = useState(0);
  const [overallBearishProbability, setOverallBearishProbability] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Candlestick pattern detection functions
  const patternDetectors = {
    // Single candle patterns
    doji: (candles: CandleData[]): PatternResult | null => {
      const current = candles[candles.length - 1];
      const bodySize = Math.abs(current.open - current.close);
      const wickSize = current.high - current.low;
      
      if (bodySize / wickSize < 0.1) {
        return {
          name: "Doji",
          type: "neutral",
          probability: 0.55,
          description: "Indicates market indecision. Can signal potential reversal.",
          candles: 1
        };
      }
      return null;
    },
    
    hammer: (candles: CandleData[]): PatternResult | null => {
      const current = candles[candles.length - 1];
      const bodySize = Math.abs(current.open - current.close);
      const upperWick = Math.abs(current.high - Math.max(current.open, current.close));
      const lowerWick = Math.abs(Math.min(current.open, current.close) - current.low);
      
      if (lowerWick > bodySize * 2 && upperWick < bodySize * 0.5) {
        return {
          name: "Hammer",
          type: "bullish",
          probability: 0.65,
          description: "Bullish reversal pattern often seen at the bottom of downtrends.",
          candles: 1
        };
      }
      return null;
    },
    
    invertedHammer: (candles: CandleData[]): PatternResult | null => {
      const current = candles[candles.length - 1];
      const bodySize = Math.abs(current.open - current.close);
      const upperWick = Math.abs(current.high - Math.max(current.open, current.close));
      const lowerWick = Math.abs(Math.min(current.open, current.close) - current.low);
      
      if (upperWick > bodySize * 2 && lowerWick < bodySize * 0.5) {
        return {
          name: "Inverted Hammer",
          type: "bullish",
          probability: 0.60,
          description: "Potential bullish reversal pattern at the bottom of downtrends.",
          candles: 1
        };
      }
      return null;
    },
    
    shootingStar: (candles: CandleData[]): PatternResult | null => {
      if (candles.length < 2) return null;
      
      const prev = candles[candles.length - 2];
      const current = candles[candles.length - 1];
      const bodySize = Math.abs(current.open - current.close);
      const upperWick = Math.abs(current.high - Math.max(current.open, current.close));
      const lowerWick = Math.abs(Math.min(current.open, current.close) - current.low);
      
      if (upperWick > bodySize * 2 && lowerWick < bodySize * 0.5 && prev.close < current.close) {
        return {
          name: "Shooting Star",
          type: "bearish",
          probability: 0.68,
          description: "Bearish reversal pattern often seen at the top of uptrends.",
          candles: 1
        };
      }
      return null;
    },
    
    // Multi-candle patterns
    bullishEngulfing: (candles: CandleData[]): PatternResult | null => {
      if (candles.length < 2) return null;
      
      const prev = candles[candles.length - 2];
      const current = candles[candles.length - 1];
      
      if (
        prev.close < prev.open && // Previous red candle
        current.close > current.open && // Current green candle
        current.open < prev.close && // Current opens below prev close
        current.close > prev.open // Current closes above prev open
      ) {
        return {
          name: "Bullish Engulfing",
          type: "bullish",
          probability: 0.75,
          description: "Strong bullish reversal pattern. Previous bearish momentum is overwhelmed by bulls.",
          candles: 2
        };
      }
      return null;
    },
    
    bearishEngulfing: (candles: CandleData[]): PatternResult | null => {
      if (candles.length < 2) return null;
      
      const prev = candles[candles.length - 2];
      const current = candles[candles.length - 1];
      
      if (
        prev.close > prev.open && // Previous green candle
        current.close < current.open && // Current red candle
        current.open > prev.close && // Current opens above prev close
        current.close < prev.open // Current closes below prev open
      ) {
        return {
          name: "Bearish Engulfing",
          type: "bearish",
          probability: 0.75,
          description: "Strong bearish reversal pattern. Previous bullish momentum is overwhelmed by bears.",
          candles: 2
        };
      }
      return null;
    },
    
    morningstar: (candles: CandleData[]): PatternResult | null => {
      if (candles.length < 3) return null;
      
      const first = candles[candles.length - 3];
      const middle = candles[candles.length - 2];
      const last = candles[candles.length - 1];
      
      const firstBodySize = Math.abs(first.open - first.close);
      const middleBodySize = Math.abs(middle.open - middle.close);
      const lastBodySize = Math.abs(last.open - last.close);
      
      if (
        first.close < first.open && // First candle is bearish
        firstBodySize > middleBodySize * 2 && // First candle has large body
        last.close > last.open && // Last candle is bullish
        last.close > (first.open + first.close) / 2 // Last candle closes above midpoint of first
      ) {
        return {
          name: "Morning Star",
          type: "bullish",
          probability: 0.80,
          description: "Strong bullish reversal pattern. Shows transition from bearish to bullish sentiment.",
          candles: 3
        };
      }
      return null;
    },
    
    eveningstar: (candles: CandleData[]): PatternResult | null => {
      if (candles.length < 3) return null;
      
      const first = candles[candles.length - 3];
      const middle = candles[candles.length - 2];
      const last = candles[candles.length - 1];
      
      const firstBodySize = Math.abs(first.open - first.close);
      const middleBodySize = Math.abs(middle.open - middle.close);
      const lastBodySize = Math.abs(last.open - last.close);
      
      if (
        first.close > first.open && // First candle is bullish
        firstBodySize > middleBodySize * 2 && // First candle has large body
        last.close < last.open && // Last candle is bearish
        last.close < (first.open + first.close) / 2 // Last candle closes below midpoint of first
      ) {
        return {
          name: "Evening Star",
          type: "bearish",
          probability: 0.80,
          description: "Strong bearish reversal pattern. Shows transition from bullish to bearish sentiment.",
          candles: 3
        };
      }
      return null;
    },
    
    threeWhiteSoldiers: (candles: CandleData[]): PatternResult | null => {
      if (candles.length < 3) return null;
      
      const first = candles[candles.length - 3];
      const second = candles[candles.length - 2];
      const third = candles[candles.length - 1];
      
      if (
        first.close > first.open && // First candle is bullish
        second.close > second.open && // Second candle is bullish
        third.close > third.open && // Third candle is bullish
        second.open > first.open && // Each candle opens higher
        third.open > second.open &&
        second.close > first.close && // Each candle closes higher
        third.close > second.close
      ) {
        return {
          name: "Three White Soldiers",
          type: "bullish",
          probability: 0.85,
          description: "Strong bullish continuation pattern showing sustained buying pressure.",
          candles: 3
        };
      }
      return null;
    },
    
    threeBlackCrows: (candles: CandleData[]): PatternResult | null => {
      if (candles.length < 3) return null;
      
      const first = candles[candles.length - 3];
      const second = candles[candles.length - 2];
      const third = candles[candles.length - 1];
      
      if (
        first.close < first.open && // First candle is bearish
        second.close < second.open && // Second candle is bearish
        third.close < third.open && // Third candle is bearish
        second.open < first.open && // Each candle opens lower
        third.open < second.open &&
        second.close < first.close && // Each candle closes lower
        third.close < second.close
      ) {
        return {
          name: "Three Black Crows",
          type: "bearish",
          probability: 0.85,
          description: "Strong bearish continuation pattern showing sustained selling pressure.",
          candles: 3
        };
      }
      return null;
    }
  };

  // Calculate intraday probability metrics
  const calculateProbabilityMetrics = (candles: CandleData[]) => {
    if (candles.length < 20) return [];
    
    const recentCandles = candles.slice(-20);
    
    // Volume trend
    const volumeIncreasing = recentCandles.slice(-5).reduce((acc, candle, i, arr) => {
      return i > 0 ? acc && candle.volume > arr[i-1].volume : true;
    }, true);
    
    // Price momentum
    const priceChange = recentCandles[recentCandles.length - 1].close - recentCandles[0].close;
    const priceChangePercent = (priceChange / recentCandles[0].close) * 100;
    
    // Volatility
    const highLowDiffs = recentCandles.map(c => c.high - c.low);
    const avgVolatility = highLowDiffs.reduce((sum, diff) => sum + diff, 0) / highLowDiffs.length;
    
    // Trend strength
    const closePrices = recentCandles.map(c => c.close);
    const upCandles = recentCandles.filter(c => c.close > c.open).length;
    const downCandles = recentCandles.filter(c => c.close < c.open).length;
    const trendStrength = Math.abs(upCandles - downCandles) / recentCandles.length;
    
    // RSI-like calculation (simplified)
    const gains = recentCandles.map((c, i) => i > 0 ? Math.max(0, c.close - recentCandles[i-1].close) : 0);
    const losses = recentCandles.map((c, i) => i > 0 ? Math.max(0, recentCandles[i-1].close - c.close) : 0);
    
    const avgGain = gains.reduce((sum, g) => sum + g, 0) / gains.length;
    const avgLoss = losses.reduce((sum, l) => sum + l, 0) / losses.length;
    
    const rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss);
    const rsi = 100 - (100 / (1 + rs));
    
    return [
      {
        name: "Price Momentum",
        value: priceChangePercent > 0 ? Math.min(priceChangePercent / 2, 100) : Math.max(priceChangePercent / 2, -100),
        description: `${priceChangePercent.toFixed(2)}% change over last 20 candles`
      },
      {
        name: "Volume Trend",
        value: volumeIncreasing ? 75 : 25,
        description: volumeIncreasing ? "Volume increasing (bullish)" : "Volume decreasing or flat"
      },
      {
        name: "RSI",
        value: rsi,
        description: rsi > 70 ? "Overbought" : rsi < 30 ? "Oversold" : "Neutral"
      },
      {
        name: "Trend Strength",
        value: trendStrength * 100,
        description: `${(trendStrength * 100).toFixed(0)}% strength, ${upCandles > downCandles ? "bullish" : "bearish"} bias`
      }
    ];
  };

  // Calculate overall probability
  const calculateOverallProbability = (patterns: PatternResult[], metrics: ProbabilityMetric[]) => {
    // Pattern-based probability
    const bullishPatterns = patterns.filter(p => p.type === 'bullish');
    const bearishPatterns = patterns.filter(p => p.type === 'bearish');
    
    let bullishPatternScore = bullishPatterns.reduce((acc, p) => acc + p.probability, 0);
    let bearishPatternScore = bearishPatterns.reduce((acc, p) => acc + p.probability, 0);
    
    if (bullishPatterns.length > 0) bullishPatternScore /= bullishPatterns.length;
    if (bearishPatterns.length > 0) bearishPatternScore /= bearishPatterns.length;
    
    // Metric-based probability
    const rsi = metrics.find(m => m.name === "RSI")?.value || 50;
    const momentum = metrics.find(m => m.name === "Price Momentum")?.value || 0;
    const volume = metrics.find(m => m.name === "Volume Trend")?.value || 50;
    const trendStrength = metrics.find(m => m.name === "Trend Strength")?.value || 50;
    
    // RSI contribution (oversold = bullish, overbought = bearish)
    const rsiBullish = rsi < 50 ? (50 - rsi) / 50 : 0;
    const rsiBearish = rsi > 50 ? (rsi - 50) / 50 : 0;
    
    // Momentum contribution
    const momentumBullish = momentum > 0 ? momentum / 100 : 0;
    const momentumBearish = momentum < 0 ? -momentum / 100 : 0;
    
    // Volume contribution
    const volumeBullish = volume > 50 ? (volume - 50) / 50 : 0;
    const volumeBearish = volume < 50 ? (50 - volume) / 50 : 0;
    
    // Combine all factors
    const bullishProbability = (
      (bullishPatternScore * 0.4) + 
      (rsiBullish * 0.2) + 
      (momentumBullish * 0.2) + 
      (volumeBullish * 0.2)
    ) * 100;
    
    const bearishProbability = (
      (bearishPatternScore * 0.4) + 
      (rsiBearish * 0.2) + 
      (momentumBearish * 0.2) + 
      (volumeBearish * 0.2)
    ) * 100;
    
    return {
      bullish: Math.min(Math.round(bullishProbability), 100),
      bearish: Math.min(Math.round(bearishProbability), 100)
    };
  };

  const analyzePatterns = () => {
    setIsAnalyzing(true);
    
    // Detect patterns
    const patterns: PatternResult[] = [];
    Object.values(patternDetectors).forEach(detector => {
      const result = detector(data);
      if (result) patterns.push(result);
    });
    
    // Calculate probability metrics
    const metrics = calculateProbabilityMetrics(data);
    
    // Calculate overall probability
    const { bullish, bearish } = calculateOverallProbability(patterns, metrics);
    
    setDetectedPatterns(patterns);
    setProbabilityMetrics(metrics);
    setOverallBullishProbability(bullish);
    setOverallBearishProbability(bearish);
    
    setTimeout(() => setIsAnalyzing(false), 500);
  };

  useEffect(() => {
    if (data.length > 0) {
      analyzePatterns();
    }
  }, [data, symbol]);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">{symbol} Pattern Analysis</h2>
          <p className="text-sm text-muted-foreground">{timeframe} Timeframe</p>
        </div>
        <Button onClick={analyzePatterns} disabled={isAnalyzing}>
          {isAnalyzing ? (
            <>
              <Activity className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <BarChart3 className="w-4 h-4 mr-2" />
              Refresh Analysis
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="probability">
        <TabsList className="mb-4">
          <TabsTrigger value="probability">Intraday Probability</TabsTrigger>
          <TabsTrigger value="patterns">Candlestick Patterns</TabsTrigger>
          <TabsTrigger value="metrics">Technical Metrics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="probability">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                  <span className="font-medium">Bullish Probability</span>
                </div>
                <Progress value={overallBullishProbability} className="h-3 bg-muted" />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">Low</span>
                  <span className="text-xs font-medium">{overallBullishProbability}%</span>
                  <span className="text-xs text-muted-foreground">High</span>
                </div>
              </div>
              
              <div className="w-8"></div>
              
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <TrendingDown className="w-4 h-4 mr-2 text-red-500" />
                  <span className="font-medium">Bearish Probability</span>
                </div>
                <Progress value={overallBearishProbability} className="h-3 bg-muted" />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">Low</span>
                  <span className="text-xs font-medium">{overallBearishProbability}%</span>
                  <span className="text-xs text-muted-foreground">High</span>
                </div>
              </div>
            </div>
            
            <div className="p-3 rounded bg-accent/10">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                <span className="font-medium">Intraday Forecast</span>
              </div>
              <p className="text-sm">
                {overallBullishProbability > overallBearishProbability + 20 ? (
                  "Strong bullish bias detected. Consider long positions with appropriate risk management."
                ) : overallBearishProbability > overallBullishProbability + 20 ? (
                  "Strong bearish bias detected. Consider short positions or reducing long exposure."
                ) : (
                  "Market appears to be in equilibrium. Consider range-bound strategies or reduced position sizes."
                )}
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="patterns">
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {detectedPatterns.length > 0 ? (
              detectedPatterns.map((pattern, index) => (
                <div key={index} className="p-3 rounded bg-accent/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{pattern.name}</span>
                      <Badge variant={pattern.type === 'bullish' ? 'default' : pattern.type === 'bearish' ? 'destructive' : 'outline'}>
                        {pattern.type}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium">
                      {Math.round(pattern.probability * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-sm mt-1">{pattern.description}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No significant patterns detected in recent candles.</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="metrics">
          <div className="space-y-4">
            {probabilityMetrics.map((metric, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{metric.name}</span>
                  <span className="text-sm">{metric.description}</span>
                </div>
                <Progress 
                  value={metric.name === "RSI" ? metric.value : (metric.value + 100) / 2} 
                  className="h-2 bg-muted" 
                />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default CandlestickPatternAnalyzer; 