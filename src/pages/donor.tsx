import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Tag as TagIcon, CheckCircle, Smartphone, QrCode, Bitcoin, Lock, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import DonationQRCode from "@/components/DonationQRCode";

interface TagInfo {
  tagCode: string;
  walletId: string;
  balanceZAR: number;
}

export default function Donor() {
  const { tagCode } = useParams<{ tagCode: string }>();
  const [, setLocation] = useLocation();
  const [amount, setAmount] = useState("10000");
  const [isPaying, setIsPaying] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [beneficiaryName, setBeneficiaryName] = useState("");

  const params = new URLSearchParams(window.location.search);
  const justPaid = params.get('paid') === '1';
  const cryptoType = params.get('crypto');

  // Check authentication on mount (optional - page works without auth)
  useEffect(() => {
    const authData = sessionStorage.getItem(`auth_${tagCode}`);
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        // Check if authentication is recent (within 1 hour)
        const isRecent = Date.now() - parsed.timestamp < 3600000;
        if (parsed.authenticated && isRecent) {
          setIsAuthenticated(true);
          setBeneficiaryName(parsed.beneficiaryName || "");
        }
      } catch (e) {
        // Invalid auth data
      }
    }
    // No redirect - allow public access for donations
  }, [tagCode]);

  const { data: tagInfo, isLoading } = useQuery<TagInfo>({
    queryKey: [`/api/tag/${tagCode}`],
    queryFn: async () => {
      const response = await fetch(`/api/tag/${tagCode}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tag information');
      }
      return response.json();
    },
  });

  const handleDonate = async () => {
    setIsPaying(true);
    try {
      // Use public endpoint for unauthenticated donations
      const response = await fetch('/api/donate/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagCode, amountZAR: Number(amount) }),
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

  const handleCryptoPay = async () => {
    setIsPaying(true);
    try {
      // Use public endpoint for unauthenticated crypto donations
      const response = await fetch('/api/crypto/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagCode, amountZAR: Number(amount) }),
      });
      const data = await response.json();
      if (data.cryptoSimUrl) {
        window.location.href = data.cryptoSimUrl;
      }
    } catch (error) {
      console.error('Crypto payment failed:', error);
      setIsPaying(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Call server logout endpoint
      await fetch('/api/donor/logout', { method: 'POST' });
      // Clear local session storage
      sessionStorage.removeItem(`auth_${tagCode}`);
      setLocation('/donor');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local storage and redirect
      sessionStorage.removeItem(`auth_${tagCode}`);
      setLocation('/donor');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tag information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground" data-testid="text-authenticated">
              Authenticated as: <strong className="text-foreground">{beneficiaryName}</strong>
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-2 text-foreground">My Freedom Tag Wallet</h1>
          <p className="text-muted-foreground">View your balance and accept donations</p>
        </div>

        {justPaid && (
          <Card className="mb-6 border-primary bg-primary/5" data-testid="card-success">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Payment Successful!</p>
                  <p className="text-sm text-muted-foreground">
                    {cryptoType 
                      ? `Your ${cryptoType} payment has been converted and processed` 
                      : 'Your donation has been processed'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card className="border-primary/50" data-testid="card-qr-code">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Scan QR Code</h3>
                  <p className="text-sm text-muted-foreground">Show this to donors for instant scan</p>
                </div>
                <Link href={`/tag-qr/${tagCode}`}>
                  <Button variant="default" data-testid="button-show-qr">
                    Show
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/50" data-testid="card-quick-tap">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Quick Tap to Donate</h3>
                  <p className="text-sm text-muted-foreground">Fast mobile donation with preset amounts</p>
                </div>
                <Link href={`/quick-donate/${tagCode}`}>
                  <Button variant="default" data-testid="button-quick-tap">
                    Open
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <DonationQRCode 
            url={`${window.location.origin}/quick-donate/${tagCode}`}
            tagCode={tagCode}
            size={160}
          />
        </div>

        <Card className="mb-6" data-testid="card-tag-info">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TagIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Tag {tagInfo?.tagCode}</CardTitle>
                <CardDescription>Current Balance</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground" data-testid="text-balance">
              R {((tagInfo?.balanceZAR || 0) / 100).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-donation-form">
          <CardHeader>
            <CardTitle>Make a Donation</CardTitle>
            <CardDescription>Enter the amount you wish to donate (in ZAR cents)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (ZAR cents)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10000"
                className="text-lg"
                data-testid="input-amount"
              />
              <p className="text-sm text-muted-foreground">
                R {(Number(amount) / 100).toFixed(2)} (Default: R100.00)
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <Button
                onClick={handleDonate}
                disabled={isPaying || !amount || Number(amount) <= 0}
                className="w-full text-lg py-6"
                size="lg"
                data-testid="button-donate"
              >
                {isPaying ? 'Processing...' : 'Donate with Bank'}
              </Button>

              <Button
                onClick={handleCryptoPay}
                disabled={isPaying || !amount || Number(amount) <= 0}
                className="w-full text-lg py-6"
                size="lg"
                variant="outline"
                data-testid="button-crypto-donate"
              >
                <Bitcoin className="w-5 h-5 mr-2" />
                {isPaying ? 'Processing...' : 'Pay with Crypto'}
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
              <CheckCircle className="w-4 h-4" />
              <span>Secure donation processing (BTC, ETH, USDT supported)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
