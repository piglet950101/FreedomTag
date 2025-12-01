import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Wallet, Copy, Check, QrCode, CreditCard, Building2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import QRCode from "react-qr-code";
import { queryClient, apiRequest } from "@/lib/queryClient";

const CRYPTO_OPTIONS = [
  { value: 'BTC', label: 'Bitcoin (BTC)', rate: 1200000 },
  { value: 'ETH', label: 'Ethereum (ETH)', rate: 55000 },
  { value: 'USDT', label: 'Tether (USDT)', rate: 18.50 },
];

interface PhilanthropistResponse {
  id: string;
  email: string;
  displayName: string | null;
  walletId: string;
  balanceZAR: number;
}

export default function PhilanthropistFund() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [fundingType, setFundingType] = useState<'crypto' | 'fiat'>('crypto');
  const [crypto, setCrypto] = useState('USDT');
  const [amountZAR, setAmountZAR] = useState('');
  const [fiatMethod, setFiatMethod] = useState<'card' | 'eft'>('card');
  const [copied, setCopied] = useState(false);

  const { data: philanthropist } = useQuery<PhilanthropistResponse>({
    queryKey: ['/api/philanthropist/me'],
  });

  const cryptoFundMutation = useMutation({
    mutationFn: async (data: { crypto: string; amountCrypto: number }) => {
      return apiRequest('POST', '/api/philanthropist/fund', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/philanthropist/me'] });
      toast({
        title: "Funds added!",
        description: "Your account has been funded successfully",
      });
      setLocation('/philanthropist/dashboard');
    },
    onError: (error) => {
      toast({
        title: "Failed to add funds",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  const fiatFundMutation = useMutation({
    mutationFn: async (data: { method: string; amountZAR: number }) => {
      return apiRequest('POST', '/api/philanthropist/fund-fiat', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/philanthropist/me'] });
      toast({
        title: "Funds added!",
        description: "Your account has been funded successfully via Blockkoin rails",
      });
      setLocation('/philanthropist/dashboard');
    },
    onError: (error) => {
      toast({
        title: "Failed to add funds",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  if (!philanthropist) {
    return null;
  }

  const selectedCrypto = CRYPTO_OPTIONS.find(c => c.value === crypto);
  const cryptoAmount = amountZAR ? (parseFloat(amountZAR) / (selectedCrypto?.rate || 1)).toFixed(8) : '0';
  
  // Generate wallet address (simulated)
  const walletAddress = `${crypto}:${philanthropist.walletId.substring(0, 12)}...`;
  const fullAddress = `${crypto.toLowerCase()}:${philanthropist.walletId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Wallet address copied to clipboard",
    });
  };

  const handleCryptoFund = () => {
    const amount = parseFloat(amountZAR);
    const cryptoAmt = parseFloat(cryptoAmount);
    
    if (isNaN(amount) || amount <= 0 || isNaN(cryptoAmt) || cryptoAmt <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    cryptoFundMutation.mutate({
      crypto,
      amountCrypto: cryptoAmt,
    });
  };

  const handleFiatFund = () => {
    const amount = parseFloat(amountZAR);
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    fiatFundMutation.mutate({
      method: fiatMethod,
      amountZAR: amount, // Send in ZAR, backend converts to cents
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/philanthropist/dashboard">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Fund Your Account</h1>
          <p className="text-muted-foreground">
            Add funds to your philanthropist wallet - simple and instant
          </p>
        </div>

        <Tabs value={fundingType} onValueChange={(v) => setFundingType(v as 'crypto' | 'fiat')} className="mb-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2" data-testid="tabs-funding-type">
            <TabsTrigger value="crypto" data-testid="tab-crypto">Crypto</TabsTrigger>
            <TabsTrigger value="fiat" data-testid="tab-fiat">Fiat (Blockkoin Rails)</TabsTrigger>
          </TabsList>

          <TabsContent value="crypto" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card data-testid="card-quick-fund">
                <CardHeader>
                  <CardTitle>Quick Fund</CardTitle>
                  <CardDescription>Enter amount and crypto type</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="crypto">Cryptocurrency</Label>
                    <Select value={crypto} onValueChange={setCrypto}>
                      <SelectTrigger id="crypto" data-testid="select-crypto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CRYPTO_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount-zar">Amount (ZAR)</Label>
                    <Input
                      id="amount-zar"
                      type="text"
                      inputMode="numeric"
                      placeholder="100"
                      value={amountZAR}
                      onChange={(e) => setAmountZAR(e.target.value)}
                      data-testid="input-amount-zar"
                    />
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">You'll send:</p>
                    <p className="text-2xl font-bold" data-testid="text-crypto-amount">
                      {cryptoAmount} {crypto}
                    </p>
                  </div>

                  <Button 
                    type="button"
                    className="w-full" 
                    size="lg"
                    onClick={handleCryptoFund}
                    disabled={cryptoFundMutation.isPending}
                    data-testid="button-fund-now"
                  >
                    {cryptoFundMutation.isPending ? "Processing..." : "Fund Now"}
                  </Button>
                </CardContent>
              </Card>

              <Card data-testid="card-qr-code">
                <CardHeader>
                  <CardTitle>Scan & Pay</CardTitle>
                  <CardDescription>Send crypto to your wallet address</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white p-4 rounded-lg flex items-center justify-center">
                    <QRCode value={fullAddress} size={180} />
                  </div>

                  <div className="space-y-2">
                    <Label>Your Wallet Address</Label>
                    <div className="flex gap-2">
                      <Input
                        value={walletAddress}
                        readOnly
                        className="font-mono text-sm"
                        data-testid="input-wallet-address"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleCopy}
                        data-testid="button-copy-address"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>How it works:</strong>
                    </p>
                    <ol className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1 list-decimal list-inside">
                      <li>Scan QR code with your crypto wallet</li>
                      <li>Or copy the wallet address</li>
                      <li>Send any amount - funds appear instantly</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="fiat" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card data-testid="card-fiat-fund">
                <CardHeader>
                  <CardTitle>Fiat Funding</CardTitle>
                  <CardDescription>Add ZAR via Blockkoin payment rails</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fiat-method">Payment Method</Label>
                    <Select value={fiatMethod} onValueChange={(v) => setFiatMethod(v as 'card' | 'eft')}>
                      <SelectTrigger id="fiat-method" data-testid="select-fiat-method">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="card">Instant Card Payment</SelectItem>
                        <SelectItem value="eft">Bank Transfer (EFT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fiat-amount">Amount (ZAR)</Label>
                    <Input
                      id="fiat-amount"
                      type="text"
                      inputMode="numeric"
                      placeholder="100"
                      value={amountZAR}
                      onChange={(e) => setAmountZAR(e.target.value)}
                      data-testid="input-fiat-amount"
                    />
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Processing via:</p>
                    <p className="text-lg font-semibold" data-testid="text-fiat-method">
                      {fiatMethod === 'card' ? 'Instant Card Payment' : 'Bank Transfer (EFT)'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {fiatMethod === 'card' ? 'Funds available immediately' : 'Instant demo processing'}
                    </p>
                  </div>

                  <Button 
                    type="button"
                    className="w-full" 
                    size="lg"
                    onClick={handleFiatFund}
                    disabled={fiatFundMutation.isPending}
                    data-testid="button-fiat-fund"
                  >
                    {fiatFundMutation.isPending ? "Processing..." : "Fund via Blockkoin"}
                  </Button>
                </CardContent>
              </Card>

              <Card data-testid="card-fiat-info">
                <CardHeader>
                  <CardTitle>About Blockkoin Rails</CardTitle>
                  <CardDescription>Secure fiat payment infrastructure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    {fiatMethod === 'card' ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">Instant Card Payment</p>
                            <p className="text-sm text-muted-foreground">Credit or Debit Card</p>
                          </div>
                        </div>
                        <ul className="text-sm space-y-2 ml-13">
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5" />
                            <span>Funds available immediately</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5" />
                            <span>Secure card processing</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5" />
                            <span>No setup required</span>
                          </li>
                        </ul>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">Bank Transfer (EFT)</p>
                            <p className="text-sm text-muted-foreground">Electronic Funds Transfer</p>
                          </div>
                        </div>
                        <ul className="text-sm space-y-2 ml-13">
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5" />
                            <span>Lower fees than cards</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5" />
                            <span>Bank-level security</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5" />
                            <span>Higher limits available</span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-900 dark:text-blue-100 font-semibold mb-2">
                      Powered by Blockkoin
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Blockkoin provides secure fiat-to-crypto payment rails with instant settlement and bank-grade security.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <QrCode className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Instant</h3>
              <p className="text-sm text-muted-foreground">Funds available immediately</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Secure</h3>
              <p className="text-sm text-muted-foreground">Bank-grade security</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Simple</h3>
              <p className="text-sm text-muted-foreground">Multiple payment options</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
