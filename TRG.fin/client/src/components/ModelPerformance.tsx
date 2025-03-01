import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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

interface Model {
  id: string;
  name: string;
  type: string;
  accuracy: number;
  description: string;
  features: string[];
}

interface ModelPerformanceProps {
  model: Model;
}

const ModelPerformance: React.FC<ModelPerformanceProps> = ({ model }) => {
  const metrics = [
    { name: 'Accuracy', value: model.accuracy },
    { name: 'Precision', value: model.accuracy * 0.95 },
    { name: 'Recall', value: model.accuracy * 0.92 },
    { name: 'F1 Score', value: model.accuracy * 0.93 }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.name} className="p-4">
            <h3 className="text-sm font-medium mb-2">{metric.name}</h3>
            <Progress value={metric.value * 100} className="h-2 mb-2" />
            <span className="text-sm text-muted-foreground">
              {(metric.value * 100).toFixed(1)}%
            </span>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <h3 className="text-sm font-medium mb-4">Performance Metrics</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" />
              <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
              <Tooltip
                formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
              />
              <Bar dataKey="value" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default ModelPerformance; 