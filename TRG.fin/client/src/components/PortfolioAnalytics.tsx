import { Card } from "@/components/ui/card";
import { NSEStockData } from "@/types/nse";

export interface PortfolioAnalyticsProps {
  stockData: NSEStockData | null;
}

export const PortfolioAnalytics = ({ stockData }: PortfolioAnalyticsProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Portfolio Analytics</h3>
      <div className="space-y-4">
        {stockData && (
          <>
            <div className="flex justify-between items-center">
              <span>Portfolio Weight</span>
              <span className="font-mono">{stockData.portfolioMetrics.weight.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Contribution to Return</span>
              <span className={`font-mono ${
                stockData.portfolioMetrics.contribution > 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {stockData.portfolioMetrics.contribution > 0 ? '+' : ''}
                {stockData.portfolioMetrics.contribution.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Diversification Score</span>
              <span className="font-mono">{stockData.portfolioMetrics.diversificationScore.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Risk Contribution</span>
              <span className="font-mono">{stockData.portfolioMetrics.riskContribution.toFixed(2)}%</span>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}; 