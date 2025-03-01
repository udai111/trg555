import { Card } from "@/components/ui/card";
import { NSEStockData, NSEPrediction } from "@/types/nse";

export interface RiskMetricsProps {
  stockData: NSEStockData | null;
  predictions: NSEPrediction | null;
}

export const RiskMetrics = ({ stockData, predictions }: RiskMetricsProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Risk Metrics</h3>
      <div className="space-y-4">
        {stockData && predictions && (
          <>
            <div className="flex justify-between items-center">
              <span>Beta</span>
              <span className="font-mono">{predictions.riskMetrics.beta.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Volatility (30D)</span>
              <span className="font-mono">{(predictions.riskMetrics.volatility * 100).toFixed(2)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>VaR (95%)</span>
              <span className="font-mono">₹{predictions.riskMetrics.valueAtRisk.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Sharpe Ratio</span>
              <span className="font-mono">{predictions.riskMetrics.sharpeRatio.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}; 