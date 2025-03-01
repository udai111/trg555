import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Home, LineChart, Activity, BarChart2, TrendingUp, Gem, GamepadIcon, Sigma, CandlestickChart, Menu, X, Zap, Gamepad2, History, BrainCircuit, Wand2 } from "lucide-react";
import { useState } from "react";
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
      isActive ? 'bg-accent text-white' : 'hover:bg-accent/20 text-white'
    }`}
    onClick={onClick}
  >
    <Link href={href} className="flex items-center">
      {children}
    </Link>
  </motion.div>
);

const Sidebar = () => {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const menuItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/pro-trading', label: 'Pro Trading', icon: LineChart },
    { path: '/ml-predictions', label: 'ML Predictions', icon: BrainCircuit },
    { path: '/ml-prediction', label: 'Advanced ML', icon: BrainCircuit },
    { path: '/indian-stocks', label: 'Indian Stocks', icon: TrendingUp },
    { path: '/quantum-trading', label: 'Quantum Trading', icon: Zap },
    { path: '/trading-game', label: 'Trading Game', icon: Gamepad2 },
    { path: '/market-analysis', label: 'Market Analysis', icon: BarChart2 },
    { path: '/candlestick-patterns', label: 'Candlestick Patterns', icon: CandlestickChart },
    { path: '/intraday-probability', label: 'Intraday Probability', icon: Activity },
    { path: '/charts', label: 'Charts', icon: LineChart },
    { path: '/backtesting', label: 'Backtesting', icon: History },
    { path: '/strategy', label: 'Strategy', icon: Wand2 },
  ];

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
        className={`fixed md:static top-0 left-0 z-40 w-64 bg-slate-800 text-white h-screen md:h-screen flex flex-col ${
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
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <NavLink key={item.path} href={item.path} isActive={isActive} onClick={handleLinkClick}>
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Footer Section */}
        <div className="flex-shrink-0 p-6 border-t border-white/10">
          <div className="text-sm text-white/60">
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