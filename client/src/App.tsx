import { Switch, Route, Router } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "./components/Sidebar";
import StockMarketGamePage from "./pages/StockMarketGamePage";
import LandingPage from "./pages/landing";
import LoginPage from "./pages/login";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";

function MainContent() {
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

  return (
    <div className="flex min-h-screen">
      {showSidebar && <Sidebar />}
      <main className={`flex-1 bg-background ${!showSidebar ? 'w-full' : ''}`}>
        <Switch>
          <Route path="/" component={LandingPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/game" component={StockMarketGamePage} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <MainContent />
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;