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
    <div 
      className="min-h-screen relative flex items-center justify-center"
      style={{
        backgroundImage: "url('/attached_assets/caption.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <Card className="w-full max-w-md p-8 bg-background/95 backdrop-blur-md relative z-10 mx-4">
        <div className="mb-8 text-center">
          <SiTradingview className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Welcome to TRG.fin
          </h1>
          <p className="text-muted-foreground mt-2">
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
              className="bg-background/50 backdrop-blur-sm"
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
              className="bg-background/50 backdrop-blur-sm"
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
                className="bg-background/50 backdrop-blur-sm"
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
            className="w-full bg-primary hover:bg-primary/90"
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

      {/* Inspirational Quote */}
      <div className="absolute bottom-8 text-center text-white z-10 max-w-2xl px-4">
        <p className="text-2xl font-bold mb-2">Conquer Your Trading Peak</p>
        <p className="text-sm opacity-80">
          Like climbing a mountain, successful trading requires patience, strategy, and perseverance
        </p>
      </div>
    </div>
  );
}