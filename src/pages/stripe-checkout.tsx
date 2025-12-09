import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TagInfo {
  tagCode: string;
  walletId: string;
  balanceZAR: number;
}

export default function StripeCheckoutPage() {
  const { tagCode } = useParams<{ tagCode: string }>();
  const { toast } = useToast();
  const [amount, setAmount] = useState("10000");
  const [donorEmail, setDonorEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: tagInfo, isLoading } = useQuery<TagInfo>({
    queryKey: [`/api/tag/${tagCode}`],
  });

  const handleCheckout = async () => {
    setIsProcessing(true);
    
    try {
      // Create Stripe Checkout Session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tagCode,
          amount,
          donorEmail: donorEmail || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: "Unable to start checkout. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href={`/tag/${tagCode}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tag
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-6 h-6" />
              Donate with Stripe
            </CardTitle>
            <CardDescription>
              Secure payment powered by Stripe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Freedom Tag</span>
                <Badge variant="outline">{tagCode}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current Balance</span>
                <span className="text-lg font-bold">
                  R {((tagInfo?.balanceZAR || 0) / 100).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Donation Amount (ZAR cents)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10000"
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground">
                = R {(Number(amount) / 100).toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                placeholder="your@email.com"
              />
              <p className="text-xs text-muted-foreground">
                Stripe will send your receipt to this email
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Click "Pay with Stripe" below</li>
                <li>You'll be redirected to Stripe's secure checkout page</li>
                <li>Enter your card details on Stripe.com</li>
                <li>Complete payment and return here</li>
                <li>Wallet balance updates automatically</li>
              </ol>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={isProcessing || !amount || Number(amount) <= 0}
              className="w-full text-lg py-6"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Redirecting to Stripe...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay R {(Number(amount) / 100).toFixed(2)} with Stripe
                  <ExternalLink className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              🔒 You'll be redirected to Stripe's secure checkout page
            </p>
          </CardContent>
        </Card>

        <Card className="mt-6 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-sm text-green-900">Stripe Hosted Checkout</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-800">
              This uses Stripe's hosted checkout page - the same secure payment flow used by 
              millions of websites worldwide. Your card details are entered directly on Stripe.com 
              and never touch our servers.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
