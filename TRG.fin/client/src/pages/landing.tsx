import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LineChart, Shield, Trophy, Zap, Brain, Activity, BarChart2, Globe } from "lucide-react";

const FeatureCard = ({ icon: Icon, title, description, delay }: {
  icon: any;
  title: string;
  description: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300"
  >
    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </motion.div>
);

const StatsCard = ({ value, label, delay }: {
  value: string;
  label: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5 }}
    className="text-center"
  >
    <div className="text-3xl font-bold text-primary mb-1">{value}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </motion.div>
);

export default function LandingPage() {
  const [_, setLocation] = useLocation();

  const features = [
    {
      icon: LineChart,
      title: "Advanced Trading Interface",
      description: "Professional-grade trading platform with real-time market data and advanced charting"
    },
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Machine learning algorithms for market prediction and pattern recognition"
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Comprehensive tools for position sizing and risk assessment"
    },
    {
      icon: Activity,
      title: "Live Market Analysis",
      description: "Real-time market sentiment analysis and trading signals"
    },
    {
      icon: Zap,
      title: "Quantum Trading",
      description: "Next-generation quantum computing algorithms for market prediction"
    },
    {
      icon: Trophy,
      title: "Trading Competition",
      description: "Compete with other traders in real-time trading competitions"
    },
    {
      icon: BarChart2,
      title: "Advanced Backtesting",
      description: "Test your strategies against historical market data"
    },
    {
      icon: Globe,
      title: "Global Markets",
      description: "Access to multiple markets and asset classes worldwide"
    }
  ];

  const stats = [
    { value: "99.9%", label: "Platform Uptime" },
    { value: "50ms", label: "Average Latency" },
    { value: "100K+", label: "Active Traders" },
    { value: "₹1T+", label: "Trading Volume" }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] [mask-image:radial-gradient(white,transparent_90%)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <img 
              src="/assets/logo.webp" 
              alt="TRG Logo" 
              className="mx-auto mb-6 h-24 w-auto"
            />
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50 mb-6">
              Next-Gen Trading Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience the future of trading with AI-powered analysis, quantum computing algorithms, and professional-grade tools.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90"
                onClick={() => setLocation("/login")}
              >
                Start Trading Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.open("https://docs.trg.fin", "_blank")}
              >
                View Documentation
              </Button>
            </div>
          </motion.div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <StatsCard
                key={stat.label}
                value={stat.value}
                label={stat.label}
                delay={0.2 + index * 0.1}
              />
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={0.4 + index * 0.1}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About TRG.fin</h3>
              <p className="text-muted-foreground">
                Created by TRG for Gangwar's the market. Our platform combines cutting-edge technology
                with professional trading tools to provide the best trading experience.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Important Notice</h3>
              <p className="text-muted-foreground">
                Trading involves substantial risk. This platform is for educational purposes only.
                Always understand the risks before trading.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}