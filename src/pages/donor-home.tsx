import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanLine, Heart, Search, TrendingUp } from "lucide-react";
import QRScanner from "@/components/QRScanner";

export default function DonorHome() {
  const [, setLocation] = useLocation();
  const [showScanner, setShowScanner] = useState(false);
  const [tagCodeInput, setTagCodeInput] = useState("");

  const handleQRScan = (data: string) => {
    console.log('🔍 QR Scan Data:', data);
    const tagMatch = data.match(/\/(?:quick-donate|tag)\/([A-Z0-9]+)/i) || data.match(/^([A-Z0-9]+)$/i);
    if (tagMatch) {
      const scannedTag = tagMatch[1].toUpperCase();
      setLocation(`/donor/view/${scannedTag}`);
      setShowScanner(false);
    }
  };

  const handleManualEntry = () => {
    if (tagCodeInput.trim()) {
      setLocation(`/donor/view/${tagCodeInput.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      
      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <QRScanner
              onScan={handleQRScan}
              onClose={() => setShowScanner(false)}
              title="Scan Freedom Tag"
              description="Point camera at beneficiary's QR code"
            />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Make a Difference Today
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Scan a Freedom Tag to see someone's story and donate directly
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Scan QR Code */}
          <Card 
            className="hover-elevate cursor-pointer border-2 hover:border-primary/50 transition-all"
            onClick={() => setShowScanner(true)}
            data-testid="card-scan-qr"
          >
            <CardHeader>
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <ScanLine className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-center">Scan QR Code</CardTitle>
              <CardDescription className="text-center text-base">
                Use your camera to scan a beneficiary's tag
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Most common method - instant and secure
              </p>
            </CardContent>
          </Card>

          {/* Enter Tag Code */}
          <Card className="border-2 hover:border-primary/50 transition-all" data-testid="card-enter-code">
            <CardHeader>
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Search className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-center">Enter Tag Code</CardTitle>
              <CardDescription className="text-center text-base">
                Type in a Freedom Tag code manually
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagCodeInput}
                  onChange={(e) => setTagCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g., TAG123"
                  className="flex-1 px-4 py-2 border rounded-lg text-center text-lg font-mono"
                  onKeyPress={(e) => e.key === 'Enter' && handleManualEntry()}
                  data-testid="input-tag-code"
                />
                <Button onClick={handleManualEntry} size="lg" data-testid="button-go">
                  Go
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <Heart className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Direct Impact</h3>
                <p className="text-sm text-muted-foreground">
                  100% of your donation goes directly to the beneficiary
                </p>
              </div>
              <div>
                <ScanLine className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Instant & Secure</h3>
                <p className="text-sm text-muted-foreground">
                  Blockchain-verified transactions in seconds
                </p>
              </div>
              <div>
                <TrendingUp className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Track Impact</h3>
                <p className="text-sm text-muted-foreground">
                  See exactly where your donation goes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
