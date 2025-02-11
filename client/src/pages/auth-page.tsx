import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, InsertUser } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { SiTradingview } from "react-icons/si";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);

  const form = useForm<InsertUser>({
    resolver: zodResolver(
      isLogin
        ? insertUserSchema.pick({ username: true, password: true })
        : insertUserSchema
    ),
  });

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  const onSubmit = async (data: InsertUser) => {
    if (isLogin) {
      await loginMutation.mutateAsync({
        username: data.username,
        password: data.password,
      });
    } else {
      await registerMutation.mutateAsync(data);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Form Section */}
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md p-8">
          <div className="mb-8 text-center">
            <SiTradingview className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-bold">Welcome to TRG.fin</h1>
            <p className="text-muted-foreground">
              {isLogin ? "Sign in to your account" : "Create a new account"}
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                {...form.register("username")}
                placeholder="Enter your username"
              />
              {form.formState.errors.username && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...form.register("password")}
                placeholder="Enter your password"
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="Enter your email"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending || registerMutation.isPending}
            >
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </Card>
      </div>

      {/* Hero Section */}
      <div className="hidden md:flex bg-gradient-to-br from-gray-900 to-gray-800 p-8 items-center justify-center">
        <div className="max-w-md text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Advanced Trading Platform
          </h2>
          <p className="text-lg mb-8">
            Experience real-time market analysis, advanced charting, and professional trading tools.
          </p>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Real-time Analysis</h3>
              <p className="text-sm text-gray-300">
                Get instant market insights and trading signals
              </p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Professional Tools</h3>
              <p className="text-sm text-gray-300">
                Access advanced charting and technical indicators
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
