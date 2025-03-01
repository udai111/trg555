import React, { useState, useEffect } from 'react';
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "styled-components";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import theme from "./theme";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import MLPredictionsPage from "./pages/ml-predictions";
import MLPrediction from "./components/MLPrediction";
import BacktestPanel from "./components/BacktestPanel";
import TradingViewSection from "./components/TradingViewSection";
import MarketAnalysis from "./components/MarketAnalysis";
import ProTrading from "./components/ProTrading";
import StockMarketGame from "@/components/StockMarketGame";
import IntradayProbabilityPage from "./pages/intraday-probability";
import CandlestickPatternsPage from "./pages/candlestick-patterns";
import QuantumTradingPage from "./pages/quantum-trading";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import BacktestingPage from "@/pages/backtesting";
import { Charts } from "@/components/Charts";
import { StrategyMaker } from '@/components/StrategyMaker';
import IndianStocksPage from "@/pages/indian-stocks";

function App() {
  const [showSidebar, setShowSidebar] = useState(true);
  const username = localStorage.getItem("username");
  const [location, setLocation] = useLocation();

  // Redirect unauthenticated users to login if they're not on the landing page
  useEffect(() => {
    if (!username && location !== "/" && location !== "/login") {
      setLocation("/login");
    }
  }, [username, location, setLocation]);

  // Listen for fullscreen events from TradingView component
  useEffect(() => {
    const handleFullScreen = (event: CustomEvent) => {
      setShowSidebar(!event.detail.isFullScreen);
    };
    window.addEventListener('tradingview-fullscreen', handleFullScreen as EventListener);
    return () => {
      window.removeEventListener('tradingview-fullscreen', handleFullScreen as EventListener);
    };
  }, []);

  const handleStrategyChange = (strategy: any) => {
    console.log('Strategy updated:', strategy);
  };

  const handleBacktest = (params: any) => {
    console.log('Running backtest with params:', params);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <div className="min-h-screen bg-background flex flex-col">
          {!username ? (
            <div className="flex-1">
              <Switch>
                <Route path="/login" component={LoginPage} />
                <Route path="/" component={LandingPage} />
                <Route path="/:rest*" component={() => {
                  setLocation("/login");
                  return null;
                }} />
              </Switch>
            </div>
          ) : (
            <div className="flex flex-1 relative overflow-hidden">
              {showSidebar && <Sidebar />}
              <main className={`flex-1 overflow-y-auto min-h-screen p-2 md:p-4 bg-background transition-all duration-200 ${!showSidebar ? 'w-full' : ''}`}>
                <Switch>
                  <Route path="/" component={Home} />
                  <Route path="/pro-trading" component={ProTrading} />
                  <Route path="/ml-predictions" component={MLPredictionsPage} />
                  <Route path="/ml-prediction" component={MLPrediction} />
                  <Route path="/quantum-trading" component={QuantumTradingPage} />
                  <Route path="/trading-game" component={StockMarketGame} />
                  <Route path="/market-analysis" component={MarketAnalysis} />
                  <Route path="/candlestick-patterns" component={CandlestickPatternsPage} />
                  <Route path="/intraday-probability" component={IntradayProbabilityPage} />
                  <Route path="/backtesting" component={BacktestingPage} />
                  <Route path="/strategy" component={StrategyMaker} />
                  <Route path="/charts" component={Charts} />
                  <Route path="/indian-stocks" component={IndianStocksPage} />
                  <Route component={NotFound} />
                </Switch>
              </main>
            </div>
          )}

          {/* Footer with responsive padding */}
          <footer className="mt-auto border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex flex-col items-center gap-4 py-4 md:h-24 md:flex-row md:py-0">
              <div className="flex flex-col items-center gap-4 px-4 md:flex-row md:gap-8 md:px-0">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                  This platform is for educational purposes only. Trading carries significant risks.
                  Please ensure you understand these risks before trading.
                </p>
              </div>
              <div className="flex flex-col items-center gap-4 px-4 md:flex-row md:gap-8 md:px-0">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                  Not a registered broker. Market data may be delayed. 
                  Created with ❤️ by <span className="font-semibold">Tanuj Raj Gangwar</span>
                </p>
              </div>
            </div>
          </footer>

          <Toaster />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;