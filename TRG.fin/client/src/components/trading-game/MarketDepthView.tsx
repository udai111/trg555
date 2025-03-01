import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MarketDepth {
  price: number;
  size: number;
  total: number;
  percent: number;
}

interface MarketDepthViewProps {
  symbol?: string;
}

export function MarketDepthView({ symbol = 'DEMO' }: MarketDepthViewProps) {
  const [bids, setBids] = useState<MarketDepth[]>([]);
  const [asks, setAsks] = useState<MarketDepth[]>([]);

  useEffect(() => {
    // Generate mock market depth data if we're in demo mode
    if (symbol === 'DEMO') {
      const mockPrice = 150;
      const mockBids = Array.from({ length: 5 }, (_, i) => ({
        price: mockPrice - (i + 1) * 0.1,
        size: Math.floor(Math.random() * 100) + 50,
        total: 0,
        percent: Math.random() * 80 + 10
      }));
      
      const mockAsks = Array.from({ length: 5 }, (_, i) => ({
        price: mockPrice + (i + 1) * 0.1,
        size: Math.floor(Math.random() * 100) + 50,
        total: 0,
        percent: Math.random() * 80 + 10
      }));
      
      // Calculate totals
      let bidTotal = 0;
      mockBids.forEach(bid => {
        bidTotal += bid.size;
        bid.total = bidTotal;
      });
      
      let askTotal = 0;
      mockAsks.forEach(ask => {
        askTotal += ask.size;
        ask.total = askTotal;
      });
      
      setBids(mockBids);
      setAsks(mockAsks);
      
      // Update mock data periodically
      const interval = setInterval(() => {
        const newBids = mockBids.map(bid => ({
          ...bid,
          size: Math.floor(Math.random() * 100) + 50,
          percent: Math.random() * 80 + 10
        }));
        
        const newAsks = mockAsks.map(ask => ({
          ...ask,
          size: Math.floor(Math.random() * 100) + 50,
          percent: Math.random() * 80 + 10
        }));
        
        setBids(newBids);
        setAsks(newAsks);
      }, 5000);
      
      return () => clearInterval(interval);
    } else {
      // Real API call for non-demo mode
      const fetchMarketDepth = async () => {
        try {
          const response = await fetch(`http://localhost:5051/api/market-depth/${symbol}`);
          const data = await response.json();
          setBids(data.bids);
          setAsks(data.asks);
        } catch (error) {
          console.error('Error fetching market depth:', error);
        }
      };

      fetchMarketDepth();
      const interval = setInterval(fetchMarketDepth, 5000);
      return () => clearInterval(interval);
    }
  }, [symbol]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Depth {symbol !== 'DEMO' ? `- ${symbol}` : ''}</CardTitle>
      </CardHeader>
      <CardContent>
        {bids.length === 0 && asks.length === 0 ? (
          <div className="text-center text-muted-foreground">
            Loading market depth data...
          </div>
        ) : (
          <div className="space-y-2">
            <div className="space-y-1">
              {asks.slice().reverse().map((level, i) => (
                <div key={`ask-${i}`} className="relative">
                  <div
                    className="absolute inset-y-0 right-0 bg-red-500/10"
                    style={{ width: `${level.percent}%` }}
                  />
                  <div className="relative flex justify-between text-red-500 text-sm">
                    <span>{formatCurrency(level.price)}</span>
                    <span>{level.size}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-px bg-border my-2" />
            <div className="space-y-1">
              {bids.map((level, i) => (
                <div key={`bid-${i}`} className="relative">
                  <div
                    className="absolute inset-y-0 right-0 bg-green-500/10"
                    style={{ width: `${level.percent}%` }}
                  />
                  <div className="relative flex justify-between text-green-500 text-sm">
                    <span>{formatCurrency(level.price)}</span>
                    <span>{level.size}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 