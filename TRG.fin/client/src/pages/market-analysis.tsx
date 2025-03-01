import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart2,
  Clock,
  Globe,
  LineChart,
  Newspaper,
  PieChart,
  RefreshCcw,
  Search,
  TrendingDown,
  TrendingUp,
  Zap
} from "lucide-react";
import MarketOverview from "@/components/MarketOverview";
import MarketHeatmap from "@/components/MarketHeatmap";
import SentimentAnalysis from "@/components/SentimentAnalysis";

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number;
  dominance: number;
  sentiment: number;
}

interface MarketNews {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  impact: "high" | "medium" | "low";
  sentiment: "positive" | "negative" | "neutral";
}

const marketTypes = ["crypto", "forex", "stocks", "commodities"];
const timeRanges = ["1h", "24h", "7d", "30d", "1y"];
const metrics = ["price", "volume", "market_cap", "dominance"];

export default function MarketAnalysis() {
  const [marketType, setMarketType] = useState("crypto");
  const [timeRange, setTimeRange] = useState("24h");
  const [selectedMetric, setSelectedMetric] = useState("price");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [marketData, setMarketData] = useState<MarketData[]>([
    {
      symbol: "BTC/USD",
      price: 52000,
      change: 2.5,
      volume: 28000000000,
      marketCap: 1000000000000,
      dominance: 45,
      sentiment: 0.7
    },
    {
      symbol: "ETH/USD",
      price: 3200,
      change: -1.2,
      volume: 15000000000,
      marketCap: 380000000000,
      dominance: 18,
      sentiment: 0.6
    }
  ]);
  const [marketNews, setMarketNews] = useState<MarketNews[]>([
    {
      id: "1",
      title: "Bitcoin Breaks Above $50,000 as Market Sentiment Improves",
      source: "CryptoNews",
      timestamp: "2024-02-27T10:30:00Z",
      impact: "high",
      sentiment: "positive"
    },
    {
      id: "2",
      title: "Global Markets React to Economic Data",
      source: "MarketWatch",
      timestamp: "2024-02-27T09:15:00Z",
      impact: "medium",
      sentiment: "neutral"
    }
  ]);

  const refreshData = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Update market data with new values
      setMarketData(prev => prev.map(item => ({
        ...item,
        price: item.price * (1 + (Math.random() - 0.5) * 0.01),
        change: (Math.random() - 0.5) * 5,
        volume: item.volume * (1 + (Math.random() - 0.5) * 0.1)
      })));
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 60000);
    return () => clearInterval(interval);
  }, [marketType, timeRange]);

  return (
    <div className="p-4 h-screen bg-background">
      <div className="grid grid-cols-12 gap-4 h-full">
        {/* Left Sidebar - Market Selection */}
        <Card className="col-span-2 p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Markets</h2>
          </div>
          <div className="space-y-4">
            {marketTypes.map((type) => (
              <Button
                key={type}
                variant={marketType === type ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setMarketType(type)}
              >
                <LineChart className="w-4 h-4 mr-2" />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Time Range</h3>
            <Select
              value={timeRange}
              onValueChange={setTimeRange}
            >
              {timeRanges.map((range) => (
                <option key={range} value={range}>{range}</option>
              ))}
            </Select>
          </div>
        </Card>

        {/* Main Analysis View */}
        <div className="col-span-7 space-y-4">
          {/* Search and Refresh */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search markets..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={isLoading}
              >
                <RefreshCcw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </Card>

          {/* Market Overview */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Market Overview</h3>
              <Select
                value={selectedMetric}
                onValueChange={setSelectedMetric}
              >
                {metrics.map((metric) => (
                  <option key={metric} value={metric}>
                    {metric.replace("_", " ").toUpperCase()}
                  </option>
                ))}
              </Select>
            </div>
            <div className="h-[400px]">
              <MarketOverview
                data={marketData}
                metric={selectedMetric}
                timeRange={timeRange}
              />
            </div>
          </Card>

          {/* Analysis Tabs */}
          <Card className="p-4">
            <Tabs defaultValue="heatmap">
              <TabsList>
                <TabsTrigger value="heatmap">
                  <PieChart className="w-4 h-4 mr-2" />
                  Market Heatmap
                </TabsTrigger>
                <TabsTrigger value="sentiment">
                  <Zap className="w-4 h-4 mr-2" />
                  Sentiment Analysis
                </TabsTrigger>
                <TabsTrigger value="news">
                  <Newspaper className="w-4 h-4 mr-2" />
                  Market News
                </TabsTrigger>
              </TabsList>
              <TabsContent value="heatmap">
                <MarketHeatmap data={marketData} />
              </TabsContent>
              <TabsContent value="sentiment">
                <SentimentAnalysis data={marketData} />
              </TabsContent>
              <TabsContent value="news">
                <div className="space-y-4">
                  {marketNews.map((news) => (
                    <Card key={news.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">{news.title}</h4>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <span>{news.source}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(news.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={news.impact === "high" ? "destructive" : "outline"}>
                            {news.impact}
                          </Badge>
                          <Badge
                            variant={
                              news.sentiment === "positive" ? "default" :
                              news.sentiment === "negative" ? "destructive" :
                              "outline"
                            }
                          >
                            {news.sentiment}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Sidebar - Market Stats */}
        <Card className="col-span-3 p-4">
          <h2 className="text-lg font-semibold mb-4">Market Statistics</h2>
          <div className="space-y-4">
            {marketData.map((item) => (
              <Card key={item.symbol} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{item.symbol}</h3>
                  <Badge
                    variant={item.change >= 0 ? "default" : "destructive"}
                    className="flex items-center"
                  >
                    {item.change >= 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(item.change).toFixed(2)}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-medium">${item.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Volume</span>
                    <span className="font-medium">${(item.volume / 1e9).toFixed(2)}B</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Market Cap</span>
                    <span className="font-medium">${(item.marketCap / 1e9).toFixed(2)}B</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dominance</span>
                    <span className="font-medium">{item.dominance.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sentiment</span>
                    <span className="font-medium">{(item.sentiment * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
} 