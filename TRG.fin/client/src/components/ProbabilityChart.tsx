import React from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from "recharts";

interface ProbabilityData {
  timestamp: string;
  upProbability: number;
  downProbability: number;
  sidewaysProbability: number;
  confidence: number;
}

interface ProbabilityChartProps {
  data: ProbabilityData[];
}

export default function ProbabilityChart({ data }: ProbabilityChartProps) {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(value) => new Date(value).toLocaleTimeString()}
          />
          <YAxis
            yAxisId="left"
            domain={[0, 1]}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 1]}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
          />
          <Tooltip
            formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
            labelFormatter={(label) => new Date(label).toLocaleString()}
          />
          <Legend />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="upProbability"
            name="Uptrend Probability"
            fill="#22c55e"
            fillOpacity={0.3}
            stroke="#22c55e"
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="downProbability"
            name="Downtrend Probability"
            fill="#ef4444"
            fillOpacity={0.3}
            stroke="#ef4444"
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="sidewaysProbability"
            name="Sideways Probability"
            fill="#eab308"
            fillOpacity={0.3}
            stroke="#eab308"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="confidence"
            name="Confidence Level"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
} 