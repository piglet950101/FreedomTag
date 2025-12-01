import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import QRCode from "react-qr-code";

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
  
  const [paymentStatus, setPaymentStatus] = useState<'scanning' | 'processing' | 'complete' | 'error'>('scanning');
  const [errorMessage, setErrorMessage] = useState('');
  const amount = Number(amountZAR).toFixed(2);
  
  // Generate QR code data
  const qrData = JSON.stringify({
    type: 'instant_payment',
    tag: tagCode,
    amount: amount,
    ref: bankRef,
  });

  useEffect(() => {
    let scanTimer: NodeJS.Timeout;
    let processTimer: NodeJS.Timeout;
    let redirectTimer: NodeJS.Timeout;

    // Simulate scanning phase
    scanTimer = setTimeout(() => {
      setPaymentStatus('processing');
      
      // Process payment after scanning
      processTimer = setTimeout(async () => {
        try {
          // Complete the payment on backend
          const formData = new URLSearchParams();
          formData.append('bankRef', bankRef);
          formData.append('tagCode', tagCode);
          formData.append('amountZAR', amountZAR);
          if (source) {
            formData.append('source', source);
          }
          if (taxReceipt) {
            formData.append('taxReceipt', taxReceipt);
          }
          if (donorEmail) {
            formData.append('donorEmail', donorEmail);
          }
          if (donorName) {
            formData.append('donorName', donorName);
          }
          if (currency) {
            formData.append('currency', currency);
          }
          if (country) {
            formData.append('country', country);
          }

          const response = await fetch('/api/bank/settle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString(),
          });

          // Only show success if backend confirms
          if (response.ok && response.redirected) {
            setPaymentStatus('complete');
            
            // Redirect after showing success
            redirectTimer = setTimeout(() => {
              window.location.href = response.url;
            }, 2000);
          } else {
            // Handle settlement failure
            setPaymentStatus('error');
            setErrorMessage('Payment failed. Please try again.');
          }
        } catch (error) {
          // Handle network or other errors
          setPaymentStatus('error');
          setErrorMessage('Connection error. Please try again.');
        }
      }, 2000);
    }, 3000);

    // Cleanup timers on unmount
    return () => {
      clearTimeout(scanTimer);
      clearTimeout(processTimer);
      clearTimeout(redirectTimer);
    };
  }, [bankRef, tagCode, amountZAR, source]);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md" data-testid="card-bank-payment">
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

          {/* QR Code Section */}
          {paymentStatus === 'scanning' && (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl flex items-center justify-center" data-testid="qr-code-container">
                <QRCode
                  value={qrData}
                  size={200}
                  level="M"
                  data-testid="qr-code"
                />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-foreground">Scan QR code with your banking app</p>
                <p className="text-xs text-muted-foreground">Processing payment automatically...</p>
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

          {/* Demo Notice */}
          <div className="bg-primary/5 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Demo Mode:</strong> This simulates instant payment like SnapScan or Zapper
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
