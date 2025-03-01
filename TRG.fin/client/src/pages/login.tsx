import { useState } from "react";
import { useLocation } from "wouter";
import { apiService } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username) {
      toast({
        title: "Error",
        description: "Username is required",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isRegistering) {
        if (!email || !email.includes('@')) {
          throw new Error("Valid email is required");
        }
        
        await apiService.auth.register(username, password, email);
        toast({
          title: "Success",
          description: "Account created successfully",
        });
      } else {
        // Use mockLogin for demo purposes - in production, use the real login
        await apiService.mockLogin();
        // await apiService.auth.login(username, password);
      }
      
      setLocation("/");
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleMode = () => {
    setIsRegistering(!isRegistering);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-background/80 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-border/40 bg-card p-6 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            {isRegistering ? "Create Account" : "Sign In"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isRegistering
              ? "Create your account to start trading"
              : "Sign in to your account to continue"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-foreground">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Password"
              />
            </div>

            {isRegistering && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Email"
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm ${
                isLoading ? "opacity-70" : "hover:bg-primary/90"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : isRegistering ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-primary hover:underline focus:outline-none"
          >
            {isRegistering
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </button>
        </div>
        
        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>For demo purposes, any username will work</p>
        </div>
      </div>
    </div>
  );
}