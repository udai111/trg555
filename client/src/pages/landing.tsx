import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { SiTradingview } from "react-icons/si";
import { ChevronRight } from "lucide-react";

export default function LandingPage() {
  const [_, setLocation] = useLocation();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-accent">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-primary/5 rounded-full"
            style={{
              width: Math.random() * 300 + 50,
              height: Math.random() * 300 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, Math.random() + 0.5],
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <SiTradingview className="h-20 w-20 mb-4 text-primary mx-auto" />
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Virtual Trading Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience real-time market simulation with advanced trading features
            and comprehensive market analysis tools.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button
            size="lg"
            className="text-lg px-8"
            onClick={() => setLocation("/login")}
          >
            Enter Platform
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Real-Time Data</h3>
            <p className="text-muted-foreground">
              Access live market data and advanced charting tools
            </p>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Risk-Free Trading</h3>
            <p className="text-muted-foreground">
              Practice trading with virtual currency in a realistic environment
            </p>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Advanced Analysis</h3>
            <p className="text-muted-foreground">
              Utilize professional tools for market analysis and strategy development
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}