import { useState } from "react";
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
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <img 
            src="/assets/logo.webp" 
            alt="TRG Logo" 
            className="mx-auto mb-2 h-16 w-auto"
          />
          <p className="text-xs text-muted-foreground/60 mb-4">
            Created by TRG for Gangwar's the market
          </p>
          <h1 className="text-2xl font-bold">Start Trading</h1>
          <p className="mt-2 text-muted-foreground">
            Enter a username to begin with ₹10,00,000 virtual currency
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Username</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
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

          <Button 
            variant="link" 
            onClick={() => setLocation("/")}
            className="w-full"
          >
            Return to Home
          </Button>
        </div>
      </Card>
    </div>
  );
}