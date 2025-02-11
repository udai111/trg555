import { Card } from "@/components/ui/card";
import { LineChart, Activity, BarChart2, Wallet } from "lucide-react";
import TickerTape from "@/components/TickerTape";

const Dashboard = () => {
  return (
    <div className="p-6">
      {/* Add TickerTape at the top */}
      <div className="w-full h-12 mb-6 -mx-6 -mt-6">
        <TickerTape />
      </div>

      <h1 className="text-3xl font-bold mb-6">Premium Trading Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Portfolio Value"
          value="$124,532"
          change="+2.4%"
          icon={Wallet}
          positive
        />
        <StatCard 
          title="Open Positions"
          value="8"
          change="-1"
          icon={Activity}
          positive={false}
        />
        <StatCard 
          title="Win Rate"
          value="68%"
          change="+5%"
          icon={BarChart2}
          positive
        />
        <StatCard 
          title="Avg Return"
          value="12.4%"
          change="+1.2%"
          icon={LineChart}
          positive
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <ActionButton href="/ml-predictions">ML Predictions</ActionButton>
            <ActionButton href="/backtest">Run Backtest</ActionButton>
            <ActionButton href="/charts">View Charts</ActionButton>
            <ActionButton href="/settings">Settings</ActionButton>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <ActivityItem 
              action="ML Prediction Generated"
              detail="AAPL +2.4% expected"
              time="2 mins ago"
            />
            <ActivityItem 
              action="Backtest Completed"
              detail="SMA Strategy: +15.2% return"
              time="1 hour ago"
            />
            <ActivityItem 
              action="New Signal Alert"
              detail="RSI oversold on TSLA"
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