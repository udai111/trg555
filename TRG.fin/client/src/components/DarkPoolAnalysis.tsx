import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  BarChart2,
  RefreshCw,
  AlertTriangle,
  DollarSign
} from 'lucide-react';

interface DarkPoolTrade {
  time: string;
  price: number;
  volume: number;
  side: 'buy' | 'sell';
  exchange: string;
  premium: number;
}

interface OrderFlowData {
  price: number;
  buyVolume: number;
  sellVolume: number;
  delta: number;
  cumDelta: number;
  trades: number;
}

interface VolumeProfile {
  price: number;
  volume: number;
  delta: number;
  valueArea: boolean;
}

const DarkPoolAnalysis: React.FC = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('1D');
  const [loading, setLoading] = useState(true);
  const [darkPoolTrades, setDarkPoolTrades] = useState<DarkPoolTrade[]>([]);
  const [orderFlow, setOrderFlow] = useState<OrderFlowData[]>([]);
  const [volumeProfile, setVolumeProfile] = useState<VolumeProfile[]>([]);
  const [largeOrders, setLargeOrders] = useState<DarkPoolTrade[]>([]);

  useEffect(() => {
    fetchData();
  }, [symbol, timeframe]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock dark pool trades
      const mockTrades: DarkPoolTrade[] = Array.from({ length: 20 }, (_, i) => ({
        time: new Date(Date.now() - i * 15 * 60 * 1000).toISOString(),
        price: 175 + Math.random() * 5,
        volume: Math.floor(Math.random() * 100000) + 10000,
        side: Math.random() > 0.5 ? 'buy' : 'sell',
        exchange: ['XDARK', 'IEXD', 'CHXE'][Math.floor(Math.random() * 3)],
        premium: (Math.random() * 0.4 - 0.2)
      }));

      // Mock order flow data
      const mockOrderFlow: OrderFlowData[] = Array.from({ length: 50 }, (_, i) => {
        const buyVolume = Math.floor(Math.random() * 50000) + 10000;
        const sellVolume = Math.floor(Math.random() * 50000) + 10000;
        return {
          price: 175 + (i * 0.1),
          buyVolume,
          sellVolume,
          delta: buyVolume - sellVolume,
          cumDelta: 0, // Will be calculated
          trades: Math.floor(Math.random() * 100) + 20
        };
      });

      // Calculate cumulative delta
      let cumDelta = 0;
      mockOrderFlow.forEach(flow => {
        cumDelta += flow.delta;
        flow.cumDelta = cumDelta;
      });

      // Mock volume profile
      const mockVolumeProfile: VolumeProfile[] = Array.from({ length: 30 }, (_, i) => ({
        price: 175 + (i * 0.1),
        volume: Math.floor(Math.random() * 100000) + 10000,
        delta: Math.floor(Math.random() * 20000) - 10000,
        valueArea: Math.random() > 0.3
      }));

      // Mock large orders (filtered from dark pool trades)
      const mockLargeOrders = mockTrades
        .filter(trade => trade.volume > 50000)
        .sort((a, b) => b.volume - a.volume);

      setDarkPoolTrades(mockTrades);
      setOrderFlow(mockOrderFlow);
      setVolumeProfile(mockVolumeProfile);
      setLargeOrders(mockLargeOrders);
    } catch (error) {
      console.error('Error fetching dark pool data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toString();
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const calculateStats = () => {
    const totalVolume = darkPoolTrades.reduce((sum, trade) => sum + trade.volume, 0);
    const buyVolume = darkPoolTrades
      .filter(trade => trade.side === 'buy')
      .reduce((sum, trade) => sum + trade.volume, 0);
    const sellVolume = totalVolume - buyVolume;

    return {
      totalVolume,
      buyVolume,
      sellVolume,
      buyPercentage: (buyVolume / totalVolume) * 100,
      averageSize: totalVolume / darkPoolTrades.length,
      largeOrderCount: largeOrders.length
    };
  };

  const stats = calculateStats();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <EyeOff className="w-5 h-5" />
            Dark Pool & Order Flow Analysis
          </CardTitle>
          <div className="flex items-center gap-4">
            <Select value={symbol} onValueChange={setSymbol}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select symbol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AAPL">AAPL</SelectItem>
                <SelectItem value="MSFT">MSFT</SelectItem>
                <SelectItem value="GOOGL">GOOGL</SelectItem>
                <SelectItem value="AMZN">AMZN</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1D">1 Day</SelectItem>
                <SelectItem value="1W">1 Week</SelectItem>
                <SelectItem value="1M">1 Month</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Dark Pool Volume</h3>
            <div className="text-2xl font-bold">{formatVolume(stats.totalVolume)}</div>
            <Progress
              value={100}
              className="h-2 mt-2"
            />
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Buy/Sell Ratio</h3>
            <div className="text-2xl font-bold">{stats.buyPercentage.toFixed(1)}%</div>
            <Progress
              value={stats.buyPercentage}
              className="h-2 mt-2"
            />
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Average Trade Size</h3>
            <div className="text-2xl font-bold">{formatVolume(stats.averageSize)}</div>
            <Progress
              value={70}
              className="h-2 mt-2"
            />
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Large Orders</h3>
            <div className="text-2xl font-bold">{stats.largeOrderCount}</div>
            <Progress
              value={60}
              className="h-2 mt-2"
            />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Order Flow Heat Map</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderFlow}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="price"
                    tickFormatter={formatPrice}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => formatVolume(value)}
                    labelFormatter={(label: number) => formatPrice(label)}
                  />
                  <Bar
                    dataKey="buyVolume"
                    stackId="a"
                    fill="#22c55e"
                    opacity={0.8}
                  />
                  <Bar
                    dataKey="sellVolume"
                    stackId="a"
                    fill="#ef4444"
                    opacity={0.8}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Cumulative Delta</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={orderFlow}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="price"
                    tickFormatter={formatPrice}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => formatVolume(value)}
                    labelFormatter={(label: number) => formatPrice(label)}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumDelta"
                    stroke="#2563eb"
                    fill="#2563eb"
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="mt-6">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Recent Large Dark Pool Orders</h3>
            <div className="space-y-4">
              {largeOrders.slice(0, 5).map((order, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-accent/10 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={order.side === 'buy' ? 'default' : 'destructive'}
                      className="w-16 justify-center"
                    >
                      {order.side.toUpperCase()}
                    </Badge>
                    <div>
                      <div className="font-medium">{formatPrice(order.price)}</div>
                      <div className="text-sm text-muted-foreground">{order.exchange}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-medium">{formatVolume(order.volume)}</div>
                    <div className={`text-sm ${
                      order.premium > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {order.premium > 0 ? '+' : ''}{order.premium.toFixed(2)}% Premium
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="mt-6">
          <Card className="p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Disclaimer</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Dark pool data may be delayed and not represent all market activity. Use this information as part of a comprehensive analysis strategy.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default DarkPoolAnalysis; 