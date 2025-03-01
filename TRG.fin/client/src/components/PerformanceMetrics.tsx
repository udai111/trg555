import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, DollarSign, Percent, Activity, Clock, AlertTriangle } from 'lucide-react';

interface PerformanceMetricsProps {
  metrics?: {
    totalReturn: number;
    annualizedReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    profitFactor: number;
    totalTrades: number;
    averageTrade: number;
    averageHoldingPeriod: string;
  };
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ metrics }) => {
  // Sample metrics if none provided
  const defaultMetrics = {
    totalReturn: 35.8,
    annualizedReturn: 28.4,
    sharpeRatio: 1.85,
    maxDrawdown: -12.5,
    winRate: 65.2,
    profitFactor: 2.3,
    totalTrades: 124,
    averageTrade: 0.29,
    averageHoldingPeriod: '3.5 days'
  };

  const data = metrics || defaultMetrics;

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatNumber = (value: number, decimals = 2) => {
    return value.toFixed(decimals);
  };

  const MetricCard = ({ title, value, icon: Icon, trend = 'neutral', suffix = '' }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">
              {value}
              {suffix}
            </h3>
          </div>
          <div className={`p-2 rounded-full ${
            trend === 'up' ? 'bg-green-100 text-green-600' :
            trend === 'down' ? 'bg-red-100 text-red-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Return"
          value={formatPercent(data.totalReturn)}
          icon={data.totalReturn >= 0 ? ArrowUpRight : ArrowDownRight}
          trend={data.totalReturn >= 0 ? 'up' : 'down'}
        />
        
        <MetricCard
          title="Annualized Return"
          value={formatPercent(data.annualizedReturn)}
          icon={data.annualizedReturn >= 0 ? TrendingUp : TrendingDown}
          trend={data.annualizedReturn >= 0 ? 'up' : 'down'}
        />
        
        <MetricCard
          title="Sharpe Ratio"
          value={formatNumber(data.sharpeRatio)}
          icon={Activity}
          trend={data.sharpeRatio >= 1 ? 'up' : 'down'}
        />
        
        <MetricCard
          title="Maximum Drawdown"
          value={formatPercent(data.maxDrawdown)}
          icon={AlertTriangle}
          trend="down"
        />
        
        <MetricCard
          title="Win Rate"
          value={formatPercent(data.winRate)}
          icon={Percent}
          trend={data.winRate >= 50 ? 'up' : 'down'}
        />
        
        <MetricCard
          title="Profit Factor"
          value={formatNumber(data.profitFactor)}
          icon={DollarSign}
          trend={data.profitFactor >= 1 ? 'up' : 'down'}
        />
        
        <MetricCard
          title="Total Trades"
          value={data.totalTrades.toString()}
          icon={Activity}
        />
        
        <MetricCard
          title="Average Trade"
          value={formatPercent(data.averageTrade)}
          icon={DollarSign}
          trend={data.averageTrade >= 0 ? 'up' : 'down'}
        />
        
        <MetricCard
          title="Avg Holding Period"
          value={data.averageHoldingPeriod}
          icon={Clock}
        />
      </CardContent>
    </Card>
  );
};

export default PerformanceMetrics; 