import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, LogOut, Wallet, Gift, Building2, ArrowRight, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ReferralShare } from "@/components/ReferralShare";

interface PhilanthropistResponse {
  id: string;
  email: string;
  displayName: string | null;
  bio: string | null;
  walletId: string;
  balanceZAR: number;
  isAnonymous: number;
  country: string | null;
  referralCode: string | null;
}

export default function PhilanthropistDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: philanthropist, isLoading } = useQuery<PhilanthropistResponse>({
    queryKey: ['/api/philanthropist/me'],
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/philanthropist/logout', {});
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      setLocation('/philanthropist');
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!philanthropist) {
    setLocation('/philanthropist');
    return null;
  }

  const formatZAR = (cents: number) => {
    return `R ${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-dashboard-title">
              <Heart className="w-8 h-8 text-primary" />
              Philanthropist Portal
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {philanthropist.displayName || philanthropist.email}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card data-testid="card-balance">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
              <Wallet className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-balance">
                {formatZAR(philanthropist.balanceZAR)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Available to give
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-status">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Status</CardTitle>
              <Heart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {philanthropist.isAnonymous ? 'Anonymous' : 'Public'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Your giving is {philanthropist.isAnonymous ? 'private' : 'visible'}
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-wallet">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wallet ID</CardTitle>
              <Building2 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-mono truncate" data-testid="text-wallet-id">
                {philanthropist.walletId}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Your unique wallet identifier
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/philanthropist/fund" className="block">
            <Card className="hover-elevate h-full" data-testid="card-fund-account">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Fund Account
                </CardTitle>
                <CardDescription>
                  Add crypto or fiat to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg" data-testid="button-fund-account">
                  Add Funds
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Crypto or Blockkoin rails (fiat)
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/philanthropist/give" className="block">
            <Card className="hover-elevate h-full" data-testid="card-give-charity">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Give to Charity
                </CardTitle>
                <CardDescription>
                  Send funds anonymously to Freedom Tags
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg" data-testid="button-give-charity">
                  Give Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  100% anonymous donations
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/philanthropist/recurring" className="block">
            <Card className="hover-elevate h-full" data-testid="card-recurring">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  Crypto Direct Debit
                </CardTitle>
                <CardDescription>
                  Monthly automated crypto donations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg" data-testid="button-recurring">
                  Set Up Monthly
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  All coins supported + dust auto-donate
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/philanthropist/invite" className="block">
            <Card className="hover-elevate h-full" data-testid="card-invite-charity">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Invite Charity
                </CardTitle>
                <CardDescription>
                  Send referral link to new charities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg" data-testid="button-invite-charity">
                  Send Invite
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Earn R50 when they join
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/philanthropist/spend" className="block">
            <Card className="hover-elevate h-full" data-testid="card-spend">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                  Spend at Merchants
                </CardTitle>
                <CardDescription>
                  Use your balance at merchant outlets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg" data-testid="button-spend">
                  Spend Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Pay at participating merchants
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {philanthropist.referralCode && (
          <div className="mt-6">
            <ReferralShare 
              referralCode={philanthropist.referralCode}
              shareMessage={`Join Blockkoin Freedom Tag and help make a difference! Use code ${philanthropist.referralCode} when signing up.`}
            />
          </div>
        )}

        <Card className="mt-6" data-testid="card-features">
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>Features in development for philanthropist accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Receive gifts from other philanthropists
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                View detailed giving history and impact reports
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Set up recurring donations to your favorite causes
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Create giving campaigns and invite others
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🌍 Global Impact Platform
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Your philanthropist account is part of a global network supporting freedom tags for 
            the homeless, unbanked, migrant workers, and students worldwide. All donations are 
            tracked transparently while maintaining your anonymity.
          </p>
        </div>
      </div>
    </div>
  );
}
