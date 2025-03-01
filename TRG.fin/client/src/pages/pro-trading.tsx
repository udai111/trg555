import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowUpDown, BarChart2, BookOpen, Clock, DollarSign, LineChart, Settings, TrendingUp } from "lucide-react";
import TradingViewWidget from "@/components/TradingViewWidget";
import OrderBook from "@/components/OrderBook";
import TradeHistory from "@/components/TradeHistory";
import DepthChart from "@/components/DepthChart";

interface Order {
  type: "market" | "limit" | "stop" | "oco";
  side: "buy" | "sell";
  price: number;
  quantity: number;
  stopPrice?: number;
  takeProfitPrice?: number;
}

export default function ProTrading() {
  const [activeSymbol, setActiveSymbol] = useState("BTCUSDT");
  const [orderType, setOrderType] = useState<Order["type"]>("market");
  const [orderSide, setOrderSide] = useState<Order["side"]>("buy");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [takeProfitPrice, setTakeProfitPrice] = useState("");

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement order submission logic
  };

  return (
    <div className="p-4 h-screen bg-background">
      <div className="grid grid-cols-12 gap-4 h-full">
        {/* Left Sidebar - Market Overview */}
        <Card className="col-span-2 p-4">
          <h2 className="text-lg font-semibold mb-4">Markets</h2>
          <div className="space-y-2">
            {["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"].map((symbol) => (
              <Button
                key={symbol}
                variant={activeSymbol === symbol ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setActiveSymbol(symbol)}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                {symbol}
              </Button>
            ))}
          </div>
        </Card>

        {/* Main Trading View */}
        <div className="col-span-7 space-y-4">
          {/* Chart */}
          <Card className="p-4 h-[60%]">
            <TradingViewWidget />
          </Card>

          {/* Order Book and Trade History */}
          <Card className="p-4 h-[38%]">
            <Tabs defaultValue="orderbook">
              <TabsList>
                <TabsTrigger value="orderbook">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Order Book
                </TabsTrigger>
                <TabsTrigger value="trades">
                  <Clock className="w-4 h-4 mr-2" />
                  Trade History
                </TabsTrigger>
                <TabsTrigger value="depth">
                  <BarChart2 className="w-4 h-4 mr-2" />
                  Depth Chart
                </TabsTrigger>
              </TabsList>
              <TabsContent value="orderbook">
                <OrderBook symbol={activeSymbol} />
              </TabsContent>
              <TabsContent value="trades">
                <TradeHistory symbol={activeSymbol} />
              </TabsContent>
              <TabsContent value="depth">
                <DepthChart symbol={activeSymbol} />
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Sidebar - Order Form */}
        <Card className="col-span-3 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Place Order</h2>
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleOrderSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={orderSide === "buy" ? "default" : "outline"}
                className="w-full"
                onClick={() => setOrderSide("buy")}
              >
                Buy
              </Button>
              <Button
                type="button"
                variant={orderSide === "sell" ? "destructive" : "outline"}
                className="w-full"
                onClick={() => setOrderSide("sell")}
              >
                Sell
              </Button>
            </div>

            <Select
              value={orderType}
              onValueChange={(value: Order["type"]) => setOrderType(value)}
            >
              <option value="market">Market</option>
              <option value="limit">Limit</option>
              <option value="stop">Stop</option>
              <option value="oco">OCO</option>
            </Select>

            {orderType !== "market" && (
              <Input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            )}

            <Input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />

            {(orderType === "stop" || orderType === "oco") && (
              <Input
                type="number"
                placeholder="Stop Price"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
              />
            )}

            {orderType === "oco" && (
              <Input
                type="number"
                placeholder="Take Profit"
                value={takeProfitPrice}
                onChange={(e) => setTakeProfitPrice(e.target.value)}
              />
            )}

            <Button type="submit" className="w-full">
              {orderSide === "buy" ? "Buy" : "Sell"} {activeSymbol}
            </Button>
          </form>

          {/* Quick Trade Buttons */}
          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Flip P/Q
              </Button>
              <Button variant="outline" size="sm">
                <DollarSign className="w-4 h-4 mr-2" />
                Use Max
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 