import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Building2, Tag, ArrowRightLeft, Wallet, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { MerchantChain, MerchantOutlet } from "@shared/schema";

interface OutletWithBalance extends MerchantOutlet {
  balanceZAR: number;
}

export default function Merchant() {
  const { toast } = useToast();
  const [selectedChainId, setSelectedChainId] = useState<string>("");
  const [selectedOutletId, setSelectedOutletId] = useState<string>("");
  const [redeemTag, setRedeemTag] = useState("");
  const [redeemAmount, setRedeemAmount] = useState("");
  const [toOutletId, setToOutletId] = useState("");
  const [spendAmount, setSpendAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const { data: chainsData, isLoading: chainsLoading } = useQuery<{ chains: MerchantChain[] }>({
    queryKey: ['/api/merchant/chains'],
  });

  const { data: outletsData, isLoading: outletsLoading } = useQuery<{ outlets: OutletWithBalance[] }>({
    queryKey: ['/api/merchant/chains', selectedChainId, 'outlets'],
    enabled: !!selectedChainId,
  });

  const chains = chainsData?.chains || [];
  const outlets = outletsData?.outlets || [];
  const selectedOutlet = outlets.find(o => o.id === selectedOutletId);

  // Auto-select first chain and outlet when data loads
  useEffect(() => {
    if (chains.length > 0 && !selectedChainId) {
      setSelectedChainId(chains[0].id);
    }
  }, [chains.length]);

  useEffect(() => {
    if (outlets.length > 0 && !selectedOutletId) {
      setSelectedOutletId(outlets[0].id);
    }
  }, [outlets.length]);

  const redeemMutation = useMutation({
    mutationFn: async (data: { merchantOutletId: string; tagCode: string; amountZAR: number }) => {
      const response = await fetch('/api/merchant/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Redemption failed');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Funds redeemed successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/merchant/chains', selectedChainId, 'outlets'] });
      setRedeemTag("");
      setRedeemAmount("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const spendMutation = useMutation({
    mutationFn: async (data: { fromMerchantOutletId: string; toMerchantOutletId: string; amountZAR: number }) => {
      const response = await fetch('/api/merchant/spend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Transfer failed');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Funds transferred successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/merchant/chains', selectedChainId, 'outlets'] });
      setSpendAmount("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: { merchantOutletId: string; amountZAR: number }) => {
      const response = await fetch('/api/merchant/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Withdrawal failed');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Withdrawal completed" });
      queryClient.invalidateQueries({ queryKey: ['/api/merchant/chains', selectedChainId, 'outlets'] });
      setWithdrawAmount("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (chainsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading merchant data...</p>
        </div>
      </div>
    );
  }

  if (chains.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Link href="/">
            <Button variant="ghost" className="mb-6" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Card>
            <CardContent className="pt-8 text-center">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Merchant Chains Available</h3>
              <p className="text-muted-foreground">No merchant chains are configured in the system.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Community Commerce Portal</h1>
          <p className="text-muted-foreground">Partner with us to accept Freedom Tags, manage funds, and support your community</p>
        </div>

        <Card className="mb-8" data-testid="card-merchant-selector">
          <CardHeader>
            <CardTitle>Select Merchant Outlet</CardTitle>
            <CardDescription>Choose your merchant chain and outlet location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chain-select">Merchant Chain</Label>
              <Select value={selectedChainId} onValueChange={(value) => {
                setSelectedChainId(value);
                setSelectedOutletId("");
              }}>
                <SelectTrigger id="chain-select" data-testid="select-chain">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {chains.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {chain.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedChainId && (
              <div className="space-y-2">
                <Label htmlFor="outlet-select">Outlet Location</Label>
                {outletsLoading ? (
                  <div className="text-sm text-muted-foreground">Loading outlets...</div>
                ) : outlets.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No outlets available for this chain</div>
                ) : (
                  <Select value={selectedOutletId} onValueChange={setSelectedOutletId}>
                    <SelectTrigger id="outlet-select" data-testid="select-outlet">
                      <SelectValue placeholder="Select outlet" />
                    </SelectTrigger>
                    <SelectContent>
                      {outlets.map((outlet) => (
                        <SelectItem key={outlet.id} value={outlet.id}>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{outlet.displayName}</span>
                            <span className="text-muted-foreground">({outlet.region})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {selectedOutlet && (
              <div className="pt-2 border-t">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Selected Outlet</p>
                    <p className="font-semibold text-foreground">{selectedOutlet.displayName}</p>
                    <p className="text-sm text-muted-foreground">{selectedOutlet.town}, {selectedOutlet.region}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Balance</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-balance">
                      R {(selectedOutlet.balanceZAR / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <Card data-testid="card-redeem">
            <CardHeader className="pb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Tag className="w-5 h-5 text-primary" />
              </div>
              <CardTitle>Redeem from Tag</CardTitle>
              <CardDescription>Redeem funds from a Freedom Tag</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="redeem-tag">Tag Code</Label>
                <Input
                  id="redeem-tag"
                  value={redeemTag}
                  onChange={(e) => setRedeemTag(e.target.value)}
                  placeholder="e.g., CT001"
                  data-testid="input-redeem-tag"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="redeem-amount">Amount (cents)</Label>
                <Input
                  id="redeem-amount"
                  type="number"
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(e.target.value)}
                  placeholder="e.g., 5000"
                  data-testid="input-redeem-amount"
                />
              </div>
              <Button
                onClick={() => redeemMutation.mutate({
                  merchantOutletId: selectedOutletId,
                  tagCode: redeemTag,
                  amountZAR: Number(redeemAmount),
                })}
                disabled={!redeemTag || !redeemAmount || !selectedOutletId || redeemMutation.isPending}
                className="w-full"
                data-testid="button-redeem"
              >
                {redeemMutation.isPending ? 'Processing...' : 'Redeem'}
              </Button>
            </CardContent>
          </Card>

          <Card data-testid="card-transfer">
            <CardHeader className="pb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <ArrowRightLeft className="w-5 h-5 text-primary" />
              </div>
              <CardTitle>Transfer to Merchant</CardTitle>
              <CardDescription>Send funds to another merchant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="to-outlet">To Outlet</Label>
                <Select value={toOutletId} onValueChange={setToOutletId}>
                  <SelectTrigger data-testid="select-to-merchant">
                    <SelectValue placeholder="Select outlet" />
                  </SelectTrigger>
                  <SelectContent>
                    {outlets.filter(o => o.id !== selectedOutletId).map((outlet) => (
                      <SelectItem key={outlet.id} value={outlet.id}>
                        {outlet.displayName} ({outlet.town})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="spend-amount">Amount (cents)</Label>
                <Input
                  id="spend-amount"
                  type="number"
                  value={spendAmount}
                  onChange={(e) => setSpendAmount(e.target.value)}
                  placeholder="e.g., 5000"
                  data-testid="input-spend-amount"
                />
              </div>
              <Button
                onClick={() => spendMutation.mutate({
                  fromMerchantOutletId: selectedOutletId,
                  toMerchantOutletId: toOutletId,
                  amountZAR: Number(spendAmount),
                })}
                disabled={!toOutletId || !spendAmount || !selectedOutletId || spendMutation.isPending}
                className="w-full"
                data-testid="button-transfer"
              >
                {spendMutation.isPending ? 'Processing...' : 'Send'}
              </Button>
            </CardContent>
          </Card>

          <Card data-testid="card-withdraw">
            <CardHeader className="pb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <CardTitle>Withdraw</CardTitle>
              <CardDescription>Instant withdrawal to bank account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="withdraw-amount">Amount (cents)</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g., 5000"
                  data-testid="input-withdraw-amount"
                />
              </div>
              <Button
                onClick={() => withdrawMutation.mutate({
                  merchantOutletId: selectedOutletId,
                  amountZAR: Number(withdrawAmount),
                })}
                disabled={!withdrawAmount || !selectedOutletId || withdrawMutation.isPending}
                className="w-full"
                data-testid="button-withdraw"
              >
                {withdrawMutation.isPending ? 'Processing...' : 'Withdraw (Instant)'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
