import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  ShieldCheck, 
  Heart, 
  Building2, 
  Home, 
  Menu,
  Tag,
  Users,
  Zap,
  Vote,
  TrendingUp,
  MessageCircle,
  Search,
  DollarSign,
  Repeat,
  Trash2,
  Globe
} from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer hover-elevate rounded-lg px-3 py-2 -mx-3" data-testid="link-home">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-primary" />
                <div className="flex flex-col">
                  <span className="font-bold text-lg leading-none">Blockkoin Freedom Tag</span>
                  <span className="text-xs text-muted-foreground leading-none">Blockchain Transparent Giving</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Home Button */}
            <Link href="/">
              <Button variant="ghost" className="gap-2" data-testid="nav-home">
                <Home className="w-4 h-4" />
                Home
              </Button>
            </Link>

            {/* Donate Menu */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger data-testid="nav-donate-menu">
                    <Heart className="w-4 h-4 mr-2" />
                    Donate
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[400px] p-4">
                      <div className="grid gap-3">
                        <Link href="/donor">
                          <NavigationMenuLink asChild>
                            <div className="block select-none space-y-1 rounded-md p-3 hover-elevate cursor-pointer" data-testid="link-donor-portal">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <Heart className="w-4 h-4" />
                                Donor Portal
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Make a donation to verified charities
                              </p>
                            </div>
                          </NavigationMenuLink>
                        </Link>
                        <Link href="/quick-donate/CH456634">
                          <NavigationMenuLink asChild>
                            <div className="block select-none space-y-1 rounded-md p-3 hover-elevate cursor-pointer" data-testid="link-quick-donate">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <Zap className="w-4 h-4" />
                                Quick Donate
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Instant QR code donation
                              </p>
                            </div>
                          </NavigationMenuLink>
                        </Link>
                        <Link href="/philanthropist/recurring">
                          <NavigationMenuLink asChild>
                            <div className="block select-none space-y-1 rounded-md p-3 hover-elevate cursor-pointer" data-testid="link-recurring">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <Repeat className="w-4 h-4" />
                                Recurring Donations
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Set up monthly crypto donations
                              </p>
                            </div>
                          </NavigationMenuLink>
                        </Link>
                        <Link href="/donor/track">
                          <NavigationMenuLink asChild>
                            <div className="block select-none space-y-1 rounded-md p-3 hover-elevate cursor-pointer" data-testid="link-track-donation">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <Search className="w-4 h-4" />
                                Track My Donations
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Follow your donation on blockchain
                              </p>
                            </div>
                          </NavigationMenuLink>
                        </Link>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Beneficiary Menu */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger data-testid="nav-beneficiary-menu">
                    <Tag className="w-4 h-4 mr-2" />
                    Freedom Tag
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[400px] p-4">
                      <div className="grid gap-3">
                        <Link href="/quick-tag-setup">
                          <NavigationMenuLink asChild>
                            <div className="block select-none space-y-1 rounded-md p-3 hover-elevate cursor-pointer" data-testid="link-quick-tag">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <Zap className="w-4 h-4" />
                                Quick Tag Setup (30 sec)
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Create Freedom Tag instantly
                              </p>
                            </div>
                          </NavigationMenuLink>
                        </Link>
                        <Link href="/beneficiary">
                          <NavigationMenuLink asChild>
                            <div className="block select-none space-y-1 rounded-md p-3 hover-elevate cursor-pointer" data-testid="link-beneficiary-login">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <Users className="w-4 h-4" />
                                Beneficiary Login
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Access your Freedom Tag wallet
                              </p>
                            </div>
                          </NavigationMenuLink>
                        </Link>
                        <Link href="/agent-tag-setup">
                          <NavigationMenuLink asChild>
                            <div className="block select-none space-y-1 rounded-md p-3 hover-elevate cursor-pointer" data-testid="link-agent-setup">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <Building2 className="w-4 h-4" />
                                Agent Tag Setup
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Charity agent onboarding
                              </p>
                            </div>
                          </NavigationMenuLink>
                        </Link>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Platform Menu */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger data-testid="nav-platform-menu">
                    Platform
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[400px] p-4">
                      <div className="grid gap-3">
                        <Link href="/verified-charities">
                          <NavigationMenuLink asChild>
                            <div className="block select-none space-y-1 rounded-md p-3 hover-elevate cursor-pointer" data-testid="link-verified">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <ShieldCheck className="w-4 h-4" />
                                Verified Charities
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Browse blockchain-verified organizations
                              </p>
                            </div>
                          </NavigationMenuLink>
                        </Link>
                        <Link href="/dusty-bin/vote">
                          <NavigationMenuLink asChild>
                            <div className="block select-none space-y-1 rounded-md p-3 hover-elevate cursor-pointer" data-testid="link-dusty-bin">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <Vote className="w-4 h-4" />
                                Dusty Bin Voting
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Community disaster relief voting
                              </p>
                            </div>
                          </NavigationMenuLink>
                        </Link>
                        <Link href="/stories">
                          <NavigationMenuLink asChild>
                            <div className="block select-none space-y-1 rounded-md p-3 hover-elevate cursor-pointer" data-testid="link-stories">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <Heart className="w-4 h-4" />
                                Thank You Stories
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Read gratitude messages from beneficiaries
                              </p>
                            </div>
                          </NavigationMenuLink>
                        </Link>
                        <Link href="/whatsapp-demo">
                          <NavigationMenuLink asChild>
                            <div className="block select-none space-y-1 rounded-md p-3 hover-elevate cursor-pointer" data-testid="link-whatsapp">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <MessageCircle className="w-4 h-4" />
                                WhatsApp Demo
                              </div>
                              <p className="text-sm text-muted-foreground">
                                AI chatbot & CRM system
                              </p>
                            </div>
                          </NavigationMenuLink>
                        </Link>
                        <Link href="/features">
                          <NavigationMenuLink asChild>
                            <div className="block select-none space-y-1 rounded-md p-3 hover-elevate cursor-pointer bg-primary/5 border border-primary/20" data-testid="link-all-features">
                              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                                <Globe className="w-4 h-4" />
                                View All Features
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Complete sitemap & feature guide
                              </p>
                            </div>
                          </NavigationMenuLink>
                        </Link>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Join Button */}
            <Link href="/charity/signup">
              <Button variant="outline" className="gap-2" data-testid="nav-join">
                <Building2 className="w-4 h-4" />
                Become a Verified Cause Partner
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-left">Navigation</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {/* Home */}
                  <Link href="/">
                    <Button variant="ghost" className="w-full justify-start gap-2" data-testid="mobile-home">
                      <Home className="w-4 h-4" />
                      Home
                    </Button>
                  </Link>

                  {/* Donate Section */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground px-2">Donate</p>
                    <Link href="/donor">
                      <Button variant="ghost" className="w-full justify-start gap-2" data-testid="mobile-donor">
                        <Heart className="w-4 h-4" />
                        Donor Portal
                      </Button>
                    </Link>
                    <Link href="/quick-donate/CH456634">
                      <Button variant="ghost" className="w-full justify-start gap-2" data-testid="mobile-quick-donate">
                        <Zap className="w-4 h-4" />
                        Quick Donate
                      </Button>
                    </Link>
                    <Link href="/philanthropist/recurring">
                      <Button variant="ghost" className="w-full justify-start gap-2" data-testid="mobile-recurring">
                        <Repeat className="w-4 h-4" />
                        Recurring Donations
                      </Button>
                    </Link>
                    <Link href="/donor/track">
                      <Button variant="ghost" className="w-full justify-start gap-2" data-testid="mobile-track">
                        <Search className="w-4 h-4" />
                        Track My Donations
                      </Button>
                    </Link>
                  </div>

                  {/* Freedom Tag Section */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground px-2">Freedom Tag</p>
                    <Link href="/quick-tag-setup">
                      <Button variant="ghost" className="w-full justify-start gap-2" data-testid="mobile-quick-tag">
                        <Zap className="w-4 h-4" />
                        Quick Tag Setup
                      </Button>
                    </Link>
                    <Link href="/beneficiary">
                      <Button variant="ghost" className="w-full justify-start gap-2" data-testid="mobile-beneficiary">
                        <Users className="w-4 h-4" />
                        Beneficiary Login
                      </Button>
                    </Link>
                    <Link href="/agent-tag-setup">
                      <Button variant="ghost" className="w-full justify-start gap-2" data-testid="mobile-agent">
                        <Building2 className="w-4 h-4" />
                        Agent Tag Setup
                      </Button>
                    </Link>
                  </div>

                  {/* Platform Section */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground px-2">Platform</p>
                    <Link href="/verified-charities">
                      <Button variant="ghost" className="w-full justify-start gap-2" data-testid="mobile-verified">
                        <ShieldCheck className="w-4 h-4" />
                        Verified Charities
                      </Button>
                    </Link>
                    <Link href="/dusty-bin/vote">
                      <Button variant="ghost" className="w-full justify-start gap-2" data-testid="mobile-dusty-bin">
                        <Vote className="w-4 h-4" />
                        Dusty Bin Voting
                      </Button>
                    </Link>
                    <Link href="/stories">
                      <Button variant="ghost" className="w-full justify-start gap-2" data-testid="mobile-stories">
                        <Heart className="w-4 h-4" />
                        Thank You Stories
                      </Button>
                    </Link>
                    <Link href="/whatsapp-demo">
                      <Button variant="ghost" className="w-full justify-start gap-2" data-testid="mobile-whatsapp">
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp Demo
                      </Button>
                    </Link>
                    <Link href="/features">
                      <Button variant="ghost" className="w-full justify-start gap-2 text-primary" data-testid="mobile-features">
                        <Globe className="w-4 h-4" />
                        All Features
                      </Button>
                    </Link>
                  </div>

                  {/* Join Button */}
                  <Link href="/charity/signup">
                    <Button className="w-full gap-2" data-testid="mobile-join">
                      <Building2 className="w-4 h-4" />
                      Become a Verified Cause Partner
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
