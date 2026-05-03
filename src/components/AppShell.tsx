import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Trophy, ShieldCheck, LogOut, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const baseNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/sports", label: "Sports", icon: Trophy },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user, role, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  const items = [...baseNav];
  if (isAdmin) items.push({ to: "/users", label: "Users", icon: ShieldCheck } as never);

  return (
    <div className="min-h-screen bg-background flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform lg:translate-x-0 lg:static lg:inset-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="px-6 py-6 border-b border-sidebar-border">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center text-primary-foreground font-bold"
                style={{ background: "var(--gradient-primary)" }}
              >
                SS
              </div>
              <div>
                <div className="font-bold text-sidebar-foreground leading-tight">
                  SportsSociety
                </div>
                <div className="text-xs text-muted-foreground">College Hub</div>
              </div>
            </Link>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {items.map((item) => {
              const active = location.pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-sidebar-border">
            <div className="px-3 py-2 mb-2">
              <div className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.email}
              </div>
              <div className="text-xs text-muted-foreground capitalize">{role ?? "—"}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" /> Sign out
            </Button>
          </div>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between border-b border-border px-4 py-3 bg-card">
          <Link to="/dashboard" className="font-bold">
            SportsSociety
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setOpen((v) => !v)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
