const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 5051;

// Configure CORS to allow requests from your React app
app.use(cors({
  origin: '*',  // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong'
  });
});

// Mock stock data
const stocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', current_price: '180.25', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', current_price: '320.15', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', current_price: '140.50', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', current_price: '130.75', sector: 'Technology' },
  { symbol: 'META', name: 'Meta Platforms Inc.', current_price: '290.85', sector: 'Technology' }
];

// Add error handling to axios requests
const safeAxiosGet = async (url, options = {}) => {
  try {
    const response = await axios.get(url, {
      timeout: 5000, // 5 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        ...options.headers
      },
      ...options
    });
    return response;
  } catch (error) {
    console.error('API Error:', error.message);
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
};

// Stocks endpoint
app.get('/api/stocks', (req, res) => {
  try {
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching stocks:', error);
    res.status(500).json({ error: 'Failed to fetch stocks' });
  }
});

// Predictions endpoint
app.get('/api/predictions/:symbol', (req, res) => {
  try {
    const { symbol } = req.params;
    const { model = 'ensemble', timeframe = '1d' } = req.query;
    
    // Find the stock's current price
    const stock = stocks.find(s => s.symbol === symbol);
    const currentPrice = stock ? parseFloat(stock.current_price) : 100;
    
    // Generate mock prediction data
    const prediction = {
      symbol,
      current_price: currentPrice,
      prediction_1d: currentPrice * (1 + (Math.random() * 0.04 - 0.02)), // ±2%
      prediction_1w: currentPrice * (1 + (Math.random() * 0.08 - 0.04)), // ±4%
      prediction_1m: currentPrice * (1 + (Math.random() * 0.15 - 0.075)), // ±7.5%
      confidence: 0.75 + Math.random() * 0.2,
      prediction_direction: Math.random() > 0.5 ? "up" : "down",
      features: {
        rsi: 30 + Math.random() * 40,
        macd: -2 + Math.random() * 4,
        volume: 1000000 + Math.random() * 2000000,
        moving_avg_50: currentPrice * 0.95,
        moving_avg_200: currentPrice * 0.90
      }
    };
    
    res.json(prediction);
  } catch (error) {
    console.error('Error generating predictions:', error);
    res.status(500).json({ error: 'Failed to generate predictions' });
  }
});

// Helper to generate simulated data
const generateSimulatedData = (symbol, basePrice = null) => {
  const isIndian = symbol.endsWith('.NS');
  const price = basePrice || (isIndian ? 1000 + Math.random() * 2000 : 100 + Math.random() * 200);
  const change = (Math.random() * 4 - 2) / 100; // -2% to +2%
  const volume = Math.floor(Math.random() * 1000000);
  
  return {
    symbol,
    regularMarketPrice: price,
    regularMarketChangePercent: change * 100,
    regularMarketChange: price * change,
    regularMarketVolume: volume,
    regularMarketOpen: price * (1 - Math.random() * 0.01),
    regularMarketDayHigh: price * (1 + Math.random() * 0.02),
    regularMarketDayLow: price * (1 - Math.random() * 0.02),
    fiftyDayAverage: price * (1 + (Math.random() * 0.1 - 0.05)),
    twoHundredDayAverage: price * (1 + (Math.random() * 0.2 - 0.1))
  };
};

// Quote endpoint
app.get('/api/quote/:symbol', (req, res) => {
  try {
    const { symbol } = req.params;
    const quote = generateSimulatedData(symbol);
    res.json(quote);
  } catch (error) {
    console.error('Error generating quote:', error);
    res.status(500).json({ error: 'Failed to generate quote' });
  }
});

// Historical data endpoint
app.get('/api/historical/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '1m', range = '1d' } = req.query;
    
    const now = Math.floor(Date.now() / 1000);
    const points = interval === '1m' ? 60 : interval === '5m' ? 12 : interval === '15m' ? 4 : 1;
    const secondsPerPoint = interval === '1m' ? 60 : interval === '5m' ? 300 : interval === '15m' ? 900 : 3600;
    
    const basePrice = symbol.endsWith('.NS') ? 1500 + Math.random() * 1000 : 100 + Math.random() * 200;
    let price = basePrice;
    
    const timestamps = [];
    const close = [];
    const volume = [];
    const open = [];
    const high = [];
    const low = [];
    
    for (let i = 0; i < points; i++) {
      const timestamp = now - (points - i) * secondsPerPoint;
      const priceChange = (Math.random() * 2 - 1) * 0.005 * price;
      price += priceChange;
      
      timestamps.push(timestamp);
      open.push(price - (Math.random() * price * 0.01));
      high.push(price * (1 + Math.random() * 0.01));
      low.push(price * (1 - Math.random() * 0.01));
      close.push(price);
      volume.push(Math.floor(Math.random() * 1000000));
    }
    
    res.json({
      timestamp: timestamps,
      close,
      volume,
      open,
      high,
      low
    });
  } catch (error) {
    console.error('Error generating historical data:', error);
    res.status(500).json({ error: 'Failed to generate historical data' });
  }
});

// Market depth endpoint
app.get('/api/market-depth/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const quote = generateSimulatedData(symbol);
    const price = quote.regularMarketPrice;
    const volume = quote.regularMarketVolume;
    
    const bids = Array.from({length: 5}, (_, i) => ({
      price: parseFloat((price * (1 - 0.001 * (i + 1))).toFixed(2)),
      size: Math.floor(volume / 10 * (1 - i * 0.15)),
      total: 0,
      percent: 0
    }));
    
    const asks = Array.from({length: 5}, (_, i) => ({
      price: parseFloat((price * (1 + 0.001 * (i + 1))).toFixed(2)),
      size: Math.floor(volume / 10 * (1 - i * 0.15)),
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
    
    res.json({ bids, asks });
  } catch (error) {
    console.error('Error generating market depth:', error);
    res.status(500).json({ error: 'Failed to generate market depth' });
  }
});

// Market sentiment endpoint
app.get('/api/market-sentiment', async (req, res) => {
  try {
    const usSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];
    const indianSymbols = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS'];
    const allSymbols = [...usSymbols, ...indianSymbols];
    
    const stockMovements = allSymbols.map(symbol => {
      const isIndian = symbol.endsWith('.NS');
      return {
        symbol: symbol,
        price: isIndian ? 1000 + Math.random() * 2000 : 100 + Math.random() * 200,
        change: Math.random() * 4 - 2 // Random change between -2% and +2%
      };
    });
    
    const advancers = stockMovements.filter(stock => stock.change > 0).length;
    const decliners = stockMovements.filter(stock => stock.change < 0).length;
    const unchanged = stockMovements.length - advancers - decliners;
    
    const usStocks = stockMovements.filter(stock => !stock.symbol.endsWith('.NS'));
    const indianStocks = stockMovements.filter(stock => stock.symbol.endsWith('.NS'));
    
    const usAvgChange = usStocks.reduce((sum, stock) => sum + stock.change, 0) / usStocks.length;
    const indianAvgChange = indianStocks.reduce((sum, stock) => sum + stock.change, 0) / indianStocks.length;
    const overallAvgChange = stockMovements.reduce((sum, stock) => sum + stock.change, 0) / stockMovements.length;
    
    const getSentiment = (change) => {
      if (change > 1.5) return "very_bullish";
      if (change > 0.5) return "bullish";
      if (change > -0.5) return "neutral";
      if (change > -1.5) return "bearish";
      return "very_bearish";
    };
    
    res.json({
      overall: getSentiment(overallAvgChange),
      indicators: {
        advanceDeclineRatio: parseFloat((advancers / (decliners || 1)).toFixed(2)),
        marketBreadth: parseFloat(((advancers - decliners) / stockMovements.length).toFixed(2)),
        volatilityIndex: parseFloat((15 + Math.random() * 10).toFixed(2)),
        tradingVolume: Math.floor(Math.random() * 1000000000)
      },
      regional: {
        us: {
          sentiment: getSentiment(usAvgChange),
          averageChange: parseFloat(usAvgChange.toFixed(2))
        },
        india: {
          sentiment: getSentiment(indianAvgChange),
          averageChange: parseFloat(indianAvgChange.toFixed(2))
        }
      },
      marketStats: {
        advancers,
        decliners,
        unchanged
      },
      stocks: stockMovements
    });
  } catch (error) {
    console.error('Error generating market sentiment:', error);
    res.status(500).json({ error: 'Failed to generate market sentiment' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server with error handling
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}).on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please try a different port or kill the process using this port.`);
    process.exit(1);
  } else {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
});