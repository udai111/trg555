import React from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface ProbabilityData {
  timestamp: string;
  upProbability: number;
  downProbability: number;
  sidewaysProbability: number;
  confidence: number;
}

interface TimeframeAnalysisProps {
  symbol: string;
  timeframe: string;
  data: ProbabilityData[];
}

const timeframeCorrelation = [
  { timeframe: "1m", correlation: 0.85 },
  { timeframe: "5m", correlation: 0.78 },
  { timeframe: "15m", correlation: 0.72 },
  { timeframe: "1h", correlation: 0.65 },
  { timeframe: "4h", correlation: 0.58 }
];

export default function TimeframeAnalysis({
  symbol,
  timeframe,
  data
}: TimeframeAnalysisProps) {
  const latestData = data[data.length - 1];
  const dominantTrend = latestData
    ? Object.entries({
        up: latestData.upProbability,
        down: latestData.downProbability,
        sideways: latestData.sidewaysProbability
      }).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
    : "unknown";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-2">Dominant Trend</h3>
          <Badge
            variant={
              dominantTrend === "up"
                ? "default"
                : dominantTrend === "down"
                ? "destructive"
                : "secondary"
            }
            className="text-lg"
          >
            {dominantTrend.charAt(0).toUpperCase() + dominantTrend.slice(1)}
          </Badge>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-2">Current Timeframe</h3>
          <div className="text-lg font-semibold">{timeframe}</div>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-2">Confidence Level</h3>
          <div className="text-lg font-semibold text-primary">
            {latestData ? `${(latestData.confidence * 100).toFixed(1)}%` : "N/A"}
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="text-sm font-medium mb-4">Timeframe Correlation</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeframeCorrelation}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timeframe" />
              <YAxis
                domain={[0, 1]}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <Tooltip
                formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                labelFormatter={(label) => `Timeframe: ${label}`}
              />
              <Bar
                dataKey="correlation"
                fill="#2563eb"
                name="Correlation"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
} 