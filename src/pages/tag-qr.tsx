import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag as TagIcon } from "lucide-react";
import DonationQRCode from "@/components/DonationQRCode";

interface TagInfo {
  tagCode: string;
  walletId: string;
  balanceZAR: number;
}

export default function TagQR() {
  const { tagCode } = useParams<{ tagCode: string }>();

  const { data: tagInfo, isLoading } = useQuery<TagInfo>({
    queryKey: [`/api/tag/${tagCode}`],
  });

  if (isLoading || !tagCode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading QR Code...</p>
        </div>
      </div>
    );
  }

  const quickDonateUrl = `${window.location.origin}/quick-donate/${tagCode}`;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card data-testid="card-qr-display">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <TagIcon className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Freedom Tag {tagInfo?.tagCode}</CardTitle>
            <CardDescription>Scan to Donate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-foreground" data-testid="text-balance">
                R {((tagInfo?.balanceZAR || 0) / 100).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Current Balance</p>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs text-center text-muted-foreground">
                This QR code can be printed and worn as a wristband or badge
              </p>
            </div>
          </CardContent>
        </Card>

        <DonationQRCode 
          url={quickDonateUrl}
          tagCode={tagCode}
          size={200}
        />
      </div>
    </div>
  );
}
