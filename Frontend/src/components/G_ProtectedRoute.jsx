import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-card text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <h2 className="text-lg font-heading font-bold text-foreground">
            Loading
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Checking your access...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}