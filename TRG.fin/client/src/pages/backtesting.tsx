import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  BarChart2,
  Brain,
  Calendar,
  ChartBar,
  Clock,
  Cog,
  LineChart,
  Play,
  Settings,
  Sliders
} from "lucide-react";
import BacktestChart from "@/components/BacktestChart";
import StrategyOptimizer from "@/components/StrategyOptimizer";
import PerformanceMetrics from "@/components/PerformanceMetrics";
import TradeAnalysis from "@/components/TradeAnalysis";
import StrategyForm from "@/components/StrategyForm";
import StrategyInfo from "@/components/StrategyInfo";
import StrategySelector from "@/components/StrategySelector";
import { Label } from "@/components/ui/label";

interface Strategy {
  id: string;
  name: string;
  description: string;
  parameters: {
    [key: string]: {
      value: number;
      min: number;
      max: number;
      step: number;
    };
  };
  performance?: {
    returns: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
  };
}

const strategies: Strategy[] = [
  {
    id: "ma-cross",
    name: "Moving Average Crossover",
    description: "Trade when fast MA crosses slow MA",
    parameters: {
      fastPeriod: { value: 10, min: 5, max: 50, step: 1 },
      slowPeriod: { value: 20, min: 10, max: 100, step: 1 },
      stopLoss: { value: 2, min: 0.5, max: 5, step: 0.1 }
    }
  },
  {
    id: "rsi-mean",
    name: "RSI Mean Reversion",
    description: "Trade based on RSI oversold/overbought levels",
    parameters: {
      rsiPeriod: { value: 14, min: 7, max: 28, step: 1 },
      oversold: { value: 30, min: 20, max: 40, step: 1 },
      overbought: { value: 70, min: 60, max: 80, step: 1 }
    }
  },
  {
    id: "bb-trend",
    name: "Bollinger Bands Trend",
    description: "Trade breakouts from Bollinger Bands",
    parameters: {
      period: { value: 20, min: 10, max: 50, step: 1 },
      deviation: { value: 2, min: 1, max: 3, step: 0.1 },
      momentum: { value: 0.5, min: 0, max: 1, step: 0.1 }
    }
  }
];

export default function Backtesting() {
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy>(strategies[0]);
  const [parameters, setParameters] = useState(selectedStrategy.parameters);
  const [timeframe, setTimeframe] = useState("1d");
  const [startDate, setStartDate] = useState("2023-01-01");
  const [endDate, setEndDate] = useState("2024-02-27");
  const [isRunning, setIsRunning] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const runBacktest = () => {
    setIsRunning(true);
    // Simulate backtesting
    setTimeout(() => {
      setSelectedStrategy(prev => ({
        ...prev,
        performance: {
          returns: Math.random() * 50 + 10,
          sharpeRatio: Math.random() * 2 + 1,
          maxDrawdown: Math.random() * 20 + 5,
          winRate: Math.random() * 30 + 50
        }
      }));
      setIsRunning(false);
    }, 2000);
  };

  const optimizeStrategy = () => {
    setIsOptimizing(true);
    // Simulate optimization
    setTimeout(() => {
      setParameters(prev => ({
        ...prev,
        ...Object.keys(prev).reduce((acc, key) => ({
          ...acc,
          [key]: {
            ...prev[key],
            value: prev[key].min + Math.random() * (prev[key].max - prev[key].min)
          }
        }), {})
      }));
      setIsOptimizing(false);
    }, 3000);
  };

  return (
    <div className="p-4 h-screen bg-background">
      <div className="grid grid-cols-12 gap-4 h-full">
        {/* Left Sidebar - Strategy Selection and Configuration */}
        <div className="col-span-2 space-y-4">
          <StrategySelector
            strategies={strategies}
            selectedStrategy={selectedStrategy}
            onStrategySelect={(strategy) => {
              setSelectedStrategy(strategy);
              setParameters(strategy.parameters);
            }}
          />

          <StrategyForm
            parameters={parameters}
            onParameterChange={(name, value) => {
              setParameters(prev => ({
                ...prev,
                [name]: { ...prev[name], value }
              }));
            }}
            onSubmit={runBacktest}
            isLoading={isRunning}
          />

          <Card className="p-4">
            <h3 className="text-sm font-medium mb-3">Backtest Settings</h3>
            <div className="space-y-4">
              <div>
                <Label>Timeframe</Label>
                <Select
                  value={timeframe}
                  onValueChange={setTimeframe}
                >
                  {["1h", "4h", "1d", "1w"].map((tf) => (
                    <option key={tf} value={tf}>{tf}</option>
                  ))}
                </Select>
              </div>

              <div>
                <Label>Date Range</Label>
                <div className="space-y-2 mt-1.5">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Backtest View */}
        <div className="col-span-7 space-y-4">
          {/* Backtest Chart */}
          <Card className="p-4 h-[60%]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Backtest Results</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedStrategy.description}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={optimizeStrategy}
                  disabled={isOptimizing}
                >
                  <Cog className={`w-4 h-4 mr-2 ${isOptimizing ? "animate-spin" : ""}`} />
                  Optimize
                </Button>
                <Button
                  size="sm"
                  onClick={runBacktest}
                  disabled={isRunning}
                >
                  {isRunning ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Backtest
                    </>
                  )}
                </Button>
              </div>
            </div>
            <BacktestChart
              strategy={selectedStrategy}
              parameters={parameters}
              isRunning={isRunning}
            />
          </Card>

          {/* Analysis Tabs */}
          <Card className="p-4 h-[38%]">
            <Tabs defaultValue="performance">
              <TabsList>
                <TabsTrigger value="performance">
                  <Activity className="w-4 h-4 mr-2" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="optimization">
                  <Sliders className="w-4 h-4 mr-2" />
                  Optimization
                </TabsTrigger>
                <TabsTrigger value="trades">
                  <BarChart2 className="w-4 h-4 mr-2" />
                  Trade Analysis
                </TabsTrigger>
              </TabsList>
              <TabsContent value="performance">
                <PerformanceMetrics
                  performance={selectedStrategy.performance}
                />
              </TabsContent>
              <TabsContent value="optimization">
                <StrategyOptimizer
                  onOptimize={optimizeStrategy}
                />
              </TabsContent>
              <TabsContent value="trades">
                <TradeAnalysis />
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Sidebar - Strategy Info */}
        <Card className="col-span-3 p-4">
          <StrategyInfo
            strategy={selectedStrategy}
            isRunning={isRunning}
          />
        </Card>
      </div>
    </div>
  );
} 