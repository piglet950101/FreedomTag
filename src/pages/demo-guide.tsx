import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  Heart,
  Tag,
  Wallet,
  Store,
  Building2,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Shield,
  TrendingUp,
  Copy,
  ExternalLink,
  Users,
  Zap
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function DemoGuide() {
  const { toast } = useToast();
  const [copiedText, setCopiedText] = useState<string>("");

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
    setTimeout(() => setCopiedText(""), 2000);
  };

  const demoScenarios = [
    {
      id: "quick-tag",
      title: "PRIMARY MISSION: Quick Tag Setup",
      description: "Create a Freedom Tag for someone in need in just 30 seconds",
      icon: Zap,
      color: "text-primary",
      bgColor: "bg-primary/10",
      steps: [
        "Go to Quick Tag Setup",
        "Enter beneficiary name and basic info",
        "Tag code and QR generated instantly",
        "Share QR for immediate donations"
      ],
      link: "/quick-tag-setup",
      badge: "30 seconds",
      testId: "scenario-quick-tag"
    },
    {
      id: "donation",
      title: "Crypto Donation Flow",
      description: "Experience seamless crypto donations with blockchain tracking",
      icon: Heart,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      steps: [
        "Login as philanthropist (demo.donor@freedomtag.org)",
        "Select a Freedom Tag or charity",
        "Donate with crypto (USDT recommended)",
        "Track donation on blockchain"
      ],
      link: "/philanthropist",
      badge: "Real blockchain",
      testId: "scenario-donation"
    },
    {
      id: "dashboard",
      title: "Beneficiary Dashboard",
      description: "View balance, transactions, and buy/sell crypto",
      icon: Tag,
      color: "text-green-600",
      bgColor: "bg-green-600/10",
      steps: [
        "Login with Tag: DEMO001, PIN: 123456",
        "View balance and transaction history",
        "Buy/sell crypto instantly (USDT)",
        "Manage recurring donations"
      ],
      link: "/tag/login",
      badge: "Verified KYC",
      testId: "scenario-dashboard"
    },
    {
      id: "tracking",
      title: "Blockchain Tracking",
      description: "Follow donations from wallet to beneficiary with full transparency",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-600/10",
      steps: [
        "Use any donor email or tag code",
        "See complete donation flow",
        "Click blockchain transaction links",
        "Verify on Etherscan/Polygonscan"
      ],
      link: "/donor/track",
      badge: "100% transparent",
      testId: "scenario-tracking"
    }
  ];

  const philanthropists = [
    {
      name: "Sarah van der Merwe",
      email: "demo.donor@freedomtag.org",
      password: "demo1234",
      balance: "R498,800",
      description: "Tech entrepreneur with active donations",
      testId: "phil-sarah"
    },
    {
      name: "Michael Chen",
      email: "crypto.phil@freedomtag.org",
      password: "demo1234",
      balance: "R997,250",
      description: "Crypto investor with recurring donations",
      testId: "phil-michael"
    }
  ];

  const tags = [
    {
      code: "DEMO001",
      pin: "123456",
      name: "Thabo Molefe",
      status: "Verified",
      balance: "R5,800",
      description: "Homeless beneficiary with KYC verified",
      testId: "tag-demo001"
    },
    {
      code: "DEMO002",
      pin: "234567",
      name: "Lindiwe Khumalo",
      status: "Pending",
      balance: "R12,500",
      description: "Student with active donations",
      testId: "tag-demo002"
    }
  ];

  const charities = [
    {
      name: "SANCOB",
      email: "contact@sancob.org",
      password: "demo1234",
      status: "Verified",
      contract: "Polygon",
      description: "Wildlife conservation with smart contract",
      testId: "charity-sancob"
    },
    {
      name: "Breadline Africa",
      email: "info@breadlineafrica.org",
      password: "demo1234",
      status: "Verified",
      contract: "Ethereum",
      description: "Food security with USDT payouts",
      testId: "charity-breadline"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Rocket className="w-10 h-10" />
                <h1 className="text-4xl font-bold">Investor Demo Guide</h1>
              </div>
              <p className="text-xl text-primary-foreground/90 max-w-2xl">
                Welcome! This platform is pre-loaded with realistic demo data. Use the credentials below to explore all features.
              </p>
            </div>
            <Link href="/">
              <Button variant="outline" className="gap-2" data-testid="button-home">
                <ExternalLink className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Key Demo Scenarios */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-bold">Key Demo Scenarios</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {demoScenarios.map((scenario) => {
              const Icon = scenario.icon;
              return (
                <Card key={scenario.id} className="hover-elevate" data-testid={scenario.testId}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className={`w-12 h-12 rounded-lg ${scenario.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${scenario.color}`} />
                      </div>
                      <Badge variant="secondary">{scenario.badge}</Badge>
                    </div>
                    <CardTitle>{scenario.title}</CardTitle>
                    <CardDescription>{scenario.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {scenario.steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                    <Link href={scenario.link}>
                      <Button className="w-full gap-2" data-testid={`button-${scenario.id}`}>
                        Try This Flow
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="space-y-8">
          {/* Philanthropists */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Philanthropist Accounts</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {philanthropists.map((phil) => (
                <Card key={phil.email} data-testid={phil.testId}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{phil.name}</CardTitle>
                        <CardDescription>{phil.description}</CardDescription>
                      </div>
                      <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">{phil.balance}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-mono">{phil.email}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(phil.email, "Email")}
                        data-testid={`copy-email-${phil.testId}`}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <div>
                        <p className="text-xs text-muted-foreground">Password</p>
                        <p className="text-sm font-mono">{phil.password}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(phil.password, "Password")}
                        data-testid={`copy-password-${phil.testId}`}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Freedom Tags */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Tag className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Freedom Tag Accounts</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {tags.map((tag) => (
                <Card key={tag.code} data-testid={tag.testId}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {tag.name}
                          {tag.status === "Verified" && (
                            <Shield className="w-4 h-4 text-primary" />
                          )}
                        </CardTitle>
                        <CardDescription>{tag.description}</CardDescription>
                      </div>
                      <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">{tag.balance}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <div>
                        <p className="text-xs text-muted-foreground">Tag Code</p>
                        <p className="text-sm font-mono font-bold">{tag.code}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(tag.code, "Tag Code")}
                        data-testid={`copy-tag-${tag.testId}`}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <div>
                        <p className="text-xs text-muted-foreground">PIN</p>
                        <p className="text-sm font-mono">{tag.pin}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(tag.pin, "PIN")}
                        data-testid={`copy-pin-${tag.testId}`}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Charities */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Verified Cause Partners</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {charities.map((charity) => (
                <Card key={charity.email} data-testid={charity.testId}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {charity.name}
                          <Shield className="w-4 h-4 text-primary" />
                        </CardTitle>
                        <CardDescription>{charity.description}</CardDescription>
                      </div>
                      <Badge variant="outline">{charity.contract}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-mono">{charity.email}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(charity.email, "Email")}
                        data-testid={`copy-charity-email-${charity.testId}`}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <div>
                        <p className="text-xs text-muted-foreground">Password</p>
                        <p className="text-sm font-mono">{charity.password}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(charity.password, "Password")}
                        data-testid={`copy-charity-password-${charity.testId}`}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold">Quick Access</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/quick-tag-setup">
              <Button className="w-full gap-2" variant="outline" data-testid="quick-tag-setup">
                <Zap className="w-4 h-4" />
                Quick Tag
              </Button>
            </Link>
            <Link href="/philanthropist">
              <Button className="w-full gap-2" variant="outline" data-testid="quick-donate">
                <Heart className="w-4 h-4" />
                Donate
              </Button>
            </Link>
            <Link href="/donor/track">
              <Button className="w-full gap-2" variant="outline" data-testid="quick-track">
                <TrendingUp className="w-4 h-4" />
                Track
              </Button>
            </Link>
            <Link href="/verified-charities">
              <Button className="w-full gap-2" variant="outline" data-testid="quick-verified-charities">
                <Building2 className="w-4 h-4" />
                Verified Charities
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
