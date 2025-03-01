// Server Configuration
export const SERVER_CONFIG = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000'
};

// NSE API Configuration
export const NSE_API_BASE_URL = 'https://www.nseindia.com';
export const NSE_API_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'DNT': '1',
  'Sec-Fetch-Site': 'same-origin',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Dest': 'empty'
};

// Database Configuration
export const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'trgfin',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
};

// Redis Configuration (for caching)
export const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || ''
};

// Cache TTL Configuration (in seconds)
export const CACHE_CONFIG = {
  STOCK_QUOTE: 5, // 5 seconds
  STOCK_DETAILS: 300, // 5 minutes
  OPTION_CHAIN: 60, // 1 minute
  HISTORICAL_DATA: 3600, // 1 hour
  SECTOR_DATA: 1800 // 30 minutes
};

// Rate Limiting Configuration
export const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
};

// ML Model Configuration
export const ML_CONFIG = {
  MODEL_PATH: process.env.MODEL_PATH || './models',
  BATCH_SIZE: 32,
  EPOCHS: 100,
  VALIDATION_SPLIT: 0.2,
  SEQUENCE_LENGTH: 60,
  FEATURE_COLUMNS: [
    'open', 'high', 'low', 'close', 'volume',
    'rsi', 'macd', 'signal', 'bb_upper', 'bb_middle', 'bb_lower'
  ]
};

// Logging Configuration
export const LOG_CONFIG = {
  LEVEL: process.env.LOG_LEVEL || 'info',
  FILE_PATH: process.env.LOG_FILE || './logs/app.log'
}; 