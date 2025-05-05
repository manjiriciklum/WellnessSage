import { Switch, Route, Router as WouterRouter } from "wouter";
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
import AuthPage from "@/pages/auth-page";
import { DashboardLayout } from "@/components/dashboard/layout";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function ProtectedDashboard() {
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
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function Router() {
  const basePath = "./"; // Set base path to current directory
  
  return (
    <WouterRouter base={basePath}>
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/*" component={ProtectedDashboard} />
      </Switch>
    </WouterRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="ciklum-healthai-theme">
        <AuthProvider>
          <NotificationContext />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function NotificationContext() {
  const { user } = useAuth();
  
  return (
    // Only provide the NotificationProvider if a user is logged in
    user ? (
      <NotificationProvider userId={user.id}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </NotificationProvider>
    ) : (
      // Otherwise just render without notifications
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    )
  );
}

export default App;
