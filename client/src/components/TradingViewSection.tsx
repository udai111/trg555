import React, { useEffect, useRef, memo } from 'react';
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart2, Maximize2, Minimize2 } from "lucide-react";

const TradingViewWidget = memo(() => {
  const container = useRef();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "NASDAQ:AAPL",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "withdateranges": true,
        "range": "YTD",
        "hide_side_toolbar": false,
        "allow_symbol_change": true,
        "details": true,
        "hotlist": true,
        "calendar": false,
        "show_popup_button": true,
        "popup_width": "1000",
        "popup_height": "650",
        "support_host": "https://www.tradingview.com"
      }`;
    container.current.appendChild(script);
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
});

const TradingViewSection = () => {
  const [isFullScreen, setIsFullScreen] = React.useState(false);

  // Add event listener for escape key to exit full screen
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  // Tell parent component about fullscreen state changes
  useEffect(() => {
    const event = new CustomEvent('tradingview-fullscreen', { detail: { isFullScreen } });
    window.dispatchEvent(event);
  }, [isFullScreen]);

  if (isFullScreen) {
    return (
      <div className="fixed inset-0 bg-background z-50">
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullScreen(false)}
            className="hover:bg-accent"
          >
            <Minimize2 className="h-5 w-5" />
          </Button>
        </div>
        <div className="h-screen w-screen">
          <TradingViewWidget />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Advanced Market Analysis</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsFullScreen(true)}
          className="hover:bg-accent"
        >
          <Maximize2 className="h-5 w-5" />
        </Button>
      </div>

      <Card className="p-6 mb-6">
        <div className="h-[600px] w-full">
          <TradingViewWidget />
        </div>
      </Card>

      {/* Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} className="card">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-2">Technical Analysis</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>RSI (14)</span>
                <span className="font-medium">65.2</span>
              </div>
              <div className="flex justify-between items-center">
                <span>MACD</span>
                <span className="font-medium text-green-500">Bullish</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Moving Averages</span>
                <span className="font-medium text-green-500">Strong Buy</span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="card">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-2">Market Sentiment</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Fear & Greed Index</span>
                <span className="font-medium text-yellow-500">65 - Greed</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Volatility</span>
                <span className="font-medium">Medium</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Trend Strength</span>
                <span className="font-medium text-green-500">Strong</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
      {/* Trading Signals */}
      <Card className="p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Trading Signals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-background">
            <Label>Support Levels</Label>
            <div className="text-lg font-semibold text-red-500">$152.30</div>
            <div className="text-sm text-muted-foreground">Strong support</div>
          </div>
          <div className="p-4 rounded-lg bg-background">
            <Label>Resistance Levels</Label>
            <div className="text-lg font-semibold text-green-500">$158.45</div>
            <div className="text-sm text-muted-foreground">Key resistance</div>
          </div>
          <div className="p-4 rounded-lg bg-background">
            <Label>Trend Direction</Label>
            <div className="text-lg font-semibold text-green-500">Uptrend</div>
            <div className="text-sm text-muted-foreground">Higher highs & lows</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TradingViewSection;