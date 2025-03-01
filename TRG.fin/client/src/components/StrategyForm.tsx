import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

interface Parameter {
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
}

interface StrategyFormProps {
  parameters: { [key: string]: Parameter };
  onParameterChange: (name: string, value: number) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

const StrategyForm: React.FC<StrategyFormProps> = ({
  parameters,
  onParameterChange,
  onSubmit,
  isLoading = false
}) => {
  const formatParamName = (name: string) => {
    return name
      .split(/(?=[A-Z])|_/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategy Parameters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(parameters).map(([name, param]) => (
          <div key={name} className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor={name}>{formatParamName(name)}</Label>
              <span className="text-sm text-muted-foreground">
                {param.value}
              </span>
            </div>
            <div className="flex gap-4">
              <Slider
                id={name}
                min={param.min}
                max={param.max}
                step={param.step}
                value={[param.value]}
                onValueChange={(value) => onParameterChange(name, value[0])}
                className="flex-1"
              />
              <Input
                type="number"
                value={param.value}
                onChange={(e) => onParameterChange(name, Number(e.target.value))}
                min={param.min}
                max={param.max}
                step={param.step}
                className="w-20"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{param.min}</span>
              <span>{param.max}</span>
            </div>
          </div>
        ))}
        
        <Button
          onClick={onSubmit}
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Updating...' : 'Apply Parameters'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default StrategyForm; 