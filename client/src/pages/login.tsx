import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, User, Lock, BarChart2, Shield, Zap } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem("username", username.trim());
    localStorage.setItem("portfolio", JSON.stringify({
      cash: 1000000,
      stocks: []
    }));

    setLocation("/");

    toast({
      title: "Welcome!",
      description: "Successfully logged in with ₹10,00,000 virtual currency"
    });
  };

  const features = [
    {
      icon: <BarChart2 className="h-5 w-5" />,
      title: "Real-time Trading",
      description: "Experience live market simulation"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Risk-Free Learning",
      description: "Practice with virtual currency"
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Advanced Tools",
      description: "Access professional trading features"
    }
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: '#1a1b1e',
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('/caption.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />

      <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 backdrop-blur-sm bg-white/10 border-t border-white/20">
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center mb-6">
                <motion.div
                  initial={{ rotate: -180, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="p-3 rounded-full bg-white/10"
                >
                  <Lock className="h-12 w-12 text-white" />
                </motion.div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome to Trading Platform</h1>
              <p className="text-sm text-gray-300">
                Begin your journey in the world of trading
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label className="text-white flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Username
                </Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 hover:bg-white/20 transition-colors"
                />
              </div>

              <div className="space-y-4">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 transition-all" 
                  onClick={handleLogin}
                  disabled={!username.trim()}
                >
                  <span>Start Trading</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <p className="text-center text-sm text-gray-300">
                  Begin with ₹10,00,000 virtual currency
                </p>
              </div>
            </motion.div>
          </Card>
        </motion.div>

        {/* Right side - Features */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-white space-y-8 hidden md:block"
        >
          <div className="space-y-4">
            <h2 className="text-4xl font-bold">Experience the Future of Trading</h2>
            <p className="text-gray-300 text-lg">
              Master the markets with our advanced trading simulator
            </p>
          </div>

          <div className="grid gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="p-2 rounded-full bg-blue-600/20">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="pt-8">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 border-2 border-white/20"
                  />
                ))}
              </div>
              <p className="text-sm text-gray-300">
                Join 10,000+ traders already using our platform
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}