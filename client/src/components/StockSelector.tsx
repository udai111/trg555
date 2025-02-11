import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type MarketType = 'indian' | 'crypto' | 'forex';

const MARKET_SYMBOLS = {
  indian: ['INFY', 'TCS', 'RELIANCE', 'HDFCBANK', 'WIPRO'],
  crypto: ['BTCUSD', 'ETHUSD', 'BNBUSD', 'SOLUSD', 'ADAUSD'],
  forex: ['USDINR', 'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD']
};

interface StockSelectorProps {
  onStockChange: (symbol: string) => void;
}

export default function StockSelector({ onStockChange }: StockSelectorProps) {
  const [market, setMarket] = useState<MarketType>('indian');
  
  return (
    <div className="flex gap-4">
      <Select onValueChange={(value: MarketType) => setMarket(value)} defaultValue={market}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select market" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="indian">Indian Market</SelectItem>
          <SelectItem value="crypto">Cryptocurrency</SelectItem>
          <SelectItem value="forex">Forex</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={onStockChange} defaultValue="INFY">
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
