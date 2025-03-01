import axios from 'axios';

interface NewsItem {
  id: string;
  title: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: number;
  url?: string;
  source?: string;
}

// Function to determine news impact based on keywords and sentiment
const determineImpact = (title: string): 'HIGH' | 'MEDIUM' | 'LOW' => {
  const highImpactKeywords = [
    'crash', 'surge', 'plunge', 'soar', 'bankruptcy',
    'acquisition', 'merger', 'scandal', 'investigation',
    'profit warning', 'earnings beat', 'guidance raised'
  ];

  const mediumImpactKeywords = [
    'rise', 'fall', 'increase', 'decrease', 'partnership',
    'contract', 'launch', 'expansion', 'restructuring',
    'analyst upgrade', 'analyst downgrade'
  ];

  const titleLower = title.toLowerCase();
  
  if (highImpactKeywords.some(keyword => titleLower.includes(keyword))) {
    return 'HIGH';
  }
  
  if (mediumImpactKeywords.some(keyword => titleLower.includes(keyword))) {
    return 'MEDIUM';
  }
  
  return 'LOW';
};

export const fetchLatestNews = async (symbol: string): Promise<NewsItem[]> => {
  try {
    // Remove .NS suffix for news search
    const cleanSymbol = symbol.replace('.NS', '');
    
    // Fetch news from multiple sources
    const [yahooNews, googleNews] = await Promise.all([
      // Yahoo Finance News API
      axios.get(`https://query1.finance.yahoo.com/v1/news/list?symbol=${cleanSymbol}`),
      // Note: Replace with your actual news API endpoints and keys
      axios.get(`https://newsapi.org/v2/everything?q=${cleanSymbol}+stock+NSE&language=en&sortBy=publishedAt&apiKey=YOUR_API_KEY`)
    ]);

    const news: NewsItem[] = [];

    // Process Yahoo Finance news
    if (yahooNews.data?.items?.result) {
      yahooNews.data.items.result.forEach((item: any) => {
        news.push({
          id: item.uuid,
          title: item.title,
          impact: determineImpact(item.title),
          timestamp: new Date(item.published_at).getTime(),
          url: item.link,
          source: 'Yahoo Finance'
        });
      });
    }

    // Process Google News
    if (googleNews.data?.articles) {
      googleNews.data.articles.forEach((article: any) => {
        news.push({
          id: article.url,
          title: article.title,
          impact: determineImpact(article.title),
          timestamp: new Date(article.publishedAt).getTime(),
          url: article.url,
          source: article.source.name
        });
      });
    }

    // Sort by timestamp (newest first) and take latest 10
    return news
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);

  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};

// Simulate news for development/fallback
export const generateSimulatedNews = (symbol: string): NewsItem => {
  const newsTypes = [
    { title: `${symbol} shows strong momentum`, impact: 'HIGH' },
    { title: `${symbol} trading volume surges`, impact: 'MEDIUM' },
    { title: `New support level for ${symbol}`, impact: 'LOW' },
    { title: `${symbol} breaks resistance`, impact: 'MEDIUM' },
    { title: `Market sentiment shifts for ${symbol}`, impact: 'HIGH' }
  ];

  const newsItem = newsTypes[Math.floor(Math.random() * newsTypes.length)];
  
  return {
    id: Date.now().toString(),
    title: newsItem.title,
    impact: newsItem.impact as 'HIGH' | 'MEDIUM' | 'LOW',
    timestamp: Date.now()
  };
}; 