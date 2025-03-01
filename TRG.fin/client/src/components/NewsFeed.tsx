import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Newspaper, TrendingUp, TrendingDown, BarChart2, AlertCircle } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  relatedSymbols: string[];
  impact: 'high' | 'medium' | 'low';
}

const NewsFeed: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);

  useEffect(() => {
    // Simulate API call to fetch news
    const fetchNews = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockNews: NewsItem[] = [
          {
            id: '1',
            title: 'Fed signals potential rate cuts later this year',
            summary: 'Federal Reserve officials indicated they could begin cutting interest rates in the coming months if inflation continues to cool.',
            url: '#',
            source: 'Financial Times',
            publishedAt: '2025-03-01T10:30:00Z',
            sentiment: 'positive',
            sentimentScore: 0.78,
            relatedSymbols: ['SPY', 'QQQ', 'AAPL', 'MSFT'],
            impact: 'high'
          },
          {
            id: '2',
            title: 'Apple announces new AI features for iPhone',
            summary: 'Apple unveiled a suite of new AI features coming to iPhones later this year, potentially boosting sales.',
            url: '#',
            source: 'Bloomberg',
            publishedAt: '2025-03-01T09:15:00Z',
            sentiment: 'positive',
            sentimentScore: 0.85,
            relatedSymbols: ['AAPL'],
            impact: 'medium'
          },
          {
            id: '3',
            title: 'Oil prices drop on increased supply concerns',
            summary: 'Crude oil prices fell 3% as OPEC+ members consider increasing production quotas.',
            url: '#',
            source: 'Reuters',
            publishedAt: '2025-03-01T08:45:00Z',
            sentiment: 'negative',
            sentimentScore: -0.62,
            relatedSymbols: ['USO', 'XOM', 'CVX'],
            impact: 'high'
          },
          {
            id: '4',
            title: 'Tesla faces production challenges at Berlin factory',
            summary: 'Tesla is reportedly facing production delays at its Berlin Gigafactory due to supply chain issues.',
            url: '#',
            source: 'CNBC',
            publishedAt: '2025-03-01T07:30:00Z',
            sentiment: 'negative',
            sentimentScore: -0.45,
            relatedSymbols: ['TSLA'],
            impact: 'medium'
          },
          {
            id: '5',
            title: 'Microsoft cloud revenue exceeds expectations',
            summary: 'Microsoft reported cloud revenue growth that beat analyst expectations, driven by AI adoption.',
            url: '#',
            source: 'Wall Street Journal',
            publishedAt: '2025-02-28T22:15:00Z',
            sentiment: 'positive',
            sentimentScore: 0.92,
            relatedSymbols: ['MSFT'],
            impact: 'high'
          }
        ];
        
        setNews(mockNews);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    // Refresh news every 5 minutes
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredNews = news.filter(item => {
    // Filter by sentiment
    if (filter !== 'all' && item.sentiment !== filter) return false;
    
    // Filter by search query
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !item.summary.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    // Filter by selected symbols
    if (selectedSymbols.length > 0 && !item.relatedSymbols.some(symbol => selectedSymbols.includes(symbol))) return false;
    
    return true;
  });

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <BarChart2 className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <Badge variant="destructive">High Impact</Badge>;
      case 'medium':
        return <Badge variant="default">Medium Impact</Badge>;
      default:
        return <Badge variant="outline">Low Impact</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const popularSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'SPY', 'QQQ'];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            Financial News & Sentiment
          </CardTitle>
          <div className="flex gap-2">
            <Input
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Tabs defaultValue="all" value={filter} onValueChange={setFilter}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All News</TabsTrigger>
              <TabsTrigger value="positive">Bullish</TabsTrigger>
              <TabsTrigger value="negative">Bearish</TabsTrigger>
              <TabsTrigger value="neutral">Neutral</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-sm font-medium py-1">Filter by symbol:</span>
            {popularSymbols.map(symbol => (
              <Badge
                key={symbol}
                variant={selectedSymbols.includes(symbol) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedSymbols(prev => 
                    prev.includes(symbol) 
                      ? prev.filter(s => s !== symbol)
                      : [...prev, symbol]
                  );
                }}
              >
                {symbol}
              </Badge>
            ))}
            {selectedSymbols.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedSymbols([])}
                className="text-xs"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Search className="w-8 h-8 mb-2" />
            <p>No news found matching your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNews.map(item => (
              <Card key={item.id} className="p-4 hover:bg-accent/10 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-start gap-2">
                    {getSentimentIcon(item.sentiment)}
                    <div>
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{item.summary}</p>
                    </div>
                  </div>
                  {getImpactBadge(item.impact)}
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{item.source}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{formatDate(item.publishedAt)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {item.relatedSymbols.map(symbol => (
                        <Badge key={symbol} variant="outline" className="text-xs">
                          {symbol}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={item.url} target="_blank" rel="noopener noreferrer">Read More</a>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsFeed; 