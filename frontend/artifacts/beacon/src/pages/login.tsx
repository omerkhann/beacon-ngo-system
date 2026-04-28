import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import PublicHeader from "@/components/public-header";
import PublicFooter from "@/components/public-footer";
import { apiCall } from "@/lib/api";
import type { User, UserRole } from "@/types";

export default function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDemoHint, setShowDemoHint] = useState(true);

  const demoAccounts = [
    { username: "admin1", password: "admin123", role: "ADMIN" as UserRole },
    { username: "donor_ali", password: "donor123", role: "DONOR" as UserRole },
    { username: "vol_ayesha", password: "vol123", role: "VOLUNTEER" as UserRole },
    { username: "manager1", password: "manager123", role: "CAMPAIGN_MANAGER" as UserRole },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Please enter your username");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);

    try {
      const response = await apiCall("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Login failed");
      }

      const { user, token } = await response.json();
      
      // Store auth data in localStorage
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Dispatch custom event to notify Router of auth state change
      window.dispatchEvent(new CustomEvent("authchange", { detail: { authenticated: true, user } }));

      // Redirect to home - App.tsx will handle role-based routing
      setLocation("/");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (account: typeof demoAccounts[0]) => {
    setUsername(account.username);
    setPassword(account.password);
    setError("");
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <PublicHeader />
      
      <div className="flex-1 relative" style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}>
        {/* Dark overlay - behind content */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        
        <main className="flex items-center justify-center py-12 px-4 relative z-10 min-h-full">
          <div className="w-full max-w-md space-y-6">
          {/* Login Card */}
          <Card className="border-2 bg-white dark:bg-slate-950">
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Access your Beacon account to manage campaigns, donations, and volunteer efforts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="border-primary/20"
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="border-primary/20"
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="pt-2 border-t border-primary/10">
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setLocation("/signup")}
                  className="text-primary hover:text-primary/80 font-semibold transition-colors underline"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card className="border border-accent bg-white dark:bg-slate-950">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Demo Accounts</CardTitle>
              <button
                type="button"
                onClick={() => setShowDemoHint(!showDemoHint)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showDemoHint ? "Hide" : "Show"}
              </button>
            </div>
          </CardHeader>
          {showDemoHint && (
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground mb-3">
                Try these demo accounts to explore different roles:
              </p>
              <div className="grid gap-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.username}
                    onClick={() => handleDemoLogin(account)}
                    className="text-left p-2 rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors group"
                    disabled={loading}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-mono font-semibold text-foreground group-hover:text-primary transition-colors">
                          {account.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {account.role.charAt(0) + account.role.slice(1).toLowerCase()}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                        →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
          </div>
        </main>
      </div>

      <PublicFooter />
    </div>
  );
}
