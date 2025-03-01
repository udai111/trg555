import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, TrendingUp, TrendingDown, AlertTriangle, Activity } from 'lucide-react';

interface Strategy {
  id: string;
  name: string;
  description: string;
  performance?: {
    returns: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
  };
}

interface StrategyInfoProps {
  strategy: Strategy;
  isRunning: boolean;
}

const StrategyInfo: React.FC<StrategyInfoProps> = ({ strategy, isRunning }) => {
  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatNumber = (value: number) => {
    return value.toFixed(2);
  };

  const getStatusBadge = () => {
    if (isRunning) {
      return <Badge variant="secondary">Running</Badge>;
    }
    if (strategy.performance) {
      return <Badge variant="default">Backtested</Badge>;
    }
    return <Badge variant="outline">Not Run</Badge>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Strategy Details</CardTitle>
        {getStatusBadge()}
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-2">Description</h3>
          <p className="text-sm text-muted-foreground">
            {strategy.description}
          </p>
        </div>

        {strategy.performance && (
          <>
            <div>
              <h3 className="text-sm font-medium mb-3">Key Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Returns</span>
                  </div>
                  <div className="text-lg font-bold text-green-500">
                    {formatPercent(strategy.performance.returns)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-muted-foreground">Sharpe</span>
                  </div>
                  <div className="text-lg font-bold text-blue-500">
                    {formatNumber(strategy.performance.sharpeRatio)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-muted-foreground">Drawdown</span>
                  </div>
                  <div className="text-lg font-bold text-red-500">
                    {formatPercent(strategy.performance.maxDrawdown)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Win Rate</span>
                  </div>
                  <div className="text-lg font-bold text-primary">
                    {formatPercent(strategy.performance.winRate)}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Risk Analysis</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Risk/Reward Ratio</span>
                  <span className="font-medium">
                    {(Math.abs(strategy.performance.returns / strategy.performance.maxDrawdown)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Recovery Factor</span>
                  <span className="font-medium">
                    {(strategy.performance.returns / Math.abs(strategy.performance.maxDrawdown)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Profit Factor</span>
                  <span className="font-medium">
                    {(1 + strategy.performance.winRate / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {!strategy.performance && !isRunning && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="w-4 h-4" />
            <span>Run a backtest to see strategy performance metrics</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StrategyInfo; 