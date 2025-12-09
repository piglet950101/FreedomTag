import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Heart, Store, Users, Building, LogOut, Wallet, Gift, ShoppingBag, AlertCircle, Plus, Copy, Key, Eye, EyeOff, ArrowLeft, Bitcoin } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import DonationQRCode from "@/components/DonationQRCode";


interface UserSession {
  user: {
    id: string;
    email: string;
    fullName: string;
    blockkoinAccountId?: string;
    blockkoinKycStatus?: string;
  };
  roles: string[];
  beneficiaryTag?: {
    tagCode: string;
    beneficiaryName: string;
    balanceZAR: number;
  };
}

interface CryptoBalances {
  BTC: number;
  ETH: number;
  USDT: number;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [blockkoinAccountInput, setBlockkoinAccountInput] = useState("");
  const [isLinkingBlockkoin, setIsLinkingBlockkoin] = useState(false);

  const { data: session, isLoading, error: authError } = useQuery<UserSession | null>({
    queryKey: ["/api/auth/me"],
    retry: false,
    queryFn: async () => {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      if (res.status === 401) {
        // Return null for 401, don't throw - we'll handle redirect separately
        return null;
      }
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status}: ${text || res.statusText}`);
      }
      return res.json();
    },
  });


  const hasBlockkoinAccount = (() => {
    const v = String(session?.user.blockkoinAccountId || "").trim().toLowerCase();
    return v.length > 0 && v !== "none" && v !== "null" && v !== "undefined" && v !== "0";
  })();

  const { data: cryptoBalances } = useQuery<CryptoBalances>({
    queryKey: ["/api/crypto/balances"],
    enabled: hasBlockkoinAccount,
    retry: false,
  });

  const linkBlockkoinAccount = async () => {
    const id = blockkoinAccountInput.trim();
    if (!id || id.length < 3) {
      toast({ title: 'Invalid ID', description: 'Enter a valid Blockkoin account ID', variant: 'destructive' });
      return;
    }
    setIsLinkingBlockkoin(true);
    try {
      const res = await fetch('/api/blockkoin/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ accountId: id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to link' }));
        throw new Error(err.error || 'Failed to link');
      }
      const data = await res.json();
      toast({ title: 'Wallet linked', description: `Account ${data.blockkoinAccountId} connected` });
      setBlockkoinAccountInput('');
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    } catch (e: any) {
      toast({ title: 'Linking failed', description: String(e.message || e), variant: 'destructive' });
    } finally {
      setIsLinkingBlockkoin(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to change password");
      }

      toast({
        title: "Success",
        description: "Password changed successfully",
      });

      setIsPasswordDialogOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle authentication errors - show loading while checking
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loading-spinner" />
      </div>
    );
  }

  // Only redirect if query has completed and there's no session
  // Don't redirect immediately - wait for query to finish
  if (!session && !isLoading) {
    // Check if it's an auth error or just no session
    if (authError) {
      const errorMessage = authError instanceof Error ? authError.message : String(authError);
      if (errorMessage.includes('401') || errorMessage.includes('Not authenticated')) {
        toast({
          title: "Session Expired",
          description: "Please log in again to access your dashboard.",
          variant: "destructive",
        });
        setTimeout(() => {
          setLocation('/beneficiary/login');
        }, 100);
        return (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Redirecting to login...</p>
            </div>
          </div>
        );
      }
    }
    
    // If no session and no error, redirect to login (not home)
    toast({
      title: "Authentication Required",
      description: "Please log in to access your dashboard.",
      variant: "destructive",
    });
    setTimeout(() => {
      setLocation('/beneficiary/login');
    }, 100);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const roleIcons: Record<string, any> = {
    BENEFICIARY: Heart,
    MERCHANT: Store,
    PHILANTHROPIST: Gift,
    ORGANIZATION: Building,
    ADMIN: Users,
  };

  const roleColors: Record<string, string> = {
    BENEFICIARY: "bg-green-500/10 text-green-700 border-green-500/20",
    MERCHANT: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    PHILANTHROPIST: "bg-purple-500/10 text-purple-700 border-purple-500/20",
    ORGANIZATION: "bg-orange-500/10 text-orange-700 border-orange-500/20",
    ADMIN: "bg-red-500/10 text-red-700 border-red-500/20",
  };

  const roleActions: Record<string, { title: string; description: string; icon: any; action: string }[]> = {
    BENEFICIARY: [
      {
        title: "View My Tags",
        description: "Access your Freedom Tags and check balances",
        icon: Wallet,
        action: "/beneficiary",
      },
    ],
    MERCHANT: [
      {
        title: "Accept Payments",
        description: "Redeem Freedom Tag payments at your outlet",
        icon: ShoppingBag,
        action: "/merchant",
      },
    ],
    PHILANTHROPIST: [
      {
        title: "Give to Tags",
        description: "Support beneficiaries through Freedom Tags",
        icon: Gift,
        action: "/philanthropist/give",
      },
      {
        title: "Spend at Merchants",
        description: "Use your balance at participating outlets",
        icon: Store,
        action: "/philanthropist/spend",
      },
    ],
    ORGANIZATION: [
      {
        title: "Manage Organization",
        description: "Issue tags and manage your organization",
        icon: Building,
        action: "/organization",
      },
    ],
    ADMIN: [
      {
        title: "Admin Portal",
        description: "Manage system settings and users",
        icon: Users,
        action: "/admin",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => setLocation('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground" data-testid="heading-welcome">
                Welcome, {session.user.fullName}
              </h1>
              <p className="text-sm text-muted-foreground" data-testid="text-email">
                {session.user.email}
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                      Enter your current password and choose a new password
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                        />
                        <div
                          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                        <div
                          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                        <div
                          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsPasswordDialogOpen(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleChangePassword}
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? "Changing..." : "Change Password"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8  max-w-5xl">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Your Roles</h2>
          <div className="flex flex-wrap gap-3" data-testid="container-roles">
            {session.roles.map((role) => {
              const roleStr = String(role);
              const Icon = roleIcons[roleStr] || Users;
              return (
                <Badge
                  key={roleStr}
                  variant="outline"
                  className={`px-4 py-2 ${roleColors[roleStr] || ""}`}
                  data-testid={`badge-role-${roleStr.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {roleStr.charAt(0) + roleStr.slice(1).toLowerCase()}
                </Badge>
              );
            })}
          </div>
        </div>

        {session.roles.includes('BENEFICIARY') && !session.beneficiaryTag && (
          <Alert className="mb-8 border-yellow-500/50 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-900">No Freedom Tag Found</AlertTitle>
            <AlertDescription className="text-yellow-800">
              You don't have a Freedom Tag yet. Create one to receive donations and access services.
              <div className="mt-3">
                <Button
                  onClick={() => setLocation('/quick-tag-setup')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  data-testid="button-setup-tag"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Set Up Freedom Tag
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {Array.isArray(session.roles) && session.roles.indexOf('BENEFICIARY') !== -1 && session.beneficiaryTag && (
          <Card className="mb-8 border-green-500/20 bg-green-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Heart className="h-5 w-5 text-green-600" />
                My Freedom Tag
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tag Code</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-foreground" data-testid="text-tag-code">
                      {session.beneficiaryTag.tagCode}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        navigator.clipboard.writeText(session.beneficiaryTag!.tagCode);
                        toast({
                          title: "Copied!",
                          description: `Tag code ${session.beneficiaryTag!.tagCode} copied to clipboard`,
                        });
                      }}
                      title="Copy tag code"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Name</p>
                  <p className="text-lg font-medium text-foreground">
                    {session.beneficiaryTag.beneficiaryName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Balance</p>
                  <p className="text-lg font-medium text-foreground">
                    R {(session.beneficiaryTag.balanceZAR / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {hasBlockkoinAccount && cryptoBalances && (
          <Card className="mb-8 border-orange-500/20 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <Bitcoin className="h-5 w-5 text-orange-600" />
                Blockkoin Wallet
              </CardTitle>
              <CardDescription>
                Blockkoin Account: {session.user.blockkoinAccountId}
                {session.user.blockkoinKycStatus && (
                  <Badge variant="outline" className="ml-2">
                    KYC: {session.user.blockkoinKycStatus}
                  </Badge>
                )}
                {session.user.blockkoinKycStatus === 'none' && (
                  <Button
                    variant="default"
                    className="ml-3 bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => window.open('https://bkr.blockkoin.io/', '_blank')}
                    data-testid="button-kyc-verify"
                  >
                    Verify KYC
                  </Button>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-orange-100/50 border border-orange-200">
                  <p className="text-sm text-muted-foreground mb-1">Bitcoin (BTC)</p>
                  <p className="text-xl font-bold text-foreground">
                    {cryptoBalances.BTC.toFixed(8)} BTC
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-purple-100/50 border border-purple-200">
                  <p className="text-sm text-muted-foreground mb-1">Ethereum (ETH)</p>
                  <p className="text-xl font-bold text-foreground">
                    {cryptoBalances.ETH.toFixed(8)} ETH
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-green-100/50 border border-green-200">
                  <p className="text-sm text-muted-foreground mb-1">Tether (USDT)</p>
                  <p className="text-xl font-bold text-foreground">
                    {cryptoBalances.USDT.toFixed(2)} USDT
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!hasBlockkoinAccount && (
          <Card className="mb-8 border-orange-500/20 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <Bitcoin className="h-5 w-5 text-orange-600" />
                Connect Blockkoin Wallet
              </CardTitle>
              <CardDescription>
                Create or connect your Blockkoin wallet to view balances and send/receive crypto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => window.open('https://bkr.blockkoin.io/register', '_blank')}
                  data-testid="button-blockkoin-onboard"
                >
                  Get Started on Blockkoin
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://bkr.blockkoin.io/', '_blank')}
                >
                  Open Blockkoin
                </Button>
              </div>
              <div className="mt-4 grid gap-2 md:grid-cols-[1fr_auto]">
                <Input
                  placeholder="Paste Blockkoin account ID"
                  value={blockkoinAccountInput}
                  onChange={(e) => setBlockkoinAccountInput(e.target.value)}
                  data-testid="input-blockkoin-account"
                />
                <Button
                  onClick={linkBlockkoinAccount}
                  disabled={isLinkingBlockkoin || !blockkoinAccountInput.trim()}
                  data-testid="button-link-blockkoin"
                >
                  {isLinkingBlockkoin ? 'Linking…' : 'Link Wallet'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>

          {session.roles.map((role) => {
            const roleStr = String(role);
            const actions = roleActions[roleStr] || [];
            if (actions.length === 0) return null;

            return (
              <div key={roleStr} className="space-y-3">
                <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                  {(() => {
                    const Icon = roleIcons[roleStr];
                    return Icon ? <Icon className="h-5 w-5" /> : null;
                  })()}
                  {roleStr.charAt(0) + roleStr.slice(1).toLowerCase()} Actions
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {actions.map((action, index) => {
                    // Disable "View My Tags" for beneficiaries without tags
                    const isDisabled = roleStr === 'BENEFICIARY' &&
                      action.action === '/beneficiary' &&
                      !session.beneficiaryTag;

                    return (
                      <Card
                        key={index}
                        className={`transition-all ${isDisabled
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover-elevate active-elevate-2 cursor-pointer'
                          }`}
                        onClick={() => !isDisabled && setLocation(action.action)}
                        data-testid={`card-action-${action.action.replace(/\//g, '-')}`}
                      >
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-base">
                            <action.icon className="h-5 w-5 text-primary" />
                            {action.title}
                          </CardTitle>
                          <CardDescription>
                            {isDisabled
                              ? 'Set up a Freedom Tag first to access this feature'
                              : action.description
                            }
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {Array.isArray(session.roles) && session.roles.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No Roles Assigned</CardTitle>
              <CardDescription>
                You don't have any roles assigned yet. Contact an administrator to get started.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {Array.isArray(session.roles) && session.roles.indexOf('BENEFICIARY') !== -1 && session.beneficiaryTag && (
          <div className="mb-6 mt-8" >
            <DonationQRCode
              url={`${window.location.origin}/tag/${session.beneficiaryTag.tagCode}`}
              tagCode={session.beneficiaryTag.tagCode}
              size={160}
            />
          </div>
        )}
      </main>
    </div>
  );
}
