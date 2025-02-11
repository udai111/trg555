import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { Button } from "@/components/ui/button";

// Mock data generation functions
const generateSectorData = () => [
  { name: "IT", performance: 75 },
  { name: "Banks", performance: 30 },
  { name: "Energy", performance: 60 },
  { name: "Pharma", performance: 45 },
];

const generateTopPerformers = () => ({
  IT: [{ name: "INFY", change: 3.2 }, { name: "TCS", change: 2.1 }],
  Banks: [{ name: "HDFCBANK", change: 1.8 }],
  Energy: [{ name: "RELIANCE", change: 2.5 }],
  Pharma: [{ name: "SUNPHARMA", change: 1.1 }],
});

const ProTrading = () => {
  const [greedMeterValue, setGreedMeterValue] = useState(50);
  const [sectorData, setSectorData] = useState(generateSectorData());
  const [topPerformers, setTopPerformers] = useState(generateTopPerformers());

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setGreedMeterValue(Math.floor(Math.random() * 101));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Pro Trading Dashboard</h1>
      
      {/* Market Sentiment */}
      <Card className="p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Market Sentiment</h2>
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-48">
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(
                  #4caf50 ${greedMeterValue}%, 
                  #f44336 ${greedMeterValue}%
                )`
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{greedMeterValue}%</span>
            </div>
          </div>
        </div>
        <p className="text-center mt-4 text-lg">
          {greedMeterValue > 70
            ? "Extreme Greed"
            : greedMeterValue < 30
            ? "Extreme Fear"
            : "Neutral"}
        </p>
      </Card>

      {/* Sector Performance */}
      <Card className="p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Sector Performance</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sectorData} layout="vertical">
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="name" />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="performance" 
                fill="hsl(var(--primary))"
                className="fill-primary"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top Performers */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Top Performers by Sector</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(topPerformers).map(([sector, stocks]) => (
            <Card key={sector} className="p-4">
              <h3 className="text-lg font-semibold mb-2">{sector}</h3>
              <ul className="space-y-2">
                {stocks.map((stock, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{stock.name}</span>
                    <span className="text-green-500">+{stock.change}%</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ProTrading;
