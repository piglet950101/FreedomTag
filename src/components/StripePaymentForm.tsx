import { useState } from 'react';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ISO_COUNTRIES } from '@/lib/countries';
import { Loader2, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StripePaymentFormProps {
  tagCode: string;
  amount: string;
  onSuccess: () => void;
}

export default function StripePaymentForm({ tagCode, amount, onSuccess }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [donorEmail, setDonorEmail] = useState('');
  const [donorName, setDonorName] = useState('');
  const countries = ISO_COUNTRIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Step 1: Create PaymentIntent on server
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tagCode,
          amount,
          donorEmail,
          donorName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      // Step 2: Confirm payment with card details
      const cardNumberElement = elements.getElement(CardNumberElement);
      if (!cardNumberElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            email: donorEmail || undefined,
            name: donorName || undefined,
          },
        },
      });

      if (error) {
        setPaymentError(error.message || 'Payment failed');
        toast({
          title: 'Payment Failed',
          description: error.message,
          variant: 'destructive',
        });
      } else if (paymentIntent.status === 'succeeded') {
        toast({
          title: 'Payment Successful!',
          description: `Donated R${(Number(amount) / 100).toFixed(2)} to ${tagCode}`,
        });
        onSuccess();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      setPaymentError(errorMessage);
      toast({
        title: 'Payment Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const stripeElementOptions = {
    style: {
      base: {
        fontSize: '15px',
        color: '#1a1a1a',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        '::placeholder': {
          color: '#a0a0a0',
        },
      },
      invalid: {
        color: '#dc2626',
        iconColor: '#dc2626',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Card Information Section */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Card information</Label>
        <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
          {/* Card Number */}
          <div className="p-3 border-b border-gray-300">
            <CardNumberElement 
              options={{
                ...stripeElementOptions,
                showIcon: true,
              }} 
            />
          </div>
          {/* Expiry and CVC */}
          <div className="flex">
            <div className="flex-1 p-3 border-r border-gray-300">
              <CardExpiryElement options={stripeElementOptions} />
            </div>
            <div className="flex-1 p-3 relative flex items-center gap-2">
              <div className="flex-1">
                <CardCvcElement 
                  options={{
                    ...stripeElementOptions,
                    placeholder: 'CVC',
                  }} 
                />
              </div>
              <svg 
                className="w-7 h-5 text-gray-400 flex-shrink-0" 
                viewBox="0 0 24 16" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="0.5" y="0.5" width="23" height="15" rx="2.5" stroke="currentColor"/>
                <path d="M0 4h24" stroke="currentColor"/>
                <rect x="2" y="10" width="4" height="2" fill="currentColor"/>
                <rect x="7" y="10" width="3" height="2" fill="currentColor"/>
                <rect x="11" y="10" width="3" height="2" fill="currentColor"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Cardholder Name */}
      <div className="space-y-3">
        <Label htmlFor="donorName" className="text-sm font-medium text-gray-700">
          Cardholder name
        </Label>
        <Input
          id="donorName"
          type="text"
          placeholder="Full name on card"
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          disabled={isProcessing}
          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11"
        />
      </div>

      {/* Country or Region */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Country or region</Label>
        <select
          disabled={isProcessing}
          className="w-full h-11 px-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
        >
          {countries.map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Email (Optional) */}
      <div className="space-y-3">
        <Label htmlFor="donorEmail" className="text-sm font-medium text-gray-700">
          Email (Optional)
        </Label>
        <Input
          id="donorEmail"
          type="email"
          placeholder="donor@example.com"
          value={donorEmail}
          onChange={(e) => setDonorEmail(e.target.value)}
          disabled={isProcessing}
          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11"
        />
      </div>

      {/* Error Message */}
      {paymentError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{paymentError}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay`
        )}
      </Button>
    </form>
  );
}
