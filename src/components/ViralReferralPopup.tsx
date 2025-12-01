import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Sparkles, Heart } from "lucide-react";
import { SiWhatsapp, SiFacebook, SiX } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";

interface ViralReferralPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referralCode: string;
  userName?: string;
  userType: 'tag' | 'philanthropist' | 'merchant' | 'organization';
}

export function ViralReferralPopup({ open, onOpenChange, referralCode, userName, userType }: ViralReferralPopupProps) {
  const { toast } = useToast();
  const baseUrl = window.location.origin;
  
  // Determine signup URL based on user type
  const signupUrls = {
    tag: `${baseUrl}/kiosk/quick-tag?ref=${referralCode}`,
    philanthropist: `${baseUrl}/philanthropist/signup?ref=${referralCode}`,
    merchant: `${baseUrl}/merchant/signup?ref=${referralCode}`,
    organization: `${baseUrl}/charity/signup?ref=${referralCode}`,
  };
  
  const signupUrl = signupUrls[userType];
  
  // Viral message with blockchain transparency theme
  const shareMessage = `I'm supporting giving & receiving - open and transparent on the blockchain with Blockkoin Freedom Tag! 🌍💚\n\nJoin me in making a real difference. Every donation is tracked on the blockchain for complete transparency.\n\nUse my code: ${referralCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "✨ Code Copied!",
      description: "Your referral code is ready to share",
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(signupUrl);
    toast({
      title: "✨ Link Copied!",
      description: "Share this link to spread the word",
    });
  };

  const shareOnWhatsApp = () => {
    const text = `${shareMessage}\n\n${signupUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(signupUrl)}&quote=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = () => {
    const twitterMessage = `I'm supporting giving & receiving - open and transparent on the blockchain with @Blockkoin Freedom Tag! 🌍💚\n\nJoin me: ${signupUrl}\n\nCode: ${referralCode}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterMessage)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareViaWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Blockkoin Freedom Tag',
          text: shareMessage,
          url: signupUrl,
        });
      } catch (err) {
        // User cancelled share
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl" data-testid="dialog-viral-referral">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            🎉 Welcome to the Movement!
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Help us go viral! Share your referral code and spread blockchain-powered transparency in giving
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Your personal message */}
          <div className="bg-primary/5 rounded-lg p-4 border-l-4 border-primary">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm leading-relaxed">
                <strong>I'm supporting giving & receiving - open and transparent on the blockchain with Blockkoin Freedom Tag!</strong>
                <br />
                <span className="text-muted-foreground">
                  Every donation is tracked on the blockchain for complete transparency. Join the movement!
                </span>
              </p>
            </div>
          </div>

          {/* Referral Code */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Unique Referral Code</label>
            <div className="flex gap-2">
              <Input
                value={referralCode}
                readOnly
                className="font-mono text-xl font-bold text-center"
                data-testid="input-viral-referral-code"
              />
              <Button
                onClick={copyCode}
                variant="outline"
                size="icon"
                className="flex-shrink-0"
                data-testid="button-copy-viral-code"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Share Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Share This Link</label>
            <div className="flex gap-2">
              <Input
                value={signupUrl}
                readOnly
                className="text-sm"
                data-testid="input-viral-referral-link"
              />
              <Button
                onClick={copyLink}
                variant="outline"
                size="icon"
                className="flex-shrink-0"
                data-testid="button-copy-viral-link"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Share Worldwide - One Click!</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={shareOnWhatsApp}
                className="bg-[#25D366] hover:bg-[#20BA5A] text-white"
                data-testid="button-viral-share-whatsapp"
              >
                <SiWhatsapp className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                onClick={shareOnFacebook}
                className="bg-[#1877F2] hover:bg-[#166FE5] text-white"
                data-testid="button-viral-share-facebook"
              >
                <SiFacebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
              <Button
                onClick={shareOnTwitter}
                className="bg-black hover:bg-gray-800 text-white"
                data-testid="button-viral-share-twitter"
              >
                <SiX className="h-4 w-4 mr-2" />
                X/Twitter
              </Button>
            </div>
            
            {/* Native Share (if available) */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <Button
                onClick={shareViaWebShare}
                variant="outline"
                className="w-full"
                data-testid="button-viral-share-native"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share via More Apps
              </Button>
            )}
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 text-center">
            <p className="text-sm font-medium text-primary">
              💚 Every share helps someone in need. Let's go viral for good! 💚
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            size="lg"
            data-testid="button-close-viral-popup"
          >
            I'll Share Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
