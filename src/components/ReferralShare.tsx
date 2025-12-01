import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Facebook, Twitter, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SiWhatsapp } from "react-icons/si";

interface ReferralShareProps {
  referralCode: string;
  shareMessage?: string;
}

export function ReferralShare({ referralCode, shareMessage }: ReferralShareProps) {
  const { toast } = useToast();
  const baseUrl = window.location.origin;
  const signupUrl = `${baseUrl}/philanthropist?ref=${referralCode}`;
  
  const defaultMessage = shareMessage || `Join me on Blockkoin Freedom Tag and help make a difference! Use my referral code: ${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(signupUrl);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(signupUrl)}&quote=${encodeURIComponent(defaultMessage)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(defaultMessage)}&url=${encodeURIComponent(signupUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(defaultMessage + ' ' + signupUrl)}`;
    window.open(url, '_blank');
  };

  return (
    <Card data-testid="card-referral-share">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share & Earn Rewards
        </CardTitle>
        <CardDescription>
          Invite others to join the platform and earn rewards when they sign up
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Your Referral Code</label>
          <div className="flex gap-2">
            <Input
              value={referralCode}
              readOnly
              data-testid="input-referral-code"
              className="font-mono text-lg"
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="icon"
              data-testid="button-copy-code"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Share Link</label>
          <div className="flex gap-2">
            <Input
              value={signupUrl}
              readOnly
              data-testid="input-referral-link"
              className="text-sm"
            />
            <Button
              onClick={copyLink}
              variant="outline"
              size="icon"
              data-testid="button-copy-link"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Share on Social Media</label>
          <div className="flex gap-2">
            <Button
              onClick={shareOnFacebook}
              variant="outline"
              className="flex-1"
              data-testid="button-share-facebook"
            >
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </Button>
            <Button
              onClick={shareOnTwitter}
              variant="outline"
              className="flex-1"
              data-testid="button-share-twitter"
            >
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </Button>
            <Button
              onClick={shareOnWhatsApp}
              variant="outline"
              className="flex-1"
              data-testid="button-share-whatsapp"
            >
              <SiWhatsapp className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
