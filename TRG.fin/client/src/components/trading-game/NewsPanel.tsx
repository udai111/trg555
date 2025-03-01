import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ExternalLink } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: number;
  url?: string;
  source?: string;
}

interface NewsPanelProps {
  news: NewsItem[];
  showNews: boolean;
  onToggleNews: () => void;
}

export function NewsPanel({ news, showNews, onToggleNews }: NewsPanelProps) {
  const getImpactColor = (impact: NewsItem['impact']) => {
    switch (impact) {
      case 'HIGH':
        return 'bg-red-500 hover:bg-red-600';
      case 'MEDIUM':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'LOW':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Market News</CardTitle>
        <Button variant="ghost" size="sm" onClick={onToggleNews}>
          <ChevronDown className={`h-4 w-4 transform ${showNews ? 'rotate-180' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {showNews && (
          <div className="space-y-4">
            {news.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent news</p>
            ) : (
              news.map(item => (
                <div
                  key={item.id}
                  className="space-y-2 pb-3 border-b last:border-0 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatTimestamp(item.timestamp)}</span>
                        {item.source && (
                          <span>• {item.source}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getImpactColor(item.impact)}>
                        {item.impact}
                      </Badge>
                      {item.url && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => window.open(item.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 