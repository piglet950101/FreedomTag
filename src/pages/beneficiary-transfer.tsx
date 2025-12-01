import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BeneficiaryData {
  tagCode: string;
  walletId: string;
  balanceZAR: number;
}

export default function BeneficiaryTransfer() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [beneficiaryData, setBeneficiaryData] = useState<BeneficiaryData | null>(null);
  const [recipientTag, setRecipientTag] = useState("");
  const [amount, setAmount] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const sessionData = sessionStorage.getItem('beneficiary');
    if (!sessionData) {
      setLocation('/kiosk/beneficiary');
      return;
    }
    setBeneficiaryData(JSON.parse(sessionData));
  }, [setLocation]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!beneficiaryData) return;

    const amountRand = parseFloat(amount);
    if (isNaN(amountRand) || amountRand <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    const amountCents = Math.round(amountRand * 100);

    if (amountCents > beneficiaryData.balanceZAR) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds for this transfer.",
        variant: "destructive",
      });
      return;
    }

    if (recipientTag === beneficiaryData.tagCode) {
      toast({
        title: "Invalid Recipient",
        description: "You cannot send money to yourself.",
        variant: "destructive",
      });
      return;
    }

    setIsTransferring(true);

    try {
      const response = await fetch('/api/beneficiary/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromTagCode: beneficiaryData.tagCode,
          toTagCode: recipientTag,
          amountZAR: amountCents,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Transfer Failed",
          description: error.error === 'tag not found' ? "Recipient tag not found." : error.error,
          variant: "destructive",
        });
        setIsTransferring(false);
        return;
      }

      const data = await response.json();
      
      // Update session balance
      const updatedData = {
        ...beneficiaryData,
        balanceZAR: data.newBalance,
      };
      sessionStorage.setItem('beneficiary', JSON.stringify(updatedData));
      setBeneficiaryData(updatedData);

      setSuccess(true);
      setTimeout(() => {
        setLocation('/kiosk/beneficiary/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Transfer error:', error);
      toast({
        title: "Error",
        description: "Transfer failed. Please try again.",
        variant: "destructive",
      });
      setIsTransferring(false);
    }
  };

  if (!beneficiaryData) {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl border-primary bg-primary/5" data-testid="card-success">
          <CardContent className="pt-12 pb-12">
            <div className="text-center space-y-8">
              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-16 h-16 text-primary" />
              </div>
              <div>
                <h2 className="text-5xl font-bold text-foreground mb-4">Transfer Complete!</h2>
                <p className="text-2xl text-muted-foreground">
                  R {parseFloat(amount).toFixed(2)} sent to {recipientTag}
                </p>
              </div>
              <div className="pt-4">
                <p className="text-xl text-muted-foreground mb-2">New Balance</p>
                <p className="text-6xl font-bold text-foreground" data-testid="text-new-balance">
                  R {(beneficiaryData.balanceZAR / 100).toFixed(2)}
                </p>
              </div>
              <p className="text-lg text-muted-foreground pt-4">
                Returning to dashboard in 3 seconds...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => setLocation('/kiosk/beneficiary/dashboard')}
          className="mb-6 text-xl"
          data-testid="button-back"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          Back to Dashboard
        </Button>

        <Card data-testid="card-transfer">
          <CardHeader className="text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Send className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-4xl mb-2">Send Money (P2P)</CardTitle>
            <CardDescription className="text-xl">
              Transfer funds to another Freedom Tag holder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-8 p-6 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center">
                <p className="text-xl text-muted-foreground">Your Balance:</p>
                <p className="text-3xl font-bold" data-testid="text-balance">
                  R {(beneficiaryData.balanceZAR / 100).toFixed(2)}
                </p>
              </div>
            </div>

            <form onSubmit={handleTransfer} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="recipientTag" className="text-2xl">Recipient Tag Code</Label>
                <Input
                  id="recipientTag"
                  type="text"
                  placeholder="e.g., CT002"
                  value={recipientTag}
                  onChange={(e) => setRecipientTag(e.target.value.toUpperCase())}
                  className="h-16 text-3xl text-center"
                  required
                  data-testid="input-recipient-tag"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="amount" className="text-2xl">Amount (ZAR)</Label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl text-muted-foreground">
                    R
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-16 pl-14 text-3xl"
                    min="0"
                    step="0.01"
                    required
                    data-testid="input-amount"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-20 text-3xl"
                disabled={isTransferring || !recipientTag || !amount}
                data-testid="button-send"
              >
                {isTransferring ? "Sending..." : "Send Money"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
