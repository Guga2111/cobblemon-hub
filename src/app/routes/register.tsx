import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import type { MetaFunction } from "react-router";
import { useRegister } from "~/features/auth/auth-queries";
import { useAuthStore } from "~/features/auth/use-auth-store";
import {
  registerSchema,
  type RegisterInput,
} from "~/features/auth/auth-schemas";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { RouteErrorBoundary } from "~/components/layout/route-error-boundary";

export const meta: MetaFunction = () => [
  { title: "Criar Conta - Cobbleverse Hub" },
];

export function ErrorBoundary() {
  return <RouteErrorBoundary routeName="Registro" />;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuthStore();
  const register = useRegister();

  const [form, setForm] = useState<RegisterInput>({
    email: "",
    displayName: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterInput, string>>
  >({});

  if (!isLoading && user) return <Navigate to="/home" replace />;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof RegisterInput;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    register.mutate(
      {
        email: parsed.data.email,
        displayName: parsed.data.displayName,
        password: parsed.data.password,
      },
      {
        onSuccess: () => navigate("/home"),
      },
    );
  }

  return (
    <ScrollArea className="h-screen">
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border/40 bg-card/60 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/25">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              className="text-primary"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
              />
              <line
                x1="2"
                y1="12"
                x2="22"
                y2="12"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
          </div>
          <CardTitle className="text-xl">Criar Conta</CardTitle>
          <CardDescription>
            Junte-se ao Cobbleverse Hub
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Nome de exibicao</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Seu nome"
                value={form.displayName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, displayName: e.target.value }))
                }
                aria-invalid={!!errors.displayName}
              />
              {errors.displayName && (
                <p className="text-xs text-destructive">
                  {errors.displayName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="******"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="******"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm((f) => ({ ...f, confirmPassword: e.target.value }))
                }
                aria-invalid={!!errors.confirmPassword}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {register.error && (
              <p className="text-sm text-destructive text-center">
                {register.error.message}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={register.isPending}
            >
              {register.isPending ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Ja tem conta?{" "}
            <Link
              to="/login"
              className="text-primary hover:underline font-medium"
            >
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
    </ScrollArea>
  );
}
