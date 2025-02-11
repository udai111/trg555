import { Switch, Route, Router } from "wouter";
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
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import { useEffect, useState } from "react";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // Use null for initial state
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    // Check authentication status
    const username = localStorage.getItem("username");
    setIsAuthenticated(!!username);
  }, []);

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

  // Show nothing while checking authentication
  if (isAuthenticated === null) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <Router>
          <div className="min-h-screen bg-background">
            {!isAuthenticated ? (
              // Public routes
              <Switch>
                <Route path="/login">
                  <LoginPage />
                </Route>
                <Route>
                  <LandingPage />
                </Route>
              </Switch>
            ) : (
              // Protected routes
              <div className="flex min-h-screen">
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
                    <Route component={NotFound} />
                  </Switch>
                </main>
              </div>
            )}
          </div>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;