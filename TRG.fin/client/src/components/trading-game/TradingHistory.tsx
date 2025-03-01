import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface Trade {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  entry: number;
  size: number;
  pnl: number;
  pnlPercent: number;
  timestamp: number;
}

interface TradingHistoryProps {
  trades?: Trade[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

const formatPercent = (value: number) => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export function TradingHistory({ trades = [] }: TradingHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Trading History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {trades.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No trades yet. Start trading to see your history!
              </div>
            ) : (
              trades.map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {trade.type === 'LONG' ? (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium">
                        {trade.type} {trade.symbol}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {trade.size} @ {formatCurrency(trade.entry)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(trade.pnl)}
                    </div>
                    <div className={`text-sm ${trade.pnlPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatPercent(trade.pnlPercent)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 