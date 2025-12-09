import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Send, Search, Heart, UserPlus, Building2, Camera } from "lucide-react";
import QRScanner from '@/components/QRScanner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { StoryDialog } from "@/components/StoryDialog";
import DonationQRCode from "@/components/DonationQRCode";

interface PhilanthropistResponse {
  id: string;
  email: string;
  displayName: string | null;
  walletId: string;
  balanceZAR: number;
  isAnonymous: number;
}

interface TagInfo {
  tagCode: string;
  beneficiaryName: string;
  beneficiaryType: string;
  balanceZAR: number;
}

interface Organization {
  tagCode: string;
  name: string;
  description: string;
  type: string;
}

export default function PhilanthropistGive() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [giveType, setGiveType] = useState<'organization' | 'search'>('organization');
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [tagCode, setTagCode] = useState('');
  const [amount, setAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [donorName, setDonorName] = useState('');
  const [searchedTag, setSearchedTag] = useState<TagInfo | null>(null);
  const [tagNotFound, setTagNotFound] = useState(false);
  const [showStoryDialog, setShowStoryDialog] = useState(false);
  const [donationTransaction, setDonationTransaction] = useState<{ id: string; amountZAR: number } | null>(null);

  const { data: philanthropist } = useQuery<PhilanthropistResponse>({
    queryKey: ['/api/philanthropist/me'],
  });

  const { data: orgsData } = useQuery<{ organizations: Organization[] }>({
    queryKey: ['/api/philanthropist/organizations'],
  });

  const searchMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch(`/api/tag/${code}/info`);
      if (!response.ok) throw new Error('Tag not found');
      return response.json();
    },
    onSuccess: (data) => {
      setSearchedTag(data);
      setTagNotFound(false);
    },
    onError: () => {
      toast({
        title: "Tag not found",
        description: "The recipient you're looking for might not be registered yet",
        variant: "destructive",
      });
      setSearchedTag(null);
      setTagNotFound(true);
    },
  });

  const giveMutation = useMutation({
    mutationFn: async (data: { tagCode: string; amountZAR: number; donorName?: string }) => {
      return apiRequest('POST', '/api/philanthropist/give', data);
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/philanthropist/me'] });
      toast({
        title: "Donation sent!",
        description: `R ${parseFloat(amount).toFixed(2)} sent successfully`,
      });
      
      if (response?.transaction?.id) {
        setDonationTransaction({
          id: response.transaction.id,
          amountZAR: Math.floor(parseFloat(amount) * 100),
        });
        setShowStoryDialog(true);
      } else {
        setLocation('/philanthropist/dashboard');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Donation failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  if (!philanthropist) {
    return null;
  }

  const handleSearch = () => {
    if (!tagCode.trim()) {
      toast({
        title: "Enter tag code",
        description: "Please enter a tag code to search",
        variant: "destructive",
      });
      return;
    }
    searchMutation.mutate(tagCode.trim().toUpperCase());
  };

  const [showScanner, setShowScanner] = useState(false);

  const extractTagFromScan = (data: string) => {
    // Robust parsing of QR payloads. Scanned data may be:
    // - a plain tag code like "CH456634"
    // - a URL containing the tag as path segment, e.g. "/quick-donate/CH456634" or "http://host/quick-donate/CH456634"
    // - a URL with query param like "?tag=CH456634"

    const tryNormalize = (s: string) => (s || '').trim();

    // First, try to parse as a URL. If it fails, try adding a protocol to allow host-only strings like "localhost:5173/..."
    let url: URL | null = null;
    try {
      url = new URL(data);
    } catch (e) {
      try {
        // Prepend protocol and try again
        url = new URL('https://' + data);
      } catch (e2) {
        url = null;
      }
    }

    const tagRegex = /^[A-Z0-9\-]{3,40}$/i;

    if (url) {
      // Check common query params
      const q = url.searchParams.get('tag') || url.searchParams.get('tagCode') || url.searchParams.get('code');
      if (q && tagRegex.test(q)) return q.trim().toUpperCase();

      // Check path segments - return the first segment that looks like a tag code
      const parts = url.pathname.split('/').filter(Boolean);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        if (tagRegex.test(p)) return p.trim().toUpperCase();
      }
    }

    // If not a URL or URL parsing didn't yield a tag, inspect the raw string
    const raw = tryNormalize(data);
    // If it's a path-like string (starts with /), split and look for a matching segment
    if (raw.startsWith('/')) {
      const parts = raw.split('/').filter(Boolean);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        if (tagRegex.test(p)) return p.trim().toUpperCase();
      }
    }

    // Fallback: if the entire payload looks like a tag, return it
    if (tagRegex.test(raw)) return raw.toUpperCase();

    return null;
  };

  const handleScanResult = (data: string) => {
    const code = extractTagFromScan(data);
    if (!code) {
      toast({ title: 'Invalid QR', description: 'Scanned QR did not contain a valid tag code', variant: 'destructive' });
      setShowScanner(false);
      return;
    }

    console.log('QR scan result -> tag code:', code);
    toast({ title: 'QR Scanned', description: `Tag code ${code} detected`, });
    setTagCode(code);
    setGiveType('search');
    // run the existing search mutation
    searchMutation.mutate(code);
    setShowScanner(false);
  };

  const handleGive = () => {
    const recipientCode = giveType === 'organization' ? selectedOrg : searchedTag?.tagCode;
    
    if (!recipientCode) {
      toast({
        title: giveType === 'organization' ? "Select organization" : "Search for tag first",
        description: giveType === 'organization' ? "Please select an organization" : "Please search for a tag before donating",
        variant: "destructive",
      });
      return;
    }

    const amountZAR = parseFloat(amount);
    const amountCents = amountZAR * 100;
    
    if (!amount || amountZAR <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (amountCents > philanthropist.balanceZAR) {
      toast({
        title: "Insufficient balance",
        description: "Please fund your account first",
        variant: "destructive",
      });
      return;
    }

    giveMutation.mutate({
      tagCode: recipientCode,
      amountZAR: amountZAR,
      donorName: isAnonymous ? undefined : donorName || philanthropist.displayName || 'Anonymous Donor',
    });
  };

  const formatZAR = (cents: number) => `R ${(cents / 100).toFixed(2)}`;

  const organizations = orgsData?.organizations || [];
  const selectedOrgData = organizations.find(org => org.tagCode === selectedOrg);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/philanthropist/dashboard">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Give to Charity</h1>
          <p className="text-muted-foreground">
            Support organizations or individuals anonymously or with your name
          </p>
        </div>

        <Card className="mb-6" data-testid="card-balance">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
              <p className="text-3xl font-bold text-primary" data-testid="text-balance">
                {formatZAR(philanthropist.balanceZAR)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Tabs value={giveType} onValueChange={(v) => setGiveType(v as 'organization' | 'search')} className="mb-6">
          <TabsList className="grid w-full grid-cols-2" data-testid="tabs-give-type">
            <TabsTrigger value="organization" data-testid="tab-organization">
              <Building2 className="w-4 h-4 mr-2" />
              Organizations
            </TabsTrigger>
            <TabsTrigger value="search" data-testid="tab-search">
              <Search className="w-4 h-4 mr-2" />
              Search Tag
            </TabsTrigger>
          </TabsList>

          <TabsContent value="organization" className="mt-6 space-y-6">
            <Card data-testid="card-select-org">
              <CardHeader>
                <CardTitle>1. Select Organization</CardTitle>
                <CardDescription>Choose a registered charity to support</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Organization</Label>
                  <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                    <SelectTrigger className="w-full" data-testid="select-organization">
                      <SelectValue placeholder="Choose an organization..." />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.tagCode} value={org.tagCode} data-testid={`option-org-${org.tagCode}`}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedOrgData && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg" data-testid="card-org-info">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold" data-testid="text-org-name">
                          {selectedOrgData.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedOrgData.tagCode}
                        </p>
                      </div>
                    </div>
                    {selectedOrgData.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {selectedOrgData.description}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search" className="mt-6 space-y-6">
            <Card data-testid="card-search">
              <CardHeader>
                <CardTitle>1. Find Recipient</CardTitle>
                <CardDescription>Enter the tag code you want to support</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter tag code (e.g., CT001)"
                    value={tagCode}
                    onChange={(e) => setTagCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    data-testid="input-tag-code"
                  />
                  <div className="flex items-stretch gap-2">
                    <Button 
                      type="button"
                      onClick={handleSearch}
                      disabled={searchMutation.isPending}
                      data-testid="button-search"
                    >
                      {searchMutation.isPending ? '...' : <Search className="w-4 h-4" />}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowScanner(true)}
                      data-testid="button-scan-qr"
                      title="Scan QR Code"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {searchedTag && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg" data-testid="card-tag-info">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold" data-testid="text-beneficiary-name">
                          {searchedTag.beneficiaryName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {searchedTag.beneficiaryType} • {searchedTag.tagCode}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Current balance: {formatZAR(searchedTag.balanceZAR)}
                    </p>
                  </div>
                )}

                {tagNotFound && (
                  <div className="p-4 bg-muted/50 border border-border rounded-lg" data-testid="card-not-found">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <UserPlus className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium mb-1">Recipient Not Found</p>
                          <p className="text-sm text-muted-foreground">
                            The recipient you're searching for isn't registered yet. Invite them to join the Blockkoin Freedom Tag network!
                          </p>
                        </div>
                      </div>
                      <Link href="/philanthropist/invite">
                        <Button variant="outline" className="w-full" data-testid="button-invite-charity">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Invite Recipient
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* QR Scanner Dialog */}
        <Dialog open={showScanner} onOpenChange={(open) => setShowScanner(open)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Scan Recipient QR</DialogTitle>
            </DialogHeader>
            <div>
              <QRScanner onScan={handleScanResult} onClose={() => setShowScanner(false)} />
            </div>
          </DialogContent>
        </Dialog>

        {(selectedOrg || searchedTag) && (
          <>
            <Card className="mb-6" data-testid="card-donation-type">
              <CardHeader>
                <CardTitle>2. Donation Type</CardTitle>
                <CardDescription>Choose how you want to donate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <Label htmlFor="anonymous" className="text-base font-medium">
                      {isAnonymous ? 'Anonymous Donation' : 'Named Donation'}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {isAnonymous 
                        ? 'Your identity will not be shared' 
                        : 'Your name will be included with the donation'}
                    </p>
                  </div>
                  <Switch
                    id="anonymous"
                    checked={!isAnonymous}
                    onCheckedChange={(checked) => setIsAnonymous(!checked)}
                    data-testid="switch-anonymous"
                  />
                </div>

                {!isAnonymous && (
                  <div className="space-y-2">
                    <Label htmlFor="donor-name">Your Name (optional)</Label>
                    <Input
                      id="donor-name"
                      placeholder={philanthropist.displayName || "Enter your name"}
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      data-testid="input-donor-name"
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave blank to use: {philanthropist.displayName || 'Anonymous Donor'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-amount">
              <CardHeader>
                <CardTitle>3. Enter Amount</CardTitle>
                <CardDescription>How much do you want to give?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (ZAR)</Label>
                  <Input
                    id="amount"
                    type="text"
                    inputMode="numeric"
                    placeholder="100"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    data-testid="input-amount"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setAmount('50')}
                    data-testid="button-quick-50"
                  >
                    R 50
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setAmount('100')}
                    data-testid="button-quick-100"
                  >
                    R 100
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setAmount('250')}
                    data-testid="button-quick-250"
                  >
                    R 250
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setAmount('500')}
                    data-testid="button-quick-500"
                  >
                    R 500
                  </Button>
                </div>

                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleGive}
                  disabled={giveMutation.isPending}
                  data-testid="button-give"
                >
                  {giveMutation.isPending ? 'Sending...' : (
                    <>
                      <Send className="w-4 h-4" />
                      Give R {parseFloat(amount || '0').toFixed(2)} {isAnonymous ? 'Anonymously' : `as ${donorName || philanthropist.displayName || 'Named Donor'}`}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100 font-semibold mb-2">
            How it works
          </p>
          <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
            <li>Choose an organization or search for a specific tag</li>
            <li>Decide if you want to donate anonymously or with your name</li>
            <li>Enter the amount and confirm - funds transfer instantly</li>
          </ol>
        </div>

        {/* Removed QR code per requirement: not needed in organizations/search section */}
      </div>

      {showStoryDialog && donationTransaction && (
        <StoryDialog
          open={showStoryDialog}
          onClose={() => {
            setShowStoryDialog(false);
            setLocation('/philanthropist/dashboard');
          }}
          transactionId={donationTransaction.id}
          amountZAR={donationTransaction.amountZAR}
          authorType="GIVER"
        />
      )}
    </div>
  );
}
