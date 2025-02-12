import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart2,
  Activity,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface OrderFlow {
  buyVolume: number;
  sellVolume: number;
  imbalance: number;
  largeOrders: Array<{
    price: number;
    volume: number;
    side: 'buy' | 'sell';
    timestamp: string;
  }>;
  vwap: number;
}

const OrderFlowAnalysis = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('1m');

  const { data: orderFlow, isLoading } = useQuery<OrderFlow>({
    queryKey: ['orderFlow', selectedSymbol, timeframe],
    queryFn: async () => {
      const response = await fetch(`/api/order-flow?symbol=${selectedSymbol}&timeframe=${timeframe}`);
      return response.json();
    },
    refetchInterval: 1000, // Real-time updates
  });

  return (
    <div className="p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-4xl font-bold text-primary">Order Flow Analysis</h1>
        <p className="text-muted-foreground">Real-time order flow and volume analysis</p>
      </motion.div>

      <Tabs defaultValue="orderFlow" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orderFlow">Order Flow</TabsTrigger>
          <TabsTrigger value="volumeProfile">Volume Profile</TabsTrigger>
          <TabsTrigger value="largeOrders">Large Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="orderFlow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Buy/Sell Pressure
              </h3>
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Buy Volume</span>
                    <span className="text-green-500 flex items-center gap-1">
                      <ArrowUpRight className="w-4 h-4" />
                      {orderFlow?.buyVolume.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Sell Volume</span>
                    <span className="text-red-500 flex items-center gap-1">
                      <ArrowDownRight className="w-4 h-4" />
                      {orderFlow?.sellVolume.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Imbalance</span>
                    <span className={orderFlow?.imbalance > 0 ? 'text-green-500' : 'text-red-500'}>
                      {(orderFlow?.imbalance * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BarChart2 className="w-4 h-4" />
                VWAP Analysis
              </h3>
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                <div className="mt-4">
                  <p>Current VWAP: ${orderFlow?.vwap.toFixed(2)}</p>
                  <div className="h-40 mt-4">
                    {/* Add VWAP Chart Component Here */}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="volumeProfile">
          <Card className="p-4">
            <h3 className="text-lg font-semibold">Volume Profile</h3>
            <div className="mt-4 h-96">
              {/* Add Volume Profile Chart Component Here */}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="largeOrders">
          <Card className="p-4">
            <h3 className="text-lg font-semibold">Large Orders Detection</h3>
            <div className="mt-4">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left">Time</th>
                    <th className="text-left">Price</th>
                    <th className="text-left">Volume</th>
                    <th className="text-left">Side</th>
                  </tr>
                </thead>
                <tbody>
                  {orderFlow?.largeOrders.map((order, index) => (
                    <tr key={index} className="border-t">
                      <td className="py-2">{new Date(order.timestamp).toLocaleTimeString()}</td>
                      <td className="py-2">${order.price.toFixed(2)}</td>
                      <td className="py-2">{order.volume.toLocaleString()}</td>
                      <td className={`py-2 ${order.side === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                        {order.side.toUpperCase()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderFlowAnalysis;
