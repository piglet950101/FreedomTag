import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Store, Wallet, ArrowRight, Shield, Users, QrCode, HandHeart } from "lucide-react";

export default function WelcomePage() {
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);

  const roles = [
    {
      id: "beneficiary",
      title: "I Have a Freedom Tag",
      description: "Access your wallet and view donations",
      icon: Heart,
      color: "from-red-500/20 to-pink-500/20",
      features: ["View balance", "Track donations", "Use at merchants"],
    },
    {
      id: "merchant",
      title: "Become a Community Commerce Partner",
      description: "Accept Freedom Tags and empower your community through inclusive payments",
      icon: Store,
      color: "from-blue-500/20 to-cyan-500/20",
      features: ["Accept tags", "Manage outlets", "Track transactions"],
    },
    {
      id: "philanthropist",
      title: "I Want to Give",
      description: "Make a difference through direct giving",
      icon: Wallet,
      color: "from-green-500/20 to-emerald-500/20",
      features: ["Donate securely", "Support causes", "Track impact"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Powered by Blockkoin</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Welcome to Blockkoin Freedom Tag
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            Support people in need through direct donations. Create tags in seconds, donate instantly.
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>Join thousands making a difference</span>
          </div>
        </div>

        {/* Quick Actions - Donate or Setup */}
        <div className="max-w-5xl mx-auto mb-16 grid md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 hover-elevate" data-testid="card-donate-now">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <HandHeart className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Donate Now</CardTitle>
              <CardDescription className="text-base">
                Have a tag code? Make a donation in seconds - no account needed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/donor">
                <Button size="lg" className="w-full gap-2" data-testid="button-donate-now">
                  <Heart className="w-5 h-5" />
                  Make a Donation
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 hover-elevate" data-testid="card-quick-setup">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Help Someone Right Now</CardTitle>
              <CardDescription className="text-base">
                Create a Freedom Tag for someone in need in just 30 seconds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/quick-tag-setup">
                <Button size="lg" className="w-full gap-2" data-testid="button-quick-setup-welcome">
                  <QrCode className="w-5 h-5" />
                  Quick Tag Setup
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Role Selection Cards */}
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-center mb-8">How do you want to participate?</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((role) => {
              const Icon = role.icon;
              const isHovered = hoveredRole === role.id;
              
              return (
                <Card 
                  key={role.id}
                  className={`relative overflow-hidden transition-all duration-300 hover-elevate ${isHovered ? 'ring-2 ring-primary' : ''}`}
                  onMouseEnter={() => setHoveredRole(role.id)}
                  onMouseLeave={() => setHoveredRole(null)}
                  data-testid={`card-role-${role.id}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : ''}`} />
                  
                  <CardHeader className="relative">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{role.title}</CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="relative">
                    <ul className="space-y-2 mb-6">
                      {role.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <Link href={`/signup?role=${role.id}`}>
                      <Button className="w-full gap-2" data-testid={`button-signup-${role.id}`}>
                        Get Started
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Login CTA */}
        <Card className="max-w-2xl mx-auto bg-card/50 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <p className="text-lg mb-4">Already have an account?</p>
            <Link href="/login">
              <Button variant="outline" size="lg" className="gap-2" data-testid="button-login">
                Sign In
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Feature Highlights */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Secure & Trusted</h3>
            <p className="text-sm text-muted-foreground">Bank-grade security with biometric authentication</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Multiple Roles</h3>
            <p className="text-sm text-muted-foreground">Be a giver and receiver on one platform</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Real Impact</h3>
            <p className="text-sm text-muted-foreground">See exactly how your contributions help</p>
          </div>
        </div>
      </div>
    </div>
  );
}
