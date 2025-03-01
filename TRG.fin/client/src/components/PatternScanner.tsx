import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  CandlestickChart, 
  TrendingUp, 
  TrendingDown, 
  Search,
  AlertCircle
} from 'lucide-react';

interface Pattern {
  name: string;
  type: "bullish" | "bearish" | "neutral";
  reliability: number;
  description: string;
  occurrence: string;
}

interface PatternScannerProps {
  patterns: Pattern[];
  isScanning: boolean;
}

const PatternScanner: React.FC<PatternScannerProps> = ({
  patterns,
  isScanning
}) => {
  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'bullish':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'bearish':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getPatternColor = (type: string) => {
    switch (type) {
      case 'bullish':
        return 'text-green-500';
      case 'bearish':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  if (isScanning) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <CandlestickChart className="w-8 h-8 mb-2 animate-pulse" />
        <p>Scanning for patterns...</p>
      </div>
    );
  }

  if (patterns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Search className="w-8 h-8 mb-2" />
        <p>No patterns detected in current timeframe</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {patterns.map((pattern, index) => (
        <Card key={index} className="p-4 hover:bg-accent/50 cursor-pointer transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {getPatternIcon(pattern.type)}
              <h3 className="font-medium">{pattern.name}</h3>
            </div>
            <Badge variant="outline" className={getPatternColor(pattern.type)}>
              {pattern.type.charAt(0).toUpperCase() + pattern.type.slice(1)}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mb-3">
            {pattern.description}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Reliability</span>
                <span className="text-sm font-medium">
                  {(pattern.reliability * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={pattern.reliability * 100} className="h-1" />
            </div>
            <div>
              <p className="text-sm font-medium">Occurrence</p>
              <p className="text-sm text-muted-foreground">
                {pattern.occurrence}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PatternScanner; 