import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Tag, Building2, Info, Users, CreditCard, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Admin() {

  const { data: tagsData, isLoading: tagsLoading } = useQuery<any>({
    queryKey: ['/api/tags/list'],
  });

  const { data: ratesData } = useQuery<any>({
    queryKey: ['/api/blockkoin/rates'],
  });

  const { data: recentDonationsData } = useQuery<any>({
    queryKey: ['/api/donations/recent'],
  });


  const formatCurrency = (cents: number | undefined) => {
    if (typeof cents !== 'number') return 'R 0.00';
    return `R ${(cents / 100).toFixed(2)}`;
  };

  const totalBalance = (tagsData?.tags || []).reduce((acc: number, t: any) => acc + (t.balanceZAR || 0), 0);

  // Safely compute USDT rate (stored as cents) and avoid accidental NaN when dividing
  const usdtRateCents = (ratesData && ratesData.length > 0)
    ? (ratesData.find((r: any) => r.from === 'USDT')?.rate ?? 1850)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and quick navigation</p>
        </div>

        <Card className="mb-8 border-primary/20 bg-primary/5" data-testid="card-info">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="font-semibold text-foreground mb-2">Phase 1 Demo Information</p>
                <p className="text-sm text-muted-foreground">
                  This minimal Phase-1 demo uses in-memory data and does not persist or call any external APIs.
                  All balances and transactions reset when the server restarts.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Wallet Balances</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Card data-testid="card-total-balance" className="border-primary/10">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Total Tag Balance</CardTitle>
                      <CardDescription className="text-sm">Sum of all tag wallets (ZAR)</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{formatCurrency(totalBalance)}</div>
                  {usdtRateCents !== null && (
                    <div className="text-sm text-muted-foreground mt-2">
                      1 USDT ≈ R {(usdtRateCents / 100).toFixed(2)}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card data-testid="card-tags-count">
                <CardHeader>
                  <CardTitle className="text-lg">Tags</CardTitle>
                  <CardDescription className="text-sm">Total tags available</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{(tagsData?.tags || []).length}</div>
                </CardContent>
              </Card>

              <Card data-testid="card-recent-donations-count">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Donations</CardTitle>
                  <CardDescription className="text-sm">Last donation feed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{(recentDonationsData?.donations || []).length}</div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Quick Actions</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/tag/CT001">
                <Card className="hover-elevate cursor-pointer transition-all" data-testid="card-donor-link">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Tag className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Test Donation</CardTitle>
                        <CardDescription>Donate to Tag CT001</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Open the donor portal to donate R100.00 (10,000 cents) to Tag CT001
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/merchant">
                <Card className="hover-elevate cursor-pointer transition-all" data-testid="card-merchant-link">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Merchant Operations</CardTitle>
                        <CardDescription>Manage merchant funds</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Go to the Community Commerce Portal to redeem, transfer, or withdraw funds
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/organization">
                <Card className="hover-elevate cursor-pointer transition-all" data-testid="card-organization-link">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Organization Portal</CardTitle>
                        <CardDescription>Manage tag issuance</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      View organizational tree and issue new tags to beneficiaries
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Available Tags</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {tagsLoading ? (
                <div className="text-sm text-muted-foreground">Loading tags...</div>
              ) : (tagsData?.tags?.length ? (
                (tagsData.tags as any[]).map((t: any) => (
                  <Link key={t.tagCode} href={`/tag/${t.tagCode}`}>
                    <Card className="hover-elevate cursor-pointer transition-all" data-testid={`card-tag-${t.tagCode}`}>
                      <CardHeader>
                        <CardTitle className="text-base">Tag {t.tagCode}</CardTitle>
                        <CardDescription className="text-sm">Wallet: {t.walletId}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">View and donate</div>
                          <div className="font-semibold text-primary">{formatCurrency(t.balanceZAR)}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="text-sm text-muted-foreground italic">No tags available</div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Merchants</h2>
            <div className="space-y-3">
              <Card data-testid="card-merchant-haven">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Haven Shelter</CardTitle>
                  <CardDescription>Social impact organization</CardDescription>
                </CardHeader>
              </Card>
              <Card data-testid="card-merchant-pnp">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Pick n Pay</CardTitle>
                  <CardDescription>Retail merchant</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Donation History</h2>
            <div className="space-y-2">
              {(recentDonationsData?.donations || []).length === 0 && (
                <div className="text-sm text-muted-foreground">No recent donations</div>
              )}
              {(recentDonationsData?.donations || []).map((d: any) => (
                <Card key={d.id} className="p-2" data-testid={`donation-${d.id}`}>
                  <CardContent className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{d.organizationName}</div>
                        <div className="text-xs text-muted-foreground">{d.timestamp ? new Date(d.timestamp).toLocaleString() : ''}</div>
                      </div>
                    </div>
                    <div className="font-semibold text-primary">{formatCurrency(d.amount)}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* User Management Link */}
          <div>
            <Link href="/admin/users">
              <Card className="hover-elevate cursor-pointer transition-all" data-testid="card-user-management-link">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">User Management</CardTitle>
                      <CardDescription>Manage users and their roles</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    View, create, and manage user accounts with role-based filtering
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
