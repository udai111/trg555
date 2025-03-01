import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, BarChart, TrendingUp, Percent } from 'lucide-react';
import { Portfolio } from '@/types/trading';

interface PortfolioAnalyticsProps {
  portfolio: Portfolio;
}

export function PortfolioAnalytics({ portfolio }: PortfolioAnalyticsProps) {
  const calculateMetrics = () => {
    const metrics = {
      totalValue: portfolio.cash + portfolio.equity,
      totalProfit: portfolio.totalPnL,
      profitPercentage: portfolio.totalPnL > 0 ? (portfolio.totalPnL / (portfolio.equity - portfolio.totalPnL)) * 100 : 0,
      sectorAllocation: {} as Record<string, number>,
      bestPerforming: { symbol: '', profit: 0 },
      worstPerforming: { symbol: '', profit: 0 }
    };

    // Calculate sector allocation and find best/worst performing positions
    if (portfolio.positions && portfolio.positions.length > 0) {
      portfolio.positions.forEach(position => {
        const profit = position.pnl || 0;
        
        // Track best and worst performing
        if (profit > metrics.bestPerforming.profit) {
          metrics.bestPerforming = { symbol: position.symbol, profit };
        }
        if (metrics.worstPerforming.profit === 0 || profit < metrics.worstPerforming.profit) {
          metrics.worstPerforming = { symbol: position.symbol, profit };
        }

        // Sector allocation (simplified - using position type as sector)
        const sector = position.type;
        const positionValue = position.size * position.entry;
        metrics.sectorAllocation[sector] = (metrics.sectorAllocation[sector] || 0) + positionValue;
      });
    }

    return metrics;
  };

  const metrics = calculateMetrics();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="w-5 h-5" />
          Portfolio Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Total Value</div>
            <div className="text-2xl font-bold">
              ₹{metrics.totalValue.toFixed(2)}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Total P/L</div>
            <div className={`text-2xl font-bold ${
              metrics.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {metrics.totalProfit >= 0 ? '+' : ''}₹{metrics.totalProfit.toFixed(2)}
              <span className="text-sm ml-1">
                ({metrics.profitPercentage.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Position Allocation</h3>
          <div className="space-y-2">
            {Object.entries(metrics.sectorAllocation).map(([sector, value]) => (
              <div key={sector} className="flex items-center justify-between">
                <span className="text-sm">{sector}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-accent rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${(value / metrics.totalValue) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-sm">
                    {((value / metrics.totalValue) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {(metrics.bestPerforming.symbol || metrics.worstPerforming.symbol) && (
          <div className="mt-6 space-y-4">
            {metrics.bestPerforming.symbol && (
              <div>
                <h3 className="text-sm font-medium mb-2">Best Performing</h3>
                <div className="p-2 rounded-lg bg-green-500/10">
                  <div className="font-medium">{metrics.bestPerforming.symbol}</div>
                  <div className="text-sm text-green-500">
                    +₹{metrics.bestPerforming.profit.toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            {metrics.worstPerforming.symbol && (
              <div>
                <h3 className="text-sm font-medium mb-2">Worst Performing</h3>
                <div className="p-2 rounded-lg bg-red-500/10">
                  <div className="font-medium">{metrics.worstPerforming.symbol}</div>
                  <div className="text-sm text-red-500">
                    ₹{metrics.worstPerforming.profit.toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 