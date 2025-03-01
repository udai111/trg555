import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  sentiment: "positive" | "negative" | "neutral";
  url: string;
}

export interface NewsPanelProps {
  symbol: string;
}

export const NewsPanel = ({ symbol }: NewsPanelProps) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await apiService.news.getStockNews(symbol);
        setNews(response);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [symbol]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-500";
      case "negative":
        return "text-red-500";
      default:
        return "text-yellow-500";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Latest News</h3>
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">Loading news...</div>
        ) : news.length === 0 ? (
          <div className="text-center py-4">No news available</div>
        ) : (
          news.map((item) => (
            <div key={item.id} className="border-b last:border-0 pb-4 last:pb-0">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-medium hover:text-primary cursor-pointer">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.title}
                  </a>
                </h4>
                <span className={`text-xs font-medium ${getSentimentColor(item.sentiment)}`}>
                  {item.sentiment}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{item.source}</span>
                <span>{formatTimestamp(item.timestamp)}</span>
              </div>
            </div>
          ))
        )}
      </div>
      <Button variant="outline" className="w-full mt-4" onClick={() => window.open(`https://www.google.com/search?q=${symbol}+stock+news`, '_blank')}>
        View More News
      </Button>
    </Card>
  );
}; 