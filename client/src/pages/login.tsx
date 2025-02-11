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
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/attached_assets/caption.jpg')`,
        backgroundAttachment: 'fixed'
      }}
    >
      <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur-sm shadow-2xl">
        <div className="text-center mb-8">
          <img 
            src="/assets/logo.webp" 
            alt="TRG Logo" 
            className="mx-auto mb-2 h-16 w-auto"
          />
          <p className="text-xs text-muted-foreground/60 mb-4">
            Created by TRG for Gangwar's the market
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Start Trading</h1>
          <p className="mt-2 text-muted-foreground">
            Enter a username to begin with ₹10,00,000 virtual currency
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-700">Username</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="border-gray-300 focus:border-blue-500"
            />
          </div>

          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors" 
            onClick={handleLogin}
            disabled={!username.trim()}
          >
            Start Trading
          </Button>

          <Button 
            variant="outline" 
            onClick={() => setLocation("/")}
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Return to Home
          </Button>
        </div>
      </Card>
    </div>
  );
}