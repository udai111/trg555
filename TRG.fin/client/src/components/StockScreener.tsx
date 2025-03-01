import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Search,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  RefreshCw
} from 'lucide-react';

interface ScreenerResult {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number;
  pe: number;
  sector: string;
  technicalScore: number;
  fundamentalScore: number;
  signals: string[];
}

const StockScreener: React.FC = () => {
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [volumeMin, setVolumeMin] = useState<number>(100000);
  const [marketCapMin, setMarketCapMin] = useState<number>(1000000000);
  const [peRange, setPeRange] = useState<[number, number]>([0, 100]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [technicalFilters, setTechnicalFilters] = useState({
    rsiRange: [30, 70],
    macdCrossover: false,
    aboveMA200: false,
    volumeSpike: false
  });
  const [fundamentalFilters, setFundamentalFilters] = useState({
    profitableOnly: false,
    dividendOnly: false,
    debtEquityMax: 3,
    growthMin: 10
  });
  
  // Results state
  const [results, setResults] = useState<ScreenerResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('marketCap');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Available sectors
  const sectors = [
    'Technology',
    'Healthcare',
    'Financial Services',
    'Consumer Cyclical',
    'Consumer Defensive',
    'Industrials',
    'Energy',
    'Basic Materials',
    'Communication Services',
    'Utilities',
    'Real Estate'
  ];

  useEffect(() => {
    // Simulate initial load
    runScreener();
  }, []);

  const runScreener = async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock results
      const mockResults: ScreenerResult[] = [
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          price: 175.84,
          change: 2.5,
          volume: 55000000,
          marketCap: 2800000000000,
          pe: 28.5,
          sector: 'Technology',
          technicalScore: 85,
          fundamentalScore: 92,
          signals: ['Golden Cross', 'Volume Spike', 'RSI Bullish']
        },
        {
          symbol: 'MSFT',
          name: 'Microsoft Corporation',
          price: 378.52,
          change: 1.8,
          volume: 45000000,
          marketCap: 2500000000000,
          pe: 32.4,
          sector: 'Technology',
          technicalScore: 78,
          fundamentalScore: 88,
          signals: ['Above MA200', 'Strong Momentum']
        },
        {
          symbol: 'GOOGL',
          name: 'Alphabet Inc.',
          price: 142.65,
          change: -0.5,
          volume: 35000000,
          marketCap: 1800000000000,
          pe: 25.6,
          sector: 'Communication Services',
          technicalScore: 72,
          fundamentalScore: 85,
          signals: ['RSI Oversold', 'Support Level']
        },
        {
          symbol: 'NVDA',
          name: 'NVIDIA Corporation',
          price: 785.38,
          change: 4.2,
          volume: 65000000,
          marketCap: 1200000000000,
          pe: 75.8,
          sector: 'Technology',
          technicalScore: 95,
          fundamentalScore: 82,
          signals: ['All-Time High', 'High Volume', 'Strong Buy']
        },
        {
          symbol: 'META',
          name: 'Meta Platforms Inc.',
          price: 485.92,
          change: 3.1,
          volume: 42000000,
          marketCap: 950000000000,
          pe: 34.2,
          sector: 'Communication Services',
          technicalScore: 88,
          fundamentalScore: 78,
          signals: ['Breakout', 'Momentum']
        }
      ];

      setResults(mockResults);
    } catch (error) {
      console.error('Error running screener:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1000000000000) return `$${(num / 1000000000000).toFixed(1)}T`;
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    return `$${num.toLocaleString()}`;
  };

  const formatVolume = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Stock Screener
          </CardTitle>
          <Button onClick={runScreener} disabled={loading}>
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <SlidersHorizontal className="w-4 h-4 mr-2" />
            )}
            Run Scan
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="filters">
          <TabsList className="mb-4">
            <TabsTrigger value="filters">Filters</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="fundamental">Fundamental</TabsTrigger>
            <TabsTrigger value="results">Results ({results.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="filters" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Basic Filters</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label>Price Range ($)</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseFloat(e.target.value), priceRange[1]])}
                        placeholder="Min"
                      />
                      <span>to</span>
                      <Input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value)])}
                        placeholder="Max"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Minimum Volume</Label>
                    <Select 
                      value={volumeMin.toString()} 
                      onValueChange={(value) => setVolumeMin(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select minimum volume" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50000">50K</SelectItem>
                        <SelectItem value="100000">100K</SelectItem>
                        <SelectItem value="500000">500K</SelectItem>
                        <SelectItem value="1000000">1M</SelectItem>
                        <SelectItem value="5000000">5M</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Minimum Market Cap</Label>
                    <Select 
                      value={marketCapMin.toString()} 
                      onValueChange={(value) => setMarketCapMin(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select minimum market cap" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50000000">$50M</SelectItem>
                        <SelectItem value="100000000">$100M</SelectItem>
                        <SelectItem value="1000000000">$1B</SelectItem>
                        <SelectItem value="10000000000">$10B</SelectItem>
                        <SelectItem value="100000000000">$100B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Sector Selection</h3>
                
                <div className="space-y-2">
                  {sectors.map(sector => (
                    <div key={sector} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={sector}
                        checked={selectedSectors.includes(sector)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSectors([...selectedSectors, sector]);
                          } else {
                            setSelectedSectors(selectedSectors.filter(s => s !== sector));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={sector}>{sector}</Label>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="technical" className="space-y-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Technical Indicators</h3>
              
              <div className="space-y-6">
                <div>
                  <Label>RSI (14) Range</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={technicalFilters.rsiRange}
                      onValueChange={(value) => setTechnicalFilters({ ...technicalFilters, rsiRange: value as [number, number] })}
                      min={0}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-24 text-right">
                      {technicalFilters.rsiRange[0]} - {technicalFilters.rsiRange[1]}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>MACD Crossover</Label>
                    <p className="text-sm text-muted-foreground">Signal line crossover in last 3 days</p>
                  </div>
                  <Switch
                    checked={technicalFilters.macdCrossover}
                    onCheckedChange={(checked) => setTechnicalFilters({ ...technicalFilters, macdCrossover: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Above 200 MA</Label>
                    <p className="text-sm text-muted-foreground">Price above 200-day moving average</p>
                  </div>
                  <Switch
                    checked={technicalFilters.aboveMA200}
                    onCheckedChange={(checked) => setTechnicalFilters({ ...technicalFilters, aboveMA200: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Volume Spike</Label>
                    <p className="text-sm text-muted-foreground">Volume > 200% of 20-day average</p>
                  </div>
                  <Switch
                    checked={technicalFilters.volumeSpike}
                    onCheckedChange={(checked) => setTechnicalFilters({ ...technicalFilters, volumeSpike: checked })}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="fundamental" className="space-y-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Fundamental Filters</h3>
              
              <div className="space-y-6">
                <div>
                  <Label>P/E Ratio Range</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={peRange}
                      onValueChange={(value) => setPeRange(value as [number, number])}
                      min={0}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-24 text-right">
                      {peRange[0]} - {peRange[1]}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Profitable Companies Only</Label>
                    <p className="text-sm text-muted-foreground">Positive earnings in last 4 quarters</p>
                  </div>
                  <Switch
                    checked={fundamentalFilters.profitableOnly}
                    onCheckedChange={(checked) => setFundamentalFilters({ ...fundamentalFilters, profitableOnly: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Dividend Paying Only</Label>
                    <p className="text-sm text-muted-foreground">Regular dividend payments</p>
                  </div>
                  <Switch
                    checked={fundamentalFilters.dividendOnly}
                    onCheckedChange={(checked) => setFundamentalFilters({ ...fundamentalFilters, dividendOnly: checked })}
                  />
                </div>

                <div>
                  <Label>Maximum Debt/Equity Ratio</Label>
                  <Select
                    value={fundamentalFilters.debtEquityMax.toString()}
                    onValueChange={(value) => setFundamentalFilters({ ...fundamentalFilters, debtEquityMax: parseFloat(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select maximum ratio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Less than 1</SelectItem>
                      <SelectItem value="2">Less than 2</SelectItem>
                      <SelectItem value="3">Less than 3</SelectItem>
                      <SelectItem value="5">Less than 5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Minimum Revenue Growth (%)</Label>
                  <Select
                    value={fundamentalFilters.growthMin.toString()}
                    onValueChange={(value) => setFundamentalFilters({ ...fundamentalFilters, growthMin: parseFloat(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select minimum growth" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5% or higher</SelectItem>
                      <SelectItem value="10">10% or higher</SelectItem>
                      <SelectItem value="20">20% or higher</SelectItem>
                      <SelectItem value="30">30% or higher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Label>Sort by:</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select sort criteria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marketCap">Market Cap</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="volume">Volume</SelectItem>
                      <SelectItem value="change">Price Change</SelectItem>
                      <SelectItem value="technicalScore">Technical Score</SelectItem>
                      <SelectItem value="fundamentalScore">Fundamental Score</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'asc' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </Button>
                </div>
                
                <Badge variant="outline">
                  {results.length} matches
                </Badge>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-2" />
                  <p>No stocks match your criteria</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((stock) => (
                    <Card key={stock.symbol} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{stock.symbol}</h3>
                            <span className="text-sm text-muted-foreground">{stock.name}</span>
                            <Badge variant="outline">{stock.sector}</Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {stock.price.toFixed(2)}
                            </span>
                            <span className={`flex items-center gap-1 ${
                              stock.change >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {stock.change >= 0 ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )}
                              {Math.abs(stock.change)}%
                            </span>
                            <span className="flex items-center gap-1">
                              <BarChart2 className="w-4 h-4" />
                              {formatVolume(stock.volume)}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {formatLargeNumber(stock.marketCap)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Percent className="w-4 h-4" />
                              P/E {stock.pe.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-4 mb-2">
                            <div>
                              <div className="text-sm text-muted-foreground">Technical</div>
                              <div className={`font-semibold ${getScoreColor(stock.technicalScore)}`}>
                                {stock.technicalScore}/100
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Fundamental</div>
                              <div className={`font-semibold ${getScoreColor(stock.fundamentalScore)}`}>
                                {stock.fundamentalScore}/100
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {stock.signals.map((signal, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {signal}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StockScreener; 