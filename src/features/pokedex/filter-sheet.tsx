import { useState, useMemo } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import {
  X,
  Check,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Zap,
  Sun,
  CloudRain,
} from "lucide-react";
import { TypeBadge } from "~/components/pokemon/type-badge";
import { cn } from "~/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetClose,
} from "~/components/ui/sheet";
import {
  POKEMON_TYPES,
  TYPE_DISPLAY_NAMES,
  SPAWN_BUCKET_DISPLAY_NAMES,
  SPAWN_CONTEXT_DISPLAY_NAMES,
} from "~/lib/constants";
import type { PokemonType } from "~/types/pokemon";
import type { SpawnBucket, SpawnContext } from "~/types/spawn";
import {
  SPAWN_BUCKETS_ALL,
  SPAWN_CONTEXTS_ALL,
  WEATHER_OPTIONS,
  type PokedexFilters,
  type SpawnWeather,
} from "./use-pokedex-filters";

// ── Section heading ───────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="h-px flex-1 bg-border/60" />
      <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-muted-foreground/60 select-none shrink-0">
        {children}
      </span>
      <div className="h-px flex-1 bg-border/60" />
    </div>
  );
}

// ── Type grid ─────────────────────────────────────────────────────────

function TypeGrid({
  selected,
  onToggle,
}: {
  selected: PokemonType[];
  onToggle: (t: PokemonType) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {POKEMON_TYPES.map((type) => {
        const isActive = selected.includes(type);
        return (
          <button
            key={type}
            type="button"
            onClick={() => onToggle(type)}
            className={cn(
              "relative transition-all duration-150 rounded-full",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isActive ? "opacity-100 scale-[1.04]" : "opacity-35 hover:opacity-65"
            )}
            aria-pressed={isActive}
            title={TYPE_DISPLAY_NAMES[type]}
          >
            <TypeBadge type={type} size="sm" className="w-full justify-center" />
            {isActive && (
              <span
                className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-foreground"
              >
                <Check size={8} className="text-background" strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Bucket toggles ────────────────────────────────────────────────────

const BUCKET_STYLES: Record<SpawnBucket, { base: string; active: string }> = {
  common: {
    base: "border-zinc-600/40 text-zinc-500",
    active: "border-zinc-400 bg-zinc-700/40 text-zinc-300",
  },
  uncommon: {
    base: "border-emerald-500/25 text-emerald-600/60",
    active: "border-emerald-400 bg-emerald-500/15 text-emerald-300",
  },
  rare: {
    base: "border-sky-500/25 text-sky-600/60",
    active: "border-sky-400 bg-sky-500/15 text-sky-300",
  },
  "ultra-rare": {
    base: "border-amber-400/25 text-amber-500/60",
    active: "border-amber-300 bg-amber-400/15 text-amber-200",
  },
};

function BucketToggles({
  selected,
  onToggle,
}: {
  selected: SpawnBucket[];
  onToggle: (b: SpawnBucket) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {SPAWN_BUCKETS_ALL.map((bucket) => {
        const isActive = selected.includes(bucket);
        const styles = BUCKET_STYLES[bucket];
        return (
          <button
            key={bucket}
            type="button"
            onClick={() => onToggle(bucket)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border",
              "text-[11px] font-bold uppercase tracking-widest",
              "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isActive ? styles.active : cn("bg-transparent", styles.base, "hover:opacity-80")
            )}
            aria-pressed={isActive}
          >
            {isActive && <Check size={9} strokeWidth={3} />}
            {SPAWN_BUCKET_DISPLAY_NAMES[bucket]}
          </button>
        );
      })}
    </div>
  );
}

// ── Context checkboxes ────────────────────────────────────────────────

function ContextCheckboxes({
  selected,
  onToggle,
}: {
  selected: SpawnContext[];
  onToggle: (c: SpawnContext) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-y-2 gap-x-3">
      {SPAWN_CONTEXTS_ALL.map((ctx) => {
        const isChecked = selected.includes(ctx);
        return (
          <label
            key={ctx}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <CheckboxPrimitive.Root
              checked={isChecked}
              onCheckedChange={() => onToggle(ctx)}
              className={cn(
                "h-4 w-4 rounded-sm border shrink-0",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isChecked
                  ? "bg-primary border-primary"
                  : "bg-transparent border-border group-hover:border-primary/50"
              )}
            >
              <CheckboxPrimitive.Indicator className="flex items-center justify-center">
                <Check size={10} className="text-primary-foreground" strokeWidth={3} />
              </CheckboxPrimitive.Indicator>
            </CheckboxPrimitive.Root>
            <span
              className={cn(
                "text-xs transition-colors duration-150 select-none",
                isChecked
                  ? "text-foreground"
                  : "text-muted-foreground group-hover:text-foreground/80"
              )}
            >
              {SPAWN_CONTEXT_DISPLAY_NAMES[ctx]}
            </span>
          </label>
        );
      })}
    </div>
  );
}

// ── Biome combobox ────────────────────────────────────────────────────

function BiomeCombobox({
  value,
  onChange,
  biomeOptions,
}: {
  value: string;
  onChange: (v: string) => void;
  biomeOptions: string[];
}) {
  const [inputValue, setInputValue] = useState(value);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = inputValue.toLowerCase().trim();
    if (!q) return biomeOptions.slice(0, 12);
    return biomeOptions
      .filter((b) => b.toLowerCase().includes(q))
      .slice(0, 12);
  }, [inputValue, biomeOptions]);

  function selectBiome(b: string) {
    setInputValue(b);
    onChange(b);
    setOpen(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
    onChange(e.target.value);
    setOpen(true);
  }

  function handleClear() {
    setInputValue("");
    onChange("");
    setOpen(false);
  }

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <Search
          size={13}
          className="absolute left-2.5 text-muted-foreground pointer-events-none"
        />
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Buscar bioma..."
          className={cn(
            "w-full pl-8 pr-8 py-2 rounded-md text-sm",
            "bg-muted/30 border border-border",
            "text-foreground placeholder:text-muted-foreground/50",
            "focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary",
            "transition-colors duration-150"
          )}
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute top-full mt-1 w-full z-[60] rounded-md border border-border bg-popover shadow-xl overflow-hidden max-h-[180px] overflow-y-auto">
          {filtered.map((biome) => (
            <button
              key={biome}
              type="button"
              onMouseDown={() => selectBiome(biome)}
              className="w-full text-left px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors truncate"
            >
              {biome}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Weather select ────────────────────────────────────────────────────

const WEATHER_LABELS: Record<SpawnWeather | "any", string> = {
  any: "Qualquer clima",
  clear: "Limpo",
  rain: "Chuva",
  thunderstorm: "Tempestade",
};

const WEATHER_ICONS: Record<SpawnWeather | "any", React.ReactNode> = {
  any: <span className="text-[10px]">✦</span>,
  clear: <Sun size={12} />,
  rain: <CloudRain size={12} />,
  thunderstorm: <Zap size={12} />,
};

// ── Styled native select ──────────────────────────────────────────────

function StyledSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full appearance-none pl-3 pr-8 py-2 rounded-md text-sm",
          "bg-muted/30 border border-border",
          "text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary",
          "transition-colors duration-150 cursor-pointer"
        )}
      >
        {children}
      </select>
      <ChevronDown
        size={13}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
    </div>
  );
}

// ── Main FilterSheet export ───────────────────────────────────────────

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  filters: PokedexFilters;
  onToggleType: (t: PokemonType) => void;
  onToggleBucket: (b: SpawnBucket) => void;
  onToggleContext: (c: SpawnContext) => void;
  onUpdate: (patch: Partial<PokedexFilters>) => void;
  onClear: () => void;
  activeFilterCount: number;
  biomeOptions: string[];
}

export function FilterSheet({
  open,
  onOpenChange,
  filters,
  onToggleType,
  onToggleBucket,
  onToggleContext,
  onUpdate,
  onClear,
  activeFilterCount,
  biomeOptions,
}: FilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-primary" />
            <SheetTitle className="text-sm font-semibold text-foreground">
              Filtros
            </SheetTitle>
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              >
                Limpar tudo
              </button>
            )}
            <SheetClose className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <X size={15} />
            </SheetClose>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* Type filter */}
          <div>
            <SectionHeading>Tipo</SectionHeading>
            <TypeGrid selected={filters.types} onToggle={onToggleType} />
          </div>

          {/* Generation filter */}
          <div>
            <SectionHeading>Geração</SectionHeading>
            <StyledSelect
              value={filters.generation?.toString() ?? ""}
              onChange={(v) =>
                onUpdate({ generation: v ? parseInt(v, 10) : null })
              }
            >
              <option value="">Todas as gerações</option>
              {Array.from({ length: 9 }, (_, i) => i + 1).map((g) => (
                <option key={g} value={g}>
                  Geração {g}
                </option>
              ))}
            </StyledSelect>
          </div>

          {/* Biome filter */}
          <div>
            <SectionHeading>Bioma</SectionHeading>
            <BiomeCombobox
              value={filters.biome}
              onChange={(v) => onUpdate({ biome: v })}
              biomeOptions={biomeOptions}
            />
          </div>

          {/* Bucket filter */}
          <div>
            <SectionHeading>Raridade</SectionHeading>
            <BucketToggles
              selected={filters.buckets}
              onToggle={onToggleBucket}
            />
          </div>

          {/* Context filter */}
          <div>
            <SectionHeading>Contexto de Spawn</SectionHeading>
            <ContextCheckboxes
              selected={filters.contexts}
              onToggle={onToggleContext}
            />
          </div>

          {/* Weather filter */}
          <div>
            <SectionHeading>Clima de Spawn</SectionHeading>
            <div className="grid grid-cols-2 gap-1.5">
              {(["any", ...WEATHER_OPTIONS] as const).map((w) => {
                const isActive =
                  w === "any" ? !filters.weather : filters.weather === w;
                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() =>
                      onUpdate({ weather: w === "any" ? null : w as SpawnWeather })
                    }
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs",
                      "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      isActive
                        ? "bg-primary/15 border-primary/50 text-primary"
                        : "bg-transparent border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                    )}
                    aria-pressed={isActive}
                  >
                    {WEATHER_ICONS[w]}
                    {WEATHER_LABELS[w]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer clear button */}
        {activeFilterCount > 0 && (
          <div className="border-t border-border px-4 py-3 shrink-0">
            <button
              type="button"
              onClick={onClear}
              className={cn(
                "w-full py-2 px-4 rounded-lg text-sm font-medium",
                "border border-destructive/30 bg-destructive/10 text-destructive",
                "hover:bg-destructive/20 transition-colors duration-150"
              )}
            >
              Limpar {activeFilterCount} filtro{activeFilterCount !== 1 ? "s" : ""}
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
