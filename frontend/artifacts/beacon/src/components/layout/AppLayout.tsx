import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  PlusCircle,
  Banknote,
  Users,
  CheckSquare,
  BarChart3,
  HeartHandshake
} from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const adminNavItems = [
    { href: "/campaigns", label: "Campaign Dashboard", icon: LayoutDashboard },
    { href: "/create-campaign", label: "Create Campaign", icon: PlusCircle },
    { href: "/expenses", label: "Expense Log", icon: Banknote },
    { href: "/admin-approvals", label: "Admin Approvals", icon: CheckSquare },
    { href: "/impact-report", label: "Impact Report", icon: BarChart3 },
  ];

  const volunteerNavItems = [
    { href: "/donations", label: "Donor Portal", icon: HeartHandshake },
    { href: "/volunteer-apply", label: "Volunteer Portal", icon: Users },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-64 flex-shrink-0 border-r bg-sidebar text-sidebar-foreground">
        <div className="flex h-16 items-center px-6 border-b border-sidebar-border bg-sidebar-primary text-sidebar-primary-foreground">
          <HeartHandshake className="w-6 h-6 mr-2" />
          <span className="text-lg font-bold">Beacon</span>
        </div>
        <div className="h-[calc(100vh-4rem)] overflow-y-auto p-4 flex flex-col gap-6">
          
          <div>
            <h3 className="px-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
              Admin Controls
            </h3>
            <nav className="flex flex-col gap-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <h3 className="px-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
              Volunteer & Public
            </h3>
            <nav className="flex flex-col gap-1">
              {volunteerNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-muted/20 relative">
        <div className="mx-auto max-w-6xl w-full p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
