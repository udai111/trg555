export interface MarketData {
  price: number;
  change: number;
  high: number;
  low: number;
  volume: number;
}

export async function fetchMarketData(symbol: string): Promise<MarketData> {
  // Simulate an API call to fetch market data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        price: 42568.75 + Math.random() * 1000,
        change: Math.random() * 2 - 1,
        high: 43100.50 + Math.random() * 1000,
        low: 42100.25 - Math.random() * 1000,
        volume: 1250000000 + Math.random() * 1000000
      });
    }, 1000);
  });
} 