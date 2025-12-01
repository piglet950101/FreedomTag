import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Tag, Building2, Info, Users } from "lucide-react";

export default function Admin() {
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
              {['CT001', 'CT002', 'CT003'].map((tag) => (
                <Link key={tag} href={`/tag/${tag}`}>
                  <Card className="hover-elevate cursor-pointer transition-all" data-testid={`card-tag-${tag}`}>
                    <CardHeader>
                      <CardTitle className="text-base">Tag {tag}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">View and donate</p>
                    </CardContent>
                  </Card>
                </Link>
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
        </div>
      </div>
    </div>
  );
}
