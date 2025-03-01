import axios from 'axios';

const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_REACT_APP_ALPHA_VANTAGE_API_KEY || 'demo';
const BASE_URL = 'https://www.alphavantage.co/query';

export interface MarketData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicator {
  timestamp: string;
  value: number;
}

export const marketApi = {
  async getStockData(symbol: string, interval: '1min' | '5min' | '15min' | '30min' | '60min' | 'daily' = 'daily'): Promise<MarketData[]> {
    const response = await axios.get(BASE_URL, {
      params: {
        function: interval === 'daily' ? 'TIME_SERIES_DAILY' : 'TIME_SERIES_INTRADAY',
        symbol,
        interval: interval !== 'daily' ? interval : undefined,
        apikey: ALPHA_VANTAGE_API_KEY,
        outputsize: 'compact'
      }
    });

    const timeSeriesKey = interval === 'daily' ? 'Time Series (Daily)' : `Time Series (${interval})`;
    const timeSeries = response.data[timeSeriesKey];

    return Object.entries(timeSeries).map(([timestamp, data]: [string, any]) => ({
      timestamp,
      open: parseFloat(data['1. open']),
      high: parseFloat(data['2. high']),
      low: parseFloat(data['3. low']),
      close: parseFloat(data['4. close']),
      volume: parseInt(data['5. volume'])
    })).reverse();
  },

  async getRSI(symbol: string, interval: '1min' | '5min' | '15min' | '30min' | '60min' | 'daily' = 'daily'): Promise<TechnicalIndicator[]> {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'RSI',
        symbol,
        interval,
        time_period: 14,
        series_type: 'close',
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });

    const data = response.data['Technical Analysis: RSI'];
    return Object.entries(data).map(([timestamp, value]: [string, any]) => ({
      timestamp,
      value: parseFloat(value.RSI)
    })).reverse();
  },

  async getMACD(symbol: string, interval: '1min' | '5min' | '15min' | '30min' | '60min' | 'daily' = 'daily'): Promise<any> {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'MACD',
        symbol,
        interval,
        series_type: 'close',
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });

    const data = response.data['Technical Analysis: MACD'];
    return Object.entries(data).map(([timestamp, value]: [string, any]) => ({
      timestamp,
      macd: parseFloat(value.MACD),
      signal: parseFloat(value.MACD_Signal),
      histogram: parseFloat(value.MACD_Hist)
    })).reverse();
  }
}; 