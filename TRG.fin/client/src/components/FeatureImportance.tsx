import React from "react";
import { Card } from "./ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

interface FeatureImportanceProps {
  model: Model;
}

const FeatureImportance: React.FC<FeatureImportanceProps> = ({ model }) => {
  // Generate mock feature importance scores
  const data = model.features.map((feature) => ({
    name: feature,
    importance: Math.random() * 0.5 + 0.3 // Random score between 0.3 and 0.8
  })).sort((a, b) => b.importance - a.importance);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Feature Importance Analysis</h3>
        <div className="text-sm text-muted-foreground">
          Top {model.features.length} Features
        </div>
      </div>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 1]} />
            <YAxis dataKey="name" type="category" />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border rounded p-2 shadow-lg">
                      <p className="text-sm font-medium">{data.name}</p>
                      <p className="text-sm">
                        Importance: {(data.importance * 100).toFixed(1)}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="importance"
              fill="#2563eb"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-2">Most Important Feature</h4>
          <div className="text-lg font-semibold">{data[0].name}</div>
          <div className="text-sm text-muted-foreground">
            {(data[0].importance * 100).toFixed(1)}% importance
          </div>
        </Card>
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-2">Feature Count</h4>
          <div className="text-lg font-semibold">{model.features.length}</div>
          <div className="text-sm text-muted-foreground">
            Active features
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FeatureImportance; 