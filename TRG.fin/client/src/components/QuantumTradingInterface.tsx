import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  TrendingUp, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  BarChart, 
  CircleAlert,
  Brain,
  LineChart,
  Globe,
  Clock
} from "lucide-react";

interface MarketData {
  symbol: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCap: number;
  pe: number;
  trend: 'Bullish' | 'Bearish' | 'Neutral';
  strength: 'High' | 'Medium' | 'Low';
  volumeStatus: 'Above Average' | 'Below Average' | 'Average';
  supportLevels: number[];
  resistanceLevels: number[];
  aiPredictions: {
    shortTerm: string;
    mediumTerm: string;
    longTerm: string;
    confidence: number;
  };
  indicators: {
    rsi: number;
    macd: string;
    movingAvg50: number;
    movingAvg200: number;
    bollingerBands: string;
  };
}

const QuantumTradingInterface: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("AAPL");
  const [symbolInput, setSymbolInput] = useState<string>("");
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>("overview");
  const [marketStatus, setMarketStatus] = useState<"open" | "closed">("open");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Generate mock data
  const generateMockData = (symbol: string): MarketData => {
    const basePrice = Math.random() * 200 + 50;
    const changePercent = (Math.random() * 5 - 2.5); // -2.5% to +2.5%
    const change = basePrice * (changePercent / 100);
    
    const trend = changePercent > 0 ? 'Bullish' : changePercent < 0 ? 'Bearish' : 'Neutral';
    const strength = Math.abs(changePercent) > 1.5 ? 'High' : Math.abs(changePercent) > 0.5 ? 'Medium' : 'Low';
    const volumeStatus = Math.random() > 0.6 ? 'Above Average' : Math.random() > 0.3 ? 'Average' : 'Below Average';
    
    return {
      symbol,
      lastPrice: parseFloat(basePrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      open: parseFloat((basePrice - Math.random() * 5).toFixed(2)),
      high: parseFloat((basePrice + Math.random() * 8).toFixed(2)),
      low: parseFloat((basePrice - Math.random() * 8).toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      marketCap: Math.floor(Math.random() * 1000000000000) + 100000000000,
      pe: parseFloat((Math.random() * 30 + 10).toFixed(2)),
      trend,
      strength,
      volumeStatus,
      supportLevels: [
        parseFloat((basePrice * 0.95).toFixed(2)),
        parseFloat((basePrice * 0.92).toFixed(2)),
        parseFloat((basePrice * 0.90).toFixed(2))
      ],
      resistanceLevels: [
        parseFloat((basePrice * 1.03).toFixed(2)),
        parseFloat((basePrice * 1.05).toFixed(2)),
        parseFloat((basePrice * 1.08).toFixed(2))
      ],
      aiPredictions: {
        shortTerm: Math.random() > 0.5 ? 'Upward Movement' : 'Downward Movement',
        mediumTerm: Math.random() > 0.5 ? 'Bullish Trend' : 'Bearish Trend',
        longTerm: Math.random() > 0.6 ? 'Positive Outlook' : 'Cautious Outlook',
        confidence: parseFloat((Math.random() * 40 + 60).toFixed(1))
      },
      indicators: {
        rsi: parseFloat((Math.random() * 70 + 30).toFixed(2)),
        macd: Math.random() > 0.5 ? 'Bullish Crossover' : 'Bearish Crossover',
        movingAvg50: parseFloat((basePrice * (1 + (Math.random() * 0.1 - 0.05))).toFixed(2)),
        movingAvg200: parseFloat((basePrice * (1 + (Math.random() * 0.15 - 0.1))).toFixed(2)),
        bollingerBands: Math.random() > 0.7 ? 'Upper Band' : Math.random() > 0.4 ? 'Middle Band' : 'Lower Band'
      }
    };
  };

  const loadMarketData = () => {
    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      const data = generateMockData(selectedSymbol);
      setMarketData(data);
      setIsLoading(false);
      setLastUpdated(new Date());
    }, 800);
  };

  const handleSymbolChange = () => {
    if (symbolInput.trim()) {
      setSelectedSymbol(symbolInput.toUpperCase());
      setSymbolInput("");
    }
  };

  useEffect(() => {
    loadMarketData();
  }, [selectedSymbol]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Quantum Trading Interface</h1>
          <p className="text-muted-foreground">Advanced Market Analysis</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={marketStatus === "open" ? "success" : "destructive"} className="px-2 py-1">
            Market {marketStatus === "open" ? "Open" : "Closed"}
          </Badge>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <div className="flex items-center gap-2">
            <Input 
              value={symbolInput}
              onChange={(e) => setSymbolInput(e.target.value.toUpperCase())}
              placeholder="Enter symbol..."
              className="w-32"
              onKeyDown={(e) => e.key === "Enter" && handleSymbolChange()}
            />
            <Button onClick={handleSymbolChange}>Change</Button>
          </div>
          <Button variant="outline" size="icon" onClick={loadMarketData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Info Card */}
        <Card className="p-6 col-span-1">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold">{marketData?.symbol}</h2>
              <div className="text-sm text-muted-foreground">Symbol</div>
            </div>
            
            <div className="text-3xl font-bold">
              ${marketData?.lastPrice.toFixed(2)}
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`flex items-center ${marketData?.change && marketData.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {marketData?.change && marketData.change >= 0 ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                <span className="font-semibold">${Math.abs(marketData?.change || 0).toFixed(2)}</span>
              </div>
              <div className={`${marketData?.change && marketData.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ({marketData?.changePercent && marketData.changePercent >= 0 ? '+' : ''}{marketData?.changePercent}%)
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-2">Trend Analysis</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trend:</span>
                  <span className={`font-medium ${
                    marketData?.trend === 'Bullish' ? 'text-green-500' : 
                    marketData?.trend === 'Bearish' ? 'text-red-500' : 'text-yellow-500'
                  }`}>{marketData?.trend}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Strength:</span>
                  <span className="font-medium">{marketData?.strength}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Volume:</span>
                  <span className="font-medium">{marketData?.volumeStatus}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-2">Key Levels</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Support 1:</span>
                  <span className="font-medium">${marketData?.supportLevels[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Support 2:</span>
                  <span className="font-medium">${marketData?.supportLevels[1]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resistance 1:</span>
                  <span className="font-medium">${marketData?.resistanceLevels[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resistance 2:</span>
                  <span className="font-medium">${marketData?.resistanceLevels[1]}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Main content area */}
        <div className="lg:col-span-3">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="overview">
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="technical">
                <Activity className="h-4 w-4 mr-2" />
                Technical
              </TabsTrigger>
              <TabsTrigger value="ai">
                <Brain className="h-4 w-4 mr-2" />
                AI Prediction
              </TabsTrigger>
              <TabsTrigger value="market">
                <Globe className="h-4 w-4 mr-2" />
                Market Status
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="pt-4">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Market Overview</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Price Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Open:</span>
                        <span>${marketData?.open}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">High:</span>
                        <span>${marketData?.high}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Low:</span>
                        <span>${marketData?.low}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Volume:</span>
                        <span>{marketData?.volume.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Company Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Market Cap:</span>
                        <span>${(marketData?.marketCap / 1000000000).toFixed(2)}B</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">P/E Ratio:</span>
                        <span>{marketData?.pe}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">52w High:</span>
                        <span>${(marketData?.high * 1.2).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">52w Low:</span>
                        <span>${(marketData?.low * 0.8).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="technical" className="pt-4">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Technical Indicators</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Momentum Indicators</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">RSI (14):</span>
                        <span className={`${
                          marketData?.indicators.rsi && marketData.indicators.rsi > 70 ? 'text-red-500' : 
                          marketData?.indicators.rsi && marketData.indicators.rsi < 30 ? 'text-green-500' : ''
                        }`}>
                          {marketData?.indicators.rsi}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">MACD:</span>
                        <span className={`${
                          marketData?.indicators.macd === 'Bullish Crossover' ? 'text-green-500' : 
                          marketData?.indicators.macd === 'Bearish Crossover' ? 'text-red-500' : ''
                        }`}>
                          {marketData?.indicators.macd}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bollinger Bands:</span>
                        <span>{marketData?.indicators.bollingerBands}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Trend Indicators</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">MA (50):</span>
                        <span className={`${
                          marketData?.lastPrice && marketData?.indicators.movingAvg50 && 
                          marketData.lastPrice > marketData.indicators.movingAvg50 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          ${marketData?.indicators.movingAvg50}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">MA (200):</span>
                        <span className={`${
                          marketData?.lastPrice && marketData?.indicators.movingAvg200 && 
                          marketData.lastPrice > marketData.indicators.movingAvg200 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          ${marketData?.indicators.movingAvg200}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Golden Cross:</span>
                        <span className={`${
                          marketData?.indicators.movingAvg50 && marketData?.indicators.movingAvg200 && 
                          marketData.indicators.movingAvg50 > marketData.indicators.movingAvg200 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {marketData?.indicators.movingAvg50 && marketData?.indicators.movingAvg200 && 
                          marketData.indicators.movingAvg50 > marketData.indicators.movingAvg200 ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="pt-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">AI-Powered Predictions</h2>
                  <Badge className="px-3 py-1">
                    Confidence: {marketData?.aiPredictions.confidence}%
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-accent/10 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Short Term (1-3 days)</h3>
                    <div className="flex items-center text-lg font-medium">
                      {marketData?.aiPredictions.shortTerm === 'Upward Movement' ? (
                        <>
                          <ArrowUpRight className="h-5 w-5 mr-2 text-green-500" />
                          <span className="text-green-500">{marketData?.aiPredictions.shortTerm}</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="h-5 w-5 mr-2 text-red-500" />
                          <span className="text-red-500">{marketData?.aiPredictions.shortTerm}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-accent/10 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Medium Term (1-2 weeks)</h3>
                    <div className="flex items-center text-lg font-medium">
                      {marketData?.aiPredictions.mediumTerm === 'Bullish Trend' ? (
                        <>
                          <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                          <span className="text-green-500">{marketData?.aiPredictions.mediumTerm}</span>
                        </>
                      ) : (
                        <>
                          <Activity className="h-5 w-5 mr-2 text-red-500" />
                          <span className="text-red-500">{marketData?.aiPredictions.mediumTerm}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-accent/10 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Long Term (1-3 months)</h3>
                    <div className="flex items-center text-lg font-medium">
                      {marketData?.aiPredictions.longTerm.includes('Positive') ? (
                        <>
                          <BarChart className="h-5 w-5 mr-2 text-green-500" />
                          <span className="text-green-500">{marketData?.aiPredictions.longTerm}</span>
                        </>
                      ) : (
                        <>
                          <CircleAlert className="h-5 w-5 mr-2 text-yellow-500" />
                          <span className="text-yellow-500">{marketData?.aiPredictions.longTerm}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">AI Analysis Summary</h3>
                  <p className="text-muted-foreground">
                    Based on pattern recognition, sentiment analysis, and quantum computing algorithms, 
                    our AI predicts {marketData?.aiPredictions.shortTerm.toLowerCase()} in the short term with 
                    potential for {marketData?.aiPredictions.mediumTerm.toLowerCase()} in the medium term. 
                    Key indicators supporting this prediction include 
                    {marketData?.indicators.rsi && marketData.indicators.rsi > 50 ? ' strong RSI,' : ' weak RSI,'} 
                    {marketData?.indicators.macd.includes('Bullish') ? ' positive MACD divergence,' : ' negative MACD divergence,'} 
                    and volume {marketData?.volumeStatus.toLowerCase()}.
                  </p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="market" className="pt-4">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Market Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Market Sentiment</h3>
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-3xl font-bold text-green-500">35%</div>
                          <div className="text-sm text-muted-foreground">Bullish</div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-yellow-500">40%</div>
                          <div className="text-sm text-muted-foreground">Neutral</div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-red-500">25%</div>
                          <div className="text-sm text-muted-foreground">Bearish</div>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-medium mt-4 mb-2">Major Indices</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>S&P 500</span>
                        <span className="text-green-500">+0.65%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>NASDAQ</span>
                        <span className="text-green-500">+1.12%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>DOW</span>
                        <span className="text-red-500">-0.23%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Sector Performance</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Technology</span>
                        <span className="text-green-500">+1.54%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Healthcare</span>
                        <span className="text-green-500">+0.87%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Financials</span>
                        <span className="text-red-500">-0.32%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Energy</span>
                        <span className="text-red-500">-1.21%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Consumer Discretionary</span>
                        <span className="text-green-500">+0.45%</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-medium mt-4 mb-2">Economic Indicators</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>10Y Treasury</span>
                        <span>3.85% <span className="text-green-500">+0.03</span></span>
                      </div>
                      <div className="flex justify-between">
                        <span>VIX</span>
                        <span>18.35 <span className="text-red-500">-1.24</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default QuantumTradingInterface; 