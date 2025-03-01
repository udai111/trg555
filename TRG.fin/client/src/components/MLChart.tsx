import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Card } from "./ui/card";

export interface Prediction {
  current_price: number;
  prediction_1d: number;
  prediction_7d: number;
  prediction_1m: number;
  prediction_3m: number;
  confidence: number;
  prediction_direction: 'up' | 'down';
  features: {
    rsi: number;
    macd: number;
    volume: number;
    moving_avg_50: number;
    moving_avg_200: number;
    [key: string]: number;
  };
}

interface Model {
  id: string;
  name: string;
  type: string;
  accuracy: number;
  description: string;
  features: string[];
}

interface MLChartProps {
  predictions: Prediction[];
  symbol: string;
}

const MLChart: React.FC<MLChartProps> = ({ predictions, symbol }) => {
  if (!predictions || predictions.length === 0) {
    return <div className="flex items-center justify-center h-full">No prediction data available</div>;
  }

  const currentPrediction = predictions[0];

  // Create chart data from predictions
  const chartData = [
    {
      name: 'Current',
      price: currentPrediction.current_price,
      confidence: 1.0,
    },
    {
      name: '1 Day',
      price: currentPrediction.prediction_1d,
      confidence: currentPrediction.confidence,
    },
    {
      name: '1 Week',
      price: currentPrediction.prediction_7d,
      confidence: currentPrediction.confidence * 0.95, // Slightly decrease confidence for longer timeframes
    },
    {
      name: '1 Month',
      price: currentPrediction.prediction_1m,
      confidence: currentPrediction.confidence * 0.9,
    },
    {
      name: '3 Months',
      price: currentPrediction.prediction_3m,
      confidence: currentPrediction.confidence * 0.85,
    },
  ];

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Calculate Y axis domain with some padding
  const minPrice = Math.min(...chartData.map((d) => d.price)) * 0.95;
  const maxPrice = Math.max(...chartData.map((d) => d.price)) * 1.05;

  return (
    <div className="w-full h-full min-h-[300px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis 
            domain={[minPrice, maxPrice]} 
            tickFormatter={formatPrice}
          />
          <YAxis 
            yAxisId={1}
            orientation="right"
            domain={[0, 1]}
            tickFormatter={(value: number) => `${(value * 100).toFixed(0)}%`}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'Confidence') {
                return [`${(value * 100).toFixed(1)}%`, name];
              }
              return [formatPrice(value), name];
            }}
            labelStyle={{ color: 'black' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 8 }}
            name={`${symbol} Price`}
          />
          <Line
            type="monotone"
            dataKey="confidence"
            stroke="#16a34a"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 8 }}
            name="Confidence"
            yAxisId={1}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MLChart; 