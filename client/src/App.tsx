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
import IntradayProbabilityPage from "./pages/intraday-probability";
import CandlestickPatternsPage from "./pages/candlestick-patterns";
import NotFound from "@/pages/not-found";
import { Component, Suspense, useState, useEffect, ReactNode } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

// Error boundary for catching runtime errors
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('App Error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }): void {
    console.error('Error details:', error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h1>
          <p className="text-muted-foreground mb-4">Please try refreshing the page</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

function App(): JSX.Element {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add console log to track initialization
    console.log('App initializing...');
    const timer = setTimeout(() => {
      console.log('App initialized');
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Add base path handling for production
  const base = import.meta.env.PROD ? '/trgfin' : '';
  console.log('Using base path:', base);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <Router base={base}>
            <div className="min-h-screen bg-background flex flex-col">
              <div className="flex flex-1 relative overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto min-h-screen p-2 md:p-4 bg-background">
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
              <footer className="mt-auto border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex flex-col items-center gap-4 py-4 md:h-24 md:flex-row md:py-0">
                  <div className="flex flex-col items-center gap-4 px-4 md:flex-row md:gap-8 md:px-0">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                      Built by <span className="font-semibold">Tanuj Raj Gangwar</span>
                    </p>
                  </div>
                </div>
              </footer>
              <Toaster />
            </div>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;