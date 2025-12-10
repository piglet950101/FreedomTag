import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Loader2, AlertCircle, ExternalLink, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BankPayment() {
  const params = new URLSearchParams(window.location.search);
  const tagCode = params.get('tagCode') || '';
  const amountZAR = params.get('amountZAR') || '0';
  const source = params.get('source') || '';
  const donorEmail = params.get('donorEmail') || '';
  
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();
  const amount = Number(amountZAR).toFixed(2);
  
  // Redirect to Stripe Checkout on component mount
  useEffect(() => {
    if (tagCode && amountZAR && !isRedirecting) {
      handleStripeCheckout();
    }
  }, [tagCode, amountZAR]);

  const handleStripeCheckout = async () => {
    if (!tagCode || !amountZAR || Number(amountZAR) <= 0) {
      setErrorMessage('Invalid tag code or amount');
      return;
    }

    setIsRedirecting(true);
    
    try {
      // Create Stripe Checkout Session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tagCode,
          amount: String(Math.round(Number(amountZAR))), // Amount in cents
          donorEmail: donorEmail || undefined,
          source: source || undefined, // Pass source for proper redirect after payment
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create checkout session' }));
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      
      if (!url) {
        throw new Error('No checkout URL returned from server');
      }
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Stripe checkout error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to redirect to Stripe';
      setErrorMessage(errorMsg);
      setIsRedirecting(false);
      toast({
        title: "Checkout Failed",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    setIsRedirecting(false);
    setErrorMessage('');
    handleStripeCheckout();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl" data-testid="card-bank-payment">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Pay with Stripe</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">Secure payment powered by Stripe</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Amount Display */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Donation Amount</p>
            <p className="text-4xl font-bold text-primary" data-testid="text-amount">
              R {amount}
            </p>
            <p className="text-xs text-muted-foreground">Tag: {tagCode}</p>
          </div>

          {/* Payment Summary */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Freedom Tag</span>
              <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold">{tagCode}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Donation Amount</span>
              <span className="text-lg font-bold">
                R {amount}
              </span>
            </div>
          </div>

          {/* Redirecting State */}
          {isRedirecting && !errorMessage && (
            <div className="space-y-4 text-center py-8" data-testid="redirecting-state">
              <Loader2 className="w-16 h-16 text-primary mx-auto animate-spin" />
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">Redirecting to Stripe...</p>
                <p className="text-sm text-muted-foreground">You'll be taken to Stripe's secure checkout page</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {errorMessage && (
            <div className="space-y-4 text-center py-8" data-testid="error-state">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">Checkout Failed</p>
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
              </div>
              <Button onClick={handleRetry} variant="outline" className="mt-4" data-testid="button-retry">
                Try Again
              </Button>
            </div>
          )}

          {/* Info Box */}
          {!isRedirecting && !errorMessage && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                How it works:
              </h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>You'll be redirected to Stripe's secure checkout page</li>
                <li>Enter your card details on Stripe.com</li>
                <li>Complete payment and return here</li>
                <li>Your donation will be processed automatically</li>
              </ol>
            </div>
          )}

          {/* Manual Redirect Button (if auto-redirect fails) */}
          {!isRedirecting && !errorMessage && (
            <Button
              onClick={handleStripeCheckout}
              className="w-full text-lg py-6"
              size="lg"
              data-testid="button-redirect-stripe"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Pay R {amount} with Stripe
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          )}

          {/* Note */}
          <div className="bg-primary/5 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">
              🔒 You'll be redirected to Stripe's secure checkout page. Your card details are entered directly on Stripe.com and never touch our servers.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
