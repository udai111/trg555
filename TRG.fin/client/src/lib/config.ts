// Environment variables with fallbacks
const getEnvVar = (key: string, fallback: string): string => {
  if (typeof window !== 'undefined' && (window as any).__env && (window as any).__env[key]) {
    return (window as any).__env[key];
  }
  try {
    return (import.meta.env[key] || fallback) as string;
  } catch {
    return fallback;
  }
};

// Environment Configuration
export const IS_DEV = getEnvVar('REACT_APP_ENV', 'development') === 'development';
export const USE_MOCK_DATA = getEnvVar('REACT_APP_USE_MOCK_DATA', 'true') === 'true';
export const MOCK_DATA_DELAY = parseInt(getEnvVar('REACT_APP_MOCK_DATA_DELAY', '500'), 10);

// API Configuration
export const API_BASE_URL = getEnvVar('REACT_APP_API_URL', 'http://localhost:5051');
export const WS_BASE_URL = getEnvVar('REACT_APP_WS_URL', 'ws://localhost:5051');

// NSE Data Configuration
export const NSE_CONFIG = {
  DEFAULT_INDICES: ['NIFTY 50', 'NIFTY BANK', 'NIFTY IT'],
  PRICE_UPDATE_INTERVAL: 1000,
  REALTIME_ENABLED: true,
  DATA_SOURCES: {
    NSE: true,
    YAHOO: true,
    ALPHA_VANTAGE: false
  }
};

// Feature Flags
export const FEATURES = {
  REAL_TIME_DATA: true,
  PAPER_TRADING: true,
  BACKTESTING: true,
  SENTIMENT_ANALYSIS: true,
  OPTION_CHAIN: true,
  PORTFOLIO_ANALYTICS: true,
  RISK_METRICS: true,
  SCREENER: true,
  ALERTS: true,
  NEWS_FEED: true
};

// Trading Configuration
export const TRADING_CONFIG = {
  DEFAULT_CAPITAL: 100000,
  MAX_POSITIONS: 10,
  DEFAULT_RISK_PER_TRADE: 1, // percentage
  DEFAULT_STOP_LOSS: 2, // percentage
  DEFAULT_TAKE_PROFIT: 3, // percentage
  MIN_TRADE_AMOUNT: 1000,
  MAX_LEVERAGE: 3,
  POSITION_SIZING: {
    FIXED: 'fixed',
    RISK_BASED: 'risk_based',
    KELLY_CRITERION: 'kelly',
    POSITION_SIZING_MODELS: ['fixed', 'risk_based', 'kelly']
  },
  ORDER_TYPES: ['MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT'],
  RISK_MANAGEMENT: {
    MAX_DRAWDOWN: 20,
    DAILY_LOSS_LIMIT: 5,
    POSITION_SIZE_LIMIT: 10
  }
};

// Time Constants
export const TIME_CONSTANTS = {
  PRICE_UPDATE_INTERVAL: 5000, // 5 seconds
  CHART_UPDATE_INTERVAL: 60000, // 1 minute
  SESSION_TIMEOUT: 3600000, // 1 hour
  MARKET_HOURS: {
    OPEN: '09:15',
    CLOSE: '15:30',
    PRE_MARKET: '09:00',
    POST_MARKET: '15:45'
  },
  TIMEFRAMES: {
    M1: '1m',
    M5: '5m',
    M15: '15m',
    M30: '30m',
    H1: '1h',
    H4: '4h',
    D1: '1d',
    W1: '1w',
    MN1: '1M'
  }
};

// Chart Configuration
export const CHART_CONFIG = {
  DEFAULT_TIMEFRAME: '1D',
  AVAILABLE_TIMEFRAMES: ['1m', '5m', '15m', '30m', '1h', '4h', '1D', '1W', '1M'],
  DEFAULT_CHART_TYPE: 'candlestick',
  CHART_TYPES: ['line', 'candlestick', 'area', 'bar', 'heikin-ashi'],
  INDICATORS: {
    TREND: ['SMA', 'EMA', 'MACD', 'Bollinger Bands'],
    MOMENTUM: ['RSI', 'Stochastic', 'CCI', 'Williams %R'],
    VOLUME: ['Volume', 'OBV', 'Money Flow Index'],
    VOLATILITY: ['ATR', 'Standard Deviation'],
    CUSTOM: ['Support/Resistance', 'Fibonacci', 'Pivot Points']
  },
  DRAWING_TOOLS: ['Line', 'Channel', 'Fibonacci', 'Rectangle', 'Triangle']
};

// ML Model Configuration
export const ML_CONFIG = {
  ERROR_RETRY_COUNT: parseInt(getEnvVar('REACT_APP_ERROR_RETRY_COUNT', '1'), 10),
  ERROR_RETRY_DELAY: parseInt(getEnvVar('REACT_APP_ERROR_RETRY_DELAY', '1000'), 10),
  CACHE_DURATION: parseInt(getEnvVar('REACT_APP_CACHE_DURATION', '300000'), 10),
  UPDATE_INTERVAL: parseInt(getEnvVar('REACT_APP_UPDATE_INTERVAL', '60000'), 10),
  FALLBACK_MODE: getEnvVar('REACT_APP_FALLBACK_MODE', 'true') === 'true',
  DEBUG_MODE: getEnvVar('REACT_APP_DEBUG_MODE', 'true') === 'true',
  LOG_LEVEL: getEnvVar('REACT_APP_LOG_LEVEL', 'debug'),
  ENABLE_MOCK_TRADING: getEnvVar('REACT_APP_ENABLE_MOCK_TRADING', 'true') === 'true',
  ENABLE_MOCK_PREDICTIONS: getEnvVar('REACT_APP_ENABLE_MOCK_PREDICTIONS', 'true') === 'true',
  DEFAULT_MODEL: getEnvVar('REACT_APP_DEFAULT_MODEL', 'ensemble'),
  DEFAULT_TIMEFRAME: getEnvVar('REACT_APP_DEFAULT_TIMEFRAME', '1d'),
  MAX_RETRY_ATTEMPTS: parseInt(getEnvVar('REACT_APP_MAX_RETRY_ATTEMPTS', '1'), 10),
  ENABLE_ERROR_REPORTING: getEnvVar('REACT_APP_ENABLE_ERROR_REPORTING', 'true') === 'true',
  AVAILABLE_MODELS: [
    { id: 'ensemble', name: 'Ensemble Model', confidence: 0.85, description: 'Combines multiple models for better accuracy' },
    { id: 'lstm', name: 'LSTM', confidence: 0.80, description: 'Deep learning model for time series prediction' },
    { id: 'randomforest', name: 'Random Forest', confidence: 0.75, description: 'Tree-based ensemble learning model' },
    { id: 'xgboost', name: 'XGBoost', confidence: 0.82, description: 'Gradient boosting model' },
    { id: 'transformer', name: 'Transformer', confidence: 0.87, description: 'Attention-based deep learning model for time series forecasting' },
    { id: 'prophet', name: 'Prophet', confidence: 0.79, description: 'Facebook\'s time series forecasting model' },
    { id: 'arima', name: 'ARIMA', confidence: 0.72, description: 'Statistical model for time series analysis' },
    { id: 'garch', name: 'GARCH', confidence: 0.76, description: 'Volatility forecasting model' },
    { id: 'neuralnet', name: 'Neural Network', confidence: 0.83, description: 'Deep neural network with multiple hidden layers' },
    { id: 'quantile', name: 'Quantile Regression', confidence: 0.78, description: 'Predicts different quantiles for risk assessment' },
    { id: 'wavenet', name: 'WaveNet', confidence: 0.84, description: 'Deep generative model for time series' },
    { id: 'hybrid', name: 'Hybrid LSTM-GRU', confidence: 0.86, description: 'Combines LSTM and GRU cells for better performance' }
  ],
  MODEL_CATEGORIES: {
    STATISTICAL: ['arima', 'garch', 'quantile'],
    MACHINE_LEARNING: ['randomforest', 'xgboost'],
    DEEP_LEARNING: ['lstm', 'transformer', 'neuralnet', 'wavenet', 'hybrid'],
    ENSEMBLE: ['ensemble'],
    SPECIALIZED: ['prophet']
  },
  MODEL_EVALUATION_METRICS: [
    'RMSE', 'MAE', 'MAPE', 'R-Squared', 'Sharpe Ratio', 
    'Sortino Ratio', 'Calmar Ratio', 'Maximum Drawdown'
  ],
  FEATURE_IMPORTANCE: {
    TRACK: true,
    TOP_FEATURES_COUNT: 10
  },
  HYPERPARAMETER_OPTIMIZATION: {
    ENABLED: true,
    METHOD: 'bayesian',
    MAX_TRIALS: 20,
    CROSS_VALIDATION_FOLDS: 5
  },
  EXPLAINABILITY: {
    ENABLED: true,
    METHODS: ['SHAP', 'LIME', 'Partial Dependence Plots']
  }
};

// Screener Configuration
export const SCREENER_CONFIG = {
  FILTERS: {
    TECHNICAL: [
      'Price Above MA', 'RSI Oversold', 'MACD Crossover',
      'Volume Spike', 'Bollinger Band Squeeze'
    ],
    FUNDAMENTAL: [
      'PE Ratio', 'PB Ratio', 'Debt to Equity',
      'ROE', 'Profit Growth', 'Revenue Growth'
    ],
    CUSTOM: true
  },
  SCAN_INTERVALS: ['1m', '5m', '15m', '1h', '1d'],
  MAX_RESULTS: 50
};

// Alert Configuration
export const ALERT_CONFIG = {
  TYPES: ['PRICE', 'TECHNICAL', 'VOLUME', 'NEWS', 'CUSTOM'],
  NOTIFICATION_METHODS: ['APP', 'EMAIL', 'SMS'],
  MAX_ACTIVE_ALERTS: 20
};

// Portfolio Analytics Configuration
export const PORTFOLIO_CONFIG = {
  METRICS: [
    'Alpha', 'Beta', 'Sharpe Ratio', 'Sortino Ratio',
    'Max Drawdown', 'Value at Risk', 'Correlation Matrix'
  ],
  REBALANCING: {
    AUTO: true,
    INTERVALS: ['DAILY', 'WEEKLY', 'MONTHLY'],
    THRESHOLD: 5 // percentage
  }
}; 