import { Swords, Trash2, Shield } from "lucide-react";
import { TeamSlot } from "~/components/team/team-slot";
import { useTeamStore } from "~/features/team-builder/use-team-store";
import { ExportDialog } from "~/components/team/export-dialog";
import { RouteErrorBoundary } from "~/components/layout/route-error-boundary";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

export default function TeamBuilderPage() {
  const slots = useTeamStore((s) => s.slots);
  const clearTeam = useTeamStore((s) => s.clearTeam);

  const filledCount = slots.filter((s) => s.pokemonData !== null).length;

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8 pb-64 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <div
              className="relative flex items-center justify-center h-10 w-10 rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.05))",
                border: "1px solid hsl(var(--primary) / 0.2)",
              }}
            >
              <Swords
                className="h-5 w-5"
                style={{ color: "hsl(var(--primary))" }}
              />
              <div
                className="absolute inset-0 rounded-xl blur-md -z-10"
                style={{
                  background:
                    "radial-gradient(circle, hsl(var(--primary) / 0.25) 0%, transparent 70%)",
                }}
              />
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight font-[var(--font-heading)]">
                Team Builder
              </h1>
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs font-semibold tabular-nums transition-colors",
                  filledCount === 6 && "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                )}
              >
                {filledCount}/6
              </Badge>
            </div>
          </div>
          <p
            className="text-sm pl-[3.25rem]"
            style={{ color: "hsl(var(--muted-foreground) / 0.6)" }}
          >
            {filledCount === 0
              ? "Monte seu time de 6 Pokemon"
              : `${filledCount}/6 Pokemon selecionados`}
          </p>
        </div>

        {filledCount > 0 && (
          <div className="flex items-center gap-2">
            <ExportDialog />
            <Button
              variant="ghost"
              size="sm"
              onClick={clearTeam}
              className="gap-1.5 text-xs text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 border border-border/40 hover:border-destructive/30"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Limpar time
            </Button>
          </div>
        )}
      </div>

      <Separator
        className="opacity-50"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.2), transparent)",
        }}
      />

      {/* Empty state hint */}
      {filledCount === 0 && (
        <div
          className={cn(
            "flex flex-col items-center justify-center text-center py-8 rounded-2xl animate-fade-in",
            "border border-dashed"
          )}
          style={{
            borderColor: "hsl(var(--primary) / 0.15)",
            background:
              "linear-gradient(180deg, hsl(var(--primary) / 0.03) 0%, transparent 100%)",
          }}
        >
          <div
            className="flex items-center justify-center h-14 w-14 rounded-2xl mb-4"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.03))",
              border: "1px solid hsl(var(--primary) / 0.12)",
            }}
          >
            <Shield
              className="h-7 w-7"
              style={{ color: "hsl(var(--primary) / 0.4)" }}
            />
          </div>
          <p
            className="text-sm font-medium"
            style={{ color: "hsl(var(--muted-foreground) / 0.7)" }}
          >
            Nenhum Pokemon adicionado ainda
          </p>
          <p
            className="text-xs mt-1 max-w-xs"
            style={{ color: "hsl(var(--muted-foreground) / 0.4)" }}
          >
            Clique em um dos slots abaixo para pesquisar e adicionar Pokemon ao seu time.
          </p>
        </div>
      )}

      {/* 6-slot grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {slots.map((_, i) => (
          <div
            key={i}
            className="relative animate-fade-in [&:has(>.z-40)]:z-40"
            style={{ animationDelay: `${i * 75}ms`, animationFillMode: "both" }}
          >
            <TeamSlot slotIndex={i} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return <RouteErrorBoundary routeName="Team Builder" />;
}
