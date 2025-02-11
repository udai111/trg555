import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Home, LineChart, Activity, BarChart2, TrendingUp, Gem } from "lucide-react";

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

  return (
    <motion.aside 
      className="w-64 bg-primary text-white min-h-screen p-6"
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

      <div className="mt-auto pt-6 text-sm opacity-70">
        <p>Data provided for educational purposes only. Trading involves risk.</p>
      </div>
    </motion.aside>
  );
};

export default Sidebar;