import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown, Brain } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface PredictionResult {
  shortTerm: {
    prediction: number;
    confidence: number;
    method: string;
  };
  mediumTerm: {
    prediction: number;
    confidence: number;
    method: string;
  };
  longTerm: {
    prediction: number;
    confidence: number;
    method: string;
  };
  marketSentiment: number;
  technicalIndicators: {
    rsi: number;
    macd: number;
    movingAverage: number;
  };
}

const MLPrediction = () => {
  const [selectedStock, setSelectedStock] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<PredictionResult | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  // Mock stocks data
  const stocks = [
    { value: "RELIANCE", label: "Reliance Industries" },
    { value: "TCS", label: "Tata Consultancy Services" },
    { value: "HDFC", label: "HDFC Bank" },
    { value: "INFY", label: "Infosys" },
    { value: "ICICI", label: "ICICI Bank" }
  ];

  // Simulate fetching predictions
  const fetchPredictions = async (symbol: string) => {
    setIsLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock historical data for chart
    const mockHistoricalData = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      price: 1000 + Math.random() * 200,
      predicted: 1000 + Math.random() * 200
    }));
    setHistoricalData(mockHistoricalData);

    // Mock prediction results
    const mockPredictions: PredictionResult = {
      shortTerm: {
        prediction: 5.2,
        confidence: 0.85,
        method: "LSTM + CNN Ensemble"
      },
      mediumTerm: {
        prediction: 12.5,
        confidence: 0.75,
        method: "XGBoost + ARIMA"
      },
      longTerm: {
        prediction: 18.7,
        confidence: 0.65,
        method: "Deep Learning Ensemble"
      },
      marketSentiment: 0.72,
      technicalIndicators: {
        rsi: 62,
        macd: 1.2,
        movingAverage: 1450.75
      }
    };

    setPredictions(mockPredictions);
    setIsLoading(false);
  };

  const PredictionCard = ({ title, data }: { title: string; data: { prediction: number; confidence: number; method: string } }) => (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {data.prediction > 0 ? (
          <TrendingUp className="w-6 h-6 text-green-500" />
        ) : (
          <TrendingDown className="w-6 h-6 text-red-500" />
        )}
      </div>
      <div className="space-y-2">
        <p className={`text-3xl font-bold ${data.prediction > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {data.prediction > 0 ? '+' : ''}{data.prediction}%
        </p>
        <div className="text-sm text-muted-foreground">
          <p>Confidence: {(data.confidence * 100).toFixed(1)}%</p>
          <p>Method: {data.method}</p>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">ML-Powered Market Predictions</h1>
          <p className="text-muted-foreground">Advanced predictions using LSTM, CNN, and ensemble models</p>
        </div>
        <Select value={selectedStock} onValueChange={(value) => {
          setSelectedStock(value);
          fetchPredictions(value);
        }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select stock" />
          </SelectTrigger>
          <SelectContent>
            {stocks.map((stock) => (
              <SelectItem key={stock.value} value={stock.value}>
                {stock.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : predictions ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PredictionCard title="Short Term (1 Week)" data={predictions.shortTerm} />
            <PredictionCard title="Medium Term (1 Month)" data={predictions.mediumTerm} />
            <PredictionCard title="Long Term (3 Months)" data={predictions.longTerm} />
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Price Prediction Analysis</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                    name="Actual Price"
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="hsl(var(--primary))"
                    strokeDasharray="5 5"
                    fill="none"
                    name="Predicted"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Market Sentiment Analysis</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Bearish</span>
                    <span>Neutral</span>
                    <span>Bullish</span>
                  </div>
                  <div className="h-4 bg-background rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${predictions.marketSentiment * 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Current Sentiment: {(predictions.marketSentiment * 100).toFixed(1)}% Bullish
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Technical Indicators</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">RSI</span>
                  <span className={`font-mono ${
                    predictions.technicalIndicators.rsi > 70 ? 'text-red-500' :
                    predictions.technicalIndicators.rsi < 30 ? 'text-green-500' :
                    'text-muted-foreground'
                  }`}>
                    {predictions.technicalIndicators.rsi.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">MACD</span>
                  <span className={`font-mono ${
                    predictions.technicalIndicators.macd > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {predictions.technicalIndicators.macd.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Moving Average (20-day)</span>
                  <span className="font-mono">
                    ₹{predictions.technicalIndicators.movingAverage.toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Select a stock to view predictions</h3>
          <p className="text-sm text-muted-foreground">
            Our ML models will analyze market data and provide detailed predictions
          </p>
        </div>
      )}
    </div>
  );
};

export default MLPrediction;