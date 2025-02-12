import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  Plus,
  X,
  PieChart,
  BarChart2,
  Activity,
  DollarSign,
  Target,
  TrendingDown,
  ArrowRightLeft,
  Maximize2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Scatter,
} from "recharts";

// Types
interface InstitutionalData {
  fii: {
    netBuy: number;
    totalBuy: number;
    totalSell: number;
    trend: string;
    weeklyChange: string;
  };
  dii: {
    netBuy: number;
    totalBuy: number;
    totalSell: number;
    trend: string;
    weeklyChange: string;
  };
}

interface MarketBreadthData {
  advanceDecline: {
    advances: number;
    declines: number;
    unchanged: number;
  };
  newHighsLows: {
    newHighs: number;
    newLows: number;
  };
  putCallRatio: number;
  vwap: number;
}

const MarketAnalysis = () => {
  // State declarations
  const [watchlist, setWatchlist] = useState<string[]>(["RELIANCE", "TCS", "INFY"]);
  const [newSymbol, setNewSymbol] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const [selectedIndicator, setSelectedIndicator] = useState("ALL");
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);

  // Mock data
  const institutionalData: InstitutionalData = {
    fii: {
      netBuy: 1245.8,
      totalBuy: 8456.2,
      totalSell: 7210.4,
      trend: "Positive",
      weeklyChange: "+15.2%"
    },
    dii: {
      netBuy: -458.6,
      totalBuy: 5678.9,
      totalSell: 6137.5,
      trend: "Negative",
      weeklyChange: "-8.4%"
    }
  };

  const marketBreadthData: MarketBreadthData = {
    advanceDecline: {
      advances: 1250,
      declines: 850,
      unchanged: 100
    },
    newHighsLows: {
      newHighs: 45,
      newLows: 15
    },
    putCallRatio: 1.2,
    vwap: 18245.75
  };

  // Mock profit data for the chart
  const profitChartData = [
    { time: '09:30', price: 100, volume: 1000, profit: 0 },
    { time: '10:30', price: 102, volume: 1500, profit: 2000 },
    { time: '11:30', price: 101, volume: 1200, profit: 1500 },
    { time: '12:30', price: 103, volume: 1800, profit: 3500 },
    { time: '13:30', price: 104, volume: 2000, profit: 4200 },
    { time: '14:30', price: 105, volume: 2200, profit: 5000 },
  ];

  // Functions
  const addToWatchlist = (symbol: string) => {
    if (symbol && !watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
      setNewSymbol("");
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter(item => item !== symbol));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Market Analysis</h1>
          <p className="text-muted-foreground">Advanced market insights and analysis</p>
        </div>
      </div>

      <Tabs defaultValue="profit" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="institutional">Institutional</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="profit">Profit</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
        </TabsList>

        {/* Profit Tab */}
        <TabsContent value="profit">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart2 className="w-5 h-5" />
                Intraday Performance
              </h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={profitChartData}>
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar dataKey="volume" yAxisId="right" fill="hsl(var(--primary))" opacity={0.3} />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      yAxisId="left" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Profit Analysis
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Today's P&L</span>
                  <span className="text-green-500 text-xl font-semibold">+₹12,500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Week's P&L</span>
                  <span className="text-green-500 text-xl font-semibold">+₹45,000</span>
                </div>
                <div className="h-px bg-border my-4" />
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Win Rate</span>
                      <span className="font-semibold">75%</span>
                    </div>
                    <div className="w-full bg-accent/10 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Win</span>
                    <span className="text-green-500 font-semibold">₹5,200</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Loss</span>
                    <span className="text-red-500 font-semibold">₹2,100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Risk/Reward Ratio</span>
                    <span className="font-semibold">1:2.48</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Additional Profit Metrics */}
            <Card className="md:col-span-2 p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-accent/10 rounded-lg">
                  <h4 className="text-sm text-muted-foreground mb-1">Profit Factor</h4>
                  <p className="text-2xl font-bold">2.35</p>
                  <span className="text-xs text-muted-foreground">Good &gt; 2.0</span>
                </div>
                <div className="p-4 bg-accent/10 rounded-lg">
                  <h4 className="text-sm text-muted-foreground mb-1">Sharpe Ratio</h4>
                  <p className="text-2xl font-bold">1.85</p>
                  <span className="text-xs text-muted-foreground">Good &gt; 1.0</span>
                </div>
                <div className="p-4 bg-accent/10 rounded-lg">
                  <h4 className="text-sm text-muted-foreground mb-1">Max Drawdown</h4>
                  <p className="text-2xl font-bold text-red-500">-12.5%</p>
                  <span className="text-xs text-muted-foreground">Last 30 days</span>
                </div>
                <div className="p-4 bg-accent/10 rounded-lg">
                  <h4 className="text-sm text-muted-foreground mb-1">Expectancy</h4>
                  <p className="text-2xl font-bold text-green-500">₹2,340</p>
                  <span className="text-xs text-muted-foreground">Per trade</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Market Breadth</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Advances</span>
                  <span className="text-green-500">{marketBreadthData.advanceDecline.advances}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Declines</span>
                  <span className="text-red-500">{marketBreadthData.advanceDecline.declines}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">FII Activity</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Net Buy:</span>
                  <span className={cn(
                    institutionalData.fii.trend === 'Positive' ? 'text-green-500' : 'text-red-500'
                  )}>
                    {institutionalData.fii.netBuy > 0 ? '+' : ''}{institutionalData.fii.netBuy.toFixed(1)} Cr
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Buy:</span>
                  <span>{institutionalData.fii.totalBuy.toFixed(1)} Cr</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">DII Activity</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Net Buy:</span>
                  <span className={cn(
                    institutionalData.dii.trend === 'Positive' ? 'text-green-500' : 'text-red-500'
                  )}>
                    {institutionalData.dii.netBuy > 0 ? '+' : ''}{institutionalData.dii.netBuy.toFixed(1)} Cr
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Buy:</span>
                  <span>{institutionalData.dii.totalBuy.toFixed(1)} Cr</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Institutional Tab */}
        <TabsContent value="institutional">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">FII Activity</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Net Buy:</span>
                  <span className={cn(
                    institutionalData.fii.trend === 'Positive' ? 'text-green-500' : 'text-red-500'
                  )}>
                    {institutionalData.fii.netBuy > 0 ? '+' : ''}{institutionalData.fii.netBuy.toFixed(1)} Cr
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Buy:</span>
                  <span>{institutionalData.fii.totalBuy.toFixed(1)} Cr</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Sell:</span>
                  <span>{institutionalData.fii.totalSell.toFixed(1)} Cr</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Weekly Change:</span>
                  <span className={cn(
                    institutionalData.fii.trend === 'Positive' ? 'text-green-500' : 'text-red-500'
                  )}>
                    {institutionalData.fii.weeklyChange}
                  </span>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">DII Activity</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Net Buy:</span>
                  <span className={cn(
                    institutionalData.dii.trend === 'Positive' ? 'text-green-500' : 'text-red-500'
                  )}>
                    {institutionalData.dii.netBuy > 0 ? '+' : ''}{institutionalData.dii.netBuy.toFixed(1)} Cr
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Buy:</span>
                  <span>{institutionalData.dii.totalBuy.toFixed(1)} Cr</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Sell:</span>
                  <span>{institutionalData.dii.totalSell.toFixed(1)} Cr</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Weekly Change:</span>
                  <span className={cn(
                    institutionalData.dii.trend === 'Positive' ? 'text-green-500' : 'text-red-500'
                  )}>
                    {institutionalData.dii.weeklyChange}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Technical Tab */}
        <TabsContent value="technical">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Technical Indicators</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>RSI</span>
                  <span>55</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>MACD</span>
                  <span>Positive</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>SMA (200)</span>
                  <span>18000</span>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Volume Analysis</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Volume</span>
                  <span>100000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>OBV</span>
                  <span>Increasing</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>VWAP</span>
                  <span>{marketBreadthData.vwap.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns">
          <p>Patterns Tab Content</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketAnalysis;