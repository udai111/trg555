import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Activity, TrendingUp, Brain, Zap, Shield, Network, BarChart2, ArrowUpRight, ArrowDownRight, RefreshCcw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { performanceManager } from '@/lib/performance-manager';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Even faster refresh intervals for high performance
const REFRESH_INTERVALS = {
  HIGH_PERFORMANCE: 250,
  MEDIUM_PERFORMANCE: 500,
  LOW_PERFORMANCE: 1000
};

const BATCH_SIZES = {
  HIGH_PERFORMANCE: 256,
  MEDIUM_PERFORMANCE: 128,
  LOW_PERFORMANCE: 64
};

interface MarketAnalysisIndicators {
  rsi: number;
  macd: {
    signal: number;
    macd: number;
    histogram: number;
  };
  volatility: number;
}

interface MarketAnalysis {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  indicators: MarketAnalysisIndicators;
  sentiment: {
    overall: 'bullish' | 'bearish' | 'neutral';
    score: number;
    signals: Array<{
      name: string;
      value: number;
    }>;
  };
  aiPredictions: {
    nextTarget: number;
    confidence: number;
    direction: 'up' | 'down';
    timeframe: string;
  };
}

interface PortfolioMetrics {
  totalValue: number;
  dailyPnL: number;
  riskMetrics: {
    sharpeRatio: number;
    volatility: number;
    maxDrawdown: number;
    beta: number;
  };
  positions: Array<{
    symbol: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    pnl: number;
  }>;
}

const QuantumDashboard: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('1d');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [mlFeaturesAvailable, setMlFeaturesAvailable] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [performanceMode, setPerformanceMode] = useState<'high' | 'medium' | 'low'>('high');
  const [dataUpdateInterval, setDataUpdateInterval] = useState(REFRESH_INTERVALS.HIGH_PERFORMANCE);
  const [batchSize, setBatchSize] = useState(BATCH_SIZES.HIGH_PERFORMANCE);
  const [useGPUMode, setUseGPUMode] = useState(true);

  const formatNumber = (value: number | undefined, decimals = 2): string => {
    if (value === undefined || isNaN(value)) return 'N/A';
    return value.toFixed(decimals);
  };

  const handleRenderMacdData = (macd: MarketAnalysisIndicators['macd'] | undefined) => {
    if (!macd) return { signal: 'N/A', macd: 'N/A', histogram: 'N/A' };
    return {
      signal: formatNumber(macd.signal, 3),
      macd: formatNumber(macd.macd, 3),
      histogram: formatNumber(macd.histogram, 3)
    };
  };

  const handleRenderRsiData = (rsi?: number) => {
    if (typeof rsi !== 'number') return { value: 'N/A', className: '' };
    return {
      value: formatNumber(rsi),
      className: rsi > 70 ? 'text-red-500' : rsi < 30 ? 'text-green-500' : ''
    };
  };

  const handleGPUModeChange = useCallback(async (enabled: boolean) => {
    setUseGPUMode(enabled);
    try {
      await performanceManager.updateSettings({
        useHighPerformanceMode: enabled,
        enableBackgroundProcessing: enabled,
        renderQuality: enabled ? 'high' : 'medium',
        maxParallelOperations: enabled ? 8 : 4,
        batchSize: enabled ? BATCH_SIZES.HIGH_PERFORMANCE : BATCH_SIZES.MEDIUM_PERFORMANCE
      });
    } catch (error) {
      console.error('Failed to switch GPU mode:', error);
      setUseGPUMode(!enabled);
    }
  }, []);

  useEffect(() => {
    const initPerformance = async () => {
      try {
        const initPromise = performanceManager.updateSettings({
          useHighPerformanceMode: useGPUMode,
          enableBackgroundProcessing: true,
          renderQuality: 'high',
          updateInterval: REFRESH_INTERVALS.HIGH_PERFORMANCE,
          maxParallelOperations: 8,
          batchSize: BATCH_SIZES.HIGH_PERFORMANCE
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('ML initialization timeout')), 5000)
        );

        await Promise.race([initPromise, timeoutPromise]);
        setMlFeaturesAvailable(true);
        setInitializationError(null);
      } catch (error) {
        console.error('Failed to initialize ML features:', error);
        setInitializationError('ML features temporarily unavailable. Basic trading features remain accessible.');
        setMlFeaturesAvailable(false);
      }
    };

    initPerformance();
  }, [useGPUMode]);

  const { data: marketAnalysis, isLoading: isLoadingAnalysis } = useQuery<MarketAnalysis>({
    queryKey: ['marketAnalysis', selectedSymbol, timeframe],
    queryFn: async () => {
      const response = await fetch(`/api/market-analysis?symbol=${selectedSymbol}&timeframe=${timeframe}`);
      if (!response.ok) throw new Error('Failed to fetch market analysis');
      return response.json();
    },
    refetchInterval: autoRefresh ? dataUpdateInterval : false,
    staleTime: dataUpdateInterval / 2
  });

  const { data: portfolioMetrics, isLoading: isLoadingPortfolio } = useQuery<PortfolioMetrics>({
    queryKey: ['portfolioMetrics'],
    queryFn: async () => {
      const response = await fetch('/api/portfolio-metrics');
      if (!response.ok) throw new Error('Failed to fetch portfolio metrics');
      return response.json();
    },
    refetchInterval: autoRefresh ? dataUpdateInterval : false,
    staleTime: dataUpdateInterval / 2
  });

  if (isLoadingAnalysis && isLoadingPortfolio) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCcw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading trading dashboard...</p>
        </div>
      </div>
    );
  }

  if (initializationError) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
            <p className="text-yellow-700">{initializationError}</p>
          </div>
        </div>
        <div className="p-6 bg-background">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-primary">
                  Quantum Trading Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Advanced Quantitative Analysis & Risk Management
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Symbol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AAPL">AAPL</SelectItem>
                    <SelectItem value="GOOGL">GOOGL</SelectItem>
                    <SelectItem value="MSFT">MSFT</SelectItem>
                    <SelectItem value="AMZN">AMZN</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1d">1D</SelectItem>
                    <SelectItem value="1w">1W</SelectItem>
                    <SelectItem value="1m">1M</SelectItem>
                    <SelectItem value="3m">3M</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant={autoRefresh ? "default" : "outline"}
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className="flex items-center gap-2"
                >
                  <RefreshCcw className={`w-4 h-4 ${autoRefresh ? "animate-spin" : ""}`} />
                  {autoRefresh ? "Auto-refresh On" : "Auto-refresh Off"}
                </Button>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-sm text-muted-foreground">Performance Mode:</span>
                  <span className={cn("text-sm font-medium", {
                    "text-green-500": performanceMode === 'high',
                    "text-yellow-500": performanceMode === 'medium',
                    "text-red-500": performanceMode === 'low'
                  })}>
                    {performanceMode.charAt(0).toUpperCase() + performanceMode.slice(1)}
                  </span>
                </div>
                {/* Add this next to the other controls in the UI */}
                <div className="flex items-center gap-2">
                  <Switch
                    checked={useGPUMode}
                    onCheckedChange={handleGPUModeChange}
                    id="gpu-mode"
                  />
                  <Label htmlFor="gpu-mode">GPU Mode</Label>
                </div>
              </div>
            </div>
          </motion.div>

          <Tabs defaultValue="market" className="space-y-4">
            <TabsList className="grid grid-cols-5 gap-4">
              <TabsTrigger value="market" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Market Analysis
              </TabsTrigger>
              <TabsTrigger value="risk" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Risk Management
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI Predictions
              </TabsTrigger>
              <TabsTrigger value="flow" className="flex items-center gap-2">
                <Network className="w-4 h-4" />
                Flow Analysis
              </TabsTrigger>
              <TabsTrigger value="execution" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Smart Execution
              </TabsTrigger>
            </TabsList>

            <TabsContent value="market" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Market Overview
                  </h3>
                  {isLoadingAnalysis ? (
                    <p>Loading...</p>
                  ) : (
                    <div className="mt-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-2xl font-bold">
                            ${marketAnalysis?.price ? formatNumber(marketAnalysis.price) : 'N/A'}
                          </p>
                          <p className={`flex items-center ${marketAnalysis?.change && marketAnalysis.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {marketAnalysis?.change && marketAnalysis.change > 0 ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4" />
                            )}
                            {marketAnalysis?.change ? formatNumber(marketAnalysis.change) + "%" : 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Volume</p>
                          <p className="font-semibold">
                            {marketAnalysis?.volume ? marketAnalysis.volume.toLocaleString() : 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">RSI</p>
                          <p className={`font-semibold ${handleRenderRsiData(marketAnalysis?.indicators.rsi)?.className}`}>
                            {handleRenderRsiData(marketAnalysis?.indicators.rsi)?.value}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Volatility</p>
                          <p className="font-semibold">
                            {marketAnalysis?.indicators.volatility ? formatNumber(marketAnalysis.indicators.volatility * 100, 1) + "%" : 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">MACD</p>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Signal</span>
                            <span>{handleRenderMacdData(marketAnalysis?.indicators.macd)?.signal}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>MACD</span>
                            <span>{handleRenderMacdData(marketAnalysis?.indicators.macd)?.macd}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Histogram</span>
                            <span className={marketAnalysis?.indicators.macd?.histogram > 0 ? 'text-green-500' : 'text-red-500'}>
                              {handleRenderMacdData(marketAnalysis?.indicators.macd)?.histogram}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>

                {mlFeaturesAvailable && (
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      AI Insights
                    </h3>
                    {isLoadingAnalysis ? (
                      <p>Loading...</p>
                    ) : (
                      <div className="mt-4 space-y-4">
                        <div className="p-4 bg-secondary rounded-lg">
                          <h4 className="font-semibold mb-2">Price Prediction</h4>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-muted-foreground">Next Target</p>
                              <p className="text-xl font-bold">
                                ${marketAnalysis?.aiPredictions.nextTarget ? formatNumber(marketAnalysis.aiPredictions.nextTarget) : 'N/A'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Confidence</p>
                              <p className="font-semibold">
                                {marketAnalysis?.aiPredictions.confidence ? formatNumber(marketAnalysis.aiPredictions.confidence * 100, 1) + "%" : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Market Sentiment</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span>Overall</span>
                              <span className={`font-semibold ${
                                marketAnalysis?.sentiment.overall === 'bullish' ? 'text-green-500' :
                                  marketAnalysis?.sentiment.overall === 'bearish' ? 'text-red-500' :
                                    'text-yellow-500'
                              }`}>
                                {marketAnalysis?.sentiment.overall ? marketAnalysis.sentiment.overall.toUpperCase() : 'N/A'}
                              </span>
                            </div>
                            {marketAnalysis?.sentiment.signals.map((signal, index) => (
                              <div key={index} className="flex justify-between items-center text-sm">
                                <span>{signal.name}</span>
                                <span>{formatNumber(signal.value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                )}
              </div>

              <Card className="p-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BarChart2 className="w-4 h-4" />
                  Portfolio Overview
                </h3>
                {isLoadingPortfolio ? (
                  <p>Loading portfolio data...</p>
                ) : (
                  <div className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="p-4 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Value</p>
                        <p className="text-2xl font-bold">
                          ${portfolioMetrics?.totalValue ? portfolioMetrics.totalValue.toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      <div className="p-4 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground">Daily P&L</p>
                        <p className={`text-2xl font-bold ${portfolioMetrics?.dailyPnL > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          ${portfolioMetrics?.dailyPnL ? Math.abs(portfolioMetrics.dailyPnL).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      <div className="p-4 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                        <p className="text-2xl font-bold">
                          {portfolioMetrics?.riskMetrics.sharpeRatio ? formatNumber(portfolioMetrics.riskMetrics.sharpeRatio) : 'N/A'}
                        </p>
                      </div>
                      <div className="p-4 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground">Beta</p>
                        <p className="text-2xl font-bold">
                          {portfolioMetrics?.riskMetrics.beta ? formatNumber(portfolioMetrics.riskMetrics.beta) : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="font-semibold mb-4">Positions</h4>
                      <div className="space-y-2">
                        {portfolioMetrics?.positions.map((position, index) => (
                          <div key={index} className="flex justify-between items-center p-2 hover:bg-secondary rounded-lg">
                            <div>
                              <p className="font-semibold">{position.symbol}</p>
                              <p className="text-sm text-muted-foreground">
                                {position.quantity.toLocaleString()} shares @ ${formatNumber(position.averagePrice)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold ${position.pnl > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                ${Math.abs(position.pnl).toLocaleString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Current: ${formatNumber(position.currentPrice)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="risk">
              <Card className="p-4">
                {/* Risk Management content will be implemented */}
              </Card>
            </TabsContent>

            <TabsContent value="ai">
              <Card className="p-4">
                {/* AI Predictions content will be implemented */}
              </Card>
            </TabsContent>

            <TabsContent value="flow">
              <Card className="p-4">
                {/* Flow Analysis content will be implemented */}
              </Card>
            </TabsContent>

            <TabsContent value="execution">
              <Card className="p-4">
                {/* Smart Execution content will be implemented */}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-primary">
              Quantum Trading Dashboard
            </h1>
            <p className="text-muted-foreground">
              Advanced Quantitative Analysis & Risk Management
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Symbol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AAPL">AAPL</SelectItem>
                <SelectItem value="GOOGL">GOOGL</SelectItem>
                <SelectItem value="MSFT">MSFT</SelectItem>
                <SelectItem value="AMZN">AMZN</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">1D</SelectItem>
                <SelectItem value="1w">1W</SelectItem>
                <SelectItem value="1m">1M</SelectItem>
                <SelectItem value="3m">3M</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="flex items-center gap-2"
            >
              <RefreshCcw className={`w-4 h-4 ${autoRefresh ? "animate-spin" : ""}`} />
              {autoRefresh ? "Auto-refresh On" : "Auto-refresh Off"}
            </Button>
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-muted-foreground">Performance Mode:</span>
              <span className={cn("text-sm font-medium", {
                "text-green-500": performanceMode === 'high',
                "text-yellow-500": performanceMode === 'medium',
                "text-red-500": performanceMode === 'low'
              })}>
                {performanceMode.charAt(0).toUpperCase() + performanceMode.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={useGPUMode}
                onCheckedChange={handleGPUModeChange}
                id="gpu-mode"
              />
              <Label htmlFor="gpu-mode">GPU Mode</Label>
            </div>
          </div>
        </div>
      </motion.div>
      <Tabs defaultValue="market" className="space-y-4">
        <TabsList className="grid grid-cols-5 gap-4">
          <TabsTrigger value="market" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Market Analysis
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Risk Management
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Predictions
          </TabsTrigger>
          <TabsTrigger value="flow" className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            Flow Analysis
          </TabsTrigger>
          <TabsTrigger value="execution" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Smart Execution
          </TabsTrigger>
        </TabsList>

        <TabsContent value="market" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Market Overview
              </h3>
              {isLoadingAnalysis ? (
                <p>Loading...</p>
              ) : (
                <div className="mt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold">
                        ${marketAnalysis?.price ? formatNumber(marketAnalysis.price) : 'N/A'}
                      </p>
                      <p className={`flex items-center ${marketAnalysis?.change && marketAnalysis.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {marketAnalysis?.change && marketAnalysis.change > 0 ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        {marketAnalysis?.change ? formatNumber(marketAnalysis.change) + "%" : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Volume</p>
                      <p className="font-semibold">
                        {marketAnalysis?.volume ? marketAnalysis.volume.toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">RSI</p>
                      <p className={`font-semibold ${handleRenderRsiData(marketAnalysis?.indicators.rsi)?.className}`}>
                        {handleRenderRsiData(marketAnalysis?.indicators.rsi)?.value}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Volatility</p>
                      <p className="font-semibold">
                        {marketAnalysis?.indicators.volatility ? formatNumber(marketAnalysis.indicators.volatility * 100, 1) + "%" : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">MACD</p>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Signal</span>
                        <span>{handleRenderMacdData(marketAnalysis?.indicators.macd)?.signal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>MACD</span>
                        <span>{handleRenderMacdData(marketAnalysis?.indicators.macd)?.macd}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Histogram</span>
                        <span className={marketAnalysis?.indicators.macd?.histogram > 0 ? 'text-green-500' : 'text-red-500'}>
                          {handleRenderMacdData(marketAnalysis?.indicators.macd)?.histogram}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {mlFeaturesAvailable && (
              <Card className="p-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  AI Insights
                </h3>
                {isLoadingAnalysis ? (
                  <p>Loading...</p>
                ) : (
                  <div className="mt-4 space-y-4">
                    <div className="p-4 bg-secondary rounded-lg">
                      <h4 className="font-semibold mb-2">Price Prediction</h4>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Next Target</p>
                          <p className="text-xl font-bold">
                            ${marketAnalysis?.aiPredictions.nextTarget ? formatNumber(marketAnalysis.aiPredictions.nextTarget) : 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Confidence</p>
                          <p className="font-semibold">
                            {marketAnalysis?.aiPredictions.confidence ? formatNumber(marketAnalysis.aiPredictions.confidence * 100, 1) + "%" : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Market Sentiment</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Overall</span>
                          <span className={`font-semibold ${
                            marketAnalysis?.sentiment.overall === 'bullish' ? 'text-green-500' :
                              marketAnalysis?.sentiment.overall === 'bearish' ? 'text-red-500' :
                                'text-yellow-500'
                          }`}>
                            {marketAnalysis?.sentiment.overall ? marketAnalysis.sentiment.overall.toUpperCase() : 'N/A'}
                          </span>
                        </div>
                        {marketAnalysis?.sentiment.signals.map((signal, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span>{signal.name}</span>
                            <span>{formatNumber(signal.value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>

          <Card className="p-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChart2 className="w-4 h-4" />
              Portfolio Overview
            </h3>
            {isLoadingPortfolio ? (
              <p>Loading portfolio data...</p>
            ) : (
              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold">
                      ${portfolioMetrics?.totalValue ? portfolioMetrics.totalValue.toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">Daily P&L</p>
                    <p className={`text-2xl font-bold ${portfolioMetrics?.dailyPnL > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${portfolioMetrics?.dailyPnL ? Math.abs(portfolioMetrics.dailyPnL).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                    <p className="text-2xl font-bold">
                      {portfolioMetrics?.riskMetrics.sharpeRatio ? formatNumber(portfolioMetrics.riskMetrics.sharpeRatio) : 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">Beta</</p>
                    <p className="text-2xl font-bold">
                      {portfolioMetrics?.riskMetrics.beta ? formatNumber(portfolioMetrics.riskMetrics.beta) : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold mb-4">Positions</h4>
                  <div className="space-y-2">
                    {portfolioMetrics?.positions.map((position, index) => (
                      <div key={index} className="flex justify-between items-center p-2 hover:bg-secondary rounded-lg">
                        <div>
                          <p className="font-semibold">{position.symbol}</p>
                          <p className="text-sm text-muted-foreground">
                            {position.quantity.toLocaleString()} shares @ ${formatNumber(position.averagePrice)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${position.pnl > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ${Math.abs(position.pnl).toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Current: ${formatNumber(position.currentPrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <Card className="p-4">
            {/* Risk Management content will be implemented */}
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card className="p-4">
            {/* AI Predictions content will be implemented */}
          </Card>
        </TabsContent>

        <TabsContent value="flow">
          <Card className="p-4">
            {/* Flow Analysis content will be implemented */}
          </Card>
        </TabsContent>

        <TabsContent value="execution">
          <Card className="p-4">
            {/* Smart Execution content will be implemented */}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuantumDashboard;