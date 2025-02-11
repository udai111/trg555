import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { SiTradingview } from "react-icons/si";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = () => {
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }

    // Store user in localStorage
    const user = {
      username: username.trim(),
      wallet: 1000000,
      portfolio: {},
    };
    localStorage.setItem("stockGameUser", JSON.stringify(user));

    toast({
      title: "Welcome!",
      description: "You've been given ₹10,00,000 to start trading!",
    });

    setLocation("/game");
  };

  return (
    <div className="min-h-screen relative bg-background flex items-center justify-center">
      {/* TradingView Background */}
      <div className="absolute inset-0 opacity-10">
        <iframe
          src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
          className="w-full h-full"
          style={{ filter: "grayscale(1)" }}
        />
      </div>

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="w-[400px] p-6 backdrop-blur-sm bg-background/80">
          <div className="flex flex-col items-center mb-6">
            <SiTradingview className="h-12 w-12 text-primary mb-4" />
            <h1 className="text-2xl font-bold">Trading Platform</h1>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Username</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username to start trading"
                className="mt-1"
              />
            </div>
            <Button className="w-full" onClick={handleLogin}>
              Start Trading
            </Button>
          </div>

          <p className="mt-4 text-sm text-muted-foreground text-center">
            Enter any username to begin your trading journey
          </p>
        </Card>
      </motion.div>
    </div>
  );
}