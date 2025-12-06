import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag, Building2, Heart, ShieldCheck, ExternalLink, Users, CheckCircle2, Lock, TrendingUp, Globe, MessageCircle, Bot, Ticket, Trash2, Vote, FileCheck } from "lucide-react";
import type { Organization } from "@shared/schema";
import Leaderboard from "@/components/Leaderboard";

export default function Home() {
  const { data: orgsData } = useQuery<{ organizations: Organization[] }>({
    queryKey: ['/api/organizations/list'],
  });

  const organizations = orgsData?.organizations || [];
  const verifiedOrgs = organizations.filter(org => org.smartContractAddress);

  return (
    <div className="min-h-screen bg-background">
      
      {/* Investor Demo Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center md:text-left">
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                <FileCheck className="w-3 h-3 mr-1" />
                INVESTOR DEMO
              </Badge>
              <p className="text-sm md:text-base font-medium">
                Pre-loaded with demo accounts & transactions. Click here for login credentials →
              </p>
            </div>
            <Link href="/demo-guide">
              <Button variant="secondary" className="gap-2 shadow-lg" data-testid="button-demo-guide">
                <FileCheck className="w-4 h-4" />
                View Demo Guide
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20" data-testid="badge-fsca">
            <ShieldCheck className="w-3 h-3 mr-1" />
            FSCA Regulated • Blockchain Verified
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-foreground">Blockkoin Freedom Tag</h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
            100% Transparent Charitable Giving Powered by Blockchain Smart Contracts
          </p>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Blockchain Verified</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-5 h-5 text-primary" />
              <span>Donor Privacy Protected</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>100% Transparent</span>
            </div>
          </div>
        </div>

        {/* PRIMARY MISSION: Help Someone Right Now */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/30 rounded-2xl p-8 mb-20 max-w-5xl mx-auto shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wide">Quick Street Setup</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">Help Someone Right Now</h2>
              <p className="text-muted-foreground text-base md:text-lg">
                Create a Freedom Tag for someone in need in just 30 seconds. They get a QR code to receive donations instantly.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link href="/quick-tag-setup">
                <Button size="lg" className="gap-2 h-14 px-8 text-lg" data-testid="button-quick-tag-setup">
                  <Users className="w-5 h-5" />
                  Quick Tag Setup
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
          <Link href="/kiosk/beneficiary">
            <Card className="hover-elevate cursor-pointer transition-all h-full border-2 hover:border-primary/50" data-testid="card-tag-holder">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Tag className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">I Have a Freedom Tag</CardTitle>
                <CardDescription className="text-base">
                  Check your balance and PIN
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Access your Freedom Tag wallet
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/merchant">
            <Card className="hover-elevate cursor-pointer transition-all h-full border-2 hover:border-primary/50" data-testid="card-merchant">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Building2 className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">I Am a Merchant</CardTitle>
                <CardDescription className="text-base">
                  Accept and manage payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Redeem, transfer, and withdraw
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/donor">
            <Card className="hover-elevate cursor-pointer transition-all h-full border-2 hover:border-primary/50" data-testid="card-donor">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Heart className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">I Want to Give</CardTitle>
                <CardDescription className="text-base">
                  Make a donation instantly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Support Freedom Tag holders
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Donor Tracking Feature */}
        <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-2 border-blue-500/20 rounded-2xl p-10 mb-20 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold mb-3 text-foreground">Follow Your Donation</h2>
              <p className="text-muted-foreground text-lg">
                Track your donations with complete blockchain transparency. See exactly how your money reached the beneficiary and view smart contract transactions on Etherscan.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link href="/donor/track">
                <Button size="lg" className="gap-2 h-14 px-8 text-lg bg-blue-500 hover:bg-blue-600" data-testid="button-track-donations">
                  <ExternalLink className="w-5 h-5" />
                  Track My Donations
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Smart Contract Verification Section */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20 rounded-2xl p-10 mb-20 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">Verify Smart Contracts</h2>
          </div>
          
          {/* Warning Box */}
          <div className="bg-destructive/10 border-2 border-destructive/30 rounded-xl p-6 mb-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-destructive" />
              <p className="font-bold text-lg text-destructive">
                DON'T GIVE TO ORGANIZATIONS WITHOUT SMART CONTRACTS
              </p>
            </div>
            <p className="text-center text-sm text-muted-foreground mb-3">
              <strong>Without smart contracts:</strong> We don't know who they're giving to. Your money could go anywhere.
            </p>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <p className="text-sm text-primary font-semibold">
                With smart contracts: The world can verify who received your donation. You remain anonymous, but charity actions are transparent.
              </p>
            </div>
          </div>
          
          <p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
            These organizations operate with 100% blockchain transparency. Every donation and fund movement is recorded on-chain.
          </p>

          <div className="flex justify-center mb-8">
            <Link href="/verified-charities">
              <Button size="lg" className="gap-2" data-testid="button-check-charities">
                <ShieldCheck className="w-5 h-5" />
                View All Verified Charities
              </Button>
            </Link>
          </div>

          {verifiedOrgs.length > 0 && (
            <div className="bg-background/50 rounded-xl p-6 border border-primary/10">
              <h3 className="font-semibold text-lg mb-6 text-center text-foreground">
                Currently Verified: {verifiedOrgs.length} {verifiedOrgs.length === 1 ? 'Charity' : 'Charities'}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {verifiedOrgs.slice(0, 4).map((org) => (
                  <div key={org.id} className="bg-background rounded-lg p-4 border border-primary/10 space-y-3">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground">{org.name}</div>
                        <div className="text-xs text-muted-foreground">{org.type}</div>
                        {org.charityRegistrationNumber && (
                          <div className="flex items-center gap-1 mt-1.5 text-xs">
                            <FileCheck className="w-3 h-3 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">Registered:</span>
                            <span className="font-mono text-primary font-semibold">
                              {org.charityRegistrationNumber}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="font-mono text-xs text-muted-foreground break-all bg-muted/30 rounded p-2">
                      {org.smartContractAddress}
                    </div>
                    <a 
                      href={`https://etherscan.io/address/${org.smartContractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button variant="outline" size="sm" className="w-full gap-2" data-testid={`button-view-contract-${org.id}`}>
                        <ExternalLink className="w-3 h-3" />
                        View Smart Contract
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Leaderboards Section */}
        <div className="mb-20 max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Donation Leaderboards</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See where donations are making the biggest impact. Only smart contract verified organizations are shown.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Leaderboard
              type="organizations"
              title="Top Organizations"
              description="Verified charities by total donations received"
              limit={5}
            />
            <Leaderboard
              type="tags"
              title="Top Beneficiaries"
              description="Freedom Tags receiving the most support"
              limit={5}
            />
          </div>
        </div>

        {/* Dusty Bin Section */}
        <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-2 border-orange-500/20 rounded-2xl p-10 mb-20 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <Trash2 className="w-8 h-8 text-orange-500" />
            <h2 className="text-3xl font-bold text-foreground">Send Your Crypto Dust to Dusty Bin</h2>
          </div>
          
          <p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto text-lg">
            Got leftover crypto pocket change? Donate your dust to world disaster relief! 
            At month's end, vote which verified smart contract charity receives the collective funds.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-6">
            <Link href="/donor">
              <Button size="lg" className="gap-2 bg-orange-500 hover:bg-orange-600 text-white" data-testid="button-donate-dust">
                <Trash2 className="w-5 h-5" />
                Donate Your Dust
              </Button>
            </Link>
            
            <Link href="/dusty-bin/vote">
              <Button size="lg" variant="outline" className="gap-2 border-orange-500/50" data-testid="button-vote-disasters">
                <Vote className="w-5 h-5" />
                Vote for Disaster Relief
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Globe className="w-4 h-4" />
              <span>Support world disaster relief • Community votes decide • Smart contract verified only</span>
            </div>
          </div>
        </div>

        {/* WhatsApp Business API Demo Section */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-500/20 rounded-2xl p-10 mb-20 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <MessageCircle className="w-8 h-8 text-green-500" />
            <h2 className="text-3xl font-bold text-foreground">WhatsApp Business API Demo</h2>
          </div>
          
          <p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto text-lg">
            Interactive WhatsApp demo featuring AI chatbot, support ticketing, and CRM for donor engagement at scale.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-background/50 rounded-lg p-6 text-center border border-green-500/10">
              <Bot className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">AI Chatbot</h3>
              <p className="text-sm text-muted-foreground">Automated donor assistance</p>
            </div>
            <div className="bg-background/50 rounded-lg p-6 text-center border border-green-500/10">
              <Ticket className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Ticketing System</h3>
              <p className="text-sm text-muted-foreground">Support case management</p>
            </div>
            <div className="bg-background/50 rounded-lg p-6 text-center border border-green-500/10">
              <Users className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">CRM Dashboard</h3>
              <p className="text-sm text-muted-foreground">Contact organization</p>
            </div>
          </div>

          <div className="flex justify-center">
            <Link href="/whatsapp-demo">
              <Button size="lg" className="gap-2" data-testid="button-whatsapp-demo">
                <MessageCircle className="w-5 h-5" />
                Try WhatsApp Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Organization Signup Section */}
        <div className="bg-gradient-to-r from-background to-primary/5 border border-primary/10 rounded-xl p-10 mb-20 max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Join the Transparent Giving Revolution</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Organizations with smart contracts build maximum donor trust through blockchain transparency.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div className="flex flex-wrap gap-4">
              <Link href="/charity/signup">
                <Button size="lg" className="gap-2" data-testid="button-join-with-contract">
                  <ShieldCheck className="w-5 h-5" />
                  Join with Smart Contract (Verified)
                </Button>
              </Link>

              <Link href="/charity/signup?basic=true">
                <Button size="lg" variant="outline" className="gap-2" data-testid="button-join-basic">
                  <Building2 className="w-5 h-5" />
                  Join as Traditional Charity
                </Button>
              </Link>
            </div>

            {/* LoginSelector removed from here - moved to Header */}
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="w-4 h-4" />
              <span>Smart contract charities display verified badges and public blockchain transaction history</span>
            </div>
          </div>
        </div>

        {/* Trust Footer Section */}
        <div className="pt-16 border-t">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold mb-4 text-foreground">Built on Trust & Transparency</h3>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Every donation is tracked on the blockchain. Charities with smart contracts provide complete transparency, 
              while donors maintain their privacy. It's the future of accountable giving.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="text-center p-6 rounded-xl bg-muted/30 border border-primary/10">
              <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold mb-2 text-lg">FSCA Regulated</h4>
              <p className="text-sm text-muted-foreground">
                Blockkoin is a regulated financial services provider ensuring your donations are secure
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-muted/30 border border-primary/10">
              <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold mb-2 text-lg">Fireblocks Secured</h4>
              <p className="text-sm text-muted-foreground">
                Enterprise-grade blockchain security protecting every transaction
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-muted/30 border border-primary/10">
              <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold mb-2 text-lg">100% Transparent</h4>
              <p className="text-sm text-muted-foreground">
                All smart contract charities publish their transactions on-chain for public verification
              </p>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground pb-8">
            <p>Powered by Fireblocks Blockchain • Verified Smart Contracts • FSCA Regulated</p>
          </div>
        </div>
      </div>
    </div>
  );
}
