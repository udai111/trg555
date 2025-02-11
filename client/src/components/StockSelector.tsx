import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type MarketType = 'indian' | 'us' | 'crypto' | 'forex';

const MARKET_SYMBOLS = {
  indian: ['INFY', 'TCS', 'RELIANCE', 'HDFCBANK', 'WIPRO'],
  us: ['AAPL', 'GOOG', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA'],
  crypto: ['BTCUSD', 'ETHUSD', 'BNBUSD', 'SOLUSD', 'ADAUSD'],
  forex: ['USDINR', 'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD']
};

interface StockSelectorProps {
  onStockChange: (symbol: string) => void;
}

export default function StockSelector({ onStockChange }: StockSelectorProps) {
  const [market, setMarket] = useState<MarketType>('us');
  const [currentSymbol, setCurrentSymbol] = useState(MARKET_SYMBOLS[market][0]);

  const handleMarketChange = (value: MarketType) => {
    setMarket(value);
    const newSymbol = MARKET_SYMBOLS[value][0];
    setCurrentSymbol(newSymbol);
    onStockChange(newSymbol);
  };

  const handleSymbolChange = (value: string) => {
    setCurrentSymbol(value);
    onStockChange(value);
  };

  return (
    <div className="flex gap-4">
      <Select onValueChange={handleMarketChange} value={market}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select market" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="us">US Market</SelectItem>
          <SelectItem value="indian">Indian Market</SelectItem>
          <SelectItem value="crypto">Cryptocurrency</SelectItem>
          <SelectItem value="forex">Forex</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={handleSymbolChange} value={currentSymbol}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select symbol" />
        </SelectTrigger>
        <SelectContent>
          {MARKET_SYMBOLS[market].map((symbol) => (
            <SelectItem key={symbol} value={symbol}>
              {symbol}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}