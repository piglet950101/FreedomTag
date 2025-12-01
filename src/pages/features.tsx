import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Heart,
  Tag,
  Building2,
  ShieldCheck,
  Zap,
  Users,
  Vote,
  MessageCircle,
  Search,
  Repeat,
  Trash2,
  TrendingUp,
  DollarSign,
  CreditCard,
  Wallet,
  FileText,
  Globe,
  ChevronRight
} from "lucide-react";
import Header from "@/components/Header";

const features = [
  {
    category: "Donation Features",
    icon: Heart,
    color: "text-primary",
    items: [
      {
        title: "Donor Portal",
        description: "Make secure donations to blockchain-verified charities with complete transparency",
        link: "/donor",
        icon: Heart,
        testId: "feature-donor-portal"
      },
      {
        title: "Quick Donate",
        description: "Instant QR code donations - scan and give in seconds",
        link: "/quick-donate",
        icon: Zap,
        testId: "feature-quick-donate"
      },
      {
        title: "Recurring Crypto Donations",
        description: "Set up automated monthly cryptocurrency donations with USD-pegged amounts",
        link: "/recurring-donations",
        icon: Repeat,
        testId: "feature-recurring"
      },
      {
        title: "Track My Donations",
        description: "Follow your donation on blockchain from your wallet to beneficiary - complete transparency",
        link: "/donor/track",
        icon: Search,
        testId: "feature-track"
      },
      {
        title: "Kiosk Donation Mode",
        description: "Public kiosk interface for walk-up donations at events and locations",
        link: "/kiosk-home",
        icon: DollarSign,
        testId: "feature-kiosk"
      }
    ]
  },
  {
    category: "Freedom Tag (Beneficiary)",
    icon: Tag,
    color: "text-green-600",
    items: [
      {
        title: "Quick Tag Setup (30 sec)",
        description: "PRIMARY MISSION: Create Freedom Tag instantly for people on the street",
        link: "/quick-tag-setup",
        icon: Zap,
        badge: "PRIMARY",
        testId: "feature-quick-tag"
      },
      {
        title: "Beneficiary Login",
        description: "Access your Freedom Tag wallet with PIN or biometric authentication",
        link: "/beneficiary/login",
        icon: Users,
        testId: "feature-beneficiary-login"
      },
      {
        title: "Beneficiary Dashboard",
        description: "View your balance, transaction history, and manage your Freedom Tag",
        link: "/beneficiary/dashboard",
        icon: Wallet,
        testId: "feature-beneficiary-dashboard"
      },
      {
        title: "Agent Tag Setup",
        description: "Charity agents can onboard beneficiaries with biometric KYC verification",
        link: "/agent-tag-setup",
        icon: Building2,
        testId: "feature-agent-tag"
      },
      {
        title: "Tag QR Code",
        description: "Generate QR codes for receiving donations to your Freedom Tag",
        link: "/tag-qr",
        icon: Tag,
        testId: "feature-tag-qr"
      }
    ]
  },
  {
    category: "Charity & Organization",
    icon: Building2,
    color: "text-blue-600",
    items: [
      {
        title: "Become a Verified Cause Partner",
        description: "Partner with us to unlock transparent giving, instant settlement, and donor trust",
        link: "/charity/signup",
        icon: Building2,
        testId: "feature-charity-signup"
      },
      {
        title: "Verified Charities",
        description: "Browse all blockchain-verified organizations with smart contracts",
        link: "/verified-charities",
        icon: ShieldCheck,
        testId: "feature-verified"
      },
      {
        title: "Organization Portal",
        description: "Manage your charity account, view donations, and update information",
        link: "/organization-portal",
        icon: Building2,
        testId: "feature-org-portal"
      },
      {
        title: "Charity Credibility",
        description: "View credibility score, registration numbers, and trust indicators",
        link: "/charity/credibility",
        icon: TrendingUp,
        testId: "feature-credibility"
      }
    ]
  },
  {
    category: "Platform Features",
    icon: Globe,
    color: "text-purple-600",
    items: [
      {
        title: "Dusty Bin Voting",
        description: "Community-voted disaster relief - donate crypto dust and vote on campaigns",
        link: "/dusty-bin/vote",
        icon: Vote,
        testId: "feature-dusty-bin"
      },
      {
        title: "Thank You Stories",
        description: "Read gratitude messages from beneficiaries who received donations",
        link: "/stories",
        icon: Heart,
        testId: "feature-stories"
      },
      {
        title: "WhatsApp Business Demo",
        description: "AI chatbot, ticketing system, and CRM for donor engagement",
        link: "/whatsapp-demo",
        icon: MessageCircle,
        testId: "feature-whatsapp"
      },
      {
        title: "Donation Leaderboards",
        description: "Real-time rankings of top organizations, beneficiaries, and philanthropists",
        link: "/",
        icon: TrendingUp,
        testId: "feature-leaderboards",
        scrollTo: "leaderboards"
      }
    ]
  },
  {
    category: "Philanthropist Features",
    icon: Users,
    color: "text-orange-600",
    items: [
      {
        title: "Philanthropist Signup",
        description: "Register as a major donor with dedicated account features",
        link: "/philanthropist/signup",
        icon: Users,
        testId: "feature-philanthropist-signup"
      },
      {
        title: "Philanthropist Dashboard",
        description: "Manage your giving portfolio and track impact",
        link: "/philanthropist/dashboard",
        icon: Wallet,
        testId: "feature-philanthropist-dashboard"
      },
      {
        title: "Fund Wallet",
        description: "Add funds to your philanthropist account",
        link: "/philanthropist/fund",
        icon: DollarSign,
        testId: "feature-philanthropist-fund"
      },
      {
        title: "Give to Tags",
        description: "Directly support Freedom Tag beneficiaries",
        link: "/philanthropist/give",
        icon: Heart,
        testId: "feature-philanthropist-give"
      }
    ]
  },
  {
    category: "Payment Methods",
    icon: CreditCard,
    color: "text-teal-600",
    items: [
      {
        title: "Crypto Payment",
        description: "Pay with cryptocurrency - automatic conversion to preferred fiat",
        link: "/crypto-payment",
        icon: DollarSign,
        testId: "feature-crypto-payment"
      },
      {
        title: "Bank Payment",
        description: "Traditional bank transfer payment method",
        link: "/bank-payment",
        icon: CreditCard,
        testId: "feature-bank-payment"
      },
      {
        title: "Crypto Demo",
        description: "Demo mode for testing cryptocurrency transactions",
        link: "/crypto-demo",
        icon: Zap,
        testId: "feature-crypto-demo"
      }
    ]
  },
  {
    category: "Trust & Transparency",
    icon: ShieldCheck,
    color: "text-primary",
    items: [
      {
        title: "Blockchain Verification",
        description: "Every transaction verified on-chain with Fireblocks smart contracts",
        link: "/",
        icon: ShieldCheck,
        testId: "feature-blockchain",
        scrollTo: "trust"
      },
      {
        title: "Donation Terms",
        description: "View platform terms, stewardship policy, and no-refunds policy",
        link: "/terms",
        icon: FileText,
        testId: "feature-terms"
      },
      {
        title: "Charity Registration Numbers",
        description: "All organizations display government charity registration for credibility",
        link: "/verified-charities",
        icon: Building2,
        testId: "feature-reg-numbers"
      }
    ]
  }
];

export default function Features() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20" data-testid="badge-platform">
            <ShieldCheck className="w-3 h-3 mr-1" />
            All Platform Features
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Platform Features & Sitemap
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore all features of the Blockkoin Freedom Tag platform - from instant tag creation to blockchain-verified donations
          </p>
        </div>

        {/* Features Grid */}
        <div className="space-y-12">
          {features.map((section) => {
            const CategoryIcon = section.icon;
            return (
              <div key={section.category} className="space-y-4">
                <div className="flex items-center gap-3">
                  <CategoryIcon className={`w-6 h-6 ${section.color}`} />
                  <h2 className="text-2xl font-bold text-foreground">{section.category}</h2>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.items.map((feature) => {
                    const FeatureIcon = feature.icon;
                    return (
                      <Link key={feature.link} href={feature.link}>
                        <Card className="h-full hover-elevate cursor-pointer transition-all" data-testid={feature.testId}>
                          <CardHeader>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <FeatureIcon className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                                </div>
                              </div>
                              {'badge' in feature && feature.badge && (
                                <Badge variant="default" className="text-xs">
                                  {feature.badge}
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="mt-2">
                              {feature.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex items-center gap-2 text-sm text-primary font-medium">
                              <span>Visit Feature</span>
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Access */}
        <div className="mt-16 border-t pt-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Quick Access</h2>
            <p className="text-muted-foreground">Most popular features</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <Link href="/quick-tag-setup">
              <Button className="w-full h-auto flex-col gap-2 py-4" data-testid="quick-tag-setup">
                <Zap className="w-6 h-6" />
                <span className="font-semibold">Quick Tag Setup</span>
                <span className="text-xs opacity-90">30 seconds</span>
              </Button>
            </Link>
            
            <Link href="/donor">
              <Button className="w-full h-auto flex-col gap-2 py-4" variant="outline" data-testid="quick-donate-button">
                <Heart className="w-6 h-6" />
                <span className="font-semibold">Donate Now</span>
                <span className="text-xs opacity-90">Blockchain Verified</span>
              </Button>
            </Link>
            
            <Link href="/verified-charities">
              <Button className="w-full h-auto flex-col gap-2 py-4" variant="outline" data-testid="quick-verified">
                <ShieldCheck className="w-6 h-6" />
                <span className="font-semibold">Verified Charities</span>
                <span className="text-xs opacity-90">Smart Contracts</span>
              </Button>
            </Link>
            
            <Link href="/donor/track">
              <Button className="w-full h-auto flex-col gap-2 py-4" variant="outline" data-testid="quick-track">
                <Search className="w-6 h-6" />
                <span className="font-semibold">Track Donations</span>
                <span className="text-xs opacity-90">Full Transparency</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center bg-primary/5 rounded-2xl p-12 border border-primary/10">
          <h3 className="text-2xl font-bold mb-4 text-foreground">Ready to Get Started?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of donors and beneficiaries making a difference through blockchain-verified charitable giving
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/donor">
              <Button size="lg" className="gap-2" data-testid="cta-donate">
                <Heart className="w-5 h-5" />
                Start Donating
              </Button>
            </Link>
            <Link href="/charity/signup">
              <Button size="lg" variant="outline" className="gap-2" data-testid="cta-join">
                <Building2 className="w-5 h-5" />
                Become a Verified Cause Partner
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
