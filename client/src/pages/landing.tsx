import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const [_, setLocation] = useLocation();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-background to-background/80">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-primary/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 2, 1],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="mb-6 text-5xl font-bold tracking-tight">
            Virtual Trading Platform
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Experience real-time market simulation with advanced trading features
          </p>
          <Button
            size="lg"
            className="text-lg"
            onClick={() => setLocation("/login")}
          >
            Enter Platform
          </Button>
        </motion.div>

        {/* Market tickers */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-10 left-0 right-0 overflow-hidden"
        >
          <div className="flex animate-scroll-x justify-start gap-8 whitespace-nowrap px-4">
            {[
              { symbol: "RELIANCE", price: "2467.85", change: "+2.5%" },
              { symbol: "TCS", price: "3890.45", change: "-1.2%" },
              { symbol: "HDFC", price: "1678.30", change: "+1.8%" },
              { symbol: "INFY", price: "1567.90", change: "-0.5%" },
              { symbol: "BTC", price: "48567.90", change: "+4.2%" },
              { symbol: "ETH", price: "2789.45", change: "+3.1%" },
            ].map((ticker) => (
              <div
                key={ticker.symbol}
                className="flex items-center gap-2 font-mono text-sm"
              >
                <span className="font-medium">{ticker.symbol}</span>
                <span>₹{ticker.price}</span>
                <span
                  className={
                    ticker.change.startsWith("+")
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {ticker.change}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}