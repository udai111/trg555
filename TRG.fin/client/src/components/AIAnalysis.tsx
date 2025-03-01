import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Brain, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface AIAnalysisProps {
  symbol: string;
  timeframe: string;
  pattern: {
    name: string;
    type: "bullish" | "bearish" | "neutral";
    reliability: number;
    description: string;
    occurrence: string;
  } | null;
}

interface Analysis {
  confidence: number;
  prediction: string;
  keyLevels: {
    support: number[];
    resistance: number[];
  };
  riskLevel: 'Low' | 'Medium' | 'High';
  additionalPatterns: string[];
  marketContext: string;
}

const AIAnalysis: React.FC<AIAnalysisProps> = ({
  symbol,
  timeframe,
  pattern
}) => {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setAnalysis({
        confidence: Math.random() * 30 + 70, // 70-100%
        prediction: Math.random() > 0.5 ? 'Bullish continuation likely' : 'Bearish reversal possible',
        keyLevels: {
          support: [
            Math.random() * 1000 + 9000,
            Math.random() * 1000 + 8000
          ],
          resistance: [
            Math.random() * 1000 + 11000,
            Math.random() * 1000 + 12000
          ]
        },
        riskLevel: Math.random() > 0.7 ? 'High' : Math.random() > 0.3 ? 'Medium' : 'Low',
        additionalPatterns: [
          'Volume divergence',
          'RSI oversold',
          'MACD crossover'
        ],
        marketContext: Math.random() > 0.5
          ? 'Market showing strong momentum with increasing volume'
          : 'Market consolidating with decreasing volatility'
      });
      setIsAnalyzing(false);
    }, 1500);
  }, [symbol, timeframe, pattern]);

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Brain className="w-8 h-8 mb-2 animate-pulse" />
        <p>AI analyzing market conditions...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <AlertTriangle className="w-8 h-8 mb-2" />
        <p>Unable to generate analysis</p>
      </div>
    );
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'text-green-500';
      case 'Medium':
        return 'text-yellow-500';
      case 'High':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Analysis */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-2">AI Prediction</h3>
          <div className="flex items-center space-x-2 mb-4">
            {analysis.prediction.includes('Bullish') ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm">{analysis.prediction}</span>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Confidence</span>
              <span className="text-sm font-medium">
                {analysis.confidence.toFixed(1)}%
              </span>
            </div>
            <Progress value={analysis.confidence} className="h-1" />
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium mb-2">Risk Assessment</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm">Risk Level</span>
            <Badge 
              variant="outline" 
              className={getRiskColor(analysis.riskLevel)}
            >
              {analysis.riskLevel}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {analysis.marketContext}
          </p>
        </Card>
      </div>

      {/* Key Levels */}
      <Card className="p-4">
        <h3 className="text-sm font-medium mb-4">Key Price Levels</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm text-muted-foreground mb-2">Support</h4>
            {analysis.keyLevels.support.map((level, index) => (
              <div key={index} className="flex items-center justify-between mb-1">
                <span className="text-sm">Level {index + 1}</span>
                <span className="text-sm font-medium">${level.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div>
            <h4 className="text-sm text-muted-foreground mb-2">Resistance</h4>
            {analysis.keyLevels.resistance.map((level, index) => (
              <div key={index} className="flex items-center justify-between mb-1">
                <span className="text-sm">Level {index + 1}</span>
                <span className="text-sm font-medium">${level.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Additional Patterns */}
      <Card className="p-4">
        <h3 className="text-sm font-medium mb-2">Additional Technical Signals</h3>
        <div className="flex flex-wrap gap-2">
          {analysis.additionalPatterns.map((pattern, index) => (
            <Badge key={index} variant="secondary">
              {pattern}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AIAnalysis; 