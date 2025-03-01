import React from 'react';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Brain, Zap } from 'lucide-react';

interface QuantumOptimizerProps {
  strategy: {
    name: string;
    description: string;
    parameters: {
      entanglement: number;
      superposition: number;
      interference: number;
    };
  };
  parameters: {
    entanglement: number;
    superposition: number;
    interference: number;
  };
  isOptimizing: boolean;
}

const QuantumOptimizer: React.FC<QuantumOptimizerProps> = ({
  strategy,
  parameters,
  isOptimizing
}) => {
  const getOptimizationScore = () => {
    // Calculate optimization score based on parameters
    const score = (parameters.entanglement + parameters.superposition + parameters.interference) / 3;
    return Math.round(score * 100);
  };

  const getEfficiencyLevel = (score: number) => {
    if (score >= 85) return { label: 'Excellent', color: 'text-green-500' };
    if (score >= 70) return { label: 'Good', color: 'text-blue-500' };
    if (score >= 50) return { label: 'Average', color: 'text-yellow-500' };
    return { label: 'Needs Optimization', color: 'text-red-500' };
  };

  const optimizationScore = getOptimizationScore();
  const efficiency = getEfficiencyLevel(optimizationScore);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Optimization Score</h4>
            <Badge variant="outline" className={efficiency.color}>
              {efficiency.label}
            </Badge>
          </div>
          <Progress value={optimizationScore} className="h-2" />
          <p className="text-sm text-muted-foreground">
            Current optimization level: {optimizationScore}%
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Strategy Metrics</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm">Coherence</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm">Stability</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium">Parameter Analysis</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium">Entanglement</p>
            <Progress 
              value={parameters.entanglement * 100} 
              className="h-1 mt-1" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              {(parameters.entanglement * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Superposition</p>
            <Progress 
              value={parameters.superposition * 100} 
              className="h-1 mt-1" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              {(parameters.superposition * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Interference</p>
            <Progress 
              value={parameters.interference * 100} 
              className="h-1 mt-1" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              {(parameters.interference * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {isOptimizing && (
        <div className="text-sm text-muted-foreground animate-pulse">
          Optimizing quantum parameters...
        </div>
      )}
    </div>
  );
};

export default QuantumOptimizer; 