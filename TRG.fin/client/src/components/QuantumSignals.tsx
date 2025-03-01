import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ArrowUpRight, ArrowDownRight, Activity, Brain } from 'lucide-react';

interface QuantumSignalsProps {
  symbol: string;
  strategy: {
    name: string;
    description: string;
    parameters: {
      entanglement: number;
      superposition: number;
      interference: number;
    };
  };
}

interface Signal {
  type: 'buy' | 'sell' | 'hold';
  strength: number;
  probability: number;
  timeframe: string;
  quantum_state: string;
}

const QuantumSignals: React.FC<QuantumSignalsProps> = ({ symbol, strategy }) => {
  // Generate mock signals based on strategy parameters
  const generateSignals = (): Signal[] => {
    const signals: Signal[] = [];
    const timeframes = ['5m', '15m', '1h', '4h'];
    const states = ['Entangled', 'Superposed', 'Coherent', 'Decoherent'];
    
    timeframes.forEach(timeframe => {
      const random = Math.random();
      signals.push({
        type: random > 0.6 ? 'buy' : random > 0.3 ? 'sell' : 'hold',
        strength: Math.random() * 100,
        probability: Math.random() * 0.5 + 0.5,
        timeframe,
        quantum_state: states[Math.floor(Math.random() * states.length)]
      });
    });
    
    return signals;
  };

  const signals = generateSignals();

  const getSignalColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'text-green-500';
      case 'sell':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium">Quantum Signal Analysis</h3>
        </div>
        <Badge variant="outline" className="text-primary">
          {symbol}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {signals.map((signal, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline">{signal.timeframe}</Badge>
              <Badge 
                variant="outline" 
                className={getSignalColor(signal.type)}
              >
                {signal.type.toUpperCase()}
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Signal Strength</span>
                  <span className="text-sm font-medium">
                    {signal.strength.toFixed(1)}%
                  </span>
                </div>
                <Progress value={signal.strength} className="h-1" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Probability</span>
                  <span className="text-sm font-medium">
                    {(signal.probability * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress value={signal.probability * 100} className="h-1" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <span className="text-sm">Quantum State</span>
                </div>
                <Badge variant="secondary">
                  {signal.quantum_state}
                </Badge>
              </div>

              <div className="flex items-center space-x-1">
                {signal.type === 'buy' ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                ) : signal.type === 'sell' ? (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                ) : (
                  <Activity className="w-4 h-4 text-yellow-500" />
                )}
                <span className="text-sm text-muted-foreground">
                  {signal.type === 'buy' 
                    ? 'Bullish quantum pattern detected'
                    : signal.type === 'sell'
                    ? 'Bearish quantum pattern detected'
                    : 'Neutral quantum state'}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuantumSignals; 