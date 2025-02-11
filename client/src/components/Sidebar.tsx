import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Home, LineChart, Activity, BarChart2, TrendingUp, Gem, GamepadIcon } from "lucide-react";
import { useEffect, useRef } from "react";

const NavLink = ({ href, children, isActive }: { href: string; children: React.ReactNode; isActive: boolean }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className={`p-3 rounded-lg transition-colors ${
      isActive ? 'bg-accent text-white' : 'hover:bg-accent/20'
    }`}
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
        "height": "400",
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

  return (
    <motion.aside 
      className="w-64 bg-primary text-white min-h-screen p-6 flex flex-col"
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 60 }}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-accent">Pro Trader</h1>
      </div>

      <nav className="space-y-2">
        <NavLink href="/" isActive={location === "/"}>
          <Home className="w-5 h-5 mr-3" />
          Home
        </NavLink>

        <NavLink href="/pro-trading" isActive={location === "/pro-trading"}>
          <Gem className="w-5 h-5 mr-3" />
          Pro Trading
        </NavLink>

        <NavLink href="/stock-market-game" isActive={location === "/stock-market-game"}>
          <GamepadIcon className="w-5 h-5 mr-3" />
          Trading Game
        </NavLink>

        <NavLink href="/ml-predictions" isActive={location === "/ml-predictions"}>
          <Activity className="w-5 h-5 mr-3" />
          ML Predictions
        </NavLink>

        <NavLink href="/backtest" isActive={location === "/backtest"}>
          <BarChart2 className="w-5 h-5 mr-3" />
          Backtesting
        </NavLink>

        <NavLink href="/charts" isActive={location === "/charts"}>
          <LineChart className="w-5 h-5 mr-3" />
          Charts
        </NavLink>

        <NavLink href="/market-analysis" isActive={location === "/market-analysis"}>
          <TrendingUp className="w-5 h-5 mr-3" />
          Market Analysis
        </NavLink>
      </nav>

      <div className="mt-4 flex-grow">
        <div ref={widgetContainer} className="tradingview-widget-container">
          <div className="tradingview-widget-container__widget"></div>
        </div>
      </div>

      <div className="mt-4 text-sm opacity-70">
        <p>Data provided for educational purposes only. Trading involves risk.</p>
      </div>
    </motion.aside>
  );
};

export default Sidebar;