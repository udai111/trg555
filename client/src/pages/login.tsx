import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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

    // Store username and create initial portfolio
    localStorage.setItem("username", username.trim());
    localStorage.setItem("portfolio", JSON.stringify({
      cash: 1000000, // ₹10,00,000 initial balance
      stocks: []
    }));

    setLocation("/");

    toast({
      title: "Welcome!",
      description: "Successfully logged in with ₹10,00,000 virtual currency"
    });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Market Chart Background */}
      <div className="absolute inset-0 z-0">
        <iframe
          className="h-full w-full"
          src="https://s3.tradingview.com/widgetembed/?frameElementId=tradingview_b3dd6&symbol=NSE%3ANIFTY&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC"
          allowTransparency={true}
          scrolling="no"
          frameBorder="0"
        />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      </div>

      {/* Login Form */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="p-8">
            <div className="mb-8 text-center">
              <img 
                src="/assets/logo.webp" 
                alt="TRG Logo" 
                className="mx-auto mb-6 h-16 w-auto"
              />
              <h1 className="text-3xl font-bold">Virtual Trading Platform</h1>
              <p className="mt-2 text-muted-foreground">
                Experience real market simulation with ₹10,00,000 virtual currency
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="h-12"
                />
              </div>

              <Button 
                className="w-full h-12 text-lg" 
                onClick={handleLogin}
                disabled={!username.trim()}
              >
                Start Trading
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  By continuing, you agree to our terms of service
                </p>
                <Button 
                  variant="link" 
                  onClick={() => setLocation("/")}
                  className="text-sm"
                >
                  Return to Landing Page
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}