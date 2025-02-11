import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet, Clock, User, Terminal, BarChart2 } from "lucide-react";
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

const INITIAL_NSE_STOCKS: StockData[] = [
  { symbol: "RELIANCE", name: "Reliance Industries", price: 2467.85, change: 2.5, market: 'NSE' },
  { symbol: "TCS", name: "Tata Consultancy Services", price: 3890.45, change: -1.2, market: 'NSE' },
  { symbol: "HDFC", name: "HDFC Bank", price: 1678.30, change: 1.8, market: 'NSE' },
  { symbol: "INFY", name: "Infosys", price: 1567.90, change: -0.5, market: 'NSE' },
  { symbol: "ICICI", name: "ICICI Bank", price: 987.65, change: 3.2, market: 'NSE' },
  { symbol: "HUL", name: "Hindustan Unilever", price: 2456.70, change: -0.8, market: 'NSE' },
  { symbol: "ITC", name: "ITC Limited", price: 456.90, change: 1.5, market: 'NSE' },
  { symbol: "SBIN", name: "State Bank of India", price: 567.80, change: 2.1, market: 'NSE' },
  { symbol: "BHARTIARTL", name: "Bharti Airtel", price: 876.50, change: -1.3, market: 'NSE' },
  { symbol: "BAJFINANCE", name: "Bajaj Finance", price: 6789.40, change: 2.8, market: 'NSE' },
  { symbol: "WIPRO", name: "Wipro Limited", price: 456.70, change: -0.9, market: 'NSE' },
  { symbol: "HCLTECH", name: "HCL Technologies", price: 1234.50, change: 1.7, market: 'NSE' },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", price: 1876.30, change: -1.5, market: 'NSE' },
  { symbol: "LT", name: "Larsen & Toubro", price: 2567.80, change: 2.3, market: 'NSE' },
  { symbol: "M&M", name: "Mahindra & Mahindra", price: 1456.90, change: 1.9, market: 'NSE' },
  { symbol: "MARUTI", name: "Maruti Suzuki", price: 9876.50, change: -2.1, market: 'NSE' },
  { symbol: "NESTLEIND", name: "Nestle India", price: 21345.60, change: 0.8, market: 'NSE' },
  { symbol: "NTPC", name: "NTPC Limited", price: 234.50, change: 1.2, market: 'NSE' },
  { symbol: "ONGC", name: "Oil & Natural Gas Corp", price: 178.90, change: -1.7, market: 'NSE' },
  { symbol: "POWERGRID", name: "Power Grid Corp", price: 245.60, change: 0.9, market: 'NSE' },
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical", price: 1123.40, change: 2.4, market: 'NSE' },
  { symbol: "TATAMOTORS", name: "Tata Motors", price: 678.90, change: 3.1, market: 'NSE' },
  { symbol: "TATASTEEL", name: "Tata Steel", price: 123.45, change: -2.3, market: 'NSE' },
  { symbol: "TECHM", name: "Tech Mahindra", price: 1234.50, change: 1.6, market: 'NSE' },
  { symbol: "TITAN", name: "Titan Company", price: 2789.30, change: 0.7, market: 'NSE' },
  { symbol: "ULTRACEMCO", name: "UltraTech Cement", price: 8765.40, change: -1.4, market: 'NSE' },
  { symbol: "UPL", name: "UPL Limited", price: 567.80, change: 1.3, market: 'NSE' },
  { symbol: "VEDL", name: "Vedanta Limited", price: 345.60, change: -1.8, market: 'NSE' },
  { symbol: "ADANIENT", name: "Adani Enterprises", price: 2456.70, change: 4.2, market: 'NSE' },
  { symbol: "ASIANPAINT", name: "Asian Paints", price: 3456.70, change: -0.6, market: 'NSE' },
  { symbol: "AXISBANK", name: "Axis Bank", price: 987.60, change: 1.9, market: 'NSE' },
  { symbol: "BAJAJ-AUTO", name: "Bajaj Auto", price: 4567.80, change: -1.2, market: 'NSE' },
  { symbol: "BAJAJFINSV", name: "Bajaj Finserv", price: 1567.80, change: 2.7, market: 'NSE' },
  { symbol: "BPCL", name: "Bharat Petroleum", price: 432.10, change: 1.4, market: 'NSE' },
  { symbol: "BRITANNIA", name: "Britannia Industries", price: 4567.80, change: -0.8, market: 'NSE' },
  { symbol: "CIPLA", name: "Cipla Limited", price: 987.60, change: 2.1, market: 'NSE' },
  { symbol: "COALINDIA", name: "Coal India", price: 234.50, change: -1.5, market: 'NSE' },
  { symbol: "DIVISLAB", name: "Divi's Laboratories", price: 3456.70, change: 1.8, market: 'NSE' },
  { symbol: "DRREDDY", name: "Dr. Reddy's Labs", price: 4567.80, change: -2.1, market: 'NSE' },
  { symbol: "EICHERMOT", name: "Eicher Motors", price: 3456.70, change: 2.4, market: 'NSE' },
  { symbol: "GRASIM", name: "Grasim Industries", price: 1876.50, change: -1.7, market: 'NSE' },
  { symbol: "HEROMOTOCO", name: "Hero MotoCorp", price: 2789.30, change: 1.5, market: 'NSE' },
  { symbol: "HINDALCO", name: "Hindalco Industries", price: 456.70, change: -2.3, market: 'NSE' },
  { symbol: "INDUSINDBK", name: "IndusInd Bank", price: 1234.50, change: 2.8, market: 'NSE' },
  { symbol: "JSWSTEEL", name: "JSW Steel", price: 789.30, change: -1.9, market: 'NSE' },
  { symbol: "SHREECEM", name: "Shree Cement", price: 25678.90, change: 1.6, market: 'NSE' },
  { symbol: "TATACONSUM", name: "Tata Consumer", price: 876.50, change: -1.2, market: 'NSE' },
  { symbol: "ADANIPORTS", name: "Adani Ports & SEZ", price: 789.30, change: 3.4, market: 'NSE' },
  { symbol: "APOLLOHOSP", name: "Apollo Hospitals", price: 4567.80, change: -1.8, market: 'NSE' },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever", price: 2456.70, change: 1.5, market: 'NSE' }
];

const INITIAL_CRYPTO: StockData[] = [
  { symbol: "BTC", name: "Bitcoin", price: 3452000, change: 4.2, market: 'CRYPTO' },
  { symbol: "ETH", name: "Ethereum", price: 230000, change: 3.1, market: 'CRYPTO' },
  { symbol: "BNB", name: "Binance Coin", price: 32000, change: -2.3, market: 'CRYPTO' },
  { symbol: "SOL", name: "Solana", price: 7800, change: 5.6, market: 'CRYPTO' },
  { symbol: "XRP", name: "Ripple", price: 45, change: 2.8, market: 'CRYPTO' },
  { symbol: "ADA", name: "Cardano", price: 45, change: -1.7, market: 'CRYPTO' },
  { symbol: "AVAX", name: "Avalanche", price: 3400, change: 4.5, market: 'CRYPTO' },
  { symbol: "DOGE", name: "Dogecoin", price: 12, change: 6.7, market: 'CRYPTO' },
  { symbol: "DOT", name: "Polkadot", price: 1500, change: -3.2, market: 'CRYPTO' },
  { symbol: "MATIC", name: "Polygon", price: 120, change: 3.4, market: 'CRYPTO' },
  { symbol: "LINK", name: "Chainlink", price: 1800, change: -2.1, market: 'CRYPTO' },
  { symbol: "UNI", name: "Uniswap", price: 750, change: 4.8, market: 'CRYPTO' },
  { symbol: "ATOM", name: "Cosmos", price: 890, change: -1.9, market: 'CRYPTO' },
  { symbol: "LTC", name: "Litecoin", price: 7200, change: 2.7, market: 'CRYPTO' },
  { symbol: "BCH", name: "Bitcoin Cash", price: 23000, change: -2.5, market: 'CRYPTO' },
  { symbol: "FIL", name: "Filecoin", price: 450, change: 5.3, market: 'CRYPTO' },
  { symbol: "XLM", name: "Stellar", price: 12, change: -1.8, market: 'CRYPTO' },
  { symbol: "NEAR", name: "NEAR Protocol", price: 280, change: 3.9, market: 'CRYPTO' },
  { symbol: "ALGO", name: "Algorand", price: 18, change: -2.4, market: 'CRYPTO' },
  { symbol: "GRT", name: "The Graph", price: 15, change: 4.2, market: 'CRYPTO' },
  { symbol: "HBAR", name: "Hedera", price: 9, change: -1.5, market: 'CRYPTO' },
  { symbol: "MANA", name: "Decentraland", price: 45, change: 6.8, market: 'CRYPTO' },
  { symbol: "SAND", name: "The Sandbox", price: 52, change: -2.7, market: 'CRYPTO' },
  { symbol: "AAVE", name: "Aave", price: 8900, change: 3.6, market: 'CRYPTO' },
  { symbol: "CRV", name: "Curve DAO", price: 65, change: -1.9, market: 'CRYPTO' },
  { symbol: "SNX", name: "Synthetix", price: 280, change: 4.5, market: 'CRYPTO' },
  { symbol: "MKR", name: "Maker", price: 21000, change: -2.3, market: 'CRYPTO' },
  { symbol: "COMP", name: "Compound", price: 4500, change: 3.8, market: 'CRYPTO' },
  { symbol: "YFI", name: "Yearn.finance", price: 89000, change: -1.7, market: 'CRYPTO' },
  { symbol: "SUSHI", name: "SushiSwap", price: 140, change: 5.2, market: 'CRYPTO' }
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
  const [showRetroMode, setShowRetroMode] = useState(false);
  const [showProMode, setShowProMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedUser = localStorage.getItem('stockGameUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('stockGameUser', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNseStocks(prev =>
        prev.map(stock => ({
          ...stock,
          price: stock.price * (1 + (Math.random() - 0.5) * 0.04),
          change: ((Math.random() - 0.5) * 4)
        }))
      );

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
      wallet: 1000000,
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

  const handleRetroMode = () => {
    setShowRetroMode(!showRetroMode);
  };

  const handleProMode = () => {
    setShowProMode(!showProMode);
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

  if (showRetroMode) {
    return (
      <div className="p-6 font-mono">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Retro Trading Terminal</h1>
          <Button variant="outline" onClick={handleRetroMode}>
            <Terminal className="mr-2 h-4 w-4" />
            Exit Terminal
          </Button>
        </div>
        <Card className="p-4 bg-black text-green-500 font-mono">
          <pre className="whitespace-pre-wrap">
            {`
╔════════════════════════════════════════╗
║          MARKET ORDER BOOK             ║
╠════════════════════════════════════════╣
║ BUY                          SELL      ║
║ 100 @ 2450.00       50 @ 2451.00      ║
║ 200 @ 2449.50      150 @ 2451.50      ║
║ 300 @ 2449.00      200 @ 2452.00      ║
╚════════════════════════════════════════╝

           PRICE CHART (1H)
    2452 ┤      ╭─╮
    2451 ┤    ╭─╯ ╰╮
    2450 ┤╭─╮╭╯    ╰─╮
    2449 ┤╯ ╰╯       ╰
    2448 ┤

Enter command: _
            `}
          </pre>
          <div className="mt-4">
            <Input
              className="bg-black text-green-500 border-green-500"
              placeholder="Enter trading command (e.g., BUY RELIANCE 100)"
            />
          </div>
        </Card>
      </div>
    );
  }

  if (showProMode) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Professional Trading Terminal</h1>
          <Button variant="outline" onClick={handleProMode}>
            Exit Pro Mode
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Depth Chart */}
          <div className="md:col-span-2">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Market Depth</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Bids</h4>
                  <div className="space-y-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={`bid-${i}`} className="flex justify-between text-sm">
                        <span className="text-green-500">{(selectedAsset?.price || 0) - (i * 0.5)}</span>
                        <span>{Math.floor(Math.random() * 1000)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Asks</h4>
                  <div className="space-y-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={`ask-${i}`} className="flex justify-between text-sm">
                        <span className="text-red-500">{(selectedAsset?.price || 0) + (i * 0.5)}</span>
                        <span>{Math.floor(Math.random() * 1000)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Trade Feed */}
            <Card className="p-4 mt-6">
              <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => {
                  const isBuy = Math.random() > 0.5;
                  return (
                    <div key={`trade-${i}`} className="flex justify-between items-center text-sm">
                      <span>{new Date().toLocaleTimeString()}</span>
                      <span className={isBuy ? "text-green-500" : "text-red-500"}>
                        {selectedAsset?.symbol} @ ₹{selectedAsset?.price}
                      </span>
                      <span>{Math.floor(Math.random() * 100)}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Order Entry */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Order Entry</h3>
            <div className="space-y-4">
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  className="bg-green-500 hover:bg-green-600"
                  onClick={handleBuy}
                >
                  BUY
                </Button>
                <Button
                  className="bg-red-500 hover:bg-red-600"
                  onClick={handleSell}
                >
                  SELL
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Market Stats */}
        <Card className="p-4 mt-6">
          <h3 className="text-lg font-semibold mb-4">Market Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>24h Volume</Label>
              <div className="text-lg font-semibold">₹{(Math.random() * 1000000).toFixed(2)}</div>
            </div>
            <div>
              <Label>Open Interest</Label>
              <div className="text-lg font-semibold">₹{(Math.random() * 500000).toFixed(2)}</div>
            </div>
            <div>
              <Label>24h High</Label>
              <div className="text-lg font-semibold text-green-500">
                ₹{(selectedAsset?.price || 0 * 1.05).toFixed(2)}
              </div>
            </div>
            <div>
              <Label>24h Low</Label>
              <div className="text-lg font-semibold text-red-500">
                ₹{(selectedAsset?.price || 0 * 0.95).toFixed(2)}
              </div>
            </div>
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
          <Button variant="outline" onClick={handleProMode}>
            <BarChart2 className="mr-2 h-4 w-4" />
            Pro Mode
          </Button>
          <Button variant="outline" onClick={handleRetroMode}>
            <Terminal className="mr-2 h-4 w-4" />
            Terminal Mode
          </Button>
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