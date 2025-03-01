import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart2, LineChart, CandlestickChart, Zap } from "lucide-react";
import { fetchMarketData } from "@/utils/api"; // Assume this is a utility function to fetch market data
import AdvancedChart from "@/components/AdvancedChart"; // Assume this is a more advanced chart component

export default function ProTrading() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [orderType, setOrderType] = useState("limit");
  const [side, setSide] = useState("buy");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [timeframe, setTimeframe] = useState("1h");
  const [marketData, setMarketData] = useState({
    price: 0,
    change: 0,
    high: 0,
    low: 0,
    volume: 0
  });

  // Fetch real-time market data
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchMarketData(symbol);
      setMarketData(data);
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [symbol]);

  const handlePlaceOrder = () => {
    alert(`Order placed: ${side.toUpperCase()} ${quantity} ${symbol} at ${price ? price : 'MARKET'}`);
  };

  return (
    <div className="pro-trading-container grid grid-cols-12 gap-4 h-full">
      {/* Left sidebar - Market overview */}
      <Card className="col-span-2 p-4 bg-card">
        <h2 className="text-lg font-semibold mb-4">Markets</h2>
        
        <div className="space-y-4">
          {["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "ADAUSDT"].map(sym => (
            <div 
              key={sym} 
              className={`p-2 rounded-lg cursor-pointer ${symbol === sym ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/10'}`}
              onClick={() => setSymbol(sym)}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{sym.replace("USDT", "")}</span>
                <Badge variant={Math.random() > 0.5 ? "default" : "destructive"}>
                  {(Math.random() * 5 - 2.5).toFixed(2)}%
                </Badge>
              </div>
              <div className="text-sm opacity-80 mt-1">
                ${(Math.random() * 10000).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Timeframe</h3>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger>
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              {["1m", "5m", "15m", "1h", "4h", "1d"].map(tf => (
                <SelectItem key={tf} value={tf}>{tf}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>
      
      {/* Main chart area */}
      <div className="col-span-7 space-y-4">
        <Card className="p-4 h-[70vh]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold">{symbol}</h2>
              <div className="flex items-center mt-1">
                <span className="text-xl font-semibold">${marketData.price.toLocaleString()}</span>
                <Badge className="ml-2" variant={marketData.change >= 0 ? "default" : "destructive"}>
                  {marketData.change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {Math.abs(marketData.change)}%
                </Badge>
              </div>
            </div>
            
            <div className="flex space-x-4 text-sm">
              <div>
                <span className="text-muted-foreground">24h High:</span>
                <span className="ml-1 font-medium">${marketData.high.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">24h Low:</span>
                <span className="ml-1 font-medium">${marketData.low.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Volume:</span>
                <span className="ml-1 font-medium">${(marketData.volume / 1000000).toFixed(2)}M</span>
              </div>
            </div>
          </div>
          
          <div className="h-[calc(100%-60px)]">
            <AdvancedChart symbol={symbol} timeframe={timeframe} />
          </div>
        </Card>
      </div>
      
      {/* Right sidebar - Order panel */}
      <Card className="col-span-3 p-4">
        <Tabs defaultValue="spot">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="spot" className="flex-1">Spot</TabsTrigger>
            <TabsTrigger value="futures" className="flex-1">Futures</TabsTrigger>
            <TabsTrigger value="options" className="flex-1">Options</TabsTrigger>
          </TabsList>
          
          <TabsContent value="spot" className="space-y-4">
            <div className="flex space-x-2">
              <Button 
                variant={side === "buy" ? "default" : "outline"} 
                className="flex-1"
                onClick={() => setSide("buy")}
              >
                Buy
              </Button>
              <Button 
                variant={side === "sell" ? "destructive" : "outline"} 
                className="flex-1"
                onClick={() => setSide("sell")}
              >
                Sell
              </Button>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Order Type</label>
              <Select value={orderType} onValueChange={setOrderType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select order type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="limit">Limit</SelectItem>
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="stop">Stop</SelectItem>
                  <SelectItem value="stop_limit">Stop Limit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Quantity</label>
              <Input 
                type="number" 
                placeholder="Enter quantity" 
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            
            {orderType !== "market" && (
              <div>
                <label className="text-sm font-medium mb-1 block">Price</label>
                <Input 
                  type="number" 
                  placeholder="Enter price" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            )}
            
            <div className="grid grid-cols-4 gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => setQuantity((parseFloat(quantity) || 0) + 0.1 + "")}>+0.1</Button>
              <Button variant="outline" size="sm" onClick={() => setQuantity((parseFloat(quantity) || 0) + 0.5 + "")}>+0.5</Button>
              <Button variant="outline" size="sm" onClick={() => setQuantity((parseFloat(quantity) || 0) + 1 + "")}>+1</Button>
              <Button variant="outline" size="sm" onClick={() => setQuantity("0")}>Clear</Button>
            </div>
            
            <Button 
              className="w-full mt-6" 
              variant={side === "buy" ? "default" : "destructive"}
              onClick={handlePlaceOrder}
            >
              {side === "buy" ? "Buy" : "Sell"} {symbol.replace("USDT", "")}
            </Button>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Order Book</h3>
              <div className="space-y-1">
                {[...Array(5)].map((_, i) => (
                  <div key={`ask-${i}`} className="flex justify-between text-sm">
                    <span className="text-red-500">${(marketData.price + (5-i) * 10).toFixed(2)}</span>
                    <span>{(Math.random() * 2).toFixed(4)}</span>
                  </div>
                ))}
                
                <div className="py-1 text-center font-medium">
                  ${marketData.price.toFixed(2)}
                </div>
                
                {[...Array(5)].map((_, i) => (
                  <div key={`bid-${i}`} className="flex justify-between text-sm">
                    <span className="text-green-500">${(marketData.price - (i+1) * 10).toFixed(2)}</span>
                    <span>{(Math.random() * 2).toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="futures">
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Futures trading coming soon</p>
            </div>
          </TabsContent>
          
          <TabsContent value="options">
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Options trading coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
