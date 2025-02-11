import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, Plus, X, PieChart, BarChart2, Activity } from "lucide-react";
import { motion } from "framer-motion";

const MarketAnalysis = () => {
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [watchlist, setWatchlist] = useState(["RELIANCE", "TCS", "INFY"]);
  const [watchData, setWatchData] = useState({});
  const [newSymbol, setNewSymbol] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch top gainers
  useEffect(() => {
    const fetchGainers = async () => {
      try {
        setGainers([
          { symbol: "HDFCBANK", change: 3.5, price: 1678.45, volume: "2.5M" },
          { symbol: "TCS", change: 2.8, price: 3890.20, volume: "1.8M" },
          { symbol: "INFY", change: 2.3, price: 1567.80, volume: "1.2M" },
          { symbol: "BHARTIARTL", change: 2.1, price: 892.35, volume: "900K" },
          { symbol: "LT", change: 1.9, price: 3456.70, volume: "750K" }
        ]);
      } catch (error) {
        console.error("Error fetching gainers:", error);
      }
    };
    fetchGainers();
  }, []);

  // Fetch top losers
  useEffect(() => {
    const fetchLosers = async () => {
      try {
        setLosers([
          { symbol: "WIPRO", change: -2.1, price: 456.75, volume: "1.5M" },
          { symbol: "TECHM", change: -1.8, price: 1234.56, volume: "1.1M" },
          { symbol: "ITC", change: -1.5, price: 389.90, volume: "2.2M" },
          { symbol: "HINDUNILVR", change: -1.3, price: 2567.80, volume: "800K" },
          { symbol: "TATASTEEL", change: -1.2, price: 145.60, volume: "3.1M" }
        ]);
      } catch (error) {
        console.error("Error fetching losers:", error);
      }
    };
    fetchLosers();
  }, []);

  // Fetch market news with categories
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setNewsItems([
          {
            title: "Markets hit new highs as IT stocks rally",
            link: "#",
            pubDate: new Date().toLocaleDateString(),
            category: "Market Update",
            impact: "Positive"
          },
          {
            title: "RBI keeps rates unchanged in latest policy meeting",
            link: "#",
            pubDate: new Date().toLocaleDateString(),
            category: "Policy",
            impact: "Neutral"
          },
          {
            title: "Global markets show positive momentum",
            link: "#",
            pubDate: new Date().toLocaleDateString(),
            category: "Global Markets",
            impact: "Positive"
          },
          {
            title: "Banking sector leads market recovery",
            link: "#",
            pubDate: new Date().toLocaleDateString(),
            category: "Sector News",
            impact: "Positive"
          },
          {
            title: "FII buying continues in emerging markets",
            link: "#",
            pubDate: new Date().toLocaleDateString(),
            category: "FII/DII Activity",
            impact: "Positive"
          }
        ]);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };
    fetchNews();
  }, []);

  // Sector Performance Data
  const sectorData = [
    { name: "IT", performance: 2.5, marketCap: "₹15.2L Cr", volume: "12.5M" },
    { name: "Banking", performance: 1.8, marketCap: "₹25.8L Cr", volume: "18.2M" },
    { name: "Auto", performance: -0.5, marketCap: "₹8.5L Cr", volume: "6.8M" },
    { name: "Pharma", performance: 1.2, marketCap: "₹7.2L Cr", volume: "5.4M" },
    { name: "FMCG", performance: -0.8, marketCap: "₹12.4L Cr", volume: "4.2M" }
  ];

  // Technical Indicators
  const technicalIndicators = [
    { name: "RSI (14)", value: 62.5, signal: "Neutral" },
    { name: "MACD", value: 125.8, signal: "Bullish" },
    { name: "Moving Avg (50)", value: 18245.6, signal: "Above" },
    { name: "Moving Avg (200)", value: 17856.4, signal: "Above" },
    { name: "Bollinger Bands", value: "Upper", signal: "Overbought" }
  ];

  // Market Depth Data
  const marketDepthData = {
    buy: [
      { price: 1255.50, quantity: 1500, orders: 25 },
      { price: 1255.45, quantity: 2200, orders: 18 },
      { price: 1255.40, quantity: 1800, orders: 15 }
    ],
    sell: [
      { price: 1255.55, quantity: 1200, orders: 20 },
      { price: 1255.60, quantity: 2500, orders: 22 },
      { price: 1255.65, quantity: 1600, orders: 17 }
    ]
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Market Analysis Dashboard</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Market Overview</TabsTrigger>
          <TabsTrigger value="technical">Technical Analysis</TabsTrigger>
          <TabsTrigger value="depth">Market Depth</TabsTrigger>
          <TabsTrigger value="news">News & Updates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Market Movers */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Gainers</h3>
              <div className="space-y-4">
                {gainers.map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{item.symbol}</span>
                      <p className="text-sm text-muted-foreground">Vol: {item.volume}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>₹{item.price}</span>
                      <span className="text-green-500">+{item.change}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-semibold mt-6 mb-4">Top Losers</h3>
              <div className="space-y-4">
                {losers.map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{item.symbol}</span>
                      <p className="text-sm text-muted-foreground">Vol: {item.volume}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>₹{item.price}</span>
                      <span className="text-red-500">{item.change}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Sector Performance */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Sector Performance</h3>
              <div className="space-y-4">
                {sectorData.map((sector, i) => (
                  <div key={i} className="flex justify-between items-center p-2 hover:bg-accent/10 rounded-lg">
                    <div>
                      <span className="font-medium">{sector.name}</span>
                      <p className="text-sm text-muted-foreground">
                        Cap: {sector.marketCap} | Vol: {sector.volume}
                      </p>
                    </div>
                    <span className={sector.performance >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {sector.performance >= 0 ? '+' : ''}{sector.performance}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Market Sentiment Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Market Trend</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { time: "9:30", value: 100 },
                    { time: "10:00", value: 105 },
                    { time: "10:30", value: 102 },
                    { time: "11:00", value: 108 },
                    { time: "11:30", value: 106 },
                    { time: "12:00", value: 110 }
                  ]}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
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
        </TabsContent>

        <TabsContent value="technical">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Technical Indicators */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Technical Indicators</h3>
              <div className="space-y-4">
                {technicalIndicators.map((indicator, i) => (
                  <div key={i} className="flex justify-between items-center p-2 hover:bg-accent/10 rounded-lg">
                    <div>
                      <span className="font-medium">{indicator.name}</span>
                      <p className="text-sm text-muted-foreground">Signal: {indicator.signal}</p>
                    </div>
                    <span className="font-mono">{indicator.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Volume Analysis */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Volume Analysis</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectorData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="performance" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="depth">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Market Depth</h3>
            <div className="grid grid-cols-2 gap-6">
              {/* Buy Orders */}
              <div>
                <h4 className="text-md font-medium mb-2 text-green-500">Buy Orders</h4>
                <div className="space-y-2">
                  {marketDepthData.buy.map((order, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="font-mono">₹{order.price}</span>
                      <span>{order.quantity}</span>
                      <span className="text-muted-foreground">{order.orders} orders</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Sell Orders */}
              <div>
                <h4 className="text-md font-medium mb-2 text-red-500">Sell Orders</h4>
                <div className="space-y-2">
                  {marketDepthData.sell.map((order, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="font-mono">₹{order.price}</span>
                      <span>{order.quantity}</span>
                      <span className="text-muted-foreground">{order.orders} orders</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="news">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Market News & Updates</h3>
            <div className="space-y-4">
              {newsItems.map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-lg bg-accent/10"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary/10 text-primary mb-2">
                        {item.category}
                      </span>
                      <h4 className="font-medium">{item.title}</h4>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.impact === 'Positive' ? 'bg-green-100 text-green-800' :
                      item.impact === 'Negative' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.impact}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.pubDate}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Watchlist */}
      <Card className="p-6 mt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Watchlist</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Add symbol..."
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
              className="w-40"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addToWatchlist(newSymbol);
                }
              }}
            />
            <Button onClick={() => addToWatchlist(newSymbol)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlist.map((symbol) => (
            <Card key={symbol} className="p-4 relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => removeFromWatchlist(symbol)}
              >
                <X className="w-4 h-4" />
              </Button>
              <div className="mt-2">
                <h4 className="font-semibold">{symbol}</h4>
                {watchData[symbol] ? (
                  <div className="space-y-1">
                    <p className="text-xl font-bold">₹{watchData[symbol].price}</p>
                    <p className={`text-sm ${
                      watchData[symbol].change >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {watchData[symbol].change >= 0 ? '+' : ''}{watchData[symbol].change}%
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Loading...</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default MarketAnalysis;