import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Activity, TrendingUp, TrendingDown, RefreshCw, PlayCircle, PauseCircle, Settings2 } from "lucide-react";

interface Strategy {
  id: string;
  name: string;
  type: 'trend' | 'mean-reversion' | 'momentum' | 'arbitrage';
  config: {
    timeframe: string;
    indicator: string;
    entryThreshold: number;
    exitThreshold: number;
    stopLoss: number;
    takeProfit: number;
  };
}

interface Trade {
  id: string;
  strategy: string;
  symbol: string;
  type: 'buy' | 'sell';
  entryPrice: number;
  quantity: number;
  status: 'open' | 'closed';
  pnl?: number;
  timestamp: string;
}

const TRAlgoBot = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<string>("");
  const [strategies, setStrategies] = useState<Strategy[]>([
    {
      id: "ma-crossover",
      name: "MA Crossover",
      type: "trend",
      config: {
        timeframe: "5m",
        indicator: "MA",
        entryThreshold: 0.02,
        exitThreshold: 0.01,
        stopLoss: 2,
        takeProfit: 4
      }
    },
    {
      id: "rsi-mean-reversion",
      name: "RSI Mean Reversion",
      type: "mean-reversion",
      config: {
        timeframe: "15m",
        indicator: "RSI",
        entryThreshold: 30,
        exitThreshold: 70,
        stopLoss: 1.5,
        takeProfit: 3
      }
    }
  ]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [riskPerTrade, setRiskPerTrade] = useState(1);

  // Simulated market data
  const [marketData, setMarketData] = useState({
    price: 45000,
    volume: 1200000,
    change24h: 2.5
  });

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        // Simulate price movement
        setMarketData(prev => ({
          ...prev,
          price: prev.price * (1 + (Math.random() - 0.5) * 0.002),
          volume: prev.volume * (1 + (Math.random() - 0.5) * 0.1),
          change24h: prev.change24h + (Math.random() - 0.5)
        }));

        // Execute trading logic
        executeTrading();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isRunning, selectedStrategy]);

  const executeTrading = () => {
    const strategy = strategies.find(s => s.id === selectedStrategy);
    if (!strategy) return;

    // Simple trading logic based on strategy type
    const shouldEnterTrade = Math.random() > 0.8; // Simplified for demo
    if (shouldEnterTrade) {
      const newTrade: Trade = {
        id: Date.now().toString(),
        strategy: strategy.name,
        symbol: selectedSymbol,
        type: Math.random() > 0.5 ? 'buy' : 'sell',
        entryPrice: marketData.price,
        quantity: 0.1,
        status: 'open',
        timestamp: new Date().toISOString()
      };
      setTrades(prev => [newTrade, ...prev]);
    }
  };

  const toggleBot = () => {
    setIsRunning(!isRunning);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">TRAlgoBot - Advanced Trading System</h2>
        <Button
          onClick={toggleBot}
          variant={isRunning ? "destructive" : "default"}
          className="flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <PauseCircle className="h-5 w-5" />
              Stop Bot
            </>
          ) : (
            <>
              <PlayCircle className="h-5 w-5" />
              Start Bot
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Strategy Configuration</h3>
            <div className="space-y-4">
              <div>
                <Label>Trading Pair</Label>
                <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select symbol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTCUSDT">BTC/USDT</SelectItem>
                    <SelectItem value="ETHUSDT">ETH/USDT</SelectItem>
                    <SelectItem value="BNBUSDT">BNB/USDT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Strategy</Label>
                <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    {strategies.map(strategy => (
                      <SelectItem key={strategy.id} value={strategy.id}>
                        {strategy.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Risk Per Trade (%)</Label>
                <Input
                  type="number"
                  value={riskPerTrade}
                  onChange={(e) => setRiskPerTrade(Number(e.target.value))}
                  min="0.1"
                  max="5"
                  step="0.1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Market Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Current Price</span>
                <span className="text-xl font-bold">
                  ${marketData.price.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>24h Volume</span>
                <span>${(marketData.volume / 1000000).toFixed(2)}M</span>
              </div>
              <div className="flex justify-between items-center">
                <span>24h Change</span>
                <span className={marketData.change24h > 0 ? "text-green-500" : "text-red-500"}>
                  {marketData.change24h.toFixed(2)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total Trades</span>
                <span>{trades.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Win Rate</span>
                <span>67.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Profit Factor</span>
                <span>1.85</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Time</th>
                  <th className="text-left py-2">Strategy</th>
                  <th className="text-left py-2">Symbol</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Entry Price</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">P&L</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade.id} className="border-b">
                    <td className="py-2">{new Date(trade.timestamp).toLocaleTimeString()}</td>
                    <td className="py-2">{trade.strategy}</td>
                    <td className="py-2">{trade.symbol}</td>
                    <td className="py-2">
                      <span className={trade.type === 'buy' ? 'text-green-500' : 'text-red-500'}>
                        {trade.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2">${trade.entryPrice.toFixed(2)}</td>
                    <td className="py-2">{trade.status}</td>
                    <td className={`py-2 ${trade.pnl && trade.pnl > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {trade.pnl ? `${trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)}%` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TRAlgoBot;
