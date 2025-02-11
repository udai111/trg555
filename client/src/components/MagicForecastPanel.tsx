import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface MagicForecastPanelProps {
  stock: {
    name: string;
    price: number;
  };
  onClose: () => void;
}

const MagicForecastPanel = ({ stock, onClose }: MagicForecastPanelProps) => {
  // Mock calculations for demonstration
  const currentPrice = stock.price;
  const forecastNextDay = currentPrice * 1.01;
  const forecastNextWeek = currentPrice * 1.03;
  const forecastNextMonth = currentPrice * 1.1;
  const forecastNextYear = currentPrice * 1.5;

  return (
    <Card className="fixed bottom-6 right-6 w-80 bg-card z-50 shadow-xl">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Forecast: {stock.name}</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Next Day:</span>
          <span className="text-sm text-green-500">₹{forecastNextDay.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium">1 Week:</span>
          <span className="text-sm text-green-500">₹{forecastNextWeek.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium">1 Month:</span>
          <span className="text-sm text-green-500">₹{forecastNextMonth.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium">1 Year:</span>
          <span className="text-sm text-green-500">₹{forecastNextYear.toFixed(2)}</span>
        </div>

        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
          <p className="mb-2">
            These forecasts are simulated for demonstration.
            Actual predictions would use ML models and historical data.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default MagicForecastPanel;
