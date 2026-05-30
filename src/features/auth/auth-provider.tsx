import { useCurrentUser } from "./auth-queries";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useCurrentUser();
  return <>{children}</>;
}
