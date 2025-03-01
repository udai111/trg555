interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface AdvancedIndicators {
  pivotPoints: {
    r3: number;
    r2: number;
    r1: number;
    pivot: number;
    s1: number;
    s2: number;
    s3: number;
  };
  fibonacci: {
    retracement: number[];
    extension: number[];
    fan: number[];
  };
  ichimoku: {
    conversionLine: number;
    baseLine: number;
    leadingSpanA: number;
    leadingSpanB: number;
    laggingSpan: number;
  };
}

export const calculateIndicators = (data: HistoricalData[]): AdvancedIndicators => {
  // Calculate pivot points
  const pivotPoints = calculatePivotPoints(data);
  
  // Calculate Fibonacci levels
  const fibonacci = calculateFibonacci(data);
  
  // Calculate Ichimoku Cloud
  const ichimoku = calculateIchimoku(data);
  
  return {
    pivotPoints,
    fibonacci,
    ichimoku
  };
};

const calculatePivotPoints = (data: HistoricalData[]) => {
  const lastDay = data[data.length - 1];
  const high = lastDay.high;
  const low = lastDay.low;
  const close = lastDay.close;
  
  const pivot = (high + low + close) / 3;
  const r1 = (2 * pivot) - low;
  const r2 = pivot + (high - low);
  const r3 = high + 2 * (pivot - low);
  const s1 = (2 * pivot) - high;
  const s2 = pivot - (high - low);
  const s3 = low - 2 * (high - pivot);
  
  return { r3, r2, r1, pivot, s1, s2, s3 };
};

const calculateFibonacci = (data: HistoricalData[]) => {
  const high = Math.max(...data.map(d => d.high));
  const low = Math.min(...data.map(d => d.low));
  const diff = high - low;
  
  const retracement = [
    high,
    high - diff * 0.236,
    high - diff * 0.382,
    high - diff * 0.5,
    high - diff * 0.618,
    high - diff * 0.786,
    low
  ];
  
  const extension = [
    low - diff * 0.618,
    low - diff * 1,
    low - diff * 1.618,
    low - diff * 2.618
  ];
  
  const fan = [
    high - diff * 0.382,
    high - diff * 0.5,
    high - diff * 0.618
  ];
  
  return { retracement, extension, fan };
};

const calculateIchimoku = (data: HistoricalData[]) => {
  // Conversion Line (Tenkan-sen) - 9-period high + low / 2
  const conversionPeriod = 9;
  const conversionLine = calculatePeriodHL(data.slice(-conversionPeriod));
  
  // Base Line (Kijun-sen) - 26-period high + low / 2
  const basePeriod = 26;
  const baseLine = calculatePeriodHL(data.slice(-basePeriod));
  
  // Leading Span A (Senkou Span A) - Average of conversion & base lines
  const leadingSpanA = (conversionLine + baseLine) / 2;
  
  // Leading Span B (Senkou Span B) - 52-period high + low / 2
  const leadingPeriod = 52;
  const leadingSpanB = calculatePeriodHL(data.slice(-leadingPeriod));
  
  // Lagging Span (Chikou Span) - Current closing price plotted 26 periods behind
  const laggingSpan = data[data.length - 1].close;
  
  return {
    conversionLine,
    baseLine,
    leadingSpanA,
    leadingSpanB,
    laggingSpan
  };
};

const calculatePeriodHL = (periodData: HistoricalData[]) => {
  const high = Math.max(...periodData.map(d => d.high));
  const low = Math.min(...periodData.map(d => d.low));
  return (high + low) / 2;
};

// Additional indicator calculations
export const calculateRSI = (data: HistoricalData[], period: number = 14): number[] => {
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    gains.push(Math.max(0, change));
    losses.push(Math.max(0, -change));
  }
  
  // Calculate initial averages
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  // Calculate RSI values
  for (let i = period; i < data.length; i++) {
    avgGain = ((avgGain * (period - 1)) + gains[i - 1]) / period;
    avgLoss = ((avgLoss * (period - 1)) + losses[i - 1]) / period;
    
    const rs = avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));
  }
  
  return rsi;
};

export const calculateMACD = (data: HistoricalData[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) => {
  const closes = data.map(d => d.close);
  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);
  
  const macdLine = fastEMA.map((fast, i) => fast - slowEMA[i]);
  const signalLine = calculateEMA(macdLine, signalPeriod);
  const histogram = macdLine.map((macd, i) => macd - signalLine[i]);
  
  return { macdLine, signalLine, histogram };
};

const calculateEMA = (data: number[], period: number): number[] => {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  
  // Start with SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
  }
  ema.push(sum / period);
  
  // Calculate EMA
  for (let i = period; i < data.length; i++) {
    ema.push((data[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1]);
  }
  
  return ema;
};

export const calculateBollingerBands = (data: HistoricalData[], period: number = 20, stdDev: number = 2) => {
  const closes = data.map(d => d.close);
  const sma = calculateSMA(closes, period);
  const bands = sma.map((middle, i) => {
    const slice = closes.slice(i - period + 1, i + 1);
    const std = calculateStandardDeviation(slice);
    return {
      upper: middle + (std * stdDev),
      middle,
      lower: middle - (std * stdDev)
    };
  });
  
  return bands;
};

const calculateSMA = (data: number[], period: number): number[] => {
  const sma: number[] = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }
  return sma;
};

const calculateStandardDeviation = (data: number[]): number => {
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const squareDiffs = data.map(value => Math.pow(value - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / data.length;
  return Math.sqrt(avgSquareDiff);
}; 