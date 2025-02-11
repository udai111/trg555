import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Home, LineChart, Activity, BarChart2, TrendingUp, Gem, GamepadIcon, Sigma, CandlestickChart, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const NavLink = ({ href, children, isActive, onClick }: { 
  href: string; 
  children: React.ReactNode; 
  isActive: boolean;
  onClick?: () => void;
}) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className={`p-3 rounded-lg transition-colors ${
      isActive ? 'bg-accent text-white' : 'hover:bg-accent/20'
    }`}
    onClick={onClick}
  >
    <Link href={href}>
      <a className="flex items-center">
        {children}
      </a>
    </Link>
  </motion.div>
);

const Sidebar = () => {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const widgetContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (widgetContainer.current) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        "colorTheme": "dark",
        "dateRange": "12M",
        "showChart": true,
        "locale": "en",
        "largeChartUrl": "",
        "isTransparent": true,
        "showSymbolLogo": true,
        "showFloatingTooltip": false,
        "width": "100%",
        "height": "300",
        "plotLineColorGrowing": "rgba(41, 98, 255, 1)",
        "plotLineColorFalling": "rgba(41, 98, 255, 1)",
        "gridLineColor": "rgba(42, 46, 57, 0)",
        "scaleFontColor": "rgba(219, 219, 219, 1)",
        "tabs": [
          {
            "title": "Indices",
            "symbols": [
              {
                "s": "FOREXCOM:SPXUSD",
                "d": "S&P 500"
              },
              {
                "s": "FOREXCOM:NSXUSD",
                "d": "Nasdaq 100"
              }
            ]
          },
          {
            "title": "Forex",
            "symbols": [
              {
                "s": "FX:EURUSD",
                "d": "EUR/USD"
              },
              {
                "s": "FX:GBPUSD",
                "d": "GBP/USD"
              }
            ]
          }
        ]
      });

      widgetContainer.current.appendChild(script);
    }

    return () => {
      if (widgetContainer.current) {
        const script = widgetContainer.current.querySelector('script');
        if (script) {
          script.remove();
        }
      }
    };
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      <motion.aside 
        className={`fixed md:static top-0 left-0 z-40 w-64 bg-primary text-white h-screen md:h-screen flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } transition-transform duration-200 ease-in-out`}
        initial={false}
      >
        {/* Logo Section */}
        <div className="flex-shrink-0 p-6">
          <div className="flex flex-col items-center justify-center">
            <img 
              src="/assets/logo.webp" 
              alt="TRG Logo" 
              className="h-16 w-auto"
            />
            <p className="text-xs text-white/60 mt-2 text-center">
              Created by TRG for Gangwar's the market
            </p>
          </div>
        </div>

        {/* Navigation Links - Scrollable */}
        <nav className="flex-1 px-6 overflow-y-auto">
          <div className="space-y-2">
            <NavLink href="/" isActive={location === "/"} onClick={handleLinkClick}>
              <Home className="w-5 h-5 mr-3" />
              Home
            </NavLink>

            <NavLink href="/pro-trading" isActive={location === "/pro-trading"} onClick={handleLinkClick}>
              <Gem className="w-5 h-5 mr-3" />
              Pro Trading
            </NavLink>

            <NavLink href="/intraday-probability" isActive={location === "/intraday-probability"} onClick={handleLinkClick}>
              <Sigma className="w-5 h-5 mr-3" />
              Live Intraday Probability
            </NavLink>

            <NavLink href="/candlestick-patterns" isActive={location === "/candlestick-patterns"} onClick={handleLinkClick}>
              <CandlestickChart className="w-5 h-5 mr-3" />
              Candlestick Patterns
            </NavLink>

            <NavLink href="/stock-market-game" isActive={location === "/stock-market-game"} onClick={handleLinkClick}>
              <GamepadIcon className="w-5 h-5 mr-3" />
              Trading Game
            </NavLink>

            <NavLink href="/ml-predictions" isActive={location === "/ml-predictions"} onClick={handleLinkClick}>
              <Activity className="w-5 h-5 mr-3" />
              ML Predictions
            </NavLink>

            <NavLink href="/backtest" isActive={location === "/backtest"} onClick={handleLinkClick}>
              <BarChart2 className="w-5 h-5 mr-3" />
              Backtesting
            </NavLink>

            <NavLink href="/charts" isActive={location === "/charts"} onClick={handleLinkClick}>
              <LineChart className="w-5 h-5 mr-3" />
              Charts
            </NavLink>

            <NavLink href="/market-analysis" isActive={location === "/market-analysis"} onClick={handleLinkClick}>
              <TrendingUp className="w-5 h-5 mr-3" />
              Market Analysis
            </NavLink>
          </div>
        </nav>

        {/* Widget Section */}
        <div className="flex-shrink-0 p-6 border-t border-white/10">
          <div ref={widgetContainer} className="tradingview-widget-container">
            <div className="tradingview-widget-container__widget"></div>
          </div>
          <div className="mt-4 text-sm text-white/60">
            <p className="text-center">Data provided for educational purposes only. Trading involves risk.</p>
          </div>
        </div>
      </motion.aside>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;