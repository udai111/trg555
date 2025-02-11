import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowRight, User } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = () => {
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900 to-black" />

      <Card className="w-full max-w-md p-8 relative z-10 bg-black/50 backdrop-blur border-t border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Trading Platform</h1>
          <p className="text-gray-400">Enter username to start trading</p>
        </div>

        <div className="space-y-6">
          <div>
            <Label className="text-white">Username</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-gray-500"
            />
          </div>

          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            onClick={handleLogin}
            disabled={!username.trim()}
          >
            Start Trading
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="text-center text-sm text-gray-400">
            Start with ₹10,00,000 virtual currency
          </p>
        </div>
      </Card>
    </div>
  );
}