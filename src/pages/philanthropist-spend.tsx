import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ShoppingCart, Store } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface PhilanthropistResponse {
  id: string;
  email: string;
  displayName: string | null;
  walletId: string;
  balanceZAR: number;
}

interface MerchantOutlet {
  id: string;
  name: string;
  chainName: string;
  location: string;
}

export default function PhilanthropistSpend() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [outletCode, setOutletCode] = useState('');
  const [amount, setAmount] = useState('');
  const [searchedOutlet, setSearchedOutlet] = useState<MerchantOutlet | null>(null);

  const { data: philanthropist } = useQuery<PhilanthropistResponse>({
    queryKey: ['/api/philanthropist/me'],
  });

  const searchMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch(`/api/merchant/outlets/${code}`);
      if (!response.ok) {
        throw new Error('Outlet not found');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setSearchedOutlet(data);
    },
    onError: (error: any) => {
      toast({
        title: "Outlet not found",
        description: error.message || "Please check the outlet code",
        variant: "destructive",
      });
    },
  });

  const spendMutation = useMutation({
    mutationFn: async (data: { outletId: string; amountZAR: number }) => {
      return apiRequest('POST', '/api/philanthropist/spend', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/philanthropist/me'] });
      toast({
        title: "Payment successful!",
        description: `R ${parseFloat(amount).toFixed(2)} spent at ${searchedOutlet?.name}`,
      });
      setLocation('/philanthropist/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  if (!philanthropist) {
    return null;
  }

  const formatZAR = (cents: number) => `R ${(cents / 100).toFixed(2)}`;

  const handleSearch = () => {
    if (!outletCode.trim()) {
      toast({
        title: "Enter outlet code",
        description: "Please enter a merchant outlet code",
        variant: "destructive",
      });
      return;
    }
    searchMutation.mutate(outletCode.toUpperCase());
  };

  const handleSpend = () => {
    if (!searchedOutlet) {
      toast({
        title: "Search for outlet first",
        description: "Please search for a merchant outlet before spending",
        variant: "destructive",
      });
      return;
    }

    const amountZAR = parseFloat(amount);
    const amountCents = amountZAR * 100;
    
    if (!amount || amountZAR <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (amountCents > philanthropist.balanceZAR) {
      toast({
        title: "Insufficient balance",
        description: "Please fund your account first",
        variant: "destructive",
      });
      return;
    }

    spendMutation.mutate({
      outletId: searchedOutlet.id,
      amountZAR: amountZAR, // Send in ZAR, backend converts to cents
    });
  };

  const quickAmounts = [50, 100, 200, 500];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href="/philanthropist/dashboard">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Spend at Merchants</h1>
          <p className="text-muted-foreground">
            Use your balance at participating merchant outlets
          </p>
        </div>

        <Card className="mb-6" data-testid="card-balance">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
              <p className="text-3xl font-bold text-primary" data-testid="text-balance">
                {formatZAR(philanthropist.balanceZAR)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6" data-testid="card-search">
          <CardHeader>
            <CardTitle>1. Find Merchant</CardTitle>
            <CardDescription>Enter the outlet code where you want to spend</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter outlet code (e.g., OUT001)"
                value={outletCode}
                onChange={(e) => setOutletCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                data-testid="input-outlet-code"
              />
              <Button 
                type="button"
                onClick={handleSearch}
                disabled={searchMutation.isPending}
                data-testid="button-search"
              >
                {searchMutation.isPending ? '...' : <Store className="w-4 h-4" />}
              </Button>
            </div>

            {searchedOutlet && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg" data-testid="card-outlet-info">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Store className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold" data-testid="text-outlet-name">
                      {searchedOutlet.name}
                    </p>
                    <p className="text-sm text-muted-foreground" data-testid="text-chain-name">
                      {searchedOutlet.chainName}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground" data-testid="text-location">
                  📍 {searchedOutlet.location}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {searchedOutlet && (
          <Card className="mb-6" data-testid="card-amount">
            <CardHeader>
              <CardTitle>2. Enter Amount</CardTitle>
              <CardDescription>How much would you like to spend?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (ZAR)</Label>
                <Input
                  id="amount"
                  type="text"
                  inputMode="numeric"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  data-testid="input-amount"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map((amt) => (
                  <Button
                    key={amt}
                    type="button"
                    variant="outline"
                    onClick={() => setAmount(amt.toString())}
                    data-testid={`button-quick-${amt}`}
                  >
                    R {amt}
                  </Button>
                ))}
              </div>

              <Button 
                type="button"
                className="w-full" 
                size="lg"
                onClick={handleSpend}
                disabled={spendMutation.isPending}
                data-testid="button-spend"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {spendMutation.isPending ? "Processing..." : "Pay Now"}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100 font-semibold mb-2">
            How it works
          </p>
          <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
            <li>Search for the merchant outlet code</li>
            <li>Enter the amount you want to spend</li>
            <li>Confirm payment - funds transfer instantly</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
