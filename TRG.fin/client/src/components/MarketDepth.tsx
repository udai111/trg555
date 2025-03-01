import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";

interface DepthData {
  buyOrders: {
    price: number;
    quantity: number;
    orders: number;
  }[];
  sellOrders: {
    price: number;
    quantity: number;
    orders: number;
  }[];
}

export interface MarketDepthProps {
  symbol: string;
}

export const MarketDepth = ({ symbol }: MarketDepthProps) => {
  const [depthData, setDepthData] = useState<DepthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMarketDepth = async () => {
      try {
        const response = await apiService.stocks.getMarketDepth(symbol);
        setDepthData(response);
      } catch (error) {
        console.error("Error fetching market depth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketDepth();
    const interval = setInterval(fetchMarketDepth, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [symbol]);

  const getTotalQuantity = (orders: { quantity: number }[]) => {
    return orders.reduce((sum, order) => sum + order.quantity, 0);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Market Depth</h3>
      {isLoading ? (
        <div className="text-center py-4">Loading market depth...</div>
      ) : !depthData ? (
        <div className="text-center py-4">No market depth data available</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium mb-2 text-green-500">Buy Orders</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {depthData.buyOrders.map((order, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-right font-mono">₹{order.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{order.orders.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{order.quantity.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-medium">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">
                    {depthData.buyOrders.reduce((sum, order) => sum + order.orders, 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {getTotalQuantity(depthData.buyOrders).toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2 text-red-500">Sell Orders</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {depthData.sellOrders.map((order, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-right font-mono">₹{order.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{order.orders.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{order.quantity.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-medium">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">
                    {depthData.sellOrders.reduce((sum, order) => sum + order.orders, 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {getTotalQuantity(depthData.sellOrders).toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </Card>
  );
}; 