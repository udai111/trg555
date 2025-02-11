import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet, Clock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  market: 'NSE' | 'CRYPTO';
}

interface Portfolio {
  [key: string]: {
    quantity: number;
    avgCost: number;
    market: 'NSE' | 'CRYPTO';
  };
}

interface User {
  username: string;
  wallet: number;
  portfolio: Portfolio;
}

// Mock initial stocks data with real NSE stocks
const INITIAL_NSE_STOCKS: StockData[] = [
  { symbol: "RELIANCE", name: "Reliance Industries", price: 2300, change: 2.5, market: 'NSE' },
  { symbol: "TCS", name: "Tata Consultancy Services", price: 3100, change: -1.2, market: 'NSE' },
  { symbol: "HDFC", name: "HDFC Bank", price: 1600, change: 1.8, market: 'NSE' },
  { symbol: "INFY", name: "Infosys", price: 1500, change: -0.5, market: 'NSE' },
  { symbol: "ICICI", name: "ICICI Bank", price: 900, change: 3.2, market: 'NSE' },
  { symbol: "WIPRO", name: "Wipro Ltd", price: 450, change: 1.5, market: 'NSE' },
  { symbol: "BHARTIARTL", name: "Bharti Airtel", price: 850, change: 2.1, market: 'NSE' },
  { symbol: "HCLTECH", name: "HCL Technologies", price: 1200, change: -0.8, market: 'NSE' }
];

// Mock cryptocurrencies data
const INITIAL_CRYPTO: StockData[] = [
  { symbol: "BTC", name: "Bitcoin", price: 3452000, change: 4.2, market: 'CRYPTO' },
  { symbol: "ETH", name: "Ethereum", price: 230000, change: 3.1, market: 'CRYPTO' },
  { symbol: "BNB", name: "Binance Coin", price: 32000, change: -2.3, market: 'CRYPTO' },
  { symbol: "SOL", name: "Solana", price: 7800, change: 5.6, market: 'CRYPTO' },
  { symbol: "ADA", name: "Cardano", price: 45, change: -1.7, market: 'CRYPTO' },
  { symbol: "DOT", name: "Polkadot", price: 1500, change: 2.8, market: 'CRYPTO' }
];

export default function StockMarketGame() {
  const [activeMarket, setActiveMarket] = useState<'NSE' | 'CRYPTO'>('NSE');
  const [nseStocks, setNseStocks] = useState<StockData[]>(INITIAL_NSE_STOCKS);
  const [cryptos, setCryptos] = useState<StockData[]>(INITIAL_CRYPTO);
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<StockData | null>(null);
  const [quantity, setQuantity] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const { toast } = useToast();

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('stockGameUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Save user data to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('stockGameUser', JSON.stringify(user));
    }
  }, [user]);

  // Update prices periodically with market-specific volatility
  useEffect(() => {
    const interval = setInterval(() => {
      // NSE stocks: Lower volatility (±2%)
      setNseStocks(prev =>
        prev.map(stock => ({
          ...stock,
          price: stock.price * (1 + (Math.random() - 0.5) * 0.04),
          change: ((Math.random() - 0.5) * 4)
        }))
      );

      // Crypto: Higher volatility (±5%)
      setCryptos(prev =>
        prev.map(crypto => ({
          ...crypto,
          price: crypto.price * (1 + (Math.random() - 0.5) * 0.1),
          change: ((Math.random() - 0.5) * 10)
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

  const handleLogin = () => {
    if (!username) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive"
      });
      return;
    }

    const newUser: User = {
      username,
      wallet: 1000000, // Start with 10 Lakh virtual currency
      portfolio: {}
    };
    setUser(newUser);
    setUsername('');

    toast({
      title: "Welcome!",
      description: "You've been given ₹10,00,000 to start trading!"
    });
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('stockGameUser');
    toast({
      title: "Logged out",
      description: "Come back soon!"
    });
  };

  const handleBuy = () => {
    if (!user || !selectedAsset || !quantity) return;

    const qty = parseInt(quantity);
    const totalCost = qty * selectedAsset.price;

    if (totalCost > user.wallet) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough money for this transaction",
        variant: "destructive"
      });
      return;
    }

    const newPortfolio = { ...user.portfolio };
    const currentHolding = newPortfolio[selectedAsset.symbol] || { 
      quantity: 0, 
      avgCost: 0,
      market: selectedAsset.market 
    };

    const newQuantity = currentHolding.quantity + qty;
    const newAvgCost = ((currentHolding.quantity * currentHolding.avgCost) + totalCost) / newQuantity;

    newPortfolio[selectedAsset.symbol] = {
      quantity: newQuantity,
      avgCost: newAvgCost,
      market: selectedAsset.market
    };

    setUser({
      ...user,
      wallet: user.wallet - totalCost,
      portfolio: newPortfolio
    });

    setQuantity('');
    toast({
      title: "Purchase successful",
      description: `Bought ${qty} ${selectedAsset.market === 'CRYPTO' ? 'coins' : 'shares'} of ${selectedAsset.symbol}`
    });
  };

  const handleSell = () => {
    if (!user || !selectedAsset || !quantity) return;

    const qty = parseInt(quantity);
    const holding = user.portfolio[selectedAsset.symbol];

    if (!holding || holding.quantity < qty) {
      toast({
        title: "Insufficient holdings",
        description: `You don't have enough ${selectedAsset.market === 'CRYPTO' ? 'coins' : 'shares'} to sell`,
        variant: "destructive"
      });
      return;
    }

    const proceeds = qty * selectedAsset.price;
    const newPortfolio = { ...user.portfolio };
    const newQuantity = holding.quantity - qty;

    if (newQuantity <= 0) {
      delete newPortfolio[selectedAsset.symbol];
    } else {
      newPortfolio[selectedAsset.symbol] = {
        quantity: newQuantity,
        avgCost: holding.avgCost,
        market: holding.market
      };
    }

    setUser({
      ...user,
      wallet: user.wallet + proceeds,
      portfolio: newPortfolio
    });

    setQuantity('');
    toast({
      title: "Sale successful",
      description: `Sold ${qty} ${selectedAsset.market === 'CRYPTO' ? 'coins' : 'shares'} of ${selectedAsset.symbol}`
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculatePortfolioValue = (): number => {
    if (!user) return 0;
    return Object.entries(user.portfolio).reduce((total, [symbol, holding]) => {
      const asset = holding.market === 'NSE' 
        ? nseStocks.find(s => s.symbol === symbol)
        : cryptos.find(c => c.symbol === symbol);

      if (!asset) return total;
      return total + (asset.price * holding.quantity);
    }, user.wallet);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-[400px] p-6">
          <h1 className="text-2xl font-bold mb-6">Virtual Trading Platform</h1>
          <div className="space-y-4">
            <div>
              <Label>Username</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username to start trading"
              />
            </div>
            <Button className="w-full" onClick={handleLogin}>
              Start Trading
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentAssets = activeMarket === 'NSE' ? nseStocks : cryptos;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Virtual Trading Platform</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <span>{user.username}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span className="font-mono">{formatTime(timeElapsed)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            <span className="font-mono">₹{user.wallet.toFixed(2)}</span>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2">
          <Tabs defaultValue="NSE" className="w-full" onValueChange={(v) => setActiveMarket(v as 'NSE' | 'CRYPTO')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="NSE">NSE Stocks</TabsTrigger>
              <TabsTrigger value="CRYPTO">Crypto</TabsTrigger>
            </TabsList>

            <Card className="mt-4 p-4">
              <h2 className="text-lg font-semibold mb-4">
                {activeMarket === 'NSE' ? 'NSE Market' : 'Crypto Market'}
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {currentAssets.map((asset) => (
                  <motion.div
                    key={asset.symbol}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg border cursor-pointer ${
                      selectedAsset?.symbol === asset.symbol ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{asset.symbol}</span>
                      <span className={`flex items-center ${asset.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {asset.change > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {Math.abs(asset.change).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{asset.name}</p>
                    <p className="text-lg font-mono mt-1">₹{asset.price.toFixed(2)}</p>
                  </motion.div>
                ))}
              </div>
            </Card>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Your Portfolio</h2>
            <div className="space-y-4">
              {Object.entries(user.portfolio).map(([symbol, holding]) => {
                const asset = holding.market === 'NSE'
                  ? nseStocks.find(s => s.symbol === symbol)
                  : cryptos.find(c => c.symbol === symbol);

                if (!asset) return null;

                const currentValue = asset.price * holding.quantity;
                const profit = currentValue - (holding.avgCost * holding.quantity);

                return (
                  <div key={symbol} className="p-3 bg-accent/10 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{symbol}</span>
                        <span className="text-xs ml-2 text-muted-foreground">({holding.market})</span>
                      </div>
                      <span className={profit >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {profit >= 0 ? '+' : ''}₹{profit.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <div>Quantity: {holding.quantity}</div>
                      <div>Avg Cost: ₹{holding.avgCost.toFixed(2)}</div>
                      <div>Current: ₹{asset.price.toFixed(2)}</div>
                    </div>
                  </div>
                );
              })}

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span>Total Value</span>
                  <span className="font-bold">₹{calculatePortfolioValue().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>

          {selectedAsset && (
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">
                Trade {selectedAsset.symbol}
                <span className="text-sm font-normal ml-2 text-muted-foreground">({selectedAsset.market})</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>Current Price</Label>
                  <p className="text-lg font-mono">₹{selectedAsset.price.toFixed(2)}</p>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                  />
                </div>
                <div className="flex gap-4">
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
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}