import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";

interface Trade {
  time: string;
  price: number;
  quantity: number;
  type: "buy" | "sell";
}

interface OrderBookEntry {
  price: number;
  quantity: number;
  orders: number;
  total: number;
}

interface OrderBookData {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  spread: number;
  spreadPercentage: number;
}

interface OrderBookProps {
  symbol: string;
}

export const OrderBook = ({ symbol }: OrderBookProps) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await apiService.stocks.getRecentTrades(symbol);
        setTrades(response);
      } catch (error) {
        console.error("Error fetching trades:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrades();
    const interval = setInterval(fetchTrades, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [symbol]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const calculatePriceChange = (currentPrice: number, previousPrice: number) => {
    if (!previousPrice) return null;
    const change = ((currentPrice - previousPrice) / previousPrice) * 100;
    return {
      direction: change > 0 ? "up" : change < 0 ? "down" : "neutral",
      value: Math.abs(change)
    };
  };

  const formatQuantity = (quantity: number) => {
    if (quantity >= 1000000) return `${(quantity / 1000000).toFixed(2)}M`;
    if (quantity >= 1000) return `${(quantity / 1000).toFixed(2)}K`;
    return quantity.toString();
  };

  const maxTotal = Math.max(
    ...trades.map(trade => trade.price),
    ...trades.map(trade => trade.price)
  );

  const getDepthVisualization = (total: number, side: 'bid' | 'ask') => {
    const percentage = (total / maxTotal) * 100;
    return (
      <div className="absolute top-0 bottom-0 w-full opacity-10"
        style={{
          background: side === 'bid' ? 'hsl(var(--success))' : 'hsl(var(--destructive))',
          [side === 'bid' ? 'right' : 'left']: 0,
          width: `${percentage}%`
        }}
      />
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Order Book</h3>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Spread</p>
          <p className="text-sm font-medium">
            ₹{trades.reduce((spread, trade) => Math.max(spread, trade.price), 0).toFixed(2)} ({trades.reduce((spread, trade) => Math.max(spread, trade.price), 0).toFixed(2)}%)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Bids */}
        <Card className="overflow-hidden">
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((trade, index) => (
                  <TableRow key={`${trade.time}-${index}`} className="relative">
                    {getDepthVisualization(trade.price, 'bid')}
                    <TableCell className="text-right font-medium text-green-500">
                      ₹{trade.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatQuantity(trade.quantity)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatQuantity(trade.price)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>

        {/* Asks */}
        <Card className="overflow-hidden">
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((trade, index) => (
                  <TableRow key={`${trade.time}-${index}`} className="relative">
                    {getDepthVisualization(trade.price, 'ask')}
                    <TableCell className="text-right font-medium text-red-500">
                      ₹{trade.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatQuantity(trade.quantity)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatQuantity(trade.price)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Total Bid Volume</p>
          <p className="text-sm font-medium text-green-500">
            {formatQuantity(trades.reduce((sum, trade) => sum + trade.quantity, 0))}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Orders: {trades.length}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Total Ask Volume</p>
          <p className="text-sm font-medium text-red-500">
            {formatQuantity(trades.reduce((sum, trade) => sum + trade.quantity, 0))}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Orders: {trades.length}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
        {isLoading ? (
          <div className="text-center py-4">Loading trades...</div>
        ) : trades.length === 0 ? (
          <div className="text-center py-4">No recent trades</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((trade, index) => {
                const priceChange = calculatePriceChange(
                  trade.price,
                  index < trades.length - 1 ? trades[index + 1].price : trade.price
                );
                
                return (
                  <TableRow key={`${trade.time}-${index}`}>
                    <TableCell>{formatTime(trade.time)}</TableCell>
                    <TableCell className={`text-right font-mono ${
                      trade.type === "buy" ? "text-green-500" : "text-red-500"
                    }`}>
                      ₹{trade.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {trade.quantity.toLocaleString()}
                    </TableCell>
                    <TableCell className={`text-right ${
                      priceChange?.direction === "up" ? "text-green-500" :
                      priceChange?.direction === "down" ? "text-red-500" :
                      "text-muted-foreground"
                    }`}>
                      {priceChange ? (
                        <>
                          {priceChange.direction === "up" ? "+" : 
                           priceChange.direction === "down" ? "-" : ""}
                          {priceChange.value.toFixed(2)}%
                        </>
                      ) : "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}; 