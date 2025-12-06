import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Heart, Globe, Facebook, Twitter, Instagram, Linkedin, CheckCircle2, Copy, ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import DonationQRCode from "@/components/DonationQRCode";

interface DonationRecord {
  id: string;
  amount: number;
  date: string;
  fromPhilanthropist?: string;
  fromAnonymous?: boolean;
}

interface CharityCredibility {
  organization: {
    id: string;
    name: string;
    description: string | null;
    website: string | null;
    facebook: string | null;
    twitter: string | null;
    instagram: string | null;
    linkedin: string | null;
    logoUrl: string | null;
  };
  tag: {
    tagCode: string;
    referralCode: string;
  };
  wallet: {
    balanceZAR: number;
  };
  totalDonations: number;
  donationCount: number;
  recentDonations: DonationRecord[];
  referrer?: {
    name: string;
    type: string;
    totalDonated: number;
  };
}

export default function CharityCredibility() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState(false);
  
  // Get charity code and referral code from URL
  const params = new URLSearchParams(window.location.search);
  const charityCode = window.location.pathname.split('/').pop();
  const referralCode = params.get('ref');

  const { data: credibility, isLoading } = useQuery<CharityCredibility>({
    queryKey: ['/api/charity/credibility', charityCode, referralCode],
    queryFn: async () => {
      const url = `/api/charity/credibility/${charityCode}${referralCode ? `?ref=${referralCode}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load charity credibility');
      return res.json();
    },
    enabled: !!charityCode,
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast({
      title: "Code copied",
      description: "Freedom Tag code copied to clipboard",
    });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const formatCurrency = (cents: number) => {
    return `R ${(cents / 100).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardContent className="p-8">
            <div className="text-center text-muted-foreground">Loading charity information...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!credibility) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Charity Not Found</h2>
              <p className="text-muted-foreground">The charity you're looking for doesn't exist or hasn't been verified yet.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { organization, tag, wallet, totalDonations, donationCount, recentDonations, referrer } = credibility;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl md:max-w-4xl lg:max-w-5xl mx-auto space-y-6 md:space-y-8">
        <div className="flex">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            data-testid="button-back-home"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Button>
        </div>
        {/* Header with Logo and Trust Badge */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              {organization.logoUrl ? (
                <img 
                  src={organization.logoUrl} 
                  alt={organization.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Heart className="w-10 h-10 text-primary" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-2xl">{organization.name}</CardTitle>
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </Badge>
                </div>
                {organization.description && (
                  <CardDescription className="text-base mt-2">
                    {organization.description}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Referral Context */}
        {referrer && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm">
                <Heart className="w-4 h-4 text-primary" />
                <span className="font-medium">{referrer.name}</span>
                <span className="text-muted-foreground">recommends this charity</span>
                {referrer.totalDonated > 0 && (
                  <>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="text-muted-foreground">
                      They've donated {formatCurrency(referrer.totalDonated)} so far
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Donation Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Impact & Transparency</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total Donations Received</div>
                <div className="text-3xl font-bold text-primary">{formatCurrency(totalDonations)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Number of Donors</div>
                <div className="text-2xl font-semibold">{donationCount}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Current Balance</div>
                <div className="text-2xl font-semibold">{formatCurrency(wallet.balanceZAR)}</div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Links */}
          <Card>
            <CardHeader>
              <CardTitle>Verification & Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {organization.website && (
                <a 
                  href={organization.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm hover-elevate rounded-md p-2 -mx-2"
                  data-testid="link-charity-website"
                >
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1">{organization.website}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </a>
              )}
              {organization.facebook && (
                <a 
                  href={organization.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm hover-elevate rounded-md p-2 -mx-2"
                  data-testid="link-charity-facebook"
                >
                  <Facebook className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1">Facebook</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </a>
              )}
              {organization.twitter && (
                <a 
                  href={organization.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm hover-elevate rounded-md p-2 -mx-2"
                  data-testid="link-charity-twitter"
                >
                  <Twitter className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1">Twitter / X</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </a>
              )}
              {organization.instagram && (
                <a 
                  href={organization.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm hover-elevate rounded-md p-2 -mx-2"
                  data-testid="link-charity-instagram"
                >
                  <Instagram className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1">Instagram</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </a>
              )}
              {organization.linkedin && (
                <a 
                  href={organization.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm hover-elevate rounded-md p-2 -mx-2"
                  data-testid="link-charity-linkedin"
                >
                  <Linkedin className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1">LinkedIn</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </a>
              )}
              {!organization.website && !organization.facebook && !organization.twitter && !organization.instagram && !organization.linkedin && (
                <div className="text-sm text-muted-foreground italic">No verification links available</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Blockkoin Wallet */}
        <Card className="border-orange-500/20 bg-orange-50/50">
          <CardHeader>
            <div className="flex items-center gap-2 text-orange-900">
              <CardTitle>Blockkoin Wallet</CardTitle>
            </div>
            <CardDescription>
              Current Fiat Balance: {formatCurrency(wallet.balanceZAR)}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Complete Blockkoin onboarding to create or verify the charity wallet and view crypto balances.
            </p>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => {
                const win = window.open('https://bkr.blockkoin.io/', '_blank', 'noopener,noreferrer');
                if (win) { win.focus(); }
              }}
              data-testid="button-charity-kyc"
            >
              Start Verification
            </Button>
          </CardContent>
        </Card>

        {/* Unique Freedom Tag Code */}
        <Card>
          <CardHeader>
            <CardTitle>Blockkoin Freedom Tag Code</CardTitle>
            <CardDescription>
              This unique code identifies this charity on the Blockkoin platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <code className="flex-1 px-4 py-3 bg-muted rounded-md font-mono text-lg font-semibold" data-testid="text-tag-code">
                {tag.tagCode}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopyCode(tag.tagCode)}
                data-testid="button-copy-code"
              >
                <Copy className={copiedCode ? "w-4 h-4 text-primary" : "w-4 h-4"} />
              </Button>
            </div>
            <div className="mt-6">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-center text-base md:text-lg">Scan QR Code to Donate</CardTitle>
                  <CardDescription className="text-center text-xs md:text-sm">Anyone can scan this code to donate to {organization.name}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <DonationQRCode
                    url={`${window.location.origin}/donor?tag=${tag.tagCode}`}
                    tagCode={tag.tagCode}
                    size={240}
                  />
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Recent Donations */}
        {recentDonations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Donations</CardTitle>
              <CardDescription>Latest contributions to this charity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentDonations.map((donation, index) => (
                  <div 
                    key={donation.id} 
                    className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                    data-testid={`donation-record-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <Heart className="w-4 h-4 text-primary" />
                      <div>
                        <div className="text-sm font-medium" data-testid={`donation-from-${index}`}>
                          {donation.fromAnonymous ? 'Anonymous' : donation.fromPhilanthropist || 'Unknown Donor'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(donation.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="font-semibold text-primary" data-testid={`donation-amount-${index}`}>
                      {formatCurrency(donation.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <Button 
            size="lg" 
            className="w-full md:flex-1"
            onClick={() => navigate(`/charity/signup?ref=${referralCode || tag.referralCode}`)}
            data-testid="button-join-charity"
          >
            <Heart className="w-4 h-4 mr-2" />
            Join This Charity
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="w-full md:flex-1"
            onClick={() => navigate(`/donor?tag=${tag.tagCode}`)}
            data-testid="button-donate"
          >
            Donate Now
          </Button>
        </div>
      </div>
    </div>
  );
}
