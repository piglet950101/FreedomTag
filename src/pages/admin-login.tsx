import { useState, FormEvent } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please enter email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoggingIn(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let message = 'Login failed';
        try {
          const error = await response.json();
          message = error.error || message;
        } catch {}
        throw new Error(message);
      }

      const data = await response.json();

      // Store JWT token
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      // Verify user has ADMIN role
      try {
        const meRes = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${data.token}`,
          },
          credentials: 'include',
        });

        if (meRes.ok) {
          const me = await meRes.json();
          const roles: string[] = me.roles || [];
          
          if (!roles.includes('ADMIN')) {
            toast({
              title: "Access Denied",
              description: "This account does not have administrator privileges.",
              variant: "destructive",
            });
            setIsLoggingIn(false);
            localStorage.removeItem('authToken');
            return;
          }

          toast({
            title: "Welcome!",
            description: "Redirecting to admin dashboard...",
          });

          // Redirect to admin dashboard
          setTimeout(() => {
            setLocation('/admin');
          }, 1000);
        } else {
          throw new Error('Failed to verify user');
        }
      } catch (e) {
        console.error('Token verification error:', e);
        toast({
          title: "Authentication Error",
          description: "Login successful but could not verify session. Please try again.",
          variant: "destructive",
        });
        setIsLoggingIn(false);
        localStorage.removeItem('authToken');
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: "Incorrect email or password.",
        variant: "destructive",
      });
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button variant="ghost" className="mb-6" onClick={() => window.history.back()} data-testid="button-back">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>Access the Freedom Tag admin dashboard</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9"
                    required
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoggingIn}
                data-testid="button-login"
              >
                {isLoggingIn ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">Administrator Access</p>
                  <p className="text-muted-foreground text-xs">
                    Only accounts with ADMIN role can access this dashboard. Contact your system administrator if you need access.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

