import { useState } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Activity, BarChart2, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import StockSelector from "@/components/StockSelector";
import FXWidget from "@/components/FXWidget";
import TechnicalSummaryWidget from "@/components/TechnicalSummaryWidget";
import TradingViewWidget from "@/components/TradingViewWidget";
import InterestRatesWidget from "@/components/InterestRatesWidget";
import ForexCrossRatesWidget from "@/components/ForexCrossRatesWidget";
import PortfolioManagement from "@/components/PortfolioManagement";

const MarketHeatMap = ({ data, title }: { data: any[]; title: string }) => (
  <Card className="p-6">
    <h3 className="text-xl font-semibold mb-4">{title}</h3>
    <div className="grid grid-cols-5 gap-2">
      {data.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "p-3 rounded-lg cursor-pointer transition-all",
            item.change > 2 ? "bg-green-500/20" :
            item.change > 0 ? "bg-green-400/20" :
            item.change > -2 ? "bg-red-400/20" :
            "bg-red-500/20"
          )}
        >
          <div className="text-sm font-medium">{item.symbol}</div>
          <div className={cn(
            "text-xs",
            item.change > 0 ? "text-green-500" : "text-red-500"
          )}>
            {item.change > 0 ? "+" : ""}{item.change}%
          </div>
        </motion.div>
      ))}
    </div>
  </Card>
);

const Dashboard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE');

  // Sample data - replace with real data from your API
  const indianStocksData = [
    { symbol: 'RELIANCE', change: 2.5 },
    { symbol: 'TCS', change: -1.2 },
    { symbol: 'INFY', change: 0.8 },
    { symbol: 'HDFC', change: 3.1 },
    { symbol: 'ICICI', change: -0.5 },
    { symbol: 'WIPRO', change: 1.7 },
    { symbol: 'AIRTEL', change: -2.1 },
    { symbol: 'AXIS', change: 0.9 },
    { symbol: 'SBI', change: 1.4 },
    { symbol: 'LT', change: -1.8 },
  ];

  const internationalStocksData = [
    { symbol: 'AAPL', change: 1.8 },
    { symbol: 'MSFT', change: 2.3 },
    { symbol: 'GOOGL', change: -0.7 },
    { symbol: 'AMZN', change: 1.5 },
    { symbol: 'TSLA', change: -2.4 },
    { symbol: 'META', change: 3.2 },
    { symbol: 'NVDA', change: 4.1 },
    { symbol: 'JPM', change: -1.1 },
    { symbol: 'V', change: 0.6 },
    { symbol: 'WMT', change: -0.3 },
  ];

  const cryptoData = [
    { symbol: 'BTC', change: 5.2 },
    { symbol: 'ETH', change: 3.8 },
    { symbol: 'BNB', change: -2.1 },
    { symbol: 'XRP', change: 1.9 },
    { symbol: 'ADA', change: -3.4 },
    { symbol: 'SOL', change: 7.5 },
    { symbol: 'DOT', change: -1.7 },
    { symbol: 'DOGE', change: 4.3 },
    { symbol: 'MATIC', change: 2.8 },
    { symbol: 'LINK', change: -0.9 },
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
          <MarketHeatMap data={indianStocksData} title="Indian Stock Market Heat Map" />
        </TabsContent>

        <TabsContent value="international" className="space-y-6">
          <MarketHeatMap data={internationalStocksData} title="International Markets Heat Map" />
        </TabsContent>

        <TabsContent value="crypto" className="space-y-6">
          <MarketHeatMap data={cryptoData} title="Cryptocurrency Market Heat Map" />
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