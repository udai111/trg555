import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, Plus, X } from "lucide-react";
import { motion } from "framer-motion";

const MarketAnalysis = () => {
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [watchlist, setWatchlist] = useState(["RELIANCE", "TCS", "INFY"]);
  const [watchData, setWatchData] = useState({});
  const [newSymbol, setNewSymbol] = useState("");

  // Fetch top gainers
  useEffect(() => {
    const fetchGainers = async () => {
      try {
        // Mocked data for now
        setGainers([
          { symbol: "HDFCBANK", change: 3.5, price: 1678.45 },
          { symbol: "TCS", change: 2.8, price: 3890.20 },
          { symbol: "INFY", change: 2.3, price: 1567.80 }
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
        // Mocked data for now
        setLosers([
          { symbol: "WIPRO", change: -2.1, price: 456.75 },
          { symbol: "TECHM", change: -1.8, price: 1234.56 },
          { symbol: "ITC", change: -1.5, price: 389.90 }
        ]);
      } catch (error) {
        console.error("Error fetching losers:", error);
      }
    };
    fetchLosers();
  }, []);

  // Fetch market news
  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Mocked news data
        setNewsItems([
          {
            title: "Markets hit new highs as IT stocks rally",
            link: "#",
            pubDate: new Date().toLocaleDateString()
          },
          {
            title: "RBI keeps rates unchanged in latest policy meeting",
            link: "#",
            pubDate: new Date().toLocaleDateString()
          },
          {
            title: "Global markets show positive momentum",
            link: "#",
            pubDate: new Date().toLocaleDateString()
          }
        ]);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };
    fetchNews();
  }, []);

  // Fetch watchlist data
  useEffect(() => {
    const fetchWatchlistData = async () => {
      try {
        // Mocked watchlist data
        const mockData = {
          RELIANCE: { price: 2456.78, change: 1.2 },
          TCS: { price: 3890.20, change: 2.8 },
          INFY: { price: 1567.80, change: 2.3 }
        };
        setWatchData(mockData);
      } catch (error) {
        console.error("Error fetching watchlist data:", error);
      }
    };
    fetchWatchlistData();
  }, [watchlist]);

  const addToWatchlist = (symbol) => {
    if (!watchlist.includes(symbol) && symbol.trim()) {
      setWatchlist([...watchlist, symbol.trim().toUpperCase()]);
      setNewSymbol("");
    }
  };

  const removeFromWatchlist = (symbol) => {
    setWatchlist(watchlist.filter(s => s !== symbol));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Market Analysis Dashboard</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Market Movers */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Gainers</h3>
          <div className="space-y-4">
            {gainers.map((item, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="font-medium">{item.symbol}</span>
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
                <span className="font-medium">{item.symbol}</span>
                <div className="flex items-center gap-4">
                  <span>₹{item.price}</span>
                  <span className="text-red-500">{item.change}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Market News */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Market News</h3>
          <div className="space-y-4">
            {newsItems.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-lg bg-accent/10"
              >
                <a href={item.link} className="hover:text-primary transition-colors">
                  <h4 className="font-medium mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.pubDate}</p>
                </a>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Watchlist */}
      <Card className="p-6">
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

      {/* Market Sentiment */}
      <Card className="p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Market Sentiment</h3>
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
    </div>
  );
};

export default MarketAnalysis;