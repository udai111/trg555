import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "styled-components";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import theme from "./theme";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import MLPrediction from "./components/MLPrediction";
import BacktestPanel from "./components/BacktestPanel";
import TradingViewSection from "./components/TradingViewSection";
import MarketAnalysis from "./components/MarketAnalysis";
import ProTrading from "./components/ProTrading";
import StockMarketGamePage from "./pages/StockMarketGamePage";
import IntradayProbabilityPage from "./pages/intraday-probability";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import { useEffect, useState } from "react";

function App() {
  const [showSidebar, setShowSidebar] = useState(true);

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

  // Check if user is authenticated
  const username = localStorage.getItem("username");

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <div className="min-h-screen bg-background flex flex-col">
          {!username ? (
            <div className="flex-1">
              <Switch>
                <Route path="/login" component={LoginPage} />
                <Route path="/" component={LandingPage} />
                <Route component={LandingPage} />
              </Switch>
            </div>
          ) : (
            <div className="flex flex-1">
              {showSidebar && <Sidebar />}
              <main className={`flex-1 p-4 bg-background ${!showSidebar ? 'w-full' : ''}`}>
                <Switch>
                  <Route path="/" component={Dashboard} />
                  <Route path="/pro-trading" component={ProTrading} />
                  <Route path="/stock-market-game" component={StockMarketGamePage} />
                  <Route path="/ml-predictions" component={MLPrediction} />
                  <Route path="/backtest" component={BacktestPanel} />
                  <Route path="/charts" component={TradingViewSection} />
                  <Route path="/market-analysis" component={MarketAnalysis} />
                  <Route path="/intraday-probability" component={IntradayProbabilityPage} />
                  <Route component={NotFound} />
                </Switch>
              </main>
            </div>
          )}

          {/* Professional Footer */}
          <footer className="mt-auto border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex flex-col items-center gap-4 py-6 md:h-24 md:flex-row md:py-0">
              <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-8 md:px-0">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                  This platform is for educational purposes only. Trading carries significant risks.
                  Please ensure you understand these risks before trading.
                </p>
              </div>
              <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-8 md:px-0">
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