import * as React from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  CommandSeparator,
} from "cmdk";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import {
  Search,
  Clock,
  BookOpen,
  Swords,
  Package,
  ScrollText,
  Zap,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";
import { TypeBadge } from "~/components/pokemon/type-badge";
import { cn } from "~/lib/utils";
import type { PokemonType } from "~/types/pokemon";

// ── Types ────────────────────────────────────────────────────────────

interface PokemonSearchResult {
  id: string;
  dexNumber: number;
  name: string;
  displayName: string;
  types: [PokemonType] | [PokemonType, PokemonType];
  generation: number;
}

interface HistoryEntry extends PokemonSearchResult {
  visitedAt: number;
}

// ── Constants ────────────────────────────────────────────────────────

const HISTORY_KEY = "cmd-search-history";
const MAX_HISTORY = 5;

const QUICK_ACTIONS = [
  { id: "action-pokedex", label: "Pokédex", description: "Ver todos os Pokémon", href: "/pokedex", icon: BookOpen },
  { id: "action-team", label: "Team Builder", description: "Montar seu time", href: "/team-builder", icon: Swords },
  { id: "action-items", label: "Wiki de Itens", description: "Itens e onde farmá-los", href: "/items", icon: Package },
  { id: "action-guides", label: "Guias", description: "Tutoriais e farming", href: "/guides", icon: ScrollText },
];

// ── History helpers ──────────────────────────────────────────────────

function loadHistory(): HistoryEntry[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

function saveToHistory(item: PokemonSearchResult): void {
  try {
    const history = loadHistory().filter((h) => h.id !== item.id);
    const entry: HistoryEntry = { ...item, visitedAt: Date.now() };
    const updated = [entry, ...history].slice(0, MAX_HISTORY);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

// ── Sprite URL ───────────────────────────────────────────────────────

function spriteUrl(name: string): string {
  return `https://play.pokemonshowdown.com/sprites/dex/${name}.png`;
}

function spriteFallbackUrl(name: string): string {
  return `https://play.pokemonshowdown.com/sprites/gen5/${name}.png`;
}

// ── Preview Panel ────────────────────────────────────────────────────

function PreviewPanel({ pokemon }: { pokemon: PokemonSearchResult }) {
  const primaryType = pokemon.types[0];
  const [imgError, setImgError] = React.useState(false);
  const [useFallback, setUseFallback] = React.useState(false);

  React.useEffect(() => {
    setImgError(false);
    setUseFallback(false);
  }, [pokemon.id]);

  const handleImgError = () => {
    if (!useFallback) {
      setUseFallback(true);
    } else {
      setImgError(true);
    }
  };

  const currentSrc = imgError
    ? ""
    : useFallback
      ? spriteFallbackUrl(pokemon.name)
      : spriteUrl(pokemon.name);

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* Type-colored radial glow backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 40%, rgb(var(--type-${primaryType}) / 0.18) 0%, transparent 70%)`,
        }}
      />

      {/* Scanline texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)",
        }}
      />

      {/* Content */}
      <div className="relative flex flex-1 flex-col items-center justify-center gap-4 px-6 py-8">
        {/* Dex number */}
        <div className="absolute top-4 right-4 font-mono text-[10px] font-bold tracking-[0.2em] text-muted-foreground/50">
          #{String(pokemon.dexNumber).padStart(4, "0")}
        </div>

        {/* Sprite container */}
        <div className="relative">
          {/* Outer glow ring */}
          <div
            className="absolute -inset-4 rounded-full opacity-30 blur-xl"
            style={{
              background: `radial-gradient(circle, rgb(var(--type-${primaryType})) 0%, transparent 70%)`,
            }}
          />
          {/* Inner glow */}
          <div
            className="absolute -inset-2 rounded-full opacity-20 blur-md"
            style={{
              background: `rgb(var(--type-${primaryType}))`,
            }}
          />

          {/* Sprite */}
          {!imgError && currentSrc ? (
            <img
              key={`${pokemon.id}-${useFallback ? "fallback" : "primary"}`}
              src={currentSrc}
              alt={pokemon.displayName}
              width={112}
              height={112}
              onError={handleImgError}
              className="relative z-10 h-28 w-28 object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] [image-rendering:pixelated]"
              style={{
                filter: `drop-shadow(0 0 12px rgb(var(--type-${primaryType}) / 0.5))`,
              }}
            />
          ) : (
            <div className="relative z-10 flex h-28 w-28 items-center justify-center rounded-full bg-muted/30">
              <Sparkles size={32} className="text-muted-foreground/40" />
            </div>
          )}
        </div>

        {/* Name */}
        <div className="text-center">
          <h3 className="text-lg font-bold leading-tight text-foreground">
            {pokemon.displayName}
          </h3>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground/60">
            {pokemon.name}
          </p>
        </div>

        {/* Type badges */}
        <div className="flex items-center gap-2">
          {pokemon.types.map((t) => (
            <TypeBadge key={t} type={t} size="md" />
          ))}
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 rounded-md border border-border/50 bg-muted/20 px-2.5 py-1">
            <Zap size={10} className="text-primary/70" />
            <span className="font-mono font-medium">Gen {pokemon.generation}</span>
          </div>
        </div>
      </div>

      {/* Bottom hint */}
      <div className="relative border-t border-border/30 px-4 py-3">
        <p className="text-center font-mono text-[10px] tracking-wider text-muted-foreground/40 uppercase">
          Enter para ver detalhes
        </p>
      </div>
    </div>
  );
}

// ── Empty Preview ────────────────────────────────────────────────────

function EmptyPreview() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6">
      {/* Scanner circle */}
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
        <div className="absolute inset-2 rounded-full border border-primary/30" />
        <div className="absolute inset-4 rounded-full bg-primary/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Search size={18} className="text-primary/40" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-muted-foreground/50">
          Selecione um resultado
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground/30">
          para ver o preview
        </p>
      </div>
    </div>
  );
}

// ── Skeleton rows ────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <div className="h-6 w-6 shrink-0 animate-pulse rounded bg-muted/40" />
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="h-3 w-32 animate-pulse rounded bg-muted/40" />
        <div className="h-2.5 w-20 animate-pulse rounded bg-muted/30" />
      </div>
      <div className="h-4 w-12 animate-pulse rounded-full bg-muted/30" />
    </div>
  );
}

// ── PokemonRow ───────────────────────────────────────────────────────

function PokemonRow({ pokemon }: { pokemon: PokemonSearchResult }) {
  return (
    <div className="flex items-center gap-3 py-0.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded">
        <img
          src={spriteUrl(pokemon.name)}
          alt=""
          width={28}
          height={28}
          loading="lazy"
          className="h-7 w-7 object-contain [image-rendering:pixelated]"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium leading-tight text-foreground">
          {pokemon.displayName}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground/60">
          #{String(pokemon.dexNumber).padStart(4, "0")}
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {pokemon.types.map((t) => (
          <TypeBadge key={t} type={t} size="sm" />
        ))}
      </div>
    </div>
  );
}

// ── Main CommandSearch ───────────────────────────────────────────────

interface CommandSearchProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandSearch({ open: controlledOpen, onOpenChange }: CommandSearchProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = React.useCallback(
    (val: boolean) => {
      if (!isControlled) setInternalOpen(val);
      onOpenChange?.(val);
    },
    [isControlled, onOpenChange]
  );

  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [selectedValue, setSelectedValue] = React.useState("");
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);
  const navigate = useNavigate();

  // Global Cmd+K / Ctrl+K
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, setOpen]);

  // Reset state on open
  React.useEffect(() => {
    if (open) {
      setQuery("");
      setDebouncedQuery("");
      setSelectedValue("");
      setHistory(loadHistory());
    }
  }, [open]);

  // Debounce
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Search query
  const { data: searchData, isFetching } = useQuery({
    queryKey: ["command-search", debouncedQuery],
    queryFn: async (): Promise<{ data: PokemonSearchResult[] }> => {
      if (!debouncedQuery.trim()) return { data: [] };
      const res = await fetch(
        `http://localhost:3001/api/pokemon/search?q=${encodeURIComponent(debouncedQuery)}`
      );
      if (!res.ok) throw new Error("Search failed");
      return res.json() as Promise<{ data: PokemonSearchResult[] }>;
    },
    enabled: open && debouncedQuery.trim().length > 0,
    staleTime: 30_000,
  });

  const results = searchData?.data ?? [];
  const isSearching = query.trim().length > 0;

  // Build item lookup map for preview
  const itemMap = React.useMemo<Map<string, PokemonSearchResult>>(() => {
    const map = new Map<string, PokemonSearchResult>();
    for (const r of results) {
      map.set(`pokemon-${r.id}`, r);
    }
    for (const h of history) {
      map.set(`history-${h.id}`, h);
    }
    return map;
  }, [results, history]);

  // Derive preview item from selected value
  const previewItem = itemMap.get(selectedValue) ?? null;

  // Auto-select first item when results change
  React.useEffect(() => {
    if (results.length > 0 && !selectedValue) {
      setSelectedValue(`pokemon-${results[0].id}`);
    }
  }, [results, selectedValue]);

  React.useEffect(() => {
    if (history.length > 0 && !isSearching && !selectedValue) {
      setSelectedValue(`history-${history[0].id}`);
    }
  }, [history, isSearching, selectedValue]);

  const handlePokemonSelect = React.useCallback(
    (item: PokemonSearchResult) => {
      saveToHistory(item);
      setOpen(false);
      navigate(`/pokedex/${item.id}`);
    },
    [navigate, setOpen]
  );

  const handleActionSelect = React.useCallback(
    (href: string) => {
      setOpen(false);
      navigate(href);
    },
    [navigate, setOpen]
  );

  return (
    <>
      {/* Header trigger button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Busca global"
        className={cn(
          "group hidden md:flex items-center gap-2 h-9",
          "rounded-lg border border-border/60 bg-muted/20 px-3",
          "text-sm text-muted-foreground",
          "transition-all duration-200 hover:border-primary/40 hover:bg-primary/5 hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        <Search size={14} className="shrink-0" />
        <span className="hidden xl:inline">Buscar...</span>
        <div className="ml-1 hidden xl:flex items-center gap-0.5">
          <kbd className="rounded border border-border/60 bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/70">
            ⌘
          </kbd>
          <kbd className="rounded border border-border/60 bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/70">
            K
          </kbd>
        </div>
      </button>

      {/* Mobile trigger */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Busca global"
        className={cn(
          "flex md:hidden h-9 w-9 items-center justify-center rounded-lg",
          "text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        <Search size={18} />
      </button>

      {/* Dialog */}
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          {/* Overlay */}
          <DialogPrimitive.Overlay
            className={cn(
              "fixed inset-0 z-50 bg-black/75 backdrop-blur-sm",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
            )}
          />

          {/* Content */}
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className={cn(
              "fixed left-1/2 top-[15vh] z-50 -translate-x-1/2",
              "w-[min(720px,calc(100vw-2rem))] overflow-hidden rounded-xl",
              "border border-border/60 bg-background shadow-2xl",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              "data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1",
              // Violet glow border effect
              "ring-1 ring-primary/10 shadow-[0_0_0_1px_hsl(var(--primary)/0.05),0_25px_50px_-12px_rgba(0,0,0,0.8),0_0_80px_-20px_hsl(var(--primary)/0.2)]"
            )}
          >
            <DialogPrimitive.Title className="sr-only">
              Busca Global
            </DialogPrimitive.Title>

            <div className="flex h-[480px] overflow-hidden">
              {/* ── Left pane: Search ─────────────────────────── */}
              <div className="flex w-[55%] min-w-0 flex-col border-r border-border/60">
                <Command
                  shouldFilter={false}
                  value={selectedValue}
                  onValueChange={setSelectedValue}
                  className="flex h-full flex-col bg-transparent"
                >
                  {/* Input row */}
                  <div className="flex items-center gap-2 border-b border-border/60 px-3">
                    <Search size={16} className="shrink-0 text-muted-foreground/60" />
                    <CommandInput
                      value={query}
                      onValueChange={setQuery}
                      placeholder="Buscar Pokémon, itens, guias..."
                      className={cn(
                        "h-12 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50",
                        "border-none outline-none focus:outline-none ring-0 focus:ring-0",
                        "[&::-webkit-search-cancel-button]:hidden"
                      )}
                    />
                    {query && (
                      <button
                        onClick={() => {
                          setQuery("");
                          setDebouncedQuery("");
                        }}
                        className="rounded p-0.5 text-muted-foreground/60 hover:text-foreground"
                        aria-label="Limpar busca"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* List */}
                  <CommandList className="flex-1 overflow-y-auto py-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/40">
                    {/* Loading state */}
                    {isFetching && (
                      <CommandLoading>
                        <div className="px-2 py-1">
                          <div className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                            Pokémon
                          </div>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <SkeletonRow key={i} />
                          ))}
                        </div>
                      </CommandLoading>
                    )}

                    {/* Empty state */}
                    {!isFetching && isSearching && debouncedQuery && results.length === 0 && (
                      <CommandEmpty>
                        <div className="flex flex-col items-center gap-2 py-8">
                          <div className="text-3xl opacity-30">◌</div>
                          <p className="text-sm text-muted-foreground/60">
                            Nenhum resultado para{" "}
                            <span className="font-medium text-muted-foreground">
                              &quot;{debouncedQuery}&quot;
                            </span>
                          </p>
                        </div>
                      </CommandEmpty>
                    )}

                    {/* Search results */}
                    {!isFetching && results.length > 0 && (
                      <CommandGroup
                        heading={
                          <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                            Pokémon
                          </span>
                        }
                        className="[&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2"
                      >
                        {results.map((pokemon) => (
                          <CommandItem
                            key={pokemon.id}
                            value={`pokemon-${pokemon.id}`}
                            onSelect={() => handlePokemonSelect(pokemon)}
                            className={cn(
                              "mx-1 cursor-pointer rounded-lg px-2 py-1.5",
                              "transition-colors duration-100",
                              "data-[selected=true]:bg-primary/10 data-[selected=true]:text-foreground",
                              "hover:bg-muted/50",
                              "aria-selected:bg-primary/10"
                            )}
                          >
                            <PokemonRow pokemon={pokemon} />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {/* History */}
                    {!isSearching && history.length > 0 && (
                      <CommandGroup
                        heading={
                          <span className="flex items-center gap-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                            <Clock size={9} />
                            Recentes
                          </span>
                        }
                        className="[&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2"
                      >
                        {history.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={`history-${item.id}`}
                            onSelect={() => handlePokemonSelect(item)}
                            className={cn(
                              "mx-1 cursor-pointer rounded-lg px-2 py-1.5",
                              "transition-colors duration-100",
                              "data-[selected=true]:bg-primary/10",
                              "aria-selected:bg-primary/10"
                            )}
                          >
                            <PokemonRow pokemon={item} />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {/* Quick actions */}
                    {!isSearching && (
                      <>
                        {history.length > 0 && <CommandSeparator className="my-1 border-border/40" />}
                        <CommandGroup
                          heading={
                            <span className="flex items-center gap-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                              <Zap size={9} />
                              Ações Rápidas
                            </span>
                          }
                          className="[&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2"
                        >
                          {QUICK_ACTIONS.map((action) => {
                            const Icon = action.icon;
                            return (
                              <CommandItem
                                key={action.id}
                                value={action.id}
                                onSelect={() => handleActionSelect(action.href)}
                                className={cn(
                                  "mx-1 cursor-pointer rounded-lg px-2 py-2",
                                  "transition-colors duration-100",
                                  "data-[selected=true]:bg-primary/10",
                                  "aria-selected:bg-primary/10"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary/70">
                                    <Icon size={12} />
                                  </div>
                                  <div className="flex min-w-0 flex-1 flex-col">
                                    <span className="text-sm font-medium text-foreground">
                                      {action.label}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground/60">
                                      {action.description}
                                    </span>
                                  </div>
                                  <ChevronRight size={12} className="shrink-0 text-muted-foreground/40" />
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>

                  {/* Keyboard hints */}
                  <div className="flex items-center justify-between border-t border-border/60 px-3 py-2">
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground/40">
                      <span className="flex items-center gap-1">
                        <kbd className="rounded border border-border/50 bg-muted/30 px-1 font-mono text-[9px]">↑↓</kbd>
                        navegar
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="rounded border border-border/50 bg-muted/30 px-1 font-mono text-[9px]">↵</kbd>
                        abrir
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="rounded border border-border/50 bg-muted/30 px-1 font-mono text-[9px]">Esc</kbd>
                        fechar
                      </span>
                    </div>
                  </div>
                </Command>
              </div>

              {/* ── Right pane: Preview ──────────────────────── */}
              <div className="w-[45%] min-w-0 bg-[hsl(var(--background))] relative">
                {/* Top accent line */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                {previewItem && itemMap.has(selectedValue) && (selectedValue.startsWith("pokemon-") || selectedValue.startsWith("history-")) ? (
                  <PreviewPanel pokemon={previewItem} />
                ) : (
                  <EmptyPreview />
                )}
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
