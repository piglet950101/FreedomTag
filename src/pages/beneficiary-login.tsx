import { useState, FormEvent } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, ArrowLeft, Lock, ShieldCheck, Heart, Eye, EyeOff } from "lucide-react";
import { goBackOrHome } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";


export default function BeneficiaryLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // CRITICAL: Include cookies for session
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        toast({
          title: "Login Failed",
          description: "Incorrect email or password.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Parse response once
      const loginData = await response.json();
      console.log('[BeneficiaryLogin] Login successful:', loginData);

      // Store JWT token
      if (loginData.token) {
        localStorage.setItem('authToken', loginData.token);
        console.log('[BeneficiaryLogin] JWT token stored');
      }

      // Verify token by calling /api/auth/me
      try {
        const meRes = await fetch('/api/auth/me', { 
          headers: {
            'Authorization': `Bearer ${loginData.token}`,
          },
        });
        if (meRes.ok) {
          const me = await meRes.json();
          console.log('[BeneficiaryLogin] Token verified:', me);
          sessionStorage.setItem('user', JSON.stringify(me));
          
          // Check if user has BENEFICIARY role
          const roles: string[] = me.roles || [];
          if (roles && roles.indexOf('BENEFICIARY') !== -1) {
            // If user has beneficiary tag, store it
            if (me.beneficiaryTag) {
              const b = me.beneficiaryTag;
              const beneficiarySession = {
                tagCode: b.tagCode,
                walletId: b.walletId || '',
                balanceZAR: Number(b.balanceZAR) || 0,
              };
              sessionStorage.setItem('beneficiary', JSON.stringify(beneficiarySession));
            }
            
            setLocation('/beneficiary/dashboard');
          } else {
            toast({
              title: "Access Denied",
              description: "Your account does not have beneficiary access.",
              variant: "destructive",
            });
            setIsLoading(false);
          }
        } else {
          console.error('[BeneficiaryLogin] Token verification failed:', meRes.status);
          toast({
            title: "Authentication Error",
            description: "Login successful but token verification failed. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      } catch (e) {
        console.error('[BeneficiaryLogin] Failed to verify token:', e);
        toast({
          title: "Authentication Error",
          description: "Login successful but could not verify token. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          size="lg"
          onClick={goBackOrHome}
          className="mb-6 text-lg"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>

        <Card data-testid="card-beneficiary-login">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
              <Heart className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Beneficiary Account</CardTitle>
            <CardDescription >Sign in to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2"
                  required
                  data-testid="input-email"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </Label>
                  <a className="text-sm text-green-600 hover:underline" onClick={() => setLocation('/forgot-password')}>Forgot password?</a>
                </div>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-9"
                    required
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="accent-green-600" />
                  <span className="text-sm">Remember me</span>
                </label>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-green-500 hover:bg-green-600 text-white"
                disabled={isLoading || !email || !password}
                data-testid="button-login"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-muted/40" />
                <div className="text-xs text-muted-foreground">OR</div>
                <div className="flex-1 h-px bg-muted/40" />
              </div>

              <p className="text-sm text-center text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/beneficiary/signup" className="text-primary hover:underline" data-testid="link-signup">
                  Create one now
                </Link>
              </p>

              <div className="mt-4 p-4 bg-muted/50 rounded-lg flex items-start gap-3">
                <div className="p-2 bg-white rounded-md">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">Secure Login</div>
                  <div className="text-sm text-muted-foreground">Your credentials are encrypted and protected with industry-standard security.</div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
