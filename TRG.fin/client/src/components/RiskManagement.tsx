import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, DollarSign, Percent, Shield, TrendingDown } from 'lucide-react';

const RiskManagement: React.FC = () => {
  // Position Sizing Calculator
  const [accountSize, setAccountSize] = useState<number>(10000);
  const [riskPercent, setRiskPercent] = useState<number>(2);
  const [entryPrice, setEntryPrice] = useState<number>(100);
  const [stopLossPrice, setStopLossPrice] = useState<number>(95);
  const [takeProfitPrice, setTakeProfitPrice] = useState<number>(110);
  const [positionSize, setPositionSize] = useState<number>(0);
  const [shares, setShares] = useState<number>(0);
  const [riskRewardRatio, setRiskRewardRatio] = useState<number>(0);
  
  // Risk Analysis
  const [portfolioRisk, setPortfolioRisk] = useState<number>(0);
  const [maxDrawdown, setMaxDrawdown] = useState<number>(0);
  const [valueAtRisk, setValueAtRisk] = useState<number>(0);
  const [correlationRisk, setCorrelationRisk] = useState<number>(0);
  
  // Risk settings
  const [maxRiskPerTrade, setMaxRiskPerTrade] = useState<number>(2);
  const [maxRiskPerDay, setMaxRiskPerDay] = useState<number>(5);
  const [maxOpenPositions, setMaxOpenPositions] = useState<number>(5);
  const [stopLossRequired, setStopLossRequired] = useState<boolean>(true);

  // Calculate position size
  const calculatePositionSize = () => {
    if (!accountSize || !riskPercent || !entryPrice || !stopLossPrice) return;
    
    const riskAmount = accountSize * (riskPercent / 100);
    const priceDifference = Math.abs(entryPrice - stopLossPrice);
    const calculatedShares = Math.floor(riskAmount / priceDifference);
    const calculatedPositionSize = calculatedShares * entryPrice;
    
    setPositionSize(calculatedPositionSize);
    setShares(calculatedShares);
    
    // Calculate risk/reward ratio
    const risk = priceDifference;
    const reward = Math.abs(takeProfitPrice - entryPrice);
    setRiskRewardRatio(reward / risk);
    
    // Update portfolio risk metrics (simulated)
    setPortfolioRisk(Math.min(calculatedPositionSize / accountSize * 100, 100));
    setMaxDrawdown(Math.min(riskAmount / accountSize * 100 * 3, 100));
    setValueAtRisk(riskAmount);
    setCorrelationRisk(Math.random() * 50 + 20); // Simulated correlation risk
  };

  // Mock portfolio positions
  const positions = [
    { symbol: 'AAPL', size: 5000, risk: 2.5, correlation: 'High' },
    { symbol: 'MSFT', size: 3000, risk: 1.8, correlation: 'High' },
    { symbol: 'GOOGL', size: 4000, risk: 2.0, correlation: 'Medium' },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Risk Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="position-sizing">
          <TabsList className="mb-4">
            <TabsTrigger value="position-sizing">Position Sizing</TabsTrigger>
            <TabsTrigger value="risk-analysis">Risk Analysis</TabsTrigger>
            <TabsTrigger value="risk-settings">Risk Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="position-sizing" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="account-size">Account Size ($)</Label>
                  <Input
                    id="account-size"
                    type="number"
                    value={accountSize}
                    onChange={(e) => setAccountSize(parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between">
                    <Label htmlFor="risk-percent">Risk Per Trade (%)</Label>
                    <span className="text-sm">{riskPercent}%</span>
                  </div>
                  <Slider
                    id="risk-percent"
                    value={[riskPercent]}
                    onValueChange={(value) => setRiskPercent(value[0])}
                    min={0.1}
                    max={5}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="entry-price">Entry Price ($)</Label>
                  <Input
                    id="entry-price"
                    type="number"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="stop-loss">Stop Loss Price ($)</Label>
                  <Input
                    id="stop-loss"
                    type="number"
                    value={stopLossPrice}
                    onChange={(e) => setStopLossPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="take-profit">Take Profit Price ($)</Label>
                  <Input
                    id="take-profit"
                    type="number"
                    value={takeProfitPrice}
                    onChange={(e) => setTakeProfitPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <Button onClick={calculatePositionSize}>Calculate Position Size</Button>
              </div>
              
              <div className="space-y-6">
                <Card className="p-4 bg-accent/10">
                  <h3 className="text-lg font-semibold mb-4">Position Size Results</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Dollar Risk</span>
                        <span className="font-medium">${(accountSize * riskPercent / 100).toFixed(2)}</span>
                      </div>
                      <Progress value={riskPercent} max={5} className="h-2" />
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Position Size</span>
                      <span className="font-semibold">${positionSize.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Shares/Contracts</span>
                      <span className="font-semibold">{shares}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Risk/Reward Ratio</span>
                      <span className={`font-semibold ${riskRewardRatio >= 2 ? 'text-green-500' : riskRewardRatio >= 1 ? 'text-yellow-500' : 'text-red-500'}`}>
                        1:{riskRewardRatio.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>% of Account</span>
                      <span className="font-semibold">{((positionSize / accountSize) * 100).toFixed(2)}%</span>
                    </div>
                  </div>
                </Card>
                
                {riskRewardRatio > 0 && (
                  <div className={`p-4 rounded-lg ${
                    riskRewardRatio >= 2 ? 'bg-green-500/10 border border-green-500/20' : 
                    riskRewardRatio >= 1 ? 'bg-yellow-500/10 border border-yellow-500/20' : 
                    'bg-red-500/10 border border-red-500/20'
                  }`}>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                        riskRewardRatio >= 2 ? 'text-green-500' : 
                        riskRewardRatio >= 1 ? 'text-yellow-500' : 
                        'text-red-500'
                      }`} />
                      <div>
                        <h4 className="font-medium">Risk Assessment</h4>
                        <p className="text-sm mt-1">
                          {riskRewardRatio >= 2 
                            ? 'Favorable risk/reward ratio. This trade meets recommended risk management criteria.'
                            : riskRewardRatio >= 1
                            ? 'Acceptable risk/reward ratio, but consider finding better opportunities.'
                            : 'Poor risk/reward ratio. Consider avoiding this trade or adjusting your entry/exit points.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="risk-analysis" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Portfolio Risk Metrics</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Portfolio Risk</span>
                      <span className={`font-medium ${
                        portfolioRisk > 15 ? 'text-red-500' : 
                        portfolioRisk > 10 ? 'text-yellow-500' : 
                        'text-green-500'
                      }`}>
                        {portfolioRisk.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={portfolioRisk} 
                      max={25} 
                      className={`h-2 ${
                        portfolioRisk > 15 ? 'bg-red-500' : 
                        portfolioRisk > 10 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`} 
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Maximum Drawdown (Estimated)</span>
                      <span className={`font-medium ${
                        maxDrawdown > 20 ? 'text-red-500' : 
                        maxDrawdown > 10 ? 'text-yellow-500' : 
                        'text-green-500'
                      }`}>
                        {maxDrawdown.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={maxDrawdown} 
                      max={50} 
                      className={`h-2 ${
                        maxDrawdown > 20 ? 'bg-red-500' : 
                        maxDrawdown > 10 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`} 
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Value at Risk (95% 1-day)</span>
                      <span className="font-medium">${valueAtRisk.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Correlation Risk</span>
                      <span className={`font-medium ${
                        correlationRisk > 60 ? 'text-red-500' : 
                        correlationRisk > 40 ? 'text-yellow-500' : 
                        'text-green-500'
                      }`}>
                        {correlationRisk.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={correlationRisk} 
                      max={100} 
                      className={`h-2 ${
                        correlationRisk > 60 ? 'bg-red-500' : 
                        correlationRisk > 40 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`} 
                    />
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Position Risk Analysis</h3>
                
                <div className="space-y-4">
                  {positions.map((position, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{position.symbol}</span>
                        <span className="text-sm">${position.size.toLocaleString()}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Risk Contribution</span>
                            <span className={`${
                              position.risk > 3 ? 'text-red-500' : 
                              position.risk > 2 ? 'text-yellow-500' : 
                              'text-green-500'
                            }`}>
                              {position.risk}%
                            </span>
                          </div>
                          <Progress 
                            value={position.risk} 
                            max={5} 
                            className="h-1" 
                          />
                        </div>
                        
                        <div className="flex justify-between text-xs">
                          <span>Correlation</span>
                          <span className={`${
                            position.correlation === 'High' ? 'text-red-500' : 
                            position.correlation === 'Medium' ? 'text-yellow-500' : 
                            'text-green-500'
                          }`}>
                            {position.correlation}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Risk Recommendations</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Sector Concentration</h4>
                    <p className="text-sm text-muted-foreground">
                      Your portfolio has high exposure to technology stocks. Consider diversifying into other sectors.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Position Sizing</h4>
                    <p className="text-sm text-muted-foreground">
                      Your position sizes are within recommended limits based on your risk settings.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Correlation Risk</h4>
                    <p className="text-sm text-muted-foreground">
                      High correlation between AAPL and MSFT increases portfolio risk. Consider reducing one position.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="risk-settings" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="max-risk-per-trade">Maximum Risk Per Trade (%)</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      id="max-risk-per-trade"
                      value={[maxRiskPerTrade]}
                      onValueChange={(value) => setMaxRiskPerTrade(value[0])}
                      min={0.5}
                      max={5}
                      step={0.5}
                      className="flex-1"
                    />
                    <span className="w-12 text-right">{maxRiskPerTrade}%</span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="max-risk-per-day">Maximum Risk Per Day (%)</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      id="max-risk-per-day"
                      value={[maxRiskPerDay]}
                      onValueChange={(value) => setMaxRiskPerDay(value[0])}
                      min={1}
                      max={10}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-12 text-right">{maxRiskPerDay}%</span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="max-open-positions">Maximum Open Positions</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      id="max-open-positions"
                      value={[maxOpenPositions]}
                      onValueChange={(value) => setMaxOpenPositions(value[0])}
                      min={1}
                      max={20}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-12 text-right">{maxOpenPositions}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="stop-loss-required"
                    checked={stopLossRequired}
                    onChange={(e) => setStopLossRequired(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="stop-loss-required">Require Stop Loss for All Trades</Label>
                </div>
              </div>
              
              <Card className="p-4 bg-accent/10">
                <h3 className="text-lg font-semibold mb-4">Risk Management Rules</h3>
                
                <div className="space-y-3 text-sm">
                  <p>• Never risk more than {maxRiskPerTrade}% on a single trade</p>
                  <p>• Never risk more than {maxRiskPerDay}% in a single day</p>
                  <p>• Maximum of {maxOpenPositions} open positions at any time</p>
                  <p>• {stopLossRequired ? 'Always use stop losses' : 'Stop losses optional but recommended'}</p>
                  <p>• Minimum risk/reward ratio of 1:2 for all trades</p>
                  <p>• Cut losses quickly, let winners run</p>
                  <p>• Avoid trading during major news events</p>
                  <p>• Review all trades weekly to identify patterns</p>
                </div>
              </Card>
            </div>
            
            <div className="flex justify-end">
              <Button>Save Risk Settings</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RiskManagement; 