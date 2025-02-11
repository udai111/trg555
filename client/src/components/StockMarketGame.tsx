import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet, Clock } from "lucide-react";

interface StockData {
  symbol: string;
  price: number;
  change?: number;
}

interface Portfolio {
  [key: string]: {
    quantity: number;
    avgCost: number;
  };
}

interface GameState {
  wallet: number;
  portfolio: Portfolio;
}

const INITIAL_STOCKS: StockData[] = [
  { symbol: "AAPL", price: 189.30, change: 2.5 },
  { symbol: "GOOGL", price: 2756.80, change: -1.2 },
  { symbol: "MSFT", price: 345.67, change: 1.8 },
  { symbol: "AMZN", price: 3245.90, change: -0.5 },
  { symbol: "TSLA", price: 789.45, change: 3.2 },
  { symbol: "META", price: 467.89, change: 1.5 },
  { symbol: "NVDA", price: 678.34, change: 4.2 }
];

export default function StockMarketGame() {
  const [stocks, setStocks] = useState<StockData[]>(INITIAL_STOCKS);
  const [gameState, setGameState] = useState<GameState>({
    wallet: 100000, // Start with 100k virtual currency
    portfolio: {}
  });
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [timeElapsed, setTimeElapsed] = useState<number>(0);

  // Simulate price updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prevStocks =>
        prevStocks.map(stock => ({
          ...stock,
          price: stock.price * (1 + (Math.random() - 0.5) * 0.02), // ±1% random movement
          change: ((Math.random() - 0.5) * 4) // Random change between -2% and +2%
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Track game time
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBuy = () => {
    if (!selectedStock || !quantity) return;
    
    const qty = parseInt(quantity);
    const totalCost = qty * selectedStock.price;
    
    if (totalCost > gameState.wallet) {
      alert("Insufficient funds!");
      return;
    }

    setGameState(prev => {
      const currentHolding = prev.portfolio[selectedStock.symbol] || { quantity: 0, avgCost: 0 };
      const newQuantity = currentHolding.quantity + qty;
      const newAvgCost = ((currentHolding.quantity * currentHolding.avgCost) + totalCost) / newQuantity;

      return {
        wallet: prev.wallet - totalCost,
        portfolio: {
          ...prev.portfolio,
          [selectedStock.symbol]: {
            quantity: newQuantity,
            avgCost: newAvgCost
          }
        }
      };
    });

    setQuantity("");
  };

  const handleSell = () => {
    if (!selectedStock || !quantity) return;
    
    const qty = parseInt(quantity);
    const holding = gameState.portfolio[selectedStock.symbol];
    
    if (!holding || holding.quantity < qty) {
      alert("Not enough shares to sell!");
      return;
    }

    const proceeds = qty * selectedStock.price;

    setGameState(prev => {
      const newQuantity = holding.quantity - qty;
      const newPortfolio = { ...prev.portfolio };
      
      if (newQuantity <= 0) {
        delete newPortfolio[selectedStock.symbol];
      } else {
        newPortfolio[selectedStock.symbol] = {
          quantity: newQuantity,
          avgCost: holding.avgCost // Keep the same average cost
        };
      }

      return {
        wallet: prev.wallet + proceeds,
        portfolio: newPortfolio
      };
    });

    setQuantity("");
  };

  const calculateTotalValue = (): number => {
    return Object.entries(gameState.portfolio).reduce((total, [symbol, holding]) => {
      const stock = stocks.find(s => s.symbol === symbol);
      if (!stock) return total;
      return total + (stock.price * holding.quantity);
    }, gameState.wallet);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Stock Market Game</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span className="text-lg font-mono">{formatTime(timeElapsed)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            <span className="text-lg font-mono">₹{gameState.wallet.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Market Overview */}
        <Card className="p-4 col-span-2">
          <h2 className="text-lg font-semibold mb-4">Live Market</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stocks.map((stock) => (
              <motion.div
                key={stock.symbol}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-lg border cursor-pointer ${
                  selectedStock?.symbol === stock.symbol ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => setSelectedStock(stock)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{stock.symbol}</span>
                  {stock.change && (
                    <span className={`flex items-center ${stock.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stock.change > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {Math.abs(stock.change).toFixed(1)}%
                    </span>
                  )}
                </div>
                <p className="text-lg font-mono mt-1">₹{stock.price.toFixed(2)}</p>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Portfolio Overview */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Your Portfolio</h2>
          <div className="space-y-4">
            {Object.entries(gameState.portfolio).map(([symbol, holding]) => {
              const stock = stocks.find(s => s.symbol === symbol);
              if (!stock) return null;
              
              const currentValue = stock.price * holding.quantity;
              const profit = currentValue - (holding.avgCost * holding.quantity);
              
              return (
                <div key={symbol} className="p-3 bg-background rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{symbol}</span>
                    <span className={profit >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {profit >= 0 ? '+' : ''}{profit.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    <div>Qty: {holding.quantity}</div>
                    <div>Avg: ₹{holding.avgCost.toFixed(2)}</div>
                  </div>
                </div>
              );
            })}
            
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span>Total Value</span>
                <span className="font-bold">₹{calculateTotalValue().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Trading Panel */}
      {selectedStock && (
        <Card className="mt-6 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Trade {selectedStock.symbol}</h2>
            <p className="text-lg font-mono">₹{selectedStock.price.toFixed(2)}</p>
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label>Quantity</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
              />
            </div>
            <Button
              className="flex-1"
              onClick={handleBuy}
              disabled={!quantity || parseInt(quantity) < 1}
            >
              Buy
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleSell}
              disabled={!quantity || parseInt(quantity) < 1}
            >
              Sell
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
