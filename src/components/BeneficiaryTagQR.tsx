import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import DonationQRCode from "@/components/DonationQRCode";

interface BeneficiaryTagQRProps {
  tagCode: string;
  beneficiaryName?: string;
  size?: number;
}

export default function BeneficiaryTagQR({ tagCode, beneficiaryName, size = 240 }: BeneficiaryTagQRProps) {
  const donateUrl = `${window.location.origin}/tag/${tagCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(donateUrl);
    } catch {}
  };

  return (
    <Card className="border-green-500/20 bg-green-50/50">
      <CardHeader>
        <CardTitle className="text-foreground">Scan QR Code to Donate</CardTitle>
        <CardDescription>
          Anyone can scan this code to donate{beneficiaryName ? ` to ${beneficiaryName}` : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center py-6">
        <div className="max-w-xs w-full">
          <DonationQRCode url={donateUrl} tagCode={tagCode} size={size} />
        </div>
      </CardContent>
    </Card>
  );
}
