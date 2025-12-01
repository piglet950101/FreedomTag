import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag as TagIcon, CheckCircle, Smartphone } from "lucide-react";
import { useState } from "react";
import DonationQRCode from "@/components/DonationQRCode";

interface TagInfo {
  tagCode: string;
  walletId: string;
  balanceZAR: number;
}

export default function QuickDonate() {
  const { tagCode } = useParams<{ tagCode: string }>();
  const [, setLocation] = useLocation();
  const [customAmount, setCustomAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const justPaid = params.get('paid') === '1';

  const { data: tagInfo, isLoading } = useQuery<TagInfo>({
    queryKey: [`/api/tag/${tagCode}`],
  });

  const presetAmounts = [
    { label: "R10", value: 1000 },
    { label: "R20", value: 2000 },
    { label: "R50", value: 5000 },
    { label: "R100", value: 10000 },
  ];

  const handleQuickDonate = async (amountZAR: number) => {
    setIsPaying(true);
    try {
      const response = await fetch('/api/donate/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagCode, amountZAR }),
      });
      const data = await response.json();
      if (data.bankSimUrl) {
        window.location.href = data.bankSimUrl;
      }
    } catch (error) {
      console.error('Donation failed:', error);
      setIsPaying(false);
    }
  };

  const handleCustomDonate = () => {
    const amount = Number(customAmount);
    if (amount > 0) {
      handleQuickDonate(amount);
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
                      onClick={() => handleQuickDonate(preset.value)}
                      disabled={isPaying}
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
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Enter cents (e.g., 1500)"
                      className="flex-1 text-lg"
                      data-testid="input-custom-amount"
                    />
                    <Button
                      onClick={handleCustomDonate}
                      disabled={!customAmount || Number(customAmount) <= 0 || isPaying}
                      size="lg"
                      data-testid="button-custom-donate"
                    >
                      {isPaying ? 'Processing...' : 'Pay'}
                    </Button>
                  </div>
                  {customAmount && Number(customAmount) > 0 && (
                    <p className="text-sm text-muted-foreground text-center">
                      = R {(Number(customAmount) / 100).toFixed(2)}
                    </p>
                  )}
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

            <div className="text-center">
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
