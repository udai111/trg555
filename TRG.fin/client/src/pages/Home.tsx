import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { marketApi, MarketData, TechnicalIndicator } from '@/lib/api/market';
import TechnicalAnalysis from '@/components/TechnicalAnalysis';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'wouter';
import { Brain, TrendingUp, LineChart as LineChartIcon, BarChart, Activity, Gamepad, Settings, ArrowUpRight, ArrowDownRight, Zap, Newspaper, Bell, Star, StarOff, RefreshCw, DollarSign, Percent, TrendingDown, AlertCircle, Calendar, ChevronRight, Clock, Coins, Filter, Plus, Share2, ShieldAlert, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface ProbabilityFeature {
  name: string;
  probability: number;
}

interface MarketNews {
  title: string;
  source: string;
  time: string;
  impact: 'high' | 'medium' | 'low';
  sentiment: 'positive' | 'negative' | 'neutral';
}

interface Alert {
  id: string;
  type: 'price' | 'technical' | 'news' | 'pattern';
  symbol: string;
  message: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
}

interface TradingSignal {
  symbol: string;
  type: 'buy' | 'sell';
  confidence: number;
  indicators: string[];
  timestamp: string;
  price: number;
}

// Sample market news data
const marketNews: MarketNews[] = [
  {
    title: "Fed Signals Potential Rate Cuts in Coming Months",
    source: "Financial Times",
    time: "2 hours ago",
    impact: "high",
    sentiment: "positive"
  },
  {
    title: "Tech Stocks Rally on Strong Earnings Reports",
    source: "Reuters",
    time: "3 hours ago",
    impact: "medium",
    sentiment: "positive"
  },
  {
    title: "Global Supply Chain Concerns Persist",
    source: "Bloomberg",
    time: "5 hours ago",
    impact: "medium",
    sentiment: "negative"
  },
  {
    title: "New AI Developments Boost Tech Sector",
    source: "WSJ",
    time: "6 hours ago",
    impact: "high",
    sentiment: "positive"
  }
];

// Sample alerts data
const alerts: Alert[] = [
  {
    id: '1',
    type: 'price',
    symbol: 'RELIANCE',
    message: 'Price crossed above 200-day moving average',
    timestamp: '2024-03-20T10:30:00Z',
    priority: 'high',
    isRead: false
  },
  {
    id: '2',
    type: 'technical',
    symbol: 'TCS',
    message: 'RSI indicates oversold conditions',
    timestamp: '2024-03-20T09:45:00Z',
    priority: 'medium',
    isRead: false
  },
  {
    id: '3',
    type: 'pattern',
    symbol: 'HDFC',
    message: 'Bullish engulfing pattern detected',
    timestamp: '2024-03-20T09:15:00Z',
    priority: 'high',
    isRead: true
  }
];

// Sample trading signals
const tradingSignals: TradingSignal[] = [
  {
    symbol: 'RELIANCE',
    type: 'buy',
    confidence: 85,
    indicators: ['Moving Average Crossover', 'RSI', 'MACD'],
    timestamp: '2024-03-20T10:00:00Z',
    price: 2875.45
  },
  {
    symbol: 'INFY',
    type: 'sell',
    confidence: 75,
    indicators: ['Price Action', 'Volume', 'Bollinger Bands'],
    timestamp: '2024-03-20T09:30:00Z',
    price: 1472.35
  }
];

const Home: React.FC = () => {
  const { toast } = useToast();
  const [symbol, setSymbol] = useState<string>('');
  const [interval, setInterval] = useState<'1min' | '5min' | '15min' | '30min' | '60min' | 'daily'>('daily');
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [rsiData, setRsiData] = useState<TechnicalIndicator[]>([]);
  const [macdData, setMacdData] = useState<any[]>([]);
  const [probabilities, setProbabilities] = useState<ProbabilityFeature[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('trend');
  const [riskLevel, setRiskLevel] = useState<number>(50);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Array<{message: string; sender: string}>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [newAlertSymbol, setNewAlertSymbol] = useState('');
  const [newAlertType, setNewAlertType] = useState<'price' | 'technical' | 'news' | 'pattern'>('price');
  const [newAlertPrice, setNewAlertPrice] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('1D');
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Market summary data
  const marketSummary = [
    { name: 'NIFTY', value: 22347.80, change: 145.6, changePercent: 0.65, trend: 'up' },
    { name: 'SENSEX', value: 73679.32, change: 456.28, changePercent: 0.62, trend: 'up' },
    { name: 'DOW', value: 38988.15, change: -201.87, changePercent: -0.32, trend: 'down' },
    { name: 'NASDAQ', value: 16304.55, change: 107.65, changePercent: 0.68, trend: 'up' },
  ];
  
  // Portfolio performance data
  const portfolioPerformance = [
    { date: '2024-01', value: 100000 },
    { date: '2024-02', value: 108000 },
    { date: '2024-03', value: 115000 },
    { date: '2024-04', value: 112000 },
    { date: '2024-05', value: 125000 },
    { date: '2024-06', value: 135000 },
  ];
  
  // Portfolio summary
  const portfolioData = [
    { name: 'Stocks', value: 65, growth: 12.5 },
    { name: 'Bonds', value: 15, growth: 3.2 },
    { name: 'Crypto', value: 10, growth: -5.8 },
    { name: 'Cash', value: 10, growth: 0.1 },
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  // Watchlist
  const [watchlist, setWatchlist] = useState([
    { symbol: 'RELIANCE', price: 2875.45, change: 34.80, changePercent: 1.22, trend: 'up', isStarred: true },
    { symbol: 'TCS', price: 3560.70, change: -45.30, changePercent: -1.26, trend: 'down', isStarred: true },
    { symbol: 'HDFC', price: 1675.20, change: 23.45, changePercent: 1.42, trend: 'up', isStarred: true },
    { symbol: 'INFY', price: 1472.35, change: 15.70, changePercent: 1.08, trend: 'up', isStarred: false },
    { symbol: 'ITC', price: 432.15, change: -3.75, changePercent: -0.86, trend: 'down', isStarred: false },
  ]);
  
  // Quick access features
  const quickAccessFeatures = [
    { name: 'ML Predictions', icon: Brain, path: '/ml-predictions', color: 'bg-purple-500' },
    { name: 'Technical Analysis', icon: LineChartIcon, path: '/charts', color: 'bg-blue-500' },
    { name: 'Market Analysis', icon: BarChart, path: '/market-analysis', color: 'bg-emerald-500' },
    { name: 'Trading Game', icon: Gamepad, path: '/stock-market-game', color: 'bg-amber-500' },
  ];

  const toggleStarred = (symbol: string) => {
    setWatchlist(watchlist.map(stock => 
      stock.symbol === symbol 
        ? { ...stock, isStarred: !stock.isStarred }
        : stock
    ));
  };

  const handleSymbolSubmit = async () => {
    if (!symbol) {
      toast({
        title: "Error",
        description: "Please enter a symbol",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const [stockData, rsi, macd] = await Promise.all([
        marketApi.getStockData(symbol, interval),
        marketApi.getRSI(symbol, interval),
        marketApi.getMACD(symbol, interval)
      ]);

      setMarketData(stockData);
      setRsiData(rsi);
      setMacdData(macd);
      calculateProbabilities(stockData, rsi, macd);

      toast({
        title: "Success",
        description: "Market data updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch market data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateProbabilities = (data: MarketData[], rsi: TechnicalIndicator[], macd: any[]) => {
    // Simple probability calculations based on technical indicators
    const lastPrice = data[data.length - 1].close;
    const lastRSI = rsi[rsi.length - 1].value;
    const lastMACD = macd[macd.length - 1];

    const features: ProbabilityFeature[] = [
      { 
        name: 'Uptrend',
        probability: lastRSI > 50 && lastMACD.macd > lastMACD.signal ? 0.8 : 0.2
      },
      {
        name: 'Downtrend',
        probability: lastRSI < 50 && lastMACD.macd < lastMACD.signal ? 0.8 : 0.2
      },
      {
        name: 'Reversal',
        probability: (lastRSI > 70 || lastRSI < 30) ? 0.7 : 0.3
      },
      {
        name: 'Breakout',
        probability: Math.abs(lastMACD.histogram) > 1 ? 0.75 : 0.25
      },
      {
        name: 'High Volatility',
        probability: Math.abs(lastMACD.histogram) > 2 ? 0.8 : 0.2
      },
      {
        name: 'Low Volatility',
        probability: Math.abs(lastMACD.histogram) < 0.5 ? 0.8 : 0.2
      }
    ];
    setProbabilities(features);
  };

  const markAlertAsRead = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const addNewAlert = () => {
    const newAlert: Alert = {
      id: Date.now().toString(),
      type: newAlertType,
      symbol: newAlertSymbol,
      message: `Price alert for ${newAlertSymbol} at ${newAlertPrice}`,
      timestamp: new Date().toISOString(),
      priority: 'medium',
      isRead: false
    };
    setAlerts([newAlert, ...alerts]);
    setShowAlertDialog(false);
    setNewAlertSymbol('');
    setNewAlertPrice('');
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">TRG Finance Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="news">Market News</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          {/* Market Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {marketSummary.map((item) => (
              <Card key={item.name} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{item.name}</h3>
                    <Badge variant={item.trend === 'up' ? 'success' : 'destructive'} className="ml-auto">
                      {item.trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                      {item.changePercent}%
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold mt-2">{item.value.toLocaleString()}</p>
                  <p className={`text-sm ${item.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {item.trend === 'up' ? '+' : ''}{item.change.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Quick Access */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold">Quick Access</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickAccessFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <Link key={feature.name} href={feature.path}>
                      <div className="block">
                        <Card className="hover:bg-accent/5 transition-colors cursor-pointer">
                          <CardContent className="flex items-center p-4">
                            <div className={`${feature.color} p-2 rounded-lg mr-4`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{feature.name}</h3>
                            </div>
                            <ChevronRight className="w-5 h-5 ml-auto text-muted-foreground" />
                          </CardContent>
                        </Card>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          {/* Trading Signals */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Trading Signals</CardTitle>
                <p className="text-sm text-muted-foreground">AI-powered trading opportunities</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Filter Signals</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>High Confidence (&gt;80%)</DropdownMenuItem>
                  <DropdownMenuItem>Buy Signals</DropdownMenuItem>
                  <DropdownMenuItem>Sell Signals</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tradingSignals.map((signal) => (
                  <div key={`${signal.symbol}-${signal.timestamp}`} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${signal.type === 'buy' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {signal.type === 'buy' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      </div>
                      <div>
                        <h4 className="font-medium">{signal.symbol}</h4>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(signal.timestamp), 'HH:mm')} • ₹{signal.price}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Sparkles className="h-4 w-4 mr-2" />
                            {signal.confidence}% Confidence
                          </Button>
                        </HoverCardTrigger>
                        <HoverCardContent>
                          <div className="space-y-2">
                            <h4 className="font-medium">Signal Indicators</h4>
                            <ul className="text-sm space-y-1">
                              {signal.indicators.map((indicator) => (
                                <li key={indicator}>• {indicator}</li>
                              ))}
                            </ul>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Data Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-xl font-semibold">Market Data</h2>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Enter symbol (e.g., AAPL)"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="flex-1"
              />
                  <Select value={interval} onValueChange={(value: any) => setInterval(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="60min">1 Hour</SelectItem>
                      <SelectItem value="30min">30 Min</SelectItem>
                      <SelectItem value="15min">15 Min</SelectItem>
                      <SelectItem value="5min">5 Min</SelectItem>
                      <SelectItem value="1min">1 Min</SelectItem>
                    </SelectContent>
                  </Select>
              <Button onClick={handleSymbolSubmit} disabled={loading}>
                {loading ? 'Loading...' : 'Fetch Data'}
              </Button>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={marketData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="close" stroke="#8884d8" name="Price" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

            {/* Watchlist */}
        <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-xl font-semibold">Watchlist</h2>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
          </CardHeader>
          <CardContent>
                <ScrollArea className="h-[400px]">
            <div className="space-y-4">
                    {watchlist.map((stock) => (
                      <div key={stock.symbol} className="flex items-center justify-between p-2 hover:bg-accent rounded-lg transition-colors">
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStarred(stock.symbol)}
                          >
                            {stock.isStarred ? (
                              <Star className="h-4 w-4 text-yellow-400" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </Button>
              <div>
                            <p className="font-medium">{stock.symbol}</p>
                            <p className="text-sm text-muted-foreground">₹{stock.price.toFixed(2)}</p>
                          </div>
              </div>
                        <div className={`text-right ${stock.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                          <p className="font-medium">{stock.trend === 'up' ? '+' : ''}{stock.change.toFixed(2)}</p>
                          <p className="text-sm">{stock.trend === 'up' ? '+' : ''}{stock.changePercent.toFixed(2)}%</p>
              </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <Separator className="my-4" />
                <Button className="w-full" variant="outline">
                  Add New Symbol
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="portfolio">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Portfolio Overview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={portfolioPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Total Value</p>
                      <p className="text-2xl font-bold">$135,000</p>
                      <Badge variant="success" className="mt-1">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        35%
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Monthly Return</p>
                      <p className="text-2xl font-bold">$8,000</p>
                      <Badge variant="success" className="mt-1">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        6.3%
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Risk Score</p>
                      <p className="text-2xl font-bold">Medium</p>
                      <Progress value={65} className="h-2 mt-2" />
                    </CardContent>
                  </Card>
            </div>
          </CardContent>
        </Card>

            {/* Asset Allocation */}
        <Card>
          <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={portfolioData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {portfolioData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4 mt-6">
                  {portfolioData.map((asset, index) => (
                    <div key={asset.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span>{asset.name}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-medium">{asset.value}%</span>
                        <Badge variant={asset.growth > 0 ? 'success' : 'destructive'}>
                          {asset.growth > 0 ? '+' : ''}{asset.growth}%
                        </Badge>
                      </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

            {/* Portfolio Analytics */}
            <Card className="lg:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Portfolio Analytics</CardTitle>
                  <p className="text-sm text-muted-foreground">Advanced portfolio metrics and analysis</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        {format(selectedDate, 'MMM dd, yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Time Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1D">1 Day</SelectItem>
                      <SelectItem value="1W">1 Week</SelectItem>
                      <SelectItem value="1M">1 Month</SelectItem>
                      <SelectItem value="3M">3 Months</SelectItem>
                      <SelectItem value="1Y">1 Year</SelectItem>
                      <SelectItem value="ALL">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Sharpe Ratio</p>
                        <HoverCard>
                          <HoverCardTrigger>
                            <Button variant="ghost" size="sm">
                              <AlertCircle className="h-4 w-4" />
                            </Button>
                          </HoverCardTrigger>
                          <HoverCardContent>
                            <p className="text-sm">
                              The Sharpe ratio measures risk-adjusted returns. A higher ratio indicates better risk-adjusted performance.
                            </p>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                      <p className="text-2xl font-bold mt-2">1.85</p>
                      <Badge variant="success" className="mt-1">
                        Above Average
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Beta</p>
                        <HoverCard>
                          <HoverCardTrigger>
                            <Button variant="ghost" size="sm">
                              <AlertCircle className="h-4 w-4" />
                            </Button>
                          </HoverCardTrigger>
                          <HoverCardContent>
                            <p className="text-sm">
                              Beta measures portfolio volatility relative to the market. A beta of 1 indicates market-like volatility.
                            </p>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                      <p className="text-2xl font-bold mt-2">0.92</p>
                      <Badge variant="secondary" className="mt-1">
                        Market-like Risk
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Alpha</p>
                        <HoverCard>
                          <HoverCardTrigger>
                            <Button variant="ghost" size="sm">
                              <AlertCircle className="h-4 w-4" />
                            </Button>
                          </HoverCardTrigger>
                          <HoverCardContent>
                            <p className="text-sm">
                              Alpha represents excess returns compared to the benchmark. Positive alpha indicates outperformance.
                            </p>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                      <p className="text-2xl font-bold mt-2">2.3%</p>
                      <Badge variant="success" className="mt-1">
                        Outperforming
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Portfolio Diversification Score</h4>
                    <p className="text-sm text-muted-foreground">85/100</p>
                  </div>
                  <Progress value={85} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    Your portfolio is well-diversified across sectors and asset classes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="trading">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Trades */}
        <Card className="lg:col-span-2">
          <CardHeader>
                <CardTitle>Active Trades</CardTitle>
          </CardHeader>
          <CardContent>
                <div className="space-y-4">
                  {watchlist.filter(stock => stock.isStarred).map((stock) => (
                    <div key={stock.symbol} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium">{stock.symbol}</h4>
                          <p className="text-sm text-muted-foreground">Entry: ₹{(stock.price - stock.change).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">Current: ₹{stock.price.toFixed(2)}</p>
                          <p className={`text-sm ${stock.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                            {stock.trend === 'up' ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Close Position
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Alerts */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Alerts</CardTitle>
                <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Alert
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Alert</DialogTitle>
                      <DialogDescription>
                        Set up price and technical alerts for your watchlist.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Symbol</Label>
                        <Input
                          value={newAlertSymbol}
                          onChange={(e) => setNewAlertSymbol(e.target.value.toUpperCase())}
                          placeholder="Enter stock symbol"
                        />
                      </div>
                      <div>
                        <Label>Alert Type</Label>
                        <Select value={newAlertType} onValueChange={(value: any) => setNewAlertType(value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select alert type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="price">Price Alert</SelectItem>
                            <SelectItem value="technical">Technical Alert</SelectItem>
                            <SelectItem value="news">News Alert</SelectItem>
                            <SelectItem value="pattern">Pattern Alert</SelectItem>
                          </SelectContent>
                        </Select>
            </div>
                      {newAlertType === 'price' && (
                        <div>
                          <Label>Price Target</Label>
              <Input
                            value={newAlertPrice}
                            onChange={(e) => setNewAlertPrice(e.target.value)}
                            placeholder="Enter price target"
                            type="number"
                          />
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAlertDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={addNewAlert}>Create Alert</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`flex items-start space-x-4 p-4 rounded-lg border ${
                          !alert.isRead ? 'bg-accent/50' : ''
                        }`}
                        onClick={() => markAlertAsRead(alert.id)}
                      >
                        <div className={`p-2 rounded-full ${
                          alert.priority === 'high' ? 'bg-red-100 text-red-600' :
                          alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          <ShieldAlert className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{alert.symbol}</h4>
                            <Badge variant={
                              alert.priority === 'high' ? 'destructive' :
                              alert.priority === 'medium' ? 'default' :
                              'secondary'
                            }>
                              {alert.priority}
                            </Badge>
                          </div>
                          <p className="text-sm mt-1">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(alert.timestamp), 'HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))}
            </div>
                </ScrollArea>
          </CardContent>
        </Card>
      </div>
        </TabsContent>
        
        <TabsContent value="news">
          <Card>
            <CardHeader>
              <CardTitle>Market News & Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {marketNews.map((news, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-accent transition-colors">
                    <div className={`p-2 rounded-full ${
                      news.sentiment === 'positive' ? 'bg-green-100 text-green-600' :
                      news.sentiment === 'negative' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {news.sentiment === 'positive' ? <TrendingUp className="h-5 w-5" /> :
                       news.sentiment === 'negative' ? <TrendingDown className="h-5 w-5" /> :
                       <Activity className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{news.title}</h3>
                        <Badge variant={
                          news.impact === 'high' ? 'destructive' :
                          news.impact === 'medium' ? 'default' :
                          'secondary'
                        }>
                          {news.impact} impact
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 mt-2 text-sm text-muted-foreground">
                        <span>{news.source}</span>
                        <span>•</span>
                        <span>{news.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Home; 