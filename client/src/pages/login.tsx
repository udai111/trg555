import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
      {/* Background Image with Gradient */}
      <div 
        className="absolute inset-0 z-0" 
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.4)), url('/caption.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.8)'
        }}
      />

      {/* Animated Gradient Background */}
      <div 
        className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900/30 to-purple-900/30"
        style={{
          mixBlendMode: 'overlay'
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-8 bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">TR</span>
                </div>
              </motion.div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Trading Platform
              </h1>
              <p className="mt-2 text-gray-400">Enter your username to begin trading</p>
            </div>

            {/* Login Form */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label className="text-gray-200">Username</Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-500 transition-colors"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300" 
                onClick={handleLogin}
                disabled={!username.trim()}
              >
                Start Trading
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="space-y-4 text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-black/40 text-gray-500">Trading Features</span>
                  </div>
                </div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-gray-400 space-y-2"
                >
                  <p>• Start with ₹10,00,000 virtual currency</p>
                  <p>• Real-time market simulation</p>
                  <p>• Advanced trading tools</p>
                </motion.div>
              </div>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}