import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

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

    // Check if user exists in localStorage
    const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
    if (!existingUsers.includes(username.trim())) {
      toast({
        title: "User not found",
        description: "This username doesn't exist. Please sign up first.",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem("username", username.trim());
    setLocation("/");

    toast({
      title: "Welcome back!",
      description: "Successfully logged in"
    });
  };

  const handleSignup = () => {
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive"
      });
      return;
    }

    // Check if username already exists
    const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
    if (existingUsers.includes(username.trim())) {
      toast({
        title: "Username taken",
        description: "This username is already taken. Please try another one.",
        variant: "destructive"
      });
      return;
    }

    // Add new user to the list
    existingUsers.push(username.trim());
    localStorage.setItem("users", JSON.stringify(existingUsers));
    localStorage.setItem("username", username.trim());
    setLocation("/");

    toast({
      title: "Welcome!",
      description: "Your account has been created successfully"
    });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <iframe
          className="h-full w-full"
          src="https://ssltvc.investing.com/?pair_ID=160&height=100%&width=100%&interval=300&plotStyle=area&domain_ID=56&lang_ID=56&timezone_ID=20"
          frameBorder="0"
          allowTransparency={true}
          scrolling="no"
        />
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
                Choose a username to start trading
              </p>
            </div>

            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <div>
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
                  Login
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <div>
                  <Label>Choose Username</Label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter a new username"
                    onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleSignup}
                  disabled={!username.trim()}
                >
                  Create Account
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  ₹10,00,000 virtual currency will be credited to your account
                </p>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}