import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import { RouteErrorBoundary } from "~/components/layout/route-error-boundary";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  AlertTriangle,
  RefreshCw,
  Package,
  BarChart2,
  MapPin,
  Swords,
} from "lucide-react";
import type { Pokemon, PokemonForm, ItemDrop, PokemonType } from "~/types/pokemon";
import { TypeBadge } from "~/components/pokemon/type-badge";
import { EvolutionChain } from "~/components/pokemon/evolution-chain";
import { StatBar } from "~/components/pokemon/stat-bar";
import { SpawnCard, type SpawnEntryData } from "~/components/pokemon/spawn-card";
import { MovesTable } from "~/components/pokemon/moves-table";
import { normalizePokemonName, cn } from "~/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

interface PokemonDetail extends Pokemon {
  spawns: unknown[];
  prevId: string | null;
  nextId: string | null;
}

type TabId = "overview" | "base-stats" | "spawns" | "moves";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

// ── Constants ──────────────────────────────────────────────────────────────

const TABS: TabDef[] = [
  { id: "overview", label: "Overview", icon: BarChart2 },
  { id: "base-stats", label: "Base Stats", icon: BarChart2 },
  { id: "spawns", label: "Spawns", icon: MapPin },
  { id: "moves", label: "Moves", icon: Swords },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function formatGrowthRate(gr: string): string {
  return gr
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatEggGroup(eg: string): string {
  const overrides: Record<string, string> = {
    "no-eggs": "No Eggs",
    "human-like": "Human-Like",
    water1: "Water 1",
    water2: "Water 2",
    water3: "Water 3",
  };
  return overrides[eg] ?? eg.charAt(0).toUpperCase() + eg.slice(1);
}

function formatGender(ratio: number | null): string {
  if (ratio === null) return "Genderless";
  if (ratio === 0) return "♂ 100%";
  if (ratio === 8) return "♀ 100%";
  const femalePct = ((ratio / 8) * 100).toFixed(1);
  const malePct = (100 - parseFloat(femalePct)).toFixed(1);
  return `♂ ${malePct}% ♀ ${femalePct}%`;
}

function formatDropChance(chance: number): string {
  return `${(chance * 100).toFixed(1)}%`;
}

function formatDex(n: number): string {
  return `#${String(n).padStart(3, "0")}`;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-zinc-800/60 last:border-0">
      <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm text-zinc-200 font-medium text-right">{value}</span>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-5">
      <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950 animate-pulse">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="h-5 w-24 bg-zinc-800 rounded mb-6" />
        <div className="h-64 bg-zinc-900 rounded-2xl mb-4" />
        <div className="h-10 bg-zinc-900 rounded-xl mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-4">
            <div className="h-44 bg-zinc-900 rounded-xl" />
            <div className="h-32 bg-zinc-900 rounded-xl" />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="h-36 bg-zinc-900 rounded-xl" />
            <div className="h-28 bg-zinc-900 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function NavButton({
  to,
  direction,
  disabled,
}: {
  to: string;
  direction: "prev" | "next";
  disabled: boolean;
}) {
  const label = direction === "prev" ? "Prev" : "Next";
  const icon =
    direction === "prev" ? (
      <ChevronLeft className="w-3.5 h-3.5" />
    ) : (
      <ChevronRight className="w-3.5 h-3.5" />
    );

  if (disabled) {
    return (
      <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900/40 border border-zinc-800/40 text-xs text-zinc-700 cursor-not-allowed select-none">
        {direction === "prev" && icon}
        {label}
        {direction === "next" && icon}
      </span>
    );
  }

  return (
    <Link
      to={to}
      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-400 hover:text-zinc-200 transition-all"
    >
      {direction === "prev" && icon}
      {label}
      {direction === "next" && icon}
    </Link>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function PokemonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [activeFormIndex, setActiveFormIndex] = useState<number>(-1);

  // Reset form selection when navigating between pokemon
  useEffect(() => {
    setActiveFormIndex(-1);
    setActiveTab("overview");
  }, [id]);

  const { data, isLoading, isError, refetch } = useQuery<{ data: PokemonDetail }>({
    queryKey: ["pokemon-detail", id],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3001/api/pokemon/${id}`);
      if (!res.ok) throw new Error("Pokemon not found");
      return res.json() as Promise<{ data: PokemonDetail }>;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <PageSkeleton />;

  if (isError || !data?.data) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-5 px-4">
        <div className="flex items-center gap-3 text-red-400 bg-red-950/30 border border-red-900/40 rounded-xl px-6 py-4 max-w-sm text-center">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm">Could not load Pokémon data. It may not exist in the database.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/pokedex"
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Pokédex
          </Link>
          <button
            onClick={() => void refetch()}
            className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const pokemon = data.data;
  const primaryType: PokemonType = pokemon.types[0];
  const activeForm: PokemonForm | null =
    activeFormIndex >= 0 ? (pokemon.forms[activeFormIndex] ?? null) : null;
  const displayTypes = activeForm?.types ?? pokemon.types;
  const spriteName = activeForm
    ? normalizePokemonName(activeForm.name)
    : normalizePokemonName(pokemon.name);
  const spriteUrl = `https://play.pokemonshowdown.com/sprites/dex/${spriteName}.png`;
  const spriteFallback = `https://play.pokemonshowdown.com/sprites/gen5/${spriteName}.png`;

  return (
    <>
      <style>{`
        @keyframes pokemon-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .sprite-float { animation: pokemon-float 4s ease-in-out infinite; }
      `}</style>

      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Top nav ───────────────────────────────────────────── */}
          <div className="flex items-center justify-between py-5">
            <Link
              to="/pokedex"
              className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-200 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              Pokédex
            </Link>
            <div className="flex items-center gap-2">
              <NavButton
                to={`/pokedex/${pokemon.prevId ?? ""}`}
                direction="prev"
                disabled={!pokemon.prevId}
              />
              <NavButton
                to={`/pokedex/${pokemon.nextId ?? ""}`}
                direction="next"
                disabled={!pokemon.nextId}
              />
            </div>
          </div>

          {/* ── Hero ─────────────────────────────────────────────── */}
          <div
            className="relative rounded-2xl overflow-hidden bg-zinc-900/50 border border-zinc-800/50 mb-3"
            style={{
              boxShadow: `0 0 60px -15px rgb(var(--type-${primaryType}) / 0.35)`,
            }}
          >
            {/* Ambient type background */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 55% 100% at 75% 50%, rgb(var(--type-${primaryType}) / 0.12), transparent)`,
              }}
            />

            {/* Dex# watermark */}
            <div className="absolute top-2 left-4 sm:top-4 text-[88px] sm:text-[128px] font-black text-zinc-800/20 leading-none select-none pointer-events-none tabular-nums tracking-tighter">
              {formatDex(pokemon.dexNumber)}
            </div>

            <div className="relative flex flex-col sm:flex-row items-center gap-4 sm:gap-8 p-6 sm:p-8 lg:p-10">
              {/* Left: name, types, forms, generation */}
              <div className="flex-1 z-10 order-2 sm:order-1 flex flex-col gap-3 text-center sm:text-left">
                <div>
                  <p className="text-xs font-bold text-zinc-500 tracking-[0.2em] uppercase mb-1">
                    {formatDex(pokemon.dexNumber)}
                  </p>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-none">
                    {activeForm?.displayName ?? pokemon.displayName}
                  </h1>
                </div>

                <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
                  {displayTypes.map((t) => (
                    <TypeBadge key={t} type={t} size="md" />
                  ))}
                </div>

                {/* Form toggle */}
                {pokemon.forms.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap justify-center sm:justify-start">
                    <button
                      onClick={() => setActiveFormIndex(-1)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-medium transition-all border",
                        activeFormIndex === -1
                          ? "bg-zinc-700 border-zinc-600 text-white"
                          : "bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                      )}
                    >
                      Base
                    </button>
                    {pokemon.forms.map((form: PokemonForm, i: number) => (
                      <button
                        key={form.name}
                        onClick={() => setActiveFormIndex(i)}
                        className={cn(
                          "px-3 py-1 rounded-lg text-xs font-medium transition-all border",
                          activeFormIndex === i
                            ? "bg-zinc-700 border-zinc-600 text-white"
                            : "bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                        )}
                      >
                        {form.displayName}
                      </button>
                    ))}
                  </div>
                )}

                <p className="text-[11px] text-zinc-600 font-medium">
                  Generation {pokemon.generation}
                </p>
              </div>

              {/* Right: sprite with glow */}
              <div className="relative order-1 sm:order-2 shrink-0">
                <div
                  className="absolute inset-0 rounded-full blur-3xl pointer-events-none scale-150 opacity-50"
                  style={{
                    background: `radial-gradient(circle, rgb(var(--type-${primaryType}) / 0.7), transparent 65%)`,
                  }}
                />
                <img
                  src={spriteUrl}
                  alt={activeForm?.displayName ?? pokemon.displayName}
                  className="sprite-float relative w-36 h-36 sm:w-52 sm:h-52 lg:w-60 lg:h-60 object-contain z-10"
                  style={{
                    filter: `drop-shadow(0 0 20px rgb(var(--type-${primaryType}) / 0.55))`,
                  }}
                  onError={(e) => {
                    const t = e.currentTarget;
                    if (!t.src.includes("gen5")) t.src = spriteFallback;
                  }}
                  loading="eager"
                />
              </div>
            </div>
          </div>

          {/* ── Tabs ─────────────────────────────────────────────── */}
          <div
            className="flex border-b border-zinc-800 mb-6 overflow-x-auto scrollbar-none"
            role="tablist"
            aria-label="Pokémon details"
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 -mb-px",
                  activeTab === tab.id
                    ? "border-violet-500 text-violet-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Overview tab ──────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-12">
              {/* Left column */}
              <div className="lg:col-span-1 flex flex-col gap-4">
                {/* Info */}
                <SectionCard title="Info">
                  <InfoRow label="Catch Rate" value={String(pokemon.catchRate)} />
                  <InfoRow label="Base EXP" value={String(pokemon.baseExp)} />
                  <InfoRow
                    label="Growth Rate"
                    value={formatGrowthRate(pokemon.growthRate)}
                  />
                  <InfoRow
                    label="Egg Groups"
                    value={pokemon.eggGroups.map(formatEggGroup).join(", ")}
                  />
                  <InfoRow
                    label="Gender Ratio"
                    value={formatGender(pokemon.genderRatio)}
                  />
                </SectionCard>

                {/* Abilities */}
                {pokemon.abilities.length > 0 && (
                  <SectionCard title="Abilities">
                    <div className="flex flex-col gap-3">
                      {pokemon.abilities.map((ability) => (
                        <div key={ability.name}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-zinc-200">
                              {ability.displayName}
                            </span>
                            {ability.isHidden && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-violet-900/40 text-violet-400 border border-violet-800/50 font-semibold leading-none">
                                Hidden
                              </span>
                            )}
                          </div>
                          {ability.description && (
                            <p className="text-xs text-zinc-500 leading-relaxed">
                              {ability.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}
              </div>

              {/* Right column */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                {/* Evolution Chain */}
                <SectionCard title="Evolution Chain">
                  <EvolutionChain
                    pokemonId={pokemon.id}
                    pokemonName={pokemon.name}
                    displayName={pokemon.displayName}
                    evolutions={pokemon.evolutions}
                  />
                </SectionCard>

                {/* Item Drops */}
                <SectionCard title="Item Drops">
                  {pokemon.drops.length > 0 ? (
                    <div className="flex flex-col gap-1.5">
                      {pokemon.drops.map((drop: ItemDrop) => (
                        <div
                          key={drop.item}
                          className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <Package className="w-4 h-4 text-zinc-600 shrink-0" />
                            <span className="text-sm text-zinc-200">{drop.displayName}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-zinc-600">
                              ×
                              {drop.minCount === drop.maxCount
                                ? drop.minCount
                                : `${drop.minCount}–${drop.maxCount}`}
                            </span>
                            <span
                              className="font-bold tabular-nums"
                              style={{ color: `rgb(var(--type-${primaryType}))` }}
                            >
                              {formatDropChance(drop.chance)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-600 italic">No item drops recorded.</p>
                  )}
                </SectionCard>
              </div>
            </div>
          )}

          {/* ── Base Stats tab ────────────────────────────────────── */}
          {activeTab === "base-stats" && (
            <div className="max-w-2xl mx-auto pb-12">
              <SectionCard title="Base Stats">
                <StatBar stats={activeForm?.baseStats ?? pokemon.baseStats} />
              </SectionCard>
            </div>
          )}

          {/* ── Spawns tab ────────────────────────────────────────── */}
          {activeTab === "spawns" && (
            <div className="pb-12">
              {pokemon.spawns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
                    <MapPin className="w-5 h-5 text-zinc-600" />
                  </div>
                  <p className="text-sm font-semibold text-zinc-500">
                    Este Pokémon não possui dados de spawn registrados
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {(pokemon.spawns as SpawnEntryData[]).map((spawn) => (
                    <SpawnCard key={spawn.id} spawn={spawn} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Moves tab ─────────────────────────────────────────── */}
          {activeTab === "moves" && (
            <div className="pb-12">
              <MovesTable moves={pokemon.moves} />
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export function ErrorBoundary() {
  return <RouteErrorBoundary routeName="Detalhe do Pokémon" />;
}
