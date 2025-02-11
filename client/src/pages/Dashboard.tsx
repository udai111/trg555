import { Card } from "@/components/ui/card";
import { LineChart, Activity, BarChart2, Wallet } from "lucide-react";
import { useState } from "react";
import TickerTape from "@/components/TickerTape";
import SwotWidget from "@/components/SwotWidget";
import QVTWidget from "@/components/QVTWidget";
import ChecklistWidget from "@/components/ChecklistWidget";
import FundamentalWidget from "@/components/FundamentalWidget";
import InsiderTradingWidget from "@/components/InsiderTradingWidget";
import StockSelector from "@/components/StockSelector";

const Dashboard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('INFY');

  return (
    <div className="p-6">
      {/* Stock Selector */}
      <div className="mb-6">
        <StockSelector onStockChange={setSelectedSymbol} />
      </div>

      {/* Add Trendlyne widget at the top */}
      <div className="w-full mb-6 -mx-6 -mt-6 bg-white rounded-lg shadow">
        <TickerTape symbol={selectedSymbol} />
      </div>

      {/* Add SWOT widget */}
      <div className="w-full mb-6 bg-white rounded-lg shadow">
        <SwotWidget symbol={selectedSymbol} />
      </div>

      {/* Add QVT widget */}
      <div className="w-full mb-6 bg-white rounded-lg shadow">
        <QVTWidget symbol={selectedSymbol} />
      </div>

      {/* Add Checklist widget */}
      <div className="w-full mb-6 bg-white rounded-lg shadow">
        <ChecklistWidget symbol={selectedSymbol} />
      </div>

      {/* Add Fundamental widget */}
      <div className="w-full mb-6 bg-white rounded-lg shadow">
        <FundamentalWidget symbol={selectedSymbol} />
      </div>

      {/* Add Insider Trading widget */}
      <div className="w-full mb-6 bg-white rounded-lg shadow">
        <InsiderTradingWidget symbol={selectedSymbol} />
      </div>

      <h1 className="text-3xl font-bold mb-6">Market Dashboard</h1>

      {/* Market Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Market Status"
          value={selectedSymbol}
          change="Active"
          icon={Wallet}
          positive
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

      {/* Quick Actions and Market Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <ActionButton href="/ml-predictions">ML Predictions</ActionButton>
            <ActionButton href="/backtest">Run Backtest</ActionButton>
            <ActionButton href="/charts">View Charts</ActionButton>
            <ActionButton href="/market-analysis">Market Analysis</ActionButton>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Market Activity</h2>
          <div className="space-y-4">
            <ActivityItem 
              action="Price Alert"
              detail={`${selectedSymbol} crossed resistance at ₹1,580`}
              time="2 mins ago"
            />
            <ActivityItem 
              action="Volume Spike"
              detail={`Unusual trading volume in ${selectedSymbol}`}
              time="1 hour ago"
            />
            <ActivityItem 
              action="Technical Signal"
              detail={`${selectedSymbol} showing bullish MACD crossover`}
              time="3 hours ago"
            />
          </div>
        </Card>
      </div>
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

const ActionButton = ({ children, href }: { children: React.ReactNode; href: string }) => (
  <a 
    href={href}
    className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
  >
    {children}
  </a>
);

const ActivityItem = ({ action, detail, time }: { action: string; detail: string; time: string }) => (
  <div className="flex items-start justify-between">
    <div>
      <p className="font-medium">{action}</p>
      <p className="text-sm text-muted-foreground">{detail}</p>
    </div>
    <span className="text-xs text-muted-foreground">{time}</span>
  </div>
);

export default Dashboard;