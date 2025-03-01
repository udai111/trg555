import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Network,
  RefreshCw,
  Search,
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from 'lucide-react';

interface CorrelationData {
  symbol1: string;
  symbol2: string;
  correlation: number;
  strength: 'strong' | 'moderate' | 'weak';
  trend: 'increasing' | 'decreasing' | 'stable';
  timeframe: string;
}

const CorrelationMatrix: React.FC = () => {
  const [symbols, setSymbols] = useState<string[]>(['SPY', 'QQQ', 'AAPL', 'MSFT', 'GOOGL']);
  const [newSymbol, setNewSymbol] = useState('');
  const [timeframe, setTimeframe] = useState('1M');
  const [loading, setLoading] = useState(true);
  const [correlations, setCorrelations] = useState<CorrelationData[]>([]);
  const [threshold, setThreshold] = useState([0.5]); // Correlation threshold
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    calculateCorrelations();
  }, [symbols, timeframe]);

  const calculateCorrelations = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate mock correlation data
      const mockCorrelations: CorrelationData[] = [];
      for (let i = 0; i < symbols.length; i++) {
        for (let j = i + 1; j < symbols.length; j++) {
          const correlation = Math.random() * 2 - 1; // Random correlation between -1 and 1
          mockCorrelations.push({
            symbol1: symbols[i],
            symbol2: symbols[j],
            correlation,
            strength: getCorrelationStrength(correlation),
            trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as 'increasing' | 'decreasing' | 'stable',
            timeframe
          });
        }
      }

      setCorrelations(mockCorrelations);
    } catch (error) {
      console.error('Error calculating correlations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCorrelationStrength = (correlation: number): 'strong' | 'moderate' | 'weak' => {
    const abs = Math.abs(correlation);
    if (abs >= 0.7) return 'strong';
    if (abs >= 0.3) return 'moderate';
    return 'weak';
  };

  const getCorrelationColor = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (correlation > 0) {
      if (abs >= 0.7) return 'bg-green-500';
      if (abs >= 0.3) return 'bg-green-400';
      return 'bg-green-300';
    } else {
      if (abs >= 0.7) return 'bg-red-500';
      if (abs >= 0.3) return 'bg-red-400';
      return 'bg-red-300';
    }
  };

  const addSymbol = () => {
    if (newSymbol && !symbols.includes(newSymbol)) {
      setSymbols([...symbols, newSymbol.toUpperCase()]);
      setNewSymbol('');
    }
  };

  const removeSymbol = (symbol: string) => {
    setSymbols(symbols.filter(s => s !== symbol));
  };

  const filteredCorrelations = correlations.filter(corr => 
    Math.abs(corr.correlation) >= threshold[0] &&
    (searchQuery === '' || 
      corr.symbol1.toLowerCase().includes(searchQuery.toLowerCase()) ||
      corr.symbol2.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderCorrelationMatrix = () => {
    return (
      <div className="grid grid-cols-1 gap-4">
        {filteredCorrelations.map((corr, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${getCorrelationColor(corr.correlation)} bg-opacity-10`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">
                    {corr.symbol1}
                  </Badge>
                  <span>×</span>
                  <Badge variant="outline" className="font-mono">
                    {corr.symbol2}
                  </Badge>
                </div>
                <Badge
                  variant={
                    corr.strength === 'strong' ? 'default' :
                    corr.strength === 'moderate' ? 'secondary' :
                    'outline'
                  }
                >
                  {corr.strength}
                </Badge>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold font-mono">
                  {corr.correlation >= 0 ? '+' : ''}{corr.correlation.toFixed(2)}
                </div>
                <div className="flex items-center gap-1 text-sm">
                  {corr.trend === 'increasing' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : corr.trend === 'decreasing' ? (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  ) : (
                    <span className="w-4 h-4">→</span>
                  )}
                  <span className="text-muted-foreground">
                    {corr.trend === 'increasing' ? 'Strengthening' :
                     corr.trend === 'decreasing' ? 'Weakening' :
                     'Stable'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5" />
            Correlation Matrix
          </CardTitle>
          <div className="flex items-center gap-4">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1D">1 Day</SelectItem>
                <SelectItem value="1W">1 Week</SelectItem>
                <SelectItem value="1M">1 Month</SelectItem>
                <SelectItem value="3M">3 Months</SelectItem>
                <SelectItem value="1Y">1 Year</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={calculateCorrelations}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-4">Symbols</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {symbols.map(symbol => (
                <Badge
                  key={symbol}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {symbol}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => removeSymbol(symbol)}
                  />
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add symbol..."
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && addSymbol()}
              />
              <Button onClick={addSymbol}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          <div className="flex items-center gap-6">
            <div className="flex-1">
              <Label>Correlation Threshold</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={threshold}
                  onValueChange={setThreshold}
                  min={0}
                  max={1}
                  step={0.1}
                  className="flex-1"
                />
                <span className="w-12 text-right">±{threshold[0]}</span>
              </div>
            </div>

            <div className="w-[200px]">
              <Label>Search</Label>
              <Input
                placeholder="Filter pairs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredCorrelations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2" />
              <p>No correlations found matching your criteria</p>
            </div>
          ) : (
            renderCorrelationMatrix()
          )}

          <Card className="p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Understanding Correlations</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Correlation ranges from -1 to +1. A value of +1 indicates perfect positive correlation,
                  -1 indicates perfect negative correlation, and 0 indicates no correlation.
                  Remember that correlation does not imply causation.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default CorrelationMatrix; 