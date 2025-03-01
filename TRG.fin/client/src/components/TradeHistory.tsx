import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';

interface Trade {
  id: string;
  type: "market" | "limit" | "stop" | "oco";
  side: "buy" | "sell";
  price: number;
  quantity: number;
  timestamp: Date;
  status: "filled" | "pending" | "cancelled";
}

interface TradeHistoryProps {
  trades: Trade[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export default function TradeHistory({ trades }: TradeHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Trade History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {trades.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No trades yet
              </div>
            ) : (
              trades.map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {trade.side === 'buy' ? (
                      <ArrowUpRight className="w-5 h-5 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium">
                        {trade.side.toUpperCase()} - {trade.type.toUpperCase()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {trade.quantity} @ {formatCurrency(trade.price)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(trade.price * trade.quantity)}
                    </div>
                    <div className={`text-sm ${
                      trade.status === 'filled' ? 'text-green-500' :
                      trade.status === 'cancelled' ? 'text-red-500' :
                      'text-yellow-500'
                    }`}>
                      {trade.status.toUpperCase()}
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