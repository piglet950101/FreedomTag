import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ChevronDown, LogIn, Tag, Users, Building2 } from 'lucide-react';

export default function LoginSelector() {
  const [open, setOpen] = useState(false);
  const [lastRole, setLastRole] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const hoverState = useRef({ overButton: false, overMenu: false });
  const closeTimeout = useRef<number | null>(null);

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
