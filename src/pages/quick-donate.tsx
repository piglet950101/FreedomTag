import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag as TagIcon, CheckCircle, Smartphone, ScanLine, Search } from "lucide-react";
import { useState } from "react";
import DonationQRCode from "@/components/DonationQRCode";
import QRScanner from "@/components/QRScanner";
import Header from "@/components/Header";
import BenefitsStrip from "@/components/ui/BenefitsStrip";

interface TagInfo {
  tagCode: string;
  walletId: string;
  balanceZAR: number;
}

export default function QuickDonate() {
  const { tagCode } = useParams<{ tagCode: string }>();
  const [, setLocation] = useLocation();
  const [amount, setAmount] = useState("");
  const [isPayingBank, setIsPayingBank] = useState(false);
  const [isPayingCrypto, setIsPayingCrypto] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [tagCodeInput, setTagCodeInput] = useState("");

  const params = new URLSearchParams(window.location.search);
  const justPaid = params.get('paid') === '1';

  const { data: tagInfo, isLoading } = useQuery<TagInfo>({
    queryKey: [`/api/tag/${tagCode}`],
    enabled: !!tagCode,
  });

  const presetAmounts = [
    { label: "R10", value: 1000 },
    { label: "R20", value: 2000 },
    { label: "R50", value: 5000 },
    { label: "R100", value: 10000 },
  ];

  const handleBankPayment = async (amountZAR: number) => {
    // Redirect to Stripe-integrated bank pay page with query params
    setIsPayingBank(true);
    try {
      const ts = Date.now();
      const bankRef = `DONOR:${tagCode}:${ts}`;
      const params = new URLSearchParams({
        bankRef: encodeURIComponent(bankRef),
        tagCode: tagCode || "",
        amountZAR: String(Math.round(Number(amountZAR) || 0)),
        source: "public",
      });
      window.location.href = `/bank/pay?${params.toString()}`;
    } catch (error) {
      console.error('Bank payment redirect failed:', error);
      setIsPayingBank(false);
    }
  };

  const handleCryptoPayment = async (amountZAR: number) => {
    setIsPayingCrypto(true);
    try {
      const response = await fetch('/api/crypto/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagCode, amountZAR }),
      });
      const data = await response.json();
      if (data.cryptoSimUrl) {
        window.location.href = data.cryptoSimUrl;
      }
    } catch (error) {
      console.error('Crypto payment failed:', error);
      setIsPayingCrypto(false);
    }
  };

  const handleQRScan = (data: string) => {
    console.log('🔍 Processing QR Scan Data:', data);
    // Extract tag code from scanned QR data
    // Could be a URL like https://example.com/quick-donate/TAG123 or just TAG123
    const tagMatch = data.match(/\/(?:quick-donate|tag|donor\/view)\/([A-Z0-9]+)/i) || data.match(/^([A-Z0-9]+)$/i);
    console.log('🎯 Tag Match Result:', tagMatch);
    if (tagMatch) {
      const scannedTag = tagMatch[1].toUpperCase();
      console.log('✅ Extracted Tag Code:', scannedTag);
      console.log('🚀 Redirecting to:', `/quick-donate/${scannedTag}`);
      setLocation(`/quick-donate/${scannedTag}`);
      setShowScanner(false);
    } else {
      console.warn('⚠️ No valid tag code found in scanned data:', data);
    }
  };

  const handleManualEntry = () => {
    if (tagCodeInput.trim()) {
      setLocation(`/quick-donate/${tagCodeInput.toUpperCase()}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page if no tagCode provided
  if (!tagCode) {
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
                description="Point camera at tag QR code"
              />
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Quick Donate
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Scan a tag or enter the code to make a quick donation
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
                  Use your camera to scan a Freedom Tag
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Fast and secure - instant recognition
                </p>
              </CardContent>
            </Card>

            {/* Enter Tag Code */}
            <Card className="border-2" data-testid="card-manual-entry">
              <CardHeader>
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Search className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl text-center">Enter Tag Code</CardTitle>
                <CardDescription className="text-center text-base">
                  Type the tag code manually
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="text"
                  placeholder="e.g., CH456634"
                  value={tagCodeInput}
                  onChange={(e) => setTagCodeInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualEntry()}
                  className="text-center text-lg font-mono"
                  data-testid="input-tag-code"
                />
                <Button
                  onClick={handleManualEntry}
                  disabled={!tagCodeInput.trim()}
                  className="w-full"
                  size="lg"
                  data-testid="button-continue"
                >
                  Continue
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Benefits Strip */}
          <BenefitsStrip />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* QR Scanner Modal */}
        {showScanner && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
              <QRScanner
                onScan={handleQRScan}
                onClose={() => setShowScanner(false)}
                title="Scan Freedom Tag QR Code"
                description="Point camera at a QR code to quickly donate"
              />
            </div>
          </div>
        )}

        {justPaid ? (
          <Card className="border-primary bg-primary/5" data-testid="card-success">
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Thank You!</h2>
                  <p className="text-muted-foreground">Your donation has been processed successfully</p>
                </div>
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-1">New Balance</p>
                  <p className="text-3xl font-bold text-foreground" data-testid="text-balance">
                    R {((tagInfo?.balanceZAR || 0) / 100).toFixed(2)}
                  </p>
                </div>
                <Button 
                  onClick={() => setLocation(`/quick-donate/${tagCode}`)}
                  variant="outline"
                  className="w-full"
                  data-testid="button-done"
                >
                  Done
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card data-testid="card-tag-info">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TagIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">Freedom Tag {tagInfo?.tagCode}</CardTitle>
                    <CardDescription>Tap to Donate</CardDescription>
                  </div>
                  <Smartphone className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                  <p className="text-3xl font-bold text-foreground" data-testid="text-balance">
                    R {((tagInfo?.balanceZAR || 0) / 100).toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-quick-amounts">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Quick Donate</CardTitle>
                <CardDescription>Choose an amount or enter your own</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {presetAmounts.map((preset) => (
                    <Button
                      key={preset.value}
                      onClick={() => setAmount(String(preset.value))}
                      variant={amount === String(preset.value) ? "default" : "outline"}
                      size="lg"
                      className="h-16 text-xl"
                      data-testid={`button-quick-${preset.label.toLowerCase().replace('r', '')}`}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">or</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Custom Amount (cents)</label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter cents (e.g., 1500)"
                      className="text-lg"
                      data-testid="input-custom-amount"
                    />
                    {amount && Number(amount) > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        = R {(Number(amount) / 100).toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* Payment Buttons */}
                  <div className="space-y-2 pt-2">
                    <Button
                      onClick={() => handleBankPayment(Number(amount))}
                      disabled={!amount || Number(amount) <= 0 || isPayingBank || isPayingCrypto}
                      size="lg"
                      className="w-full h-12"
                      data-testid="button-pay-bank"
                    >
                      {isPayingBank ? 'Processing...' : 'Pay with Bank'}
                    </Button>
                    <Button
                      onClick={() => handleCryptoPayment(Number(amount))}
                      disabled={!amount || Number(amount) <= 0 || isPayingBank || isPayingCrypto}
                      variant="outline"
                      size="lg"
                      className="w-full h-12"
                      data-testid="button-pay-crypto"
                    >
                      {isPayingCrypto ? 'Processing...' : 'Pay with Crypto'}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center pt-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Secure instant payment</span>
                </div>
              </CardContent>
            </Card>

            <DonationQRCode 
              url={`${window.location.origin}/quick-donate/${tagCode}`}
              tagCode={tagCode}
              size={140}
            />

            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => setShowScanner(true)}
                data-testid="button-scan-qr"
              >
                <ScanLine className="w-4 h-4" />
                Scan Different Tag
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation(`/tag/${tagCode}`)}
                data-testid="button-full-view"
              >
                View Full Details
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
