import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface DonationQRCodeProps {
  url: string;
  tagCode?: string;
  size?: number;
  showTitle?: boolean;
}

export default function DonationQRCode({ 
  url, 
  tagCode, 
  size = 160, 
  showTitle = true 
}: DonationQRCodeProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share this link to collect donations",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Card data-testid="card-donation-qr">
      <CardContent className="pt-6 pb-6">
        <div className="space-y-4">
          {showTitle && (
            <div className="text-center">
              <h3 className="font-semibold text-foreground mb-1" data-testid="text-qr-title">
                {tagCode ? `Scan to Donate to ${tagCode}` : 'Scan to Donate'}
              </h3>
              <p className="text-xs text-muted-foreground">
                No excuse not to give
              </p>
            </div>
          )}
          
          <div className="bg-white p-4 rounded-lg flex justify-center" data-testid="qr-code-container">
            <QRCode
              value={url}
              size={size}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox={`0 0 ${size} ${size}`}
              data-testid="qr-code"
            />
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleCopyUrl}
              data-testid="button-copy-url"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Share this QR code or link
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
