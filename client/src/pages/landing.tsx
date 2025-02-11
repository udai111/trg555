import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, LineChart, Shield, Trophy } from "lucide-react";

export default function LandingPage() {
  const [_, setLocation] = useLocation();

  const features = [
    {
      icon: <LineChart className="h-6 w-6" />,
      title: "Real-Time Trading",
      description: "Experience live market conditions with real-time data and charts"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Risk-Free Learning",
      description: "Practice trading with ₹10,00,000 virtual currency"
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: "Trading Competition",
      description: "Compete with other traders and learn from the best"
    }
  ];

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

      {/* Hero Section */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl"
        >
          <img 
            src="/assets/logo.webp" 
            alt="TRG Logo" 
            className="mx-auto mb-8 h-20 w-auto"
          />
          <h1 className="mb-6 text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Virtual Trading Platform
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Master the art of trading with our advanced market simulation platform
          </p>
          <Button
            size="lg"
            className="text-lg group"
            onClick={() => setLocation("/login")}
          >
            Start Trading Now
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl px-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-colors"
            >
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
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
              { symbol: "NIFTY", price: "21,782.50", change: "+1.2%" },
              { symbol: "SENSEX", price: "71,595.49", change: "+1.1%" },
              { symbol: "RELIANCE", price: "2467.85", change: "+2.5%" },
              { symbol: "TCS", price: "3890.45", change: "-1.2%" },
              { symbol: "HDFC", price: "1678.30", change: "+1.8%" },
              { symbol: "INFY", price: "1567.90", change: "-0.5%" }
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