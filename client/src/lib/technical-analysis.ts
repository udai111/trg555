import { DateTime } from 'luxon';
import * as tf from '@tensorflow/tfjs';
import { SMA, RSI, MACD, BollingerBands } from 'trading-signals';

// Initialize TensorFlow backend with fallback
async function setupTensorFlowBackend() {
  try {
    const webglVersion = tf.ENV.get('WEBGL_VERSION');
    if (!webglVersion) {
      console.log('WebGL not available, falling back to CPU backend');
      await tf.setBackend('cpu');
      return 'cpu';
    }
    await tf.setBackend('webgl');
    return 'webgl';
  } catch (error) {
    console.warn('Error initializing WebGL backend:', error);
    await tf.setBackend('cpu');
    return 'cpu';
  }
}

export interface ScreenerCriteria {
  minVolume?: number;
  minPrice?: number;
  maxPrice?: number;
  rsiThreshold?: number;
  volumeSpike?: number;
  priceChange?: number;
  timeframe: string;
}

export interface StockData {
  symbol: string;
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
  timestamp: number[];
}

export class TechnicalAnalysis {
  private static instance: TechnicalAnalysis;
  private mlModel: tf.LayersModel | null = null;
  private backendType: string = 'cpu';

  private constructor() {
    this.initializeMLModel();
  }

  static getInstance(): TechnicalAnalysis {
    if (!TechnicalAnalysis.instance) {
      TechnicalAnalysis.instance = new TechnicalAnalysis();
    }
    return TechnicalAnalysis.instance;
  }

  private async initializeMLModel() {
    try {
      // Setup TensorFlow backend with fallback
      this.backendType = await setupTensorFlowBackend();

      const model = tf.sequential();
      model.add(tf.layers.lstm({
        units: 50,
        returnSequences: true,
        inputShape: [30, 5]
      }));
      model.add(tf.layers.dropout({ rate: 0.2 }));
      model.add(tf.layers.lstm({ units: 50, returnSequences: false }));
      model.add(tf.layers.dense({ units: 1 }));

      model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError'
      });

      this.mlModel = model;
      console.log(`ML model initialized using ${this.backendType} backend`);
    } catch (error) {
      console.error('Failed to initialize ML model:', error);
      throw new Error('ML model initialization failed');
    }
  }

  async calculateIndicators(data: StockData) {
    const rsi = new RSI(14, { initValue: data.close[0] });
    const sma20 = new SMA(20, { initValue: data.close[0] });
    const sma50 = new SMA(50, { initValue: data.close[0] });
    const sma200 = new SMA(200, { initValue: data.close[0] });
    const bb = new BollingerBands(20, { initValue: data.close[0] });
    const macd = new MACD({ 
      indicator: SMA,
      longInterval: 26,
      shortInterval: 12,
      signalInterval: 9,
      initValue: data.close[0]
    });

    const indicators = {
      rsi: [] as number[],
      sma20: [] as number[],
      sma50: [] as number[],
      sma200: [] as number[],
      bb: [] as any[],
      macd: [] as any[]
    };

    data.close.forEach((price) => {
      rsi.update(price);
      sma20.update(price);
      sma50.update(price);
      sma200.update(price);
      bb.update(price);
      macd.update(price);

      if (rsi.isStable) indicators.rsi.push(Number(rsi.getResult().toString()));
      if (sma20.isStable) indicators.sma20.push(Number(sma20.getResult().toString()));
      if (sma50.isStable) indicators.sma50.push(Number(sma50.getResult().toString()));
      if (sma200.isStable) indicators.sma200.push(Number(sma200.getResult().toString()));

      if (bb.isStable) {
        const bbResult = bb.getResult();
        indicators.bb.push({
          upper: Number(bbResult.upper.toString()),
          middle: Number(bbResult.middle.toString()),
          lower: Number(bbResult.lower.toString())
        });
      }

      if (macd.isStable) {
        const macdResult = macd.getResult();
        indicators.macd.push({
          macd: Number(macdResult.macd.toString()),
          signal: Number(macdResult.signal.toString()),
          histogram: Number(macdResult.histogram.toString())
        });
      }
    });

    return indicators;
  }

  async calculateVolumeProfile(data: StockData) {
    const volumeByPrice: { [key: number]: number } = {};
    const priceIncrement = 0.1;

    for (let i = 0; i < data.close.length; i++) {
      const price = Math.round(data.close[i] / priceIncrement) * priceIncrement;
      volumeByPrice[price] = (volumeByPrice[price] || 0) + data.volume[i];
    }

    return Object.entries(volumeByPrice)
      .map(([price, volume]) => ({ price: parseFloat(price), volume }))
      .sort((a, b) => a.price - b.price);
  }

  async detectPatterns(data: StockData) {
    const patterns = [];
    const lastIndex = data.close.length - 1;

    // Doji Pattern
    const dojiThreshold = 0.1;
    if (Math.abs(data.close[lastIndex] - data.open[lastIndex]) / (data.high[lastIndex] - data.low[lastIndex]) < dojiThreshold) {
      patterns.push({
        name: 'Doji',
        probability: 0.8,
        significance: 'high'
      });
    }

    // Hammer Pattern
    const bodySize = Math.abs(data.close[lastIndex] - data.open[lastIndex]);
    const lowerWick = Math.min(data.open[lastIndex], data.close[lastIndex]) - data.low[lastIndex];
    const upperWick = data.high[lastIndex] - Math.max(data.open[lastIndex], data.close[lastIndex]);

    if (lowerWick > 2 * bodySize && upperWick < 0.1 * bodySize) {
      patterns.push({
        name: 'Hammer',
        probability: 0.75,
        significance: 'high'
      });
    }

    return patterns;
  }

  async calculateMarketBreadth(symbols: string[]) {
    let advancers = 0;
    let decliners = 0;
    let unchanged = 0;

    symbols.forEach(() => {
      const random = Math.random();
      if (random > 0.6) advancers++;
      else if (random < 0.4) decliners++;
      else unchanged++;
    });

    return {
      advanceDeclineRatio: advancers / (decliners || 1),
      advancers,
      decliners,
      unchanged,
      total: symbols.length
    };
  }

  async predictProbability(data: StockData): Promise<number> {
    if (!this.mlModel) return 0;

    try {
      const inputFeatures = tf.tensor3d([this.prepareFeatures(data)]);
      const prediction = this.mlModel.predict(inputFeatures) as tf.Tensor;
      const probability = (await prediction.data())[0];

      inputFeatures.dispose();
      prediction.dispose();

      return Math.min(Math.max(probability, 0), 1);
    } catch (error) {
      console.error('Prediction error:', error);
      return 0;
    }
  }

  private prepareFeatures(data: StockData) {
    const features = [];
    const windowSize = 30;

    for (let i = Math.max(0, data.close.length - windowSize); i < data.close.length; i++) {
      features.push([
        data.open[i],
        data.high[i],
        data.low[i],
        data.close[i],
        data.volume[i]
      ]);
    }

    while (features.length < windowSize) {
      features.unshift([0, 0, 0, 0, 0]);
    }

    return features;
  }

  async screenStocks(symbols: string[], criteria: ScreenerCriteria) {
    const results = [];

    for (const symbol of symbols) {
      try {
        const stockData = await this.fetchStockData(symbol, criteria.timeframe);
        const indicators = await this.calculateIndicators(stockData);
        const patterns = await this.detectPatterns(stockData);
        const probability = await this.predictProbability(stockData);

        if (this.meetsCriteria(stockData, indicators, criteria)) {
          results.push({
            symbol,
            probability,
            patterns,
            indicators: {
              rsi: indicators.rsi[indicators.rsi.length - 1],
              macd: indicators.macd[indicators.macd.length - 1],
              bollingerBands: indicators.bb[indicators.bb.length - 1]
            },
            lastPrice: stockData.close[stockData.close.length - 1],
            volume: stockData.volume[stockData.volume.length - 1]
          });
        }
      } catch (error) {
        console.error(`Error screening ${symbol}:`, error);
      }
    }

    return results;
  }

  private async fetchStockData(symbol: string, timeframe: string): Promise<StockData> {
    const endDate = DateTime.now();
    const startDate = endDate.minus({ days: 30 });

    const data: StockData = {
      symbol,
      open: [],
      high: [],
      low: [],
      close: [],
      volume: [],
      timestamp: []
    };

    let currentDate = startDate;
    let basePrice = Math.random() * 1000;

    while (currentDate <= endDate) {
      if (currentDate.weekday <= 5) {
        const volatility = basePrice * 0.02;
        const open = basePrice + (Math.random() - 0.5) * volatility;
        const close = open + (Math.random() - 0.5) * volatility;
        const high = Math.max(open, close) + Math.random() * volatility;
        const low = Math.min(open, close) - Math.random() * volatility;

        data.open.push(open);
        data.high.push(high);
        data.low.push(low);
        data.close.push(close);
        data.volume.push(Math.floor(Math.random() * 1000000));
        data.timestamp.push(currentDate.toMillis());

        basePrice = close;
      }
      currentDate = currentDate.plus({ days: 1 });
    }

    return data;
  }

  private meetsCriteria(
    data: StockData,
    indicators: any,
    criteria: ScreenerCriteria
  ): boolean {
    const lastIndex = data.close.length - 1;
    const lastPrice = data.close[lastIndex];
    const lastVolume = data.volume[lastIndex];
    const avgVolume = data.volume.slice(-5).reduce((a, b) => a + b, 0) / 5;

    return (
      (!criteria.minPrice || lastPrice >= criteria.minPrice) &&
      (!criteria.maxPrice || lastPrice <= criteria.maxPrice) &&
      (!criteria.minVolume || lastVolume >= criteria.minVolume) &&
      (!criteria.volumeSpike || (lastVolume / avgVolume) >= criteria.volumeSpike) &&
      (!criteria.rsiThreshold || indicators.rsi[lastIndex] <= criteria.rsiThreshold)
    );
  }
  getBackendType(): string {
    return this.backendType;
  }
}

export const technicalAnalysis = TechnicalAnalysis.getInstance();