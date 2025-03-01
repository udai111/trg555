import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Trade {
  id: number;
  date: string;
  type: 'LONG' | 'SHORT';
  entry: number;
  exit: number;
  profit: number;
  profitPercent: number;
  duration: string;
}

interface TradeAnalysisProps {
  trades?: Trade[];
}

const TradeAnalysis: React.FC<TradeAnalysisProps> = ({ trades }) => {
  // Sample trades if none provided
  const defaultTrades: Trade[] = [
    {
      id: 1,
      date: '2024-02-01',
      type: 'LONG',
      entry: 100.50,
      exit: 105.75,
      profit: 525,
      profitPercent: 5.22,
      duration: '2d 4h'
    },
    {
      id: 2,
      date: '2024-02-03',
      type: 'SHORT',
      entry: 108.25,
      exit: 104.50,
      profit: 375,
      profitPercent: 3.47,
      duration: '1d 6h'
    },
    {
      id: 3,
      date: '2024-02-05',
      type: 'LONG',
      entry: 103.75,
      exit: 102.25,
      profit: -150,
      profitPercent: -1.45,
      duration: '5h'
    },
  ];

  const data = trades || defaultTrades;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Trade Statistics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Consecutive Wins</div>
                <div className="text-2xl font-bold">3</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Consecutive Losses</div>
                <div className="text-2xl font-bold">2</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Largest Win</div>
                <div className="text-2xl font-bold text-green-600">+8.45%</div>
              </CardContent>
            </Card>
          </div>

          {/* Trade List */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Entry</TableHead>
                <TableHead>Exit</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>%</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell>{trade.date}</TableCell>
                  <TableCell>
                    <Badge variant={trade.type === 'LONG' ? 'default' : 'secondary'}>
                      {trade.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(trade.entry)}</TableCell>
                  <TableCell>{formatCurrency(trade.exit)}</TableCell>
                  <TableCell className={trade.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(trade.profit)}
                  </TableCell>
                  <TableCell className={trade.profitPercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatPercent(trade.profitPercent)}
                  </TableCell>
                  <TableCell>{trade.duration}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradeAnalysis; 