// Add types at the top of the file
interface MarketItem {
  symbol: string;
  change: number;
  price: number;
  volume: string;
}

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  category: string;
  impact: 'Positive' | 'Negative' | 'Neutral';
}

interface WatchData {
  [key: string]: {
    price?: number;
    change?: number;
  };
}

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, ComposedChart, Scatter
} from "recharts";
import {
  ArrowUpCircle, ArrowDownCircle, TrendingUp, Plus, X,
  PieChart, BarChart2, Activity, DollarSign, Target,
  TrendingDown, ArrowRightLeft, Maximize2
} from "lucide-react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";


// Advanced Market Analysis Component
const MarketAnalysis = () => {
  const [gainers, setGainers] = useState<MarketItem[]>([]);
  const [losers, setLosers] = useState<MarketItem[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>(["RELIANCE", "TCS", "INFY"]);
  const [watchData, setWatchData] = useState<WatchData>({});
  const [newSymbol, setNewSymbol] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const [selectedIndicator, setSelectedIndicator] = useState("All");
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('');

  // Market Breadth Data
  const marketBreadthData = {
    advanceDecline: { advances: 1250, declines: 850, unchanged: 100 },
    newHighsLows: { newHighs: 45, newLows: 15 },
    vwap: 18245.75,
    putCallRatio: 1.2,
  };

  // Detailed Technical Indicators
  const detailedTechnicalIndicators = {
    momentum: [
      { name: "RSI (14)", value: 62.5, signal: "Neutral", detail: "Approaching overbought" },
      { name: "MACD", value: 125.8, signal: "Bullish", detail: "Positive crossover" },
      { name: "Stochastic", value: 82.5, signal: "Overbought", detail: "K-line above D-line" }
    ],
    trend: [
      { name: "EMA (20)", value: 18245.6, signal: "Above", detail: "Strong uptrend" },
      { name: "SMA (50)", value: 17856.4, signal: "Above", detail: "Medium-term bullish" },
      { name: "SMA (200)", value: 17245.8, signal: "Above", detail: "Long-term bullish" }
    ],
    volatility: [
      { name: "Bollinger Bands", value: "Upper", signal: "High volatility", detail: "Price near upper band" },
      { name: "ATR", value: 245.6, signal: "Increasing", detail: "Volatility expanding" },
      { name: "VIX", value: 16.8, signal: "Low", detail: "Market complacency" }
    ]
  };

  // Institutional Activity
  const institutionalData = {
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

  // Options Chain Summary
  const optionsChainSummary = {
    callOI: [
      { strike: 19000, oi: 12500, change: 2500, iv: 15.2 },
      { strike: 19100, oi: 15600, change: 3400, iv: 16.8 },
      { strike: 19200, oi: 18900, change: -1200, iv: 17.5 }
    ],
    putOI: [
      { strike: 18900, oi: 11200, change: -1500, iv: 14.8 },
      { strike: 18800, oi: 13400, change: 2100, iv: 15.5 },
      { strike: 18700, oi: 16700, change: 3400, iv: 16.2 }
    ],
    maxPainPoint: 19100
  };

  // Volume Profile Data
  const volumeProfileData = [
    { price: 19200, volume: 1500000, type: "Resistance" },
    { price: 19100, volume: 2200000, type: "High Volume Node" },
    { price: 19000, volume: 1800000, type: "Support" }
  ];

  // Market Internals
  const marketInternalsData = {
    tickerHeat: {
      strong_buy: 125,
      buy: 245,
      neutral: 180,
      sell: 156,
      strong_sell: 89
    },
    sectorRotation: [
      { sector: "IT", weeklyFlow: 458.2, monthlyFlow: 1245.8, momentum: "Increasing" },
      { sector: "Banking", weeklyFlow: 685.4, monthlyFlow: 2458.9, momentum: "Strong" },
      { sector: "Auto", weeklyFlow: -125.4, monthlyFlow: 458.2, momentum: "Weak" }
    ],
    marketDepthHeatMap: {
      buyZones: [
        { price: 19000, intensity: 0.8, volume: 15000 },
        { price: 18900, intensity: 0.6, volume: 12000 }
      ],
      sellZones: [
        { price: 19200, intensity: 0.7, volume: 14000 },
        { price: 19300, intensity: 0.5, volume: 10000 }
      ]
    }
  };

  // Price Action Signals
  const priceActionSignals = [
    { pattern: "Double Bottom", timeframe: "1H", reliability: 0.85, confirmation: true },
    { pattern: "Bull Flag", timeframe: "4H", reliability: 0.75, forming: true },
    { pattern: "Golden Cross", timeframe: "1D", reliability: 0.92, approaching: true }
  ];

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

  const sectorData = [
    { name: "IT", performance: 2.5, marketCap: "₹15.2L Cr", volume: "12.5M" },
    { name: "Banking", performance: 1.8, marketCap: "₹25.8L Cr", volume: "18.2M" },
    { name: "Auto", performance: -0.5, marketCap: "₹8.5L Cr", volume: "6.8M" },
    { name: "Pharma", performance: 1.2, marketCap: "₹7.2L Cr", volume: "5.4M" },
    { name: "FMCG", performance: -0.8, marketCap: "₹12.4L Cr", volume: "4.2M" }
  ];

  const technicalIndicators = [
    { name: "RSI (14)", value: 62.5, signal: "Neutral" },
    { name: "MACD", value: 125.8, signal: "Bullish" },
    { name: "Moving Avg (50)", value: 18245.6, signal: "Above" },
    { name: "Moving Avg (200)", value: 17856.4, signal: "Above" },
    { name: "Bollinger Bands", value: "Upper", signal: "Overbought" }
  ];

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

  const addToWatchlist = (symbol: string) => {
    if (symbol && !watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter((item) => item !== symbol));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Advanced Market Analysis</h2>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
          >
            {showAdvancedMetrics ? "Basic View" : "Advanced View"}
          </Button>
          <div className="flex gap-2 bg-accent/10 rounded-lg p-1">
            {["1D", "1W", "1M", "3M", "1Y"].map((timeframe) => (
              <Button
                key={timeframe}
                variant={selectedTimeframe === timeframe ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedTimeframe(timeframe)}
              >
                {timeframe}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="overview">Market Overview</TabsTrigger>
          <TabsTrigger value="technical">Technical Analysis</TabsTrigger>
          <TabsTrigger value="institutional">Institutional</TabsTrigger>
          <TabsTrigger value="options">Options Flow</TabsTrigger>
          <TabsTrigger value="breadth">Market Breadth</TabsTrigger>
          <TabsTrigger value="patterns">Price Patterns</TabsTrigger>
        </TabsList>

        {/* Market Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Market Breadth Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Market Breadth
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Advances</span>
                  <span className="text-green-500">{marketBreadthData.advanceDecline.advances}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Declines</span>
                  <span className="text-red-500">{marketBreadthData.advanceDecline.declines}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>A/D Ratio</span>
                  <span className={
                    marketBreadthData.advanceDecline.advances > marketBreadthData.advanceDecline.declines
                      ? "text-green-500"
                      : "text-red-500"
                  }>
                    {(marketBreadthData.advanceDecline.advances / marketBreadthData.advanceDecline.declines).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>New Highs</span>
                  <span className="text-green-500">{marketBreadthData.newHighsLows.newHighs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>New Lows</span>
                  <span className="text-red-500">{marketBreadthData.newHighsLows.newLows}</span>
                </div>
              </div>
            </Card>

            {/* FII/DII Activity */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Institutional Activity
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">FII Flow (₹ Cr)</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Net Position</span>
                      <span className={`font-semibold ${
                        institutionalData.fii.netBuy > 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {institutionalData.fii.netBuy > 0 ? '+' : ''}{institutionalData.fii.netBuy}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Weekly Trend: {institutionalData.fii.weeklyChange}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">DII Flow (₹ Cr)</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Net Position</span>
                      <span className={`font-semibold ${
                        institutionalData.dii.netBuy > 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {institutionalData.dii.netBuy > 0 ? '+' : ''}{institutionalData.dii.netBuy}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Weekly Trend: {institutionalData.dii.weeklyChange}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Market Internals */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Market Internals
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Signal Distribution</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-500">Strong Buy: {marketInternalsData.tickerHeat.strong_buy}</span>
                    <span className="text-red-500">Strong Sell: {marketInternalsData.tickerHeat.strong_sell}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Sector Momentum</h4>
                  {marketInternalsData.sectorRotation.slice(0, 3).map((sector, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span>{sector.sector}</span>
                      <span className={sector.weeklyFlow > 0 ? 'text-green-500' : 'text-red-500'}>
                        {sector.momentum}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Advanced Market View */}
          {showAdvancedMetrics && (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Volume Profile */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Volume Profile</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={volumeProfileData}>
                      <XAxis dataKey="price" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Bar dataKey="volume" yAxisId="left" fill="hsl(var(--primary))" opacity={0.5} />
                      <Scatter dataKey="volume" yAxisId="right" fill="hsl(var(--primary))" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Market Depth Heat Map */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Depth Heat Map</h3>
                <div className="space-y-2">
                  {marketInternalsData.marketDepthHeatMap.buyZones.map((zone, i) => (
                    <div
                      key={`buy-${i}`}
                      className="flex justify-between items-center p-2 rounded"
                      style={{
                        background: `rgba(34, 197, 94, ${zone.intensity})`,
                      }}
                    >
                      <span>₹{zone.price}</span>
                      <span>{zone.volume.toLocaleString()}</span>
                    </div>
                  ))}
                  {marketInternalsData.marketDepthHeatMap.sellZones.map((zone, i) => (
                    <div
                      key={`sell-${i}`}
                      className="flex justify-between items-center p-2 rounded"
                      style={{
                        background: `rgba(239, 68, 68, ${zone.intensity})`,
                      }}
                    >
                      <span>₹{zone.price}</span>
                      <span>{zone.volume.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Technical Analysis Tab */}
        <TabsContent value="technical">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Object.entries(detailedTechnicalIndicators).map(([category, indicators]) => (
              <Card key={category} className="p-6">
                <h3 className="text-lg font-semibold mb-4 capitalize">{category} Indicators</h3>
                <div className="space-y-4">
                  {indicators.map((indicator, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{indicator.name}</span>
                        <span className="font-mono">{indicator.value}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={`${
                          indicator.signal === "Bullish" || indicator.signal === "Above"
                            ? "text-green-500"
                            : indicator.signal === "Bearish" || indicator.signal === "Below"
                              ? "text-red-500"
                              : "text-yellow-500"
                        }`}>
                          {indicator.signal}
                        </span>
                        <span className="text-muted-foreground">{indicator.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Options Flow Tab */}
        <TabsContent value="options">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Call Options Chain</h3>
              <div className="space-y-4">
                {optionsChainSummary.callOI.map((strike, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">₹{strike.strike}</span>
                      <p className="text-sm text-muted-foreground">IV: {strike.iv}%</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono">{strike.oi.toLocaleString()}</span>
                      <p className={`text-sm ${strike.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {strike.change > 0 ? '+' : ''}{strike.change.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Put Options Chain</h3>
              <div className="space-y-4">
                {optionsChainSummary.putOI.map((strike, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">₹{strike.strike}</span>
                      <p className="text-sm text-muted-foreground">IV: {strike.iv}%</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono">{strike.oi.toLocaleString()}</span>
                      <p className={`text-sm ${strike.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {strike.change > 0 ? '+' : ''}{strike.change.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="col-span-2 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Options Summary</h3>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    PCR: {marketBreadthData.putCallRatio}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Max Pain: ₹{optionsChainSummary.maxPainPoint}
                  </span>
                </div>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={[...optionsChainSummary.callOI, ...optionsChainSummary.putOI]}
                  >
                    <XAxis dataKey="strike" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="oi" fill="hsl(var(--primary))" />
                    <Line type="monotone" dataKey="iv" stroke="#ff7300" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Market Breadth Tab */}
        <TabsContent value="breadth">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Sector Rotation Analysis</h3>
              <div className="space-y-4">
                {marketInternalsData.sectorRotation.map((sector, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{sector.sector}</span>
                      <span className={`${
                        sector.weeklyFlow > 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {sector.momentum}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Weekly: {sector.weeklyFlow > 0 ? '+' : ''}₹{Math.abs(sector.weeklyFlow)}Cr</span>
                      <span>Monthly: {sector.monthlyFlow > 0 ? '+' : ''}₹{Math.abs(sector.monthlyFlow)}Cr</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Market Signals Distribution</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(marketInternalsData.tickerHeat).map(([signal, count]) => (
                    <div
                      key={signal}
                      className="text-center p-2 rounded bg-accent/10"
                    >
                      <div className="text-lg font-semibold">{count}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {signal.replace('_', ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Price Patterns Tab */}
        <TabsContent value="patterns">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Active Price Patterns</h3>
              <div className="space-y-4">
                {priceActionSignals.map((pattern, i) => (
                  <div key={i} className="p-4 rounded bg-accent/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{pattern.pattern}</span>
                      <span className={`text-sm ${
                        pattern.reliability > 0.8 ? 'text-green-500' :
                          pattern.reliability > 0.6 ? 'text-yellow-500' :
                            'text-red-500'
                      }`}>
                        {(pattern.reliability * 100).toFixed(0)}% Reliability
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Timeframe: {pattern.timeframe}</span>
                      <span>
                        {pattern.confirmation ? '✓ Confirmed' :
                          pattern.forming ? '⋯ Forming' :
                            pattern.approaching ? '→ Approaching' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Support & Resistance Levels</h3>
              <div className="space-y-4">
                {volumeProfileData.map((level, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">₹{level.price}</span>
                      <p className="text-sm text-muted-foreground">{level.type}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono">{level.volume.toLocaleString()}</span>
                      <p className="text-sm text-muted-foreground">Volume</p>
                    </div>
                  </div>
                ))}
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
                  <span className={`text-${institutionalData.fii.trend === 'Positive' ? 'green' : 'red'}-500`}>
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
                  <span className={`text-${institutionalData.fii.trend === 'Positive' ? 'green' : 'red'}-500`}>
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
                  <span className={`text-${institutionalData.dii.trend === 'Positive' ? 'green' : 'red'}-500`}>
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
                  <span className={`text-${institutionalData.dii.trend === 'Positive' ? 'green' : 'red'}-500`}>
                    {institutionalData.dii.weeklyChange}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* News & Updates Tab */}
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
            <div key={symbol} className="flex justify-between items-center p-4 bg-accent/10 rounded-lg">
              <span>{symbol}</span>
              <Button variant="ghost" size="sm" onClick={() => removeFromWatchlist(symbol)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Advanced Trading Section */}
      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Advanced Trading</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Entry */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label>Symbol</Label>
              <Input
                placeholder="Enter symbol"
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value.toUpperCase())}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Order Type</Label>
                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select order type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MARKET">Market</SelectItem>
                    <SelectItem value="LIMIT">Limit</SelectItem>
                    <SelectItem value="STOP">Stop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label>Side</Label>
                <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select side" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUY">Buy</SelectItem>
                    <SelectItem value="SELL">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Quantity</Label>
                <Input type="number" placeholder="Enter quantity" />
              </div>
              <div className="flex-1">
                <Label>Price</Label>
                <Input type="number" placeholder="Enter price" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch id="margin-trading" />
              <Label htmlFor="margin-trading">Enable Margin Trading</Label>
            </div>

            <Button className="w-full">
              Place Order
            </Button>
          </div>

          {/* Active Orders */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Active Orders</h3>
            <div className="space-y-2">
              {[
                { id: 1, symbol: 'RELIANCE', type: 'LIMIT', side: 'BUY', qty: 100, price: 2500 },
                { id: 2, symbol: 'TCS', type: 'STOP', side: 'SELL', qty: 50, price: 3800 }
              ].map((order) => (
                <div key={order.id} className="flex justify-between items-center p-3 bg-accent/10 rounded-lg">
                  <div>
                    <div className="font-medium">{order.symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.type} {order.side} {order.qty}@₹{order.price}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Trade History */}
      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Trade History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Symbol</th>
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Side</th>
                <th className="text-right p-2">Quantity</th>
                <th className="text-right p-2">Price</th>
                <th className="text-right p-2">Value</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: '2025-02-11', symbol: 'RELIANCE', type: 'MARKET', side: 'BUY', qty: 100, price: 2480, value: 248000 },
                { date: '2025-02-11', symbol: 'INFY', type: 'LIMIT', side: 'SELL', qty: 50, price: 1560, value: 78000 }
              ].map((trade, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{trade.date}</td>
                  <td className="p-2">{trade.symbol}</td>
                  <td className="p-2">{trade.type}</td>
                  <td className="p-2">{trade.side}</td>
                  <td className="text-right p-2">{trade.qty}</td>
                  <td className="text-right p-2">₹{trade.price}</td>
                  <td className="text-right p-2">₹{trade.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Risk Analysis */}
      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Risk Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-accent/10 rounded-lg">
            <h3 className="font-medium mb-2">Portfolio Beta</h3>
            <div className="text-2xl font-bold">1.15</div>
            <p className="text-sm text-muted-foreground mt-1">Relative to Nifty 50</p>
          </div>
          <div className="p-4 bg-accent/10 rounded-lg">
            <h3 className="font-medium mb-2">Value at Risk (1D)</h3>
            <div className="text-2xl font-bold">₹15,420</div>
            <p className="text-sm text-muted-foreground mt-1">95% confidence</p>
          </div>
          <div className="p-4 bg-accent/10 rounded-lg">
            <h3 className="font-medium mb-2">Margin Utilization</h3>
            <div className="text-2xl font-bold">42%</div>
            <p className="text-sm text-muted-foreground mt-1">Available: ₹2.8L</p>
          </div>
        </div>
      </Card>

      {/* Economic Calendar */}
      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Economic Calendar</h2>
        <div className="overflow-x-auto">
          <iframe 
            src="https://sslecal2.investing.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&features=datepicker,timezone&countries=25,34,32,6,37,72,71,22,17,51,39,14,33,10,35,42,43,45,38,56,36,110,11,26,9,12,41,4,5,178&calType=week&timeZone=23&lang=56" 
            width="650" 
            height="467" 
            frameBorder="0" 
            allowTransparency={true} 
            marginWidth={0} 
            marginHeight={0}
            className="w-full"
          />
          <div className="poweredBy mt-2" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
            <span style={{ fontSize: "11px", color: "#333333", textDecoration: "none" }}>
              Real Time Economic Calendar provided by{" "}
              <a 
                href="https://in.Investing.com/" 
                rel="nofollow" 
                target="_blank" 
                style={{ fontSize: "11px", color: "#06529D", fontWeight: "bold" }}
                className="underline_link"
              >
                Investing.com India
              </a>
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MarketAnalysis;