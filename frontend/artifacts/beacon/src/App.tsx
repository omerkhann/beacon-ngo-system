import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout/AppLayout";
import { StoreProvider } from "@/store";

import Campaigns from "@/pages/campaigns";
import CreateCampaign from "@/pages/create-campaign";
import Donations from "@/pages/donations";
import Expenses from "@/pages/expenses";
import VolunteerApply from "@/pages/volunteer-apply";
import AdminApprovals from "@/pages/admin-approvals";
import ImpactReport from "@/pages/impact-report";

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/">
          <Redirect to="/campaigns" />
        </Route>
        <Route path="/campaigns" component={Campaigns} />
        <Route path="/create-campaign" component={CreateCampaign} />
        <Route path="/donations" component={Donations} />
        <Route path="/expenses" component={Expenses} />
        <Route path="/volunteer-apply" component={VolunteerApply} />
        <Route path="/admin-approvals" component={AdminApprovals} />
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
