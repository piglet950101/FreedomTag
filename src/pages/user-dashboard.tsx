import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  UserCircle, 
  LogOut, 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Repeat,
  Eye,
  EyeOff,
  ExternalLink,
  Heart,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { BuyCrypto } from "@/components/BuyCrypto";
import { LearnButton } from "@/components/LearnButton";

interface DashboardData {
  tag: {
    tagCode: string;
    beneficiaryName: string;
    beneficiaryType: string;
    description?: string;
    website?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    logoUrl?: string;
    referralCode?: string;
  };
  wallet: {
    id: string;
    balance: number;
  };
  stats: {
    totalGiven: number;
    totalReceived: number;
    donationsMadeCount: number;
    donationsReceivedCount: number;
  };
  organization?: {
    id: string;
    name: string;
    smartContractAddress?: string;
    blockchainNetwork?: string;
  } | null;
  recurringDonationsCount: number;
}

interface ActivityItem {
  id: string;
  ts: string;
  kind: string;
  amount: number;
  currency: string;
  ref?: string;
  donorName?: string;
  donorEmail?: string;
  donorTagCode?: string;
  blockchainTxHash?: string;
  blockchainNetwork?: string;
  fromInfo?: {
    tagCode: string;
    beneficiaryName: string;
  } | null;
  toInfo?: {
    tagCode: string;
    beneficiaryName: string;
  } | null;
  direction: 'sent' | 'received' | 'other';
}

interface RecurringDonation {
  id: string;
  recipientType: string;
  amountCents: number;
  cryptocurrency: string;
  frequency: string;
  status: string;
  nextProcessingDate: string;
  donorName?: string;
  recipientInfo?: {
    type: string;
    tagCode?: string;
    beneficiaryName?: string;
    name?: string;
    smartContractAddress?: string;
  };
}

export default function UserDashboard() {
  const params = useParams();
  const tagCode = params.tagCode as string;
  const [, setLocation] = useLocation();
  const [showAmounts, setShowAmounts] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery<DashboardData>({
    queryKey: [`/api/user/dashboard/${tagCode}`],
    enabled: !!tagCode,
    retry: false,
  });

  // Fetch activity data
  const { data: activityData, isLoading: activityLoading, error: activityError } = useQuery<{ activity: ActivityItem[] }>({
    queryKey: [`/api/user/activity/${tagCode}`],
    enabled: !!tagCode,
    retry: false,
  });

  // Fetch recurring donations
  const { data: recurringData, isLoading: recurringLoading, error: recurringError } = useQuery<{ recurringDonations: RecurringDonation[] }>({
    queryKey: [`/api/user/recurring-donations/${tagCode}`],
    enabled: !!tagCode,
    retry: false,
  });

  // Handle authentication errors - redirect to login
  useEffect(() => {
    const checkAuthError = (error: any) => {
      const errorMsg = error?.message?.toLowerCase() || '';
      // Check for 401 status code or authentication-related error messages
      if (errorMsg.startsWith('401') || 
          errorMsg.includes('not authenticated') || 
          errorMsg.includes('unauthorized') ||
          errorMsg.includes('authentication required')) {
        toast({
          title: "Session Expired",
          description: "Please log in again to continue",
          variant: "destructive",
        });
        setLocation('/tag/login');
        return true;
      }
      return false;
    };

    if (dashboardError && checkAuthError(dashboardError)) return;
    if (activityError && checkAuthError(activityError)) return;
    if (recurringError && checkAuthError(recurringError)) return;
  }, [dashboardError, activityError, recurringError, setLocation, toast]);
  
  // Mutation to update recurring donation status
  const updateRecurringDonation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest('PATCH', `/api/user/recurring-donations/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/recurring-donations/${tagCode}`] });
      toast({
        title: "Success",
        description: "Recurring donation updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update recurring donation",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    sessionStorage.removeItem('beneficiary');
    setLocation('/');
  };

  if (!tagCode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Invalid Tag Code</CardTitle>
            <CardDescription>No tag code was provided in the URL</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/tag/login')} data-testid="button-go-to-login">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (dashboardLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (dashboardError && !dashboardData) {
    const errorMsg = dashboardError.message?.toLowerCase() || '';
    const isAuthError = errorMsg.startsWith('401') || 
                        errorMsg.includes('not authenticated') || 
                        errorMsg.includes('unauthorized');
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Unable to Load Dashboard</CardTitle>
            <CardDescription>
              {isAuthError
                ? 'Your session has expired. Please log in again.' 
                : 'There was an error loading your dashboard data.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={() => setLocation('/tag/login')} className="w-full" data-testid="button-login">
              Go to Login
            </Button>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: [`/api/user/dashboard/${tagCode}`] })} variant="outline" className="w-full" data-testid="button-retry">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>Unable to retrieve dashboard information</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/tag/login')} data-testid="button-return-to-login">
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const balance = dashboardData.wallet.balance;
  const totalGiven = dashboardData.stats.totalGiven;
  const totalReceived = dashboardData.stats.totalReceived;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                <UserCircle className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold" data-testid="text-tag-code">{dashboardData.tag.tagCode}</h1>
                <p className="text-lg text-primary-foreground/80">{dashboardData.tag.beneficiaryName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LearnButton 
                route="/user-dashboard" 
                variant="ghost" 
                size="lg"
                className="text-primary-foreground hover:bg-primary-foreground/20"
              />
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setShowAmounts(!showAmounts)}
                className="text-primary-foreground hover:bg-primary-foreground/20"
                data-testid="button-toggle-amounts"
              >
                {showAmounts ? <Eye className="w-5 h-5 mr-2" /> : <EyeOff className="w-5 h-5 mr-2" />}
                {showAmounts ? 'Hide' : 'Show'} Amounts
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-primary-foreground/20"
                data-testid="button-logout"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-primary-foreground/10 border-primary-foreground/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-primary-foreground/70 mb-1">Current Balance</p>
                    <p className="text-3xl font-bold" data-testid="text-balance">
                      {showAmounts ? `R ${(balance / 100).toFixed(2)}` : '••••'}
                    </p>
                  </div>
                  <Wallet className="w-10 h-10 text-primary-foreground/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary-foreground/10 border-primary-foreground/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-primary-foreground/70 mb-1">Total Given</p>
                    <p className="text-3xl font-bold" data-testid="text-total-given">
                      {showAmounts ? `R ${(totalGiven / 100).toFixed(2)}` : '••••'}
                    </p>
                    <p className="text-xs text-primary-foreground/60 mt-1">
                      {dashboardData.stats.donationsMadeCount} donations
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-primary-foreground/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary-foreground/10 border-primary-foreground/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-primary-foreground/70 mb-1">Total Received</p>
                    <p className="text-3xl font-bold" data-testid="text-total-received">
                      {showAmounts ? `R ${(totalReceived / 100).toFixed(2)}` : '••••'}
                    </p>
                    <p className="text-xs text-primary-foreground/60 mt-1">
                      {dashboardData.stats.donationsReceivedCount} donations
                    </p>
                  </div>
                  <TrendingDown className="w-10 h-10 text-primary-foreground/50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 mb-8" data-testid="tabs-navigation">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <Activity className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="crypto" data-testid="tab-crypto">
              <Wallet className="w-4 h-4 mr-2" />
              Buy Crypto
            </TabsTrigger>
            <TabsTrigger value="recurring" data-testid="tab-recurring">
              <Repeat className="w-4 h-4 mr-2" />
              Recurring Donations
            </TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">
              <Heart className="w-4 h-4 mr-2" />
              My Profile
            </TabsTrigger>
          </TabsList>

          {/* Activity Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Complete Activity History</CardTitle>
                <CardDescription>
                  Track all your donations made, received, and transactions with blockchain verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activityLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                    <p className="text-sm text-muted-foreground">Loading activity...</p>
                  </div>
                ) : activityData && activityData.activity.length > 0 ? (
                  <div className="space-y-3" data-testid="list-activity">
                    {activityData.activity.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between p-4 rounded-lg border hover-elevate transition-all"
                        data-testid={`activity-item-${item.id}`}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            item.direction === 'sent' ? 'bg-orange-100 dark:bg-orange-900/20' : 'bg-green-100 dark:bg-green-900/20'
                          }`}>
                            {item.direction === 'sent' ? (
                              <ArrowUpRight className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            ) : (
                              <ArrowDownRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold">
                                {item.direction === 'sent' ? 'Donation Sent' : 'Donation Received'}
                              </p>
                              <Badge variant={item.kind === 'DONATION' ? 'default' : 'secondary'}>
                                {item.kind}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {item.direction === 'sent' && item.toInfo && `To: ${item.toInfo.beneficiaryName} (${item.toInfo.tagCode})`}
                              {item.direction === 'received' && item.fromInfo && `From: ${item.fromInfo.beneficiaryName || item.donorName || 'Anonymous'}`}
                              {item.direction === 'received' && !item.fromInfo && item.donorName && `From: ${item.donorName}`}
                              {item.ref && ` - ${item.ref}`}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{format(new Date(item.ts), 'PPp')}</span>
                              {item.blockchainTxHash && (
                                <a
                                  href={`https://etherscan.io/tx/${item.blockchainTxHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-primary hover:underline"
                                  data-testid={`link-blockchain-${item.id}`}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  View on Blockchain
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            item.direction === 'sent' ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'
                          }`} data-testid={`amount-${item.id}`}>
                            {item.direction === 'sent' ? '-' : '+'}
                            {showAmounts ? `R ${(item.amount / 100).toFixed(2)}` : '••••'}
                          </p>
                          <p className="text-xs text-muted-foreground">{item.currency}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No activity yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Buy Crypto Tab */}
          <TabsContent value="crypto" className="space-y-6">
            <BuyCrypto
              userType="tag"
              walletId={dashboardData.wallet.id}
              userId={dashboardData.tag.tagCode}
              currentBalance={balance}
            />
          </TabsContent>

          {/* Recurring Donations Tab */}
          <TabsContent value="recurring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Recurring Donations</CardTitle>
                <CardDescription>
                  Manage your monthly automatic donations (direct debits)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recurringLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                    <p className="text-sm text-muted-foreground">Loading recurring donations...</p>
                  </div>
                ) : recurringData && recurringData.recurringDonations.length > 0 ? (
                  <div className="space-y-3" data-testid="list-recurring-donations">
                    {recurringData.recurringDonations.map((donation) => (
                      <div
                        key={donation.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                        data-testid={`recurring-donation-${donation.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">
                              {donation.recipientInfo?.beneficiaryName || donation.recipientInfo?.name || 'Unknown'}
                            </p>
                            <Badge variant={donation.status === 'active' ? 'default' : 'secondary'}>
                              {donation.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {showAmounts ? `$${(donation.amountCents / 100).toFixed(2)}` : '••••'} {donation.cryptocurrency} • {donation.frequency}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Next: {format(new Date(donation.nextProcessingDate), 'PPP')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {donation.status === 'active' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => updateRecurringDonation.mutate({ id: donation.id, status: 'paused' })}
                              disabled={updateRecurringDonation.isPending}
                              data-testid={`button-pause-${donation.id}`}
                            >
                              Pause
                            </Button>
                          )}
                          {donation.status === 'paused' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => updateRecurringDonation.mutate({ id: donation.id, status: 'active' })}
                              disabled={updateRecurringDonation.isPending}
                              data-testid={`button-resume-${donation.id}`}
                            >
                              Resume
                            </Button>
                          )}
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => updateRecurringDonation.mutate({ id: donation.id, status: 'cancelled' })}
                            disabled={updateRecurringDonation.isPending}
                            data-testid={`button-cancel-${donation.id}`}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Repeat className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-3">No recurring donations set up</p>
                    <Button onClick={() => setLocation('/recurring-donations')} data-testid="button-setup-recurring">
                      Set Up Recurring Donation
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">My Profile</CardTitle>
                <CardDescription>
                  Your Freedom Tag information and social links
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Tag Code</p>
                  <p className="text-lg font-semibold">{dashboardData.tag.tagCode}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Beneficiary Name</p>
                  <p className="text-lg">{dashboardData.tag.beneficiaryName}</p>
                </div>
                {dashboardData.tag.description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                    <p className="text-base">{dashboardData.tag.description}</p>
                  </div>
                )}
                {dashboardData.tag.referralCode && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Referral Code</p>
                    <p className="text-lg font-mono">{dashboardData.tag.referralCode}</p>
                  </div>
                )}
                {dashboardData.organization && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-muted-foreground mb-3">Organization</p>
                    <div className="space-y-2">
                      <p className="text-lg font-semibold">{dashboardData.organization.name}</p>
                      {dashboardData.organization.smartContractAddress && (
                        <div className="flex items-center gap-2">
                          <Badge variant="default">Blockchain Verified</Badge>
                          <a
                            href={`https://etherscan.io/address/${dashboardData.organization.smartContractAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Smart Contract
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
