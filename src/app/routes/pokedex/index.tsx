import { useRef, useState, useMemo, useEffect, useCallback, memo } from "react";
import { Link } from "react-router";
import { RouteErrorBoundary } from "~/components/layout/route-error-boundary";
import { useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type Updater,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  AlertTriangle,
  RefreshCw,
  BookOpen,
  SlidersHorizontal,
  X,
  SearchX,
} from "lucide-react";
import type { PokemonType } from "~/types/pokemon";
import { TypeBadge } from "~/components/pokemon/type-badge";
import { normalizePokemonName, cn } from "~/lib/utils";
import {
  usePokedexFilters,
  applyPokedexFilters,
  type PokedexFilters,
} from "~/features/pokedex/use-pokedex-filters";
import { FilterSheet } from "~/features/pokedex/filter-sheet";
import {
  SPAWN_BUCKET_DISPLAY_NAMES,
  SPAWN_CONTEXT_DISPLAY_NAMES,
} from "~/lib/constants";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";

// ── Types ────────────────────────────────────────────────────────────

interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

interface PokemonListItem {
  id: string;
  dexNumber: number;
  name: string;
  displayName: string;
  types: PokemonType[];
  baseStats: BaseStats | null;
  generation: number;
  primaryBucket: string | null;
  primaryBiomes: string[] | null;
  primaryContext: string | null;
  primaryWeather: string | null;
  bst: number;
}

interface RawPokemonListItem {
  id: string;
  dexNumber: number;
  name: string;
  displayName: string;
  types: PokemonType[];
  baseStats: BaseStats | null;
  generation: number;
  primaryBucket: string | null;
  primaryBiomes: string[] | null;
  primaryContext: string | null;
  primaryWeather: string | null;
}

// ── Helpers ──────────────────────────────────────────────────────────

function getSpriteUrl(name: string): string {
  return `https://play.pokemonshowdown.com/sprites/dex/${normalizePokemonName(name)}.png`;
}

export function formatBiome(biome: string): string {
  const name = biome.replace(/^[^:]+:/, "");
  return name
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const BUCKET_CONFIG: Record<string, { label: string; className: string }> = {
  common: {
    label: "Common",
    className: "bg-muted/50 text-muted-foreground border-border/50",
  },
  uncommon: {
    label: "Uncommon",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  },
  rare: {
    label: "Rare",
    className: "bg-sky-500/10 text-sky-400 border-sky-500/25",
  },
  "ultra-rare": {
    label: "Ultra Rare",
    className: "bg-primary/10 text-primary border-primary/25",
  },
};

function BucketBadge({ bucket }: { bucket: string | null }) {
  if (!bucket)
    return <span className="text-muted-foreground text-sm">—</span>;
  const config = BUCKET_CONFIG[bucket] ?? BUCKET_CONFIG["common"];
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded",
        config!.className
      )}
    >
      {config!.label}
    </Badge>
  );
}

function SortIcon({ state }: { state: "asc" | "desc" | false }) {
  if (state === "asc")
    return <ChevronUp size={11} className="ml-1 inline text-primary" />;
  if (state === "desc")
    return <ChevronDown size={11} className="ml-1 inline text-primary" />;
  return (
    <ChevronsUpDown
      size={11}
      className="ml-1 inline text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors"
    />
  );
}

// ── Active filter chip ────────────────────────────────────────────────

function FilterChip({
  onRemove,
  children,
}: {
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <Badge
      variant="outline"
      className="gap-1 pl-1 pr-1 py-0.5 rounded-full border-primary/25 bg-primary/8 text-foreground shrink-0"
    >
      {children}
      <button
        type="button"
        onClick={onRemove}
        className="flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        aria-label="Remover filtro"
      >
        <X size={9} strokeWidth={2.5} />
      </button>
    </Badge>
  );
}

function ActiveFiltersStrip({
  filters,
  onUpdate,
  onClearAll,
}: {
  filters: PokedexFilters;
  onUpdate: (patch: Partial<PokedexFilters>) => void;
  onClearAll: () => void;
}) {
  const chips: React.ReactNode[] = [];

  filters.types.forEach((type) => {
    chips.push(
      <FilterChip
        key={`type-${type}`}
        onRemove={() =>
          onUpdate({ types: filters.types.filter((t) => t !== type) })
        }
      >
        <TypeBadge type={type} size="sm" className="text-[9px] min-w-0 px-1.5 py-0" />
      </FilterChip>
    );
  });

  if (filters.generation !== null) {
    chips.push(
      <FilterChip key="gen" onRemove={() => onUpdate({ generation: null })}>
        <span className="px-1 text-xs text-foreground/80">Gen {filters.generation}</span>
      </FilterChip>
    );
  }

  if (filters.biome) {
    chips.push(
      <FilterChip key="biome" onRemove={() => onUpdate({ biome: "" })}>
        <span className="px-1 text-xs text-foreground/80 max-w-[120px] truncate">
          {formatBiome(filters.biome)}
        </span>
      </FilterChip>
    );
  }

  filters.buckets.forEach((bucket) => {
    chips.push(
      <FilterChip
        key={`bucket-${bucket}`}
        onRemove={() => onUpdate({ buckets: filters.buckets.filter((b) => b !== bucket) })}
      >
        <span className="px-1 text-xs text-foreground/80">{SPAWN_BUCKET_DISPLAY_NAMES[bucket]}</span>
      </FilterChip>
    );
  });

  filters.contexts.forEach((ctx) => {
    chips.push(
      <FilterChip
        key={`ctx-${ctx}`}
        onRemove={() => onUpdate({ contexts: filters.contexts.filter((c) => c !== ctx) })}
      >
        <span className="px-1 text-xs text-foreground/80">{SPAWN_CONTEXT_DISPLAY_NAMES[ctx]}</span>
      </FilterChip>
    );
  });

  if (filters.weather) {
    const WEATHER_PT: Record<string, string> = { clear: "Limpo", rain: "Chuva", thunderstorm: "Tempestade" };
    chips.push(
      <FilterChip key="weather" onRemove={() => onUpdate({ weather: null })}>
        <span className="px-1 text-xs text-foreground/80">{WEATHER_PT[filters.weather] ?? filters.weather}</span>
      </FilterChip>
    );
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border/40 bg-card/30 shrink-0 overflow-x-auto">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 shrink-0">
        Filtros:
      </span>
      <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto">{chips}</div>
      <Button variant="ghost" size="xs" onClick={onClearAll} className="ml-auto shrink-0 text-muted-foreground">
        Limpar todos
      </Button>
    </div>
  );
}

// ── Loading skeleton ─────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border shrink-0">
        <div className="h-9 w-9 rounded-xl bg-muted/50 animate-pulse" />
        <div>
          <div className="h-6 w-32 rounded-md bg-muted/50 animate-pulse mb-1.5" />
          <div className="h-3.5 w-20 rounded bg-muted/35 animate-pulse" />
        </div>
      </div>
      <div className="overflow-hidden flex-1">
        <div className="flex items-center h-10 px-3 border-b border-border bg-muted/10 gap-4">
          {[44, 68, 36, 36, 48, 62, 40].map((w, i) => (
            <div key={i} style={{ width: w }} className="h-2.5 rounded bg-muted/40 animate-pulse shrink-0" />
          ))}
        </div>
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="flex items-center h-[52px] px-3 border-b border-border/40 gap-4">
            <div className="w-8 h-8 rounded bg-muted/30 animate-pulse shrink-0" style={{ animationDelay: `${i * 25}ms` }} />
            <div className="w-14 h-3 rounded bg-muted/25 animate-pulse shrink-0" style={{ animationDelay: `${i * 25}ms` }} />
            <div className="w-28 h-3.5 rounded bg-muted/35 animate-pulse shrink-0" style={{ animationDelay: `${i * 25}ms` }} />
            <div className="flex gap-1.5 shrink-0">
              <div className="w-14 h-5 rounded-full bg-muted/25 animate-pulse" style={{ animationDelay: `${i * 25 + 50}ms` }} />
            </div>
            <div className="w-20 h-3 rounded bg-muted/20 animate-pulse shrink-0" style={{ animationDelay: `${i * 25}ms` }} />
            <div className="w-16 h-5 rounded bg-muted/25 animate-pulse shrink-0" style={{ animationDelay: `${i * 25}ms` }} />
            <div className="w-9 h-3 rounded bg-muted/20 animate-pulse shrink-0" style={{ animationDelay: `${i * 25}ms` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Error state ──────────────────────────────────────────────────────

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 p-8">
      <Card className="border-destructive/20 bg-destructive/5 max-w-sm py-8">
        <CardContent className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/20">
            <AlertTriangle size={24} className="text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground mb-1">Falha ao carregar Pokedex</h2>
            <p className="text-sm text-muted-foreground">
              Nao foi possivel conectar a API. Verifique se o servidor esta rodando em{" "}
              <code className="text-primary text-xs font-mono">localhost:3001</code>
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onRetry} className="border-destructive/30 text-destructive hover:bg-destructive/10">
            <RefreshCw size={14} />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Empty states ─────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-20 text-center px-6">
      <Card className="border-dashed max-w-sm py-8">
        <CardContent className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/30 border border-border">
            <BookOpen size={24} className="text-muted-foreground/50" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">Pokedex vazia</h3>
            <p className="text-sm text-muted-foreground">
              Nenhum Pokemon encontrado. Execute{" "}
              <code className="text-primary text-xs font-mono">npm run extract && npm run seed</code>{" "}
              para popular o banco de dados.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FilterEmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-20 text-center px-6">
      <Card className="border-dashed max-w-sm py-8">
        <CardContent className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/30 border border-border">
            <SearchX size={24} className="text-muted-foreground/50" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">Nenhum Pokemon encontrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Nenhum Pokemon encontrado com esses filtros. Tente ajustar os criterios de busca.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onClear}>
            <X size={14} />
            Limpar filtros
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Mobile card ──────────────────────────────────────────────────────

const MobileCard = memo(function MobileCard({ pokemon }: { pokemon: PokemonListItem }) {
  return (
    <Link
      to={`/pokedex/${pokemon.id}`}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl",
        "border border-border/50 bg-card/60",
        "hover:bg-card hover:border-primary/20",
        "hover:shadow-[0_0_16px_-4px_hsl(var(--primary)/0.15)]",
        "transition-all duration-200"
      )}
    >
      <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-lg bg-muted/30">
        <img
          src={getSpriteUrl(pokemon.name)}
          alt={pokemon.displayName}
          loading="lazy"
          width={40}
          height={40}
          className="w-10 h-10 object-contain opacity-0 blur-sm transition-[opacity,filter] duration-300"
          onLoad={(e) => {
            const img = e.target as HTMLImageElement;
            img.classList.remove("opacity-0", "blur-sm");
          }}
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            if (!img.dataset.fallback) {
              img.dataset.fallback = "1";
              img.src = `https://play.pokemonshowdown.com/sprites/gen5/${normalizePokemonName(pokemon.name)}.png`;
            } else {
              img.style.opacity = "0";
              img.classList.remove("blur-sm");
            }
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="font-mono text-[11px] text-muted-foreground shrink-0">
            #{String(pokemon.dexNumber).padStart(4, "0")}
          </span>
          <span className="font-bold text-sm text-foreground truncate">{pokemon.displayName}</span>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {pokemon.types.map((t) => (
            <TypeBadge key={t} type={t} size="sm" />
          ))}
        </div>
      </div>
      <div className="shrink-0 text-right flex flex-col items-end gap-1">
        <BucketBadge bucket={pokemon.primaryBucket} />
        {pokemon.bst > 0 && (
          <span className="text-[11px] text-muted-foreground font-mono">{pokemon.bst}</span>
        )}
      </div>
    </Link>
  );
});

// ── useIsMobile ──────────────────────────────────────────────────────

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

// ── Column definitions ───────────────────────────────────────────────

const columnHelper = createColumnHelper<PokemonListItem>();

const columns = [
  columnHelper.display({
    id: "sprite",
    header: "",
    size: 52,
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <img
          src={getSpriteUrl(row.original.name)}
          alt={row.original.displayName}
          loading="lazy"
          width={32}
          height={32}
          className="w-8 h-8 object-contain drop-shadow-sm opacity-0 blur-sm transition-[opacity,filter] duration-300"
          onLoad={(e) => {
            const img = e.target as HTMLImageElement;
            img.classList.remove("opacity-0", "blur-sm");
          }}
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            if (!img.dataset.fallback) {
              img.dataset.fallback = "1";
              img.src = `https://play.pokemonshowdown.com/sprites/gen5/${normalizePokemonName(row.original.name)}.png`;
            } else {
              img.style.opacity = "0.15";
              img.classList.remove("blur-sm");
            }
          }}
        />
      </div>
    ),
  }),
  columnHelper.accessor("dexNumber", {
    header: "Dex#",
    size: 80,
    sortingFn: "basic",
    cell: (info) => (
      <span className="font-mono text-xs text-muted-foreground tabular-nums">
        #{String(info.getValue()).padStart(4, "0")}
      </span>
    ),
  }),
  columnHelper.accessor("displayName", {
    header: "Nome",
    size: 180,
    sortingFn: "alphanumeric",
    cell: ({ row }) => (
      <Link
        to={`/pokedex/${row.original.id}`}
        className="font-semibold text-sm text-foreground hover:text-primary transition-colors duration-150"
      >
        {row.original.displayName}
      </Link>
    ),
  }),
  columnHelper.display({
    id: "types",
    header: "Tipos",
    size: 144,
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        {row.original.types.map((t) => (
          <TypeBadge key={t} type={t} size="sm" />
        ))}
      </div>
    ),
  }),
  columnHelper.display({
    id: "biome",
    header: "Bioma",
    size: 148,
    enableSorting: false,
    cell: ({ row }) => {
      const biomes = row.original.primaryBiomes;
      if (!biomes || biomes.length === 0)
        return <span className="text-muted-foreground/50 text-sm select-none">—</span>;
      return (
        <span className="text-[13px] text-muted-foreground truncate block max-w-[136px]" title={biomes[0]}>
          {formatBiome(biomes[0]!)}
        </span>
      );
    },
  }),
  columnHelper.display({
    id: "bucket",
    header: "Raridade",
    size: 108,
    enableSorting: false,
    cell: ({ row }) => <BucketBadge bucket={row.original.primaryBucket} />,
  }),
  columnHelper.accessor("bst", {
    header: "BST",
    size: 72,
    sortingFn: "basic",
    cell: (info) => {
      const val = info.getValue();
      return val > 0 ? (
        <span className="font-mono text-sm text-foreground/65 tabular-nums">{val}</span>
      ) : (
        <span className="text-muted-foreground/40 select-none">—</span>
      );
    },
  }),
];

// ── Main component ───────────────────────────────────────────────────

export default function Pokedex() {
  const parentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [filterOpen, setFilterOpen] = useState(false);

  const {
    filters, activeFilterCount, hasFilters,
    update, toggleType, toggleBucket, toggleContext, clearFilters,
  } = usePokedexFilters();

  const sorting: SortingState = useMemo(
    () => [{ id: filters.sort, desc: filters.dir === "desc" }],
    [filters.sort, filters.dir]
  );

  const handleSortingChange = useCallback(
    (updater: Updater<SortingState>) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      if (next.length === 0) {
        update({ sort: "dexNumber", dir: "asc" });
      } else {
        update({ sort: next[0]!.id, dir: next[0]!.desc ? "desc" : "asc" });
      }
      parentRef.current?.scrollTo({ top: 0 });
    },
    [sorting, update]
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["pokemon-list"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3001/api/pokemon?limit=1000&page=1");
      if (!res.ok) throw new Error("Failed to fetch Pokemon");
      const json = (await res.json()) as { data: RawPokemonListItem[] };
      return json.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const processedData = useMemo((): PokemonListItem[] => {
    if (!data) return [];
    return data.map((item) => {
      const bs = item.baseStats;
      const bst = bs ? bs.hp + bs.attack + bs.defense + bs.specialAttack + bs.specialDefense + bs.speed : 0;
      return { ...item, bst };
    });
  }, [data]);

  const filteredData = useMemo(() => applyPokedexFilters(processedData, filters), [processedData, filters]);

  const biomeOptions = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const p of processedData) {
      if (p.primaryBiomes) {
        for (const b of p.primaryBiomes) {
          const formatted = formatBiome(b);
          if (!seen.has(formatted)) { seen.add(formatted); result.push(formatted); }
        }
      }
    }
    return result.sort();
  }, [processedData]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSortingRemoval: false,
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (isMobile ? 80 : 52),
    overscan: 14,
  });

  if (isLoading) return <LoadingSkeleton />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  const useVirt = rows.length > 50;
  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalVirtualSize = rowVirtualizer.getTotalSize();
  const paddingTop = useVirt ? (virtualItems[0]?.start ?? 0) : 0;
  const lastItem = virtualItems[virtualItems.length - 1];
  const paddingBottom = useVirt ? (lastItem ? totalVirtualSize - lastItem.end : 0) : 0;

  const isDataEmpty = processedData.length === 0;
  const isFilteredEmpty = filteredData.length === 0 && !isDataEmpty;

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Page header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 border border-primary/20 shadow-[0_0_10px_-2px_hsl(var(--primary)/0.15)]">
              <BookOpen size={16} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-foreground leading-tight tracking-tight">Pokedex</h1>
              <p className="text-xs text-muted-foreground leading-tight font-medium">
                {isDataEmpty
                  ? "Nenhum Pokemon"
                  : hasFilters
                  ? `${filteredData.length} de ${processedData.length} Pokemon`
                  : `${processedData.length} Pokemon`}
              </p>
            </div>
          </div>

          <Button
            variant={activeFilterCount > 0 ? "outline" : "outline"}
            size="sm"
            onClick={() => setFilterOpen(true)}
            className={cn(
              activeFilterCount > 0 && "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
            )}
            aria-label={`Filtros${activeFilterCount > 0 ? ` (${activeFilterCount} ativos)` : ""}`}
          >
            <SlidersHorizontal size={15} />
            <span className="hidden sm:inline">Filtros</span>
            {activeFilterCount > 0 && (
              <Badge className="h-5 min-w-5 px-1 text-[10px] font-bold">{activeFilterCount}</Badge>
            )}
          </Button>
        </div>

        {hasFilters && <ActiveFiltersStrip filters={filters} onUpdate={update} onClearAll={clearFilters} />}

        {isDataEmpty ? (
          <EmptyState />
        ) : isFilteredEmpty ? (
          <FilterEmptyState onClear={clearFilters} />
        ) : (
          <div ref={parentRef} className="flex-1 overflow-auto">
            {!isMobile ? (
              <table className="w-full border-separate border-spacing-0 min-w-[700px]">
                <thead className="sticky top-0 z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          style={{ width: header.getSize() }}
                          className={cn(
                            "h-10 px-3 text-left",
                            "text-[11px] font-bold uppercase tracking-widest text-muted-foreground",
                            "border-b border-border/60",
                            "bg-background/95 backdrop-blur-md",
                            header.column.getCanSort() &&
                              "cursor-pointer select-none group hover:text-foreground transition-colors duration-150"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <span className="inline-flex items-center">
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && <SortIcon state={header.column.getIsSorted()} />}
                          </span>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>

                <tbody>
                  {paddingTop > 0 && (
                    <tr aria-hidden><td colSpan={columns.length} style={{ height: `${paddingTop}px`, padding: 0, border: 0 }} /></tr>
                  )}

                  {(useVirt
                    ? virtualItems.map((vr) => ({ index: vr.index, id: rows[vr.index]!.id, virtualRow: vr }))
                    : rows.map((r, i) => ({ index: i, id: r.id, virtualRow: null }))
                  ).map(({ index, id, virtualRow }) => {
                    const row = rows[index]!;
                    return (
                      <tr
                        key={id}
                        data-index={index}
                        ref={virtualRow ? rowVirtualizer.measureElement : undefined}
                        className="group border-b border-border/30 hover:bg-primary/4 transition-colors duration-100"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-3 h-[52px] align-middle">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    );
                  })}

                  {paddingBottom > 0 && (
                    <tr aria-hidden><td colSpan={columns.length} style={{ height: `${paddingBottom}px`, padding: 0, border: 0 }} /></tr>
                  )}
                </tbody>
              </table>
            ) : useVirt ? (
              <div style={{ height: `${totalVirtualSize + 24}px`, position: "relative" }}>
                {virtualItems.map((virtualRow) => {
                  const row = rows[virtualRow.index]!;
                  return (
                    <div
                      key={row.id}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: "12px",
                        right: "12px",
                        transform: `translateY(${virtualRow.start + 12}px)`,
                        paddingBottom: "8px",
                      }}
                    >
                      <MobileCard pokemon={row.original} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-2 p-3">
                {rows.map((row) => (
                  <MobileCard key={row.id} pokemon={row.original} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <FilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filters={filters}
        onToggleType={toggleType}
        onToggleBucket={toggleBucket}
        onToggleContext={toggleContext}
        onUpdate={update}
        onClear={clearFilters}
        activeFilterCount={activeFilterCount}
        biomeOptions={biomeOptions}
      />
    </>
  );
}

export function ErrorBoundary() {
  return <RouteErrorBoundary routeName="Pokedex" />;
}
