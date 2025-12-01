import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Heart, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import DonationQRCode from "@/components/DonationQRCode";

interface TagInfo {
  tagCode: string;
  walletId: string;
  balanceZAR: number;
}

// Amounts in cents (ZAR cents)
const PRESET_AMOUNTS = [
  { label: "R20", value: 2000 },
  { label: "R50", value: 5000 },
  { label: "R100", value: 10000 },
  { label: "R200", value: 20000 },
];

export default function KioskDonate() {
  const { tagCode } = useParams<{ tagCode: string }>();
  const [, setLocation] = useLocation();
  const [customAmount, setCustomAmount] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const justPaid = params.get('paid') === '1';

  const { data: tagInfo, isLoading } = useQuery<TagInfo>({
    queryKey: [`/api/tag/${tagCode}`],
  });

  // Auto-redirect to kiosk home after successful donation
  useEffect(() => {
    if (justPaid) {
      const timer = setTimeout(() => {
        setLocation('/kiosk');
      }, 5000); // 5 seconds

      return () => clearTimeout(timer);
    }
  }, [justPaid, setLocation]);

  const handleDonate = async (amountZAR: number) => {
    setIsPaying(true);
    try {
      const response = await fetch('/api/donate/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagCode, amountZAR }),
      });
      const data = await response.json();
      if (data.bankSimUrl) {
        // Add source=kiosk parameter for proper redirect after payment
        window.location.href = `${data.bankSimUrl}&source=kiosk`;
      }
    } catch (error) {
      console.error('Donation failed:', error);
      setIsPaying(false);
    }
  };

  const handlePresetClick = (amountCents: number) => {
    setCustomAmount("");
    handleDonate(amountCents);
  };

  const handleCustomDonate = () => {
    const amountRand = parseFloat(customAmount);
    if (!isNaN(amountRand) && amountRand > 0) {
      // Convert rand to cents
      const amountCents = Math.round(amountRand * 100);
      handleDonate(amountCents);
    }
  };

  if (isLoading || !tagCode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (justPaid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl border-primary bg-primary/5" data-testid="card-success">
          <CardContent className="pt-12 pb-12">
            <div className="text-center space-y-8">
              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-16 h-16 text-primary" />
              </div>
              <div>
                <h2 className="text-5xl font-bold text-foreground mb-4">Thank You!</h2>
                <p className="text-2xl text-muted-foreground">Your donation has been received</p>
              </div>
              <div className="pt-4">
                <p className="text-xl text-muted-foreground mb-2">New Balance for {tagCode}</p>
                <p className="text-6xl font-bold text-foreground" data-testid="text-balance">
                  R {((tagInfo?.balanceZAR || 0) / 100).toFixed(2)}
                </p>
              </div>
              <p className="text-lg text-muted-foreground pt-4">
                Returning to home screen in 5 seconds...
              </p>
              <Button 
                onClick={() => setLocation('/kiosk')}
                size="lg"
                className="h-16 px-12 text-xl"
                data-testid="button-return-home"
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setLocation('/kiosk')}
              className="text-primary-foreground hover:bg-primary-foreground/20"
              data-testid="button-back"
            >
              <ArrowLeft className="w-8 h-8" />
            </Button>
            <div className="flex items-center gap-4">
              <Heart className="w-12 h-12" />
              <h1 className="text-4xl font-bold">Donate to {tagCode}</h1>
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg text-primary-foreground/90 mb-2">Current Balance</p>
            <p className="text-5xl font-bold" data-testid="text-balance">
              R {((tagInfo?.balanceZAR || 0) / 100).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Donation Options */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Card data-testid="card-donate">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Select Donation Amount</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Preset Amounts */}
            <div className="grid grid-cols-2 gap-6">
              {PRESET_AMOUNTS.map((preset) => (
                <Button
                  key={preset.value}
                  variant="outline"
                  size="lg"
                  className="h-32 text-4xl font-bold border-2 hover:border-primary"
                  onClick={() => handlePresetClick(preset.value)}
                  disabled={isPaying}
                  data-testid={`button-amount-${preset.value / 100}`}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-sm uppercase">
                <span className="bg-background px-4 text-muted-foreground text-xl">
                  or enter custom amount
                </span>
              </div>
            </div>

            {/* Custom Amount */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl text-muted-foreground">
                    R
                  </span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="h-20 pl-14 text-3xl"
                    min="0"
                    step="0.01"
                    data-testid="input-custom-amount"
                  />
                </div>
                <Button
                  variant="default"
                  size="lg"
                  className="h-20 px-12 text-2xl"
                  onClick={handleCustomDonate}
                  disabled={!customAmount || isPaying}
                  data-testid="button-custom-donate"
                >
                  Donate
                </Button>
              </div>
            </div>

            {isPaying && (
              <div className="text-center py-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-lg text-muted-foreground">Processing...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8">
          <DonationQRCode 
            url={`${window.location.origin}/kiosk/donate/${tagCode}`}
            tagCode={tagCode}
            size={180}
          />
        </div>
      </div>
    </div>
  );
}
