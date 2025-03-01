import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Brain, BarChart2, TrendingUp, AlertTriangle } from "lucide-react";
import axios from 'axios';
import * as tf from '@tensorflow/tfjs';
import { createChart, ColorType } from 'lightweight-charts';

interface StockPrediction {
  symbol: string;
  predictedPrice: number;
  confidence: number;
  trend: 'UP' | 'DOWN' | 'SIDEWAYS';
  supportLevels: number[];
  resistanceLevels: number[];
  technicalIndicators: {
    rsi: number;
    macd: number;
    bollingerBands: {
      upper: number;
      middle: number;
      lower: number;
    };
  };
  fundamentalFactors: {
    peRatio: number;
    marketCap: number;
    volume: number;
  };
}

interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rmse: number;
}

interface MLPredictionProps {
  symbol: string;
  currentPrice: number;
  onPredictionComplete?: (prediction: StockPrediction) => void;
}

export const MLPredictionComponent: React.FC<MLPredictionProps> = ({
  symbol,
  currentPrice,
  onPredictionComplete
}) => {
  const { toast } = useToast();
  const [predictions, setPredictions] = useState<StockPrediction | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics | null>(null);
  const [predictionTimeframe, setPredictionTimeframe] = useState<'1d' | '1w' | '1m'>('1d');
  const [modelType, setModelType] = useState<'LSTM' | 'XGBoost' | 'Ensemble'>('Ensemble');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.8);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Initialize TensorFlow.js model
  const [model, setModel] = useState<tf.LayersModel | null>(null);

  // Effect to fetch data when symbol changes
  useEffect(() => {
    if (symbol) {
      fetchHistoricalData(symbol);
    }
  }, [symbol]);

  // Function to fetch historical data from NSE
  const fetchHistoricalData = async (stockSymbol: string) => {
    try {
      setIsLoading(true);
      // Use NSE API or Yahoo Finance API for real data
      const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${stockSymbol}.NS?range=1y&interval=1d`);
      const data = response.data.chart.result[0];
      
      const formattedData = data.timestamp.map((time: number, index: number) => ({
        time: new Date(time * 1000),
        open: data.indicators.quote[0].open[index],
        high: data.indicators.quote[0].high[index],
        low: data.indicators.quote[0].low[index],
        close: data.indicators.quote[0].close[index],
        volume: data.indicators.quote[0].volume[index]
      }));

      setHistoricalData(formattedData);
      setLastUpdate(new Date());

      // Initialize model with new data
      initializeModel(formattedData);

      return formattedData;
    } catch (error) {
      toast({
        title: "Error Fetching Data",
        description: "Failed to fetch historical data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize model with data
  const initializeModel = async (data: any[]) => {
    try {
      const preprocessedData = preprocessData(data);
      const trainedModel = await createAndTrainModel(preprocessedData);
      setModel(trainedModel);
      
      // Calculate model metrics
      const predictions = trainedModel.predict(preprocessedData.sequences) as tf.Tensor;
      const metrics = calculateModelMetrics(predictions, preprocessedData.targets);
      setModelMetrics(metrics);

      // Make initial prediction
      makePrediction(trainedModel, data);
    } catch (error) {
      console.error('Error initializing model:', error);
      toast({
        title: "Model Error",
        description: "Failed to initialize prediction model.",
        variant: "destructive"
      });
    }
  };

  // Function to make predictions
  const makePrediction = async (trainedModel?: tf.LayersModel, data?: any[]) => {
    const modelToUse = trainedModel || model;
    const dataToUse = data || historicalData;
    
    if (!modelToUse || !dataToUse.length) return;
    
    try {
      setIsLoading(true);
      
      // Get latest data for prediction
      const latestData = dataToUse.slice(-10);
      const normalized = preprocessData(latestData);
      
      // Make prediction
      const prediction = modelToUse.predict(normalized.sequences.slice(-1)) as tf.Tensor;
      const predictedValue = prediction.dataSync()[0];
      
      // Denormalize prediction
      const denormalizedPrediction = predictedValue * (normalized.max - normalized.min) + normalized.min;
      
      // Calculate confidence based on model metrics
      const confidence = calculateConfidence(modelMetrics!, denormalizedPrediction, latestData);
      
      // Calculate technical indicators
      const technicalIndicators = calculateTechnicalIndicators(latestData);
      
      // Determine trend
      const trend = determineTrend(denormalizedPrediction, currentPrice);
      
      // Create prediction result
      const predictionResult: StockPrediction = {
        symbol,
        predictedPrice: denormalizedPrediction,
        confidence,
        trend,
        supportLevels: calculateSupportLevels(latestData),
        resistanceLevels: calculateResistanceLevels(latestData),
        technicalIndicators,
        fundamentalFactors: await fetchFundamentalFactors(symbol)
      };
      
      // Update state and notify
      setPredictions(predictionResult);
      onPredictionComplete?.(predictionResult);
      
    } catch (error) {
      toast({
        title: "Prediction Error",
        description: "Failed to generate prediction. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to update prediction when currentPrice changes
  useEffect(() => {
    if (model && historicalData.length > 0) {
      makePrediction();
    }
  }, [currentPrice]);

  // Effect to create price chart
  useEffect(() => {
    if (!chartRef.current || !predictions || !historicalData.length) return;

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 200,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#999',
      },
      grid: {
        vertLines: { color: '#2B2B2B' },
        horzLines: { color: '#2B2B2B' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const series = chart.addLineSeries({
      color: '#2563EB',
      lineWidth: 2,
    });

    // Add historical data
    const chartData = historicalData.map(d => ({
      time: d.time.getTime() / 1000,
      value: d.close
    }));

    // Add prediction point
    chartData.push({
      time: Date.now() / 1000 + 24 * 60 * 60, // Next day
      value: predictions.predictedPrice
    });

    series.setData(chartData);

    // Add prediction marker
    series.createPriceLine({
      price: predictions.predictedPrice,
      color: predictions.trend === 'UP' ? '#10B981' : '#EF4444',
      lineWidth: 2,
      lineStyle: 2,
      axisLabelVisible: true,
      title: 'Predicted'
    });

    return () => {
      chart.remove();
    };
  }, [predictions, historicalData]);

  // Function to preprocess data for ML model
  const preprocessData = (data: any[]) => {
    // Normalize data
    const closes = data.map(d => d.close);
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const normalized = closes.map(price => (price - min) / (max - min));
    
    // Create sequences for LSTM
    const sequenceLength = 10;
    const sequences = [];
    const targets = [];
    
    for (let i = 0; i < normalized.length - sequenceLength; i++) {
      sequences.push(normalized.slice(i, i + sequenceLength));
      targets.push(normalized[i + sequenceLength]);
    }
    
    return {
      sequences: tf.tensor3d(sequences, [sequences.length, sequenceLength, 1]),
      targets: tf.tensor2d(targets, [targets.length, 1]),
      min,
      max
    };
  };

  // Function to create and train LSTM model
  const createAndTrainModel = async (data: any) => {
    const model = tf.sequential();
    
    model.add(tf.layers.lstm({
      units: 50,
      returnSequences: true,
      inputShape: [10, 1]
    }));
    
    model.add(tf.layers.dropout({ rate: 0.2 }));
    
    model.add(tf.layers.lstm({
      units: 30,
      returnSequences: false
    }));
    
    model.add(tf.layers.dense({ units: 1 }));
    
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['accuracy']
    });
    
    // Train model
    await model.fit(data.sequences, data.targets, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.1,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch + 1}: loss = ${logs?.loss.toFixed(4)}`);
        }
      }
    });
    
    return model;
  };

  // Helper functions for technical analysis
  const calculateTechnicalIndicators = (data: any[]) => {
    // Calculate RSI
    const rsi = calculateRSI(data);
    
    // Calculate MACD
    const macd = calculateMACD(data);
    
    // Calculate Bollinger Bands
    const bollingerBands = calculateBollingerBands(data);
    
    return {
      rsi,
      macd,
      bollingerBands
    };
  };

  const calculateRSI = (data: any[], period = 14) => {
    const closes = data.map(d => d.close);
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i < period; i++) {
      const difference = closes[i] - closes[i - 1];
      if (difference >= 0) {
        gains += difference;
      } else {
        losses -= difference;
      }
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  };

  const calculateMACD = (data: any[]) => {
    const closes = data.map(d => d.close);
    const ema12 = calculateEMA(closes, 12);
    const ema26 = calculateEMA(closes, 26);
    return ema12 - ema26;
  };

  const calculateEMA = (data: number[], period: number) => {
    const k = 2 / (period + 1);
    let ema = data[0];
    
    for (let i = 1; i < data.length; i++) {
      ema = data[i] * k + ema * (1 - k);
    }
    
    return ema;
  };

  const calculateBollingerBands = (data: any[], period = 20) => {
    const closes = data.map(d => d.close);
    const sma = closes.slice(-period).reduce((a, b) => a + b) / period;
    const stdDev = Math.sqrt(
      closes.slice(-period)
        .reduce((a, b) => a + Math.pow(b - sma, 2), 0) / period
    );
    
    return {
      upper: sma + stdDev * 2,
      middle: sma,
      lower: sma - stdDev * 2
    };
  };

  const calculateSupportLevels = (data: any[]) => {
    const lows = data.map(d => d.low);
    return findKeyLevels(lows, 'support');
  };

  const calculateResistanceLevels = (data: any[]) => {
    const highs = data.map(d => d.high);
    return findKeyLevels(highs, 'resistance');
  };

  const findKeyLevels = (prices: number[], type: 'support' | 'resistance') => {
    const levels: number[] = [];
    const threshold = 0.02; // 2% threshold
    
    for (let i = 1; i < prices.length - 1; i++) {
      if (type === 'support' && prices[i] < prices[i - 1] && prices[i] < prices[i + 1]) {
        levels.push(prices[i]);
      } else if (type === 'resistance' && prices[i] > prices[i - 1] && prices[i] > prices[i + 1]) {
        levels.push(prices[i]);
      }
    }
    
    return levels
      .filter((level, index, self) => 
        self.findIndex(l => Math.abs(l - level) / level < threshold) === index
      )
      .slice(0, 3); // Return top 3 levels
  };

  const calculateConfidence = (metrics: ModelMetrics, prediction: number, recentData: any[]) => {
    // Combine multiple factors for confidence calculation
    const accuracyWeight = 0.4;
    const volatilityWeight = 0.3;
    const trendStrengthWeight = 0.3;
    
    // Model accuracy component
    const accuracyScore = metrics.accuracy;
    
    // Volatility component
    const volatility = calculateVolatility(recentData);
    const volatilityScore = Math.max(0, 1 - volatility);
    
    // Trend strength component
    const trendStrength = calculateTrendStrength(recentData);
    
    return (
      accuracyScore * accuracyWeight +
      volatilityScore * volatilityWeight +
      trendStrength * trendStrengthWeight
    );
  };

  const calculateVolatility = (data: any[]) => {
    const returns = data.slice(1).map((d, i) => 
      (d.close - data[i].close) / data[i].close
    );
    
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
  };

  const calculateTrendStrength = (data: any[]) => {
    const closes = data.map(d => d.close);
    const sma20 = calculateSMA(closes, 20);
    const sma50 = calculateSMA(closes, 50);
    
    return Math.min(1, Math.max(0, Math.abs(sma20 - sma50) / sma50));
  };

  const calculateSMA = (data: number[], period: number) => {
    return data.slice(-period).reduce((a, b) => a + b) / period;
  };

  const determineTrend = (prediction: number, currentPrice: number) => {
    const threshold = 0.01; // 1% threshold
    const percentChange = (prediction - currentPrice) / currentPrice;
    
    if (percentChange > threshold) return 'UP';
    if (percentChange < -threshold) return 'DOWN';
    return 'SIDEWAYS';
  };

  const fetchFundamentalFactors = async (symbol: string) => {
    // In a real implementation, fetch this data from a financial API
    return {
      peRatio: 15 + Math.random() * 10,
      marketCap: 1000000000 + Math.random() * 1000000000,
      volume: 1000000 + Math.random() * 1000000
    };
  };

  const calculateModelMetrics = (predictions: tf.Tensor, actual: tf.Tensor) => {
    const predArray = predictions.dataSync();
    const actualArray = actual.dataSync();
    
    // Calculate various metrics
    const mse = tf.metrics.meanSquaredError(actual, predictions).dataSync()[0];
    const rmse = Math.sqrt(mse);
    
    // Calculate classification metrics (for trend direction)
    let correct = 0;
    let total = predArray.length;
    
    for (let i = 1; i < total; i++) {
      const predDirection = predArray[i] > predArray[i - 1];
      const actualDirection = actualArray[i] > actualArray[i - 1];
      if (predDirection === actualDirection) correct++;
    }
    
    const accuracy = correct / (total - 1);
    
    return {
      accuracy,
      precision: accuracy, // Simplified
      recall: accuracy, // Simplified
      f1Score: accuracy, // Simplified
      rmse
    };
  };

  // Updated render function
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Price Prediction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div>
                <Label>Timeframe</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={predictionTimeframe}
                  onChange={(e) => setPredictionTimeframe(e.target.value as any)}
                >
                  <option value="1d">1 Day</option>
                  <option value="1w">1 Week</option>
                  <option value="1m">1 Month</option>
                </select>
              </div>
              <div className="flex-1">
                <Label>Model Type</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value as any)}
                >
                  <option value="LSTM">LSTM Neural Network</option>
                  <option value="XGBoost">XGBoost</option>
                  <option value="Ensemble">Ensemble Model</option>
                </select>
              </div>
            </div>

            {/* Chart */}
            <div ref={chartRef} className="w-full h-[200px]" />
            
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            
            {predictions && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Predicted Price</div>
                  <div className="text-2xl font-bold">
                    ₹{predictions.predictedPrice.toFixed(2)}
                  </div>
                  <div className={`text-sm ${
                    predictions.trend === 'UP' ? 'text-green-500' :
                    predictions.trend === 'DOWN' ? 'text-red-500' :
                    'text-yellow-500'
                  }`}>
                    {predictions.trend} ({(predictions.confidence * 100).toFixed(1)}% confidence)
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium mb-2">Technical Signals</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>RSI</span>
                      <span className={`${
                        predictions.technicalIndicators.rsi > 70 ? 'text-red-500' :
                        predictions.technicalIndicators.rsi < 30 ? 'text-green-500' :
                        'text-muted-foreground'
                      }`}>
                        {predictions.technicalIndicators.rsi.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>MACD</span>
                      <span className={predictions.technicalIndicators.macd >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {predictions.technicalIndicators.macd.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {predictions?.confidence < confidenceThreshold && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <div className="text-sm">
                  Low confidence prediction. Consider additional analysis.
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MLPredictionComponent; 