import { Link } from "react-router";
import type { Evolution } from "~/types/pokemon";
import { normalizePokemonName } from "~/lib/utils";
import { ChevronRight } from "lucide-react";

interface EvolutionChainProps {
  pokemonId: string;
  pokemonName: string;
  displayName: string;
  evolutions: Evolution[];
}

function formatItemName(item: string): string {
  return item
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function conditionLabel(evo: Evolution): string {
  if (evo.trigger === "level-up") {
    if (evo.level) return `Lv. ${evo.level}`;
    if (evo.condition) return evo.condition;
    return "Level up";
  }
  if (evo.trigger === "use-item") {
    return evo.item ? formatItemName(evo.item) : "Item";
  }
  if (evo.trigger === "trade") {
    return evo.item ? `Trade (${formatItemName(evo.item)})` : "Trade";
  }
  return evo.condition ?? "Special";
}

function PokemonNode({
  name,
  displayName,
  isLink,
}: {
  name: string;
  displayName: string;
  isLink: boolean;
}) {
  const sprite = `https://play.pokemonshowdown.com/sprites/dex/${normalizePokemonName(name)}.png`;
  const fallback = `https://play.pokemonshowdown.com/sprites/gen5/${normalizePokemonName(name)}.png`;

  const inner = (
    <div className="flex flex-col items-center gap-1.5">
      <div className="w-16 h-16 flex items-center justify-center">
        <img
          src={sprite}
          alt={displayName}
          className="w-full h-full object-contain"
          loading="lazy"
          onError={(e) => {
            const t = e.currentTarget;
            if (!t.src.includes("gen5")) t.src = fallback;
          }}
        />
      </div>
      <span className="text-xs text-foreground/80 font-medium text-center leading-tight max-w-[80px]">
        {displayName}
      </span>
    </div>
  );

  if (isLink) {
    return (
      <Link
        to={`/pokedex/${name}`}
        className="group transition-opacity hover:opacity-80"
        aria-label={`View ${displayName}`}
      >
        {inner}
      </Link>
    );
  }

  return <div>{inner}</div>;
}

export function EvolutionChain({
  pokemonId: _pokemonId,
  pokemonName,
  displayName,
  evolutions,
}: EvolutionChainProps) {
  if (evolutions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground/50 italic">
        This Pokémon does not evolve.
      </p>
    );
  }

  return (
    <div className="flex items-start gap-3 flex-wrap">
      {/* Current pokemon */}
      <PokemonNode name={pokemonName} displayName={displayName} isLink={false} />

      {/* Each evolution branch */}
      {evolutions.map((evo) => {
        const label = conditionLabel(evo);
        const evoDisplayName = evo.to
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

        return (
          <div key={evo.to} className="flex items-start gap-3">
            {/* Arrow + condition */}
            <div className="flex flex-col items-center justify-start pt-4 gap-1 min-w-[64px]">
              <div className="flex items-center gap-0.5 text-muted-foreground/50">
                <div className="h-px w-4 bg-border" />
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                <div className="h-px w-4 bg-border" />
              </div>
              <span className="text-[10px] text-muted-foreground/70 text-center leading-tight max-w-[64px]">
                {label}
              </span>
            </div>

            {/* Evolution target */}
            <PokemonNode name={evo.to} displayName={evoDisplayName} isLink />
          </div>
        );
      })}
    </div>
  );
}
