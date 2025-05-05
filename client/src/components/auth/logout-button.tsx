import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const { logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
      onClick={handleLogout}
      disabled={logoutMutation.isPending}
    >
      <LogOut className="h-4 w-4" />
      {logoutMutation.isPending ? "Logging out..." : "Logout"}
    </Button>
  );
}
