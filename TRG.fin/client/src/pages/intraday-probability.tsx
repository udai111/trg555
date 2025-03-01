import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Activity, BarChart2, Clock, LineChart, Percent, RefreshCcw, TrendingUp, Zap } from "lucide-react";
import ProbabilityChart from "@/components/ProbabilityChart";
import TimeframeAnalysis from "@/components/TimeframeAnalysis";
import VolumeProfile from "@/components/VolumeProfile";

interface ProbabilityData {
  timestamp: string;
  upProbability: number;
  downProbability: number;
  sidewaysProbability: number;
  confidence: number;
}

interface TimeFrame {
  value: string;
  label: string;
}

const timeframes: TimeFrame[] = [
  { value: "1m", label: "1 Minute" },
  { value: "5m", label: "5 Minutes" },
  { value: "15m", label: "15 Minutes" },
  { value: "1h", label: "1 Hour" },
  { value: "4h", label: "4 Hours" }
];

export default function IntradayProbability() {
  const [activeSymbol, setActiveSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState<string>("5m");
  const [isLoading, setIsLoading] = useState(false);
  const [probabilityData, setProbabilityData] = useState<ProbabilityData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const updateProbabilities = () => {
    setIsLoading(true);
    // Simulate API call for probability data
    setTimeout(() => {
      const newData: ProbabilityData = {
        timestamp: new Date().toISOString(),
        upProbability: Math.random() * 0.6 + 0.2,
        downProbability: Math.random() * 0.4,
        sidewaysProbability: Math.random() * 0.3,
        confidence: Math.random() * 0.3 + 0.7
      };
      setProbabilityData(prev => [...prev, newData].slice(-100));
      setLastUpdate(new Date());
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    updateProbabilities();
    const interval = setInterval(updateProbabilities, 5000);
    return () => clearInterval(interval);
  }, [timeframe, activeSymbol]);

  return (
    <div className="p-4 h-screen bg-background">
      <div className="grid grid-cols-12 gap-4 h-full">
        {/* Left Sidebar - Market Selection */}
        <Card className="col-span-2 p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Markets</h2>
          </div>
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

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Timeframe</h3>
            <Select
              value={timeframe}
              onValueChange={setTimeframe}
            >
              {timeframes.map((tf) => (
                <option key={tf.value} value={tf.value}>
                  {tf.label}
                </option>
              ))}
            </Select>
          </div>
        </Card>

        {/* Main Probability View */}
        <div className="col-span-7 space-y-4">
          {/* Probability Chart */}
          <Card className="p-4 h-[60%]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Probability Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={updateProbabilities}
                disabled={isLoading}
              >
                <RefreshCcw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
            <ProbabilityChart data={probabilityData} />
          </Card>

          {/* Analysis Tabs */}
          <Card className="p-4 h-[38%]">
            <Tabs defaultValue="timeframe">
              <TabsList>
                <TabsTrigger value="timeframe">
                  <Clock className="w-4 h-4 mr-2" />
                  Timeframe Analysis
                </TabsTrigger>
                <TabsTrigger value="volume">
                  <BarChart2 className="w-4 h-4 mr-2" />
                  Volume Profile
                </TabsTrigger>
                <TabsTrigger value="signals">
                  <Zap className="w-4 h-4 mr-2" />
                  Probability Signals
                </TabsTrigger>
              </TabsList>
              <TabsContent value="timeframe">
                <TimeframeAnalysis
                  symbol={activeSymbol}
                  timeframe={timeframe}
                  data={probabilityData}
                />
              </TabsContent>
              <TabsContent value="volume">
                <VolumeProfile data={[
                  { price: 100, volume: 1000, timestamp: new Date().toISOString() },
                  { price: 101, volume: 1500, timestamp: new Date().toISOString() },
                  { price: 99, volume: 800, timestamp: new Date().toISOString() },
                  { price: 102, volume: 2000, timestamp: new Date().toISOString() },
                  { price: 98, volume: 1200, timestamp: new Date().toISOString() }
                ]} />
              </TabsContent>
              <TabsContent value="signals">
                <div className="grid grid-cols-3 gap-4">
                  {probabilityData.slice(-1).map((data, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Trend Probability</h4>
                        <Percent className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Uptrend</span>
                          <span className="text-sm font-bold text-green-500">
                            {(data.upProbability * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Downtrend</span>
                          <span className="text-sm font-bold text-red-500">
                            {(data.downProbability * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Sideways</span>
                          <span className="text-sm font-bold text-yellow-500">
                            {(data.sidewaysProbability * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Sidebar - Statistics */}
        <Card className="col-span-3 p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Statistics</h2>
            <LineChart className="w-5 h-5 text-primary" />
          </div>

          <div className="space-y-6">
            {probabilityData.slice(-1).map((data, index) => (
              <div key={index} className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Confidence Score</h3>
                  <div className="text-3xl font-bold text-primary">
                    {(data.confidence * 100).toFixed(1)}%
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Dominant Trend</h3>
                  <div className="text-xl font-semibold">
                    {data.upProbability > data.downProbability ? (
                      <span className="text-green-500">Bullish</span>
                    ) : (
                      <span className="text-red-500">Bearish</span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Market Volatility</h3>
                  <div className="text-xl font-semibold">
                    {data.sidewaysProbability < 0.2 ? "High" : "Low"}
                  </div>
                </div>
              </div>
            ))}

            <Button className="w-full" variant="outline">
              <Clock className="w-4 h-4 mr-2" />
              View Historical Data
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
