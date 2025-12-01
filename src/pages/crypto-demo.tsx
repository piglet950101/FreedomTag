import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bitcoin, TrendingUp, Zap, Shield, CheckCircle2, AlertTriangle, Coins } from "lucide-react";

interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: number;
}

export default function CryptoDemo() {
  const [amount, setAmount] = useState<string>("25");
  const [currency, setCurrency] = useState<string>("USDT");
  const [targetCurrency, setTargetCurrency] = useState<string>("ZAR");
  const [autoConvert, setAutoConvert] = useState<boolean>(true);

  // Fetch exchange rates in display currency (ZAR) for conversion display
  const { data: displayRates } = useQuery<ExchangeRate[]>({
    queryKey: [`/api/blockkoin/rates?target=${targetCurrency}`],
  });

  // Fetch exchange rates in USD for accurate KYC threshold calculation
  const { data: usdRates } = useQuery<ExchangeRate[]>({
    queryKey: [`/api/blockkoin/rates?target=USD`],
  });

  const selectedDisplayRate = displayRates?.find(r => r.from === currency);
  const selectedUSDRate = usdRates?.find(r => r.from === currency);
  
  // Calculate USD value for KYC threshold (accurate for all cryptos)
  const cryptoAmount = parseFloat(amount || "0");
  let amountUSD = 0;
  
  if (selectedUSDRate && cryptoAmount > 0) {
    // Convert crypto directly to USD using Blockkoin rates (cents)
    const usdCents = cryptoAmount * selectedUSDRate.rate;
    amountUSD = usdCents / 100; // Convert cents to dollars
  }
  
  const requiresKYC = amountUSD > 50;
  
  // Calculate converted amount in cents (for display)
  const convertedAmount = selectedDisplayRate 
    ? Math.floor(parseFloat(amount || "0") * selectedDisplayRate.rate)
    : 0;

  // Display amount in rands
  const displayAmount = (convertedAmount / 100).toFixed(2);

  const cryptoOptions = [
    { value: "USDT", label: "USDT (Tether)", icon: "💵" },
    { value: "BTC", label: "Bitcoin", icon: "₿" },
    { value: "ETH", label: "Ethereum", icon: "Ξ" },
    { value: "USDC", label: "USD Coin", icon: "💲" },
    { value: "DAI", label: "DAI", icon: "◈" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bitcoin className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Blockkoin Freedom Tag</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Powered by Blockkoin Exchange
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Real crypto donations with automatic fiat conversion
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Demo Form */}
          <div className="space-y-6">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-primary" />
                  Try Crypto Donation
                </CardTitle>
                <CardDescription>
                  Experience seamless crypto-to-fiat conversion
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cryptocurrency Selection */}
                <div className="space-y-2">
                  <Label>Select Cryptocurrency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger data-testid="select-crypto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cryptoOptions.map((crypto) => (
                        <SelectItem key={crypto.value} value={crypto.value}>
                          <span className="flex items-center gap-2">
                            <span>{crypto.icon}</span>
                            <span>{crypto.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <Label>Amount in {currency}</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    data-testid="input-crypto-amount"
                  />
                  <p className="text-sm text-muted-foreground">
                    Exchange rate: 1 {currency} = {selectedDisplayRate ? `R${(selectedDisplayRate.rate / 100).toFixed(2)}` : '...'}
                  </p>
                </div>

                {/* Auto-Convert Toggle */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Auto-Convert to {targetCurrency}</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically convert to local currency
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={autoConvert ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAutoConvert(!autoConvert)}
                    data-testid="toggle-auto-convert"
                  >
                    {autoConvert ? "ON" : "OFF"}
                  </Button>
                </div>

                {/* Converted Amount Display */}
                {autoConvert && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">Beneficiary Receives</p>
                        <p className="text-3xl font-bold text-primary">
                          R {displayAmount}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {amount} {currency} → {targetCurrency}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* KYC Alert */}
                {requiresKYC ? (
                  <Alert className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800 dark:text-orange-300">
                      <strong>Verification Required:</strong> Donations over $50 require KYC verification via Blockkoin for compliance.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
                    <Zap className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-300">
                      <strong>Frictionless:</strong> Donations under $50 require no signup or KYC!
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  className="w-full" 
                  size="lg"
                  data-testid="button-donate-crypto"
                >
                  <Bitcoin className="h-5 w-5 mr-2" />
                  Donate {amount} {currency}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Features */}
          <div className="space-y-6">
            {/* Auto Account Creation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-primary" />
                  Auto Blockkoin Account
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Every Freedom Tag signup automatically creates a linked Blockkoin account to receive cryptocurrency.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">No Duplicate Signups</p>
                      <p className="text-xs text-muted-foreground">
                        Existing Blockkoin users are automatically linked
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Seamless Integration</p>
                      <p className="text-xs text-muted-foreground">
                        One signup for both platforms
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="h-5 w-5 text-primary" />
                  Smart Thresholds
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Under $50</p>
                      <p className="text-xs text-muted-foreground">Instant, no verification</p>
                    </div>
                    <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                      Frictionless
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Over $50</p>
                      <p className="text-xs text-muted-foreground">KYC verification required</p>
                    </div>
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-700 border-orange-500/20">
                      Compliance
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supported Currencies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bitcoin className="h-5 w-5 text-primary" />
                  Supported Cryptocurrencies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {cryptoOptions.map((crypto) => (
                    <Badge key={crypto.value} variant="secondary" className="px-3 py-1">
                      {crypto.icon} {crypto.value}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="px-3 py-1">
                    + Many More via Blockkoin
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  All cryptocurrencies supported by Blockkoin Exchange with real-time rates
                </p>
              </CardContent>
            </Card>

            {/* Demo Mode Notice */}
            <Alert>
              <AlertDescription className="text-sm">
                <strong>Demo Mode:</strong> Currently running with simulated Blockkoin API. 
                Configure BLOCKKOIN_API_KEY for production use.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
}
