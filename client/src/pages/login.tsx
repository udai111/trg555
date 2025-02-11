import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Predefined valid usernames
const VALID_USERNAMES = [
  'trader123',
  'investor456',
  'market789',
  'stock101',
  'crypto202'
];

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

    // Check if username is valid
    if (!VALID_USERNAMES.includes(username.trim())) {
      toast({
        title: "Invalid Username",
        description: "Please use one of the following usernames: trader123, investor456, market789, stock101, crypto202",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem("username", username.trim());
    setLocation("/");

    toast({
      title: "Success",
      description: "Welcome to the Trading Platform!"
    });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* TradingView Background */}
      <div className="absolute inset-0 z-0">
        <iframe
          className="h-full w-full"
          src="https://ssltvc.investing.com/?pair_ID=160&height=100%&width=100%&interval=300&plotStyle=area&domain_ID=56&lang_ID=56&timezone_ID=20"
          frameBorder="0"
          allowTransparency={true}
          scrolling="no"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      </div>

      {/* Login Form */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-[400px] p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Virtual Trading Platform</h1>
              <p className="text-sm text-muted-foreground">
                Enter one of the valid usernames to start trading
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Username</Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username: e.g. trader123"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleLogin}
                disabled={!username.trim()}
              >
                Start Trading
              </Button>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="text-center">Valid usernames:</p>
                <ul className="list-disc pl-6">
                  {VALID_USERNAMES.map(user => (
                    <li key={user}>{user}</li>
                  ))}
                </ul>
                <p className="text-center mt-4">
                  ₹10,00,000 virtual currency will be credited to your account
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}