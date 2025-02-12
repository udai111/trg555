import { useState } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Activity, BarChart2, Wallet, TrendingUp, TrendingDown, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StockSelector from "@/components/StockSelector";
import FXWidget from "@/components/FXWidget";
import TechnicalSummaryWidget from "@/components/TechnicalSummaryWidget";
import TradingViewWidget from "@/components/TradingViewWidget";
import InterestRatesWidget from "@/components/InterestRatesWidget";
import ForexCrossRatesWidget from "@/components/ForexCrossRatesWidget";
import PortfolioManagement from "@/components/PortfolioManagement";

const MarketHeatMap = ({ data, title, onFilter }: { data: any[]; title: string; onFilter?: (filter: string) => void }) => {
  const getColorIntensity = (change: number) => {
    const absChange = Math.abs(change);
    if (change > 0) {
      return `bg-green-${Math.min(Math.floor(absChange * 100), 500)}/${Math.min(Math.floor(absChange * 30), 90)}`;
    }
    return `bg-red-${Math.min(Math.floor(absChange * 100), 500)}/${Math.min(Math.floor(absChange * 30), 90)}`;
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        {onFilter && (
          <div className="flex gap-2">
            <Input 
              placeholder="Filter stocks..." 
              className="w-48"
              onChange={(e) => onFilter(e.target.value)}
            />
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {data.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.02 }}
            className={cn(
              "p-3 rounded-lg cursor-pointer transition-all hover:scale-105",
              getColorIntensity(item.change)
            )}
          >
            <div className="text-sm font-medium">{item.symbol}</div>
            <div className="text-xs opacity-80">{item.name}</div>
            <div className={cn(
              "text-xs font-mono mt-1",
              item.change > 0 ? "text-green-700" : "text-red-700"
            )}>
              {item.change > 0 ? "+" : ""}{item.change.toFixed(2)}%
            </div>
            <div className="text-xs opacity-70">₹{item.price.toFixed(2)}</div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

const Dashboard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE');
  const [filter, setFilter] = useState('');

  // Enhanced sample data with more details
  const indianStocksData = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2467.85, change: 2.5, volume: '2.1M' },
    { symbol: 'TCS', name: 'Tata Consultancy', price: 3890.45, change: -1.2, volume: '1.8M' },
    { symbol: 'INFY', name: 'Infosys Limited', price: 1567.90, change: 0.8, volume: '1.5M' },
    { symbol: 'HDFC', name: 'HDFC Bank', price: 1678.30, change: 3.1, volume: '2.3M' },
    { symbol: 'ICICI', name: 'ICICI Bank', price: 987.65, change: -0.5, volume: '1.2M' },
    { symbol: 'WIPRO', name: 'Wipro Limited', price: 456.70, change: 1.7, volume: '900K' },
    { symbol: 'AIRTEL', name: 'Bharti Airtel', price: 876.50, change: -2.1, volume: '1.1M' },
    { symbol: 'AXIS', name: 'Axis Bank', price: 987.60, change: 0.9, volume: '800K' },
    { symbol: 'SBI', name: 'State Bank of India', price: 567.80, change: 1.4, volume: '1.9M' },
    { symbol: 'LT', name: 'Larsen & Toubro', price: 2789.30, change: -1.8, volume: '700K' },
    // Add more stocks here...
  ];

  const internationalStocksData = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 189.30, change: 1.8, volume: '5.2M' },
    { symbol: 'MSFT', name: 'Microsoft', price: 420.45, change: 2.3, volume: '4.8M' },
    { symbol: 'GOOGL', name: 'Alphabet', price: 145.70, change: -0.7, volume: '3.1M' },
    { symbol: 'AMZN', name: 'Amazon', price: 178.90, change: 1.5, volume: '4.5M' },
    { symbol: 'TSLA', name: 'Tesla', price: 189.30, change: -2.4, volume: '6.7M' },
    { symbol: 'META', name: 'Meta Platforms', price: 478.90, change: 3.2, volume: '3.8M' },
    { symbol: 'NVDA', name: 'NVIDIA', price: 789.30, change: 4.1, volume: '5.6M' },
    { symbol: 'JPM', name: 'JPMorgan Chase', price: 189.30, change: -1.1, volume: '2.9M' },
    { symbol: 'V', name: 'Visa Inc.', price: 278.90, change: 0.6, volume: '2.1M' },
    { symbol: 'WMT', name: 'Walmart', price: 167.80, change: -0.3, volume: '1.8M' },
    // Add more stocks here...
  ];

  const cryptoData = [
    { symbol: 'BTC', name: 'Bitcoin', price: 48234.56, change: 5.2, volume: '12.5B' },
    { symbol: 'ETH', name: 'Ethereum', price: 2456.78, change: 3.8, volume: '8.9B' },
    { symbol: 'BNB', name: 'Binance Coin', price: 312.45, change: -2.1, volume: '3.4B' },
    { symbol: 'XRP', name: 'Ripple', price: 0.56, change: 1.9, volume: '2.1B' },
    { symbol: 'ADA', name: 'Cardano', price: 0.45, change: -3.4, volume: '1.8B' },
    { symbol: 'SOL', name: 'Solana', price: 98.76, change: 7.5, volume: '4.5B' },
    { symbol: 'DOT', name: 'Polkadot', price: 6.78, change: -1.7, volume: '890M' },
    { symbol: 'DOGE', name: 'Dogecoin', price: 0.089, change: 4.3, volume: '1.2B' },
    { symbol: 'MATIC', name: 'Polygon', price: 0.89, change: 2.8, volume: '780M' },
    { symbol: 'LINK', name: 'Chainlink', price: 15.67, change: -0.9, volume: '560M' },
    // Add more cryptocurrencies here...
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Trading Dashboard</h1>
          <p className="text-muted-foreground">Real-time market overview and analysis</p>
        </div>
        <StockSelector onStockChange={setSelectedSymbol} />
      </div>

      {/* Market Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Market Status"
          value={selectedSymbol}
          change="Active"
          icon={Wallet}
          positive={true}
        />
        <StatCard 
          title="Day's Change"
          value="+1.2%"
          change="↑ 45.30"
          icon={Activity}
          positive={true}
        />
        <StatCard 
          title="Trading Volume"
          value="2.1M"
          change="+15% avg"
          icon={BarChart2}
          positive={true}
        />
        <StatCard 
          title="Market Trend"
          value="Bullish"
          change="Strong Buy"
          icon={LineChart}
          positive={true}
        />
      </div>

      {/* Market Heat Maps */}
      <Tabs defaultValue="indian" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-[400px]">
          <TabsTrigger value="indian">Indian Markets</TabsTrigger>
          <TabsTrigger value="international">International</TabsTrigger>
          <TabsTrigger value="crypto">Cryptocurrency</TabsTrigger>
        </TabsList>

        <TabsContent value="indian" className="space-y-6">
          <MarketHeatMap 
            data={indianStocksData.filter(item => 
              item.symbol.toLowerCase().includes(filter.toLowerCase()) ||
              item.name.toLowerCase().includes(filter.toLowerCase())
            )} 
            title="Indian Stock Market Heat Map"
            onFilter={setFilter}
          />
        </TabsContent>

        <TabsContent value="international" className="space-y-6">
          <MarketHeatMap 
            data={internationalStocksData.filter(item =>
              item.symbol.toLowerCase().includes(filter.toLowerCase()) ||
              item.name.toLowerCase().includes(filter.toLowerCase())
            )} 
            title="International Markets Heat Map"
            onFilter={setFilter}
          />
        </TabsContent>

        <TabsContent value="crypto" className="space-y-6">
          <MarketHeatMap 
            data={cryptoData.filter(item =>
              item.symbol.toLowerCase().includes(filter.toLowerCase()) ||
              item.name.toLowerCase().includes(filter.toLowerCase())
            )} 
            title="Cryptocurrency Market Heat Map"
            onFilter={setFilter}
          />
        </TabsContent>
      </Tabs>

      {/* TradingView Chart */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Advanced Chart</h2>
        <TradingViewWidget />
      </Card>

      {/* Market Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TechnicalSummaryWidget />
        <InterestRatesWidget />
      </div>

      {/* Additional Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FXWidget />
        <ForexCrossRatesWidget />
      </div>

      {/* Portfolio Section */}
      <PortfolioManagement />
    </div>
  );
};

const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon,
  positive 
}: { 
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  positive: boolean;
}) => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <Icon className="w-5 h-5 text-muted-foreground" />
    </div>
    <div className="space-y-1">
      <p className="text-2xl font-bold">{value}</p>
      <p className={`text-sm ${positive ? 'text-green-500' : 'text-red-500'}`}>
        {change}
      </p>
    </div>
  </Card>
);

export default Dashboard;