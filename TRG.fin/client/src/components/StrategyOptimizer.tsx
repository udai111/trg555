import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface StrategyOptimizerProps {
  onOptimize: (params: any) => void;
}

const StrategyOptimizer: React.FC<StrategyOptimizerProps> = ({ onOptimize }) => {
  const [optimizationParams, setOptimizationParams] = useState({
    method: 'grid',
    populationSize: 50,
    generations: 100,
    crossoverRate: 0.8,
    mutationRate: 0.2,
    useParallel: true,
    parameters: [
      { name: 'smaShort', min: 5, max: 50, step: 5 },
      { name: 'smaLong', min: 20, max: 200, step: 20 },
      { name: 'rsiPeriod', min: 7, max: 28, step: 7 },
      { name: 'rsiOverbought', min: 70, max: 85, step: 5 },
      { name: 'rsiOversold', min: 15, max: 30, step: 5 }
    ]
  });

  const handleOptimize = () => {
    onOptimize(optimizationParams);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategy Optimizer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Optimization Method</Label>
          <Select
            value={optimizationParams.method}
            onValueChange={(value) => setOptimizationParams({ ...optimizationParams, method: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Grid Search</SelectItem>
              <SelectItem value="genetic">Genetic Algorithm</SelectItem>
              <SelectItem value="bayesian">Bayesian Optimization</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {optimizationParams.method === 'genetic' && (
          <>
            <div className="space-y-2">
              <Label>Population Size</Label>
              <Input
                type="number"
                value={optimizationParams.populationSize}
                onChange={(e) => setOptimizationParams({
                  ...optimizationParams,
                  populationSize: parseInt(e.target.value)
                })}
              />
            </div>

            <div className="space-y-2">
              <Label>Number of Generations</Label>
              <Input
                type="number"
                value={optimizationParams.generations}
                onChange={(e) => setOptimizationParams({
                  ...optimizationParams,
                  generations: parseInt(e.target.value)
                })}
              />
            </div>

            <div className="space-y-2">
              <Label>Crossover Rate: {optimizationParams.crossoverRate}</Label>
              <Slider
                value={[optimizationParams.crossoverRate * 100]}
                onValueChange={(value) => setOptimizationParams({
                  ...optimizationParams,
                  crossoverRate: value[0] / 100
                })}
                max={100}
                step={5}
              />
            </div>

            <div className="space-y-2">
              <Label>Mutation Rate: {optimizationParams.mutationRate}</Label>
              <Slider
                value={[optimizationParams.mutationRate * 100]}
                onValueChange={(value) => setOptimizationParams({
                  ...optimizationParams,
                  mutationRate: value[0] / 100
                })}
                max={100}
                step={5}
              />
            </div>
          </>
        )}

        <div className="flex items-center space-x-2">
          <Switch
            checked={optimizationParams.useParallel}
            onCheckedChange={(checked) => setOptimizationParams({
              ...optimizationParams,
              useParallel: checked
            })}
          />
          <Label>Use Parallel Processing</Label>
        </div>

        <div className="space-y-4">
          <Label>Parameters to Optimize</Label>
          {optimizationParams.parameters.map((param, index) => (
            <div key={param.name} className="space-y-2">
              <Label>{param.name}</Label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={param.min}
                  onChange={(e) => {
                    const newParams = [...optimizationParams.parameters];
                    newParams[index] = { ...param, min: parseInt(e.target.value) };
                    setOptimizationParams({ ...optimizationParams, parameters: newParams });
                  }}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={param.max}
                  onChange={(e) => {
                    const newParams = [...optimizationParams.parameters];
                    newParams[index] = { ...param, max: parseInt(e.target.value) };
                    setOptimizationParams({ ...optimizationParams, parameters: newParams });
                  }}
                />
                <Input
                  type="number"
                  placeholder="Step"
                  value={param.step}
                  onChange={(e) => {
                    const newParams = [...optimizationParams.parameters];
                    newParams[index] = { ...param, step: parseInt(e.target.value) };
                    setOptimizationParams({ ...optimizationParams, parameters: newParams });
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleOptimize} className="w-full">
          Start Optimization
        </Button>
      </CardContent>
    </Card>
  );
};

export default StrategyOptimizer; 