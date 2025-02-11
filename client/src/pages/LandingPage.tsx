import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, TrendingUp, Brain, ChartBar, BookOpen, Trophy } from "lucide-react";
import { Link } from "wouter";

const LandingPage = () => {
  const features = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Real-Time Trading",
      description: "Experience real-time market simulation with live data and advanced charting"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI Predictions",
      description: "Get insights from our advanced ML models for smarter trading decisions"
    },
    {
      icon: <ChartBar className="w-6 h-6" />,
      title: "Professional Tools",
      description: "Access professional-grade trading tools and advanced market analysis"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Learn Trading",
      description: "Master trading with our comprehensive educational resources"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Master Trading with Our
            <span className="text-primary block">Advanced Market Simulator</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-muted-foreground mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Experience the thrill of trading with ₹10,00,000 virtual money. 
            Learn, practice, and master trading strategies without risking real money.
          </motion.p>
          <motion.div 
            className="space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href="/stock-market-game">
              <Button size="lg" className="px-8">
                Start Trading Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/ml-predictions">
              <Button size="lg" variant="outline" className="px-8">
                View AI Predictions
                <Brain className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <div className="text-primary mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <div className="inline-block p-4 bg-primary/10 rounded-full mb-6">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Trading Journey?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of traders who are mastering their skills with our advanced trading platform.
          </p>
          <Link href="/stock-market-game">
            <Button size="lg" className="px-8">
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
