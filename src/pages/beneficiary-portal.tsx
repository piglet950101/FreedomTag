import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Lock, Wallet, Scan } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function BeneficiaryPortal() {
  const [, setLocation] = useLocation();
  const [tagCode, setTagCode] = useState("");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tagCode || !pin) {
      toast({
        title: "Missing information",
        description: "Please enter both tag code and PIN",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/beneficiary/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagCode, pin }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Authentication failed",
          description: error.error || "Invalid tag code or PIN",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      
      // Store authentication in session storage
      sessionStorage.setItem(`auth_${tagCode}`, JSON.stringify({
        authenticated: true,
        timestamp: Date.now(),
        beneficiaryName: data.beneficiaryName,
      }));

      // Redirect to tag page
      setLocation(`/tag/${tagCode}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to authenticate. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!tagCode) {
      toast({
        title: "Missing information",
        description: "Please enter your tag code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get verification URL for this tag
      const response = await fetch('/api/beneficiary/biometric-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Tag not found or not enrolled",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      
      // Store pending verification info
      sessionStorage.setItem(`biometric_pending_${tagCode}`, JSON.stringify({
        timestamp: Date.now(),
        beneficiaryName: data.beneficiaryName,
      }));

      // Open verification in current window
      window.location.href = data.verificationUrl;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate biometric verification. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button variant="ghost" className="mb-4" onClick={() => window.history.back()} data-testid="button-back">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="shadow-xl" data-testid="card-beneficiary-login">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl">Check Balance</CardTitle>
                <CardDescription>Access your Freedom Tag wallet</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pin" data-testid="tab-pin">
                  <Lock className="w-4 h-4 mr-2" />
                  PIN Login
                </TabsTrigger>
                <TabsTrigger value="biometric" data-testid="tab-biometric">
                  <Scan className="w-4 h-4 mr-2" />
                  Face Recognition
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pin" className="space-y-4 mt-4">
                <form onSubmit={handlePinLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tagCode">Tag Code</Label>
                    <Input
                      id="tagCode"
                      type="text"
                      placeholder="Enter your tag code (e.g., CT001)"
                      value={tagCode}
                      onChange={(e) => setTagCode(e.target.value.toUpperCase())}
                      disabled={isLoading}
                      data-testid="input-tag-code-pin"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pin">PIN</Label>
                    <Input
                      id="pin"
                      type="password"
                      placeholder="Enter your 6-digit PIN"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      maxLength={6}
                      disabled={isLoading}
                      data-testid="input-pin"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    data-testid="button-pin-login"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Access Wallet
                      </>
                    )}
                  </Button>

                  <div className="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-3 rounded text-sm">
                    <p className="text-blue-800 dark:text-blue-200">
                      <strong>🔒 Secure Access</strong><br />
                      Enter your tag code and PIN to view your balance privately.
                    </p>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="biometric" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tagCodeBio">Tag Code</Label>
                    <Input
                      id="tagCodeBio"
                      type="text"
                      placeholder="Enter your tag code (e.g., CT001)"
                      value={tagCode}
                      onChange={(e) => setTagCode(e.target.value.toUpperCase())}
                      disabled={isLoading}
                      data-testid="input-tag-code-bio"
                    />
                  </div>

                  <Button
                    onClick={handleBiometricLogin}
                    className="w-full"
                    disabled={isLoading}
                    data-testid="button-biometric-login"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Initiating...
                      </>
                    ) : (
                      <>
                        <Scan className="w-4 h-4 mr-2" />
                        Login with Face Recognition
                      </>
                    )}
                  </Button>

                  <div className="bg-purple-50 dark:bg-purple-950/30 border-l-4 border-purple-500 p-3 rounded text-sm">
                    <p className="text-purple-800 dark:text-purple-200">
                      <strong>👤 Biometric Login</strong><br />
                      Use face recognition to securely access your wallet. You must have completed registration to use this feature.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-4 pt-4 border-t text-center">
              <p className="text-sm text-muted-foreground">
                Want to donate? <Link href="/donor"><span className="text-primary hover:underline cursor-pointer">Go to donor portal</span></Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
