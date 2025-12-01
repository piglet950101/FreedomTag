import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, ArrowLeft, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BeneficiaryLogin() {
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
      <div className="w-full max-w-2xl">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => setLocation('/kiosk')}
          className="mb-6 text-xl"
          data-testid="button-back"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          Back to Kiosk
        </Button>

        <Card data-testid="card-beneficiary-login">
          <CardHeader className="text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <UserCircle className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-4xl mb-2">Beneficiary Access</CardTitle>
            <CardDescription className="text-xl">
              Enter your tag code and PIN to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="tagCode" className="text-2xl">Tag Code</Label>
                <Input
                  id="tagCode"
                  type="text"
                  placeholder="e.g., CT001"
                  value={tagCode}
                  onChange={(e) => setTagCode(e.target.value.toUpperCase())}
                  className="h-16 text-3xl text-center"
                  required
                  data-testid="input-tag-code"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="pin" className="text-2xl flex items-center gap-2">
                  <Lock className="w-6 h-6" />
                  PIN Code
                </Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="Enter 4-6 digit PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="h-16 text-3xl text-center tracking-widest"
                  maxLength={6}
                  required
                  data-testid="input-pin"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-20 text-3xl"
                disabled={isLoading || !tagCode || !pin}
                data-testid="button-login"
              >
                {isLoading ? "Logging in..." : "Access Account"}
              </Button>
            </form>

            <div className="mt-8 p-6 bg-muted/50 rounded-lg">
              <p className="text-lg text-muted-foreground text-center">
                <strong>Demo PINs:</strong> CT001: 1234 | CT002: 5678 | CT003: 9999
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
