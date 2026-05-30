import { Navigate } from "react-router";
import { useAuthStore } from "~/features/auth/use-auth-store";

function AuthSkeleton() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return <AuthSkeleton />;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
