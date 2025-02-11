import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

declare global {
  interface Window {
    TradingView: any;
  }
}

const TradingViewSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (containerRef.current && window.TradingView) {
        new window.TradingView.widget({
          container_id: "trading-view-chart",
          width: "100%",
          height: "600",
          symbol: "NASDAQ:AAPL",
          interval: "D",
          timezone: "exchange",
          theme: "dark",
          style: "1",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          studies: [
            "MASimple@tv-basicstudies",
            "RSI@tv-basicstudies",
            "MACD@tv-basicstudies"
          ]
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Market Analysis</h2>
      
      <Card className="p-6">
        <div 
          id="trading-view-chart"
          ref={containerRef}
          className="w-full rounded-lg overflow-hidden"
        />
      </Card>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Market Overview</h3>
          <p className="text-sm text-muted-foreground">
            Advanced charting with technical indicators, drawing tools, and multiple timeframes.
          </p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Trading Volume</h3>
          <p className="text-sm text-muted-foreground">
            Monitor market activity and liquidity through volume analysis.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default TradingViewSection;
