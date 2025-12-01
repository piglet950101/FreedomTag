import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { 
  Search, 
  ArrowRight, 
  ExternalLink, 
  CheckCircle2, 
  Clock,
  User,
  Building2,
  Coins,
  CreditCard,
  Mail
} from "lucide-react";
import { format } from "date-fns";

interface DonationTracking {
  donations: Array<{
    id: string;
    ts: Date;
    amount: number;
    currency: string;
    tagInfo: {
      tagCode: string;
      beneficiaryName: string;
      beneficiaryType: string;
    } | null;
    orgInfo: {
      id: string;
      name: string;
      smartContractAddress: string | null;
      blockchainNetwork: string | null;
    } | null;
    blockchainTxHash: string | null;
    blockchainNetwork: string | null;
  }>;
  totalAmount: number;
  count: number;
}

interface TagDonationTracking {
  tagInfo: {
    tagCode: string;
    beneficiaryName: string;
    beneficiaryType: string;
    currentBalance: number;
  } | null;
  donationsMade: Array<{
    id: string;
    ts: Date;
    amount: number;
    currency: string;
    type: 'made';
    tagInfo: {
      tagCode: string;
      beneficiaryName: string;
      beneficiaryType: string;
    } | null;
    orgInfo: {
      id: string;
      name: string;
      smartContractAddress: string | null;
      blockchainNetwork: string | null;
    } | null;
    blockchainTxHash: string | null;
    blockchainNetwork: string | null;
  }>;
  donationsReceived: Array<{
    id: string;
    ts: Date;
    amount: number;
    currency: string;
    type: 'received';
    donorName: string | null;
    donorEmail: string | null;
    orgInfo: {
      id: string;
      name: string;
      smartContractAddress: string | null;
      blockchainNetwork: string | null;
    } | null;
    blockchainTxHash: string | null;
    blockchainNetwork: string | null;
  }>;
  totalDonated: number;
  totalReceived: number;
  countDonated: number;
  countReceived: number;
}

interface DonationFlow {
  donation: {
    id: string;
    ts: Date;
    amount: number;
    currency: string;
    donorName: string | null;
    donorEmail: string | null;
    blockchainTxHash: string | null;
    blockchainNetwork: string | null;
  };
  tag: {
    tagCode: string;
    beneficiaryName: string;
    beneficiaryType: string;
    currentBalance: number;
  } | null;
  organization: {
    id: string;
    name: string;
    smartContractAddress: string | null;
    blockchainNetwork: string | null;
  } | null;
  distributions: Array<{
    id: string;
    ts: Date;
    amount: number;
    toBeneficiary: {
      tagCode: string;
      beneficiaryName: string;
    } | null;
  }>;
}

export default function DonorTracking() {
  const [searchMethod, setSearchMethod] = useState<'email' | 'tag'>('email');
  const [email, setEmail] = useState("");
  const [tagCode, setTagCode] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchTagCode, setSearchTagCode] = useState("");
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  const { data: tracking, isLoading: isLoadingEmail, error: trackingError } = useQuery<DonationTracking>({
    queryKey: [`/api/donor/track/${searchEmail}`],
    enabled: !!searchEmail && searchMethod === 'email',
  });

  const { data: tagTracking, isLoading: isLoadingTag, error: tagTrackingError } = useQuery<TagDonationTracking>({
    queryKey: [`/api/donor/track/tag/${searchTagCode}`],
    enabled: !!searchTagCode && searchMethod === 'tag',
  });

  const { data: flow, error: flowError } = useQuery<DonationFlow>({
    queryKey: [`/api/donor/flow/${selectedTxId}`],
    enabled: !!selectedTxId,
  });

  const handleEmailSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchEmail(email);
    setSearchTagCode("");
    setSelectedTxId(null);
    setSearchMethod('email');
  };

  const handleTagSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTagCode(tagCode);
    setSearchEmail("");
    setSelectedTxId(null);
    setSearchMethod('tag');
  };

  const isLoading = isLoadingEmail || isLoadingTag;

  const formatCurrency = (cents: number, currency: string = 'ZAR') => {
    const prefix = currency === 'ZAR' ? 'R' : currency;
    return `${prefix} ${(cents / 100).toFixed(2)}`;
  };

  const getBlockchainExplorerUrl = (network: string, txHash: string) => {
    if (network?.toLowerCase() === 'ethereum') {
      return `https://etherscan.io/tx/${txHash}`;
    }
    return null;
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2" data-testid="heading-donor-tracking">Track Your Donations</h1>
        <p className="text-muted-foreground text-lg">
          Follow your donation from your wallet to the beneficiary with complete blockchain transparency
        </p>
      </div>

      <Card className="mb-8" data-testid="card-search">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Your Donations
          </CardTitle>
          <CardDescription>
            Search by email or Freedom Tag account number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="email" className="gap-2" data-testid="tab-email">
                <Mail className="w-4 h-4" />
                By Email
              </TabsTrigger>
              <TabsTrigger value="tag" className="gap-2" data-testid="tab-tag">
                <CreditCard className="w-4 h-4" />
                By Freedom Tag
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="email">
              <form onSubmit={handleEmailSearch} className="flex gap-4">
                <Input
                  type="email"
                  placeholder="donor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  data-testid="input-donor-email"
                />
                <Button type="submit" className="gap-2" data-testid="button-search">
                  <Search className="w-4 h-4" />
                  Search
                </Button>
              </form>
              <p className="text-sm text-muted-foreground mt-2">
                Enter the email address you used when donating
              </p>
            </TabsContent>
            
            <TabsContent value="tag">
              <form onSubmit={handleTagSearch} className="flex gap-4">
                <Input
                  type="text"
                  placeholder="TAG123456"
                  value={tagCode}
                  onChange={(e) => setTagCode(e.target.value.toUpperCase())}
                  className="flex-1"
                  data-testid="input-tag-code"
                />
                <Button type="submit" className="gap-2" data-testid="button-search-tag">
                  <Search className="w-4 h-4" />
                  Search
                </Button>
              </form>
              <p className="text-sm text-muted-foreground mt-2">
                Enter your Freedom Tag account number to see all donations made and received
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {isLoading && (
        <Card data-testid="card-loading">
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">Loading your donations...</p>
          </CardContent>
        </Card>
      )}

      {trackingError && (
        <Card data-testid="card-error">
          <CardContent className="py-12">
            <p className="text-center text-destructive">Failed to load donations. Please try again.</p>
          </CardContent>
        </Card>
      )}

      {tracking && tracking.count === 0 && !trackingError && (
        <Card data-testid="card-no-donations">
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">No donations found for this email address</p>
          </CardContent>
        </Card>
      )}

      {tracking && tracking.count > 0 && (
        <>
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card data-testid="card-stat-total">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Donated</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold" data-testid="text-total-amount">
                  {formatCurrency(tracking.totalAmount)}
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-stat-count">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Donations Made</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold" data-testid="text-donation-count">{tracking.count}</p>
              </CardContent>
            </Card>

            <Card data-testid="card-stat-verified">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Blockchain Verified</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold" data-testid="text-verified-count">
                  {tracking.donations.filter(d => d.blockchainTxHash).length}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card data-testid="card-donations-list">
            <CardHeader>
              <CardTitle>Your Donation History</CardTitle>
              <CardDescription>Click on a donation to see its complete flow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tracking.donations.map((donation) => (
                  <div
                    key={donation.id}
                    className={`p-4 rounded-lg border hover-elevate cursor-pointer transition-all ${
                      selectedTxId === donation.id ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => setSelectedTxId(donation.id)}
                    data-testid={`donation-item-${donation.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-semibold" data-testid={`amount-${donation.id}`}>
                            {formatCurrency(donation.amount, donation.currency)}
                          </span>
                          {donation.blockchainTxHash && (
                            <CheckCircle2 className="w-5 h-5 text-green-500" data-testid={`verified-${donation.id}`} />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Clock className="w-4 h-4" />
                          {format(new Date(donation.ts), 'PPP p')}
                        </div>

                        {donation.tagInfo && (
                          <div className="flex items-center gap-2 text-sm mb-1">
                            <User className="w-4 h-4" />
                            <span className="font-medium" data-testid={`beneficiary-${donation.id}`}>
                              {donation.tagInfo.beneficiaryName}
                            </span>
                            <span className="text-muted-foreground">({donation.tagInfo.tagCode})</span>
                          </div>
                        )}

                        {donation.orgInfo && (
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="w-4 h-4" />
                            <span className="font-medium" data-testid={`organization-${donation.id}`}>
                              {donation.orgInfo.name}
                            </span>
                            {donation.orgInfo.smartContractAddress && (
                              <a
                                href={`https://etherscan.io/address/${donation.orgInfo.smartContractAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline inline-flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                                data-testid={`contract-link-${donation.id}`}
                              >
                                View Contract
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      <Button 
                        variant="ghost" 
                        size="sm"
                        data-testid={`button-view-flow-${donation.id}`}
                      >
                        View Flow
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>

                    {donation.blockchainTxHash && (
                      <div className="mt-3 pt-3 border-t">
                        <a
                          href={getBlockchainExplorerUrl(donation.blockchainNetwork || 'ethereum', donation.blockchainTxHash) || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                          data-testid={`blockchain-link-${donation.id}`}
                        >
                          <ExternalLink className="w-4 h-4" />
                          View on {donation.blockchainNetwork || 'Ethereum'} Explorer
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {tagTracking && tagTracking.tagInfo && (
        <>
          <Card className="mb-8" data-testid="card-tag-info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Freedom Tag Account: {tagTracking.tagInfo.tagCode}
              </CardTitle>
              <CardDescription>
                {tagTracking.tagInfo.beneficiaryName} ({tagTracking.tagInfo.beneficiaryType})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                  <p className="text-2xl font-bold">{formatCurrency(tagTracking.tagInfo.currentBalance || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card data-testid="card-stat-donated">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Donated by Tag</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold" data-testid="text-total-donated">
                  {formatCurrency(tagTracking.totalDonated)}
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-stat-donated-count">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Donations Made</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold" data-testid="text-count-donated">{tagTracking.countDonated}</p>
              </CardContent>
            </Card>

            <Card data-testid="card-stat-received">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Received by Tag</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold" data-testid="text-total-received">
                  {formatCurrency(tagTracking.totalReceived)}
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-stat-received-count">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Donations Received</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold" data-testid="text-count-received">{tagTracking.countReceived}</p>
              </CardContent>
            </Card>
          </div>

          {tagTracking.donationsMade.length > 0 && (
            <Card className="mb-8" data-testid="card-donations-made">
              <CardHeader>
                <CardTitle>Donations Made by This Tag</CardTitle>
                <CardDescription>Donations you gave to other beneficiaries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tagTracking.donationsMade.map((donation) => (
                    <div
                      key={donation.id}
                      className={`p-4 rounded-lg border hover-elevate cursor-pointer transition-all ${
                        selectedTxId === donation.id ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                      onClick={() => setSelectedTxId(donation.id)}
                      data-testid={`donation-made-${donation.id}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-semibold" data-testid={`made-amount-${donation.id}`}>
                              {formatCurrency(donation.amount, donation.currency)}
                            </span>
                            {donation.blockchainTxHash && (
                              <CheckCircle2 className="w-5 h-5 text-green-500" data-testid={`made-verified-${donation.id}`} />
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Clock className="w-4 h-4" />
                            {format(new Date(donation.ts), 'PPP p')}
                          </div>

                          {donation.tagInfo && (
                            <div className="flex items-center gap-2 text-sm mb-1">
                              <User className="w-4 h-4" />
                              <span className="font-medium">To: {donation.tagInfo.beneficiaryName}</span>
                              <span className="text-muted-foreground">({donation.tagInfo.tagCode})</span>
                            </div>
                          )}

                          {donation.orgInfo && (
                            <div className="flex items-center gap-2 text-sm">
                              <Building2 className="w-4 h-4" />
                              <span className="font-medium">{donation.orgInfo.name}</span>
                              {donation.orgInfo.smartContractAddress && (
                                <a
                                  href={`https://etherscan.io/address/${donation.orgInfo.smartContractAddress}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline inline-flex items-center gap-1"
                                  onClick={(e) => e.stopPropagation()}
                                  data-testid={`made-contract-link-${donation.id}`}
                                >
                                  View Contract
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>

                        <Button 
                          variant="ghost" 
                          size="sm"
                          data-testid={`button-view-made-flow-${donation.id}`}
                        >
                          View Flow
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {tagTracking.donationsReceived.length > 0 && (
            <Card className="mb-8" data-testid="card-donations-received">
              <CardHeader>
                <CardTitle>Donations Received by This Tag</CardTitle>
                <CardDescription>Support you received from donors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tagTracking.donationsReceived.map((donation) => (
                    <div
                      key={donation.id}
                      className="p-4 rounded-lg border"
                      data-testid={`donation-received-${donation.id}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-semibold" data-testid={`received-amount-${donation.id}`}>
                              {formatCurrency(donation.amount, donation.currency)}
                            </span>
                            {donation.blockchainTxHash && (
                              <CheckCircle2 className="w-5 h-5 text-green-500" data-testid={`received-verified-${donation.id}`} />
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Clock className="w-4 h-4" />
                            {format(new Date(donation.ts), 'PPP p')}
                          </div>

                          {(donation.donorName || donation.donorEmail) && (
                            <div className="flex items-center gap-2 text-sm mb-1">
                              <User className="w-4 h-4" />
                              <span className="font-medium">
                                From: {donation.donorName || donation.donorEmail || 'Anonymous'}
                              </span>
                            </div>
                          )}

                          {donation.orgInfo && donation.orgInfo.smartContractAddress && (
                            <div className="flex items-center gap-2 text-sm">
                              <Building2 className="w-4 h-4" />
                              <a
                                href={`https://etherscan.io/address/${donation.orgInfo.smartContractAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline inline-flex items-center gap-1"
                                data-testid={`received-contract-link-${donation.id}`}
                              >
                                View Organization Contract
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {donation.blockchainTxHash && (
                        <div className="mt-3 pt-3 border-t">
                          <a
                            href={getBlockchainExplorerUrl(donation.blockchainNetwork || 'ethereum', donation.blockchainTxHash) || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                            data-testid={`received-blockchain-link-${donation.id}`}
                          >
                            <ExternalLink className="w-4 h-4" />
                            View on {donation.blockchainNetwork || 'Ethereum'} Explorer
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {tagTracking.countDonated === 0 && tagTracking.countReceived === 0 && (
            <Card data-testid="card-no-tag-activity">
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">No donation activity for this Freedom Tag</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {tagTrackingError && (
        <Card data-testid="card-tag-error">
          <CardContent className="py-12">
            <p className="text-center text-destructive">Failed to load tag donations. Please try again.</p>
          </CardContent>
        </Card>
      )}

      {searchTagCode && tagTracking && !tagTracking.tagInfo && (
        <Card data-testid="card-tag-not-found">
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">Freedom Tag not found: {searchTagCode}</p>
          </CardContent>
        </Card>
      )}

      {flow && selectedTxId && (
        <Card className="mt-8" data-testid="card-donation-flow">
          <CardHeader>
            <CardTitle>Donation Flow</CardTitle>
            <CardDescription>
              Complete transparency: From your donation to the beneficiary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Coins className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1" data-testid="flow-step-donation">Your Donation</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {formatCurrency(flow.donation.amount, flow.donation.currency)} on {format(new Date(flow.donation.ts), 'PPP')}
                  </p>
                  {flow.donation.blockchainTxHash && (
                    <a
                      href={getBlockchainExplorerUrl(flow.donation.blockchainNetwork || 'ethereum', flow.donation.blockchainTxHash) || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                      data-testid="flow-blockchain-link"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Transaction on Blockchain
                    </a>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="w-6 h-6 text-muted-foreground" />
              </div>

              {flow.tag && (
                <>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1" data-testid="flow-step-beneficiary">Received by Beneficiary</h3>
                      <p className="text-sm mb-1">
                        <span className="font-medium" data-testid="flow-beneficiary-name">{flow.tag.beneficiaryName}</span>
                        <span className="text-muted-foreground ml-2">({flow.tag.tagCode})</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Current Tag Balance: {formatCurrency(flow.tag.currentBalance)}
                      </p>
                    </div>
                  </div>

                  {flow.organization && (
                    <>
                      <div className="flex justify-center">
                        <ArrowRight className="w-6 h-6 text-muted-foreground" />
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1" data-testid="flow-step-organization">Managed by Organization</h3>
                          <p className="text-sm mb-2" data-testid="flow-organization-name">{flow.organization.name}</p>
                          {flow.organization.smartContractAddress && (
                            <a
                              href={`https://etherscan.io/address/${flow.organization.smartContractAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                              data-testid="flow-contract-link"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Smart Contract Verified
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {flow.distributions.length > 0 && (
                    <>
                      <div className="flex justify-center">
                        <ArrowRight className="w-6 h-6 text-muted-foreground" />
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4">
                        <h3 className="font-semibold mb-3">Distributions from this Tag</h3>
                        <div className="space-y-2">
                          {flow.distributions.map((dist) => (
                            <div key={dist.id} className="flex items-center justify-between text-sm" data-testid={`distribution-${dist.id}`}>
                              <div>
                                <span className="font-medium">{dist.toBeneficiary?.beneficiaryName || 'Unknown'}</span>
                                <span className="text-muted-foreground ml-2">({dist.toBeneficiary?.tagCode})</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{formatCurrency(dist.amount)}</span>
                                <span className="text-muted-foreground">{format(new Date(dist.ts), 'PP')}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 text-center">
        <Link href="/">
          <Button variant="outline" data-testid="button-back-home">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
