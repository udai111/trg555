import React, { useEffect, useRef, memo } from 'react';
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart2 } from "lucide-react";

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
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Advanced Market Analysis</h2>

      {/* TradingView Chart Card */}
      <Card className="p-6 mb-6">
        <div className="h-[600px] w-full">
          <TradingViewWidget />
        </div>
      </Card>

      {/* Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="card"
        >
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
              <div className="flex justify-between items-center">
                <span>Bollinger Bands</span>
                <span className="font-medium">Upper Band Test</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Volume Profile</span>
                <span className="font-medium text-yellow-500">High Activity</span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="card"
        >
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
              <div className="flex justify-between items-center">
                <span>Options Flow</span>
                <span className="font-medium text-green-500">Bullish</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Put/Call Ratio</span>
                <span className="font-medium">0.75</span>
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