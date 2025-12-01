import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Heart, Store, Users, Building, LogOut, Wallet, Gift, ShoppingBag } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface UserSession {
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  roles: string[];
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: session, isLoading } = useQuery<UserSession | null>({
    queryKey: ["/api/auth/me"],
  });

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
      setLocation("/login");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loading-spinner" />
      </div>
    );
  }

  if (!session) {
    setLocation("/login");
    return null;
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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground" data-testid="heading-welcome">
              Welcome, {session.user.fullName}
            </h1>
            <p className="text-sm text-muted-foreground" data-testid="text-email">
              {session.user.email}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
                  {actions.map((action, index) => (
                    <Card
                      key={index}
                      className="hover-elevate active-elevate-2 cursor-pointer transition-all"
                      onClick={() => setLocation(action.action)}
                      data-testid={`card-action-${action.action.replace(/\//g, '-')}`}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <action.icon className="h-5 w-5 text-primary" />
                          {action.title}
                        </CardTitle>
                        <CardDescription>{action.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {session.roles.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No Roles Assigned</CardTitle>
              <CardDescription>
                You don't have any roles assigned yet. Contact an administrator to get started.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </main>
    </div>
  );
}
