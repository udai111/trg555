import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper, ExternalLink } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  timestamp: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export function NewsFeed({ symbol = 'DEMO' }: { symbol?: string }) {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    if (symbol === 'DEMO') {
      // Mock news data for demo mode
      const mockNews: NewsItem[] = [
        {
          id: '1',
          title: 'Markets Rally on Economic Data',
          summary: 'Stock markets surged today following better-than-expected economic data, with major indices reaching new highs.',
          source: 'Market News',
          url: '#',
          timestamp: new Date().toISOString(),
          sentiment: 'positive'
        },
        {
          id: '2',
          title: 'Central Bank Signals Rate Hold',
          summary: 'The central bank indicated it would maintain current interest rates, citing stable inflation and employment figures.',
          source: 'Financial Times',
          url: '#',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          sentiment: 'neutral'
        },
        {
          id: '3',
          title: 'Tech Sector Faces Headwinds',
          summary: 'Technology stocks experienced volatility as concerns about regulatory challenges and valuation pressures mounted.',
          source: 'Tech Daily',
          url: '#',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          sentiment: 'negative'
        }
      ];
      setNews(mockNews);
    } else {
      const fetchNews = async () => {
        try {
          const response = await fetch(`http://localhost:5051/api/news/${symbol}`);
          const data = await response.json();
          setNews(data);
        } catch (error) {
          console.error('Error fetching news:', error);
        }
      };

      fetchNews();
      const interval = setInterval(fetchNews, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [symbol]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="w-5 h-5" />
          Market News {symbol !== 'DEMO' && symbol && `- ${symbol}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {news.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No news available{symbol !== 'DEMO' && symbol && ` for ${symbol}`}
            </div>
          ) : (
            news.map(item => (
              <div
                key={item.id}
                className="p-3 rounded-lg bg-accent/10 hover:bg-accent/20 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{item.title}</h3>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{item.summary}</p>
                <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                  <span>{item.source}</span>
                  <span>{new Date(item.timestamp).toLocaleString()}</span>
                </div>
                <div className={`text-xs mt-1 ${
                  item.sentiment === 'positive' ? 'text-green-500' :
                  item.sentiment === 'negative' ? 'text-red-500' :
                  'text-yellow-500'
                }`}>
                  Sentiment: {item.sentiment}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
} 