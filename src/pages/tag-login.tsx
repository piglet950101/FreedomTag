import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, ArrowLeft, Lock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TagLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [tagCode, setTagCode] = useState("");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/beneficiary/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // CRITICAL: Include cookies for session
        body: JSON.stringify({ tagCode, pin }),
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

      const data = await response.json();
      
      // Store session data
      sessionStorage.setItem('beneficiary', JSON.stringify(data));
      
      // Redirect to comprehensive user dashboard
      setLocation(`/user/dashboard/${data.tagCode}`);
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
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => setLocation('/')}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Button>

        <Card data-testid="card-tag-login">
          <CardHeader className="text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-3xl mb-2">Sign In to Your Freedom Tag</CardTitle>
            <CardDescription className="text-base">
              Access your Blockkoin Freedom Tag account to view donations, manage recurring giving, and track your impact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tagCode" className="text-base">Freedom Tag Code</Label>
                <Input
                  id="tagCode"
                  type="text"
                  placeholder="e.g., CT001"
                  value={tagCode}
                  onChange={(e) => setTagCode(e.target.value)}
                  required
                  className="text-lg h-12"
                  data-testid="input-tag-code"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin" className="text-base">PIN</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="pin"
                    type="password"
                    inputMode="numeric"
                    placeholder="Enter your 4-6 digit PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    maxLength={6}
                    required
                    className="pl-10 text-lg h-12"
                    data-testid="input-pin"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full text-lg h-12"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? "Signing In..." : "Sign In to Dashboard"}
              </Button>

              <div className="text-center pt-4 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Don't have a Freedom Tag?{" "}
                  <button
                    type="button"
                    className="text-primary font-semibold hover:underline"
                    onClick={() => setLocation('/quick-tag-setup')}
                    data-testid="link-create-tag"
                  >
                    Create one in 30 seconds
                  </button>
                </p>
                <p className="text-sm text-muted-foreground">
                  Forgot your PIN?{" "}
                  <button
                    type="button"
                    className="text-primary font-semibold hover:underline"
                    onClick={() => setLocation('/forgot-password')}
                    data-testid="link-forgot-pin"
                  >
                    Reset it here
                  </button>
                </p>
              </div>
            </form>

            {/* Demo Info */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Demo Accounts:</strong> Try CT001 (PIN: 1234), CT002 (PIN: 5678), or CT003 (PIN: 9999)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
