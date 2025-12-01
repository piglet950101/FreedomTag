import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  ArrowRightLeft, 
  Shield, 
  Zap,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BuyCryptoProps {
  userType: 'tag' | 'philanthropist';
  walletId: string;
  userId?: string;
  currentBalance: number; // Balance in cents
}

interface ExchangeRate {
  from: string;
  to: string;
  rate: number; // Rate in cents
  timestamp: number;
}

export function BuyCrypto({ userType, walletId, userId, currentBalance }: BuyCryptoProps) {
  const { toast } = useToast();
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [activeTab, setActiveTab] = useState("buy");

  // Fetch USDT exchange rate
  const { data: rates } = useQuery<ExchangeRate[]>({
    queryKey: ['/api/blockkoin/rates?target=ZAR'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const usdtRate = rates?.find(r => r.from === 'USDT');
  
  // Calculate conversions
  const buyAmountNum = parseFloat(buyAmount || "0");
  const sellAmountNum = parseFloat(sellAmount || "0");
  
  // For buying: ZAR → USDT
  const usdtReceived = usdtRate ? (buyAmountNum * 100) / usdtRate.rate : 0;
  const buyAmountUSD = usdtReceived; // USDT is 1:1 with USD
  
  // For selling: USDT → ZAR
  const zarReceived = usdtRate ? (sellAmountNum * usdtRate.rate) / 100 : 0;

  // KYC requirements
  const buyRequiresKYC = buyAmountUSD > 50;
  const sellRequiresKYC = sellAmountNum > 50;

  // Buy USDT mutation
  const buyMutation = useMutation({
    mutationFn: async (data: { amountZAR: number }) => {
      return apiRequest<{
        success: boolean;
        usdtPurchased: number;
        zarSpent: number;
        fee: number;
        totalCost: number;
        blockchainTxHash?: string;
      }>('POST', '/api/crypto/buy', data);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/philanthropist/dashboard'] });
      toast({
        title: "✅ USDT Purchased!",
        description: `${response.usdtPurchased.toFixed(2)} USDT purchased • Fee: R${response.fee.toFixed(2)} • Total: R${response.totalCost.toFixed(2)}`,
      });
      setBuyAmount("");
      setShowBlockchainProof(true);
      setLastTransaction(response.blockchainTxHash || null);
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Could not complete purchase",
        variant: "destructive",
      });
    },
  });

  // Sell USDT mutation
  const sellMutation = useMutation({
    mutationFn: async (data: { amountUSDT: number }) => {
      return apiRequest<{
        success: boolean;
        usdtSold: number;
        zarGross: number;
        fee: number;
        zarReceived: number;
        blockchainTxHash?: string;
      }>('POST', '/api/crypto/sell', data);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/philanthropist/dashboard'] });
      toast({
        title: "✅ USDT Sold!",
        description: `Received R${response.zarReceived.toFixed(2)} • Fee: R${response.fee.toFixed(2)} • Gross: R${response.zarGross.toFixed(2)}`,
      });
      setSellAmount("");
      setShowBlockchainProof(true);
      setLastTransaction(response.blockchainTxHash || null);
    },
    onError: (error: Error) => {
      toast({
        title: "Sale Failed",
        description: error.message || "Could not complete sale",
        variant: "destructive",
      });
    },
  });

  const handleBuy = () => {
    if (buyAmountNum < 1) {
      toast({
        title: "Invalid Amount",
        description: "Minimum purchase is R 1.00",
        variant: "destructive",
      });
      return;
    }

    if (buyRequiresKYC) {
      toast({
        title: "KYC Required",
        description: "Purchases over $50 USD require identity verification",
        variant: "destructive",
      });
      return;
    }

    buyMutation.mutate({ amountZAR: buyAmountNum * 100 }); // Convert to cents
  };

  const handleSell = () => {
    if (sellAmountNum < 1) {
      toast({
        title: "Invalid Amount",
        description: "Minimum sale is 1 USDT",
        variant: "destructive",
      });
      return;
    }

    if (sellRequiresKYC) {
      toast({
        title: "KYC Required",
        description: "Sales over $50 USD require identity verification",
        variant: "destructive",
      });
      return;
    }

    sellMutation.mutate({ amountUSDT: sellAmountNum });
  };

  return (
    <Card className="w-full" data-testid="card-buy-crypto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-primary" />
              Buy & Sell Crypto
            </CardTitle>
            <CardDescription>
              Powered by Blockkoin Exchange • Instant transactions
            </CardDescription>
          </div>
          {usdtRate && (
            <Badge variant="outline" className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              1 USDT = R {(usdtRate.rate / 100).toFixed(2)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy" data-testid="tab-buy">
              Buy USDT
            </TabsTrigger>
            <TabsTrigger value="sell" data-testid="tab-sell">
              Sell USDT
            </TabsTrigger>
          </TabsList>

          {/* Buy Tab */}
          <TabsContent value="buy" className="space-y-4 mt-4">
            <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Why USDT?</strong> Stablecoin pegged 1:1 to USD • Lower fees • Fastest settlement • Full blockchain transparency
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="buy-amount">Amount in Rands (ZAR)</Label>
              <Input
                id="buy-amount"
                type="number"
                placeholder="100.00"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                data-testid="input-buy-amount"
                min="1"
                step="0.01"
              />
              <p className="text-sm text-muted-foreground">
                Current balance: R {(currentBalance / 100).toFixed(2)}
              </p>
            </div>

            {buyAmountNum > 0 && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">You'll receive</span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    {usdtReceived.toFixed(2)} USDT
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Exchange rate</span>
                  <span>1 USDT = R {usdtRate ? (usdtRate.rate / 100).toFixed(2) : '--'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Settlement time</span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    Instant
                  </span>
                </div>
              </div>
            )}

            {buyRequiresKYC && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Purchases over $50 USD require identity verification (KYC). Please complete verification first.
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleBuy}
              className="w-full"
              size="lg"
              disabled={!buyAmountNum || buyRequiresKYC || buyMutation.isPending}
              data-testid="button-buy-usdt"
            >
              {buyMutation.isPending ? (
                "Processing..."
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Buy {usdtReceived.toFixed(2)} USDT for R {buyAmountNum.toFixed(2)}
                </>
              )}
            </Button>
          </TabsContent>

          {/* Sell Tab */}
          <TabsContent value="sell" className="space-y-4 mt-4">
            <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <strong>Instant Cash Out:</strong> Convert your USDT back to ZAR instantly. Funds available immediately.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="sell-amount">Amount in USDT</Label>
              <Input
                id="sell-amount"
                type="number"
                placeholder="10.00"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                data-testid="input-sell-amount"
                min="1"
                step="0.01"
              />
              <p className="text-sm text-muted-foreground">
                Available USDT: View in your wallet
              </p>
            </div>

            {sellAmountNum > 0 && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">You'll receive</span>
                  <span className="text-xl font-bold text-primary">
                    R {zarReceived.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Exchange rate</span>
                  <span>1 USDT = R {usdtRate ? (usdtRate.rate / 100).toFixed(2) : '--'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Settlement time</span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    Instant
                  </span>
                </div>
              </div>
            )}

            {sellRequiresKYC && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Sales over $50 USD require identity verification (KYC). Please complete verification first.
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleSell}
              className="w-full"
              size="lg"
              variant="secondary"
              disabled={!sellAmountNum || sellRequiresKYC || sellMutation.isPending}
              data-testid="button-sell-usdt"
            >
              {sellMutation.isPending ? (
                "Processing..."
              ) : (
                <>
                  <CheckCircle2 className="w-4 w-4 mr-2" />
                  Sell {sellAmountNum.toFixed(2)} USDT for R {zarReceived.toFixed(2)}
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Blockchain Transparency Footer */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>100% Blockchain Transparent</span>
            </div>
            <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent" asChild>
              <a 
                href="/blockchain-tracking" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1"
                data-testid="link-view-transactions"
              >
                View all transactions
                <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
