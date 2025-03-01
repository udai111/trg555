import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

interface MarginAccount {
  equity: number;
  maintenance: number;
  marginUsed: number;
  marginAvailable: number;
  leverage: number;
}

interface MarginAccountPanelProps {
  marginAccount?: MarginAccount;
  useMargin?: boolean;
  leverage?: number;
  onMarginToggle?: (enabled: boolean) => void;
  onLeverageChange?: (value: number) => void;
  formatCurrency?: (value: number) => string;
  formatPercent?: (value: number) => string;
  maxLeverage?: number;
}

export function MarginAccountPanel({
  marginAccount = {
    equity: 100000,
    maintenance: 0,
    marginUsed: 0,
    marginAvailable: 100000,
    leverage: 1
  },
  useMargin: initialUseMargin = false,
  leverage: initialLeverage = 1,
  onMarginToggle = () => {},
  onLeverageChange = () => {},
  formatCurrency = (value: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value),
  formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`,
  maxLeverage = 10
}: MarginAccountPanelProps) {
  const [internalUseMargin, setInternalUseMargin] = useState(initialUseMargin);
  const [internalLeverage, setInternalLeverage] = useState(initialLeverage);

  const handleMarginToggle = (enabled: boolean) => {
    setInternalUseMargin(enabled);
    onMarginToggle(enabled);
  };

  const handleLeverageChange = (value: number) => {
    setInternalLeverage(value);
    onLeverageChange(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Margin Account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Use Margin</Label>
          <Switch
            checked={internalUseMargin}
            onCheckedChange={handleMarginToggle}
          />
        </div>

        {internalUseMargin && (
          <>
            <div>
              <Label>Leverage (x{internalLeverage})</Label>
              <Slider
                value={[internalLeverage]}
                min={1}
                max={maxLeverage}
                step={1}
                onValueChange={([value]) => handleLeverageChange(value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Equity</span>
                <span>{formatCurrency(marginAccount.equity)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Margin Used</span>
                <span>{formatCurrency(marginAccount.marginUsed)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Available</span>
                <span>{formatCurrency(marginAccount.marginAvailable)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Margin Level</span>
                <span>{formatPercent((marginAccount.marginAvailable / marginAccount.equity) * 100)}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 