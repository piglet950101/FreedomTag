import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import QRCode from "react-qr-code";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripePaymentForm from "@/components/StripePaymentForm";
import BenefitsStrip from "../components/ui/BenefitsStrip";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

export default function BankPayment() {
  const params = new URLSearchParams(window.location.search);
  const bankRef = params.get('bankRef') || '';
  const tagCode = params.get('tagCode') || '';
  const amountZAR = params.get('amountZAR') || '0';
  const source = params.get('source') || '';
  const taxReceipt = params.get('taxReceipt') || '';
  const donorEmail = params.get('donorEmail') || '';
  const donorName = params.get('donorName') || '';
  const currency = params.get('currency') || '';
  const country = params.get('country') || '';
  
  const [paymentStatus, setPaymentStatus] = useState<'card' | 'scanning' | 'processing' | 'complete' | 'error'>('card');
  const [errorMessage, setErrorMessage] = useState('');
  const amount = Number(amountZAR).toFixed(2);
  
  // Generate QR code data
  const qrData = JSON.stringify({
    type: 'instant_payment',
    tag: tagCode,
    amount: amount,
    ref: bankRef,
  });

  // Legacy QR flow is disabled in favor of Stripe card UI to match stripe/donate

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl" data-testid="card-bank-payment">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Instant Payment</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">Scan & Pay - No bank details needed</p>
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

          {/* Stripe Card Payment (mirrors stripe/donate) */}
          {paymentStatus === 'card' && (
            <div className="space-y-6" data-testid="stripe-card-section">
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

              <Elements stripe={stripePromise}>
                <StripePaymentForm
                  tagCode={tagCode}
                  amount={String(Math.round(Number(amountZAR)))}
                  onSuccess={() => {
                    setPaymentStatus('complete');
                    setTimeout(() => {
                      const back = source === 'public' ? `/donor/view/${tagCode}?paid=1` : `/tag/${tagCode}?paid=1`;
                      window.location.href = back;
                    }, 1500);
                  }}
                />
              </Elements>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">💳 Secure Card Payment</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Enter your card details securely</li>
                  <li>• Testing card: 4242 4242 4242 4242</li>
                  <li>• Any future expiry and any CVC</li>
                </ul>
              </div>
            </div>
          )}

          {/* Processing State */}
          {paymentStatus === 'processing' && (
            <div className="space-y-4 text-center py-8" data-testid="processing-state">
              <Loader2 className="w-16 h-16 text-primary mx-auto animate-spin" />
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">Processing Payment</p>
                <p className="text-sm text-muted-foreground">Securely completing your donation...</p>
              </div>
            </div>
          )}

          {/* Complete State */}
          {paymentStatus === 'complete' && (
            <div className="space-y-4 text-center py-8" data-testid="complete-state">
              <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">Payment Successful!</p>
                <p className="text-sm text-muted-foreground">Redirecting you back...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {paymentStatus === 'error' && (
            <div className="space-y-4 text-center py-8" data-testid="error-state">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">Payment Failed</p>
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
              </div>
              <Button onClick={handleRetry} variant="outline" className="mt-4" data-testid="button-retry">
                Try Again
              </Button>
            </div>
          )}

          {/* Note */}
          <div className="bg-primary/5 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">
              This page uses Stripe card payments to match the donate flow.
            </p>
          </div>
          <BenefitsStrip />
        </CardContent>
      </Card>
    </div>
  );
}
