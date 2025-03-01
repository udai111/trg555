import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, LineChart } from 'lucide-react';

interface Strategy {
  id: string;
  name: string;
  description: string;
}

interface StrategySelectorProps {
  strategies: Strategy[];
  selectedStrategy: Strategy;
  onStrategySelect: (strategy: Strategy) => void;
}

const StrategySelector: React.FC<StrategySelectorProps> = ({
  strategies,
  selectedStrategy,
  onStrategySelect,
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-primary" />
          <CardTitle>Trading Strategies</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {strategies.map((strategy) => (
          <Button
            key={strategy.id}
            variant={selectedStrategy.id === strategy.id ? "default" : "outline"}
            className="w-full justify-start"
            onClick={() => onStrategySelect(strategy)}
          >
            <LineChart className="w-4 h-4 mr-2" />
            <div className="flex flex-col items-start text-left">
              <span>{strategy.name}</span>
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                {strategy.description}
              </span>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default StrategySelector; 