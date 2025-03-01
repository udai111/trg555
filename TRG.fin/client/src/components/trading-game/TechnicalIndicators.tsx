import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, LineChart } from 'lucide-react';

interface Indicator {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  parameters: {
    period?: number;
    multiplier?: number;
    source?: string;
  };
}

interface TechnicalIndicatorsProps {
  onIndicatorChange?: (indicators: Indicator[]) => void;
}

export function TechnicalIndicators({ onIndicatorChange = () => {} }: TechnicalIndicatorsProps) {
  const [indicators, setIndicators] = useState<Indicator[]>([
    {
      id: 'rsi',
      name: 'RSI',
      type: 'oscillator',
      enabled: false,
      parameters: { period: 14 }
    },
    {
      id: 'macd',
      name: 'MACD',
      type: 'oscillator',
      enabled: false,
      parameters: { period: 26 }
    },
    {
      id: 'sma',
      name: 'Simple MA',
      type: 'overlay',
      enabled: false,
      parameters: { period: 20 }
    },
    {
      id: 'ema',
      name: 'Exponential MA',
      type: 'overlay',
      enabled: false,
      parameters: { period: 20 }
    },
    {
      id: 'bb',
      name: 'Bollinger Bands',
      type: 'overlay',
      enabled: false,
      parameters: { period: 20, multiplier: 2 }
    },
    {
      id: 'stoch',
      name: 'Stochastic',
      type: 'oscillator',
      enabled: false,
      parameters: { period: 14 }
    }
  ]);

  const handleToggle = (id: string) => {
    const newIndicators = indicators.map(ind => 
      ind.id === id ? { ...ind, enabled: !ind.enabled } : ind
    );
    setIndicators(newIndicators);
    onIndicatorChange(newIndicators);
  };

  const handleParameterChange = (id: string, param: string, value: number) => {
    const newIndicators = indicators.map(ind => 
      ind.id === id ? {
        ...ind,
        parameters: { ...ind.parameters, [param]: value }
      } : ind
    );
    setIndicators(newIndicators);
    onIndicatorChange(newIndicators);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="w-5 h-5" />
          Technical Indicators
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Overlay Indicators</h3>
            <div className="space-y-4">
              {indicators.filter(ind => ind.type === 'overlay').map(indicator => (
                <div key={indicator.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={indicator.id}>{indicator.name}</Label>
                    <Switch
                      id={indicator.id}
                      checked={indicator.enabled}
                      onCheckedChange={() => handleToggle(indicator.id)}
                    />
                  </div>
                  {indicator.enabled && (
                    <div className="grid grid-cols-2 gap-2">
                      {indicator.parameters.period !== undefined && (
                        <div>
                          <Label className="text-xs">Period</Label>
                          <Input
                            type="number"
                            value={indicator.parameters.period}
                            onChange={(e) => handleParameterChange(
                              indicator.id,
                              'period',
                              parseInt(e.target.value)
                            )}
                            className="h-8"
                          />
                        </div>
                      )}
                      {indicator.parameters.multiplier !== undefined && (
                        <div>
                          <Label className="text-xs">Multiplier</Label>
                          <Input
                            type="number"
                            value={indicator.parameters.multiplier}
                            onChange={(e) => handleParameterChange(
                              indicator.id,
                              'multiplier',
                              parseInt(e.target.value)
                            )}
                            className="h-8"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Oscillators</h3>
            <div className="space-y-4">
              {indicators.filter(ind => ind.type === 'oscillator').map(indicator => (
                <div key={indicator.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={indicator.id}>{indicator.name}</Label>
                    <Switch
                      id={indicator.id}
                      checked={indicator.enabled}
                      onCheckedChange={() => handleToggle(indicator.id)}
                    />
                  </div>
                  {indicator.enabled && indicator.parameters.period !== undefined && (
                    <div>
                      <Label className="text-xs">Period</Label>
                      <Input
                        type="number"
                        value={indicator.parameters.period}
                        onChange={(e) => handleParameterChange(
                          indicator.id,
                          'period',
                          parseInt(e.target.value)
                        )}
                        className="h-8"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 