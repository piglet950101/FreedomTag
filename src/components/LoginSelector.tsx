import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ChevronDown, LogIn, Tag, Users, Building2, User, LogOut, Shield } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';

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

export default function LoginSelector() {
  const [open, setOpen] = useState(false);
  const [lastRole, setLastRole] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const ref = useRef<HTMLDivElement | null>(null);
  const hoverState = useRef({ overButton: false, overMenu: false });
  const closeTimeout = useRef<number | null>(null);

  // Check if user is logged in
  const getAuthToken = () => localStorage.getItem('authToken');
  const hasToken = !!getAuthToken();
  
  // Decode token to determine type
  const token = getAuthToken();
  const tokenPayload = token ? decodeJWTPayload(token) : null;
  const tokenType = tokenPayload?.type; // 'philanthropist', 'user', or undefined

  // Check user session - only if token type is 'user' or undefined (for backward compatibility)
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
    enabled: hasToken && (tokenType === 'user' || !tokenType), // Only if user type or unknown
    retry: false,
  });

  // Check beneficiary session - only if token type is 'beneficiary'
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
    enabled: hasToken && tokenType === 'beneficiary', // Only if beneficiary type
    retry: false,
  });

  // Check philanthropist session - only if token type is 'philanthropist'
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
    enabled: hasToken && tokenType === 'philanthropist', // Only if philanthropist type
    retry: false,
  });

  // Determine if user is logged in and which dashboard to show
  const isLoggedIn = hasToken && (!!session || !!beneficiarySession || !!philanthropistSession);
  
  // Determine dashboard route based on user type
  const getDashboardRoute = () => {
    if (beneficiarySession) {
      return '/beneficiary/dashboard';
    }
    if (philanthropistSession) {
      return '/philanthropist/dashboard';
    }
    if (session) {
      const roles = session.roles || [];
      if (roles.includes('ADMIN')) {
        return '/admin';
      }
      if (roles.includes('PHILANTHROPIST')) {
        return '/philanthropist/dashboard';
      }
      if (roles.includes('ORGANIZATION')) {
        // Try to get tag code from session, fallback to a default
        const tagCode = session.beneficiaryTag?.tagCode || 'CH118380';
        return `/charity/credibility/${tagCode}`;
      }
      // Default to beneficiary dashboard for other roles
      return '/beneficiary/dashboard';
    }
    return '/beneficiary/dashboard'; // Fallback
  };
  
  const dashboardRoute = getDashboardRoute();

  useEffect(() => {
    setLastRole(localStorage.getItem('ft:lastLoginRole'));
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
      if (closeTimeout.current) {
        clearTimeout(closeTimeout.current as unknown as number);
        closeTimeout.current = null;
      }
    };
  }, []);

  const scheduleClose = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current as unknown as number);
      closeTimeout.current = null;
    }
    closeTimeout.current = window.setTimeout(() => {
      if (!hoverState.current.overButton && !hoverState.current.overMenu) {
        setOpen(false);
      }
      closeTimeout.current = null;
    }, 150);
  };

  const handleChoose = (role: string) => {
    localStorage.setItem('ft:lastLoginRole', role);
    setLastRole(role);
    setOpen(false);
  };

  const handleLogout = async () => {
    try {
      // Clear JWT token
      localStorage.removeItem('authToken');
      
      const token = getAuthToken();
      // Try to call logout endpoint
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          credentials: "include",
        });
      } catch (e) {
        // Ignore logout errors
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/beneficiary/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/philanthropist/me"] });
      queryClient.removeQueries({ queryKey: ["/api/auth/me"] });
      queryClient.removeQueries({ queryKey: ["/api/beneficiary/me"] });
      queryClient.removeQueries({ queryKey: ["/api/philanthropist/me"] });
      
      setOpen(false);
      setLocation("/");
      // Reload to clear all state
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear token and redirect
      localStorage.removeItem('authToken');
      queryClient.removeQueries({ queryKey: ["/api/auth/me"] });
      queryClient.removeQueries({ queryKey: ["/api/beneficiary/me"] });
      queryClient.removeQueries({ queryKey: ["/api/philanthropist/me"] });
      setOpen(false);
      setLocation("/");
      window.location.reload();
    }
  };

  // If logged in, show user menu
  if (isLoggedIn) {
    const userName = beneficiarySession?.beneficiaryName || 
                     philanthropistSession?.displayName ||
                     philanthropistSession?.email ||
                     session?.user?.fullName || 
                     session?.user?.email || 
                     'User';

    return (
      <div className="relative inline-block text-left" ref={ref}>
        <Button
          variant="outline"
          data-testid="button-user-menu"
          aria-haspopup="menu"
          aria-expanded={open}
          className="gap-2 px-3 py-2"
          onClick={() => setOpen(v => !v)}
          onMouseEnter={() => {
            hoverState.current.overButton = true;
            if (closeTimeout.current) {
              clearTimeout(closeTimeout.current as unknown as number);
              closeTimeout.current = null;
            }
            setOpen(true);
          }}
          onMouseLeave={() => {
            hoverState.current.overButton = false;
            scheduleClose();
          }}
        >
          <User className="w-4 h-4 mr-1" />
          {userName}
          <ChevronDown className={`w-4 h-4 ml-1 opacity-70 transition-transform ${open ? 'rotate-180' : ''}`} />
        </Button>

        {open && (
          <div
            role="menu"
            aria-label="User menu"
            className="absolute right-0 mt-2 w-[300px] rounded-md bg-card shadow-lg z-[9999] overflow-visible"
            onMouseEnter={() => {
              hoverState.current.overMenu = true;
              if (closeTimeout.current) {
                clearTimeout(closeTimeout.current as unknown as number);
                closeTimeout.current = null;
              }
              setOpen(true);
            }}
            onMouseLeave={() => {
              hoverState.current.overMenu = false;
              scheduleClose();
            }}
          >
            <div className="w-[300px] p-4">
              <div className="grid gap-3">
                <Link href={dashboardRoute}>
                  <div
                    role="menuitem"
                    className="block select-none space-y-1 rounded-md p-3 hover-elevate cursor-pointer"
                    data-testid="menu-my-page"
                    onClick={() => setOpen(false)}
                  >
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <User className="w-4 h-4" />
                      My Page
                    </div>
                    <p className="text-sm text-muted-foreground">Go to your dashboard</p>
                  </div>
                </Link>

                {session && session.roles && session.roles.includes('ADMIN') && (
                  <Link href="/admin/users">
                    <div
                      role="menuitem"
                      className="block select-none space-y-1 rounded-md p-3 hover-elevate cursor-pointer"
                      data-testid="menu-user-management"
                      onClick={() => setOpen(false)}
                    >
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Shield className="w-4 h-4" />
                        User Management
                      </div>
                      <p className="text-sm text-muted-foreground">Manage users and roles</p>
                    </div>
                  </Link>
                )}

                <div
                  role="menuitem"
                  className="block select-none space-y-1 rounded-md p-3 hover-elevate cursor-pointer text-destructive"
                  data-testid="menu-logout"
                  onClick={handleLogout}
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </div>
                  <p className="text-sm text-muted-foreground">Sign out of your account</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If not logged in, show login menu
  return (
    <div className="relative inline-block text-left" ref={ref}>
      <Button
        variant="outline"
        data-testid="button-login"
        aria-haspopup="menu"
        aria-expanded={open}
        className="gap-2 px-3 py-2"
        onClick={() => setOpen(v => !v)}
        onMouseEnter={() => {
          hoverState.current.overButton = true;
          if (closeTimeout.current) {
            clearTimeout(closeTimeout.current as unknown as number);
            closeTimeout.current = null;
          }
          setOpen(true);
        }}
        onMouseLeave={() => {
          hoverState.current.overButton = false;
          scheduleClose();
        }}
      >
        <LogIn className="w-4 h-4 mr-1" />
        {lastRole ? `Login as ${lastRole}` : 'Login'}
        <ChevronDown className={`w-4 h-4 ml-1 opacity-70 transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>

      {open && (
        <div
          role="menu"
          aria-label="Login as"
          className="absolute right-0 mt-2 w-[400px] rounded-md bg-card shadow-lg z-[9999] overflow-visible"
          onMouseEnter={() => {
            hoverState.current.overMenu = true;
            if (closeTimeout.current) {
              clearTimeout(closeTimeout.current as unknown as number);
              closeTimeout.current = null;
            }
            setOpen(true);
          }}
          onMouseLeave={() => {
            hoverState.current.overMenu = false;
            scheduleClose();
          }}
        >
          <div className="w-[400px] p-4">
            <div className="grid gap-3">
              <Link href="/beneficiary/login">
                <div
                  role="menuitem"
                  className="block select-none space-y-1 rounded-md p-3 hover-elevate cursor-pointer"
                  data-testid="login-beneficiary"
                  onClick={() => handleChoose('Beneficiary')}
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Tag className="w-4 h-4" />
                    Beneficiary Login
                  </div>
                  <p className="text-sm text-muted-foreground">Access Freedom Tag wallet</p>
                </div>
              </Link>

              <Link href="/philanthropist/login">
                <div
                  role="menuitem"
                  className="block select-none space-y-1 rounded-md p-3 hover-elevate cursor-pointer"
                  data-testid="login-philanthropist"
                  onClick={() => handleChoose('Philanthropist')}
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Users className="w-4 h-4" />
                    Philanthropist (Donor)
                  </div>
                  <p className="text-sm text-muted-foreground">Sign in to manage donations</p>
                </div>
              </Link>

              <Link href="/charity/login">
                <div
                  role="menuitem"
                  className="block select-none space-y-1 rounded-md p-3 hover-elevate cursor-pointer"
                  data-testid="login-charity"
                  onClick={() => handleChoose('Charity')}
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Building2 className="w-4 h-4" />
                    Charity / Organization
                  </div>
                  <p className="text-sm text-muted-foreground">Organization & admin access</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
