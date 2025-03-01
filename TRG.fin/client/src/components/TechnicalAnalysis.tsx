import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TechnicalIndicator } from '@/lib/api/market';

interface TechnicalAnalysisProps {
  rsiData: TechnicalIndicator[];
  macdData: any[];
  className?: string;
}

const TechnicalAnalysis: React.FC<TechnicalAnalysisProps> = ({ rsiData, macdData, className }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <h2 className="text-xl font-semibold">Technical Analysis</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* RSI Chart */}
        <div>
          <h3 className="text-lg font-medium mb-2">Relative Strength Index (RSI)</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rsiData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" name="RSI" />
                {/* Reference lines for overbought/oversold */}
                <Line type="monotone" dataKey={() => 70} stroke="#ff0000" strokeDasharray="3 3" name="Overbought" />
                <Line type="monotone" dataKey={() => 30} stroke="#00ff00" strokeDasharray="3 3" name="Oversold" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MACD Chart */}
        <div>
          <h3 className="text-lg font-medium mb-2">MACD</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={macdData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="macd" stroke="#2196f3" name="MACD" />
                <Line type="monotone" dataKey="signal" stroke="#f50057" name="Signal" />
                <Line type="monotone" dataKey="histogram" stroke="#4caf50" name="Histogram" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TechnicalAnalysis; 