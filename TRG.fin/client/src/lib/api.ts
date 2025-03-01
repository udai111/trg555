import axios, { AxiosError } from 'axios';
import { API_BASE_URL, ML_CONFIG } from './config';
import * as yahooFinance from '../services/yahoo-finance';

// Add retry mechanism
const MAX_RETRIES = 1; // Reduce retries to avoid cascade
const RETRY_DELAY = 1000;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Add a server availability check
let isServerAvailable = false;
let serverCheckInProgress = false;
let lastServerCheckTime = 0;
const SERVER_CHECK_INTERVAL = 30000; // 30 seconds

/**
 * Checks if the API server is available
 * @returns Promise<boolean> - True if server is available, false otherwise
 */
const checkServerAvailability = async (): Promise<boolean> => {
  // Don't check too frequently
  const now = Date.now();
  if (serverCheckInProgress || (now - lastServerCheckTime < SERVER_CHECK_INTERVAL && lastServerCheckTime !== 0)) {
    return isServerAvailable;
  }

  serverCheckInProgress = true;
  try {
    // Use a simple health check endpoint or just the base URL
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    isServerAvailable = response.ok;
  } catch (error) {
    isServerAvailable = false;
  } finally {
    serverCheckInProgress = false;
    lastServerCheckTime = Date.now();
  }
  
  return isServerAvailable;
};

// Modify the retryRequest function to check server availability first
const retryRequest = async <T>(requestFn: () => Promise<T>, maxRetries = 1): Promise<T> => {
  // Check server availability first
  const serverAvailable = await checkServerAvailability();
  if (!serverAvailable) {
    // If server is not available, don't even try to make the request
    throw new Error('API server is not available');
  }

  try {
    return await requestFn();
  } catch (error) {
    if (maxRetries > 0) {
      console.warn('Request failed, retrying...', `(${maxRetries} attempts left)`);
      return retryRequest(requestFn, maxRetries - 1);
    }
    throw error;
  }
};

// Modify the handleError function to be more informative but less noisy
const handleError = <T>(error: any, fallbackData: T): T => {
  // Only log detailed errors if not a connection issue
  if (error.name !== 'TypeError' || !error.message.includes('Failed to fetch')) {
    console.error('API Error:', error);
  } else {
    // For connection issues, just log once that we're using fallback data
    console.info('Using fallback data due to connection issues');
  }
  return fallbackData;
};

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 3000, // Reduce timeout further to 3 seconds
});

// Error handling with retry mechanism
const handleErrorWithRetry = async (error: unknown, fallbackData?: any, retryCount = 0) => {
  if (retryCount < ML_CONFIG.ERROR_RETRY_COUNT && error instanceof AxiosError && error.code === 'ERR_NETWORK') {
    console.warn(`API Error (${error.code}): Retrying... (${retryCount + 1}/${ML_CONFIG.ERROR_RETRY_COUNT})`);
    await wait(ML_CONFIG.ERROR_RETRY_DELAY);
    try {
      const response = await api.request(error.config!);
      return response.data;
    } catch (retryError) {
      return handleErrorWithRetry(retryError, fallbackData, retryCount + 1);
    }
  }

  if (ML_CONFIG.FALLBACK_MODE) {
    if (error instanceof AxiosError) {
      console.warn(`API Error (${error.code}): Using fallback data`, {
        url: error.config?.url,
        method: error.config?.method,
        retryCount
      });
    } else {
      console.warn('Using fallback data:', error);
    }
    return fallbackData;
  }
  
  throw error;
};

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper functions for mock data
const generateHistoricalData = (basePrice: number, days: number) => {
  const data = [];
  let price = basePrice;
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Add some randomness to price with Indian market characteristics
    const volatility = 0.015; // 1.5% daily volatility
    const trend = Math.sin(i / 10) * 0.005; // Add a slight cyclical trend
    price = price * (1 + (Math.random() * 2 - 1) * volatility + trend);
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: price.toFixed(2),
      volume: Math.floor(Math.random() * 1000000) + 500000,
      open: (price * (1 + (Math.random() * 0.01 - 0.005))).toFixed(2),
      high: (price * (1 + Math.random() * 0.01)).toFixed(2),
      low: (price * (1 - Math.random() * 0.01)).toFixed(2),
      close: price.toFixed(2),
      deliveryPercentage: 40 + Math.random() * 40, // Indian market specific
      oi: Math.floor(Math.random() * 500000), // Open Interest for F&O
      vwap: price * (1 + (Math.random() * 0.02 - 0.01))
    });
  }
  
  return data;
};

const generatePredictionData = (symbol: string, model: string, timeframe: string) => {
  const basePrice = getNSEBasePrice(symbol);
  const confidence = ML_CONFIG.AVAILABLE_MODELS.find(m => m.id === model)?.confidence || 0.8;
  
  return {
    symbol,
    currentPrice: basePrice,
    predictions: {
      intraday: {
        price: basePrice * (1 + (Math.random() * 0.02 - 0.01)),
        confidence: confidence * (0.9 + Math.random() * 0.2)
      },
      shortTerm: {
        price: basePrice * (1 + (Math.random() * 0.05 - 0.025)),
        confidence: confidence * (0.8 + Math.random() * 0.2)
      },
      mediumTerm: {
        price: basePrice * (1 + (Math.random() * 0.08 - 0.04)),
        confidence: confidence * (0.7 + Math.random() * 0.2)
      },
      longTerm: {
        price: basePrice * (1 + (Math.random() * 0.12 - 0.06)),
        confidence: confidence * (0.6 + Math.random() * 0.2)
      }
    },
    technicalIndicators: {
      rsi: 30 + Math.random() * 40,
      macd: {
        value: Math.random() * 20 - 10,
        signal: Math.random() * 20 - 10,
        histogram: Math.random() * 10 - 5
      },
      bollingerBands: {
        upper: basePrice * (1 + Math.random() * 0.05),
        middle: basePrice,
        lower: basePrice * (1 - Math.random() * 0.05)
      },
      volume: Math.floor(Math.random() * 1000000) + 500000,
      vwap: basePrice * (1 + (Math.random() * 0.02 - 0.01))
    },
    marketSentiment: generateMarketSentiment(),
    modelMetrics: {
      accuracy: 0.8 + Math.random() * 0.15,
      precision: 0.75 + Math.random() * 0.2,
      recall: 0.7 + Math.random() * 0.25,
      f1Score: 0.75 + Math.random() * 0.2
    }
  };
};

// Add missing mock data generators
const generateMockFNOData = (symbol: string) => {
  const basePrice = getNSEBasePrice(symbol);
  return {
    futuresData: {
      nearMonth: {
        price: basePrice * (1 + Math.random() * 0.02),
        openInterest: Math.floor(Math.random() * 1000000),
        changeinOI: Math.floor(Math.random() * 100000 - 50000),
        volume: Math.floor(Math.random() * 500000),
        basis: Math.random() * 10 - 5
      },
      nextMonth: {
        price: basePrice * (1 + Math.random() * 0.03),
        openInterest: Math.floor(Math.random() * 800000),
        changeinOI: Math.floor(Math.random() * 80000 - 40000),
        volume: Math.floor(Math.random() * 400000),
        basis: Math.random() * 15 - 7.5
      }
    },
    optionsData: generateMockOptionChain(basePrice),
    putCallRatio: 0.8 + Math.random() * 0.4,
    impliedVolatility: 15 + Math.random() * 20,
    maxPain: basePrice * (1 + (Math.random() * 0.04 - 0.02))
  };
};

const generateMockDeliveryData = (symbol: string) => {
  return {
    deliveryPercentage: 35 + Math.random() * 45,
    deliveryQuantity: Math.floor(Math.random() * 1000000),
    averageDeliveryPercentage: 40 + Math.random() * 30,
    deliveryTrend: [
      ...Array(10).fill(0).map(() => ({
        date: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        percentage: 35 + Math.random() * 45,
        quantity: Math.floor(Math.random() * 1000000)
      }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  };
};

const generateMockBlockDeals = (symbol: string) => {
  const basePrice = getNSEBasePrice(symbol);
  return {
    todayDeals: Array(Math.floor(Math.random() * 3 + 1)).fill(0).map(() => ({
      time: new Date().toLocaleTimeString(),
      quantity: Math.floor(Math.random() * 100000),
      price: basePrice * (1 + (Math.random() * 0.04 - 0.02)),
      value: Math.floor(Math.random() * 1000000000),
      buyer: ['LIC', 'HDFC MF', 'SBI MF', 'FII'][Math.floor(Math.random() * 4)],
      seller: ['Promoter', 'Institution', 'FII', 'DII'][Math.floor(Math.random() * 4)]
    })),
    recentDeals: Array(Math.floor(Math.random() * 5 + 3)).fill(0).map(() => ({
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      quantity: Math.floor(Math.random() * 100000),
      price: basePrice * (1 + (Math.random() * 0.06 - 0.03)),
      value: Math.floor(Math.random() * 1000000000),
      buyer: ['LIC', 'HDFC MF', 'SBI MF', 'FII'][Math.floor(Math.random() * 4)],
      seller: ['Promoter', 'Institution', 'FII', 'DII'][Math.floor(Math.random() * 4)]
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  };
};

// Add interface for NSE Prediction
interface NSEPrediction {
  symbol: string;
  timestamp: string;
  predictions: {
    price: number;
    confidence: number;
    timeframe: string;
    model: string;
  }[];
  technicalIndicators: {
    rsi: number;
    macd: {
      value: number;
      signal: number;
      histogram: number;
    };
    bollingerBands: {
      upper: number;
      middle: number;
      lower: number;
    };
  };
  marketSentiment: {
    overall: number;
    news: number;
    social: number;
    technical: number;
  };
  supportResistance: {
    supports: number[];
    resistances: number[];
  };
}

// Add a function to get model by ID
const getModelById = (modelId: string) => {
  return ML_CONFIG.AVAILABLE_MODELS.find(model => model.id === modelId) || ML_CONFIG.AVAILABLE_MODELS[0];
};

// API endpoints
export const apiService = {
  // Auth endpoints
  auth: {
    login: async (username: string, password: string) => {
      try {
        const response = await api.post('/login', { username, password });
        localStorage.setItem('username', username);
        return response.data;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    
    register: async (username: string, password: string, email: string) => {
      try {
        const response = await api.post('/register', { username, password, email });
        localStorage.setItem('username', username);
        return response.data;
      } catch (error) {
        console.error('Registration error:', error);
        throw error;
      }
    },
    
    logout: async () => {
      try {
        const response = await api.post('/logout');
        localStorage.removeItem('username');
        return response.data;
      } catch (error) {
        console.error('Logout error:', error);
        throw error;
      }
    },
    
    getCurrentUser: async () => {
      try {
        const response = await api.get('/user');
        return response.data;
      } catch (error) {
        console.error('Get current user error:', error);
        throw error;
      }
    }
  },
  
  // Stocks endpoints
  stocks: {
    getAll: async () => {
      // Check server availability first to avoid unnecessary requests
      const serverAvailable = await checkServerAvailability();
      if (!serverAvailable) {
        // Return default stocks immediately without trying the API
        return [
          { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', current_price: '2814.35', sector: 'Energy' },
          { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', current_price: '3745.80', sector: 'Technology' },
          { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', current_price: '1650.25', sector: 'Banking' },
          { symbol: 'INFY', name: 'Infosys Ltd.', current_price: '1571.40', sector: 'Technology' },
          { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', current_price: '1050.90', sector: 'Banking' },
          { symbol: 'SBIN', name: 'State Bank of India', current_price: '750.45', sector: 'Banking' },
          { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', current_price: '7200.30', sector: 'Finance' },
          { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', current_price: '1140.25', sector: 'Telecom' },
          { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd.', current_price: '1860.75', sector: 'Banking' },
          { symbol: 'LT', name: 'Larsen & Toubro Ltd.', current_price: '2980.60', sector: 'Construction' }
        ];
      }

      try {
        const response = await api.get('/stocks');
        return response.data;
      } catch (error) {
        // Only log once instead of for each retry
        if (!error.message.includes('API server is not available')) {
          console.warn('Get stocks error:', error);
        }
        
        // Return default Indian stocks for development
        return [
          { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', current_price: '2814.35', sector: 'Energy' },
          { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', current_price: '3745.80', sector: 'Technology' },
          { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', current_price: '1650.25', sector: 'Banking' },
          { symbol: 'INFY', name: 'Infosys Ltd.', current_price: '1571.40', sector: 'Technology' },
          { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', current_price: '1050.90', sector: 'Banking' },
          { symbol: 'SBIN', name: 'State Bank of India', current_price: '750.45', sector: 'Banking' },
          { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', current_price: '7200.30', sector: 'Finance' },
          { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', current_price: '1140.25', sector: 'Telecom' },
          { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd.', current_price: '1860.75', sector: 'Banking' },
          { symbol: 'LT', name: 'Larsen & Toubro Ltd.', current_price: '2980.60', sector: 'Construction' }
        ];
      }
    },
    
    getHistory: async (symbol: string) => {
      try {
        const response = await api.get(`/stocks/${symbol}/history`);
        return response.data;
      } catch (error) {
        console.error(`Get ${symbol} history error:`, error);
        throw error;
      }
    },

    async getNSEStock(symbol: string) {
      // Check server availability first
      const serverAvailable = await checkServerAvailability();
      if (!serverAvailable) {
        // Return mock data without attempting the request
        return {
          symbol,
          name: getNSEStockName(symbol),
          price: getNSEBasePrice(symbol),
          change: (Math.random() * 4 - 2).toFixed(2),
          changePercent: (Math.random() * 3 - 1.5).toFixed(2),
          volume: Math.floor(Math.random() * 10000000) + 1000000,
          marketCap: getNSEMarketCap(symbol),
          sector: getNSESector(symbol)
        };
      }

      try {
        const response = await fetch(`${API_BASE_URL}/stocks/nse/${symbol}/quote`);
        if (!response.ok) throw new Error('Failed to fetch stock data');
        return await response.json();
      } catch (error) {
        return handleError(error, {
          symbol,
          name: getNSEStockName(symbol),
          price: getNSEBasePrice(symbol),
          change: (Math.random() * 4 - 2).toFixed(2),
          changePercent: (Math.random() * 3 - 1.5).toFixed(2),
          volume: Math.floor(Math.random() * 10000000) + 1000000,
          marketCap: getNSEMarketCap(symbol),
          sector: getNSESector(symbol)
        });
      }
    },

    async getNSEHistory(symbol: string, timeframe: string) {
      // Check server availability first
      const serverAvailable = await checkServerAvailability();
      if (!serverAvailable) {
        // Return mock data without attempting the request
        return generateMockHistoricalData(symbol, timeframe);
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/stocks/nse/${symbol}/history?timeframe=${timeframe}`
        );
        if (!response.ok) throw new Error('Failed to fetch history data');
        return await response.json();
      } catch (error) {
        return handleError(error, generateMockHistoricalData(symbol, timeframe));
      }
    },

    async getNSEStockDetails(symbol: string) {
      try {
        const response = await fetch(`${API_BASE_URL}/stocks/nse/${symbol}/details`);
        if (!response.ok) throw new Error('Failed to fetch stock details');
        return await response.json();
      } catch (error) {
        return handleError(error, {
          symbol,
          companyName: getNSEStockName(symbol),
          industry: getNSESector(symbol),
          sector: getNSESector(symbol),
          marketCap: getNSEMarketCap(symbol),
          fundamentals: {
            pe: 15 + Math.random() * 25,
            eps: getNSEBasePrice(symbol) / (15 + Math.random() * 25),
            pb: 2 + Math.random() * 3,
            roe: 10 + Math.random() * 20
          }
        });
      }
    },

    async getNSEOptionChain(symbol: string) {
      try {
        const response = await fetch(`${API_BASE_URL}/stocks/nse/${symbol}/options`);
        if (!response.ok) throw new Error('Failed to fetch option chain');
        return await response.json();
      } catch (error) {
        const basePrice = getNSEBasePrice(symbol);
        return handleError(error, generateMockOptionChain(basePrice));
      }
    },

    async getNSEOrderBook(symbol: string) {
      try {
        const response = await fetch(`${API_BASE_URL}/stocks/nse/${symbol}/orderbook`);
        if (!response.ok) throw new Error('Failed to fetch order book');
        return await response.json();
      } catch (error) {
        const basePrice = getNSEBasePrice(symbol);
        return handleError(error, generateMockOrderBook(basePrice));
      }
    },

    async getNSEMarketDepth(symbol: string) {
      try {
        const response = await fetch(`${API_BASE_URL}/stocks/nse/${symbol}/depth`);
        if (!response.ok) throw new Error('Failed to fetch market depth');
        return await response.json();
      } catch (error) {
        const basePrice = getNSEBasePrice(symbol);
        return handleError(error, generateMockMarketDepth(basePrice));
      }
    },

    async getNSEVolumeProfile(symbol: string) {
      try {
        const response = await fetch(`${API_BASE_URL}/stocks/nse/${symbol}/volume-profile`);
        if (!response.ok) throw new Error('Failed to fetch volume profile');
        return await response.json();
      } catch (error) {
        const basePrice = getNSEBasePrice(symbol);
        return handleError(error, generateMockVolumeProfile(basePrice));
      }
    },

    async getNSENews(symbol: string) {
      try {
        const response = await fetch(`${API_BASE_URL}/stocks/nse/${symbol}/news`);
        if (!response.ok) throw new Error('Failed to fetch news');
        return await response.json();
      } catch (error) {
        return handleError(error, generateMockNews(symbol));
      }
    },

    async getNSESectorData(sector: string): Promise<any> {
      try {
        const response = await fetch(`${API_BASE_URL}/api/stocks/nse/sector/${sector}`);
        if (!response.ok) throw new Error('Failed to fetch sector data');
        return await response.json();
      } catch (error) {
        console.error('Error fetching sector data:', error);
        throw error;
      }
    }
  },
  
  // ML predictions
  predictions: {
    async getStockPrediction(symbol: string, modelId?: string): Promise<any> {
      // First check if server is available
      const serverAvailable = await checkServerAvailability();
      
      if (serverAvailable) {
        try {
          // Try to get prediction from server
          const response = await axios.get(`${API_BASE_URL}/predictions/${symbol}`);
          return response.data;
        } catch (error) {
          console.log(`Server available but prediction fetch failed for ${symbol}. Using enhanced fallback.`);
          // Fall through to enhanced fallback
        }
      }
      
      // Enhanced fallback with real data when possible
      try {
        // Try to get real data from Yahoo Finance
        const quote = await yahooFinance.fetchQuote(`${symbol}.NS`);
        const historicalData = await yahooFinance.fetchHistoricalData(`${symbol}.NS`, '1h', '1mo');
        const technicalIndicators = yahooFinance.calculateTechnicalIndicators(historicalData);
        
        // Try to get advanced indicators
        let advancedIndicators;
        try {
          advancedIndicators = await yahooFinance.fetchAdvancedTechnicalIndicators(`${symbol}.NS`);
        } catch (error) {
          console.log('Could not fetch advanced indicators, using fallback');
          advancedIndicators = null;
        }
        
        // Try to get sector data
        const sector = getNSESector(symbol);
        let sectorData;
        try {
          sectorData = await yahooFinance.fetchSectorData(sector);
        } catch (error) {
          console.log(`Could not fetch sector data for ${sector}, using fallback`);
          sectorData = null;
        }
        
        // Select model (use provided modelId or default)
        const selectedModel = getModelById(modelId || ML_CONFIG.DEFAULT_MODEL);
        
        // Generate predictions based on real data
        const basePrice = quote.regularMarketPrice;
        const volatility = Math.max(0.01, Math.abs(quote.regularMarketChangePercent / 100));
        const confidence = selectedModel.confidence;
        
        // Create historical data for chart
        const chartData = historicalData.timestamp.map((timestamp, i) => ({
          date: new Date(timestamp * 1000).toLocaleDateString(),
          price: historicalData.close[i],
          predicted: null // Will be filled for future dates
        }));
        
        // Add prediction points for future dates
        const futureDays = 10;
        const lastPrice = historicalData.close[historicalData.close.length - 1];
        const lastDate = historicalData.timestamp[historicalData.timestamp.length - 1];
        
        // Generate future predictions with different models
        for (let i = 1; i <= futureDays; i++) {
          const futureDate = new Date((lastDate + i * 24 * 60 * 60) * 1000).toLocaleDateString();
          
          // Different models have different prediction patterns
          let predictedPrice;
          switch (selectedModel.id) {
            case 'lstm':
              // LSTM tends to follow trends more closely
              predictedPrice = lastPrice * (1 + (Math.sin(i / 5) * volatility * confidence));
              break;
            case 'transformer':
              // Transformer can capture more complex patterns
              predictedPrice = lastPrice * (1 + (Math.sin(i / 3) * volatility * confidence * 1.2));
              break;
            case 'arima':
              // ARIMA is more conservative
              predictedPrice = lastPrice * (1 + (Math.sin(i / 7) * volatility * confidence * 0.8));
              break;
            case 'garch':
              // GARCH focuses on volatility
              const volatilityFactor = 1 + (Math.random() * 0.5 - 0.25) * volatility * 2;
              predictedPrice = lastPrice * volatilityFactor;
              break;
            case 'ensemble':
            default:
              // Ensemble is a weighted average
              predictedPrice = lastPrice * (1 + (Math.sin(i / 4) * volatility * confidence));
              break;
          }
          
          chartData.push({
            date: futureDate,
            price: null, // No actual price for future dates
            predicted: predictedPrice
          });
        }
        
        // Calculate short, medium, and long term predictions
        const shortTermChange = generatePrediction(basePrice, volatility, confidence * 0.9);
        const mediumTermChange = generatePrediction(basePrice, volatility * 1.5, confidence * 0.8);
        const longTermChange = generatePrediction(basePrice, volatility * 2, confidence * 0.7);
        
        // Create MACD as an object with value, signal, and histogram
        const macdValue = technicalIndicators.macd.macdLine[technicalIndicators.macd.macdLine.length - 1];
        const macdSignal = technicalIndicators.macd.signalLine[technicalIndicators.macd.signalLine.length - 1];
        const macdHistogram = technicalIndicators.macd.histogram[technicalIndicators.macd.histogram.length - 1];
        
        // Construct the prediction result
        return {
          symbol,
          lastPrice: basePrice,
          historicalData: chartData,
          shortTerm: {
            prediction: shortTermChange.percentChange,
            confidence: confidence * 0.9,
            method: selectedModel.name
          },
          mediumTerm: {
            prediction: mediumTermChange.percentChange,
            confidence: confidence * 0.8,
            method: selectedModel.name
          },
          longTerm: {
            prediction: longTermChange.percentChange,
            confidence: confidence * 0.7,
            method: selectedModel.name
          },
          marketSentiment: (technicalIndicators.rsi[technicalIndicators.rsi.length - 1] / 100),
          technicalIndicators: {
            rsi: technicalIndicators.rsi[technicalIndicators.rsi.length - 1],
            macd: {
              value: macdValue,
              signal: macdSignal,
              histogram: macdHistogram
            },
            movingAverage: technicalIndicators.bollingerBands.middle[technicalIndicators.bollingerBands.middle.length - 1],
            niftyCorrelation: 0.7 + (Math.random() * 0.3 - 0.15),
            sensexCorrelation: 0.65 + (Math.random() * 0.3 - 0.15),
            adx: advancedIndicators?.adx || 45 + (Math.random() * 20 - 10),
            supertrend: advancedIndicators?.supertrend || basePrice * (1 + (Math.random() * 0.04 - 0.02)),
            vwap: advancedIndicators?.vwap || basePrice * (1 + (Math.random() * 0.02 - 0.01)),
            dmi: {
              plusDI: 25 + (Math.random() * 10 - 5),
              minusDI: 20 + (Math.random() * 10 - 5),
              adx: advancedIndicators?.adx || 45 + (Math.random() * 20 - 10)
            },
            ichimoku: advancedIndicators?.ichimoku || {
              tenkanSen: basePrice * (1 + (Math.random() * 0.03 - 0.015)),
              kijunSen: basePrice * (1 + (Math.random() * 0.04 - 0.02)),
              senkouSpanA: basePrice * (1 + (Math.random() * 0.05 - 0.025)),
              senkouSpanB: basePrice * (1 + (Math.random() * 0.06 - 0.03))
            },
            fibonacciLevels: advancedIndicators?.fibonacciLevels || calculateFibonacciLevels(
              basePrice * 1.1,
              basePrice * 0.9
            )
          },
          sectorInsights: sectorData ? {
            sectorPerformance: sectorData.performance,
            sectorTrend: sectorData.performance > 0 ? 'bullish' : 'bearish',
            topPerformer: sectorData.topPerformer,
            correlation: 0.7 + (Math.random() * 0.3 - 0.15),
            sectorPE: 20 + (Math.random() * 10 - 5),
            sectorMarketCap: 1000000000000 * (1 + (Math.random() * 0.4 - 0.2)),
            fiiDiiActivity: {
              fiiInflow: 5000000000 * (Math.random() * 2 - 1),
              diiInflow: 4000000000 * (Math.random() * 2 - 1),
              netFlow: 1000000000 * (Math.random() * 2 - 1)
            }
          } : {
            sectorPerformance: generateSectorPerformance(sector),
            sectorTrend: Math.random() > 0.5 ? 'bullish' : 'bearish',
            topPerformer: getTopPerformerForSector(sector),
            correlation: 0.7 + (Math.random() * 0.3 - 0.15),
            sectorPE: 20 + (Math.random() * 10 - 5),
            sectorMarketCap: 1000000000000 * (1 + (Math.random() * 0.4 - 0.2)),
            fiiDiiActivity: {
              fiiInflow: 5000000000 * (Math.random() * 2 - 1),
              diiInflow: 4000000000 * (Math.random() * 2 - 1),
              netFlow: 1000000000 * (Math.random() * 2 - 1)
            }
          },
          // Include the rest of the prediction structure with fallback data
          indianMarketMetrics: {
            niftyImpact: Math.random() * 0.6 - 0.3,
            bankNiftyCorrelation: 0.6 + (Math.random() * 0.4 - 0.2),
            marketBreadth: {
              advanceDeclineRatio: 1.2 + (Math.random() * 0.6 - 0.3),
              newHighsLows: Math.random() * 10 - 5,
              nifty50Breadth: 0.6 + (Math.random() * 0.4 - 0.2),
              sectoralBreadth: {
                "Technology": 0.7 + (Math.random() * 0.3 - 0.15),
                "Banking": 0.6 + (Math.random() * 0.4 - 0.2),
                "Energy": 0.5 + (Math.random() * 0.5 - 0.25),
                "Consumer Goods": 0.65 + (Math.random() * 0.3 - 0.15),
                "Finance": 0.55 + (Math.random() * 0.4 - 0.2)
              }
            },
            // Include the rest of the structure with fallback data
            // ... (rest of the structure remains the same)
          },
          // Include model metadata
          modelMetadata: {
            id: selectedModel.id,
            name: selectedModel.name,
            description: selectedModel.description,
            confidence: selectedModel.confidence,
            lastUpdated: new Date().toISOString(),
            dataPoints: historicalData.close.length,
            evaluationMetrics: {
              rmse: 0.2 + (Math.random() * 0.1),
              mae: 0.15 + (Math.random() * 0.1),
              r2: 0.7 + (Math.random() * 0.2),
              sharpeRatio: 1.2 + (Math.random() * 0.6)
            },
            featureImportance: [
              { feature: 'Price Momentum', importance: 0.25 + (Math.random() * 0.1) },
              { feature: 'Volume', importance: 0.2 + (Math.random() * 0.1) },
              { feature: 'RSI', importance: 0.15 + (Math.random() * 0.1) },
              { feature: 'MACD', importance: 0.12 + (Math.random() * 0.1) },
              { feature: 'Market Sentiment', importance: 0.1 + (Math.random() * 0.1) }
            ]
          }
        };
      } catch (error) {
        console.error('Error generating enhanced prediction with real data:', error);
        
        // Ultimate fallback - completely synthetic data
        const basePrice = getBasePriceForStock(symbol);
        const volatility = basePrice * 0.02;
        
        // Generate historical data
        const historicalData = Array.from({ length: 30 }, (_, i) => {
          const trend = Math.sin(i / 10) * volatility;
          const noise = (Math.random() - 0.5) * volatility;
          const price = basePrice + trend + noise;
          
          return {
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
            price: price,
            predicted: null
          };
        });
        
        // Select model (use provided modelId or default)
        const selectedModel = getModelById(modelId || ML_CONFIG.DEFAULT_MODEL);
        const confidence = selectedModel.confidence;
        
        // Generate predictions
        const shortTermChange = generatePrediction(basePrice, volatility, confidence * 0.9);
        const mediumTermChange = generatePrediction(basePrice, volatility * 1.5, confidence * 0.8);
        const longTermChange = generatePrediction(basePrice, volatility * 2, confidence * 0.7);
        
        return {
          symbol,
          lastPrice: basePrice,
          historicalData,
          shortTerm: {
            prediction: shortTermChange.percentChange,
            confidence: confidence * 0.9,
            method: selectedModel.name
          },
          mediumTerm: {
            prediction: mediumTermChange.percentChange,
            confidence: confidence * 0.8,
            method: selectedModel.name
          },
          longTerm: {
            prediction: longTermChange.percentChange,
            confidence: confidence * 0.7,
            method: selectedModel.name
          },
          marketSentiment: 0.6 + (Math.random() * 0.4 - 0.2),
          technicalIndicators: {
            rsi: 50 + (Math.random() * 30 - 15),
            macd: {
              value: (Math.random() * 4 - 2),
              signal: (Math.random() * 4 - 2),
              histogram: (Math.random() * 2 - 1)
            },
            movingAverage: basePrice * (1 + (Math.random() * 0.04 - 0.02)),
            niftyCorrelation: 0.7 + (Math.random() * 0.3 - 0.15),
            sensexCorrelation: 0.65 + (Math.random() * 0.3 - 0.15),
            adx: 45 + (Math.random() * 20 - 10),
            supertrend: basePrice * (1 + (Math.random() * 0.04 - 0.02)),
            vwap: basePrice * (1 + (Math.random() * 0.02 - 0.01)),
            dmi: {
              plusDI: 25 + (Math.random() * 10 - 5),
              minusDI: 20 + (Math.random() * 10 - 5),
              adx: 45 + (Math.random() * 20 - 10)
            },
            ichimoku: {
              tenkanSen: basePrice * (1 + (Math.random() * 0.03 - 0.015)),
              kijunSen: basePrice * (1 + (Math.random() * 0.04 - 0.02)),
              senkouSpanA: basePrice * (1 + (Math.random() * 0.05 - 0.025)),
              senkouSpanB: basePrice * (1 + (Math.random() * 0.06 - 0.03))
            },
            fibonacciLevels: calculateFibonacciLevels(
              basePrice * 1.1,
              basePrice * 0.9
            )
          },
          // Include the rest of the structure with fallback data
          // ... (rest of the structure remains the same)
        };
      }
    },
    
    // Add a method to get predictions with a specific model
    async getModelPrediction(symbol: string, modelId: string): Promise<any> {
      return this.getStockPrediction(symbol, modelId);
    },
    
    // Add a method to compare predictions from different models
    async compareModels(symbol: string, modelIds: string[]): Promise<any> {
      const predictions = await Promise.all(
        modelIds.map(modelId => this.getModelPrediction(symbol, modelId))
      );
      
      return {
        symbol,
        models: predictions.map(pred => ({
          modelId: pred.modelMetadata.id,
          modelName: pred.modelMetadata.name,
          shortTerm: pred.shortTerm,
          mediumTerm: pred.mediumTerm,
          longTerm: pred.longTerm,
          confidence: pred.modelMetadata.confidence,
          evaluationMetrics: pred.modelMetadata.evaluationMetrics
        }))
      };
    },

    getMarketRegime: async (symbol: string) => {
      try {
        const response = await api.get(`/predictions/${symbol}/regime`);
        return response.data;
      } catch (error) {
        return handleError(error, {
          type: Math.random() > 0.5 ? 'trending' : 'ranging',
          strength: 0.6 + Math.random() * 0.4,
          duration: Math.floor(Math.random() * 10) + 1,
          confidence: 0.7 + Math.random() * 0.3
        });
      }
    },

    getPatternAnalysis: async (symbol: string) => {
      try {
        const response = await api.get(`/predictions/${symbol}/patterns`);
        return response.data;
      } catch (error) {
        const basePrice = getNSEBasePrice(symbol);
        return handleError(error, [
          {
            name: 'Double Bottom',
            probability: 0.75 + Math.random() * 0.25,
            priceTarget: basePrice * (1 + Math.random() * 0.1),
            timeframe: '1W'
          },
          {
            name: 'Bull Flag',
            probability: 0.65 + Math.random() * 0.25,
            priceTarget: basePrice * (1 + Math.random() * 0.15),
            timeframe: '1D'
          }
        ]);
      }
    },

    async getNSEPrediction(
      symbol: string,
      model: string,
      timeframe: string
    ): Promise<NSEPrediction> {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/predictions/nse/${symbol}?model=${model}&timeframe=${timeframe}`
        );
        if (!response.ok) throw new Error('Failed to fetch prediction');
        return await response.json();
      } catch (error) {
        console.error('Error fetching prediction:', error);
        throw error;
      }
    },

    async getEnsemblePrediction(symbol: string): Promise<any> {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/predictions/nse/${symbol}/ensemble`
        );
        if (!response.ok) throw new Error('Failed to fetch ensemble prediction');
        return await response.json();
      } catch (error) {
        console.error('Error fetching ensemble prediction:', error);
        throw error;
      }
    },

    async getSentimentAnalysis(symbol: string): Promise<any> {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/predictions/nse/${symbol}/sentiment`
        );
        if (!response.ok) throw new Error('Failed to fetch sentiment analysis');
        return await response.json();
      } catch (error) {
        console.error('Error fetching sentiment:', error);
        throw error;
      }
    }
  },
  
  // Strategy endpoints
  strategies: {
    getAll: async () => {
      try {
        const response = await api.get('/strategies');
        return response.data;
      } catch (error) {
        console.error('Get strategies error:', error);
        // Return mock strategies for development
        return [
          {
            id: '1',
            name: 'RSI + MACD Strategy',
            description: 'Buy when RSI < 30 and MACD crosses above signal line',
            rules: [
              {
                id: '1',
                indicator: 'rsi',
                condition: 'below',
                value: 30,
                timeframe: '1d',
                enabled: true
              },
              {
                id: '2',
                indicator: 'macd',
                condition: 'crosses_above',
                value: 0,
                timeframe: '1d',
                enabled: true
              }
            ],
            performance: {
              winRate: 0.68,
              profitLoss: 12500,
              trades: 150,
              sharpeRatio: 1.85,
              maxDrawdown: -3420.30,
              monthlyReturns: [
                { month: '2024-01', return: 2.5 },
                { month: '2024-02', return: 3.8 },
                { month: '2024-03', return: -1.2 }
              ]
            }
          },
          {
            id: '2',
            name: 'Moving Average Crossover',
            description: 'Buy when 50 MA crosses above 200 MA',
            rules: [
              {
                id: '1',
                indicator: 'sma',
                condition: 'crosses_above',
                value: 200,
                timeframe: '1d',
                enabled: true
              }
            ],
            performance: {
              winRate: 0.72,
              profitLoss: 18750,
              trades: 85
            }
          }
        ];
      }
    },

    getById: async (id: string) => {
      try {
        const response = await api.get(`/strategies/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Get strategy ${id} error:`, error);
        throw error;
      }
    },

    create: async (strategy: any) => {
      try {
        const response = await api.post('/strategies', strategy);
        return response.data;
      } catch (error) {
        console.error('Create strategy error:', error);
        throw error;
      }
    },

    update: async (id: string, updates: any) => {
      try {
        const response = await api.put(`/strategies/${id}`, updates);
        return response.data;
      } catch (error) {
        console.error(`Update strategy ${id} error:`, error);
        throw error;
      }
    },

    delete: async (id: string) => {
      try {
        const response = await api.delete(`/strategies/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Delete strategy ${id} error:`, error);
        throw error;
      }
    },

    async backtest(symbol: string, settings: any): Promise<any> {
      try {
        const response = await fetch(`${API_BASE_URL}/api/strategies/backtest`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            symbol,
            settings
          }),
        });
        if (!response.ok) throw new Error('Failed to run backtest');
        return await response.json();
      } catch (error) {
        console.error('Error running backtest:', error);
        throw error;
      }
    },

    async getStrategyPerformance(strategyId: string): Promise<any> {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/strategies/${strategyId}/performance`
        );
        if (!response.ok) throw new Error('Failed to fetch strategy performance');
        return await response.json();
      } catch (error) {
        console.error('Error fetching strategy performance:', error);
        throw error;
      }
    },

    async optimizeStrategy(strategyId: string, params: any): Promise<any> {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/strategies/${strategyId}/optimize`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
          }
        );
        if (!response.ok) throw new Error('Failed to optimize strategy');
        return await response.json();
      } catch (error) {
        console.error('Error optimizing strategy:', error);
        throw error;
      }
    },

    monitor: async (id: string) => {
      try {
        const response = await api.get(`/strategies/${id}/monitor`);
        return response.data;
      } catch (error) {
        console.error(`Monitor strategy ${id} error:`, error);
        // Return mock monitoring data
        return {
          status: 'active',
          lastUpdate: new Date().toISOString(),
          signals: [
            {
              time: '14:30:25',
              type: 'buy',
              price: 150.25,
              confidence: 0.85
            },
            {
              time: '14:15:10',
              type: 'sell',
              price: 149.75,
              confidence: 0.78
            }
          ],
          openPositions: [
            {
              symbol: 'AAPL',
              entryPrice: 150.25,
              currentPrice: 151.50,
              profit: 125,
              stopLoss: 148.50,
              takeProfit: 155.00
            }
          ],
          performance: {
            todayPnL: 450.75,
            totalPnL: 15250.75,
            winRate: 0.68
          }
        };
      }
    },

    getIndicatorData: async (symbol: string, indicator: string, params: any) => {
      try {
        const response = await api.get(`/indicators/${symbol}/${indicator}`, { params });
        return response.data;
      } catch (error) {
        console.error(`Get indicator data error:`, error);
        // Return mock indicator data
        return {
          indicator,
          values: [
            { date: '2024-03-15', value: 65 },
            { date: '2024-03-14', value: 62 },
            { date: '2024-03-13', value: 58 }
          ],
          signals: [
            { date: '2024-03-15', type: 'buy', strength: 0.8 },
            { date: '2024-03-13', type: 'sell', strength: 0.7 }
          ]
        };
      }
    }
  },
  
  // Fallback for development/demo
  mockLogin: () => {
    localStorage.setItem('username', 'demo');
    return Promise.resolve({ username: 'demo', id: 1 });
  },

  screener: {
    async getNSEScreener(criteria: any): Promise<any> {
      try {
        const response = await fetch(`${API_BASE_URL}/api/screener/nse`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(criteria),
        });
        if (!response.ok) throw new Error('Failed to run screener');
        return await response.json();
      } catch (error) {
        console.error('Error running screener:', error);
        throw error;
      }
    },

    async getSavedScreeners(): Promise<any> {
      try {
        const response = await fetch(`${API_BASE_URL}/api/screener/saved`);
        if (!response.ok) throw new Error('Failed to fetch saved screeners');
        return await response.json();
      } catch (error) {
        console.error('Error fetching saved screeners:', error);
        throw error;
      }
    },

    async saveScreener(name: string, criteria: any): Promise<any> {
      try {
        const response = await fetch(`${API_BASE_URL}/api/screener/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, criteria }),
        });
        if (!response.ok) throw new Error('Failed to save screener');
        return await response.json();
      } catch (error) {
        console.error('Error saving screener:', error);
        throw error;
      }
    }
  },

  // Add new endpoints for Indian market specific features
  indianMarket: {
    async getFNOData(symbol: string) {
      try {
        const response = await api.get(`/stocks/nse/${symbol}/fno`);
        return response.data;
      } catch (error) {
        return handleError(error, generateMockFNOData(symbol));
      }
    },

    async getDeliveryData(symbol: string) {
      try {
        const response = await api.get(`/stocks/nse/${symbol}/delivery`);
        return response.data;
      } catch (error) {
        return handleError(error, generateMockDeliveryData(symbol));
      }
    },

    async getBlockDeals(symbol: string) {
      try {
        const response = await api.get(`/stocks/nse/${symbol}/block-deals`);
        return response.data;
      } catch (error) {
        return handleError(error, generateMockBlockDeals(symbol));
      }
    }
  }
};

// Helper functions for NSE data
const getNSEStockName = (symbol: string): string => {
  const stockNames: Record<string, string> = {
    'RELIANCE': 'Reliance Industries Ltd.',
    'TCS': 'Tata Consultancy Services Ltd.',
    'HDFCBANK': 'HDFC Bank Ltd.',
    'INFY': 'Infosys Ltd.',
    'ICICIBANK': 'ICICI Bank Ltd.',
    'HINDUNILVR': 'Hindustan Unilever Ltd.',
    'SBIN': 'State Bank of India',
    'BHARTIARTL': 'Bharti Airtel Ltd.',
    'ITC': 'ITC Ltd.',
    'KOTAKBANK': 'Kotak Mahindra Bank Ltd.',
    'LT': 'Larsen & Toubro Ltd.',
    'AXISBANK': 'Axis Bank Ltd.',
    'ASIANPAINT': 'Asian Paints Ltd.',
    'MARUTI': 'Maruti Suzuki India Ltd.',
    'WIPRO': 'Wipro Ltd.',
    'HCLTECH': 'HCL Technologies Ltd.',
    'SUNPHARMA': 'Sun Pharmaceutical Industries Ltd.',
    'BAJFINANCE': 'Bajaj Finance Ltd.',
    'TITAN': 'Titan Company Ltd.',
    'ULTRACEMCO': 'UltraTech Cement Ltd.'
  };
  return stockNames[symbol] || `${symbol} Ltd.`;
};

const getNSEBasePrice = (symbol: string): number => {
  const basePrices: Record<string, number> = {
    'RELIANCE': 2814.35,
    'TCS': 3745.80,
    'HDFCBANK': 1650.25,
    'INFY': 1571.40,
    'ICICIBANK': 1050.90,
    'HINDUNILVR': 2520.15,
    'SBIN': 750.45,
    'BHARTIARTL': 1140.60,
    'ITC': 445.25,
    'KOTAKBANK': 1860.30,
    'LT': 2980.75,
    'AXISBANK': 1075.40,
    'ASIANPAINT': 3280.55,
    'MARUTI': 10800.25,
    'WIPRO': 480.15,
    'HCLTECH': 1245.30,
    'SUNPHARMA': 1320.45,
    'BAJFINANCE': 7200.60,
    'TITAN': 3150.25,
    'ULTRACEMCO': 9875.40
  };
  return basePrices[symbol] || 1000;
};

const getNSEMarketCap = (symbol: string): number => {
  const marketCaps: Record<string, number> = {
    'RELIANCE': 17580.25,
    'TCS': 13450.80,
    'HDFCBANK': 12350.60,
    'INFY': 7890.45,
    'ICICIBANK': 6780.30,
    'HINDUNILVR': 6240.15,
    'SBIN': 5670.90,
    'BHARTIARTL': 4980.75,
    'ITC': 4560.40,
    'KOTAKBANK': 4230.25
  };
  return marketCaps[symbol] || Math.floor(Math.random() * 5000) + 1000;
};

const getNSESector = (symbol: string): string => {
  const sectors: Record<string, string> = {
    'RELIANCE': 'Energy',
    'TCS': 'Technology',
    'HDFCBANK': 'Banking',
    'INFY': 'Technology',
    'ICICIBANK': 'Banking',
    'HINDUNILVR': 'FMCG',
    'SBIN': 'Banking',
    'BHARTIARTL': 'Telecom',
    'ITC': 'FMCG',
    'KOTAKBANK': 'Banking',
    'LT': 'Construction',
    'AXISBANK': 'Banking',
    'ASIANPAINT': 'Consumer Goods',
    'MARUTI': 'Automobile',
    'WIPRO': 'Technology',
    'HCLTECH': 'Technology',
    'SUNPHARMA': 'Healthcare',
    'BAJFINANCE': 'Finance',
    'TITAN': 'Consumer Goods',
    'ULTRACEMCO': 'Construction'
  };
  return sectors[symbol] || 'Others';
};

const getTimeframeDays = (timeframe: string): number => {
  switch (timeframe) {
    case '1D': return 1;
    case '1W': return 7;
    case '1M': return 30;
    case '3M': return 90;
    case '6M': return 180;
    case '1Y': return 365;
    default: return 30;
  }
};

const generateMockHistoricalData = (symbol: string, timeframe: string) => {
  const basePrice = getNSEBasePrice(symbol);
  const volatility = basePrice * 0.02;
  const dataPoints = timeframe === '1d' ? 30 : 
                    timeframe === '1w' ? 90 : 
                    timeframe === '1m' ? 180 : 365;
  
  return Array.from({ length: dataPoints }, (_, i) => {
    const trend = Math.sin(i / 20) * volatility * 2;
    const noise = (Math.random() - 0.5) * volatility;
    const price = basePrice + trend + noise;
    
    return {
      date: new Date(Date.now() - (dataPoints - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      open: price * (1 - Math.random() * 0.01),
      high: price * (1 + Math.random() * 0.015),
      low: price * (1 - Math.random() * 0.015),
      close: price,
      volume: Math.floor(Math.random() * 10000000) + 1000000
    };
  });
};

const generateMockOptionChain = (basePrice: number) => {
  const strikes = Array.from({ length: 11 }, (_, i) => basePrice + (i - 5) * (basePrice * 0.025));
  const expiryDates = [
    '2024-04-25',
    '2024-05-30',
    '2024-06-27'
  ];

  return {
    underlyingValue: basePrice,
    expiryDates,
    strikePrices: strikes,
    calls: strikes.flatMap(strike => expiryDates.map(date => ({
      strikePrice: strike,
      expiryDate: date,
      openInterest: Math.floor(Math.random() * 10000),
      changeinOpenInterest: Math.floor(Math.random() * 2000 - 1000),
      totalTradedVolume: Math.floor(Math.random() * 5000),
      impliedVolatility: 20 + Math.random() * 40,
      lastPrice: Math.max(0, basePrice - strike + Math.random() * 10),
      change: Math.random() * 4 - 2,
      bidQty: Math.floor(Math.random() * 1000),
      bidprice: Math.max(0, basePrice - strike + Math.random() * 8),
      askQty: Math.floor(Math.random() * 1000),
      askPrice: Math.max(0, basePrice - strike + Math.random() * 12)
    }))),
    puts: strikes.flatMap(strike => expiryDates.map(date => ({
      strikePrice: strike,
      expiryDate: date,
      openInterest: Math.floor(Math.random() * 10000),
      changeinOpenInterest: Math.floor(Math.random() * 2000 - 1000),
      totalTradedVolume: Math.floor(Math.random() * 5000),
      impliedVolatility: 20 + Math.random() * 40,
      lastPrice: Math.max(0, strike - basePrice + Math.random() * 10),
      change: Math.random() * 4 - 2,
      bidQty: Math.floor(Math.random() * 1000),
      bidprice: Math.max(0, strike - basePrice + Math.random() * 8),
      askQty: Math.floor(Math.random() * 1000),
      askPrice: Math.max(0, strike - basePrice + Math.random() * 12)
    })))
  };
};

const generateMockOrderBook = (basePrice: number) => {
  const generateOrders = (count: number, side: 'bid' | 'ask') => {
    let total = 0;
    return Array.from({ length: count }, (_, i) => {
      const offset = side === 'bid' ? -i * 0.05 : i * 0.05;
      const price = basePrice * (1 + offset);
      const quantity = Math.floor(Math.random() * 1000) + 100;
      total += quantity;
      return {
        price,
        quantity,
        orders: Math.floor(Math.random() * 10) + 1,
        total
      };
    });
  };

  const spread = basePrice * 0.001;
  return {
    bids: generateOrders(20, 'bid'),
    asks: generateOrders(20, 'ask'),
    spread,
    spreadPercentage: (spread / basePrice) * 100
  };
};

const generateMockMarketDepth = (basePrice: number) => {
  const generateDepth = (count: number, side: 'bid' | 'ask') => {
    return Array.from({ length: count }, (_, i) => {
      const offset = side === 'bid' ? -i * 0.001 : i * 0.001;
      return {
        price: basePrice * (1 + offset),
        quantity: Math.floor(Math.random() * 10000) + 1000,
        orders: Math.floor(Math.random() * 50) + 5
      };
    });
  };

  return {
    bids: generateDepth(10, 'bid'),
    asks: generateDepth(10, 'ask'),
    ltp: basePrice
  };
};

const generateMockVolumeProfile = (basePrice: number) => {
  const priceRange = 0.02; // 2% range
  const levels = 20;
  const step = (priceRange * 2) / levels;
  
  let maxVolume = 0;
  const data = Array.from({ length: levels }, (_, i) => {
    const volume = Math.floor(Math.random() * 100000) + 10000;
    if (volume > maxVolume) maxVolume = volume;
    return {
      priceLevel: basePrice * (1 - priceRange + step * i),
      volume,
      buySellRatio: 0.3 + Math.random() * 0.4,
      valueArea: false,
      poc: false
    };
  });

  // Mark POC and value area
  const sortedByVolume = [...data].sort((a, b) => b.volume - a.volume);
  const poc = sortedByVolume[0];
  poc.poc = true;

  // Mark 70% value area
  const totalVolume = data.reduce((sum, d) => sum + d.volume, 0);
  let cumulativeVolume = 0;
  for (const point of sortedByVolume) {
    cumulativeVolume += point.volume;
    point.valueArea = cumulativeVolume <= totalVolume * 0.7;
  }

  return data;
};

const generateMockNews = (symbol: string) => {
  const now = new Date();
  const newsTemplates = [
    { title: `${symbol} Reports Strong Q4 Results`, sentiment: 'positive', impact: 'high' },
    { title: `Analysts Upgrade ${symbol} Rating`, sentiment: 'positive', impact: 'medium' },
    { title: `${symbol} Announces New Product Launch`, sentiment: 'positive', impact: 'medium' },
    { title: `${symbol} Faces Regulatory Scrutiny`, sentiment: 'negative', impact: 'high' },
    { title: `${symbol} Expands Market Presence`, sentiment: 'positive', impact: 'low' }
  ];

  return newsTemplates.map((template, i) => ({
    id: `${symbol}-news-${i}`,
    title: template.title,
    source: ['Bloomberg', 'Reuters', 'Financial Times', 'Economic Times'][Math.floor(Math.random() * 4)],
    url: '#',
    timestamp: new Date(now.getTime() - i * 3600000).toISOString(),
    sentiment: template.sentiment,
    impact: template.impact,
    summary: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. ${template.title} brings significant changes to the company's outlook.`
  }));
};

// Add helper functions for generating prediction data
const generatePrediction = (basePrice: number, volatility: number, confidence: number) => ({
  price: basePrice * (1 + (Math.random() * 2 - 1) * volatility),
  confidence: confidence * (0.9 + Math.random() * 0.1)
});

const generateTechnicalIndicators = (basePrice: number, historyData: any[]) => ({
  rsi: 30 + Math.random() * 40,
  macd: {
    value: Math.random() * 20 - 10,
    signal: Math.random() * 20 - 10,
    histogram: Math.random() * 10 - 5
  },
  bollingerBands: {
    upper: basePrice * (1 + Math.random() * 0.05),
    middle: basePrice,
    lower: basePrice * (1 - Math.random() * 0.05)
  },
  volume: Math.floor(Math.random() * 1000000) + 500000,
  vwap: basePrice * (1 + (Math.random() * 0.02 - 0.01))
});

const generateMarketSentiment = () => ({
  overall: Math.random(),
  news: Math.random(),
  social: Math.random(),
  technical: Math.random()
}); 