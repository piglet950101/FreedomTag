import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { goBackOrHome } from "@/lib/utils";
import StripePaymentForm from "@/components/StripePaymentForm";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_live_placeholder');

interface TagInfo {
  tagCode: string;
  walletId: string;
  balanceZAR: number;
}

export default function StripeDonatePage() {
  const { tagCode } = useParams<{ tagCode: string }>();
  const [amount, setAmount] = useState("10000");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const { data: tagInfo, isLoading } = useQuery<TagInfo>({
    queryKey: [`/api/tag/${tagCode}`],
  });

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-900">Payment Successful!</CardTitle>
            <CardDescription>
              Your donation has been processed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold">R {(Number(amount) / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tag:</span>
                <span className="font-semibold">{tagCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge className="bg-green-600">Completed</Badge>
              </div>
            </div>
            
            <div className="text-sm text-center text-muted-foreground">
              The beneficiary's wallet has been updated via Stripe webhook
            </div>

            <div className="flex gap-2">
              <Link href={`/tag/${tagCode}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  View Tag
                </Button>
              </Link>
              <Button 
                onClick={() => {
                  setPaymentSuccess(false);
                  setAmount("10000");
                }}
                className="flex-1"
              >
                Donate Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" className="mb-6" onClick={goBackOrHome}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-6 h-6" />
              Donate with Stripe
            </CardTitle>
            <CardDescription>
              Support {tagCode} with a secure card payment
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
              <Label htmlFor="amount">Donation Amount (ZAR)</Label>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">R</span>
                <Input
                  id="amount"
                  type="number"
                  value={Number(amount) / 100}
                  onChange={(e) => setAmount(String(Math.round(Number(e.target.value) * 100)))}
                  min="10"
                  step="10"
                  className="text-lg"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Minimum donation: R 10.00
              </p>
            </div>

            <div className="border-t pt-4">
              <Elements stripe={stripePromise}>
                <StripePaymentForm
                  tagCode={tagCode!}
                  amount={amount}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">💳 Secure Payment</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Enter your card details securely in the form above</li>
                <li>• For testing: Use card 4242 4242 4242 4242</li>
                <li>• Any future expiry date and any 3-digit CVC</li>
                <li>• Your donation updates the wallet balance instantly</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
