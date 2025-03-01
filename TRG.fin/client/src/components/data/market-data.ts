export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  market: 'NSE' | 'CRYPTO';
}

export const INITIAL_NSE_STOCKS: StockData[] = [
  { symbol: "RELIANCE", name: "Reliance Industries", price: 2467.85, change: 2.5, market: 'NSE' },
  { symbol: "TCS", name: "Tata Consultancy Services", price: 3890.45, change: -1.2, market: 'NSE' },
  { symbol: "HDFC", name: "HDFC Bank", price: 1678.30, change: 1.8, market: 'NSE' },
  { symbol: "INFY", name: "Infosys", price: 1567.90, change: -0.5, market: 'NSE' },
  { symbol: "ICICI", name: "ICICI Bank", price: 987.65, change: 3.2, market: 'NSE' },
  { symbol: "HUL", name: "Hindustan Unilever", price: 2456.70, change: -0.8, market: 'NSE' },
  { symbol: "ITC", name: "ITC Limited", price: 456.90, change: 1.5, market: 'NSE' },
  { symbol: "SBIN", name: "State Bank of India", price: 567.80, change: 2.1, market: 'NSE' },
  { symbol: "BHARTIARTL", name: "Bharti Airtel", price: 876.50, change: -1.3, market: 'NSE' },
  { symbol: "BAJFINANCE", name: "Bajaj Finance", price: 6789.40, change: 2.8, market: 'NSE' }
];

export const INITIAL_CRYPTO: StockData[] = [
  { symbol: "BTC", name: "Bitcoin", price: 3452000, change: 4.2, market: 'CRYPTO' },
  { symbol: "ETH", name: "Ethereum", price: 230000, change: 3.1, market: 'CRYPTO' },
  { symbol: "BNB", name: "Binance Coin", price: 32000, change: -2.3, market: 'CRYPTO' },
  { symbol: "SOL", name: "Solana", price: 7800, change: 5.6, market: 'CRYPTO' },
  { symbol: "XRP", name: "Ripple", price: 45, change: 2.8, market: 'CRYPTO' },
  { symbol: "ADA", name: "Cardano", price: 45, change: -1.7, market: 'CRYPTO' },
  { symbol: "AVAX", name: "Avalanche", price: 3400, change: 4.5, market: 'CRYPTO' },
  { symbol: "DOGE", name: "Dogecoin", price: 12, change: 6.7, market: 'CRYPTO' },
  { symbol: "DOT", name: "Polkadot", price: 1500, change: -3.2, market: 'CRYPTO' },
  { symbol: "MATIC", name: "Polygon", price: 120, change: 3.4, market: 'CRYPTO' }
]; 