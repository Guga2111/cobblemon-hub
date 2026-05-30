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
  MapPin,
} from "lucide-react";
import type { Pokemon, PokemonForm, ItemDrop, PokemonType } from "~/types/pokemon";
import { TypeBadge } from "~/components/pokemon/type-badge";
import { EvolutionChain } from "~/components/pokemon/evolution-chain";
import { StatBar } from "~/components/pokemon/stat-bar";
import { SpawnCard, type SpawnEntryData } from "~/components/pokemon/spawn-card";
import { MovesTable } from "~/components/pokemon/moves-table";
import { cn } from "~/lib/utils";
import { getPokemonSprite, getPokemonSpriteFallback } from "~/lib/sprites";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";

// ── Types ──────────────────────────────────────────────────────────────────

interface PokemonDetail extends Pokemon {
  spawns: unknown[];
  prevId: string | null;
  nextId: string | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatGrowthRate(gr: string): string {
  return gr.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function formatEggGroup(eg: string): string {
  const overrides: Record<string, string> = {
    "no-eggs": "No Eggs", "human-like": "Human-Like",
    water1: "Water 1", water2: "Water 2", water3: "Water 3",
  };
  return overrides[eg] ?? eg.charAt(0).toUpperCase() + eg.slice(1);
}

function formatGender(ratio: number | null): string {
  if (ratio === null) return "Genderless";
  if (ratio === 0) return "100%";
  if (ratio === 8) return "100%";
  const femalePct = ((ratio / 8) * 100).toFixed(1);
  const malePct = (100 - parseFloat(femalePct)).toFixed(1);
  return `${malePct}% / ${femalePct}%`;
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
    <div className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
      <span className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider">{label}</span>
      <span className="text-sm text-foreground/90 font-semibold text-right">{value}</span>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="bg-card/60 border-border/40 py-5">
      <CardContent>
        <h2 className="text-[11px] font-extrabold text-muted-foreground/60 uppercase tracking-widest mb-4">{title}</h2>
        {children}
      </CardContent>
    </Card>
  );
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="h-5 w-24 bg-muted/40 rounded mb-6" />
        <div className="h-64 bg-card/50 rounded-2xl mb-4" />
        <div className="h-10 bg-card/30 rounded-xl mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-4">
            <div className="h-44 bg-card/40 rounded-xl" />
            <div className="h-32 bg-card/40 rounded-xl" />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="h-36 bg-card/40 rounded-xl" />
            <div className="h-28 bg-card/40 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function PokemonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  const [activeFormIndex, setActiveFormIndex] = useState<number>(-1);

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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-5 px-4">
        <Card className="border-destructive/20 bg-destructive/5 max-w-sm py-6">
          <CardContent className="flex items-center gap-3 text-center">
            <AlertTriangle className="w-5 h-5 shrink-0 text-destructive" />
            <p className="text-sm text-muted-foreground">Could not load Pokemon data. It may not exist in the database.</p>
          </CardContent>
        </Card>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/pokedex">
              <ArrowLeft className="w-4 h-4" />
              Back to Pokedex
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => void refetch()} className="text-primary">
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const pokemon = data.data;
  const primaryType: PokemonType = pokemon.types[0];
  const activeForm: PokemonForm | null =
    activeFormIndex >= 0 ? (pokemon.forms[activeFormIndex] ?? null) : null;
  const displayTypes = activeForm?.types ?? pokemon.types;
  const spriteUrl = getPokemonSprite(pokemon.dexNumber);
  const spriteFallback = getPokemonSpriteFallback(pokemon.dexNumber);

  return (
    <>
      <style>{`
        @keyframes pokemon-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .sprite-float { animation: pokemon-float 4s ease-in-out infinite; }
      `}</style>

      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Top nav ───────────────────────────────────────────── */}
          <div className="flex items-center justify-between py-5">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground group">
              <Link to="/pokedex">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                Pokedex
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="xs"
                asChild={!!pokemon.prevId}
                disabled={!pokemon.prevId}
                className={cn(!pokemon.prevId && "opacity-30 cursor-not-allowed")}
              >
                {pokemon.prevId ? (
                  <Link to={`/pokedex/${pokemon.prevId}`}>
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Prev
                  </Link>
                ) : (
                  <span><ChevronLeft className="w-3.5 h-3.5" />Prev</span>
                )}
              </Button>
              <Button
                variant="outline"
                size="xs"
                asChild={!!pokemon.nextId}
                disabled={!pokemon.nextId}
                className={cn(!pokemon.nextId && "opacity-30 cursor-not-allowed")}
              >
                {pokemon.nextId ? (
                  <Link to={`/pokedex/${pokemon.nextId}`}>
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <span>Next<ChevronRight className="w-3.5 h-3.5" /></span>
                )}
              </Button>
            </div>
          </div>

          {/* ── Hero ─────────────────────────────────────────────── */}
          <div
            className="relative rounded-2xl overflow-hidden bg-card/50 border border-border/40 mb-4"
            style={{
              boxShadow: `0 0 60px -15px rgb(var(--type-${primaryType}) / 0.35)`,
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 55% 100% at 75% 50%, rgb(var(--type-${primaryType}) / 0.12), transparent)`,
              }}
            />

            <div className="absolute top-2 left-4 sm:top-4 text-[88px] sm:text-[128px] font-black text-muted-foreground/8 leading-none select-none pointer-events-none tabular-nums tracking-tighter">
              {formatDex(pokemon.dexNumber)}
            </div>

            <div className="relative flex flex-col sm:flex-row items-center gap-4 sm:gap-8 p-6 sm:p-8 lg:p-10">
              <div className="flex-1 z-10 order-2 sm:order-1 flex flex-col gap-3 text-center sm:text-left">
                <div>
                  <p className="text-xs font-extrabold text-muted-foreground/60 tracking-[0.2em] uppercase mb-1">
                    {formatDex(pokemon.dexNumber)}
                  </p>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-none">
                    {activeForm?.displayName ?? pokemon.displayName}
                  </h1>
                </div>

                <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
                  {displayTypes.map((t) => (
                    <TypeBadge key={t} type={t} size="md" />
                  ))}
                </div>

                {pokemon.forms.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap justify-center sm:justify-start">
                    <Badge
                      variant={activeFormIndex === -1 ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => setActiveFormIndex(-1)}
                    >
                      Base
                    </Badge>
                    {pokemon.forms.map((form: PokemonForm, i: number) => (
                      <Badge
                        key={form.name}
                        variant={activeFormIndex === i ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => setActiveFormIndex(i)}
                      >
                        {form.displayName}
                      </Badge>
                    ))}
                  </div>
                )}

                <p className="text-[11px] text-muted-foreground/50 font-semibold">
                  Generation {pokemon.generation}
                </p>
              </div>

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
                    if (!t.dataset.fallback) {
                      t.dataset.fallback = "1";
                      t.src = spriteFallback;
                    }
                  }}
                  loading="eager"
                />
              </div>
            </div>
          </div>

          {/* ── Tabs ─────────────────────────────────────────────── */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList variant="line" className="w-full justify-start border-b border-border/60 rounded-none h-auto p-0">
              <TabsTrigger value="overview" className="px-5 py-3 text-sm font-semibold">
                Overview
              </TabsTrigger>
              <TabsTrigger value="base-stats" className="px-5 py-3 text-sm font-semibold">
                Base Stats
              </TabsTrigger>
              <TabsTrigger value="spawns" className="px-5 py-3 text-sm font-semibold">
                Spawns
              </TabsTrigger>
              <TabsTrigger value="moves" className="px-5 py-3 text-sm font-semibold">
                Moves
              </TabsTrigger>
            </TabsList>

            {/* ── Overview tab ──────────────────────────────────────── */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-12 pt-4">
                <div className="lg:col-span-1 flex flex-col gap-4">
                  <SectionCard title="Info">
                    <InfoRow label="Catch Rate" value={String(pokemon.catchRate)} />
                    <InfoRow label="Base EXP" value={String(pokemon.baseExp)} />
                    <InfoRow label="Growth Rate" value={formatGrowthRate(pokemon.growthRate)} />
                    <InfoRow label="Egg Groups" value={pokemon.eggGroups.map(formatEggGroup).join(", ")} />
                    <InfoRow label="Gender Ratio" value={formatGender(pokemon.genderRatio)} />
                  </SectionCard>

                  {pokemon.abilities.length > 0 && (
                    <SectionCard title="Abilities">
                      <div className="flex flex-col gap-3">
                        {pokemon.abilities.map((ability) => (
                          <div key={ability.name}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-bold text-foreground/90">{ability.displayName}</span>
                              {ability.isHidden && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-md border-primary/40 text-primary bg-primary/10 font-bold">
                                  Hidden
                                </Badge>
                              )}
                            </div>
                            {ability.description && (
                              <p className="text-xs text-muted-foreground/70 leading-relaxed">{ability.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  )}
                </div>

                <div className="lg:col-span-2 flex flex-col gap-4">
                  <SectionCard title="Evolution Chain">
                    <EvolutionChain
                      pokemonId={pokemon.id}
                      pokemonName={pokemon.name}
                      displayName={pokemon.displayName}
                      dexNumber={pokemon.dexNumber}
                      evolutions={pokemon.evolutions}
                    />
                  </SectionCard>

                  <SectionCard title="Item Drops">
                    {pokemon.drops.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {pokemon.drops.map((drop: ItemDrop) => (
                          <div
                            key={drop.item}
                            className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-muted/20 hover:bg-muted/35 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <Package className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                              <span className="text-sm text-foreground/90 font-medium">{drop.displayName}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-muted-foreground/50">
                                x{drop.minCount === drop.maxCount ? drop.minCount : `${drop.minCount}-${drop.maxCount}`}
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
                      <p className="text-sm text-muted-foreground/50 italic">No item drops recorded.</p>
                    )}
                  </SectionCard>
                </div>
              </div>
            </TabsContent>

            {/* ── Base Stats tab ────────────────────────────────────── */}
            <TabsContent value="base-stats">
              <div className="max-w-2xl mx-auto pb-12 pt-4">
                <SectionCard title="Base Stats">
                  <StatBar stats={activeForm?.baseStats ?? pokemon.baseStats} />
                </SectionCard>
              </div>
            </TabsContent>

            {/* ── Spawns tab ────────────────────────────────────────── */}
            <TabsContent value="spawns">
              <div className="pb-12 pt-4">
                {pokemon.spawns.length === 0 ? (
                  <Card className="border-dashed py-16">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-xl bg-muted/30 border border-border flex items-center justify-center mb-4">
                        <MapPin className="w-5 h-5 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm font-semibold text-muted-foreground/70">
                        Este Pokemon nao possui dados de spawn registrados
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex flex-col gap-2">
                    {(pokemon.spawns as SpawnEntryData[]).map((spawn) => (
                      <SpawnCard key={spawn.id} spawn={spawn} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── Moves tab ─────────────────────────────────────────── */}
            <TabsContent value="moves">
              <div className="pb-12 pt-4">
                <MovesTable moves={pokemon.moves} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

export function ErrorBoundary() {
  return <RouteErrorBoundary routeName="Detalhe do Pokemon" />;
}
