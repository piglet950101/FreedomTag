import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Mail, Lock, Building2, Globe, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CharitySignup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Extract referral info from URL
  const urlParams = new URLSearchParams(window.location.search);
  const urlReferralCode = urlParams.get('ref');
  const referrerName = urlParams.get('from');
  
  // Form state
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [referralCode, setReferralCode] = useState(urlReferralCode || "");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupResult, setSignupResult] = useState<{ organizationId: string; tagCode: string; referralCode: string } | null>(null);
  
  useEffect(() => {
    if (urlReferralCode && referrerName) {
      toast({
        title: "Referral code applied!",
        description: `You were referred by ${decodeURIComponent(referrerName)}`,
      });
    }
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organizationName || !email || !password) {
      toast({
        title: "Missing information",
        description: "Please enter organization name, email, and password",
        variant: "destructive",
      });
      return;
    }

    setIsSigningUp(true);

    try {
      const response = await fetch('/api/charity/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationName,
          email,
          password,
          description,
          website,
          facebook,
          twitter,
          instagram,
          linkedin,
          logoUrl,
          referralCode: referralCode || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Signup failed');
      }

      const data = await response.json();
      
      setSignupResult({
        organizationId: data.organizationId,
        tagCode: data.tagCode,
        referralCode: data.referralCode,
      });

      toast({
        title: "Welcome to Blockkoin Freedom Tag!",
        description: referralCode 
          ? `Your organization has been created! You received R20 signup bonus and your referrer earned R50.`
          : `Your organization has been created successfully!`,
      });
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  // Show success screen after signup
  if (signupResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card data-testid="card-success">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Welcome to Blockkoin Freedom Tag!</CardTitle>
              <CardDescription>
                Your organization is now part of the global impact network
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Your Organization ID</p>
                  <p className="font-mono font-medium" data-testid="text-org-id">{signupResult.organizationId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Freedom Tag Code</p>
                  <p className="font-mono font-medium text-xl text-primary" data-testid="text-tag-code">{signupResult.tagCode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Referral Code (Share to earn R50)</p>
                  <p className="font-mono font-medium" data-testid="text-referral-code">{signupResult.referralCode}</p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Next Steps:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Share your Freedom Tag code {signupResult.tagCode} with donors
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Check your credibility dashboard at /charity/credibility/{signupResult.tagCode}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Share your referral code to invite others and earn R50 each
                  </li>
                </ul>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                onClick={() => setLocation(`/charity/credibility/${signupResult.tagCode}`)}
                data-testid="button-view-dashboard"
              >
                View Credibility Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            Become a Verified Cause Partner
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Partner with Blockkoin Freedom Tag to unlock transparent giving, instant settlement, and donor trust.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            All organizations are vetted through our compliance partner, SumSub.
          </p>
          {referrerName && (
            <p className="text-sm text-primary mt-2">
              Referred by: {decodeURIComponent(referrerName)} 🎁
            </p>
          )}
        </div>

        <form onSubmit={handleSignup}>
          <Card className="mb-6" data-testid="card-basic-info">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter your organization details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name *</Label>
                <Input
                  id="org-name"
                  placeholder="Hope Foundation"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  required
                  data-testid="input-org-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@hopefoundation.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="input-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell donors about your mission and impact..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  data-testid="textarea-description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo URL</Label>
                <Input
                  id="logo"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  data-testid="input-logo-url"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6" data-testid="card-credibility">
            <CardHeader>
              <CardTitle>Credibility Links</CardTitle>
              <CardDescription>Add your website and social media for donor trust</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-md">
                    <Globe className="w-4 h-4" />
                  </div>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://hopefoundation.org"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    data-testid="input-website"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-md">
                    <Facebook className="w-4 h-4" />
                  </div>
                  <Input
                    id="facebook"
                    placeholder="https://facebook.com/hopefoundation"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    data-testid="input-facebook"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter / X</Label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-md">
                    <Twitter className="w-4 h-4" />
                  </div>
                  <Input
                    id="twitter"
                    placeholder="https://twitter.com/hopefoundation"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    data-testid="input-twitter"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-md">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <Input
                    id="instagram"
                    placeholder="https://instagram.com/hopefoundation"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    data-testid="input-instagram"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-md">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/company/hopefoundation"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    data-testid="input-linkedin"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {urlReferralCode && (
            <Card className="mb-6" data-testid="card-referral">
              <CardContent className="pt-6">
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm">
                    💡 You're signing up with a referral code! You'll receive R20 to start, and your referrer earns R50.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isSigningUp}
            data-testid="button-signup"
          >
            {isSigningUp ? "Creating Organization..." : "Create Organization Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          By signing up, you agree to receive donations through Blockkoin Freedom Tag
        </p>
      </div>
    </div>
  );
}
