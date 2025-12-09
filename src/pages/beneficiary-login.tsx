import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, ArrowLeft, Lock, ShieldCheck, Heart } from "lucide-react";
import { goBackOrHome } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";


export default function BeneficiaryLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Login Failed",
          description: error.error === 'invalid pin' ? "Invalid PIN. Please try again." : "Tag not found.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Populate session using /auth/me so dashboard finds 'beneficiary'
      try {
        const meRes = await fetch('/api/auth/me', { credentials: 'include' });
        if (meRes.ok) {
          const me = await meRes.json();
          sessionStorage.setItem('user', JSON.stringify(me));
          const roles: string[] = me.roles || [];
          if (roles && roles.indexOf('BENEFICIARY') !== -1 && me.beneficiaryTag) {
            const b = me.beneficiaryTag;
            const beneficiarySession = {
              tagCode: b.tagCode,
              walletId: b.walletId || '',
              balanceZAR: Number(b.balanceZAR) || 0,
            };
            sessionStorage.setItem('beneficiary', JSON.stringify(beneficiarySession));
          }
        }
      } catch (e) {
        console.warn('Failed to load /auth/me after login:', e);
      }

      // Small delay to ensure session cookie is set before redirect
      setTimeout(() => {
      setLocation('/beneficiary/dashboard');
      }, 200);
      

      // Try to store session data, but don't block navigation if parsing fails
      try {
        const data = await response.json();
        sessionStorage.setItem('user', JSON.stringify(data));
      } catch (e) {
        console.warn('Login response parse failed, continuing navigation:', e);
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
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2"
                  required
                  data-testid="input-password"
                />
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
