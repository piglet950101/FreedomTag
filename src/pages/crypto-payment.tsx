import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bitcoin, Check, Copy } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import QRCode from "react-qr-code";
import { useToast } from "@/hooks/use-toast";

export default function CryptoPayment() {
  const params = new URLSearchParams(window.location.search);
  const cryptoRef = params.get('cryptoRef') || '';
  const tagCode = params.get('tagCode') || '';
  const amountZAR = Number(params.get('amountZAR') || 0);
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const amountInZAR = amountZAR.toFixed(2);

  // Exchange rates (ZAR per 1 unit of crypto, in cents)
  const CRYPTO_RATES = {
    BTC: 120000000,
    ETH: 5500000,
    USDT: 1850,
  };

  // Generate realistic-looking blockchain addresses (demo purposes)
  const BLOCKCHAIN_ADDRESSES = {
    BTC: `bc1q${cryptoRef.slice(-30).toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    ETH: `0x${cryptoRef.slice(-40).toLowerCase().replace(/[^a-f0-9]/g, '').padEnd(40, '0')}`,
    USDT: `0x${cryptoRef.slice(-40).toLowerCase().replace(/[^a-f0-9]/g, '').padEnd(40, '1')}`,
  };

  const btcAmount = (amountZAR / CRYPTO_RATES.BTC).toFixed(8);
  const ethAmount = (amountZAR / CRYPTO_RATES.ETH).toFixed(8);
  const usdtAmount = (amountZAR / CRYPTO_RATES.USDT).toFixed(2);

  const cryptoOptions = [
    { 
      id: 'USDT', 
      name: 'USDT (Tether)', 
      symbol: '₮', 
      color: 'bg-green-600', 
      amount: usdtAmount,
      network: 'Ethereum (ERC-20)',
      confirmations: '12 confirmations required',
      recommended: true,
      benefits: 'Stable value • Lowest fees • Fastest settlement'
    },
    { 
      id: 'BTC', 
      name: 'Bitcoin', 
      symbol: '₿', 
      color: 'bg-orange-500', 
      amount: btcAmount,
      network: 'Bitcoin Network',
      confirmations: '2 confirmations required',
      recommended: false
    },
    { 
      id: 'ETH', 
      name: 'Ethereum', 
      symbol: 'Ξ', 
      color: 'bg-blue-600', 
      amount: ethAmount,
      network: 'Ethereum Mainnet',
      confirmations: '12 confirmations required',
      recommended: false
    },
  ];

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast({ title: "Address copied!", description: "Payment address copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({ title: "Failed to copy", description: "Please copy manually", variant: "destructive" });
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedCrypto) return;
    
    setIsProcessing(true);
    
    // Simulate blockchain confirmation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const formData = new URLSearchParams();
      formData.append('cryptoRef', cryptoRef);
      formData.append('tagCode', tagCode);
      formData.append('amountZAR', amountZAR.toString());
      formData.append('crypto', selectedCrypto);

      const response = await fetch('/api/crypto/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      if (response.redirected) {
        window.location.href = response.url;
      } else if (response.ok) {
        window.location.href = `/tag/${tagCode}?paid=1&crypto=${selectedCrypto}`;
      }
    } catch (error) {
      console.error('Crypto payment failed:', error);
      setIsProcessing(false);
    }
  };

  const selectedOption = cryptoOptions.find(c => c.id === selectedCrypto);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Link href={`/tag/${tagCode}`}>
          <Button variant="ghost" className="mb-4 text-white hover:bg-white/10" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tag
          </Button>
        </Link>

        <Card className="shadow-2xl" data-testid="card-crypto-payment">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Bitcoin className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Pay with Crypto</CardTitle>
                <CardDescription>
                  {selectedCrypto ? 'Scan QR code or copy address to pay' : 'Select your preferred cryptocurrency'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted rounded-lg p-4 space-y-2" data-testid="card-payment-info">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tag:</span>
                <span className="font-semibold text-foreground" data-testid="text-tag-code">{tagCode}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount (ZAR):</span>
                <span className="font-semibold text-foreground" data-testid="text-amount">R {amountInZAR}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reference:</span>
                <span className="font-mono text-xs text-foreground" data-testid="text-reference">{cryptoRef}</span>
              </div>
            </div>

            {!selectedCrypto ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Choose cryptocurrency:</p>
                {cryptoOptions.map((crypto) => (
                  <Card 
                    key={crypto.id}
                    className={`hover-elevate active-elevate-2 cursor-pointer transition-all ${crypto.recommended ? 'border-primary/50 bg-primary/5' : ''}`}
                    onClick={() => setSelectedCrypto(crypto.id)}
                    data-testid={`card-${crypto.id.toLowerCase()}-option`}
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-10 h-10 rounded-full ${crypto.color} flex items-center justify-center text-white font-bold`}>
                            {crypto.symbol}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-foreground">{crypto.name}</h4>
                              {crypto.recommended && (
                                <span className="text-xs font-semibold px-2 py-0.5 bg-primary text-primary-foreground rounded-full">
                                  RECOMMENDED
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{crypto.amount} {crypto.id}</p>
                            {'benefits' in crypto && crypto.benefits && (
                              <p className="text-xs text-primary font-medium mt-1">{crypto.benefits}</p>
                            )}
                          </div>
                        </div>
                        <Button 
                          variant={crypto.recommended ? "default" : "outline"}
                          data-testid={`button-select-${crypto.id.toLowerCase()}`}
                        >
                          Select
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Selected crypto info */}
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className={`w-10 h-10 rounded-full ${selectedOption?.color} flex items-center justify-center text-white font-bold`}>
                    {selectedOption?.symbol}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{selectedOption?.name}</h4>
                    <p className="text-sm text-muted-foreground">{selectedOption?.network}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedCrypto(null)}
                    data-testid="button-change-crypto"
                  >
                    Change
                  </Button>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-white p-4 rounded-lg" data-testid="qr-code-container">
                    <QRCode 
                      value={BLOCKCHAIN_ADDRESSES[selectedCrypto as keyof typeof BLOCKCHAIN_ADDRESSES]}
                      size={200}
                    />
                  </div>
                  
                  <div className="text-center space-y-1">
                    <p className="text-lg font-bold text-foreground" data-testid="text-crypto-amount">
                      {selectedOption?.amount} {selectedCrypto}
                    </p>
                    <p className="text-sm text-muted-foreground">≈ R {amountInZAR} ZAR</p>
                  </div>
                </div>

                {/* Blockchain Address */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Payment Address</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={BLOCKCHAIN_ADDRESSES[selectedCrypto as keyof typeof BLOCKCHAIN_ADDRESSES]}
                      readOnly
                      className="flex-1 px-3 py-2 bg-muted border border-border rounded-md text-sm font-mono text-foreground"
                      data-testid="input-blockchain-address"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopyAddress(BLOCKCHAIN_ADDRESSES[selectedCrypto as keyof typeof BLOCKCHAIN_ADDRESSES])}
                      data-testid="button-copy-address"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">{selectedOption?.confirmations}</p>
                </div>

                {/* Payment instructions */}
                <div className="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-3 rounded text-sm space-y-2">
                  <p className="font-semibold text-blue-800 dark:text-blue-200">Payment Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1 text-blue-700 dark:text-blue-300 text-sm">
                    <li>Scan QR code or copy address above</li>
                    <li>Send exactly {selectedOption?.amount} {selectedCrypto}</li>
                    <li>Click "I've Sent Payment" when complete</li>
                  </ol>
                </div>

                {/* Demo notice */}
                <div className="bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 p-3 rounded text-sm">
                  <p className="text-amber-800 dark:text-amber-200">
                    <strong>🔒 Demo Mode</strong><br />
                    This is a simulated payment. Click "I've Sent Payment" to complete the demo transaction.
                  </p>
                </div>

                {/* Action button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                  data-testid="button-confirm-payment"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing Payment...
                    </>
                  ) : (
                    "I've Sent Payment"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
