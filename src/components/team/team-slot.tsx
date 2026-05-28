import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  X,
  ChevronDown,
  Loader2,
  Search,
  Package,
  Dumbbell,
} from "lucide-react";
import { TypeBadge } from "~/components/pokemon/type-badge";
import { normalizePokemonName, cn } from "~/lib/utils";
import { NATURES } from "~/lib/constants";
import { useTeamStore } from "~/features/team-builder/use-team-store";
import { EvSlider } from "~/components/team/ev-slider";
import { StatCalculator } from "~/components/team/stat-calculator";
import type { PokemonType } from "~/types/pokemon";
import type { StatBlock } from "~/types/team";

// ── Types ────────────────────────────────────────────────────────────

interface PokemonSearchResult {
  id: string;
  dexNumber: number;
  name: string;
  displayName: string;
  types: [PokemonType] | [PokemonType, PokemonType];
}

interface PokemonDetailResponse {
  id: string;
  name: string;
  displayName: string;
  types: [PokemonType] | [PokemonType, PokemonType];
  abilities: Array<{ name: string; displayName: string; isHidden: boolean }>;
  baseStats: StatBlock;
}

interface ItemResult {
  id: string;
  name: string;
  displayName: string;
  category: string;
}

type DropdownId = "pokemon" | "nature" | "ability" | "item";

// ── Constants ─────────────────────────────────────────────────────────

const STAT_LABELS: Record<keyof StatBlock, string> = {
  hp: "HP",
  attack: "Atk",
  defense: "Def",
  specialAttack: "Sp.Atk",
  specialDefense: "Sp.Def",
  speed: "Spd",
};

function getPokemonSprite(name: string) {
  return `https://play.pokemonshowdown.com/sprites/dex/${normalizePokemonName(name)}.png`;
}

// ── Sub-components ────────────────────────────────────────────────────

function DropdownPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute left-0 right-0 top-full z-50 mt-1",
        "rounded-lg border border-border/70",
        "bg-[hsl(222_60%_5%)] shadow-2xl overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

function AttrButton({
  label,
  open,
  onClick,
  children,
}: {
  label: string;
  open: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-[9px] text-left",
        "hover:bg-white/[0.04] transition-colors duration-100",
        open && "bg-white/[0.03]"
      )}
    >
      <span className="w-14 shrink-0 text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground/50 select-none">
        {label}
      </span>
      <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-hidden">
        {children}
      </div>
      <ChevronDown
        className={cn(
          "shrink-0 h-3 w-3 text-muted-foreground/30 transition-transform duration-150",
          open && "-rotate-180"
        )}
      />
    </button>
  );
}

function SearchInputRow({
  value,
  onChange,
  placeholder,
  inputRef,
  loading,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  loading?: boolean;
}) {
  return (
    <div className="p-2 border-b border-border/40">
      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/[0.05] ring-1 ring-border/30">
        <Search className="h-3 w-3 shrink-0 text-muted-foreground/40" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none min-w-0"
        />
        {loading && (
          <Loader2 className="h-3 w-3 shrink-0 text-muted-foreground/40 animate-spin" />
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────

interface TeamSlotProps {
  slotIndex: number;
}

export function TeamSlot({ slotIndex }: TeamSlotProps) {
  const slot = useTeamStore((s) => s.slots[slotIndex]);
  const { setPokemon, setNature, setAbility, setHeldItem, setEvs, setIvs, clearSlot } =
    useTeamStore();

  const [openDropdown, setOpenDropdown] = useState<DropdownId | null>(null);
  const [pokemonQuery, setPokemonQuery] = useState("");
  const [pokemonQueryDebounced, setPokemonQueryDebounced] = useState("");
  const [itemQuery, setItemQuery] = useState("");
  const [itemQueryDebounced, setItemQueryDebounced] = useState("");
  const [fetchingPokemon, setFetchingPokemon] = useState(false);
  const [showTrainPanel, setShowTrainPanel] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const pokemonInputRef = useRef<HTMLInputElement>(null);
  const itemInputRef = useRef<HTMLInputElement>(null);

  // Debounce pokemon query
  useEffect(() => {
    const t = setTimeout(() => setPokemonQueryDebounced(pokemonQuery), 200);
    return () => clearTimeout(t);
  }, [pokemonQuery]);

  // Debounce item query
  useEffect(() => {
    const t = setTimeout(() => setItemQueryDebounced(itemQuery), 200);
    return () => clearTimeout(t);
  }, [itemQuery]);

  // Click outside closes dropdown
  useEffect(() => {
    if (!openDropdown) return;
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpenDropdown(null);
        setPokemonQuery("");
        setItemQuery("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openDropdown]);

  // Escape closes dropdown
  useEffect(() => {
    if (!openDropdown) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenDropdown(null);
        setPokemonQuery("");
        setItemQuery("");
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [openDropdown]);

  // Auto-focus search inputs
  useEffect(() => {
    if (openDropdown === "pokemon") {
      requestAnimationFrame(() => pokemonInputRef.current?.focus());
    }
    if (openDropdown === "item") {
      requestAnimationFrame(() => itemInputRef.current?.focus());
    }
  }, [openDropdown]);

  // Reset training panel when a new pokemon is selected
  useEffect(() => {
    setShowTrainPanel(false);
  }, [slot.pokemonData?.id]);

  const toggle = useCallback((id: DropdownId) => {
    setOpenDropdown((cur) => (cur === id ? null : id));
  }, []);

  // Pokemon search query
  const { data: pokemonResults = [], isFetching: searching } = useQuery({
    queryKey: ["slot-pokemon-search", pokemonQueryDebounced],
    queryFn: async () => {
      if (!pokemonQueryDebounced.trim()) return [];
      const res = await fetch(
        `http://localhost:3001/api/pokemon/search?q=${encodeURIComponent(pokemonQueryDebounced)}`
      );
      const json = (await res.json()) as { data: PokemonSearchResult[] };
      return json.data;
    },
    enabled: pokemonQueryDebounced.trim().length > 0,
    staleTime: 30_000,
  });

  // Items query (only when item dropdown open)
  const { data: items = [] } = useQuery({
    queryKey: ["slot-items", itemQueryDebounced],
    queryFn: async () => {
      const qs = itemQueryDebounced.trim()
        ? `?q=${encodeURIComponent(itemQueryDebounced)}`
        : "";
      const res = await fetch(`http://localhost:3001/api/items${qs}`);
      const json = (await res.json()) as { data: ItemResult[] };
      return json.data.slice(0, 30);
    },
    enabled: openDropdown === "item",
    staleTime: 60_000,
  });

  async function selectPokemon(result: PokemonSearchResult) {
    setOpenDropdown(null);
    setPokemonQuery("");
    setFetchingPokemon(true);
    try {
      const res = await fetch(
        `http://localhost:3001/api/pokemon/${result.id}`
      );
      const json = (await res.json()) as { data: PokemonDetailResponse };
      const d = json.data;
      setPokemon(slotIndex, {
        id: d.id,
        name: d.name,
        displayName: d.displayName,
        types: d.types,
        abilities: d.abilities.map((a) => ({
          name: a.name,
          displayName: a.displayName,
          isHidden: a.isHidden,
        })),
        baseStats: d.baseStats,
      });
    } catch (err) {
      console.error("[TeamSlot] Failed to load pokemon detail:", err);
    } finally {
      setFetchingPokemon(false);
    }
  }

  const slotLabel = String(slotIndex + 1).padStart(2, "0");
  const { pokemonData, nature, ability, heldItem, evs, ivs } = slot;
  const selectedNature = NATURES.find((n) => n.name === nature) ?? null;
  const primaryType = pokemonData?.types[0] ?? null;

  // ── Shared pokemon search panel ────────────────────────────────────

  const pokemonSearchPanel = (
    <DropdownPanel>
      <SearchInputRow
        value={pokemonQuery}
        onChange={setPokemonQuery}
        placeholder="Buscar Pokémon..."
        inputRef={pokemonInputRef}
        loading={searching}
      />
      <div className="max-h-52 overflow-y-auto">
        {pokemonResults.length === 0 ? (
          <p className="px-4 py-5 text-center text-xs text-muted-foreground/50">
            {pokemonQueryDebounced ? "Nenhum resultado" : "Digite para buscar..."}
          </p>
        ) : (
          pokemonResults.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => selectPokemon(r)}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/[0.06] transition-colors"
            >
              <img
                src={getPokemonSprite(r.name)}
                alt={r.displayName}
                className="w-8 h-8 object-contain shrink-0"
                loading="lazy"
              />
              <span className="flex-1 font-medium text-sm truncate">
                {r.displayName}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground/50 shrink-0">
                #{String(r.dexNumber).padStart(3, "0")}
              </span>
              <div className="flex gap-1 shrink-0">
                {r.types.map((t) => (
                  <TypeBadge key={t} type={t} size="sm" />
                ))}
              </div>
            </button>
          ))
        )}
      </div>
    </DropdownPanel>
  );

  // ── Loading state ──────────────────────────────────────────────────

  if (fetchingPokemon) {
    return (
      <div className="relative flex flex-col items-center justify-center rounded-xl border border-border bg-[hsl(224_71.4%_3.5%)] min-h-[240px] gap-3 text-muted-foreground/40">
        <span className="absolute top-3 left-3 font-mono text-[9px] tracking-[0.2em] font-bold text-muted-foreground/25 select-none">
          {slotLabel}
        </span>
        <Loader2 className="h-7 w-7 animate-spin" />
        <span className="text-xs tracking-wide">Carregando...</span>
      </div>
    );
  }

  // ── Empty slot ─────────────────────────────────────────────────────

  if (!pokemonData) {
    return (
      <div
        ref={containerRef}
        className={cn(
          "relative flex flex-col rounded-xl border-2 border-dashed min-h-[240px]",
          "bg-[hsl(224_71.4%_3%)] transition-colors duration-200",
          openDropdown
            ? "border-primary/40 bg-[hsl(224_71.4%_4%)]"
            : "border-border/40 hover:border-border/70"
        )}
      >
        <span className="absolute top-3 left-3 font-mono text-[9px] tracking-[0.2em] font-bold text-muted-foreground/25 select-none pointer-events-none">
          {slotLabel}
        </span>

        <button
          type="button"
          onClick={() => toggle("pokemon")}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 group focus-visible:outline-none"
          aria-label={`Slot ${slotIndex + 1}: Adicionar Pokémon`}
        >
          <div
            className={cn(
              "w-11 h-11 rounded-full border-2 border-dashed flex items-center justify-center",
              "transition-all duration-200",
              openDropdown
                ? "border-primary/60 text-primary/70 bg-primary/10"
                : "border-muted-foreground/20 text-muted-foreground/30 group-hover:border-primary/40 group-hover:text-primary/50 group-hover:bg-primary/5"
            )}
          >
            <Plus className="h-5 w-5" />
          </div>
          <span
            className={cn(
              "text-xs font-medium tracking-wide transition-colors duration-200",
              openDropdown
                ? "text-primary/70"
                : "text-muted-foreground/30 group-hover:text-muted-foreground/50"
            )}
          >
            Adicionar Pokémon
          </span>
        </button>

        {openDropdown === "pokemon" && pokemonSearchPanel}
      </div>
    );
  }

  // ── Filled slot ────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col rounded-xl border border-border/70 overflow-hidden bg-[hsl(224_71.4%_3.5%)]"
    >
      {/* Type accent bar */}
      {primaryType && (
        <div
          className="h-0.5 w-full shrink-0"
          style={{ background: `rgb(var(--type-${primaryType}))` }}
        />
      )}

      {/* Header: sprite + info + remove */}
      <div className="relative p-3 pb-2 flex items-start gap-3">
        <button
          type="button"
          onClick={() => clearSlot(slotIndex)}
          className="absolute top-2 right-2 p-1 rounded-md text-muted-foreground/30 hover:text-foreground hover:bg-white/[0.08] transition-colors z-10"
          aria-label="Remover Pokémon"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Sprite with type glow */}
        <div
          className="relative shrink-0 w-[60px] h-[60px] rounded-lg flex items-center justify-center"
          style={
            primaryType
              ? {
                  background: `radial-gradient(circle, rgb(var(--type-${primaryType}) / 0.15) 0%, transparent 70%)`,
                }
              : undefined
          }
        >
          <img
            src={getPokemonSprite(pokemonData.name)}
            alt={pokemonData.displayName}
            className="w-14 h-14 object-contain drop-shadow-sm"
            loading="lazy"
          />
        </div>

        {/* Name + types */}
        <div className="flex-1 min-w-0 pt-0.5 pr-5">
          <span className="block font-mono text-[9px] tracking-[0.2em] font-bold text-muted-foreground/30 select-none">
            {slotLabel}
          </span>
          <button
            type="button"
            onClick={() => toggle("pokemon")}
            className="group/name block mt-0.5 text-left"
          >
            <span className="text-sm font-semibold leading-tight text-foreground group-hover/name:text-primary transition-colors duration-150 block truncate">
              {pokemonData.displayName}
            </span>
          </button>
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {pokemonData.types.map((t) => (
              <TypeBadge key={t} type={t} size="sm" />
            ))}
          </div>
        </div>

        {openDropdown === "pokemon" && pokemonSearchPanel}
      </div>

      {/* Separator */}
      <div className="h-px bg-border/30 mx-3" />

      {/* Attribute rows */}
      <div className="flex flex-col">
        {/* Nature */}
        <div className="relative">
          <AttrButton
            label="Nature"
            open={openDropdown === "nature"}
            onClick={() => toggle("nature")}
          >
            {selectedNature ? (
              <>
                <span className="text-xs font-medium text-foreground/80 truncate">
                  {selectedNature.displayName}
                </span>
                {selectedNature.effect.increased && (
                  <span className="text-[10px] font-bold text-emerald-400/80 shrink-0">
                    +{STAT_LABELS[selectedNature.effect.increased]}
                  </span>
                )}
                {selectedNature.effect.decreased && (
                  <span className="text-[10px] font-bold text-red-400/70 shrink-0">
                    −{STAT_LABELS[selectedNature.effect.decreased]}
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-muted-foreground/40">—</span>
            )}
          </AttrButton>

          {openDropdown === "nature" && (
            <DropdownPanel>
              <div className="max-h-52 overflow-y-auto">
                {NATURES.map((n) => (
                  <button
                    key={n.name}
                    type="button"
                    onClick={() => {
                      setNature(slotIndex, n.name);
                      setOpenDropdown(null);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-white/[0.06] transition-colors",
                      nature === n.name && "bg-white/[0.07]"
                    )}
                  >
                    <span className="flex-1 font-medium text-foreground/80">
                      {n.displayName}
                    </span>
                    <span className="w-[52px] text-right text-emerald-400/70 shrink-0 text-[10px]">
                      {n.effect.increased
                        ? `+${STAT_LABELS[n.effect.increased]}`
                        : ""}
                    </span>
                    <span className="w-[52px] text-right text-red-400/60 shrink-0 text-[10px]">
                      {n.effect.decreased
                        ? `−${STAT_LABELS[n.effect.decreased]}`
                        : ""}
                    </span>
                    {nature === n.name && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 ml-1" />
                    )}
                  </button>
                ))}
              </div>
            </DropdownPanel>
          )}
        </div>

        {/* Ability */}
        <div className="relative">
          <AttrButton
            label="Ability"
            open={openDropdown === "ability"}
            onClick={() => toggle("ability")}
          >
            {ability ? (
              <span className="text-xs font-medium text-foreground/80 truncate">
                {pokemonData.abilities.find((a) => a.name === ability)
                  ?.displayName ?? ability}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground/40">—</span>
            )}
          </AttrButton>

          {openDropdown === "ability" && (
            <DropdownPanel>
              <div className="max-h-44 overflow-y-auto">
                {pokemonData.abilities.length === 0 ? (
                  <p className="px-4 py-5 text-center text-xs text-muted-foreground/50">
                    Sem habilidades disponíveis
                  </p>
                ) : (
                  pokemonData.abilities.map((a) => (
                    <button
                      key={a.name}
                      type="button"
                      onClick={() => {
                        setAbility(slotIndex, a.name);
                        setOpenDropdown(null);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-white/[0.06] transition-colors",
                        ability === a.name && "bg-white/[0.07]"
                      )}
                    >
                      <span className="flex-1 font-medium text-foreground/80">
                        {a.displayName}
                      </span>
                      {a.isHidden && (
                        <span className="text-[9px] font-bold tracking-widest text-muted-foreground/40 uppercase shrink-0">
                          HA
                        </span>
                      )}
                      {ability === a.name && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </DropdownPanel>
          )}
        </div>

        {/* Held item */}
        <div className="relative">
          <AttrButton
            label="Item"
            open={openDropdown === "item"}
            onClick={() => toggle("item")}
          >
            {heldItem ? (
              <span className="text-xs font-medium text-foreground/80 truncate">
                {heldItem}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground/40">—</span>
            )}
          </AttrButton>

          {openDropdown === "item" && (
            <DropdownPanel>
              <SearchInputRow
                value={itemQuery}
                onChange={setItemQuery}
                placeholder="Buscar item..."
                inputRef={itemInputRef}
              />
              <div className="max-h-48 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    setHeldItem(slotIndex, null);
                    setOpenDropdown(null);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-white/[0.06] transition-colors text-muted-foreground/60"
                >
                  <Package className="h-3 w-3 shrink-0" />
                  <span>Sem item</span>
                  {!heldItem && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 ml-auto" />
                  )}
                </button>
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setHeldItem(slotIndex, item.displayName);
                      setOpenDropdown(null);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-white/[0.06] transition-colors",
                      heldItem === item.displayName && "bg-white/[0.07]"
                    )}
                  >
                    <span className="flex-1 font-medium text-foreground/80 truncate">
                      {item.displayName}
                    </span>
                    <span className="text-[9px] text-muted-foreground/40 uppercase tracking-wide shrink-0">
                      {item.category.replace("-", " ")}
                    </span>
                    {heldItem === item.displayName && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    )}
                  </button>
                ))}
                {items.length === 0 && itemQueryDebounced && (
                  <p className="px-4 py-5 text-center text-xs text-muted-foreground/50">
                    Nenhum item encontrado
                  </p>
                )}
              </div>
            </DropdownPanel>
          )}
        </div>
      </div>

      {/* Train panel toggle */}
      <div className="h-px bg-border/20 mx-3" />
      <button
        type="button"
        onClick={() => setShowTrainPanel((prev) => !prev)}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-[9px] text-left",
          "hover:bg-white/[0.03] transition-colors duration-100",
          showTrainPanel && "bg-white/[0.02]"
        )}
      >
        <Dumbbell
          className={cn(
            "h-3 w-3 shrink-0 transition-colors",
            showTrainPanel ? "text-primary/50" : "text-muted-foreground/25"
          )}
        />
        <span
          className={cn(
            "flex-1 text-[9px] font-bold tracking-[0.15em] uppercase transition-colors",
            showTrainPanel ? "text-primary/55" : "text-muted-foreground/28"
          )}
        >
          EV / IV
        </span>
        <ChevronDown
          className={cn(
            "h-3 w-3 text-muted-foreground/20 transition-transform duration-150",
            showTrainPanel && "-rotate-180"
          )}
        />
      </button>

      {/* Train panel content */}
      {showTrainPanel && (
        <>
          <div className="h-px bg-border/15 mx-3" />
          <EvSlider
            evs={evs}
            ivs={ivs}
            onEvsChange={(newEvs) => setEvs(slotIndex, newEvs)}
            onIvsChange={(newIvs) => setIvs(slotIndex, newIvs)}
            natureName={nature}
          />
          <div className="h-px bg-border/10 mx-3" />
          <StatCalculator
            baseStats={pokemonData.baseStats}
            evs={evs}
            ivs={ivs}
            natureName={nature}
          />
        </>
      )}
    </div>
  );
}
