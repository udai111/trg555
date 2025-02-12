import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Share2, Save, Play, BarChart2, Brain, Workflow } from "lucide-react";

interface BacktestResult {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  returns: number;
  score: number;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  strategyName: string;
  returns: number;
  score: number;
  trades: number;
}

const StrategyBuilder = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("builder");
  const [strategyName, setStrategyName] = useState("");
  const [timeframe, setTimeframe] = useState("1h");
  const [indicators, setIndicators] = useState<string[]>([]);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    {
      rank: 1,
      username: "trading_master",
      strategyName: "Golden Cross Pro",
      returns: 156.7,
      score: 98.5,
      trades: 234
    },
    {
      rank: 2,
      username: "algo_trader",
      strategyName: "RSI Reversal Elite",
      returns: 134.2,
      score: 95.8,
      trades: 189
    }
  ]);

  const [conditions, setConditions] = useState([
    { indicator: "", operator: "", value: "" }
  ]);

  const indicators_list = [
    "RSI", "MACD", "Moving Average", "Bollinger Bands", 
    "Stochastic", "ATR", "OBV", "Ichimoku Cloud"
  ];

  const operators = ["crosses above", "crosses below", "is greater than", "is less than"];

  const addCondition = () => {
    setConditions([...conditions, { indicator: "", operator: "", value: "" }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const runBacktest = async () => {
    // Simulated backtest results
    const result: BacktestResult = {
      totalTrades: 156,
      winRate: 68.5,
      profitFactor: 2.1,
      sharpeRatio: 1.8,
      maxDrawdown: 12.3,
      returns: 89.4,
      score: 87.6
    };

    setBacktestResult(result);
    toast({
      title: "Backtest Completed",
      description: "Strategy performance analysis is ready",
      variant: "default"
    });
  };

  const saveStrategy = () => {
    toast({
      title: "Strategy Saved",
      description: "Your strategy has been saved and added to the leaderboard",
      variant: "default"
    });
  };

  const shareStrategy = () => {
    toast({
      title: "Strategy Shared",
      description: "Strategy link copied to clipboard",
      variant: "default"
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Strategy Builder & Backtester</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Workflow className="w-4 h-4" />
            Strategy Builder
          </TabsTrigger>
          <TabsTrigger value="backtest" className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4" />
            Backtest Results
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Global Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <Label>Strategy Name</Label>
                  <Input
                    value={strategyName}
                    onChange={(e) => setStrategyName(e.target.value)}
                    placeholder="Enter strategy name"
                  />
                </div>

                <div>
                  <Label>Timeframe</Label>
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      {["1m", "5m", "15m", "1h", "4h", "1d"].map((tf) => (
                        <SelectItem key={tf} value={tf}>
                          {tf}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>Entry Conditions</Label>
                  {conditions.map((condition, index) => (
                    <div key={index} className="flex gap-4">
                      <Select
                        value={condition.indicator}
                        onValueChange={(value) => {
                          const newConditions = [...conditions];
                          newConditions[index].indicator = value;
                          setConditions(newConditions);
                        }}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select indicator" />
                        </SelectTrigger>
                        <SelectContent>
                          {indicators_list.map((ind) => (
                            <SelectItem key={ind} value={ind}>
                              {ind}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={condition.operator}
                        onValueChange={(value) => {
                          const newConditions = [...conditions];
                          newConditions[index].operator = value;
                          setConditions(newConditions);
                        }}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select operator" />
                        </SelectTrigger>
                        <SelectContent>
                          {operators.map((op) => (
                            <SelectItem key={op} value={op}>
                              {op}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        type="number"
                        value={condition.value}
                        onChange={(e) => {
                          const newConditions = [...conditions];
                          newConditions[index].value = e.target.value;
                          setConditions(newConditions);
                        }}
                        placeholder="Value"
                        className="w-[150px]"
                      />

                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeCondition(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}

                  <Button onClick={addCondition} variant="outline">
                    Add Condition
                  </Button>
                </div>

                <div className="flex gap-4">
                  <Button onClick={runBacktest} className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Run Backtest
                  </Button>
                  <Button onClick={saveStrategy} variant="outline" className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Strategy
                  </Button>
                  <Button onClick={shareStrategy} variant="outline" className="flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backtest">
          <Card>
            <CardContent className="p-6">
              {backtestResult ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Total Trades</Label>
                    <div className="text-2xl font-bold">{backtestResult.totalTrades}</div>
                  </div>
                  <div className="space-y-2">
                    <Label>Win Rate</Label>
                    <div className="text-2xl font-bold text-green-500">
                      {backtestResult.winRate}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Returns</Label>
                    <div className="text-2xl font-bold text-green-500">
                      {backtestResult.returns}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Profit Factor</Label>
                    <div className="text-2xl font-bold">{backtestResult.profitFactor}</div>
                  </div>
                  <div className="space-y-2">
                    <Label>Sharpe Ratio</Label>
                    <div className="text-2xl font-bold">{backtestResult.sharpeRatio}</div>
                  </div>
                  <div className="space-y-2">
                    <Label>Max Drawdown</Label>
                    <div className="text-2xl font-bold text-red-500">
                      {backtestResult.maxDrawdown}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Strategy Score</Label>
                    <div className="text-2xl font-bold text-primary">
                      {backtestResult.score}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  Run a backtest to see the results
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Rank</th>
                      <th className="text-left py-2">User</th>
                      <th className="text-left py-2">Strategy</th>
                      <th className="text-left py-2">Returns</th>
                      <th className="text-left py-2">Score</th>
                      <th className="text-left py-2">Trades</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry) => (
                      <tr key={entry.rank} className="border-b">
                        <td className="py-2">#{entry.rank}</td>
                        <td className="py-2">{entry.username}</td>
                        <td className="py-2">{entry.strategyName}</td>
                        <td className="py-2 text-green-500">+{entry.returns}%</td>
                        <td className="py-2">{entry.score}</td>
                        <td className="py-2">{entry.trades}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StrategyBuilder;
