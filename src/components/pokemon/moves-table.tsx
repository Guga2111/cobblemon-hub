import { useState, useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import {
  Sword,
  Wand2,
  MinusCircle,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Swords,
} from "lucide-react";
import type { LearnableMove, MoveLearnMethod } from "~/types/pokemon";
import { TypeBadge } from "~/components/pokemon/type-badge";
import { cn } from "~/lib/utils";

// ── Config ─────────────────────────────────────────────────────────────────

type MoveFilter = "all" | MoveLearnMethod;

interface MethodConfig {
  label: string;
  activeBg: string;
  activeBorder: string;
  activeText: string;
  activeShadow: string;
  inactiveText: string;
}

const METHOD_CONFIGS: Record<MoveLearnMethod, MethodConfig> = {
  "level-up": {
    label: "Level-up",
    activeBg: "bg-violet-950/60",
    activeBorder: "border-violet-700/80",
    activeText: "text-violet-300",
    activeShadow: "shadow-[0_0_12px_-2px_rgb(139_92_246_/_0.5)]",
    inactiveText: "text-muted-foreground/70",
  },
  tm: {
    label: "TM",
    activeBg: "bg-blue-950/60",
    activeBorder: "border-blue-700/80",
    activeText: "text-blue-300",
    activeShadow: "shadow-[0_0_12px_-2px_rgb(59_130_246_/_0.5)]",
    inactiveText: "text-muted-foreground/70",
  },
  egg: {
    label: "Egg Move",
    activeBg: "bg-pink-950/60",
    activeBorder: "border-pink-700/80",
    activeText: "text-pink-300",
    activeShadow: "shadow-[0_0_12px_-2px_rgb(236_72_153_/_0.5)]",
    inactiveText: "text-muted-foreground/70",
  },
  tutor: {
    label: "Tutor",
    activeBg: "bg-amber-950/60",
    activeBorder: "border-amber-700/80",
    activeText: "text-amber-300",
    activeShadow: "shadow-[0_0_12px_-2px_rgb(245_158_11_/_0.5)]",
    inactiveText: "text-muted-foreground/70",
  },
};

const CATEGORY_CONFIG = {
  physical: {
    Icon: Sword,
    dotClass: "bg-orange-500",
    textClass: "text-orange-400",
    label: "Físico",
  },
  special: {
    Icon: Wand2,
    dotClass: "bg-cyan-500",
    textClass: "text-cyan-400",
    label: "Especial",
  },
  status: {
    Icon: MinusCircle,
    dotClass: "bg-zinc-500",
    textClass: "text-muted-foreground",
    label: "Status",
  },
};

const ALL_FILTERS: { id: MoveFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "level-up", label: "Level-up" },
  { id: "tm", label: "TM" },
  { id: "egg", label: "Egg Move" },
  { id: "tutor", label: "Tutor" },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function getPowerColor(power: number | null): string {
  if (power === null) return "text-muted-foreground/50";
  if (power >= 120) return "text-red-400";
  if (power >= 90) return "text-orange-400";
  if (power >= 60) return "text-yellow-400";
  return "text-foreground/80";
}

function formatLevelMethod(move: LearnableMove): {
  primary: string;
  label: string | null;
  isLevel: boolean;
} {
  if (move.method === "level-up" && move.level) {
    return { primary: String(move.level), label: "Lv.", isLevel: true };
  }
  const cfg = METHOD_CONFIGS[move.method];
  return { primary: cfg.label, label: null, isLevel: false };
}

function getMethodPillClass(method: MoveLearnMethod): string {
  const cfg = METHOD_CONFIGS[method];
  return cn(cfg.activeBg, cfg.activeBorder, cfg.activeText, "border text-[10px] font-bold px-1.5 py-0.5 rounded leading-none");
}

// ── Column definitions ─────────────────────────────────────────────────────

const colHelper = createColumnHelper<LearnableMove>();

const columns = [
  colHelper.accessor(
    (row) => (row.method === "level-up" ? (row.level ?? 0) : -1),
    {
      id: "level",
      header: "Lv / Método",
      enableSorting: true,
      size: 96,
      cell: ({ row }) => {
        const move = row.original;
        const { primary, label, isLevel } = formatLevelMethod(move);
        if (isLevel) {
          return (
            <div className="flex items-baseline gap-0.5 tabular-nums">
              <span className="text-[9px] text-muted-foreground/50 font-semibold tracking-wide">
                {label}
              </span>
              <span className="text-sm font-bold text-foreground/90">{primary}</span>
            </div>
          );
        }
        return (
          <span className={getMethodPillClass(move.method)}>{primary}</span>
        );
      },
    }
  ),

  colHelper.accessor("displayName", {
    header: "Nome",
    enableSorting: true,
    size: 180,
    cell: ({ getValue }) => (
      <span className="text-sm font-medium text-foreground/90">{getValue()}</span>
    ),
  }),

  colHelper.accessor("type", {
    header: "Tipo",
    enableSorting: false,
    size: 80,
    cell: ({ getValue }) => <TypeBadge type={getValue()} size="sm" />,
  }),

  colHelper.accessor("category", {
    header: "Cat.",
    enableSorting: false,
    size: 72,
    cell: ({ getValue }) => {
      const cat = getValue();
      const cfg = CATEGORY_CONFIG[cat];
      const { Icon } = cfg;
      return (
        <div className={cn("flex items-center gap-1", cfg.textClass)}>
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dotClass)} />
          <Icon className="w-3 h-3 shrink-0" />
          <span className="text-[10px] font-semibold hidden sm:inline">{cfg.label}</span>
        </div>
      );
    },
  }),

  colHelper.accessor("power", {
    header: "Poder",
    enableSorting: true,
    size: 64,
    cell: ({ getValue }) => {
      const val = getValue();
      return (
        <span className={cn("text-sm font-bold tabular-nums", getPowerColor(val))}>
          {val ?? "—"}
        </span>
      );
    },
    sortingFn: (a, b) => {
      const av = a.original.power ?? -1;
      const bv = b.original.power ?? -1;
      return av - bv;
    },
  }),

  colHelper.accessor("accuracy", {
    header: "Precisão",
    enableSorting: false,
    size: 72,
    cell: ({ getValue }) => {
      const val = getValue();
      return (
        <span className="text-sm tabular-nums text-muted-foreground">
          {val !== null ? `${val}%` : "—"}
        </span>
      );
    },
  }),

  colHelper.accessor("pp", {
    header: "PP",
    enableSorting: false,
    size: 52,
    cell: ({ getValue }) => (
      <span className="text-sm tabular-nums text-muted-foreground/70">{getValue() ?? "—"}</span>
    ),
  }),
];

// ── Skeleton ───────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex gap-2 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-7 w-20 bg-muted rounded-full" />
        ))}
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="h-9 bg-muted/40" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={cn("h-11 flex items-center gap-3 px-4", i % 2 === 0 ? "bg-muted/10" : "bg-muted/20")}
          >
            <div className="h-4 w-8 bg-muted rounded" />
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-4 w-14 bg-muted rounded" />
            <div className="h-4 w-10 bg-muted rounded ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sort icon ──────────────────────────────────────────────────────────────

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <ChevronUp className="w-3 h-3" />;
  if (sorted === "desc") return <ChevronDown className="w-3 h-3" />;
  return <ChevronsUpDown className="w-3 h-3 opacity-40" />;
}

// ── Main component ─────────────────────────────────────────────────────────

interface MovesTableProps {
  moves: LearnableMove[];
  isLoading?: boolean;
}

export function MovesTable({ moves, isLoading = false }: MovesTableProps) {
  const [activeFilter, setActiveFilter] = useState<MoveFilter>("all");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "level", desc: false },
  ]);

  const filteredMoves = useMemo(() => {
    if (activeFilter === "all") return moves;
    return moves.filter((m) => m.method === activeFilter);
  }, [moves, activeFilter]);

  const table = useReactTable({
    data: filteredMoves,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) return <TableSkeleton />;

  const rows = table.getRowModel().rows;

  return (
    <div>
      {/* ── Method filter pills ────────────────────────────────── */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        {ALL_FILTERS.map((f) => {
          const isActive = activeFilter === f.id;
          const methodCfg = f.id !== "all" ? METHOD_CONFIGS[f.id] : null;

          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold border transition-all",
                isActive
                  ? f.id === "all"
                    ? "bg-muted/40 border-border text-foreground/90 shadow-[0_0_12px_-2px_rgb(161_161_170_/_0.3)]"
                    : cn(
                        methodCfg!.activeBg,
                        methodCfg!.activeBorder,
                        methodCfg!.activeText,
                        methodCfg!.activeShadow
                      )
                  : "bg-muted/15 border-border text-muted-foreground/70 hover:text-foreground hover:border-border"
              )}
            >
              {f.label}
              {f.id !== "all" && (
                <span className="ml-1.5 opacity-60 font-normal tabular-nums">
                  {moves.filter((m) => m.method === f.id).length}
                </span>
              )}
            </button>
          );
        })}
        {activeFilter === "all" && (
          <span className="ml-auto text-[11px] text-muted-foreground/50 tabular-nums">
            {moves.length} moves
          </span>
        )}
      </div>

      {/* ── Table ──────────────────────────────────────────────── */}
      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-11 h-11 rounded-xl bg-card border border-border flex items-center justify-center mb-3">
            <Swords className="w-5 h-5 text-muted-foreground/30" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground/70">
            Nenhum move por este método
          </p>
          {activeFilter !== "all" && (
            <button
              onClick={() => setActiveFilter("all")}
              className="mt-2 text-xs text-muted-foreground/50 hover:text-muted-foreground underline underline-offset-2 transition-colors"
            >
              Ver todos os métodos
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border/70 overflow-hidden">
          <table className="w-full border-separate border-spacing-0 text-left">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="bg-muted/30">
                  {hg.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        style={{ width: header.getSize() }}
                        className={cn(
                          "px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 border-b border-border first:pl-4 last:pr-4",
                          canSort && "cursor-pointer select-none hover:text-foreground transition-colors"
                        )}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      >
                        <div className="flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && <SortIcon sorted={sorted} />}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr
                  key={row.id}
                  className={cn(
                    "group transition-colors",
                    rowIdx % 2 === 0 ? "bg-muted/10" : "bg-muted/20",
                    "hover:bg-muted/20"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-3 py-2.5 border-b border-border/40 group-last:border-0 first:pl-4 last:pr-4"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
