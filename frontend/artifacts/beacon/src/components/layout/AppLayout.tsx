import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/logos/logo.png";
import {
  LayoutDashboard,
  PlusCircle,
  Banknote,
  Users,
  CheckSquare,
  BarChart3,
  HeartHandshake,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Home,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { User } from "@/types";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Failed to parse user data");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    
    // Dispatch custom event to notify Router of auth state change
    window.dispatchEvent(new CustomEvent("authchange", { detail: { authenticated: false } }));
    
    setLocation("/login");
  };

  // Admin Navigation
  const adminNavItems = [
    { href: "/campaigns", label: "Campaign Dashboard", icon: LayoutDashboard },
    { href: "/create-campaign", label: "Create Campaign", icon: PlusCircle },
    { href: "/expenses", label: "Expense Log", icon: Banknote },
    { href: "/view-donations", label: "View Donations", icon: HeartHandshake },
    { href: "/admin-approvals", label: "Admin Approvals", icon: CheckSquare },
    { href: "/impact-report", label: "Impact Report", icon: BarChart3 },
  ];

  // Campaign Manager Navigation
  const campaignManagerNavItems = [
    { href: "/campaigns", label: "Campaign Dashboard", icon: LayoutDashboard },
    { href: "/create-campaign", label: "Create Campaign", icon: PlusCircle },
    { href: "/expenses", label: "Expense Log", icon: Banknote },
    { href: "/view-donations", label: "View Donations", icon: HeartHandshake },
    { href: "/manage-volunteers", label: "Manage Volunteers", icon: CheckSquare },
    { href: "/impact-report", label: "Impact Report", icon: BarChart3 },
  ];

  // Donor Navigation
  const donorNavItems = [
    { href: "/donations", label: "Make a Donation", icon: HeartHandshake },
    { href: "/my-donations", label: "My Donations", icon: FileText },
  ];

  // Volunteer Navigation
  const volunteerNavItems = [
    { href: "/volunteer-apply", label: "Volunteer Opportunities", icon: Users },
    { href: "/my-tasks", label: "My Tasks", icon: CheckSquare },
    { href: "/volunteer-applications", label: "My Applications", icon: FileText },
  ];

  // Determine which nav items to show based on role
  const getNavItems = () => {
    if (!user) return [];
    
    switch (user.role) {
      case "ADMIN":
        return adminNavItems;
      case "CAMPAIGN_MANAGER":
        return campaignManagerNavItems;
      case "DONOR":
        return donorNavItems;
      case "VOLUNTEER":
        return volunteerNavItems;
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  const showAdminSection = user?.role === "ADMIN" || user?.role === "CAMPAIGN_MANAGER";
  const showDonorSection = user?.role === "DONOR";
  const showVolunteerSection = user?.role === "VOLUNTEER";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Green Header */}
      <header className="flex-shrink-0 bg-sidebar-primary text-sidebar-primary-foreground border-b border-sidebar-primary/30 shadow-md">
        <div className="flex h-20 items-center justify-between px-6">
          {/* Logo and Name */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/15">
              <img src={logoImage} alt="Beacon Logo" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Beacon</h1>
              <p className="text-xs text-white/75">NGO Management System</p>
            </div>
          </div>

          {/* User Profile Section */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center justify-between gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold">{user.fullName}</p>
                    <p className="text-xs text-white/70">{user.role}</p>
                  </div>
                </div>
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform",
                  showUserMenu && "rotate-180"
                )} />
              </button>
              
              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-sidebar-border rounded-lg shadow-lg z-50 min-w-[150px]">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 border-r bg-sidebar text-sidebar-foreground overflow-y-auto">
          <div className="p-4 flex flex-col gap-6 h-full">
            
            {/* Home/Dashboard Link */}
            <div>
              <Link href="/">
                <div className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                  location === "/" 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}>
                  <Home className="w-4 h-4" />
                  Dashboard
                </div>
              </Link>
            </div>

            <div>
              <h3 className="px-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
                {showAdminSection && "Campaign Management"}
                {showDonorSection && "Donor Options"}
                {showVolunteerSection && "Volunteer"}
              </h3>
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => {
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

            {/* Spacer */}
            <div className="flex-1"></div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-muted/20 relative">
          <div className="mx-auto max-w-6xl w-full p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
