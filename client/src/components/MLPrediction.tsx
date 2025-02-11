import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle, AlertCircle } from "lucide-react";

interface Prediction {
  nextDay: number;
  nextWeek: number;
  nextMonth: number;
}

const MLPrediction = () => {
  const [predictions, setPredictions] = useState<Prediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPredictions({
        nextDay: 0.012,
        nextWeek: -0.02,
        nextMonth: 0.05
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">ML Predictions</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">ML Predictions</h2>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <PredictionCard
          title="Next Day"
          value={predictions!.nextDay}
          description="Based on LSTM + XGBoost ensemble model"
        />
        <PredictionCard
          title="Next Week"
          value={predictions!.nextWeek}
          description="7-day forecast with confidence intervals"
        />
        <PredictionCard
          title="Next Month"
          value={predictions!.nextMonth}
          description="30-day outlook considering market trends"
        />
      </motion.div>
    </div>
  );
};

const PredictionCard = ({ title, value, description }: { title: string; value: number; description: string }) => {
  const isPositive = value >= 0;
  const Icon = isPositive ? ArrowUpCircle : ArrowDownCircle;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Icon className={`w-6 h-6 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
      </div>
      <p className={`text-3xl font-bold mb-2 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {(value * 100).toFixed(1)}%
      </p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
  );
};

export default MLPrediction;
