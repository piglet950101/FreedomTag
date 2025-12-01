import { Button } from "@/components/ui/button";
import { Share2, Facebook, Twitter, MessageCircle, Mail, Linkedin } from "lucide-react";
import { SiWhatsapp, SiLinkedin } from "react-icons/si";

interface ShareButtonsProps {
  url: string;
  text: string;
  platforms?: string[];
  title?: string;
  testIdPrefix?: string;
}

export function ShareButtons({ 
  url, 
  text, 
  platforms = ['facebook', 'twitter', 'whatsapp', 'linkedin', 'email'],
  title = "Share",
  testIdPrefix = "share"
}: ShareButtonsProps) {
  
  const shareHandlers: Record<string, () => void> = {
    facebook: () => {
      const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
      window.open(shareUrl, '_blank', 'width=600,height=400');
    },
    twitter: () => {
      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(shareUrl, '_blank', 'width=600,height=400');
    },
    whatsapp: () => {
      const shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
      window.open(shareUrl, '_blank');
    },
    linkedin: () => {
      const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
      window.open(shareUrl, '_blank', 'width=600,height=400');
    },
    email: () => {
      const subject = 'Check out this story';
      const body = `${text}\n\n${url}`;
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    },
  };

  const platformConfig: Record<string, { icon: any; label: string }> = {
    facebook: { icon: Facebook, label: 'Facebook' },
    twitter: { icon: Twitter, label: 'Twitter' },
    whatsapp: { icon: SiWhatsapp, label: 'WhatsApp' },
    linkedin: { icon: SiLinkedin, label: 'LinkedIn' },
    email: { icon: Mail, label: 'Email' },
  };

  const activePlatforms = platforms.filter(p => platformConfig[p]);

  if (activePlatforms.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Share2 className="w-4 h-4" />
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {activePlatforms.map((platform) => {
          const config = platformConfig[platform];
          const Icon = config.icon;
          return (
            <Button
              key={platform}
              onClick={shareHandlers[platform]}
              variant="outline"
              size="sm"
              data-testid={`button-${testIdPrefix}-${platform}`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {config.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
