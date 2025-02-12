import { useEffect, useState, useRef, memo } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createChart, ColorType, IChartApi, CandlestickData, Time } from "lightweight-charts";
import { motion } from "framer-motion";
import { Activity, TrendingUp, TrendingDown, BarChart2, HelpCircle, Bitcoin, LineChart, Globe, CandlestickChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface PatternData {
  name: string;
  probability: number;
  strength: number;
  example: {
    entry: number;
    target: number;
    stopLoss: number;
  };
  description: string;
}

interface StockPattern {
  symbol: string;
  patterns: PatternData[];
}

const NormalChart = memo(({ data, patterns }: { 
  data: CandlestickData[];
  patterns: PatternData[];
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid' as ColorType, color: '#131722' },
        textColor: '#D9D9D9',
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#2B2B43',
      },
      rightPriceScale: {
        borderColor: '#2B2B43',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      crosshair: {
        mode: 1,
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
    });

    const mainSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderUpColor: '#26a69a',
      borderDownColor: '#ef5350',
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Add markers for patterns
    const markers = patterns.map(pattern => ({
      time: data[data.length - 1].time,
      position: 'aboveBar' as const,
      color: pattern.probability > 70 ? '#26a69a' : '#ef5350',
      shape: 'arrowDown' as const,
      text: pattern.name
    }));

    mainSeries.setData(data);
    mainSeries.setMarkers(markers);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, patterns]);

  return <div ref={chartContainerRef} className="h-[500px] w-full" />;
});

NormalChart.displayName = 'NormalChart';

const TradingViewChart = memo(({ symbol, marketType }: { symbol: string; marketType: string }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    // Format symbol based on market type
    let formattedSymbol = symbol;
    if (marketType === 'crypto') {
      formattedSymbol = `BINANCE:${symbol.replace('/', '')}`;
    } else if (marketType === 'indian') {
      formattedSymbol = `NSE:${symbol}`;
    } else {
      formattedSymbol = `NASDAQ:${symbol}`;
    }

    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": formattedSymbol,
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "withdateranges": true,
      "range": "YTD",
      "hide_side_toolbar": false,
      "allow_symbol_change": true,
      "details": true,
      "hotlist": true,
      "calendar": false,
      "support_host": "https://www.tradingview.com"
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        const script = container.current.querySelector('script');
        if (script) {
          script.remove();
        }
      }
    };
  }, [symbol, marketType]);

  return (
    <div ref={container} className="tradingview-widget-container h-[500px] w-full">
      <div className="tradingview-widget-container__widget h-full" />
    </div>
  );
});

TradingViewChart.displayName = 'TradingViewChart';

export default function CandlestickPatternsPage() {
  const [activePatterns, setActivePatterns] = useState<StockPattern[]>([]);
  const [selectedStock, setSelectedStock] = useState("RELIANCE");
  const [marketType, setMarketType] = useState<'indian' | 'international' | 'crypto'>('indian');
  const [chartType, setChartType] = useState<'normal' | 'lightweight' | 'tradingview'>('normal');
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<any>(null);
  const [chartData, setChartData] = useState<CandlestickData[]>([]);

  const patterns = [
    "Doji", "Hammer", "Shooting Star", "Engulfing", "Morning Star",
    "Evening Star", "Harami", "Three White Soldiers", "Three Black Crows",
    "Piercing Line", "Dark Cloud Cover", "Rising Three Methods",
    "Falling Three Methods", "Three Inside Up", "Three Inside Down"
  ];

  const indianStocks = [
    "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "WIPRO",
    "BAJFINANCE", "BHARTIARTL", "ASIANPAINT", "MARUTI"
  ];

  const internationalStocks = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META",
    "NVDA", "JPM", "V", "WMT"
  ];

  const cryptoData = [
    "BTC/USDT", "ETH/USDT", "BNB/USDT", "XRP/USDT", "ADA/USDT",
    "SOL/USDT", "DOT/USDT", "DOGE/USDT", "MATIC/USDT", "LINK/USDT"
  ];

  const getBasePrice = (symbol: string): number => {
    const indianPrices: { [key: string]: number } = {
      'RELIANCE': 2432.50,
      'TCS': 3890.75,
      'INFY': 1567.25,
      'HDFCBANK': 1678.90,
      'ICICIBANK': 987.45,
      'WIPRO': 456.78,
      'BAJFINANCE': 6789.30,
      'BHARTIARTL': 876.54,
      'ASIANPAINT': 3456.78,
      'MARUTI': 9876.54,
    };

    const internationalPrices: { [key: string]: number } = {
      'AAPL': 185.85,
      'MSFT': 420.55,
      'GOOGL': 145.75,
      'AMZN': 175.35,
      'TSLA': 185.85,
      'META': 465.20,
      'NVDA': 725.35,
      'JPM': 185.45,
      'V': 275.85,
      'WMT': 175.45,
    };

    const cryptoPrices: { [key: string]: number } = {
      'BTC/USDT': 48000,
      'ETH/USDT': 2800,
      'BNB/USDT': 320,
      'XRP/USDT': 0.55,
      'ADA/USDT': 0.50,
      'SOL/USDT': 95,
      'DOT/USDT': 15,
      'DOGE/USDT': 0.08,
      'MATIC/USDT': 0.85,
      'LINK/USDT': 18,
    };

    switch (marketType) {
      case 'indian':
        return indianPrices[symbol] || 1000;
      case 'international':
        return internationalPrices[symbol] || 100;
      case 'crypto':
        return cryptoPrices[symbol] || 100;
      default:
        return 100;
    }
  };

  const getAvailableSymbols = () => {
    switch (marketType) {
      case 'indian':
        return indianStocks;
      case 'international':
        return internationalStocks;
      case 'crypto':
        return cryptoData;
      default:
        return indianStocks;
    }
  };

  useEffect(() => {
    const currentDate = new Date();
    const basePrice = getBasePrice(selectedStock);
    const volatility = marketType === 'crypto' ? 0.02 : 0.01;

    const data: CandlestickData[] = Array.from({ length: 50 }).map((_, i) => {
      const date = new Date(currentDate);
      date.setMinutes(date.getMinutes() - (50 - i) * 15);

      const variance = Math.random() * (basePrice * volatility) - (basePrice * volatility / 2);
      const open = basePrice + variance;
      const high = open + Math.random() * (basePrice * volatility);
      const low = open - Math.random() * (basePrice * volatility);
      const close = (open + high + low) / 3 + (Math.random() - 0.5) * (basePrice * volatility / 2);

      return {
        time: Math.floor(date.getTime() / 1000) as Time,
        open,
        high,
        low,
        close,
      };
    });

    setChartData(data);
  }, [selectedStock, marketType]);


  const handleMarketTypeChange = (type: string) => {
    if (type === 'indian' || type === 'international' || type === 'crypto') {
      setMarketType(type as 'indian' | 'international' | 'crypto');
      const defaultSymbols = {
        indian: 'RELIANCE',
        international: 'AAPL',
        crypto: 'BTC/USDT'
      };
      setSelectedStock(defaultSymbols[type as keyof typeof defaultSymbols]);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const availableStocks = getAvailableSymbols();
      const newPatterns = availableStocks.map(symbol => ({
        symbol,
        patterns: patterns
          .filter(() => Math.random() > 0.7)
          .map(name => ({
            name,
            probability: Math.round(Math.random() * 100),
            strength: Math.round(Math.random() * 100),
            example: {
              entry: getBasePrice(symbol),
              target: getBasePrice(symbol) * 1.02,
              stopLoss: getBasePrice(symbol) * 0.98,
            },
            description: `A ${name} pattern indicates a potential ${Math.random() > 0.5 ? 'reversal' : 'continuation'} in the current trend.`,
          })),
      }));
      setActivePatterns(newPatterns);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedStock, marketType]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Live Pattern Recognition</h1>
        <div className="flex items-center gap-4">
          <ToggleGroup type="single" value={marketType} onValueChange={handleMarketTypeChange}>
            <ToggleGroupItem value="indian" aria-label="Indian">
              <BarChart2 className="h-4 w-4 mr-2" />
              Indian
            </ToggleGroupItem>
            <ToggleGroupItem value="international" aria-label="International">
              <Globe className="h-4 w-4 mr-2" />
              International
            </ToggleGroupItem>
            <ToggleGroupItem value="crypto" aria-label="Crypto">
              <Bitcoin className="h-4 w-4 mr-2" />
              Crypto
            </ToggleGroupItem>
          </ToggleGroup>

          <ToggleGroup 
            type="single" 
            value={chartType} 
            onValueChange={(value: string) => {
              if (value === 'normal' || value === 'lightweight' || value === 'tradingview') {
                setChartType(value as 'normal' | 'lightweight' | 'tradingview');
              }
            }}
          >
            <ToggleGroupItem value="normal" aria-label="Normal Chart">
              <CandlestickChart className="h-4 w-4 mr-2" />
              Pattern Chart
            </ToggleGroupItem>
            <ToggleGroupItem value="lightweight" aria-label="Lightweight Charts">
              <LineChart className="h-4 w-4 mr-2" />
              Custom Chart
            </ToggleGroupItem>
            <ToggleGroupItem value="tradingview" aria-label="TradingView">
              <BarChart2 className="h-4 w-4 mr-2" />
              TradingView
            </ToggleGroupItem>
          </ToggleGroup>

          <Select value={selectedStock} onValueChange={setSelectedStock}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select asset" />
            </SelectTrigger>
            <SelectContent>
              {getAvailableSymbols().map((asset) => (
                <SelectItem key={asset} value={asset}>
                  {asset}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 animate-pulse text-green-500" />
            <span>Live Scanning</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">HD Chart Analysis</h2>
            <div className="text-sm text-muted-foreground">
              {selectedStock} Live Chart
            </div>
          </div>
          {chartType === 'normal' ? (
            <NormalChart 
              data={chartData} 
              patterns={activePatterns.find(p => p.symbol === selectedStock)?.patterns || []} 
            />
          ) : chartType === 'lightweight' ? (
            <div ref={chartContainerRef} className="h-[500px] w-full" />
          ) : (
            <TradingViewChart symbol={selectedStock} marketType={marketType} />
          )}
        </Card>

        <Card className="p-6 overflow-auto max-h-[calc(500px+2rem)]">
          <h2 className="text-2xl font-semibold mb-4">Active Patterns</h2>
          <div className="space-y-4">
            {activePatterns
              .filter(stock => stock.symbol === selectedStock)
              .map((stock) => (
                <div key={stock.symbol} className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {stock.symbol}
                    {stock.patterns.length > 0 && (
                      <span className="text-sm text-green-500">
                        {stock.patterns.length} active patterns
                      </span>
                    )}
                  </h3>
                  {stock.patterns.map((pattern) => (
                    <motion.div
                      key={`${stock.symbol}-${pattern.name}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-accent/10 p-3 rounded-lg space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{pattern.name}</span>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-1 rounded text-xs",
                            pattern.probability > 70 ? "bg-green-500/20 text-green-500" :
                              pattern.probability > 40 ? "bg-yellow-500/20 text-yellow-500" :
                                "bg-red-500/20 text-red-500"
                          )}>
                            {pattern.probability}% Probability
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Entry</span>
                          <span>{marketType === 'crypto' ? '$' : '₹'}{pattern.example.entry.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-green-500">
                          <span>Target</span>
                          <span>{marketType === 'crypto' ? '$' : '₹'}{pattern.example.target.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-red-500">
                          <span>Stop Loss</span>
                          <span>{marketType === 'crypto' ? '$' : '₹'}{pattern.example.stopLoss.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-accent/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${pattern.strength}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {pattern.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}