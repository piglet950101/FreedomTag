import { Link } from "wouter";
import { useState } from "react";
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
import { goBackOrHome } from "@/lib/utils";
import LoginSelector from '@/components/LoginSelector';
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { LogOut, LayoutDashboard, UserCircle } from "lucide-react";

// Helper function to decode JWT token payload (without verification)
function decodeJWTPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

export default function Header() {
  // Check if user is logged in for mobile menu
  const getAuthToken = () => localStorage.getItem('authToken');
  const hasToken = !!getAuthToken();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Decode token to determine type
  const token = getAuthToken();
  const tokenPayload = token ? decodeJWTPayload(token) : null;
  const tokenType = tokenPayload?.type; // 'philanthropist', 'user', or undefined

  // Only fetch session data when mobile menu is opened or when there's a token and LoginSelector might have cached it
  // React Query will use cached data from LoginSelector if available, avoiding duplicate requests
  const { data: session } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) return null;
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });
      if (res.status === 401) return null;
      if (!res.ok) return null;
      return res.json();
    },
    enabled: mobileMenuOpen && hasToken && (tokenType === 'user' || !tokenType), // Only if user type or unknown
    retry: false,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  const { data: beneficiarySession } = useQuery({
    queryKey: ["/api/beneficiary/me"],
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) return null;
      const res = await fetch('/api/beneficiary/me', {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });
      if (res.status === 401) return null;
      if (!res.ok) return null;
      return res.json();
    },
    enabled: mobileMenuOpen && hasToken && tokenType === 'beneficiary', // Only if beneficiary type
    retry: false,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  const { data: philanthropistSession } = useQuery({
    queryKey: ["/api/philanthropist/me"],
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) return null;
      const res = await fetch('/api/philanthropist/me', {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });
      if (res.status === 401) return null;
      if (!res.ok) return null;
      return res.json();
    },
    enabled: mobileMenuOpen && hasToken && tokenType === 'philanthropist', // Only if philanthropist type
    retry: false,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // For desktop, rely on LoginSelector's cached data (it will fetch when needed)
  // For mobile, use the queries above which only run when menu is opened
  const isLoggedIn = hasToken && (!!session || !!beneficiarySession || !!philanthropistSession);

  const getMyPageLink = () => {
    if (!session && !beneficiarySession && !philanthropistSession) return '/';
    if (beneficiarySession) return '/beneficiary/dashboard';
    if (philanthropistSession) return '/philanthropist/dashboard';
    if (session) {
      const roles = session.roles || [];
      if (roles.includes('ADMIN')) return '/admin';
      if (roles.includes('PHILANTHROPIST')) return '/philanthropist/dashboard';
      if (roles.includes('ORGANIZATION') && session.organization?.tagCode) {
        return `/charity/credibility/${session.organization.tagCode}`;
      }
      if (roles.includes('BENEFICIARY')) return '/beneficiary/dashboard';
    }
    return '/';
  };

  const getDisplayName = () => {
    if (beneficiarySession?.beneficiaryName) return beneficiarySession.beneficiaryName;
    if (philanthropistSession?.displayName) return philanthropistSession.displayName;
    if (philanthropistSession?.email) return philanthropistSession.email;
    if (session?.user?.fullName) return session.user.fullName;
    if (session?.user?.email) return session.user.email;
    return 'User';
  };

  const handleMobileLogout = async () => {
    try {
      localStorage.removeItem('authToken');
      const token = getAuthToken();
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          credentials: "include",
        });
      } catch (e) {
        // Ignore logout errors
      }
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/beneficiary/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/philanthropist/me"] });
      queryClient.removeQueries({ queryKey: ["/api/auth/me"] });
      queryClient.removeQueries({ queryKey: ["/api/beneficiary/me"] });
      queryClient.removeQueries({ queryKey: ["/api/philanthropist/me"] });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
  };

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
                  <NavigationMenuContent className="md:right-0 md:left-auto">
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
                        <Link href="/quick-donate/">
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
                    <TrendingUp className="w-4 h-4 mr-2" />
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

            {/* Header actions */}
            <div className="flex items-center gap-2 ml-6">
              <LoginSelector />
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-left">Navigation</SheetTitle>
                </SheetHeader>
                <div className="mt-6 mb-6 space-y-4">
                  {/* Back */}
                  <Button variant="ghost" className="w-full justify-start gap-2" data-testid="mobile-back" onClick={goBackOrHome}>
                    Back
                  </Button>
                  {/* Home */}
                  <Link href="/">
                    <Button variant="ghost" className="w-full justify-start gap-2" data-testid="mobile-home">
                      <Home className="w-4 h-4" />
                      Home
                    </Button>
                  </Link>

                  {/* Login Selector Section */}
                  {isLoggedIn ? (
                    <div className="space-y-2 border-t pt-4">
                      <p className="text-sm font-semibold text-muted-foreground px-2">Account</p>
                      <Link href={getMyPageLink()}>
                        <Button variant="ghost" className="w-full justify-start gap-2" data-testid="mobile-my-page">
                          <LayoutDashboard className="w-4 h-4" />
                          My Page
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-2 text-destructive" 
                        data-testid="mobile-logout"
                        onClick={handleMobileLogout}
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </Button>
                      <div className="px-2 py-1 text-xs text-muted-foreground">
                        Logged in as: {getDisplayName()}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 border-t pt-4">
                      <p className="text-sm font-semibold text-muted-foreground px-2">Login</p>
                      <Link href="/beneficiary/login">
                        <Button variant="ghost" className="w-full justify-start gap-2" data-testid="mobile-login-beneficiary">
                          <Tag className="w-4 h-4" />
                          Beneficiary Login
                        </Button>
                      </Link>
                      <Link href="/philanthropist/login">
                        <Button variant="ghost" className="w-full justify-start gap-2" data-testid="mobile-login-philanthropist">
                          <Users className="w-4 h-4" />
                          Philanthropist (Donor)
                        </Button>
                      </Link>
                      <Link href="/charity/login">
                        <Button variant="ghost" className="w-full justify-start gap-2" data-testid="mobile-login-charity">
                          <Building2 className="w-4 h-4" />
                          Charity / Organization
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* Donate Section */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground px-2">Donate</p>
                    <Link href="/donor">
                      <Button variant="ghost" className="w-full justify-start gap-2" data-testid="mobile-donor">
                        <Heart className="w-4 h-4" />
                        Donor Portal
                      </Button>
                    </Link>
                    <Link href="/quick-donate/">
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
