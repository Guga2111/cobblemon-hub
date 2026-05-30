import { useState, useEffect, useCallback } from "react";
import { RouteErrorBoundary } from "~/components/layout/route-error-boundary";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type Updater,
} from "@tanstack/react-table";
import {
  Search,
  Package,
  Beaker,
  Leaf,
  Shield,
  Star,
  Cookie,
  HelpCircle,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  AlertTriangle,
  RefreshCw,
  X,
  Archive,
  Loader2,
} from "lucide-react";
import { TypeBadge } from "~/components/pokemon/type-badge";
import { cn } from "~/lib/utils";
import { getPokemonSprite } from "~/lib/sprites";
import type { ItemCategory } from "~/types/item";
import type { PokemonType } from "~/types/pokemon";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";

// ── Types ─────────────────────────────────────────────────────────────

interface ItemData {
  id: string;
  name: string;
  displayName: string;
  category: ItemCategory;
  description: string;
  sprite: string | null;
  droppedBy: string[];
}

// ── Constants ─────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  ItemCategory,
  {
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    className: string;
  }
> = {
  ball: { label: "Poke Ball", icon: Archive, className: "bg-cyan-500/12 text-cyan-300 border-cyan-400/30" },
  medicine: { label: "Medicine", icon: Beaker, className: "bg-rose-500/12 text-rose-300 border-rose-400/30" },
  berry: { label: "Berry", icon: Leaf, className: "bg-emerald-500/12 text-emerald-300 border-emerald-400/30" },
  "held-item": { label: "Held Item", icon: Shield, className: "bg-violet-500/12 text-violet-300 border-violet-400/30" },
  "evolution-item": { label: "Evolution", icon: Star, className: "bg-primary/12 text-primary border-primary/30" },
  ingredient: { label: "Ingredient", icon: Cookie, className: "bg-orange-500/12 text-orange-300 border-orange-400/30" },
  other: { label: "Other", icon: HelpCircle, className: "bg-muted/30 text-muted-foreground border-border/40" },
};

const CATEGORIES: ItemCategory[] = ["ball", "medicine", "berry", "held-item", "evolution-item", "ingredient", "other"];

// ── Helpers ───────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Sub-components ────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: ItemCategory }) {
  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-widest gap-1 px-1.5 py-0.5 rounded", config.className)}>
      <Icon size={9} />
      {config.label}
    </Badge>
  );
}

function ItemSprite({ sprite, name }: { sprite: string | null; name: string }) {
  const [error, setError] = useState(false);
  if (!sprite || error) {
    return (
      <div className="w-8 h-8 rounded bg-muted/30 border border-border/40 flex items-center justify-center shrink-0">
        <Package size={14} className="text-muted-foreground/40" />
      </div>
    );
  }
  return (
    <img
      src={sprite}
      alt={name}
      width={32}
      height={32}
      loading="lazy"
      className="w-8 h-8 object-contain shrink-0"
      style={{ imageRendering: "pixelated", filter: "drop-shadow(0 0 5px hsl(var(--primary) / 0.25))" }}
      onError={() => setError(true)}
    />
  );
}

function SortIcon({ state }: { state: "asc" | "desc" | false }) {
  if (state === "asc") return <ChevronUp size={11} className="ml-1 inline text-primary" />;
  if (state === "desc") return <ChevronDown size={11} className="ml-1 inline text-primary" />;
  return <ChevronsUpDown size={11} className="ml-1 inline text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors" />;
}

function TableSkeleton() {
  return (
    <Card className="border-border/40 bg-card/30 py-0 overflow-hidden">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr>
            {["w-10", "w-40", "w-24", "w-36", "flex-1"].map((w, i) => (
              <th key={i} className="px-3 py-3 border-b border-border/40">
                <div className={`h-3 ${w} rounded bg-muted/30 animate-pulse`} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, i) => (
            <tr key={i} className="border-b border-border/20 last:border-0">
              <td className="px-3 py-3"><div className="w-8 h-8 rounded bg-muted/20 animate-pulse" style={{ animationDelay: `${i * 55}ms` }} /></td>
              <td className="px-3 py-3"><div className="h-3 w-28 rounded bg-muted/20 animate-pulse" style={{ animationDelay: `${i * 55}ms` }} /></td>
              <td className="px-3 py-3"><div className="h-4 w-16 rounded bg-muted/20 animate-pulse" style={{ animationDelay: `${i * 55}ms` }} /></td>
              <td className="px-3 py-3"><div className="h-3 w-24 rounded bg-muted/20 animate-pulse" style={{ animationDelay: `${i * 55}ms` }} /></td>
              <td className="px-3 py-3"><div className="h-3 w-48 rounded bg-muted/20 animate-pulse" style={{ animationDelay: `${i * 55}ms` }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="border-destructive/20 bg-destructive/5 py-10">
      <CardContent className="flex flex-col items-center gap-3 text-center">
        <AlertTriangle size={24} className="text-destructive" />
        <p className="text-sm text-muted-foreground">Erro ao carregar itens. Tente novamente.</p>
        <Button variant="outline" size="sm" onClick={onRetry} className="border-destructive/30 text-destructive">
          <RefreshCw size={11} /> Tentar novamente
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Item Detail Dialog ────────────────────────────────────────────────

interface PokemonDropInfo {
  id: string;
  name: string;
  displayName: string;
  types: [PokemonType] | [PokemonType, PokemonType];
  dexNumber: number;
}


function ItemDetailDialog({ item, onClose }: { item: ItemData | null; onClose: () => void }) {
  const navigate = useNavigate();
  const { data: pokemonList = [], isLoading } = useQuery({
    queryKey: ["item-drops", item?.id],
    queryFn: async () => {
      if (!item || item.droppedBy.length === 0) return [];
      const results = await Promise.all(
        item.droppedBy.map(async (id) => {
          const res = await fetch(`http://localhost:3001/api/pokemon/${id}`);
          if (!res.ok) return null;
          const json = (await res.json()) as { data: PokemonDropInfo & Record<string, unknown> };
          return { id: json.data.id, name: json.data.name, displayName: json.data.displayName, types: json.data.types, dexNumber: json.data.dexNumber } as PokemonDropInfo;
        })
      );
      return results.filter((r): r is PokemonDropInfo => r !== null).sort((a, b) => a.dexNumber - b.dexNumber);
    },
    enabled: !!item && item.droppedBy.length > 0,
    staleTime: 60_000,
  });

  return (
    <DialogPrimitive.Root open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-[min(480px,calc(100vw-2rem))] max-h-[80vh] overflow-hidden rounded-xl",
            "border border-border/50 bg-background shadow-2xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
        >
          {item && (
            <div className="flex flex-col">
              <div className="flex items-center gap-3 border-b border-border/40 px-5 py-4">
                <ItemSprite sprite={item.sprite} name={item.displayName} />
                <div className="flex-1 min-w-0">
                  <DialogPrimitive.Title className="text-base font-bold text-foreground truncate">
                    {item.displayName}
                  </DialogPrimitive.Title>
                  <div className="mt-0.5"><CategoryBadge category={item.category} /></div>
                </div>
                <DialogPrimitive.Close asChild>
                  <Button variant="ghost" size="icon-xs" className="text-muted-foreground/40 hover:text-foreground">
                    <X size={16} />
                  </Button>
                </DialogPrimitive.Close>
              </div>

              {item.description && (
                <div className="border-b border-border/30 px-5 py-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              )}

              <div className="px-5 pt-3 pb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground/50">Dropped by</span>
              </div>

              <div className="overflow-y-auto px-3 pb-4" style={{ maxHeight: "360px" }}>
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground/40">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-xs">Carregando...</span>
                  </div>
                ) : pokemonList.length === 0 ? (
                  <p className="py-8 text-center text-xs text-muted-foreground/40 italic">Nenhum Pokemon encontrado</p>
                ) : (
                  <div className="flex flex-col gap-0.5">
                    {pokemonList.map((poke) => (
                      <button
                        key={poke.id}
                        type="button"
                        onClick={() => { onClose(); navigate(`/pokedex/${poke.id}`); }}
                        className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-primary/8 transition-colors text-left group"
                      >
                        <img src={getPokemonSprite(poke.dexNumber)} alt={poke.displayName} className="w-9 h-9 object-contain shrink-0" loading="lazy" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors block truncate">{poke.displayName}</span>
                          <span className="text-[10px] font-mono text-muted-foreground/50">#{String(poke.dexNumber).padStart(3, "0")}</span>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {poke.types.map((t) => <TypeBadge key={t} type={t} size="sm" />)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// ── Column definitions ────────────────────────────────────────────────

const colHelper = createColumnHelper<ItemData>();

const COLUMNS = [
  colHelper.display({
    id: "icon",
    header: "",
    cell: ({ row }) => <ItemSprite sprite={row.original.sprite} name={row.original.displayName} />,
    size: 48,
    enableSorting: false,
  }),
  colHelper.accessor("displayName", {
    header: "Nome",
    cell: ({ getValue }) => <span className="font-semibold text-foreground text-sm">{getValue()}</span>,
    size: 200,
  }),
  colHelper.accessor("category", {
    header: "Categoria",
    cell: ({ getValue }) => <CategoryBadge category={getValue()} />,
    size: 140,
    enableSorting: false,
  }),
  colHelper.accessor("droppedBy", {
    id: "location",
    header: "Localizacao",
    cell: ({ getValue }) => {
      const drops = getValue();
      if (drops.length === 0) return <span className="text-xs text-muted-foreground/40 italic">—</span>;
      return (
        <span className="text-xs text-muted-foreground">
          Dropped by <span className="text-foreground font-bold">{drops.length}</span> Pokemon
        </span>
      );
    },
    size: 160,
    enableSorting: false,
  }),
  colHelper.accessor("description", {
    header: "Uso / Efeito",
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
        {getValue() || <span className="italic text-muted-foreground/40">—</span>}
      </span>
    ),
    enableSorting: false,
  }),
];

// ── Page component ────────────────────────────────────────────────────

export default function Items() {
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | "">("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "displayName", desc: false }]);
  const [selectedItem, setSelectedItem] = useState<ItemData | null>(null);

  const debouncedSearch = useDebounce(searchInput, 200);

  const queryParams = new URLSearchParams();
  if (debouncedSearch) queryParams.set("q", debouncedSearch);
  if (selectedCategory) queryParams.set("category", selectedCategory);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["items", debouncedSearch, selectedCategory],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3001/api/items?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch items");
      const json = (await res.json()) as { data: ItemData[] };
      return json.data;
    },
  });

  const items = data ?? [];

  const handleSortingChange = useCallback(
    (updater: Updater<SortingState>) => {
      setSorting((prev) => typeof updater === "function" ? updater(prev) : updater);
    },
    []
  );

  const table = useReactTable({
    data: items,
    columns: COLUMNS,
    state: { sorting },
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const hasActiveFilters = searchInput !== "" || selectedCategory !== "";

  function clearFilters() {
    setSearchInput("");
    setSelectedCategory("");
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] px-4 py-6 md:px-6 lg:px-8">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 border border-primary/20 shadow-[0_0_10px_-2px_hsl(var(--primary)/0.15)]">
          <Package size={16} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-foreground leading-tight tracking-tight">Item Codex</h1>
          {!isLoading && !isError && (
            <p className="text-xs text-muted-foreground font-medium">
              {items.length} {items.length === 1 ? "item" : "itens"} catalogados
            </p>
          )}
        </div>
      </div>

      {/* Controls row */}
      <div className="relative mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/35 pointer-events-none" />
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar item..."
            className="pl-8 pr-8 bg-card/60"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              aria-label="Limpar busca"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground/80 transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="relative shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as ItemCategory | "")}
            className={cn(
              "appearance-none rounded-md border border-input bg-card/60",
              "pl-3 pr-8 py-2 text-sm outline-none transition-all duration-200 cursor-pointer h-9",
              "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
              selectedCategory ? "border-primary/40 text-foreground" : "text-muted-foreground"
            )}
          >
            <option value="">Todas as categorias</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{CATEGORY_CONFIG[cat].label}</option>
            ))}
          </select>
          <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
        </div>

        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters} className="shrink-0">
            <X size={11} /> Limpar
          </Button>
        )}
      </div>

      {/* Content area */}
      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <Card className="border-dashed py-16">
          <CardContent className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border/40 bg-muted/20">
              <Package size={22} className="text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground/70">
                {searchInput
                  ? `Nenhum item encontrado para "${searchInput}"`
                  : selectedCategory
                    ? `Nenhum item na categoria "${CATEGORY_CONFIG[selectedCategory].label}"`
                    : "Nenhum item encontrado"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground/50">Tente ajustar os filtros ou limpar a busca</p>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X size={11} /> Limpar filtros
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/40 bg-card/30 py-0 overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-muted/10">
                  {table.getHeaderGroups()[0]?.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sortState = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        className={cn(
                          "px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/55",
                          "border-b border-border/40",
                          canSort && "cursor-pointer select-none group hover:text-muted-foreground/90 transition-colors"
                        )}
                        style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && <SortIcon state={sortState} />}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row, i) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedItem(row.original)}
                    className={cn(
                      "transition-colors duration-100 border-b border-border/20 last:border-0 cursor-pointer",
                      "hover:bg-primary/5",
                      i % 2 === 0 ? "bg-transparent" : "bg-muted/5"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2.5 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-border/30 bg-muted/5 px-4 py-2">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/35 font-mono font-bold">
              {items.length} {items.length === 1 ? "item" : "itens"}
            </span>
          </div>
        </Card>
      )}

      <ItemDetailDialog item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}

export function ErrorBoundary() {
  return <RouteErrorBoundary routeName="Wiki de Itens" />;
}
