import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Heart, CreditCard, Bitcoin, CheckCircle, Globe, Receipt, FileCheck } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import DonationQRCode from "@/components/DonationQRCode";

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'IE', name: 'Ireland' },
  { code: 'NZ', name: 'New Zealand' },
];

// Charity organization mappings (demo - in production these would come from database)
const charityToTag: Record<string, { name: string; tagCode: string; charityNumber?: string }> = {
  "red-cross": { name: "Red Cross / Red Crescent", tagCode: "ORG001", charityNumber: "NPO-2002-0789" },
  "unicef": { name: "UNICEF", tagCode: "ORG002", charityNumber: "NPO-2001-0234" },
  "msf": { name: "Doctors Without Borders", tagCode: "ORG003", charityNumber: "NPO-2007-0890" },
  "save-children": { name: "Save the Children", tagCode: "ORG004", charityNumber: "NPO-2009-0567" },
  "wfp": { name: "World Food Programme", tagCode: "ORG005", charityNumber: "NPO-2012-0345" },
  "oxfam": { name: "Oxfam International", tagCode: "ORG006", charityNumber: "NPO-2008-0345" },
  "care": { name: "CARE International", tagCode: "ORG007", charityNumber: "NPO-2010-0891" },
  "world-vision": { name: "World Vision", tagCode: "ORG008", charityNumber: "NPO-2003-0456" },
  "amnesty": { name: "Amnesty International", tagCode: "ORG009", charityNumber: "NPO-2013-0678" },
  "habitat": { name: "Habitat for Humanity", tagCode: "ORG010", charityNumber: "NPO-2011-0234" },
};

export default function DonorPortal() {
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const orgId = params.get('org') || params.get('charity'); // Support both ?org= and ?charity= parameters
  const charityInfo = orgId ? charityToTag[orgId] : null;
  
  const [tagCode, setTagCode] = useState(charityInfo?.tagCode || "");
  const [amount, setAmount] = useState("100");
  const [currency, setCurrency] = useState("ZAR");
  const [country, setCountry] = useState("ZA");
  const [needTaxReceipt, setNeedTaxReceipt] = useState(false);
  const [donorEmail, setDonorEmail] = useState("");
  const [donorName, setDonorName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const justPaid = params.get('paid') === '1';
  const paidTagCode = params.get('tagCode') || "";
  const cryptoType = params.get('crypto');
  const hasTaxReceipt = params.get('taxReceipt') === '1';

  const selectedCurrency = CURRENCIES.find(c => c.code === currency);

  const handleBankDonate = async () => {
    if (!tagCode || !amount) {
      toast({
        title: "Missing information",
        description: "Please enter both tag code and amount",
        variant: "destructive",
      });
      return;
    }

    if (!agreeTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the donation terms to continue",
        variant: "destructive",
      });
      return;
    }

    if (needTaxReceipt && (!donorEmail || !donorName)) {
      toast({
        title: "Tax receipt information required",
        description: "Please provide your name and email for tax receipt",
        variant: "destructive",
      });
      return;
    }

    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid donation amount",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/donate/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tagCode, 
          amountZAR: amountNum,
          currency,
          country,
          needTaxReceipt,
          donorEmail: needTaxReceipt ? donorEmail : undefined,
          donorName: needTaxReceipt ? donorName : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Tag not found",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      if (data.bankSimUrl) {
        window.location.href = data.bankSimUrl;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process donation. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleCryptoDonate = async () => {
    if (!tagCode || !amount) {
      toast({
        title: "Missing information",
        description: "Please enter both tag code and amount",
        variant: "destructive",
      });
      return;
    }

    if (!agreeTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the donation terms to continue",
        variant: "destructive",
      });
      return;
    }

    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid donation amount",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/crypto/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tagCode, 
          amountZAR: amountNum,
          currency,
          country,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Tag not found",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      if (data.cryptoSimUrl) {
        window.location.href = data.cryptoSimUrl;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process donation. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/">
          <Button variant="ghost" className="mb-4" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <Card className="shadow-xl" data-testid="card-donation">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {charityInfo ? `Support ${charityInfo.name}` : "Donate"}
                </CardTitle>
                <CardDescription>
                  {charityInfo ? "Make a donation to this organization" : "Support a Freedom Tag beneficiary"}
                </CardDescription>
              </div>
            </div>
            {charityInfo && (
              <div className="mt-2 p-3 bg-primary/10 rounded-lg space-y-2" data-testid="charity-info">
                {charityInfo.charityNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileCheck className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">Registered Charity:</span>
                    <span className="font-mono text-primary font-semibold" data-testid="charity-number">
                      {charityInfo.charityNumber}
                    </span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Your donation will support {charityInfo.name}'s mission. They distribute funds through Freedom Tags to help those in need.
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {justPaid && paidTagCode && (
              <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-start gap-3" data-testid="card-success">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold text-primary">Donation Successful!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your donation to <span className="font-medium text-foreground">{paidTagCode}</span> has been processed
                    {cryptoType && ` via ${cryptoType.toUpperCase()}`}
                  </p>
                  {hasTaxReceipt && (
                    <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                      <Receipt className="w-4 h-4" />
                      Tax receipt will be emailed to you
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Country Selection */}
              <div className="space-y-2">
                <Label htmlFor="country" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Your Country
                </Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger id="country" data-testid="select-country">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Currency Selection */}
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency" data-testid="select-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map(c => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.symbol} {c.code} - {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tag Code */}
              {!charityInfo && (
                <div className="space-y-2">
                  <Label htmlFor="tagCode">Freedom Tag Code</Label>
                  <Input
                    id="tagCode"
                    placeholder="Enter tag code (e.g., CT001)"
                    value={tagCode}
                    onChange={(e) => setTagCode(e.target.value.toUpperCase())}
                    data-testid="input-tag-code"
                  />
                </div>
              )}

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ({currency})</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  data-testid="input-amount"
                />
                <div className="flex gap-2 flex-wrap mt-2">
                  {[50, 100, 200, 500].map(preset => (
                    <Button
                      key={preset}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(preset.toString())}
                      data-testid={`button-preset-${preset}`}
                    >
                      {selectedCurrency?.symbol}{preset}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tax Receipt Option */}
              <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="taxReceipt" 
                    checked={needTaxReceipt}
                    onCheckedChange={(checked) => setNeedTaxReceipt(checked as boolean)}
                    data-testid="checkbox-tax-receipt"
                  />
                  <Label htmlFor="taxReceipt" className="flex items-center gap-2 cursor-pointer">
                    <Receipt className="w-4 h-4" />
                    I need a tax receipt
                  </Label>
                </div>
                
                {needTaxReceipt && (
                  <div className="space-y-3 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="donorName" className="text-sm">Full Name</Label>
                      <Input
                        id="donorName"
                        placeholder="Your full name"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        data-testid="input-donor-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="donorEmail" className="text-sm">Email Address</Label>
                      <Input
                        id="donorEmail"
                        type="email"
                        placeholder="your@email.com"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        data-testid="input-donor-email"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tax receipt will be emailed to you for tax deduction purposes
                    </p>
                  </div>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2 p-3 bg-muted/30 rounded-lg">
                <Checkbox 
                  id="agreeTerms" 
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                  data-testid="checkbox-agree-terms"
                />
                <Label htmlFor="agreeTerms" className="cursor-pointer leading-relaxed">
                  I agree to the{" "}
                  <a 
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                    data-testid="link-terms"
                  >
                    Reallocation & No-Refunds
                  </a>
                  {" "}terms.
                </Label>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3 pt-2">
                <Label className="text-base font-semibold">Choose payment method:</Label>
                
                {/* Crypto Payment - RECOMMENDED */}
                <div className="space-y-2">
                  <Button
                    onClick={handleCryptoDonate}
                    disabled={isLoading}
                    className="w-full text-lg relative"
                    size="lg"
                    data-testid="button-crypto-donate"
                  >
                    <Bitcoin className="w-5 h-5 mr-2" />
                    Donate with Crypto (Recommended)
                  </Button>
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                    <p className="text-sm font-medium text-primary mb-1">✨ Why we recommend crypto:</p>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                      <li><strong>USDT recommended</strong> - Stable value, instant transfer</li>
                      <li>Lower fees (typically 1-2% vs 3-5% for cards)</li>
                      <li>Faster settlement - funds arrive in minutes</li>
                      <li>Global access - donate from anywhere</li>
                      <li>Full blockchain transparency</li>
                    </ul>
                  </div>
                </div>

                {/* Bank Payment - Alternative */}
                <div className="space-y-2">
                  <Button
                    onClick={handleBankDonate}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full text-lg"
                    size="lg"
                    data-testid="button-bank-donate"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Or pay with Bank/Card
                  </Button>
                </div>
              </div>

              {/* Info Notice */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex gap-2">
                  <Heart className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    <p className="font-medium">Anonymous Giving</p>
                    <p className="text-blue-700 dark:text-blue-300 mt-1">
                      Your donation goes directly to the beneficiary's Freedom Tag wallet.
                      {needTaxReceipt && " Tax receipt will be issued for your records."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <DonationQRCode 
            url={`${window.location.origin}/donor${orgId ? `?org=${orgId}` : ''}`}
            tagCode={charityInfo?.name || "Donor Portal"}
            size={160}
          />
        </div>
      </div>
    </div>
  );
}
