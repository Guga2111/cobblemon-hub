import { Swords, Trash2 } from "lucide-react";
import { TeamSlot } from "~/components/team/team-slot";
import { useTeamStore } from "~/features/team-builder/use-team-store";
import { ExportDialog } from "~/components/team/export-dialog";

export default function TeamBuilderPage() {
  const slots = useTeamStore((s) => s.slots);
  const clearTeam = useTeamStore((s) => s.clearTeam);

  const filledCount = slots.filter((s) => s.pokemonData !== null).length;

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Swords className="h-5 w-5 text-primary/70" />
            <h1 className="text-xl font-bold tracking-tight">Team Builder</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground/60">
            {filledCount === 0
              ? "Monte seu time de 6 Pokémon"
              : `${filledCount}/6 Pokémon selecionados`}
          </p>
        </div>

        {filledCount > 0 && (
          <div className="flex items-center gap-2">
            <ExportDialog />
            <button
              type="button"
              onClick={clearTeam}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors border border-border/50 hover:border-destructive/30"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Limpar time
            </button>
          </div>
        )}
      </div>

      {/* 6-slot grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {slots.map((_, i) => (
          <TeamSlot key={i} slotIndex={i} />
        ))}
      </div>
    </div>
  );
}
