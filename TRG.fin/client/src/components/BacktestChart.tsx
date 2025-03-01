import React from 'react';
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
  AreaChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BacktestChartProps {
  data?: {
    date: string;
    equity: number;
    drawdown?: number;
    benchmark?: number;
  }[];
  title?: string;
  showBenchmark?: boolean;
  showDrawdown?: boolean;
}

const BacktestChart: React.FC<BacktestChartProps> = ({
  data = [],
  title = 'Backtest Results',
  showBenchmark = true,
  showDrawdown = true
}) => {
  // If no data, show sample data
  const sampleData = [
    { date: '2024-01', equity: 10000, benchmark: 10000, drawdown: 0 },
    { date: '2024-02', equity: 11200, benchmark: 10500, drawdown: -200 },
    { date: '2024-03', equity: 12500, benchmark: 11000, drawdown: -500 },
    { date: '2024-04', equity: 13800, benchmark: 11200, drawdown: -300 },
    { date: '2024-05', equity: 15000, benchmark: 11800, drawdown: -100 },
  ];

  const chartData = data.length > 0 ? data : sampleData;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              {showDrawdown && <YAxis yAxisId="right" orientation="right" />}
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="equity"
                stroke="#8884d8"
                name="Strategy"
                strokeWidth={2}
              />
              {showBenchmark && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="benchmark"
                  stroke="#82ca9d"
                  name="Benchmark"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              )}
              {showDrawdown && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="drawdown"
                  stroke="#ff7300"
                  name="Drawdown"
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default BacktestChart; 