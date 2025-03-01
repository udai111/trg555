import axios from 'axios';

interface YahooFinanceQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketVolume: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketHigh: number;
  regularMarketLow: number;
  regularMarketOpen: number;
  regularMarketPreviousClose: number;
}

interface YahooFinanceHistoricalData {
  timestamp: number[];
  close: number[];
  volume: number[];
  open: number[];
  high: number[];
  low: number[];
}

interface TechnicalIndicators {
  rsi: number[];
  macd: {
    macdLine: number[];
    signalLine: number[];
    histogram: number[];
  };
  bollingerBands: {
    upper: number[];
    middle: number[];
    lower: number[];
  };
  volume: number[];
}

const NSE_SYMBOLS = [
  'RELIANCE.NS',
  'TCS.NS',
  'HDFCBANK.NS',
  'INFY.NS',
  'ICICIBANK.NS',
  'HINDUNILVR.NS',
  'HDFC.NS',
  'SBIN.NS',
  'BHARTIARTL.NS',
  'KOTAKBANK.NS',
  'TATAMOTORS.NS',
  'WIPRO.NS',
  'AXISBANK.NS',
  'MARUTI.NS',
  'SUNPHARMA.NS',
  'BAJFINANCE.NS',
  'ASIANPAINT.NS',
  'HCLTECH.NS',
  'ULTRACEMCO.NS',
  'TITAN.NS',
  'ADANIPORTS.NS',
  'NTPC.NS',
  'POWERGRID.NS',
  'ONGC.NS',
  'GRASIM.NS',
  'INDUSINDBK.NS',
  'DRREDDY.NS',
  'NESTLEIND.NS',
  'TATASTEEL.NS',
  'JSWSTEEL.NS'
];

export const API_BASE_URL = 'http://localhost:5051/api'; // Updated port to match server configuration

export const getAvailableSymbols = () => NSE_SYMBOLS;

export const fetchQuote = async (symbol: string): Promise<YahooFinanceQuote> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/quote/${symbol}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching quote:', error);
    // Return simulated data on error
    return {
      symbol,
      regularMarketPrice: 100 + Math.random() * 10,
      regularMarketVolume: Math.floor(Math.random() * 1000000),
      regularMarketChange: Math.random() * 2 - 1,
      regularMarketChangePercent: Math.random() * 2 - 1,
      regularMarketHigh: 105 + Math.random() * 10,
      regularMarketLow: 95 + Math.random() * 10,
      regularMarketOpen: 100 + Math.random() * 10,
      regularMarketPreviousClose: 100 + Math.random() * 10
    };
  }
};

export const fetchHistoricalData = async (
  symbol: string,
  interval: '1m' | '5m' | '15m' | '1h' = '1m',
  range: '1d' | '5d' | '1mo' = '1d'
): Promise<YahooFinanceHistoricalData> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/historical/${symbol}`, {
      params: { interval, range }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    // Return simulated data on error
    const dataPoints = 100;
    const basePrice = 100;
    const timestamps = Array.from({ length: dataPoints }, (_, i) => 
      Date.now() - (dataPoints - i) * 60000
    );
    const prices = Array.from({ length: dataPoints }, (_, i) => 
      basePrice + Math.sin(i / 10) * 5 + Math.random() * 2
    );
    
    return {
      timestamp: timestamps,
      close: prices,
      volume: Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 1000000)),
      open: prices.map(p => p + Math.random() * 2 - 1),
      high: prices.map(p => p + Math.random() * 2),
      low: prices.map(p => p - Math.random() * 2)
    };
  }
};

export const fetchMarketDepth = async (symbol: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/market-depth/${symbol}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching market depth:', error);
    // Return simulated market depth
    const price = 100 + Math.random() * 10;
    const spread = price * 0.002;
    
    const bids = Array.from({ length: 10 }, (_, i) => ({
      price: parseFloat((price - spread * (i + 1)).toFixed(2)),
      size: Math.round(Math.random() * 1000) * (10 - i),
      total: 0,
      percent: 0
    }));
    
    const asks = Array.from({ length: 10 }, (_, i) => ({
      price: parseFloat((price + spread * (i + 1)).toFixed(2)),
      size: Math.round(Math.random() * 1000) * (10 - i),
      total: 0,
      percent: 0
    }));
    
    let bidTotal = 0;
    let askTotal = 0;
    
    bids.forEach(bid => {
      bidTotal += bid.size;
      bid.total = bidTotal;
    });
    
    asks.forEach(ask => {
      askTotal += ask.size;
      ask.total = askTotal;
    });
    
    const maxTotal = Math.max(bidTotal, askTotal);
    bids.forEach(bid => bid.percent = parseFloat(((bid.total / maxTotal) * 100).toFixed(2)));
    asks.forEach(ask => ask.percent = parseFloat(((ask.total / maxTotal) * 100).toFixed(2)));
    
    return { bids, asks };
  }
};

export const calculateTechnicalIndicators = (historicalData: YahooFinanceHistoricalData): TechnicalIndicators => {
  const prices = historicalData.close;
  
  // Calculate RSI (14 periods)
  const rsi = calculateRSI(prices, 14);
  
  // Calculate MACD (12, 26, 9)
  const macd = calculateMACD(prices);
  
  // Calculate Bollinger Bands (20 periods, 2 standard deviations)
  const bollingerBands = calculateBollingerBands(prices);

  return {
    rsi,
    macd,
    bollingerBands,
    volume: historicalData.volume
  };
};

function calculateRSI(prices: number[], periods: number = 14): number[] {
  const rsi: number[] = [];
  let gains: number[] = [];
  let losses: number[] = [];

  for (let i = 1; i < prices.length; i++) {
    const difference = prices[i] - prices[i - 1];
    gains.push(Math.max(0, difference));
    losses.push(Math.max(0, -difference));
    
    if (i >= periods) {
      const avgGain = gains.slice(-periods).reduce((a, b) => a + b) / periods;
      const avgLoss = losses.slice(-periods).reduce((a, b) => a + b) / periods;
      const rs = avgGain / (avgLoss || 1);
      rsi.push(100 - (100 / (1 + rs)));
    } else {
      rsi.push(50); // Default value for initial periods
    }
  }
  
  return rsi;
}

function calculateMACD(prices: number[]): { macdLine: number[]; signalLine: number[]; histogram: number[] } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const signalLine = calculateEMA(macdLine, 9);
  const histogram = macdLine.map((v, i) => v - signalLine[i]);

  return { macdLine, signalLine, histogram };
}

function calculateEMA(prices: number[], periods: number): number[] {
  const ema: number[] = [prices[0]];
  const multiplier = 2 / (periods + 1);

  for (let i = 1; i < prices.length; i++) {
    ema.push(
      (prices[i] - ema[i - 1]) * multiplier + ema[i - 1]
    );
  }

  return ema;
}

function calculateBollingerBands(prices: number[], periods: number = 20, stdDev: number = 2): {
  upper: number[];
  middle: number[];
  lower: number[];
} {
  const bands = {
    upper: [],
    middle: [],
    lower: []
  };

  for (let i = periods - 1; i < prices.length; i++) {
    const slice = prices.slice(i - periods + 1, i + 1);
    const sma = slice.reduce((a, b) => a + b) / periods;
    const std = Math.sqrt(
      slice.reduce((a, b) => a + Math.pow(b - sma, 2), 0) / periods
    );

    bands.middle.push(sma);
    bands.upper.push(sma + stdDev * std);
    bands.lower.push(sma - stdDev * std);
  }

  // Fill initial values
  const padding = Array(periods - 1).fill(null);
  bands.upper = [...padding, ...bands.upper];
  bands.middle = [...padding, ...bands.middle];
  bands.lower = [...padding, ...bands.lower];

  return bands;
}

export const fetchMarketSentiment = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/market-sentiment`);
    return response.data;
  } catch (error) {
    console.error('Error fetching market sentiment:', error);
    // Return simulated market sentiment data
    const stockMovements = NSE_SYMBOLS.map(symbol => ({
      symbol: symbol.replace('.NS', ''),
      price: 100 + Math.random() * 100,
      change: Math.random() * 4 - 2 // Random change between -2% and +2%
    }));

    const advancers = stockMovements.filter(stock => stock.change > 0).length;
    const decliners = stockMovements.filter(stock => stock.change < 0).length;
    const unchanged = stockMovements.length - advancers - decliners;

    return {
      overall: advancers > decliners ? "bullish" : "bearish",
      indicators: {
        advanceDeclineRatio: parseFloat((advancers / (decliners || 1)).toFixed(2)),
        marketBreadth: parseFloat(((advancers - decliners) / stockMovements.length).toFixed(2)),
        volatilityIndex: parseFloat((15 + Math.random() * 10).toFixed(2)), // VIX between 15-25
        tradingVolume: Math.floor(Math.random() * 1000000000), // Random volume in billions
      },
      sectorSentiment: {
        Technology: Math.random() > 0.5 ? "bullish" : "bearish",
        Banking: Math.random() > 0.5 ? "bullish" : "bearish",
        Energy: Math.random() > 0.5 ? "bullish" : "bearish",
        Consumer: Math.random() > 0.5 ? "bullish" : "bearish"
      },
      marketStats: {
        advancers,
        decliners,
        unchanged,
        totalVolume: Math.floor(Math.random() * 10000000000),
        averageVolume: Math.floor(Math.random() * 8000000000)
      }
    };
  }
};

export const fetchSectorData = async (sector: string): Promise<any> => {
  try {
    // This is a mock implementation since Yahoo Finance doesn't directly provide sector data
    // In a real implementation, you would filter stocks by sector and aggregate their data
    const sectorMap: Record<string, string[]> = {
      'Technology': ['TCS.NS', 'INFY.NS', 'WIPRO.NS', 'HCLTECH.NS', 'TECHM.NS'],
      'Banking': ['HDFCBANK.NS', 'ICICIBANK.NS', 'SBIN.NS', 'KOTAKBANK.NS', 'AXISBANK.NS'],
      'Energy': ['RELIANCE.NS', 'ONGC.NS', 'POWERGRID.NS', 'NTPC.NS', 'IOC.NS'],
      'Automotive': ['TATAMOTORS.NS', 'MARUTI.NS', 'M&M.NS', 'HEROMOTOCO.NS', 'BAJAJ-AUTO.NS'],
      'Pharma': ['SUNPHARMA.NS', 'DRREDDY.NS', 'CIPLA.NS', 'DIVISLAB.NS', 'BIOCON.NS']
    };
    
    const symbols = sectorMap[sector] || [];
    if (symbols.length === 0) {
      throw new Error(`No stocks found for sector: ${sector}`);
    }
    
    // Fetch data for all symbols in the sector
    const quotes = await Promise.all(symbols.map(symbol => fetchQuote(symbol)));
    
    // Calculate sector performance metrics
    const sectorPerformance = quotes.reduce((sum, quote) => sum + quote.regularMarketChangePercent, 0) / quotes.length;
    const topPerformer = quotes.reduce((best, quote) => 
      quote.regularMarketChangePercent > best.regularMarketChangePercent ? quote : best
    );
    
    return {
      sector,
      performance: sectorPerformance,
      topPerformer: topPerformer.symbol.replace('.NS', ''),
      stocks: quotes.map(quote => ({
        symbol: quote.symbol.replace('.NS', ''),
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent
      }))
    };
  } catch (error) {
    console.error('Error fetching sector data:', error);
    throw error;
  }
};

export const fetchAdvancedTechnicalIndicators = async (symbol: string): Promise<any> => {
  try {
    // Fetch historical data to calculate advanced indicators
    const historicalData = await fetchHistoricalData(symbol, '1h', '1mo');
    const prices = historicalData.close;
    
    // Calculate advanced indicators
    return {
      adx: calculateADX(historicalData),
      supertrend: calculateSupertrend(historicalData),
      vwap: calculateVWAP(historicalData),
      ichimoku: calculateIchimoku(prices),
      fibonacciLevels: calculateFibonacciLevels(
        Math.max(...historicalData.high), 
        Math.min(...historicalData.low)
      )
    };
  } catch (error) {
    console.error('Error fetching advanced technical indicators:', error);
    throw error;
  }
};

// Calculate Average Directional Index (ADX)
function calculateADX(data: YahooFinanceHistoricalData, period: number = 14): number {
  // This is a simplified implementation
  // In a real implementation, you would calculate +DI, -DI, and then ADX
  const high = data.high;
  const low = data.low;
  const close = data.close;
  
  // Simplified calculation - in reality this is more complex
  const trueRanges = [];
  for (let i = 1; i < close.length; i++) {
    const tr = Math.max(
      high[i] - low[i],
      Math.abs(high[i] - close[i-1]),
      Math.abs(low[i] - close[i-1])
    );
    trueRanges.push(tr);
  }
  
  // Calculate average true range
  const atr = trueRanges.slice(-period).reduce((sum, tr) => sum + tr, 0) / period;
  
  // Simplified ADX calculation
  return Math.min(100, Math.max(0, 50 + (atr / (close[close.length-1] * 0.02)) * 50));
}

// Calculate Supertrend
function calculateSupertrend(data: YahooFinanceHistoricalData, period: number = 10, multiplier: number = 3): number {
  const high = data.high;
  const low = data.low;
  const close = data.close;
  
  // Simplified calculation
  const lastPrice = close[close.length - 1];
  const atr = calculateATR(data, period);
  
  const upperBand = lastPrice + (multiplier * atr);
  const lowerBand = lastPrice - (multiplier * atr);
  
  // Determine if we're in uptrend or downtrend
  const isUptrend = close.slice(-3).every((price, i, arr) => i === 0 || price >= arr[i-1]);
  
  return isUptrend ? lowerBand : upperBand;
}

// Calculate Average True Range (ATR)
function calculateATR(data: YahooFinanceHistoricalData, period: number = 14): number {
  const high = data.high;
  const low = data.low;
  const close = data.close;
  
  const trueRanges = [];
  for (let i = 1; i < close.length; i++) {
    const tr = Math.max(
      high[i] - low[i],
      Math.abs(high[i] - close[i-1]),
      Math.abs(low[i] - close[i-1])
    );
    trueRanges.push(tr);
  }
  
  return trueRanges.slice(-period).reduce((sum, tr) => sum + tr, 0) / period;
}

// Calculate Volume Weighted Average Price (VWAP)
function calculateVWAP(data: YahooFinanceHistoricalData): number {
  const typical = data.high.map((h, i) => (h + data.low[i] + data.close[i]) / 3);
  const volumeTypical = typical.map((tp, i) => tp * data.volume[i]);
  
  const sumVolumeTypical = volumeTypical.reduce((sum, vt) => sum + vt, 0);
  const sumVolume = data.volume.reduce((sum, v) => sum + v, 0);
  
  return sumVolumeTypical / sumVolume;
}

// Calculate Ichimoku Cloud
function calculateIchimoku(prices: number[]): {
  tenkanSen: number;
  kijunSen: number;
  senkouSpanA: number;
  senkouSpanB: number;
} {
  const tenkanPeriod = 9;
  const kijunPeriod = 26;
  const senkouBPeriod = 52;
  
  const tenkanSen = (Math.max(...prices.slice(-tenkanPeriod)) + Math.min(...prices.slice(-tenkanPeriod))) / 2;
  const kijunSen = (Math.max(...prices.slice(-kijunPeriod)) + Math.min(...prices.slice(-kijunPeriod))) / 2;
  
  const senkouSpanA = (tenkanSen + kijunSen) / 2;
  const senkouSpanB = (Math.max(...prices.slice(-senkouBPeriod)) + Math.min(...prices.slice(-senkouBPeriod))) / 2;
  
  return {
    tenkanSen,
    kijunSen,
    senkouSpanA,
    senkouSpanB
  };
}

// Calculate Fibonacci Levels
function calculateFibonacciLevels(high: number, low: number): {
  resistance: number[];
  support: number[];
} {
  const diff = high - low;
  
  return {
    resistance: [
      low + diff * 0.236,
      low + diff * 0.382,
      low + diff * 0.5,
      low + diff * 0.618,
      low + diff * 0.786
    ],
    support: [
      high - diff * 0.236,
      high - diff * 0.382,
      high - diff * 0.5,
      high - diff * 0.618,
      high - diff * 0.786
    ]
  };
} 