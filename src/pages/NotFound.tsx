import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Home, AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center gradient-bg p-4">
      <GlassCard variant="strong" className="text-center max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-destructive/20 flex items-center justify-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
        </div>
        <h1 className="mb-2 text-6xl font-bold text-foreground">404</h1>
        <h2 className="mb-4 text-2xl font-semibold">Page Not Found</h2>
        <p className="mb-8 text-muted-foreground">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Button onClick={() => navigate("/")} className="w-full">
          <Home className="h-4 w-4 mr-2" />
          Return to Home
        </Button>
      </GlassCard>
    </div>
  );
};

export default NotFound;
