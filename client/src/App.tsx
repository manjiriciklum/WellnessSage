import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import HealthInsightsPage from "@/pages/health-insights";
import ConnectedDevicesPage from "@/pages/connected-devices";
import WellnessPlansPage from "@/pages/wellness-plans";
import FindDoctorPage from "@/pages/find-doctor";
import AlertsRemindersPage from "@/pages/alerts-reminders";
import HealthCoachPage from "@/pages/health-coach";
import SettingsPage from "@/pages/settings";
import { DashboardLayout } from "@/components/dashboard/layout";
import { NotificationProvider } from "@/contexts/NotificationContext";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/health-insights" component={HealthInsightsPage} />
        <Route path="/connected-devices" component={ConnectedDevicesPage} />
        <Route path="/wellness-plans" component={WellnessPlansPage} />
        <Route path="/find-doctor" component={FindDoctorPage} />
        <Route path="/alerts-reminders" component={AlertsRemindersPage} />
        <Route path="/health-coach" component={HealthCoachPage} />
        <Route path="/settings" component={SettingsPage} />
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  // Using a fixed user ID (1) for demo purposes
  // In a real application, this would come from authentication
  const userId = 1;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="healthai-theme">
        <NotificationProvider userId={userId}>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
