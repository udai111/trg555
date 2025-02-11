import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Mock data for equity curve
const mockEquityData = [
  { time: 'Start', value: 10000 },
  { time: 'Trade 1', value: 10200 },
  { time: 'Trade 2', value: 9800 },
  { time: 'Trade 3', value: 10500 },
  { time: 'End', value: 11000 }
];

const BacktestPanel = () => {
  // State for form values
  const [dataSource, setDataSource] = useState("");
  const [timeframe, setTimeframe] = useState("1d");
  const [adjustSplits, setAdjustSplits] = useState(true);
  const [adjustDividends, setAdjustDividends] = useState(true);
  const [positionSizing, setPositionSizing] = useState("fixed");
  const [stopLoss, setStopLoss] = useState(5);
  const [takeProfit, setTakeProfit] = useState(10);
  const [leverage, setLeverage] = useState("2x");
  const [useATR, setUseATR] = useState(false);
  const [slippage, setSlippage] = useState(0.01);
  const [commission, setCommission] = useState(5);
  const [orderType, setOrderType] = useState("market");
  const [latency, setLatency] = useState(100);

  // State for performance metrics
  const [metrics, setMetrics] = useState({
    totalReturn: "--",
    annualReturn: "--",
    sharpeRatio: "--",
    sortinoRatio: "--",
    maxDrawdown: "--",
    recoveryPeriod: "--",
    winRate: "--",
    avgHolding: "--",
    numTrades: "--"
  });

  const runBacktest = () => {
    // Simulate backtest results
    setMetrics({
      totalReturn: "10%",
      annualReturn: "8%",
      sharpeRatio: "1.2",
      sortinoRatio: "1.5",
      maxDrawdown: "5%",
      recoveryPeriod: "2 weeks",
      winRate: "60%",
      avgHolding: "3 days",
      numTrades: "10"
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Advanced Backtesting Platform</h1>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {/* Historical Data Integration */}
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-lg font-semibold">
            Historical Data Integration
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <div className="space-y-4">
              <div>
                <Label>Data Source URL / File</Label>
                <Input
                  value={dataSource}
                  onChange={(e) => setDataSource(e.target.value)}
                  placeholder="Enter data source or file path"
                />
              </div>

              <div>
                <Label>Choose Timeframe</Label>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1 Minute</SelectItem>
                    <SelectItem value="1h">1 Hour</SelectItem>
                    <SelectItem value="1d">Daily</SelectItem>
                    <SelectItem value="1w">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="adjustSplits"
                    checked={adjustSplits}
                    onCheckedChange={setAdjustSplits}
                  />
                  <Label htmlFor="adjustSplits">Adjust for Splits</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="adjustDividends"
                    checked={adjustDividends}
                    onCheckedChange={setAdjustDividends}
                  />
                  <Label htmlFor="adjustDividends">Adjust for Dividends</Label>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Risk Management */}
        <AccordionItem value="item-2">
          <AccordionTrigger className="text-lg font-semibold">
            Risk Management
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <div className="space-y-4">
              <div>
                <Label>Position Sizing</Label>
                <RadioGroup value={positionSizing} onValueChange={setPositionSizing}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label htmlFor="fixed">Fixed Dollar Amount</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percent" id="percent" />
                    <Label htmlFor="percent">Percentage of Capital</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Stop-Loss (%)</Label>
                  <Input
                    type="number"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Take-Profit (%)</Label>
                  <Input
                    type="number"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label>Leverage</Label>
                <Input
                  value={leverage}
                  onChange={(e) => setLeverage(e.target.value)}
                  placeholder="e.g. 2x"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useATR"
                  checked={useATR}
                  onCheckedChange={setUseATR}
                />
                <Label htmlFor="useATR">Use ATR-based sizing</Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Execution Simulation */}
        <AccordionItem value="item-3">
          <AccordionTrigger className="text-lg font-semibold">
            Execution Simulation
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Slippage (% or cents)</Label>
                <Input
                  type="number"
                  value={slippage}
                  onChange={(e) => setSlippage(Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Commission ($)</Label>
                <Input
                  type="number"
                  value={commission}
                  onChange={(e) => setCommission(Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <Label>Order Type</Label>
              <Select value={orderType} onValueChange={setOrderType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select order type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market Order</SelectItem>
                  <SelectItem value="limit">Limit Order</SelectItem>
                  <SelectItem value="stopLimit">Stop-Limit Order</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Latency (ms)</Label>
              <Input
                type="number"
                value={latency}
                onChange={(e) => setLatency(Number(e.target.value))}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Performance Metrics */}
        <AccordionItem value="item-4">
          <AccordionTrigger className="text-lg font-semibold">
            Performance Metrics
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <Card className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Total Return</Label>
                  <div className="text-2xl font-bold">{metrics.totalReturn}</div>
                </div>
                <div>
                  <Label>Annual Return</Label>
                  <div className="text-2xl font-bold">{metrics.annualReturn}</div>
                </div>
                <div>
                  <Label>Sharpe Ratio</Label>
                  <div className="text-2xl font-bold">{metrics.sharpeRatio}</div>
                </div>
                <div>
                  <Label>Sortino Ratio</Label>
                  <div className="text-2xl font-bold">{metrics.sortinoRatio}</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <Label className="mb-4 block">Equity Curve</Label>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockEquityData}>
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Max Drawdown</Label>
                  <div className="text-xl font-semibold text-red-500">
                    {metrics.maxDrawdown}
                  </div>
                </div>
                <div>
                  <Label>Recovery Period</Label>
                  <div className="text-xl font-semibold">
                    {metrics.recoveryPeriod}
                  </div>
                </div>
                <div>
                  <Label>Win Rate</Label>
                  <div className="text-xl font-semibold text-green-500">
                    {metrics.winRate}
                  </div>
                </div>
                <div>
                  <Label>Number of Trades</Label>
                  <div className="text-xl font-semibold">
                    {metrics.numTrades}
                  </div>
                </div>
              </div>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-6 flex justify-center space-x-4">
        <Button size="lg" onClick={runBacktest}>
          Run Backtest
        </Button>
        <Button size="lg" variant="destructive" onClick={() => window.location.reload()}>
          Reset All
        </Button>
      </div>
    </div>
  );
};

export default BacktestPanel;