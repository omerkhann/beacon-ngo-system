import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import { AppLayout } from "@/components/layout/AppLayout";
import { StoreProvider } from "@/store";
import type { UserRole } from "@/types";

import Campaigns from "@/pages/campaigns";
import CreateCampaign from "@/pages/create-campaign";
import Donations from "@/pages/donations";
import MyDonations from "@/pages/my-donations";
import ViewDonations from "@/pages/view-donations";
import Expenses from "@/pages/expenses";
import VolunteerApply from "@/pages/volunteer-apply";
import VolunteerApplications from "@/pages/volunteer-applications";
import AdminApprovals from "@/pages/admin-approvals";
import ImpactReport from "@/pages/impact-report";
import ManageVolunteersPage from "@/pages/manage-volunteers";
import MyTasksPage from "@/pages/my-tasks";

// Role-based dashboards
import AdminDashboard from "@/pages/admin-dashboard";
import CampaignManagerDashboard from "@/pages/campaign-manager-dashboard";
import DonorDashboard from "@/pages/donor-dashboard";
import VolunteerDashboard from "@/pages/volunteer-dashboard";

function ProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const user = localStorage.getItem("user");
    setIsAuthenticated(!!(token && user));
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("auth_token");
      const userStr = localStorage.getItem("user");
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          setIsAuthenticated(true);
          setUserRole(user.role);
        } catch (e) {
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for custom auth change events (login/logout in same tab)
    const handleAuthChange = (event: Event) => {
      checkAuth();
    };

    // Also listen for storage changes (login from another tab, logout, etc.)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth_token" || e.key === "user") {
        checkAuth();
      }
    };

    window.addEventListener("authchange", handleAuthChange);
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("authchange", handleAuthChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="*">
          <Redirect to="/login" />
        </Route>
      </Switch>
    );
  }

  // Role-based dashboard routing
  const getDashboardRoute = () => {
    switch (userRole) {
      case "ADMIN":
        return <AdminDashboard />;
      case "CAMPAIGN_MANAGER":
        return <CampaignManagerDashboard />;
      case "DONOR":
        return <DonorDashboard />;
      case "VOLUNTEER":
        return <VolunteerDashboard />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <AppLayout>
      <Switch>
        <Route path="/">
          {getDashboardRoute()}
        </Route>
        <Route path="/campaigns" component={Campaigns} />
        <Route path="/create-campaign" component={CreateCampaign} />
        <Route path="/donations" component={Donations} />
        <Route path="/my-donations" component={MyDonations} />
        <Route path="/view-donations" component={ViewDonations} />
        <Route path="/expenses" component={Expenses} />
        <Route path="/volunteer-apply" component={VolunteerApply} />
        <Route path="/volunteer-applications" component={VolunteerApplications} />
        <Route path="/admin-approvals" component={AdminApprovals} />
        <Route path="/manage-volunteers" component={ManageVolunteersPage} />
        <Route path="/my-tasks" component={MyTasksPage} />
        <Route path="/impact-report" component={ImpactReport} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <StoreProvider>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </StoreProvider>
  );
}

export default App;
