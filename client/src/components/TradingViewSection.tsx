import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart2 } from "lucide-react";

// Mock data generator
const generateChartData = (days = 30) => {
  const data = [];
  let value = 100;
  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.5) * 3;
    value *= (1 + change / 100);
    data.push({
      date: new Date(2024, 0, i + 1).toLocaleDateString(),
      value: Math.round(value * 100) / 100,
      volume: Math.floor(Math.random() * 1000000)
    });
  }
  return data;
};

const indicators = [
  { value: "sma", label: "Simple Moving Average" },
  { value: "ema", label: "Exponential Moving Average" },
  { value: "rsi", label: "Relative Strength Index" },
  { value: "macd", label: "MACD" }
];

const timeframes = [
  { value: "1D", label: "1 Day" },
  { value: "1W", label: "1 Week" },
  { value: "1M", label: "1 Month" },
  { value: "3M", label: "3 Months" },
  { value: "1Y", label: "1 Year" }
];

const TradingViewSection = () => {
  const [chartData, setChartData] = useState(generateChartData());
  const [selectedIndicator, setSelectedIndicator] = useState("sma");
  const [timeframe, setTimeframe] = useState("1M");
  const [marketStats, setMarketStats] = useState({
    change: 2.5,
    volume: "1.2M",
    high: 105.20,
    low: 98.45
  });

  // Update chart data when timeframe changes
  useEffect(() => {
    const days = timeframe === "1D" ? 1 : 
                timeframe === "1W" ? 7 : 
                timeframe === "1M" ? 30 :
                timeframe === "3M" ? 90 : 365;
    setChartData(generateChartData(days));
  }, [timeframe]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Advanced Market Analysis</h2>

      <Card className="p-6 mb-6">
        {/* Chart Controls */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <Label>Timeframe</Label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                {timeframes.map(tf => (
                  <SelectItem key={tf.value} value={tf.value}>
                    {tf.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label>Technical Indicator</Label>
            <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
              <SelectTrigger>
                <SelectValue placeholder="Select indicator" />
              </SelectTrigger>
              <SelectContent>
                {indicators.map(indicator => (
                  <SelectItem key={indicator.value} value={indicator.value}>
                    {indicator.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-lg bg-background"
          >
            <Label>24h Change</Label>
            <div className={`text-xl font-bold ${marketStats.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {marketStats.change > 0 ? '+' : ''}{marketStats.change}%
            </div>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-lg bg-background"
          >
            <Label>Volume</Label>
            <div className="text-xl font-bold">{marketStats.volume}</div>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-lg bg-background"
          >
            <Label>24h High</Label>
            <div className="text-xl font-bold text-green-500">{marketStats.high}</div>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-lg bg-background"
          >
            <Label>24h Low</Label>
            <div className="text-xl font-bold text-red-500">{marketStats.low}</div>
          </motion.div>
        </div>

        {/* Main Chart */}
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background p-3 rounded-lg border">
                        <p className="text-sm text-muted-foreground">{payload[0].payload.date}</p>
                        <p className="font-bold">₹{payload[0].value}</p>
                        <p className="text-sm text-muted-foreground">Vol: {payload[0].payload.volume.toLocaleString()}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="card"
        >
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-2">Technical Analysis</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>RSI (14)</span>
                <span className="font-medium">65.2</span>
              </div>
              <div className="flex justify-between items-center">
                <span>MACD</span>
                <span className="font-medium text-green-500">Bullish</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Moving Averages</span>
                <span className="font-medium text-green-500">Strong Buy</span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="card"
        >
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-2">Market Sentiment</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Fear & Greed Index</span>
                <span className="font-medium text-yellow-500">65 - Greed</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Volatility</span>
                <span className="font-medium">Medium</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Trend Strength</span>
                <span className="font-medium text-green-500">Strong</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default TradingViewSection;