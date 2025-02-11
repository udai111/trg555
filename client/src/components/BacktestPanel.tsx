import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Loader2, TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
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
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Mock strategies
const strategies = [
  {
    id: "sma-crossover",
    name: "SMA Crossover",
    description: "Buy when short-term SMA crosses above long-term SMA",
    example: "Example: Buy when 20-day SMA crosses above 50-day SMA",
    performance: "+15% annual return historically"
  },
  {
    id: "rsi-oversold",
    name: "RSI Oversold Bounce",
    description: "Buy when RSI indicates oversold conditions",
    example: "Example: Buy when RSI(14) goes below 30",
    performance: "+12% annual return historically"
  },
  {
    id: "momentum",
    name: "Momentum Strategy",
    description: "Buy stocks showing strong upward momentum",
    example: "Example: Buy when price > 20-day high",
    performance: "+18% annual return historically"
  }
];

// Popular symbols
const popularSymbols = [
  { value: "RELIANCE", label: "Reliance Industries" },
  { value: "TCS", label: "Tata Consultancy Services" },
  { value: "INFY", label: "Infosys" },
  { value: "HDFCBANK", label: "HDFC Bank" },
  { value: "ITC", label: "ITC Limited" }
];

// Mock equity curve data with projection
const generateEquityData = (initialAmount) => {
  let amount = initialAmount;
  const data = [];
  for (let month = 0; month <= 12; month++) {
    const isProjected = month > 6;
    amount *= (1 + (Math.random() * 0.08 - 0.02));
    data.push({
      month: `Month ${month}`,
      value: Math.round(amount),
      isProjected
    });
  }
  return data;
};

const LoadingStep = ({ step, currentStep, text }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex items-center space-x-2 ${currentStep >= step ? 'text-primary' : 'text-muted-foreground'}`}
  >
    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
      currentStep > step ? 'bg-primary text-white' :
        currentStep === step ? 'border-2 border-primary' :
          'border-2 border-muted'
    }`}>
      {currentStep > step ? '✓' : step + 1}
    </div>
    <span>{text}</span>
  </motion.div>
);

// Adding new interfaces and mock data
interface StrategyComparison {
  name: string;
  winRate: number;
  avgReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

const strategyComparisons: StrategyComparison[] = [
  {
    name: "SMA Crossover",
    winRate: 65,
    avgReturn: 15,
    maxDrawdown: 12,
    sharpeRatio: 1.8
  },
  {
    name: "RSI Oversold",
    winRate: 58,
    avgReturn: 12,
    maxDrawdown: 15,
    sharpeRatio: 1.5
  },
  {
    name: "Momentum",
    winRate: 72,
    avgReturn: 18,
    maxDrawdown: 20,
    sharpeRatio: 2.1
  }
];

const BacktestPanel = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [startDate, setStartDate] = useState(new Date(2024, 0, 1));
  const [endDate, setEndDate] = useState(new Date());
  const [initialInvestment, setInitialInvestment] = useState(1000);
  const [selectedStrategy, setSelectedStrategy] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState("");
  const [equityData, setEquityData] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high">("medium");
  const [marketSentiment, setMarketSentiment] = useState<number>(65); // 0-100 scale

  const simulateDataDownload = async () => {
    setIsLoading(true);
    setLoadingStep(0);
    setProgress(0);

    // Step 1: Connecting to data source
    setDownloadStatus("Connecting to data source...");
    await new Promise(r => setTimeout(r, 500));
    setLoadingStep(1);
    setProgress(25);

    // Step 2: Fetching historical data
    setDownloadStatus(`Fetching historical data for ${selectedSymbol}...`);
    for (let i = 25; i <= 60; i += 10) {
      setProgress(i);
      await new Promise(r => setTimeout(r, 100));
    }
    setLoadingStep(2);

    // Step 3: Processing and validating
    setDownloadStatus("Processing and validating data...");
    for (let i = 60; i <= 90; i += 10) {
      setProgress(i);
      await new Promise(r => setTimeout(r, 75));
    }
    setLoadingStep(3);

    // Step 4: Finalizing
    setDownloadStatus("Generating backtest results...");
    for (let i = 90; i <= 100; i += 5) {
      setProgress(i);
      await new Promise(r => setTimeout(r, 50));
    }
    setLoadingStep(4);

    await new Promise(r => setTimeout(r, 200));
    setEquityData(generateEquityData(initialInvestment));
    setIsLoading(false);
    setShowResults(true);
    setDownloadStatus("Backtest completed successfully!");
  };

  const formatDate = (date) => {
    return format(date, "PPP");
  };

  // Calculate potential returns based on investment and risk level
  const calculatePotentialReturns = (amount: number, risk: string) => {
    const riskMultipliers = {
      low: { min: 0.05, max: 0.12 },
      medium: { min: 0.10, max: 0.25 },
      high: { min: 0.20, max: 0.40 }
    };
    const multiplier = riskMultipliers[risk as keyof typeof riskMultipliers];
    return {
      conservative: amount * (1 + multiplier.min),
      aggressive: amount * (1 + multiplier.max)
    };
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Strategy Backtester</h1>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <Card className="p-6 w-[400px]">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-center">{downloadStatus}</h3>
                  <Progress value={progress} className="w-full" />
                </div>

                <div className="space-y-4">
                  <LoadingStep step={0} currentStep={loadingStep} text="Connecting to data source" />
                  <LoadingStep step={1} currentStep={loadingStep} text="Fetching historical data" />
                  <LoadingStep step={2} currentStep={loadingStep} text="Processing and validating" />
                  <LoadingStep step={3} currentStep={loadingStep} text="Calculating returns" />
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Symbol Selection */}
        <Card className="p-4">
          <Label className="text-lg font-semibold mb-4 block">Select Trading Symbol</Label>
          <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a stock" />
            </SelectTrigger>
            <SelectContent>
              {popularSymbols.map(symbol => (
                <SelectItem key={symbol.value} value={symbol.value}>
                  {symbol.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {/* Date Range */}
        <Card className="p-4">
          <Label className="text-lg font-semibold mb-4 block">Select Date Range</Label>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {formatDate(startDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {formatDate(endDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </Card>
      </div>

      {/* Strategy Selection */}
      <Card className="p-6 mb-6">
        <Label className="text-lg font-semibold mb-4 block">Choose Strategy</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {strategies.map((strategy) => (
            <motion.div
              key={strategy.id}
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-lg border cursor-pointer ${
                selectedStrategy === strategy.id ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => setSelectedStrategy(strategy.id)}
            >
              <h3 className="font-semibold mb-2">{strategy.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{strategy.description}</p>
              <p className="text-xs text-muted-foreground">{strategy.example}</p>
              <p className="text-sm font-medium text-green-500 mt-2">{strategy.performance}</p>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Investment Amount */}
      <Card className="p-6 mb-6">
        <Label className="text-lg font-semibold mb-4 block">Investment Amount</Label>
        <div className="flex items-center space-x-4">
          <Input
            type="number"
            value={initialInvestment}
            onChange={(e) => setInitialInvestment(Number(e.target.value))}
            className="text-lg"
          />
          <span className="text-lg font-semibold">₹</span>
        </div>
      </Card>

      {/* New Market Sentiment Section */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Market Sentiment</h2>
          <div className="text-lg font-bold">
            {marketSentiment}% Bullish
          </div>
        </div>
        <div className="relative h-4 bg-background rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
            style={{ width: `${marketSentiment}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${marketSentiment}%` }}
            transition={{ duration: 1 }}
          />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Current market sentiment is {marketSentiment < 30 ? 'Bearish' : marketSentiment > 70 ? 'Bullish' : 'Neutral'}
        </p>
      </Card>

      {/* Strategy Comparison Section */}
      <Card className="p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Strategy Comparison</h2>
          <Button
            variant="outline"
            onClick={() => setShowComparison(!showComparison)}
          >
            {showComparison ? 'Hide Details' : 'Show Details'}
          </Button>
        </div>

        <AnimatePresence>
          {showComparison && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              {strategyComparisons.map((strategy) => (
                <div key={strategy.name} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{strategy.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      strategy.winRate > 65 ? 'bg-green-500/20 text-green-700' :
                        strategy.winRate > 55 ? 'bg-yellow-500/20 text-yellow-700' :
                          'bg-red-500/20 text-red-700'
                    }`}>
                      {strategy.winRate}% Win Rate
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Avg Return</p>
                      <p className="font-semibold text-green-500">+{strategy.avgReturn}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Max Drawdown</p>
                      <p className="font-semibold text-red-500">-{strategy.maxDrawdown}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sharpe Ratio</p>
                      <p className="font-semibold">{strategy.sharpeRatio}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Risk Profile & Potential Returns */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Risk Profile & Potential Returns</h2>
        <div className="space-y-4">
          <div>
            <Label>Select Risk Level</Label>
            <Select value={riskLevel} onValueChange={(value: "low" | "medium" | "high") => setRiskLevel(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose risk level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Conservative (Lower risk)</SelectItem>
                <SelectItem value="medium">Balanced (Moderate risk)</SelectItem>
                <SelectItem value="high">Aggressive (Higher risk)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {initialInvestment > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-accent/5 rounded-lg"
            >
              <h3 className="font-semibold mb-2">Potential Returns (1 Year)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Conservative Estimate</p>
                  <p className="text-xl font-bold text-green-500">
                    ₹{Math.round(calculatePotentialReturns(initialInvestment, riskLevel).conservative).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Aggressive Estimate</p>
                  <p className="text-xl font-bold text-green-500">
                    ₹{Math.round(calculatePotentialReturns(initialInvestment, riskLevel).aggressive).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                *These are hypothetical scenarios based on historical data. Past performance doesn't guarantee future returns.
              </p>
            </motion.div>
          )}
        </div>
      </Card>

      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Backtest Results</h2>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div>
                <Label>Initial Investment</Label>
                <div className="text-2xl font-bold">₹{initialInvestment}</div>
              </div>
              <div>
                <Label>Final Value</Label>
                <div className="text-2xl font-bold text-green-500">
                  ₹{Math.round(equityData[equityData.length - 1]?.value || 0)}
                </div>
              </div>
              <div>
                <Label>Return %</Label>
                <div className="text-2xl font-bold text-green-500">
                  +{Math.round(((equityData[equityData.length - 1]?.value || 0) / initialInvestment - 1) * 100)}%
                </div>
              </div>
              <div>
                <Label>Time Period</Label>
                <div className="text-2xl font-bold">{equityData.length} months</div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="flex justify-center space-x-4">
        <Button
          size="lg"
          onClick={simulateDataDownload}
          disabled={isLoading || !selectedSymbol || !selectedStrategy}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Run Backtest'
          )}
        </Button>
        <Button
          size="lg"
          variant="destructive"
          onClick={() => {
            setShowResults(false);
            setEquityData([]);
            setSelectedSymbol("");
            setSelectedStrategy("");
            setInitialInvestment(1000);
          }}
          disabled={isLoading}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default BacktestPanel;