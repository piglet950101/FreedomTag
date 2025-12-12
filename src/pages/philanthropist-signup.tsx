import { useState, useEffect, FormEvent } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PasswordField from '@/components/PasswordField';
import { Label } from "@/components/ui/label";
import { Heart, Mail, Lock, User, ArrowLeft, Gift } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { ViralReferralPopup } from "@/components/ViralReferralPopup";

export default function PhilanthropistSignup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Extract referral code from URL
  const urlParams = new URLSearchParams(window.location.search);
  const urlReferralCode = urlParams.get('ref');

  // Signup form
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [referralCode, setReferralCode] = useState(urlReferralCode || "");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupData, setSignupData] = useState<any>(null);
  const [showViralPopup, setShowViralPopup] = useState(false);

  useEffect(() => {
    if (urlReferralCode) {
      toast({
        title: "Referral code applied!",
        description: `You were referred by code: ${urlReferralCode}`,
      });
    }
  }, []);

  // Note: this page is signup-only. Login has its own route.

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();

    if (!signupEmail || !signupPassword) {
      toast({
        title: "Missing information",
        description: "Please enter email and password",
        variant: "destructive",
      });
      return;
    }

    setIsSigningUp(true);

    try {
      const response = await fetch('/api/philanthropist/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword,
          displayName: displayName || undefined,
          referredBy: referralCode || undefined,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Signup failed",
          description: error.error || "Could not create account",
          variant: "destructive",
        });
        setIsSigningUp(false);
        return;
      }

      const data = await response.json();
      
      // Store JWT token if provided
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        console.log('[PhilanthropistSignup] JWT token stored');
      }
      
      setSignupData(data);

      // Show viral popup after 1 second
      setTimeout(() => setShowViralPopup(true), 1000);

      toast({
        title: "Account created!",
        description: "Welcome to the Freedom Tag philanthropist community",
      });

      // Don't redirect immediately - let user share first
      // They'll be redirected when they close the popup or after a timeout
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
      setIsSigningUp(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button variant="ghost" className="mb-4" onClick={() => window.history.back()} data-testid="button-back">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="shadow-xl" data-testid="card-philanthropist-auth">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Philanthropist Account</CardTitle>
            <CardDescription>
              Create an account to manage your giving and support charities anonymously
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full">
              <div className="mb-4 text-center">
                <div>
                  <span className="text-[24px] font-normal text-black inline-block px-4 py-2 rounded-md">Sign Up</span>
                </div>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    data-testid="input-signup-email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </Label>
                  <PasswordField
                    id="signup-password"
                    placeholder="Create a secure password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    data-testid="input-signup-password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display-name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Display Name <span className="text-muted-foreground text-xs">(Optional)</span>
                  </Label>
                  <Input
                    id="display-name"
                    placeholder="How you'd like to be known"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    data-testid="input-display-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referral-code" className="flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    Referral Code <span className="text-muted-foreground text-xs">(Optional)</span>
                  </Label>
                  <Input
                    id="referral-code"
                    placeholder="Enter referral code"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    data-testid="input-referral-code-signup"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSigningUp}
                  data-testid="button-signup"
                >
                  {isSigningUp ? "Creating Account..." : "Create Account"}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Your account will remain anonymous. Only you can see your giving history.
                </p>

                <p className="text-sm text-center mt-2">
                  Already have an account?{' '}
                  <Link href="/philanthropist/login" className="text-primary hover:underline">
                    Login
                  </Link>
                </p>
              </form>
              {/* end signup form */}
            </div>

            <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>As a philanthropist, you can:</strong>
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1 list-disc list-inside">
                <li>Fund your account and give to charities</li>
                <li>Receive gifts from other donors</li>
                <li>Remain anonymous while making an impact</li>
                <li>Track your giving history</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Viral Referral Popup */}
      <ViralReferralPopup
        open={showViralPopup && !!signupData?.referralCode}
        onOpenChange={(open) => {
          setShowViralPopup(open);
          if (!open && signupData) {
            // Redirect to dashboard when popup is closed
            setLocation('/philanthropist/dashboard');
          }
        }}
        referralCode={signupData?.referralCode || ''}
        userName={signupData?.displayName || signupData?.email}
        userType="philanthropist"
      />
    </div>
  );
}
