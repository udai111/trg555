import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Percent, RefreshCw, Grid, X } from 'lucide-react';

interface HeatmapItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  marketCap: number;
  sector: string;
  volume: number;
}

interface SectorSummary {
  name: string;
  change: number;
  marketCap: number;
  companies: number;
}

const MarketHeatmap: React.FC = () => {
  const [stocks, setStocks] = useState<HeatmapItem[]>([]);
  const [sectors, setSectors] = useState<SectorSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'sectors' | 'stocks'>('sectors');
  const [timeframe, setTimeframe] = useState('1D');
  const [sizeBy, setSizeBy] = useState<'marketCap' | 'volume'>('marketCap');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  useEffect(() => {
    fetchMarketData();
  }, [timeframe]);

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      const mockStocks: HeatmapItem[] = [
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          price: 175.84,
          change: 2.5,
          marketCap: 2800000000000,
          sector: 'Technology',
          volume: 55000000
        },
        {
          symbol: 'MSFT',
          name: 'Microsoft Corporation',
          price: 378.52,
          change: 1.8,
          marketCap: 2500000000000,
          sector: 'Technology',
          volume: 45000000
        },
        {
          symbol: 'GOOGL',
          name: 'Alphabet Inc.',
          price: 142.65,
          change: -0.5,
          marketCap: 1800000000000,
          sector: 'Communication Services',
          volume: 35000000
        },
        {
          symbol: 'AMZN',
          name: 'Amazon.com Inc.',
          price: 175.35,
          change: 1.2,
          marketCap: 1600000000000,
          sector: 'Consumer Discretionary',
          volume: 42000000
        },
        {
          symbol: 'NVDA',
          name: 'NVIDIA Corporation',
          price: 785.38,
          change: 4.2,
          marketCap: 1200000000000,
          sector: 'Technology',
          volume: 65000000
        },
        {
          symbol: 'META',
          name: 'Meta Platforms Inc.',
          price: 485.92,
          change: 3.1,
          marketCap: 950000000000,
          sector: 'Communication Services',
          volume: 42000000
        },
        {
          symbol: 'BRK.B',
          name: 'Berkshire Hathaway',
          price: 412.56,
          change: -0.8,
          marketCap: 900000000000,
          sector: 'Financial Services',
          volume: 25000000
        },
        {
          symbol: 'TSLA',
          name: 'Tesla, Inc.',
          price: 175.45,
          change: -2.3,
          marketCap: 850000000000,
          sector: 'Consumer Discretionary',
          volume: 58000000
        },
        {
          symbol: 'V',
          name: 'Visa Inc.',
          price: 278.89,
          change: 0.9,
          marketCap: 800000000000,
          sector: 'Financial Services',
          volume: 28000000
        },
        {
          symbol: 'UNH',
          name: 'UnitedHealth Group',
          price: 485.67,
          change: 1.5,
          marketCap: 750000000000,
          sector: 'Healthcare',
          volume: 22000000
        }
      ];

      setStocks(mockStocks);

      // Calculate sector summaries
      const sectorMap = new Map<string, SectorSummary>();
      mockStocks.forEach(stock => {
        const existing = sectorMap.get(stock.sector);
        if (existing) {
          existing.marketCap += stock.marketCap;
          existing.change = (existing.change * existing.companies + stock.change) / (existing.companies + 1);
          existing.companies += 1;
        } else {
          sectorMap.set(stock.sector, {
            name: stock.sector,
            marketCap: stock.marketCap,
            change: stock.change,
            companies: 1
          });
        }
      });

      setSectors(Array.from(sectorMap.values()));
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 3) return 'bg-green-500';
    if (change > 1) return 'bg-green-400';
    if (change > 0) return 'bg-green-300';
    if (change < -3) return 'bg-red-500';
    if (change < -1) return 'bg-red-400';
    if (change < 0) return 'bg-red-300';
    return 'bg-gray-300';
  };

  const getChangeTextColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
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

  const calculateBoxSize = (value: number, max: number, min: number) => {
    const normalized = (value - min) / (max - min);
    return Math.max(50 + normalized * 150, 50); // Size between 50px and 200px
  };

  const renderHeatmap = () => {
    if (view === 'sectors') {
      const maxMarketCap = Math.max(...sectors.map(s => s.marketCap));
      const minMarketCap = Math.min(...sectors.map(s => s.marketCap));

      return (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {sectors.map(sector => {
            const size = calculateBoxSize(sector.marketCap, maxMarketCap, minMarketCap);
            return (
              <div
                key={sector.name}
                className={`relative rounded-lg cursor-pointer transition-all hover:scale-105 ${
                  getChangeColor(sector.change)
                }`}
                style={{
                  width: size,
                  height: size
                }}
                onClick={() => setSelectedSector(sector.name)}
              >
                <div className="absolute inset-0 p-3 flex flex-col justify-between text-white">
                  <div>
                    <div className="font-semibold">{sector.name}</div>
                    <div className="text-sm opacity-90">{sector.companies} companies</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{sector.change.toFixed(1)}%</div>
                    <div className="text-sm opacity-90">{formatLargeNumber(sector.marketCap)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    } else {
      const filteredStocks = selectedSector
        ? stocks.filter(stock => stock.sector === selectedSector)
        : stocks;

      const maxValue = Math.max(...filteredStocks.map(s => sizeBy === 'marketCap' ? s.marketCap : s.volume));
      const minValue = Math.min(...filteredStocks.map(s => sizeBy === 'marketCap' ? s.marketCap : s.volume));

      return (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredStocks.map(stock => {
            const size = calculateBoxSize(
              sizeBy === 'marketCap' ? stock.marketCap : stock.volume,
              maxValue,
              minValue
            );
            return (
              <div
                key={stock.symbol}
                className={`relative rounded-lg transition-all hover:scale-105 ${
                  getChangeColor(stock.change)
                }`}
                style={{
                  width: size,
                  height: size
                }}
              >
                <div className="absolute inset-0 p-3 flex flex-col justify-between text-white">
                  <div>
                    <div className="font-semibold">{stock.symbol}</div>
                    <div className="text-sm opacity-90 truncate">{stock.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{stock.change.toFixed(1)}%</div>
                    <div className="text-sm opacity-90">
                      {sizeBy === 'marketCap'
                        ? formatLargeNumber(stock.marketCap)
                        : formatVolume(stock.volume)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Grid className="w-5 h-5" />
            Market Heatmap
          </CardTitle>
          <div className="flex items-center gap-4">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1D">1 Day</SelectItem>
                <SelectItem value="1W">1 Week</SelectItem>
                <SelectItem value="1M">1 Month</SelectItem>
                <SelectItem value="3M">3 Months</SelectItem>
                <SelectItem value="1Y">1 Year</SelectItem>
                <SelectItem value="YTD">YTD</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button
                variant={view === 'sectors' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('sectors')}
              >
                Sectors
              </Button>
              <Button
                variant={view === 'stocks' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('stocks')}
              >
                Stocks
              </Button>
            </div>

            {view === 'stocks' && (
              <Select value={sizeBy} onValueChange={(value: 'marketCap' | 'volume') => setSizeBy(value)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Size by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marketCap">Market Cap</SelectItem>
                  <SelectItem value="volume">Volume</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Button
              variant="outline"
              size="icon"
              onClick={fetchMarketData}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            {selectedSector && (
              <Badge
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => setSelectedSector(null)}
              >
                {selectedSector}
                <X className="w-3 h-3 ml-1 cursor-pointer" />
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span>Gainers: {stocks.filter(s => s.change > 0).length}</span>
            </div>
            <div className="flex items-center gap-1 ml-4">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span>Losers: {stocks.filter(s => s.change < 0).length}</span>
            </div>
            <div className="flex items-center gap-1 ml-4">
              <Percent className="w-4 h-4" />
              <span>Unchanged: {stocks.filter(s => s.change === 0).length}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="flex justify-center">
            {renderHeatmap()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketHeatmap; 