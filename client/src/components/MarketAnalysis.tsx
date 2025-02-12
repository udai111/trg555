import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
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

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="institutional">Institutional</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="profit">Profit</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
        </TabsList>

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
                  <span className={`text-${institutionalData.fii.trend === 'Positive' ? 'green' : 'red'}-500`}>
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
                  <span className={`text-${institutionalData.dii.trend === 'Positive' ? 'green' : 'red'}-500`}>
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

        {/* Profit Tab */}
        <TabsContent value="profit">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Intraday Performance</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={[
                    { time: '09:30', price: 100, volume: 1000 },
                    { time: '10:30', price: 102, volume: 1500 },
                    { time: '11:30', price: 101, volume: 1200 },
                    { time: '12:30', price: 103, volume: 1800 },
                    { time: '13:30', price: 104, volume: 2000 },
                    { time: '14:30', price: 105, volume: 2200 },
                  ]}>
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar dataKey="volume" yAxisId="right" fill="hsl(var(--primary))" opacity={0.3} />
                    <Line type="monotone" dataKey="price" yAxisId="left" stroke="hsl(var(--primary))" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Profit Analysis</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Today's P&L</span>
                  <span className="text-green-500">+₹12,500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Week's P&L</span>
                  <span className="text-green-500">+₹45,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Win Rate</span>
                  <span>75%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Average Win</span>
                  <span className="text-green-500">₹5,200</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Average Loss</span>
                  <span className="text-red-500">₹2,100</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default MarketAnalysis;