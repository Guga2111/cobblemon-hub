import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { cn } from "~/lib/utils";
import type { ItemCategory } from "~/types/item";

// ── Google Fonts ──────────────────────────────────────────────────────

export function links() {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous" as const,
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Oxanium:wght@300;400;500;600;700&display=swap",
    },
  ];
}

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
  ball: {
    label: "Poké Ball",
    icon: Archive,
    className: "bg-cyan-500/12 text-cyan-300 border-cyan-400/30",
  },
  medicine: {
    label: "Medicine",
    icon: Beaker,
    className: "bg-rose-500/12 text-rose-300 border-rose-400/30",
  },
  berry: {
    label: "Berry",
    icon: Leaf,
    className: "bg-emerald-500/12 text-emerald-300 border-emerald-400/30",
  },
  "held-item": {
    label: "Held Item",
    icon: Shield,
    className: "bg-violet-500/12 text-violet-300 border-violet-400/30",
  },
  "evolution-item": {
    label: "Evolution",
    icon: Star,
    className: "bg-amber-400/12 text-amber-300 border-amber-400/30",
  },
  ingredient: {
    label: "Ingredient",
    icon: Cookie,
    className: "bg-orange-500/12 text-orange-300 border-orange-400/30",
  },
  other: {
    label: "Other",
    icon: HelpCircle,
    className: "bg-zinc-600/20 text-zinc-400 border-zinc-500/30",
  },
};

const CATEGORIES: ItemCategory[] = [
  "ball",
  "medicine",
  "berry",
  "held-item",
  "evolution-item",
  "ingredient",
  "other",
];

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
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5",
        "text-[10px] font-bold uppercase tracking-widest whitespace-nowrap",
        config.className
      )}
    >
      <Icon size={9} />
      {config.label}
    </span>
  );
}

function ItemSprite({
  sprite,
  name,
}: {
  sprite: string | null;
  name: string;
}) {
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
      style={{
        imageRendering: "pixelated",
        filter: "drop-shadow(0 0 5px rgba(139,92,246,0.35))",
      }}
      onError={() => setError(true)}
    />
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

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border/40">
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
              <td className="px-3 py-3">
                <div
                  className="w-8 h-8 rounded bg-muted/20 animate-pulse"
                  style={{ animationDelay: `${i * 55}ms` }}
                />
              </td>
              <td className="px-3 py-3">
                <div
                  className="h-3 w-28 rounded bg-muted/20 animate-pulse"
                  style={{ animationDelay: `${i * 55}ms` }}
                />
              </td>
              <td className="px-3 py-3">
                <div
                  className="h-4 w-16 rounded bg-muted/20 animate-pulse"
                  style={{ animationDelay: `${i * 55}ms` }}
                />
              </td>
              <td className="px-3 py-3">
                <div
                  className="h-3 w-24 rounded bg-muted/20 animate-pulse"
                  style={{ animationDelay: `${i * 55}ms` }}
                />
              </td>
              <td className="px-3 py-3">
                <div
                  className="h-3 w-48 rounded bg-muted/20 animate-pulse"
                  style={{ animationDelay: `${i * 55}ms` }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/8 px-6 py-10 text-center">
      <AlertTriangle size={24} className="text-destructive" />
      <p className="text-sm text-muted-foreground">
        Erro ao carregar itens. Tente novamente.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 rounded border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-foreground hover:bg-muted/50 transition-colors"
      >
        <RefreshCw size={11} /> Tentar novamente
      </button>
    </div>
  );
}

// ── Column definitions ────────────────────────────────────────────────

const colHelper = createColumnHelper<ItemData>();

const COLUMNS = [
  colHelper.display({
    id: "icon",
    header: "",
    cell: ({ row }) => (
      <ItemSprite sprite={row.original.sprite} name={row.original.displayName} />
    ),
    size: 48,
    enableSorting: false,
  }),
  colHelper.accessor("displayName", {
    header: "Nome",
    cell: ({ getValue }) => (
      <span
        className="font-medium text-foreground text-sm"
        style={{ fontFamily: "'Oxanium', sans-serif" }}
      >
        {getValue()}
      </span>
    ),
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
    header: "Localização",
    cell: ({ getValue }) => {
      const drops = getValue();
      if (drops.length === 0) {
        return (
          <span className="text-xs text-muted-foreground/40 italic">—</span>
        );
      }
      return (
        <span className="text-xs text-muted-foreground">
          Dropped by{" "}
          <span className="text-foreground font-semibold">{drops.length}</span>{" "}
          Pokémon
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
        {getValue() || (
          <span className="italic text-muted-foreground/40">—</span>
        )}
      </span>
    ),
    enableSorting: false,
  }),
];

// ── Page component ────────────────────────────────────────────────────

export default function Items() {
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | "">(
    ""
  );
  const [sorting, setSorting] = useState<SortingState>([
    { id: "displayName", desc: false },
  ]);

  const debouncedSearch = useDebounce(searchInput, 200);

  const queryParams = new URLSearchParams();
  if (debouncedSearch) queryParams.set("q", debouncedSearch);
  if (selectedCategory) queryParams.set("category", selectedCategory);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["items", debouncedSearch, selectedCategory],
    queryFn: async () => {
      const res = await fetch(
        `http://localhost:3001/api/items?${queryParams.toString()}`
      );
      if (!res.ok) throw new Error("Failed to fetch items");
      const json = (await res.json()) as { data: ItemData[] };
      return json.data;
    },
  });

  const items = data ?? [];

  const handleSortingChange = useCallback(
    (updater: Updater<SortingState>) => {
      setSorting((prev) =>
        typeof updater === "function" ? updater(prev) : updater
      );
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
      {/* Hex grid background texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.022]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'%3E%3Cpath d='M28 66L0 50V16L28 0l28 16v34L28 66zm0 34L0 84V68l28 16 28-16v16L28 100z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: "56px 100px",
        }}
      />

      {/* Page header */}
      <div className="relative mb-8">
        <div className="mb-2 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
          <span className="text-[10px] uppercase tracking-[0.5em] text-primary/50 font-mono">
            Cobblemon Hub
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
        </div>
        <h1
          className="text-center text-3xl font-semibold tracking-wide text-foreground/90"
          style={{ fontFamily: "'Cinzel', Georgia, serif" }}
        >
          Item Codex
        </h1>
        {!isLoading && !isError && (
          <p className="mt-1.5 text-center text-[11px] uppercase tracking-[0.35em] text-muted-foreground/45 font-mono">
            {items.length} {items.length === 1 ? "artefato" : "artefatos"}{" "}
            catalogados
          </p>
        )}
      </div>

      {/* Controls row */}
      <div className="relative mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search input with terminal › prefix */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 text-base font-mono select-none leading-none">
            ›
          </span>
          <Search
            size={13}
            className="absolute left-7 top-1/2 -translate-y-1/2 text-muted-foreground/35 pointer-events-none"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar item..."
            className={cn(
              "w-full rounded-lg border border-border/50 bg-card/40 backdrop-blur-sm",
              "pl-12 pr-8 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/35",
              "outline-none transition-all duration-200",
              "focus:border-primary/45 focus:ring-1 focus:ring-primary/15 focus:bg-card/60"
            )}
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

        {/* Category select */}
        <div className="relative shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(e.target.value as ItemCategory | "")
            }
            className={cn(
              "appearance-none rounded-lg border border-border/50 bg-card/40 backdrop-blur-sm",
              "pl-3 pr-8 py-2.5 text-sm outline-none transition-all duration-200 cursor-pointer",
              "focus:border-primary/45 focus:ring-1 focus:ring-primary/15",
              selectedCategory
                ? "border-primary/40 text-foreground"
                : "text-muted-foreground"
            )}
          >
            <option value="">Todas as categorias</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_CONFIG[cat].label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50"
          />
        </div>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all whitespace-nowrap shrink-0"
          >
            <X size={11} /> Limpar
          </button>
        )}
      </div>

      {/* Content area */}
      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border/40 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border/40 bg-muted/20">
            <Package size={22} className="text-muted-foreground/40" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground/70">
              {searchInput
                ? `Nenhum item encontrado para "${searchInput}"`
                : selectedCategory
                  ? `Nenhum item na categoria "${CATEGORY_CONFIG[selectedCategory].label}"`
                  : "Nenhum item encontrado"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/50">
              Tente ajustar os filtros ou limpar a busca
            </p>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 rounded border border-border/50 bg-muted/20 px-3 py-1.5 text-xs text-foreground hover:bg-muted/40 transition-colors"
            >
              <X size={11} /> Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border/40 bg-card/20 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(var(--card) / 0.9) 0%, hsl(var(--secondary) / 0.5) 100%)",
                  }}
                >
                  {table.getHeaderGroups()[0]?.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sortState = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        className={cn(
                          "px-3 py-3 text-left text-[10px] uppercase tracking-widest text-muted-foreground/55",
                          "border-b border-border/40",
                          canSort &&
                            "cursor-pointer select-none group hover:text-muted-foreground/90 transition-colors"
                        )}
                        style={{
                          width:
                            header.getSize() !== 150
                              ? header.getSize()
                              : undefined,
                        }}
                        onClick={
                          canSort
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
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
                    className={cn(
                      "transition-colors duration-100 border-b border-border/20 last:border-0",
                      "hover:bg-primary/5",
                      i % 2 === 0 ? "bg-transparent" : "bg-white/[0.013]"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-3 py-2.5 align-middle"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer row count */}
          <div className="border-t border-border/30 bg-card/10 px-4 py-2">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/35 font-mono">
              {items.length} {items.length === 1 ? "item" : "itens"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
