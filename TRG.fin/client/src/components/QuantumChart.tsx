import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';
import { Card } from './ui/card';

interface QuantumChartProps {
  strategy: {
    name: string;
    description: string;
    parameters: {
      entanglement: number;
      superposition: number;
      interference: number;
    };
  };
  parameters: {
    entanglement: number;
    superposition: number;
    interference: number;
  };
  symbol: string;
}

interface DataPoint {
  timestamp: string;
  price: number;
  quantumSignal: number;
  probability: number;
  volume: number;
}

const QuantumChart: React.FC<QuantumChartProps> = ({ strategy, parameters, symbol }) => {
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    // Generate mock data based on strategy parameters
    const generateData = () => {
      const newData: DataPoint[] = [];
      const basePrice = Math.random() * 1000 + 100;
      const now = new Date();

      for (let i = 0; i < 50; i++) {
        const timestamp = new Date(now.getTime() - (49 - i) * 60000);
        const quantumEffect = (
          parameters.entanglement * Math.sin(i / 5) +
          parameters.superposition * Math.cos(i / 3) +
          parameters.interference * Math.sin(i / 4)
        ) / 3;

        newData.push({
          timestamp: timestamp.toISOString(),
          price: basePrice * (1 + Math.sin(i / 10) * 0.05),
          quantumSignal: quantumEffect,
          probability: Math.abs(Math.sin(i / 8)) * 0.5 + 0.3,
          volume: Math.random() * 1000000
        });
      }
      return newData;
    };

    setData(generateData());
    const interval = setInterval(() => {
      setData(prev => {
        const newPoint: DataPoint = {
          timestamp: new Date().toISOString(),
          price: prev[prev.length - 1].price * (1 + (Math.random() - 0.5) * 0.02),
          quantumSignal: (
            parameters.entanglement * Math.sin(prev.length / 5) +
            parameters.superposition * Math.cos(prev.length / 3) +
            parameters.interference * Math.sin(prev.length / 4)
          ) / 3,
          probability: Math.abs(Math.sin(prev.length / 8)) * 0.5 + 0.3,
          volume: Math.random() * 1000000
        };
        return [...prev.slice(1), newPoint];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [parameters, strategy, symbol]);

  if (!data.length) {
    return (
      <Card className="w-full h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">Loading quantum data...</p>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
          <p className="text-sm font-medium">
            {new Date(label).toLocaleTimeString()}
          </p>
          <p className="text-sm text-primary">
            Price: ${payload[0].value.toFixed(2)}
          </p>
          <p className="text-sm text-blue-500">
            Quantum Signal: {payload[1].value.toFixed(3)}
          </p>
          <p className="text-sm text-purple-500">
            Probability: {(payload[2].value * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-4 w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis
            dataKey="timestamp"
            tick={{ fill: 'currentColor', fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleTimeString()}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: 'currentColor', fontSize: 12 }}
            domain={['auto', 'auto']}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 1]}
            tick={{ fill: 'currentColor', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="price"
            stroke="#10b981"
            dot={false}
            name="Price"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="quantumSignal"
            stroke="#3b82f6"
            dot={false}
            name="Quantum Signal"
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="probability"
            fill="#a855f7"
            stroke="#a855f7"
            fillOpacity={0.2}
            name="Probability"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default QuantumChart; 