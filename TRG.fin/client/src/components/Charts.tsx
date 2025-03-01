import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ComposedChart,
  ReferenceLine
} from 'recharts';

interface ChartData {
  time: string;
  value: number;
}

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export function Charts() {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [chartType, setChartType] = useState<'line' | 'candle'>('line');
  const [timeframe, setTimeframe] = useState('1d');
  const [data, setData] = useState<ChartData[] | CandleData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/historical/${selectedSymbol}?interval=1m&range=${timeframe}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [selectedSymbol, timeframe]);

  const renderChart = () => {
    if (isLoading) {
      return <div className="flex items-center justify-center h-full">Loading...</div>;
    }

    if (error) {
      return <div className="flex items-center justify-center h-full text-red-500">{error}</div>;
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time"
              tickFormatter={(time) => new Date(time).toLocaleTimeString()}
            />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip
              labelFormatter={(label) => new Date(label).toLocaleString()}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#2563eb"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // Candlestick chart using ComposedChart
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data as CandleData[]}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time"
            tickFormatter={(time) => new Date(time).toLocaleTimeString()}
          />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip
            labelFormatter={(label) => new Date(label).toLocaleString()}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
          />
          {/* Draw candlestick bodies */}
          {(data as CandleData[]).map((candle, index) => (
            <React.Fragment key={index}>
              {/* Candlestick body */}
              <ReferenceLine
                segment={[
                  { x: index, y: candle.open },
                  { x: index, y: candle.close }
                ]}
                stroke={candle.open > candle.close ? '#ef4444' : '#22c55e'}
                strokeWidth={8}
              />
              {/* Candlestick wicks */}
              <ReferenceLine
                segment={[
                  { x: index, y: candle.high },
                  { x: index, y: candle.low }
                ]}
                stroke={candle.open > candle.close ? '#ef4444' : '#22c55e'}
              />
            </React.Fragment>
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Market Charts
            </CardTitle>
            <div className="flex gap-2">
              <select
                className="px-3 py-2 rounded-md border border-input bg-background"
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
              >
                <option value="AAPL">AAPL</option>
                <option value="GOOGL">GOOGL</option>
                <option value="MSFT">MSFT</option>
                <option value="AMZN">AMZN</option>
              </select>
              <select
                className="px-3 py-2 rounded-md border border-input bg-background"
                value={chartType}
                onChange={(e) => setChartType(e.target.value as 'line' | 'candle')}
              >
                <option value="line">Line Chart</option>
                <option value="candle">Candlestick</option>
              </select>
              <select
                className="px-3 py-2 rounded-md border border-input bg-background"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <option value="1d">1 Day</option>
                <option value="1w">1 Week</option>
                <option value="1m">1 Month</option>
                <option value="3m">3 Months</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] w-full">
            {renderChart()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 