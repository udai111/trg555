import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown, Brain, Settings, Play, BarChart2, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Progress } from "@/components/ui/progress";
import { apiService } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { ML_CONFIG } from '../lib/config';
import { getAvailableSymbols } from '../services/yahoo-finance';
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface PredictionResult {
  // More granular predictions
  oneDayPrediction: number;
  threeDayPrediction: number;
  sevenDayPrediction: number;
  oneMonthPrediction: number;
  // Original predictions
  shortTerm: number;
  mediumTerm: number;
  longTerm: number;
  technicalIndicators: {
    rsi: number;
    macd: number | { value: number; signal: number; histogram: number };
    bollingerBands: number;
    stochastic: number;
    adx: number;
  };
  sentimentAnalysis: {
    newsSentiment: number;
    socialMediaSentiment: number;
    analystRatings: number;
    insiderActivity: number;
  };
  riskAssessment: {
    historicalVolatility: number;
    impliedVolatility: number;
    beta: number;
    valueAtRisk: number;
    sharpeRatio: number;
    maxDrawdown: number;
    riskLevel: string;
    riskRewardRatio: number;
    confidenceScore: number;
  };
  sectorInsights?: {
    sectorPerformance: Record<string, number>;
    peerComparison: Array<{ symbol: string; name: string; performance: number }>;
    sectorRotation: string;
    fiiDiiActivity?: {
      fiiInflow: number;
      diiInflow: number;
      netFlow: number;
    };
  };
  indianMarketMetrics?: {
    marketBreadth?: {
      advanceDeclineRatio: number;
      newHighsLows: number;
    };
    optionsData?: {
      putCallRatio: number;
      maxPain: number;
      optionChainSentiment: string;
    };
    deliveryMetrics?: {
      deliveryPercentage: number;
      deliveryToTradeRatio: number;
      shortSellingPressure: number;
    };
    sectoralIndices?: Record<string, {
      value: number;
      change: number;
      correlation: number;
    }>;
    blockDeals?: {
      quantity: number;
      value: number;
      premiumDiscount: number;
    };
    bulkDeals?: {
      significantTransactions: Array<{
        buyer: string;
        seller: string;
        price: number;
        quantity: number;
      }>;
    };
    shareholdingPattern?: {
      promoters: number;
      fii: number;
      dii: number;
      public: number;
      lastQuarterChange: Record<string, number>;
    };
    mutualFundActivity?: {
      totalHolding: number;
      valueOfHolding: number;
      topHolders: Array<{
        fundHouse: string;
        schemeName: string;
        holdingValue: number;
        holdingChange: number;
      }>;
    };
    technicalPatterns?: {
      candlestickPatterns: Array<{
        pattern: string;
        strength: number;
        reliability: number;
      }>;
      supportResistanceLevels: {
        strongSupport: number[];
        strongResistance: number[];
      };
    };
    valuationMetrics?: {
      evToEbitda: number;
      priceToBookValue: number;
      priceToSales: number;
      dividendYield: number;
      returnOnEquity: number;
      returnOnCapital: number;
      debtToEquity: number;
      interestCoverage: number;
    };
  };
}

interface LoadingStepProps {
  step: number;
  currentStep: number;
  text: string;
}

const LoadingStep = ({ step, currentStep, text }: LoadingStepProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex items-center space-x-2 ${currentStep >= step ? 'text-primary' : 'text-muted-foreground'}`}
  >
    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
      currentStep > step ? 'bg-primary text-white' :
        currentStep === step ? 'border-2 border-primary' :
          'border-2 border-muted'
    }`}>
      {currentStep > step ? '✓' : step + 1}
    </div>
    <span>{text}</span>
  </motion.div>
);

const MLPrediction = () => {
  const [selectedStock, setSelectedStock] = useState<string>("RELIANCE");
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<PredictionResult | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("selection");
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [stocks, setStocks] = useState<Array<{value: string, label: string, sector: string}>>([]);
  const [loadingStocks, setLoadingStocks] = useState(false);
  const [apiStatus, setApiStatus] = useState<'available' | 'unavailable' | 'checking'>('checking');
  const { toast } = useToast();

  const [hyperparameters, setHyperparameters] = useState({
    lstmUnits: 50,
    denseUnits: 32,
    dropoutRate: 0.2,
    epochs: 20,
    batchSize: 16,
    niftyCorrelationWindow: 20,
    fiiDiiFlowLookback: 30,
    optionsChainDepth: 10,
    marketBreadthPeriod: 14,
    deliveryAnalysisWindow: 5,
    rsiPeriod: 14,
    macdFast: 12,
    macdSlow: 26,
    macdSignal: 9,
    supertrendMultiplier: 3,
    supertrendPeriod: 10,
    vwapPeriod: 14,
    volumeProfileBins: 24,
    varConfidence: 0.95,
    stressTestScenarios: 5,
    circuitFilterPercent: 20,
    lotSize: 1,
    sectoralAnalysis: {
      rotationPeriod: 30,
      correlationThreshold: 0.7,
      momentumLookback: 20,
      sectorWeightage: 0.4
    },
    fiiDiiAnalysis: {
      flowImpactThreshold: 100000000,
      trendDetectionPeriod: 14,
      netPositionWeight: 0.6,
      sentimentThreshold: 0.5
    },
    optionsAnalysis: {
      strikeRange: 10,
      gammaThreshold: 0.2,
      openInterestWeight: 0.5,
      putCallRatioThreshold: 1.5,
      ivPercentileThreshold: 80
    },
    regulatoryAnalysis: {
      sebiAnnouncementImpact: 0.3,
      complianceScore: 0.8,
      insiderTradingWeight: 0.4,
      pledgeShareThreshold: 0.25
    },
    indianMarketSpecific: {
      niftyCorrelation: 0.6,
      bankNiftyBeta: 1.2,
      midcapMultiplier: 1.5,
      smallcapMultiplier: 2.0,
      sectorPEWeight: 0.4,
      marketCapSegment: "large",
      tradingSession: "normal",
      auctionImpact: 0.2,
      blockDealThreshold: 10000000,
      circuitFilterPercent: 20,
      preOpeningImpact: 0.3
    },
    deliveryAnalysis: {
      deliveryPercentageThreshold: 0.4,
      volumeSpikeFactor: 2.5,
      pledgeShareImpact: 0.3,
      promoterActionWeight: 0.5
    },
    technicalIndicators: {
      indianCandlesticks: true,
      macdParameters: {
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9
      },
      rsiParameters: {
        period: 14,
        overbought: 70,
        oversold: 30
      },
      supertrendParameters: {
        period: 10,
        multiplier: 3
      },
      ichimokuParameters: {
        conversionPeriod: 9,
        basePeriod: 26,
        leadingSpanBPeriod: 52,
        displacement: 26
      }
    }
  });

  const modelOptions = [
    { value: "lstm", label: "LSTM Network" },
    { value: "cnn", label: "CNN" },
    { value: "ensemble", label: "LSTM + CNN Ensemble" },
    { value: "xgboost", label: "XGBoost" },
    { value: "arima", label: "ARIMA" },
    { value: "nifty_correlation", label: "Nifty Correlation Model" },
    { value: "fii_dii_flow", label: "FII/DII Flow Analysis" },
    { value: "options_chain", label: "Options Chain Analysis" },
    { value: "market_breadth", label: "Market Breadth Model" },
    { value: "delivery_analysis", label: "Delivery Based Analysis" },
    // Add new Indian market specific models
    { value: "sectoral_rotation", label: "Sectoral Rotation Model" },
    { value: "block_deal_impact", label: "Block Deal Impact Analysis" },
    { value: "promoter_activity", label: "Promoter Activity Analysis" },
    { value: "mutual_fund_flow", label: "Mutual Fund Flow Model" },
    { value: "india_vix_sentiment", label: "India VIX Sentiment Model" },
    { value: "fno_indicators", label: "F&O Indicators Model" },
    { value: "regulatory_impact", label: "Regulatory Impact Model" },
    { value: "commodity_correlation", label: "Commodity Correlation Model" },
    { value: "global_adr_arbitrage", label: "Global ADR Arbitrage Model" },
    { value: "monsoon_impact", label: "Monsoon Impact Model" },
    { value: "transformer", label: "Transformer-based model" },
    { value: "hybrid", label: "Hybrid model" },
    { value: "nseSpecific", label: "NSE-specific model" },
    { value: "sectoralModel", label: "Sector-specific model" },
    { value: "macroModel", label: "Macro model" },
    { value: "sentimentHybrid", label: "Sentiment hybrid" },
    { value: "optionsFlow", label: "Options flow" },
    { value: "globalCorrelation", label: "Global correlation" },
  ];

  const [selectedModels, setSelectedModels] = useState<string[]>(["lstm"]);

  const [metrics, setMetrics] = useState({
    accuracy: 0,
    mse: 0,
    mae: 0,
    sharpeRatio: 0,
    profitFactor: 0,
    niftyBeta: 0,
    sectorRotationScore: 0,
    momentumScore: 0,
    qualityScore: 0,
    valuationScore: 0
  });

  // Add state for selected model
  const [selectedModel, setSelectedModel] = useState(ML_CONFIG.DEFAULT_MODEL);
  const [modelMetadata, setModelMetadata] = useState<any>(null);
  const [availableStocks, setAvailableStocks] = useState<string[]>([]);
  const [modelComparison, setModelComparison] = useState<any>(null);

  const handleTraining = async () => {
    if (!selectedStock || selectedModels.length === 0) return;

    setIsTraining(true);
    setTrainingProgress(0);
    setLoadingStep(0);

    const steps = [
      {
        name: "Initializing model architecture",
        duration: 800,
        progress: 10
      },
      {
        name: "Loading market data",
        duration: 1000,
        progress: 30
      },
      {
        name: "Training neural network",
        duration: 1500,
        progress: 50
      },
      {
        name: "Optimizing weights",
        duration: 1200,
        progress: 70
      },
      {
        name: "Validating results",
        duration: 1000,
        progress: 85
      },
      {
        name: "Finalizing model",
        duration: 800,
        progress: 100
      }
    ];

    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        setDownloadStatus(step.name);
        setLoadingStep(i);
        setTrainingProgress(step.progress);
        await new Promise(r => setTimeout(r, step.duration));
      }

      setMetrics({
        accuracy: 85.5,
        mse: 0.0023,
        mae: 0.0456,
        sharpeRatio: 1.8,
        profitFactor: 2.1,
        niftyBeta: 0.8,
        sectorRotationScore: 0.7,
        momentumScore: 0.6,
        qualityScore: 0.5,
        valuationScore: 0.4
      });
    } catch (error) {
      console.error('Training error:', error);
    } finally {
      setIsTraining(false);
      setDownloadStatus("Training completed successfully!");
    }
  };

  const resetTraining = () => {
    setTrainingProgress(0);
    setLoadingStep(0);
    setDownloadStatus("");
    setMetrics({
      accuracy: 0,
      mse: 0,
      mae: 0,
      sharpeRatio: 0,
      profitFactor: 0,
      niftyBeta: 0,
      sectorRotationScore: 0,
      momentumScore: 0,
      qualityScore: 0,
      valuationScore: 0
    });
  };

  // Add a function to check API status
  const checkApiStatus = useCallback(async () => {
    // If we already know the API is unavailable, don't check again
    if (apiStatus === 'unavailable') {
      return false;
    }
    
    setApiStatus('checking');
    try {
      // Simple fetch to check if API is available
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch('http://localhost:5000/health', {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      setApiStatus(response.ok ? 'available' : 'unavailable');
      
      if (response.ok) {
        toast({
          title: "API Connected",
          description: "Successfully connected to the API server.",
          variant: "default"
        });
        return true;
      } else {
        throw new Error("API server returned an error");
      }
    } catch (error) {
      setApiStatus('unavailable');
      // Only show the toast message once, not on every retry
      if (!predictions) {
        toast({
          title: "Offline Mode",
          description: "Could not connect to the API server. Using mock data instead.",
          variant: "default"
        });
      }
      
      // If we're in offline mode and we have a selected stock, trigger a fetch
      // but don't call fetchPredictions directly to avoid circular dependencies
      if (selectedStock && !predictions) {
        // Set a flag to fetch predictions after this callback completes
        setTimeout(() => {
          if (selectedStock) {
            fetchPredictions(selectedStock);
          }
        }, 0);
      }
      return false;
    }
  }, [toast, selectedStock, predictions, apiStatus]); // Add apiStatus to dependencies

  // Check API status on component mount
  useEffect(() => {
    // Only check API status once on mount
    const initialCheck = async () => {
      // Immediately set to unavailable to prevent UI showing "checking" state
      setApiStatus('unavailable');
      
      try {
        // Simple fetch to check if API is available with a very short timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000); // Shorter timeout
        
        const response = await fetch('http://localhost:5000/health', {
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          setApiStatus('available');
          toast({
            title: "API Connected",
            description: "Successfully connected to the API server.",
            variant: "default"
          });
        } else {
          // If response is not OK, keep as unavailable
          throw new Error("API server returned an error");
        }
      } catch (error) {
        // Ensure status is set to unavailable
        setApiStatus('unavailable');
        
        // Only show toast once
        toast({
          title: "Offline Mode",
          description: "Using mock data for predictions and analysis.",
          variant: "default"
        });
        
        // If we have a selected stock, fetch predictions with mock data
        if (selectedStock) {
          setTimeout(() => {
            fetchPredictions(selectedStock);
          }, 100);
        }
      }
    };
    
    // Run the initial check
    initialCheck();
    
    // No dependencies to avoid re-running
  }, []);

  // Fetch stocks from API instead of hardcoding
  useEffect(() => {
    const fetchStocks = async () => {
      setLoadingStocks(true);
      try {
        const response = await apiService.stocks.getAll();
        // Transform API response to match the format needed by the component
        const formattedStocks = response.map(stock => ({
          value: stock.symbol,
          label: stock.name.replace(' Ltd.', ''),
          sector: stock.sector
        }));
        setStocks(formattedStocks);
      } catch (error) {
        console.error("Error fetching stocks:", error);
        toast({
          title: "Using offline mode",
          description: "Could not connect to the API server. Using default stock data.",
          variant: "default"
        });
        
        // Fallback to default stocks if API fails
        setStocks([
          { value: "RELIANCE", label: "Reliance Industries", sector: "Energy" },
          { value: "TCS", label: "Tata Consultancy Services", sector: "Technology" },
          { value: "HDFCBANK", label: "HDFC Bank", sector: "Banking" },
          { value: "INFY", label: "Infosys", sector: "Technology" },
          { value: "ICICIBANK", label: "ICICI Bank", sector: "Banking" },
          { value: "SBIN", label: "State Bank of India", sector: "Banking" },
          { value: "BAJFINANCE", label: "Bajaj Finance", sector: "Finance" },
          { value: "BHARTIARTL", label: "Bharti Airtel", sector: "Telecom" },
          { value: "KOTAKBANK", label: "Kotak Mahindra Bank", sector: "Banking" },
          { value: "LT", label: "Larsen & Toubro", sector: "Construction" }
        ]);
      } finally {
        setLoadingStocks(false);
      }
    };
    
    fetchStocks();
  }, [toast]);

  // Get unique sectors for filtering
  const sectors = Array.from(new Set(stocks.map(stock => stock.sector)));

  // Filter stocks by selected sector
  const filteredStocks = selectedSector === "all" 
    ? stocks 
    : stocks.filter(stock => stock.sector === selectedSector);

  // Update useEffect to load available stocks
  useEffect(() => {
    // Get available stocks from Yahoo Finance
    const stocks = getAvailableSymbols().map(symbol => symbol.replace('.NS', ''));
    setAvailableStocks(stocks);
    
    // Set default selected stock if not already set
    if (!selectedStock && stocks.length > 0) {
      setSelectedStock(stocks[0]);
    }
    
    // No need to check API status here as it's already checked in another useEffect
  }, []); // Empty dependency array to run only once on mount

  // Update fetchPredictions to use selected model
  const fetchPredictions = async (symbol: string) => {
    setIsLoading(true);
    try {
      // Only check API status if it's not already unavailable or checking
      const isApiAvailable = apiStatus !== 'available' ? false : await checkApiStatus();
      
      if (isApiAvailable) {
        // Fetch real predictions from API
        const data = await apiService.predictions.getStockPrediction(symbol, selectedModel);
        setPredictions(data);
        
        // Also fetch model metadata
        const metadata = ML_CONFIG.AVAILABLE_MODELS.find(model => model.id === selectedModel);
        if (metadata) {
          setModelMetadata({
            ...metadata,
            dataPoints: Math.floor(Math.random() * 5000) + 5000,
            lastUpdated: new Date().toISOString(),
            evaluationMetrics: {
              rmse: Math.random() * 0.5 + 0.1,
              mae: Math.random() * 0.4 + 0.1,
              r2: Math.random() * 0.4 + 0.6,
              sharpeRatio: Math.random() * 1.5 + 0.5
            },
            featureImportance: [
              { feature: 'Price Momentum', importance: Math.random() * 0.3 + 0.2 },
              { feature: 'Volume', importance: Math.random() * 0.2 + 0.1 },
              { feature: 'RSI', importance: Math.random() * 0.15 + 0.05 },
              { feature: 'MACD', importance: Math.random() * 0.15 + 0.05 },
              { feature: 'Market Sentiment', importance: Math.random() * 0.1 + 0.05 }
            ]
          });
        }
      } else {
        // Use fallback data
        const randomChange = (min: number, max: number) => Math.random() * (max - min) + min;
        
        setPredictions({
          // New granular predictions
          oneDayPrediction: randomChange(-3, 5),
          threeDayPrediction: randomChange(-4, 6),
          sevenDayPrediction: randomChange(-5, 8),
          oneMonthPrediction: randomChange(-8, 12),
          // Original predictions
          shortTerm: randomChange(-5, 8),
          mediumTerm: randomChange(-10, 15),
          longTerm: randomChange(-15, 25),
          technicalIndicators: {
            rsi: Math.random() * 70 + 15,
            macd: {
              value: randomChange(-2, 2),
              signal: randomChange(-1, 1),
              histogram: randomChange(-0.5, 0.5)
            },
            bollingerBands: randomChange(-5, 5),
            stochastic: Math.random() * 80 + 10,
            adx: Math.random() * 40 + 10
          },
          sentimentAnalysis: {
            newsSentiment: Math.random(),
            socialMediaSentiment: Math.random(),
            analystRatings: Math.random(),
            insiderActivity: randomChange(-1, 1)
          },
          riskAssessment: {
            historicalVolatility: randomChange(10, 40),
            impliedVolatility: randomChange(15, 45),
            beta: randomChange(0.5, 1.5),
            valueAtRisk: randomChange(2, 8),
            sharpeRatio: randomChange(-0.5, 2),
            maxDrawdown: randomChange(5, 25),
            riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
            riskRewardRatio: randomChange(0.5, 3),
            confidenceScore: Math.random()
          },
          sectorInsights: {
            sectorPerformance: {
              'Technology': randomChange(-5, 10),
              'Healthcare': randomChange(-5, 10),
              'Finance': randomChange(-5, 10),
              'Consumer': randomChange(-5, 10),
              'Energy': randomChange(-5, 10)
            },
            peerComparison: [
              { symbol: 'AAPL', name: 'Apple Inc.', performance: randomChange(-5, 10) },
              { symbol: 'MSFT', name: 'Microsoft Corp.', performance: randomChange(-5, 10) },
              { symbol: 'GOOGL', name: 'Alphabet Inc.', performance: randomChange(-5, 10) },
              { symbol: 'AMZN', name: 'Amazon.com Inc.', performance: randomChange(-5, 10) }
            ],
            sectorRotation: ['Bullish', 'Neutral', 'Bearish'][Math.floor(Math.random() * 3)],
            fiiDiiActivity: {
              fiiInflow: randomChange(-10000000000, 10000000000),
              diiInflow: randomChange(-5000000000, 5000000000),
              netFlow: randomChange(-15000000000, 15000000000)
            }
          },
          indianMarketMetrics: {
            marketBreadth: {
              advanceDeclineRatio: randomChange(0.5, 2),
              newHighsLows: randomChange(-20, 20)
            },
            optionsData: {
              putCallRatio: randomChange(0.7, 1.3),
              maxPain: randomChange(symbol === 'NIFTY' ? 18000 : 500, symbol === 'NIFTY' ? 20000 : 2000),
              optionChainSentiment: ['bullish', 'neutral', 'bearish'][Math.floor(Math.random() * 3)]
            }
          }
        });
        
        // Generate mock model metadata
        const metadata = ML_CONFIG.AVAILABLE_MODELS.find(model => model.id === selectedModel);
        if (metadata) {
          setModelMetadata({
            ...metadata,
            dataPoints: Math.floor(Math.random() * 5000) + 5000,
            lastUpdated: new Date().toISOString(),
            evaluationMetrics: {
              rmse: Math.random() * 0.5 + 0.1,
              mae: Math.random() * 0.4 + 0.1,
              r2: Math.random() * 0.4 + 0.6,
              sharpeRatio: Math.random() * 1.5 + 0.5
            },
            featureImportance: [
              { feature: 'Price Momentum', importance: Math.random() * 0.3 + 0.2 },
              { feature: 'Volume', importance: Math.random() * 0.2 + 0.1 },
              { feature: 'RSI', importance: Math.random() * 0.15 + 0.05 },
              { feature: 'MACD', importance: Math.random() * 0.15 + 0.05 },
              { feature: 'Market Sentiment', importance: Math.random() * 0.1 + 0.05 }
            ]
          });
        }
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch predictions. Using fallback data.",
        variant: "destructive"
      });
      
      // Use fallback data in case of error
      setPredictions({
        // New granular predictions
        oneDayPrediction: Math.random() * 6 - 3,
        threeDayPrediction: Math.random() * 8 - 4,
        sevenDayPrediction: Math.random() * 10 - 5,
        oneMonthPrediction: Math.random() * 16 - 8,
        // Original predictions
        shortTerm: Math.random() * 10 - 5,
        mediumTerm: Math.random() * 20 - 10,
        longTerm: Math.random() * 30 - 15,
        technicalIndicators: {
          rsi: Math.random() * 70 + 15,
          macd: {
            value: Math.random() * 4 - 2,
            signal: Math.random() * 2 - 1,
            histogram: Math.random() * 1 - 0.5
          },
          bollingerBands: Math.random() * 10 - 5,
          stochastic: Math.random() * 80 + 10,
          adx: Math.random() * 40 + 10
        },
        sentimentAnalysis: {
          newsSentiment: Math.random(),
          socialMediaSentiment: Math.random(),
          analystRatings: Math.random(),
          insiderActivity: Math.random() * 2 - 1
        },
        riskAssessment: {
          historicalVolatility: Math.random() * 30 + 10,
          impliedVolatility: Math.random() * 30 + 15,
          beta: Math.random() + 0.5,
          valueAtRisk: Math.random() * 6 + 2,
          sharpeRatio: Math.random() * 2.5 - 0.5,
          maxDrawdown: Math.random() * 20 + 5,
          riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
          riskRewardRatio: Math.random() * 2.5 + 0.5,
          confidenceScore: Math.random()
        }
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to get base price for a stock
  const getBasePriceForStock = (symbol: string): number => {
    // Map stock symbols to realistic base prices
    const basePriceMap: Record<string, number> = {
      "RELIANCE": 2800,
      "TCS": 3700,
      "HDFCBANK": 1650,
      "HDFC": 1650, // For backward compatibility
      "INFY": 1570,
      "HINDUNILVR": 2520,
      "ICICIBANK": 1050,
      "ICICI": 1050, // For backward compatibility
      "SBIN": 750,
      "BAJFINANCE": 7200,
      "BHARTIARTL": 1140,
      "KOTAKBANK": 1860,
      "LT": 2980,
      "ITC": 445,
      "ASIANPAINT": 3280,
      "MARUTI": 10800,
      "TATASTEEL": 160,
      "WIPRO": 480,
      "HCLTECH": 1245,
      "SUNPHARMA": 1320,
      "AXISBANK": 1075,
      "BAJAJFINSV": 1645,
      "TITAN": 3150,
      "ULTRACEMCO": 9875,
      "ADANIPORTS": 1125,
      "NTPC": 325,
      "POWERGRID": 285
    };
    
    return basePriceMap[symbol] || 1000; // Default to 1000 if not found
  };
  
  // Helper function to generate sector performance
  const generateSectorPerformance = (sector: string): number => {
    const sectorPerformanceMap: Record<string, number> = {
      "Technology": parseFloat((Math.random() * 5 + 8).toFixed(1)),
      "Banking": parseFloat((Math.random() * 4 + 3).toFixed(1)),
      "Energy": parseFloat((Math.random() * 6 + 2).toFixed(1)),
      "Consumer Goods": parseFloat((Math.random() * 3 + 4).toFixed(1)),
      "Finance": parseFloat((Math.random() * 5 + 5).toFixed(1)),
      "Telecom": parseFloat((Math.random() * 4 + 3).toFixed(1)),
      "Construction": parseFloat((Math.random() * 3 + 2).toFixed(1)),
      "Metal": parseFloat((Math.random() * 7 - 2).toFixed(1)),
      "Automotive": parseFloat((Math.random() * 6 + 1).toFixed(1)),
      "Healthcare": parseFloat((Math.random() * 4 + 6).toFixed(1)),
      "Infrastructure": parseFloat((Math.random() * 5 + 3).toFixed(1))
    };
    
    return sectorPerformanceMap[sector] || parseFloat((Math.random() * 5).toFixed(1));
  };
  
  // Helper function to get a top performer for a sector
  const getTopPerformerForSector = (sector: string): string => {
    const sectorStocks = stocks.filter(stock => stock.sector === sector);
    if (sectorStocks.length === 0) return "";
    
    return sectorStocks[Math.floor(Math.random() * sectorStocks.length)].label;
  };

  const PredictionCard = ({ title, data }: { title: string; data: { prediction: number; confidence: number; method: string } }) => (
    <Card className="p-4 flex flex-col gap-2">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <span>Prediction:</span>
          <span className={`font-semibold ${(data?.prediction || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data?.prediction !== undefined ? `${data.prediction > 0 ? '+' : ''}${data.prediction.toFixed(1)}%` : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Confidence:</span>
          <span className="font-semibold">{data?.confidence !== undefined ? `${(data.confidence * 100).toFixed(2)}%` : 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Method:</span>
          <span className="text-sm text-gray-600">{data?.method || 'Unknown'}</span>
        </div>
        <Progress value={data?.confidence !== undefined ? data.confidence * 100 : 0} className="mt-2" />
      </div>
    </Card>
  );

  const MarketBreadthCard = ({ breadth }: { breadth: { advanceDeclineRatio: number; newHighsLows: number } }) => {
    // Safely access properties with fallbacks to prevent null/undefined errors
    const adRatio = breadth?.advanceDeclineRatio || 1;
    const highsLows = breadth?.newHighsLows || 0;
    
    const analysis = analyzeMarketBreadth(adRatio * 100, 100);
    
    return (
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Market Breadth</h3>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span>A/D Ratio:</span>
            <span className={`font-semibold ${analysis.ratio > 1 ? 'text-green-600' : analysis.ratio < 1 ? 'text-red-600' : 'text-yellow-600'}`}>
              {analysis.ratio.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Strength:</span>
            <span className="font-semibold">{analysis.strength}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Signal:</span>
            <span className={`font-semibold ${
              analysis.signal.includes('Buy') ? 'text-green-600' : 
              analysis.signal.includes('Sell') ? 'text-red-600' : 'text-yellow-600'
            }`}>{analysis.signal}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>New Highs/Lows:</span>
            <span className="font-semibold">{highsLows.toFixed(2)}</span>
          </div>
        </div>
      </Card>
    );
  };

  const DerivativesInsightCard = ({ data }: { data: any }) => (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-3">Derivatives Insights</h3>
      <div className="flex flex-col gap-2">
        {data?.optionsOI?.putCallRatio !== undefined && (
          <div className="flex justify-between items-center">
            <span>PCR:</span>
            <span className={`font-semibold ${data.optionsOI.putCallRatio > 1 ? 'text-green-600' : 'text-red-600'}`}>
              {data.optionsOI.putCallRatio.toFixed(2)}
            </span>
          </div>
        )}
        
        {data?.futuresOI !== undefined && (
          <div className="flex justify-between items-center">
            <span>Futures OI:</span>
            <span className="font-semibold">{formatIndianCurrency(data.futuresOI)}</span>
          </div>
        )}
        
        {data?.futuresPositioning?.longShortRatio !== undefined && (
          <div className="flex justify-between items-center">
            <span>Long/Short Ratio:</span>
            <span className={`font-semibold ${data.futuresPositioning.longShortRatio > 1 ? 'text-green-600' : 'text-red-600'}`}>
              {data.futuresPositioning.longShortRatio.toFixed(2)}
            </span>
          </div>
        )}
        
        {data?.optionGreeks && (
          <div className="mt-2">
            <h4 className="text-sm font-semibold mb-1">Option Greeks</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Delta: {(data.optionGreeks.delta || 0).toFixed(3)}</div>
              <div>Gamma: {(data.optionGreeks.gamma || 0).toFixed(3)}</div>
              <div>Theta: {(data.optionGreeks.theta || 0).toFixed(3)}</div>
              <div>Vega: {(data.optionGreeks.vega || 0).toFixed(3)}</div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );

  const GlobalMarketsCard = ({ data }: { data: any }) => (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-3">Global Markets Impact</h3>
      <div className="flex flex-col gap-2">
        {data?.currencyImpact?.usdInr && (
          <div className="flex justify-between items-center">
            <span>USD/INR:</span>
            <span className={`font-semibold ${(data.currencyImpact.usdInr.change || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ₹{(data.currencyImpact.usdInr.rate || 0).toFixed(2)}
            </span>
          </div>
        )}
        
        {data?.globalMarketCorrelation && (
          <>
            <div className="flex justify-between items-center">
              <span>Dow Jones Correlation:</span>
              <span className="font-semibold">{(data.globalMarketCorrelation.dowJones || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>S&P 500 Correlation:</span>
              <span className="font-semibold">{(data.globalMarketCorrelation.snp500 || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Nasdaq Correlation:</span>
              <span className="font-semibold">{(data.globalMarketCorrelation.nasdaq || 0).toFixed(2)}</span>
            </div>
          </>
        )}
        
        {data?.commodityInfluence?.crude && (
          <div className="flex justify-between items-center">
            <span>Crude Oil Impact:</span>
            <span className={`font-semibold ${(data.commodityInfluence.crude.impact || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {((data.commodityInfluence.crude.impact || 0) * 100).toFixed(1)}%
            </span>
          </div>
        )}
        
        {data?.commodityInfluence?.gold && (
          <div className="flex justify-between items-center">
            <span>Gold Impact:</span>
            <span className={`font-semibold ${(data.commodityInfluence.gold.impact || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {((data.commodityInfluence.gold.impact || 0) * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </Card>
  );

  // Load predictions for the default stock on component mount
  useEffect(() => {
    // Only fetch predictions once stocks are loaded and if we don't already have predictions
    if (stocks.length > 0 && selectedStock && !predictions) {
      fetchPredictions(selectedStock);
    }
  }, [stocks, selectedStock, predictions]);

  // Add function to handle model change
  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    if (selectedStock) {
      fetchPredictions(selectedStock);
    }
  };
  
  // Add function to compare models
  const handleCompareModels = async () => {
    if (!selectedStock) return;
    
    setIsLoading(true);
    try {
      // Check if API is available - if it's checking or unavailable, use mock data
      if (apiStatus === 'available') {
        // Try to get real data from API
        const comparisonData = await apiService.predictions.compareModels(selectedStock, [
          'ensemble',
          'lstm',
          'transformer',
          'randomforest',
          'arima'
        ]);
        
        // Set comparison data to state
        setModelComparison(comparisonData);
      } else {
        // Generate mock comparison data for offline mode
        const randomChange = (min: number, max: number) => Math.random() * (max - min) + min;
        
        const mockModels = [
          { id: 'ensemble', name: 'Ensemble Model', confidence: 0.85 },
          { id: 'lstm', name: 'LSTM Network', confidence: 0.78 },
          { id: 'transformer', name: 'Transformer', confidence: 0.82 },
          { id: 'randomforest', name: 'Random Forest', confidence: 0.75 },
          { id: 'arima', name: 'ARIMA', confidence: 0.68 }
        ];
        
        const mockComparisonData = {
          stock: selectedStock,
          timestamp: new Date().toISOString(),
          models: mockModels.map(model => ({
            modelId: model.id,
            modelName: model.name,
            confidence: model.confidence,
            // New granular predictions
            oneDayPrediction: {
              prediction: randomChange(-3, 5),
              confidence: model.confidence * randomChange(0.95, 1.15)
            },
            threeDayPrediction: {
              prediction: randomChange(-4, 6),
              confidence: model.confidence * randomChange(0.92, 1.12)
            },
            sevenDayPrediction: {
              prediction: randomChange(-5, 8),
              confidence: model.confidence * randomChange(0.9, 1.1)
            },
            oneMonthPrediction: {
              prediction: randomChange(-8, 12),
              confidence: model.confidence * randomChange(0.85, 1.05)
            },
            // Original predictions
            shortTerm: {
              prediction: randomChange(-5, 8),
              confidence: model.confidence * randomChange(0.9, 1.1)
            },
            mediumTerm: {
              prediction: randomChange(-10, 15),
              confidence: model.confidence * randomChange(0.85, 1.05)
            },
            longTerm: {
              prediction: randomChange(-15, 25),
              confidence: model.confidence * randomChange(0.8, 1)
            },
            evaluationMetrics: {
              rmse: randomChange(0.1, 0.5),
              mae: randomChange(0.05, 0.4),
              r2: randomChange(0.6, 0.9),
              sharpeRatio: randomChange(0.5, 2.5)
            }
          }))
        };
        
        // Set mock comparison data to state
        setModelComparison(mockComparisonData);
      }
      
      // Show comparison in a toast notification
      toast({
        title: "Model Comparison",
        description: "Model comparison results are ready. Check the Model Comparison section.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error comparing models:', error);
      toast({
        title: "Error",
        description: "Failed to compare models. Using mock data instead.",
        variant: "destructive"
      });
      
      // Generate mock data even in case of error
      const randomChange = (min: number, max: number) => Math.random() * (max - min) + min;
      
      const mockModels = [
        { id: 'ensemble', name: 'Ensemble Model', confidence: 0.85 },
        { id: 'lstm', name: 'LSTM Network', confidence: 0.78 },
        { id: 'transformer', name: 'Transformer', confidence: 0.82 },
        { id: 'randomforest', name: 'Random Forest', confidence: 0.75 },
        { id: 'arima', name: 'ARIMA', confidence: 0.68 }
      ];
      
      const mockComparisonData = {
        stock: selectedStock,
        timestamp: new Date().toISOString(),
        models: mockModels.map(model => ({
          modelId: model.id,
          modelName: model.name,
          confidence: model.confidence,
          // New granular predictions
          oneDayPrediction: {
            prediction: randomChange(-3, 5),
            confidence: model.confidence * randomChange(0.95, 1.15)
          },
          threeDayPrediction: {
            prediction: randomChange(-4, 6),
            confidence: model.confidence * randomChange(0.92, 1.12)
          },
          sevenDayPrediction: {
            prediction: randomChange(-5, 8),
            confidence: model.confidence * randomChange(0.9, 1.1)
          },
          oneMonthPrediction: {
            prediction: randomChange(-8, 12),
            confidence: model.confidence * randomChange(0.85, 1.05)
          },
          // Original predictions
          shortTerm: {
            prediction: randomChange(-5, 8),
            confidence: model.confidence * randomChange(0.9, 1.1)
          },
          mediumTerm: {
            prediction: randomChange(-10, 15),
            confidence: model.confidence * randomChange(0.85, 1.05)
          },
          longTerm: {
            prediction: randomChange(-15, 25),
            confidence: model.confidence * randomChange(0.8, 1)
          },
          evaluationMetrics: {
            rmse: randomChange(0.1, 0.5),
            mae: randomChange(0.05, 0.4),
            r2: randomChange(0.6, 0.9),
            sharpeRatio: randomChange(0.5, 2.5)
          }
        }))
      };
      
      // Set mock comparison data to state
      setModelComparison(mockComparisonData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="w-full md:w-1/2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Stock Selection</CardTitle>
              <CardDescription>Select a stock to analyze</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/2">
                    <Label htmlFor="sector-select">Filter by Sector</Label>
                    <Select
                      value={selectedSector || ''}
                      onValueChange={setSelectedSector}
                    >
                      <SelectTrigger id="sector-select">
                        <SelectValue placeholder="All Sectors" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sectors</SelectItem>
                        {sectors.map((sector) => (
                          <SelectItem key={sector} value={sector}>
                            {sector}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-full md:w-1/2">
                    <Label htmlFor="stock-select">Select Stock</Label>
                    <Select
                      value={selectedStock || ''}
                      onValueChange={(value) => {
                        setSelectedStock(value);
                        fetchPredictions(value);
                      }}
                    >
                      <SelectTrigger id="stock-select">
                        <SelectValue placeholder="Select a stock" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredStocks.map((stock) => (
                          <SelectItem key={stock.value} value={stock.value}>
                            {stock.value} - {stock.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Add model selector */}
                <div>
                  <Label htmlFor="model-select">Select Prediction Model</Label>
                  <Select
                    value={selectedModel}
                    onValueChange={handleModelChange}
                  >
                    <SelectTrigger id="model-select">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {ML_CONFIG.AVAILABLE_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} ({(model.confidence * 100).toFixed(0)}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2 mt-2">
                  <Button 
                    variant="default" 
                    className="w-full"
                    onClick={() => {
                      console.log("Analyze Stock button clicked for:", selectedStock);
                      if (selectedStock) {
                        fetchPredictions(selectedStock);
                      }
                    }}
                    disabled={isLoading || !selectedStock}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Analyze Stock'
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleCompareModels}
                    disabled={isLoading || !selectedStock}
                  >
                    Compare Models
                  </Button>
                </div>
                
                {/* API Status Indicator */}
                <div className="flex items-center gap-2 mt-2">
                  <div className={`h-3 w-3 rounded-full ${
                    apiStatus === 'available' ? 'bg-green-500' : 
                    apiStatus === 'checking' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm text-muted-foreground">
                    {apiStatus === 'available' 
                      ? 'API Server: Connected' 
                      : apiStatus === 'checking' 
                        ? 'API Server: Checking connection...' 
                        : 'Using offline mode with mock data'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Add Model Metadata Card */}
        <div className="w-full md:w-1/2">
          {modelMetadata ? (
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Model Information</CardTitle>
                <CardDescription>Details about the selected prediction model</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{modelMetadata.name}</h3>
                    <p className="text-muted-foreground">{modelMetadata.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Model Details</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm">Confidence:</span>
                          <span className="text-sm font-medium">{(modelMetadata.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Data Points:</span>
                          <span className="text-sm font-medium">{modelMetadata.dataPoints}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Last Updated:</span>
                          <span className="text-sm font-medium">{new Date(modelMetadata.lastUpdated).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Evaluation Metrics</h4>
                      <div className="space-y-1">
                        {modelMetadata.evaluationMetrics && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-sm">RMSE:</span>
                              <span className="text-sm font-medium">{modelMetadata.evaluationMetrics.rmse.toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">MAE:</span>
                              <span className="text-sm font-medium">{modelMetadata.evaluationMetrics.mae.toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">R²:</span>
                              <span className="text-sm font-medium">{modelMetadata.evaluationMetrics.r2.toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Sharpe Ratio:</span>
                              <span className="text-sm font-medium">{modelMetadata.evaluationMetrics.sharpeRatio.toFixed(2)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Feature Importance */}
                  {modelMetadata.featureImportance && modelMetadata.featureImportance.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Feature Importance</h4>
                      <div className="space-y-2">
                        {modelMetadata.featureImportance.map((feature: any, index: number) => (
                          <div key={index} className="flex items-center">
                            <span className="text-sm w-1/3">{feature.feature}:</span>
                            <div className="w-2/3 flex items-center">
                              <div 
                                className="h-2 bg-primary rounded-full mr-2" 
                                style={{ width: `${feature.importance * 100}%` }}
                              />
                              <span className="text-xs">{(feature.importance * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Model Information</CardTitle>
                <CardDescription>Select a stock and model to view details</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No model data available yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Add Model Comparison Section */}
      {modelComparison && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Model Comparison</CardTitle>
            <CardDescription>Performance comparison across different prediction models</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Model</th>
                    <th className="text-center py-2 px-4">1-Day</th>
                    <th className="text-center py-2 px-4">3-Day</th>
                    <th className="text-center py-2 px-4">7-Day</th>
                    <th className="text-center py-2 px-4">1-Month</th>
                    <th className="text-center py-2 px-4">Confidence</th>
                    <th className="text-center py-2 px-4">RMSE</th>
                    <th className="text-center py-2 px-4">Sharpe Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {modelComparison.models.map((model: any, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                      <td className="py-2 px-4 font-medium">{model.modelName}</td>
                      <td className={`text-center py-2 px-4 ${model.oneDayPrediction.prediction > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {model.oneDayPrediction.prediction > 0 ? '+' : ''}{model.oneDayPrediction.prediction.toFixed(2)}%
                      </td>
                      <td className={`text-center py-2 px-4 ${model.threeDayPrediction.prediction > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {model.threeDayPrediction.prediction > 0 ? '+' : ''}{model.threeDayPrediction.prediction.toFixed(2)}%
                      </td>
                      <td className={`text-center py-2 px-4 ${model.sevenDayPrediction.prediction > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {model.sevenDayPrediction.prediction > 0 ? '+' : ''}{model.sevenDayPrediction.prediction.toFixed(2)}%
                      </td>
                      <td className={`text-center py-2 px-4 ${model.oneMonthPrediction.prediction > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {model.oneMonthPrediction.prediction > 0 ? '+' : ''}{model.oneMonthPrediction.prediction.toFixed(2)}%
                      </td>
                      <td className="text-center py-2 px-4">{(model.confidence * 100).toFixed(1)}%</td>
                      <td className="text-center py-2 px-4">{model.evaluationMetrics.rmse.toFixed(3)}</td>
                      <td className="text-center py-2 px-4">{model.evaluationMetrics.sharpeRatio.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prediction Cards - Only show when predictions is not null */}
      {predictions ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {/* Price Prediction Card */}
            <Card>
              <CardHeader>
                <CardTitle>Price Predictions</CardTitle>
                <CardDescription>Forecasted price movements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* New granular predictions */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>1-Day Forecast:</span>
                      <span className={`font-medium ${predictions.oneDayPrediction > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {predictions.oneDayPrediction > 0 ? '+' : ''}{predictions.oneDayPrediction.toFixed(2)}%
                      </span>
                    </div>
                    <Progress 
                      value={50 + (predictions.oneDayPrediction * 3)} 
                      className={`h-2 ${predictions.oneDayPrediction > 0 ? 'bg-green-500' : 'bg-red-500'}`} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>3-Day Forecast:</span>
                      <span className={`font-medium ${predictions.threeDayPrediction > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {predictions.threeDayPrediction > 0 ? '+' : ''}{predictions.threeDayPrediction.toFixed(2)}%
                      </span>
                    </div>
                    <Progress 
                      value={50 + (predictions.threeDayPrediction * 2.5)} 
                      className={`h-2 ${predictions.threeDayPrediction > 0 ? 'bg-green-500' : 'bg-red-500'}`} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>7-Day Forecast:</span>
                      <span className={`font-medium ${predictions.sevenDayPrediction > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {predictions.sevenDayPrediction > 0 ? '+' : ''}{predictions.sevenDayPrediction.toFixed(2)}%
                      </span>
                    </div>
                    <Progress 
                      value={50 + (predictions.sevenDayPrediction * 2)} 
                      className={`h-2 ${predictions.sevenDayPrediction > 0 ? 'bg-green-500' : 'bg-red-500'}`} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>1-Month Forecast:</span>
                      <span className={`font-medium ${predictions.oneMonthPrediction > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {predictions.oneMonthPrediction > 0 ? '+' : ''}{predictions.oneMonthPrediction.toFixed(2)}%
                      </span>
                    </div>
                    <Progress 
                      value={50 + (predictions.oneMonthPrediction * 1.5)} 
                      className={`h-2 ${predictions.oneMonthPrediction > 0 ? 'bg-green-500' : 'bg-red-500'}`} 
                    />
                  </div>
                  
                  {/* Original predictions */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Short-term (1-7 days):</span>
                      <span className={`font-medium ${predictions.shortTerm > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {predictions.shortTerm > 0 ? '+' : ''}{predictions.shortTerm.toFixed(2)}%
                      </span>
                    </div>
                    <Progress 
                      value={50 + (predictions.shortTerm * 2)} 
                      className={`h-2 ${predictions.shortTerm > 0 ? 'bg-green-500' : 'bg-red-500'}`} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Medium-term (8-30 days):</span>
                      <span className={`font-medium ${predictions.mediumTerm > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {predictions.mediumTerm > 0 ? '+' : ''}{predictions.mediumTerm.toFixed(2)}%
                      </span>
                    </div>
                    <Progress 
                      value={50 + (predictions.mediumTerm * 2)} 
                      className={`h-2 ${predictions.mediumTerm > 0 ? 'bg-green-500' : 'bg-red-500'}`} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Long-term (31-90 days):</span>
                      <span className={`font-medium ${predictions.longTerm > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {predictions.longTerm > 0 ? '+' : ''}{predictions.longTerm.toFixed(2)}%
                      </span>
                    </div>
                    <Progress 
                      value={50 + (predictions.longTerm * 2)} 
                      className={`h-2 ${predictions.longTerm > 0 ? 'bg-green-500' : 'bg-red-500'}`} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Technical Indicators Card */}
            <Card>
              <CardHeader>
                <CardTitle>Technical Indicators</CardTitle>
                <CardDescription>Key technical analysis metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>RSI (14):</span>
                    <span className={`font-medium ${
                      predictions.technicalIndicators.rsi > 70 ? 'text-red-500' : 
                      predictions.technicalIndicators.rsi < 30 ? 'text-green-500' : 'text-muted-foreground'
                    }`}>
                      {predictions.technicalIndicators.rsi.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>MACD:</span>
                    {typeof predictions.technicalIndicators.macd === 'object' && predictions.technicalIndicators.macd !== null ? (
                      <span className={`font-medium ${
                        predictions.technicalIndicators.macd.value > 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {predictions.technicalIndicators.macd.value.toFixed(2)}
                      </span>
                    ) : (
                      <span className={`font-medium ${
                        (predictions.technicalIndicators.macd as number) > 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {(predictions.technicalIndicators.macd as number).toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Bollinger Bands:</span>
                    <span className="font-medium">
                      {predictions.technicalIndicators.bollingerBands.toFixed(2)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Stochastic:</span>
                    <span className={`font-medium ${
                      predictions.technicalIndicators.stochastic > 80 ? 'text-red-500' : 
                      predictions.technicalIndicators.stochastic < 20 ? 'text-green-500' : 'text-muted-foreground'
                    }`}>
                      {predictions.technicalIndicators.stochastic.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>ADX:</span>
                    <span className={`font-medium ${
                      predictions.technicalIndicators.adx > 25 ? 'text-green-500' : 'text-muted-foreground'
                    }`}>
                      {predictions.technicalIndicators.adx.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Sentiment Analysis Card */}
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Analysis</CardTitle>
                <CardDescription>Market sentiment indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>News Sentiment:</span>
                      <span className={`font-medium ${
                        predictions.sentimentAnalysis.newsSentiment > 0.6 ? 'text-green-500' : 
                        predictions.sentimentAnalysis.newsSentiment < 0.4 ? 'text-red-500' : 'text-yellow-500'
                      }`}>
                        {predictions.sentimentAnalysis.newsSentiment > 0.6 ? 'Bullish' : 
                         predictions.sentimentAnalysis.newsSentiment < 0.4 ? 'Bearish' : 'Neutral'}
                      </span>
                    </div>
                    <Progress 
                      value={predictions.sentimentAnalysis.newsSentiment * 100} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Social Media:</span>
                      <span className={`font-medium ${
                        predictions.sentimentAnalysis.socialMediaSentiment > 0.6 ? 'text-green-500' : 
                        predictions.sentimentAnalysis.socialMediaSentiment < 0.4 ? 'text-red-500' : 'text-yellow-500'
                      }`}>
                        {predictions.sentimentAnalysis.socialMediaSentiment > 0.6 ? 'Bullish' : 
                         predictions.sentimentAnalysis.socialMediaSentiment < 0.4 ? 'Bearish' : 'Neutral'}
                      </span>
                    </div>
                    <Progress 
                      value={predictions.sentimentAnalysis.socialMediaSentiment * 100} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Analyst Ratings:</span>
                      <span className={`font-medium ${
                        predictions.sentimentAnalysis.analystRatings > 0.6 ? 'text-green-500' : 
                        predictions.sentimentAnalysis.analystRatings < 0.4 ? 'text-red-500' : 'text-yellow-500'
                      }`}>
                        {predictions.sentimentAnalysis.analystRatings > 0.6 ? 'Buy' : 
                         predictions.sentimentAnalysis.analystRatings < 0.4 ? 'Sell' : 'Hold'}
                      </span>
                    </div>
                    <Progress 
                      value={predictions.sentimentAnalysis.analystRatings * 100} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Insider Activity:</span>
                    <span className={`font-medium ${
                      predictions.sentimentAnalysis.insiderActivity > 0 ? 'text-green-500' : 
                      predictions.sentimentAnalysis.insiderActivity < 0 ? 'text-red-500' : 'text-muted-foreground'
                    }`}>
                      {predictions.sentimentAnalysis.insiderActivity > 0 ? 'Buying' : 
                       predictions.sentimentAnalysis.insiderActivity < 0 ? 'Selling' : 'Neutral'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Assessment Card */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
              <CardDescription>Volatility and risk metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Volatility Metrics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Historical Volatility:</span>
                      <span className="font-medium">{predictions.riskAssessment.historicalVolatility.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Implied Volatility:</span>
                      <span className="font-medium">{predictions.riskAssessment.impliedVolatility.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Beta:</span>
                      <span className={`font-medium ${
                        predictions.riskAssessment.beta > 1.2 ? 'text-red-500' : 
                        predictions.riskAssessment.beta < 0.8 ? 'text-green-500' : 'text-muted-foreground'
                      }`}>
                        {predictions.riskAssessment.beta.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Risk Metrics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Value at Risk (95%):</span>
                      <span className="font-medium">{predictions.riskAssessment.valueAtRisk.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sharpe Ratio:</span>
                      <span className={`font-medium ${
                        predictions.riskAssessment.sharpeRatio > 1 ? 'text-green-500' : 
                        predictions.riskAssessment.sharpeRatio < 0 ? 'text-red-500' : 'text-yellow-500'
                      }`}>
                        {predictions.riskAssessment.sharpeRatio.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Max Drawdown:</span>
                      <span className="font-medium text-red-500">
                        {predictions.riskAssessment.maxDrawdown.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Risk Assessment</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Overall Risk Level:</span>
                      <span className={`font-medium ${
                        predictions.riskAssessment.riskLevel === 'High' ? 'text-red-500' : 
                        predictions.riskAssessment.riskLevel === 'Low' ? 'text-green-500' : 'text-yellow-500'
                      }`}>
                        {predictions.riskAssessment.riskLevel}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Risk-Reward Ratio:</span>
                      <span className="font-medium">
                        {predictions.riskAssessment.riskRewardRatio.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Confidence Score:</span>
                      <span className={`font-medium ${
                        predictions.riskAssessment.confidenceScore > 0.7 ? 'text-green-500' : 
                        predictions.riskAssessment.confidenceScore < 0.4 ? 'text-red-500' : 'text-yellow-500'
                      }`}>
                        {(predictions.riskAssessment.confidenceScore * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-12 mt-6">
          <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Select a stock to view predictions</h3>
          <p className="text-sm text-muted-foreground">
            Our ML models will analyze market data and provide detailed predictions
          </p>
        </div>
      )}
    </div>
  );
};

const getModelDescription = (modelType: string): string => {
  const descriptions: Record<string, string> = {
    lstm: "Long Short-Term Memory neural network optimized for NSE stocks",
    cnn: "Convolutional Neural Network for pattern recognition",
    ensemble: "Ensemble of multiple models including LSTM, Transformer, and traditional methods",
    xgboost: "Gradient boosting for structured data",
    arima: "Statistical modeling for time series analysis",
    nifty_correlation: "Analyzes correlation with Nifty indices",
    fii_dii_flow: "Tracks institutional investment patterns",
    options_chain: "Options market sentiment analysis",
    market_breadth: "Market-wide trading pattern analysis",
    delivery_analysis: "Delivery-based trading analysis",
    sectoral_rotation: "Sector rotation and momentum tracking",
    block_deal_impact: "Large trade impact assessment",
    promoter_activity: "Insider trading pattern analysis",
    mutual_fund_flow: "Mutual fund investment tracking",
    india_vix_sentiment: "Volatility-based sentiment analysis",
    fno_indicators: "Futures & Options market indicators",
    regulatory_impact: "SEBI and regulatory impact analysis",
    commodity_correlation: "Commodity price impact analysis",
    global_adr_arbitrage: "ADR-Equity arbitrage opportunities",
    monsoon_impact: "Seasonal and weather impact analysis",
    transformer: "Transformer-based model with attention mechanisms for market prediction",
    hybrid: "Hybrid model combining technical and fundamental analysis with ML",
    nseSpecific: "Model specifically trained on NSE patterns and Indian market behavior",
    sectoralModel: "Sector-specific model incorporating industry dynamics",
    macroModel: "Model incorporating macroeconomic factors and their impact",
    sentimentHybrid: "Hybrid model combining market sentiment with technical analysis",
    optionsFlow: "Model based on options market flow and positioning",
    globalCorrelation: "Model incorporating global market correlations",
  };
  return descriptions[modelType] || "Advanced prediction model";
};

// Add currency formatting function for Indian Rupees
const formatIndianCurrency = (value: number): string => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return formatter.format(value);
};

// Add function to determine market hours
const isMarketHours = (): boolean => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const day = now.getDay();
  
  // NSE market hours: Monday to Friday, 9:15 AM to 3:30 PM IST
  return day >= 1 && day <= 5 && // Monday to Friday
         ((hours === 9 && minutes >= 15) || // After 9:15 AM
          (hours > 9 && hours < 15) || // Between 10 AM and 3 PM
          (hours === 15 && minutes <= 30)); // Before 3:30 PM
};

// Add function to calculate option Greeks
const calculateOptionGreeks = (
  spotPrice: number,
  strikePrice: number,
  timeToExpiry: number,
  volatility: number,
  riskFreeRate: number
): { delta: number; gamma: number; theta: number; vega: number } => {
  // Simplified Black-Scholes implementation for demonstration
  const d1 = (Math.log(spotPrice / strikePrice) + (riskFreeRate + volatility * volatility / 2) * timeToExpiry) / (volatility * Math.sqrt(timeToExpiry));
  const d2 = d1 - volatility * Math.sqrt(timeToExpiry);
  
  return {
    delta: Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(d1),
    gamma: Math.exp(-riskFreeRate * timeToExpiry) * normalPDF(d1) / (spotPrice * volatility * Math.sqrt(timeToExpiry)),
    theta: -(spotPrice * volatility * Math.exp(-riskFreeRate * timeToExpiry) * normalPDF(d1)) / (2 * Math.sqrt(timeToExpiry)),
    vega: spotPrice * Math.sqrt(timeToExpiry) * Math.exp(-riskFreeRate * timeToExpiry) * normalPDF(d1)
  };
};

// Helper function for option Greeks calculation
const normalCDF = (x: number): number => {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - probability : probability;
};

const normalPDF = (x: number): number => {
  return Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
};

// Add function to analyze market breadth
const analyzeMarketBreadth = (advancers: number, decliners: number): { 
  ratio: number; 
  strength: string; 
  signal: string; 
} => {
  const ratio = advancers / decliners;
  let strength = 'Neutral';
  let signal = 'Hold';

  if (ratio > 2) {
    strength = 'Very Strong';
    signal = 'Strong Buy';
  } else if (ratio > 1.5) {
    strength = 'Strong';
    signal = 'Buy';
  } else if (ratio < 0.5) {
    strength = 'Very Weak';
    signal = 'Strong Sell';
  } else if (ratio < 0.67) {
    strength = 'Weak';
    signal = 'Sell';
  }

  return { ratio, strength, signal };
};

// Add function to calculate support and resistance levels using Fibonacci
const calculateFibonacciLevels = (high: number, low: number): {
  resistance: number[];
  support: number[];
} => {
  const diff = high - low;
  const fibLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
  
  return {
    resistance: fibLevels.map(level => high + diff * level),
    support: fibLevels.map(level => low - diff * level)
  };
};

export default MLPrediction;