import { Switch, Route, Router } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "styled-components";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import theme from "./theme";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import MLPrediction from "./components/MLPrediction";
import BacktestPanel from "./components/BacktestPanel";
import TradingViewSection from "./components/TradingViewSection";
import MarketAnalysis from "./components/MarketAnalysis";
import ProTrading from "./components/ProTrading";
import StockMarketGamePage from "./pages/StockMarketGamePage";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";

function MainContent() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [isLandingPage, setIsLandingPage] = useState(true);

  // Listen for route changes to determine if we're on landing page
  const handleRouteChange = () => {
    setIsLandingPage(window.location.pathname === "/");
  };

  useEffect(() => {
    handleRouteChange();
    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
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

  return (
    <div className="flex min-h-screen">
      {!isLandingPage && showSidebar && <Sidebar />}
      <main className={`flex-1 ${!showSidebar ? 'w-full' : ''} ${isLandingPage ? 'p-0' : 'p-4'} bg-background`}>
        <Switch>
          <Route path="/" component={LandingPage} />
          <Route path="/dashboard" component={Dashboard} />
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
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <Router>
          <MainContent />
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;