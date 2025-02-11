import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const BacktestPanel = () => {
  const [strategy, setStrategy] = useState("sma-crossover");
  const [results, setResults] = useState<{ profit: number; drawdown: number } | null>(null);

  const runBacktest = () => {
    // Simulate backtest calculation
    const profit = Math.random() * 30 - 10;
    const drawdown = Math.random() * 15 + 5;
    setResults({ profit, drawdown });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Backtest Strategy</h2>
      
      <Card className="p-6">
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <div className="flex-1 min-w-[200px]">
            <Select value={strategy} onValueChange={setStrategy}>
              <SelectTrigger>
                <SelectValue placeholder="Select strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sma-crossover">SMA Crossover</SelectItem>
                <SelectItem value="rsi-contrarian">RSI Contrarian</SelectItem>
                <SelectItem value="bollinger">Bollinger Bands</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={runBacktest}>Run Backtest</Button>
        </div>

        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Profit/Loss</h3>
                <p className={`text-2xl font-bold ${results.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {results.profit.toFixed(2)}%
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Max Drawdown</h3>
                <p className="text-2xl font-bold text-red-500">
                  {results.drawdown.toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${results.profit >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(0, results.profit + 50))}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              <h4 className="font-medium mb-2">Strategy Details</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Period: Last 12 months</li>
                <li>Trade frequency: Daily</li>
                <li>Commission: 0.1% per trade</li>
              </ul>
            </div>
          </motion.div>
        )}
      </Card>
    </div>
  );
};

export default BacktestPanel;
