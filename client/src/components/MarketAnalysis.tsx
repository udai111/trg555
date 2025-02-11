import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpCircle, ArrowDownCircle, TrendingUp } from "lucide-react";

const mockData = [
  { time: "9:30", value: 100 },
  { time: "10:00", value: 105 },
  { time: "10:30", value: 102 },
  { time: "11:00", value: 108 },
  { time: "11:30", value: 106 },
  { time: "12:00", value: 110 }
];

const MarketAnalysis = () => {
  const [marketTrends, setMarketTrends] = useState({
    momentum: 0.75,
    volatility: 0.45,
    sentiment: 0.62
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Market Analysis</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Market Momentum</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockData}>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2} 
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Market Indicators</h3>
          <div className="space-y-6">
            <IndicatorCard 
              title="Market Momentum"
              value={marketTrends.momentum}
              icon={TrendingUp}
            />
            <IndicatorCard 
              title="Volatility Index"
              value={marketTrends.volatility}
              icon={ArrowUpCircle}
            />
            <IndicatorCard 
              title="Sentiment Score"
              value={marketTrends.sentiment}
              icon={ArrowDownCircle}
            />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Market Summary</h3>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>Current market conditions indicate a <strong>bullish trend</strong> with moderate volatility.</p>
          <p>Key resistance levels are being tested with increased trading volume.</p>
          <p>Sentiment analysis suggests positive market outlook in the short term.</p>
        </div>
      </Card>
    </div>
  );
};

const IndicatorCard = ({ 
  title, 
  value, 
  icon: Icon 
}: { 
  title: string; 
  value: number; 
  icon: React.ElementType;
}) => (
  <div className="flex items-center justify-between">
    <div>
      <h4 className="text-sm font-medium">{title}</h4>
      <div className="text-2xl font-bold">{(value * 100).toFixed(1)}%</div>
    </div>
    <Icon className={`w-8 h-8 ${value > 0.5 ? 'text-green-500' : 'text-red-500'}`} />
  </div>
);

export default MarketAnalysis;
