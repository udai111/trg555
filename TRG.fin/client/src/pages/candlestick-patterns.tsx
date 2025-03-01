import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Brain, ChevronRight, Eye, LineChart, Search, Star, TrendingUp, Zap } from "lucide-react";
import CandlestickChart from "@/components/CandlestickChart";
import PatternScanner from "@/components/PatternScanner";
import AIAnalysis from "@/components/AIAnalysis";

interface Pattern {
  name: string;
  type: "bullish" | "bearish" | "neutral";
  reliability: number;
  description: string;
  occurrence: string;
}

const patterns: Pattern[] = [
  {
    name: "Hammer",
    type: "bullish",
    reliability: 0.85,
    description: "A single candlestick pattern with a long lower shadow and small body",
    occurrence: "End of downtrend"
  },
  {
    name: "Shooting Star",
    type: "bearish",
    reliability: 0.82,
    description: "A single candlestick pattern with a long upper shadow and small body",
    occurrence: "End of uptrend"
  },
  {
    name: "Engulfing",
    type: "bullish",
    reliability: 0.88,
    description: "Two-candlestick pattern where second candle completely engulfs first",
    occurrence: "Trend reversal"
  },
  {
    name: "Evening Star",
    type: "bearish",
    reliability: 0.87,
    description: "Three-candlestick pattern signaling a potential top",
    occurrence: "End of uptrend"
  }
];

export default function CandlestickPatterns() {
  const [activeSymbol, setActiveSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState("1h");
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedPatterns, setDetectedPatterns] = useState<Pattern[]>([]);

  const scanPatterns = () => {
    setIsScanning(true);
    // Simulate AI pattern detection
    setTimeout(() => {
      setDetectedPatterns(
        patterns.filter(() => Math.random() > 0.5)
      );
      setIsScanning(false);
    }, 1500);
  };

  useEffect(() => {
    scanPatterns();
  }, [activeSymbol, timeframe]);

  return (
    <div className="p-4 h-screen bg-background">
      <div className="grid grid-cols-12 gap-4 h-full">
        {/* Left Sidebar - Pattern Library */}
        <Card className="col-span-2 p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Search className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Pattern Library</h2>
          </div>
          <div className="space-y-2">
            {patterns.map((pattern) => (
              <Button
                key={pattern.name}
                variant={selectedPattern?.name === pattern.name ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setSelectedPattern(pattern)}
              >
                <Star className="w-4 h-4 mr-2" />
                {pattern.name}
              </Button>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Timeframe</h3>
            <Select
              value={timeframe}
              onValueChange={setTimeframe}
            >
              {["1m", "5m", "15m", "1h", "4h", "1d"].map((tf) => (
                <option key={tf} value={tf}>{tf}</option>
              ))}
            </Select>
          </div>
        </Card>

        {/* Main Chart View */}
        <div className="col-span-7 space-y-4">
          {/* Chart */}
          <Card className="p-4 h-[60%]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Pattern Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedPattern ? selectedPattern.name : "Select a pattern"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={scanPatterns}
                disabled={isScanning}
              >
                <Brain className={`w-4 h-4 mr-2 ${isScanning ? "animate-pulse" : ""}`} />
                Scan Patterns
              </Button>
            </div>
            <CandlestickChart
              data={[
                { time: Date.now() - 86400000 * 5, open: 42000, high: 43000, low: 41500, close: 42500 },
                { time: Date.now() - 86400000 * 4, open: 42500, high: 43200, low: 42200, close: 43000 },
                { time: Date.now() - 86400000 * 3, open: 43000, high: 43500, low: 42800, close: 43200 },
                { time: Date.now() - 86400000 * 2, open: 43200, high: 44000, low: 43000, close: 43800 },
                { time: Date.now() - 86400000, open: 43800, high: 44500, low: 43500, close: 44200 },
                { time: Date.now(), open: 44200, high: 45000, low: 44000, close: 44800 }
              ]}
              onPatternDetected={(pattern) => console.log(`Pattern detected: ${pattern}`)}
              height={400}
            />
          </Card>

          {/* Pattern Analysis */}
          <Card className="p-4 h-[38%]">
            <Tabs defaultValue="scanner">
              <TabsList>
                <TabsTrigger value="scanner">
                  <Eye className="w-4 h-4 mr-2" />
                  Pattern Scanner
                </TabsTrigger>
                <TabsTrigger value="ai">
                  <Brain className="w-4 h-4 mr-2" />
                  AI Analysis
                </TabsTrigger>
                <TabsTrigger value="alerts">
                  <Zap className="w-4 h-4 mr-2" />
                  Pattern Alerts
                </TabsTrigger>
              </TabsList>
              <TabsContent value="scanner">
                <PatternScanner
                  patterns={detectedPatterns}
                  isScanning={isScanning}
                />
              </TabsContent>
              <TabsContent value="ai">
                <AIAnalysis
                  symbol={activeSymbol}
                  timeframe={timeframe}
                  pattern={selectedPattern}
                />
              </TabsContent>
              <TabsContent value="alerts">
                <div className="grid grid-cols-2 gap-4">
                  {detectedPatterns.map((pattern, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={pattern.type === "bullish" ? "default" : "destructive"}>
                          {pattern.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {pattern.occurrence}
                        </span>
                      </div>
                      <h4 className="font-medium">{pattern.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {pattern.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm">Reliability</span>
                        <span className="text-sm font-bold">
                          {(pattern.reliability * 100).toFixed(0)}%
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Sidebar - Pattern Details */}
        <Card className="col-span-3 p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Pattern Details</h2>
            <LineChart className="w-5 h-5 text-primary" />
          </div>

          {selectedPattern ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Pattern Type</h3>
                <Badge variant={selectedPattern.type === "bullish" ? "default" : "destructive"}>
                  {selectedPattern.type.charAt(0).toUpperCase() + selectedPattern.type.slice(1)}
                </Badge>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedPattern.description}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Typical Occurrence</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedPattern.occurrence}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Reliability Score</h3>
                <div className="text-3xl font-bold text-primary">
                  {(selectedPattern.reliability * 100).toFixed(0)}%
                </div>
              </div>

              <Button className="w-full">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trade This Pattern
              </Button>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <LineChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Select a pattern to view details</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
