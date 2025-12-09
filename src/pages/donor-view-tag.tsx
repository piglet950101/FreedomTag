import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, User, Calendar, TrendingUp, ArrowLeft, Wallet, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import DonationQRCode from "@/components/DonationQRCode";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface TagInfo {
  tagCode: string;
  walletId: string;
  balanceZAR: number;
  beneficiaryName?: string;
  beneficiaryType?: string;
  createdAt?: string;
  organization?: {
    name: string;
    smartContractAddress?: string;
  };
}

interface Donation {
  id: string;
  amount: number;
  createdAt: string;
  donorName?: string;
}

export default function DonorViewTag() {
  const { tagCode } = useParams<{ tagCode: string }>();
  const [, setLocation] = useLocation();
  const [amount, setAmount] = useState("0");
  const [isPayingBank, setIsPayingBank] = useState(false);
  const [isPayingCrypto, setIsPayingCrypto] = useState(false);
  const { toast } = useToast();

  // Check for payment success in URL
  const params = new URLSearchParams(window.location.search);
  const paid = params.get('paid');
  const crypto = params.get('crypto');

  useEffect(() => {
    if (paid === '1') {
      toast({
        title: "🎉 Donation Successful!",
        description: crypto 
          ? `Your crypto donation was processed successfully!` 
          : `Your donation was processed successfully!`,
      });
      // Clean up URL
      window.history.replaceState({}, '', `/donor/view/${tagCode}`);
    }
  }, [paid, crypto, tagCode, toast]);

  const { data: tagInfo, isLoading } = useQuery<TagInfo>({
    queryKey: [`/api/tag/${tagCode}`],
  });

  const { data: donationsData } = useQuery<{ donations: Donation[] }>({
    queryKey: [`/api/tag/${tagCode}/donations`],
  });

  const handleBankPayment = async (amountZAR: number) => {
    setIsPayingBank(true);
    try {
      const response = await fetch('/api/donate/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagCode, amountZAR }),
      });
      const data = await response.json();
      if (data.bankSimUrl) {
        window.location.href = data.bankSimUrl;
      }
    } catch (error) {
      console.error('Bank payment failed:', error);
      setIsPayingBank(false);
    }
  };

  const handleCryptoPayment = async (amountZAR: number) => {
    setIsPayingCrypto(true);
    try {
      const response = await fetch('/api/crypto/public', {
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

  const presetAmounts = [10, 20, 50, 100, 200];

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/donor">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Donor Home
          </Button>
        </Link>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Story & Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Beneficiary Card */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">
                        {tagInfo?.beneficiaryName || 'Beneficiary'}
                      </CardTitle>
                      <CardDescription className="text-base">
                        Freedom Tag: <span className="font-mono font-semibold">{tagCode}</span>
                      </CardDescription>
                    </div>
                  </div>
                  {tagInfo?.organization?.smartContractAddress && (
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Story Section */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary" />
                    Their Story
                  </h3>
                  <p className="text-muted-foreground">
                    {tagInfo?.beneficiaryName || 'This person'} is part of the Freedom Tag program, 
                    empowering financial inclusion and dignity through blockchain technology.
                    Your donation goes 100% directly to them.
                  </p>
                </div>

                {/* Organization */}
                {tagInfo?.organization && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      Verified Organization
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Managed by: <span className="font-semibold">{tagInfo.organization.name}</span>
                    </p>
                    {tagInfo.organization.smartContractAddress && (
                      <p className="text-xs text-muted-foreground font-mono mt-1">
                        Smart Contract: {tagInfo.organization.smartContractAddress.substring(0, 10)}...
                      </p>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" />
                      Member Since
                    </div>
                    <p className="font-semibold">
                      {tagInfo?.createdAt 
                        ? new Date(tagInfo.createdAt).toLocaleDateString() 
                        : 'Recently'}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <TrendingUp className="w-4 h-4" />
                      Total Received
                    </div>
                    <p className="font-semibold">
                      {donationsData?.donations?.length || 0} donations
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Support */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Support</CardTitle>
                <CardDescription>Latest donations from generous donors</CardDescription>
              </CardHeader>
              <CardContent>
                {donationsData?.donations && donationsData.donations.length > 0 ? (
                  <div className="space-y-3">
                    {donationsData.donations.slice(0, 5).map((donation) => (
                      <div key={donation.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-3">
                          <Heart className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-sm font-medium">
                              {donation.donorName || 'Anonymous Donor'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(donation.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-primary">
                          R{(donation.amount / 100).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Be the first to donate!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Donation Form */}
          <div className="space-y-6">
            {/* Balance Display */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6 text-center">
                <Wallet className="w-10 h-10 text-primary mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                <p className="text-3xl font-bold text-foreground">
                  R{((tagInfo?.balanceZAR || 0) / 100).toFixed(2)}
                </p>
              </CardContent>
            </Card>

            {/* Donation Form */}
            <Card>
              <CardHeader>
                <CardTitle>Make a Donation</CardTitle>
                <CardDescription>Every rand makes a difference</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preset Amounts */}
                <div className="grid grid-cols-2 gap-2">
                  {presetAmounts.map((amt) => (
                    <Button
                      key={amt}
                      variant={amount === String(amt * 100) ? "default" : "outline"}
                      onClick={() => setAmount(String(amt * 100))}
                      data-testid={`button-preset-${amt}`}
                    >
                      R{amt}
                    </Button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Custom Amount (R)</label>
                  <Input
                    type="number"
                    value={(Number(amount) / 100).toFixed(1)}
                    onChange={(e) => setAmount(String(Math.round(Number(e.target.value) * 100)))}
                    min="0"
                    step="0.1"
                    data-testid="input-custom-amount"
                  />
                </div>

                {/* Donate Buttons */}
                <div className="space-y-3">
                  <Button
                    className="w-full h-12 text-lg"
                    onClick={() => handleBankPayment(Number(amount))}
                    disabled={isPayingBank || isPayingCrypto || !amount || Number(amount) <= 0}
                    data-testid="button-donate-bank"
                  >
                    {isPayingBank ? 'Processing...' : `Donate with Bank`}
                  </Button>

                  <Button
                    className="w-full h-12 text-lg"
                    variant="outline"
                    onClick={() => handleCryptoPayment(Number(amount))}
                    disabled={isPayingBank || isPayingCrypto || !amount || Number(amount) <= 0}
                    data-testid="button-donate-crypto"
                  >
                    {isPayingCrypto ? 'Processing...' : `Pay with Crypto`}
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Secure payment • 100% goes to beneficiary
                </p>
              </CardContent>
            </Card>

            {/* QR Code */}
            <DonationQRCode
              url={`${window.location.origin}/donor/view/${tagCode}`}
              tagCode={tagCode}
              size={140}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
