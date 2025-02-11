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
import CandlestickPatternsPage from "./pages/candlestick-patterns";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import { Component, useEffect, useState, Suspense } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

// Error Boundary Component
class ErrorBoundaryComponent extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-4">Please try refreshing the page</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Loading Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

function App() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const username = localStorage.getItem("username");

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user');
        const data = await response.json();
        if (!data.isAuthenticated && username) {
          localStorage.removeItem("username");
        } else if (data.isAuthenticated && !username) {
          localStorage.setItem("username", data.user.username);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [username]);

  useEffect(() => {
    const handleFullScreen = (event: CustomEvent) => {
      setShowSidebar(!event.detail.isFullScreen);
    };
    window.addEventListener('tradingview-fullscreen', handleFullScreen as EventListener);
    return () => {
      window.removeEventListener('tradingview-fullscreen', handleFullScreen as EventListener);
    };
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundaryComponent>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <div className="min-h-screen bg-background flex flex-col">
            {!username ? (
              <div className="flex-1">
                <Suspense fallback={<LoadingSpinner />}>
                  <Switch>
                    <Route path="/login" component={LoginPage} />
                    <Route path="/" component={LandingPage} />
                    <Route component={LandingPage} />
                  </Switch>
                </Suspense>
              </div>
            ) : (
              <div className="flex flex-1 relative overflow-hidden">
                {showSidebar && <Sidebar />}
                <main className={`flex-1 overflow-y-auto min-h-screen p-2 md:p-4 bg-background transition-all duration-200 ${!showSidebar ? 'w-full' : ''}`}>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Switch>
                      <Route path="/" component={Dashboard} />
                      <Route path="/pro-trading" component={ProTrading} />
                      <Route path="/stock-market-game" component={StockMarketGamePage} />
                      <Route path="/ml-predictions" component={MLPrediction} />
                      <Route path="/backtest" component={BacktestPanel} />
                      <Route path="/charts" component={TradingViewSection} />
                      <Route path="/market-analysis" component={MarketAnalysis} />
                      <Route path="/intraday-probability" component={IntradayProbabilityPage} />
                      <Route path="/candlestick-patterns" component={CandlestickPatternsPage} />
                      <Route component={NotFound} />
                    </Switch>
                  </Suspense>
                </main>
              </div>
            )}

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
    </ErrorBoundaryComponent>
  );
}

export default App;