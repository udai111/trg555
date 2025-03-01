import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart2,
  Brush,
  CandlestickChart,
  ChartBar,
  Clock,
  Copy,
  Download,
  Eye,
  Grid,
  Layout,
  LineChart,
  Pencil,
  Save,
  Settings,
  Share2,
  Sliders
} from "lucide-react";
import TradingViewChart from "@/components/TradingViewChart";
import IndicatorPanel from "@/components/IndicatorPanel";
import DrawingTools from "@/components/DrawingTools";

interface ChartLayout {
  id: string;
  name: string;
  indicators: string[];
  timeframe: string;
}

const chartLayouts: ChartLayout[] = [
  {
    id: "default",
    name: "Default Layout",
    indicators: ["MA", "Volume"],
    timeframe: "1D"
  },
  {
    id: "trend",
    name: "Trend Following",
    indicators: ["EMA", "MACD", "RSI"],
    timeframe: "4H"
  },
  {
    id: "scalping",
    name: "Scalping Setup",
    indicators: ["Bollinger Bands", "Stochastic", "Volume"],
    timeframe: "5m"
  }
];

const indicators = [
  "Moving Average",
  "Bollinger Bands",
  "RSI",
  "MACD",
  "Stochastic",
  "Volume",
  "OBV",
  "ATR",
  "Ichimoku Cloud",
  "Fibonacci"
];

export default function Charts() {
  const [activeSymbol, setActiveSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState("1h");
  const [selectedLayout, setSelectedLayout] = useState<ChartLayout>(chartLayouts[0]);
  const [activeIndicators, setActiveIndicators] = useState<string[]>(selectedLayout.indicators);
  const [chartType, setChartType] = useState<"candlestick" | "line" | "bar">("candlestick");
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  const toggleIndicator = (indicator: string) => {
    setActiveIndicators(prev =>
      prev.includes(indicator)
        ? prev.filter(i => i !== indicator)
        : [...prev, indicator]
    );
  };

  const saveLayout = () => {
    // Implement layout saving logic
  };

  const shareChart = () => {
    // Implement chart sharing logic
  };

  return (
    <div className="p-4 h-screen bg-background">
      <div className="grid grid-cols-12 gap-4 h-full">
        {/* Left Sidebar - Market Selection */}
        <Card className="col-span-2 p-4">
          <div className="flex items-center space-x-2 mb-4">
            <CandlestickChart className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Markets</h2>
          </div>
          <div className="space-y-4">
            <Input
              placeholder="Search markets..."
              className="mb-2"
            />
            <div className="space-y-2">
              {["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"].map((symbol) => (
                <Button
                  key={symbol}
                  variant={activeSymbol === symbol ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setActiveSymbol(symbol)}
                >
                  <LineChart className="w-4 h-4 mr-2" />
                  {symbol}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Timeframe</h3>
            <Select
              value={timeframe}
              onValueChange={setTimeframe}
            >
              {["1m", "5m", "15m", "1h", "4h", "1d", "1w"].map((tf) => (
                <option key={tf} value={tf}>{tf}</option>
              ))}
            </Select>
          </div>
        </Card>

        {/* Main Chart View */}
        <div className="col-span-8 space-y-4">
          {/* Chart Controls */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="space-x-2">
                  <Button
                    size="sm"
                    variant={chartType === "candlestick" ? "default" : "outline"}
                    onClick={() => setChartType("candlestick")}
                  >
                    <CandlestickChart className="w-4 h-4 mr-2" />
                    Candlestick
                  </Button>
                  <Button
                    size="sm"
                    variant={chartType === "line" ? "default" : "outline"}
                    onClick={() => setChartType("line")}
                  >
                    <LineChart className="w-4 h-4 mr-2" />
                    Line
                  </Button>
                  <Button
                    size="sm"
                    variant={chartType === "bar" ? "default" : "outline"}
                    onClick={() => setChartType("bar")}
                  >
                    <BarChart2 className="w-4 h-4 mr-2" />
                    Bar
                  </Button>
                </div>

                <div className="h-6 w-px bg-border" />

                <Select
                  value={selectedLayout.id}
                  onValueChange={(id) => setSelectedLayout(
                    chartLayouts.find(l => l.id === id) || chartLayouts[0]
                  )}
                >
                  {chartLayouts.map((layout) => (
                    <option key={layout.id} value={layout.id}>
                      {layout.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsDrawingMode(!isDrawingMode)}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Draw
                </Button>
                <Button size="sm" variant="outline" onClick={saveLayout}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={shareChart}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </Card>

          {/* Chart */}
          <Card className="p-4 h-[calc(100%-8rem)]">
            <TradingViewChart
              symbol={activeSymbol}
              timeframe={timeframe}
              chartType={chartType}
              indicators={activeIndicators}
              isDrawingMode={isDrawingMode}
            />
          </Card>
        </div>

        {/* Right Sidebar - Tools */}
        <Card className="col-span-2 p-4">
          <Tabs defaultValue="indicators">
            <TabsList className="w-full">
              <TabsTrigger value="indicators" className="flex-1">
                <Sliders className="w-4 h-4 mr-2" />
                Indicators
              </TabsTrigger>
              <TabsTrigger value="drawing" className="flex-1">
                <Brush className="w-4 h-4 mr-2" />
                Drawing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="indicators">
              <IndicatorPanel
                indicators={indicators}
                activeIndicators={activeIndicators}
                onToggle={toggleIndicator}
              />
            </TabsContent>

            <TabsContent value="drawing">
              <DrawingTools
                isActive={isDrawingMode}
                onToolSelect={(tool) => {
                  setIsDrawingMode(true);
                  // Implement tool selection logic
                }}
              />
            </TabsContent>
          </Tabs>

          <div className="mt-6 space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Chart Settings</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Grid className="w-4 h-4 mr-2" />
                  Grid Lines
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="w-4 h-4 mr-2" />
                  Show Volume
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Layout className="w-4 h-4 mr-2" />
                  Auto Scale
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Chart
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="w-4 h-4 mr-2" />
                  Price Alerts
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 