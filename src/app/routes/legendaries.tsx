import { useState } from "react";
import type { MetaFunction } from "react-router";
import { RouteErrorBoundary } from "~/components/layout/route-error-boundary";
import { cn } from "~/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Star, Sparkles, MapPin, Crosshair, Globe, ChevronDown } from "lucide-react";

import legendariesData from "../../../data/legendaries.json";

export const meta: MetaFunction = () => [
  { title: "Lendarios & Miticos — Cobbleverse Hub" },
  { name: "description", content: "Todos os Pokemon Lendarios e Miticos do Cobbleverse — como obter, localizacao e dimensoes" },
];

export function ErrorBoundary() {
  return <RouteErrorBoundary routeName="Lendarios" />;
}

type Category = "all" | "legendary" | "mythical";
type ObtainMethod = "all" | "shrine" | "raid";

const TYPE_COLORS: Record<string, string> = {
  normal: "bg-zinc-400/20 text-zinc-400 border-zinc-400/30",
  fire: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  water: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  electric: "bg-yellow-400/20 text-yellow-400 border-yellow-400/30",
  grass: "bg-green-500/20 text-green-400 border-green-500/30",
  ice: "bg-cyan-400/20 text-cyan-400 border-cyan-400/30",
  fighting: "bg-red-600/20 text-red-400 border-red-600/30",
  poison: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  ground: "bg-amber-600/20 text-amber-500 border-amber-600/30",
  flying: "bg-indigo-400/20 text-indigo-400 border-indigo-400/30",
  psychic: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  bug: "bg-lime-500/20 text-lime-400 border-lime-500/30",
  rock: "bg-amber-700/20 text-amber-600 border-amber-700/30",
  ghost: "bg-violet-600/20 text-violet-400 border-violet-600/30",
  dragon: "bg-indigo-600/20 text-indigo-400 border-indigo-600/30",
  dark: "bg-neutral-600/20 text-neutral-400 border-neutral-600/30",
  steel: "bg-slate-400/20 text-slate-400 border-slate-400/30",
  fairy: "bg-pink-400/20 text-pink-300 border-pink-400/30",
};

const REGION_LABELS: Record<string, string> = {
  kanto: "Kanto",
  johto: "Johto",
  hoenn: "Hoenn",
  sinnoh: "Sinnoh",
};

const DIMENSION_COLORS: Record<string, string> = {
  overworld: "text-green-500 border-green-500/30",
  nether: "text-red-500 border-red-500/30",
  distortion_world: "text-purple-500 border-purple-500/30",
  nightmare: "text-violet-500 border-violet-500/30",
  origin: "text-amber-500 border-amber-500/30",
};

interface Legendary {
  id: string;
  displayName: string;
  dexNumber: number;
  types: string[];
  generation: number;
  category: string;
  region: string;
  obtainMethod: string;
  biome: string | null;
  dimension: string;
  description: string;
}

function LegendaryCard({ pokemon }: { pokemon: Legendary }) {
  const spriteUrl = `https://play.pokemonshowdown.com/sprites/gen5/${pokemon.id}.png`;
  const dimColor = DIMENSION_COLORS[pokemon.dimension] ?? "";
  const dimData = legendariesData.dimensions.find((d) => d.id === pokemon.dimension);
  const methodData = legendariesData.obtainMethods[pokemon.obtainMethod as keyof typeof legendariesData.obtainMethods];

  return (
    <Card className="border-border/30 bg-card/40 backdrop-blur-sm overflow-hidden group hover:shadow-[0_0_20px_-4px_hsl(var(--primary)/0.1)] transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted/20 border border-border/20 shrink-0">
            <img
              src={spriteUrl}
              alt={pokemon.displayName}
              className="h-12 w-12 object-contain pixelated"
              loading="lazy"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-foreground truncate">{pokemon.displayName}</h3>
              <span className="text-[10px] tabular-nums text-muted-foreground/50">#{pokemon.dexNumber}</span>
            </div>

            <div className="flex flex-wrap gap-1 mb-2">
              {pokemon.types.map((type) => (
                <span key={type} className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase", TYPE_COLORS[type] ?? "")}>
                  {type}
                </span>
              ))}
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px]",
                  pokemon.category === "mythical"
                    ? "border-pink-500/30 text-pink-400"
                    : "border-amber-500/30 text-amber-400"
                )}
              >
                {pokemon.category === "mythical" ? "Mitico" : "Lendario"}
              </Badge>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">
              {pokemon.description}
            </p>

            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
              {methodData && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Crosshair size={10} className="shrink-0" />
                  <span>{methodData.name}</span>
                </div>
              )}
              {pokemon.biome && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin size={10} className="shrink-0" />
                  <span>{pokemon.biome}</span>
                </div>
              )}
              {dimData && (
                <div className={cn("flex items-center gap-1", dimColor.split(" ")[0])}>
                  <Globe size={10} className="shrink-0" />
                  <span>{dimData.name}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-muted-foreground/50">
                <span>{REGION_LABELS[pokemon.region]}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LegendariesPage() {
  const [category, setCategory] = useState<Category>("all");
  const [method, setMethod] = useState<ObtainMethod>("all");
  const [expandedDim, setExpandedDim] = useState<string | null>(null);

  const legends = legendariesData.legendaries as Legendary[];

  const filtered = legends.filter((p) => {
    if (category !== "all" && p.category !== category) return false;
    if (method !== "all" && p.obtainMethod !== method) return false;
    return true;
  });

  const groupedByRegion = Object.entries(REGION_LABELS).map(([key, label]) => ({
    region: key,
    label,
    pokemon: filtered.filter((p) => p.region === key),
  })).filter((g) => g.pokemon.length > 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
          Lendarios & Miticos
        </h1>
        <p className="text-sm text-muted-foreground">
          {legends.length} Pokemon especiais — santuarios, raids e dimensoes exclusivas
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex gap-1 rounded-lg border border-border/30 p-0.5">
          {([["all", "Todos"], ["legendary", "Lendarios"], ["mythical", "Miticos"]] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setCategory(val)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                category === val
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-1 rounded-lg border border-border/30 p-0.5">
          {([["all", "Todos"], ["shrine", "Santuario"], ["raid", "Raid"]] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setMethod(val)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                method === val
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge variant="outline" className="border-amber-500/30 text-amber-500 text-[10px]">
          <Star size={10} className="mr-1" />
          {legends.filter((p) => p.category === "legendary").length} Lendarios
        </Badge>
        <Badge variant="outline" className="border-pink-500/30 text-pink-400 text-[10px]">
          <Sparkles size={10} className="mr-1" />
          {legends.filter((p) => p.category === "mythical").length} Miticos
        </Badge>
        <Badge variant="outline" className="border-green-500/30 text-green-500 text-[10px]">
          <MapPin size={10} className="mr-1" />
          {legends.filter((p) => p.obtainMethod === "shrine").length} Santuarios
        </Badge>
      </div>

      {/* Grouped list */}
      {groupedByRegion.map((group) => (
        <div key={group.region} className="mb-6">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 mb-3 px-1">
            {group.label} — {group.pokemon.length} Pokemon
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {group.pokemon.map((p) => (
              <LegendaryCard key={p.id} pokemon={p} />
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <Card className="border-border/20 bg-card/20">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">Nenhum Pokemon encontrado com esses filtros.</p>
          </CardContent>
        </Card>
      )}

      {/* Dimensions info */}
      <Separator className="my-6 opacity-30" />
      <h2 className="text-sm font-bold text-foreground mb-3">Dimensoes do Cobbleverse</h2>
      <div className="space-y-2">
        {legendariesData.dimensions.map((dim) => (
          <Card key={dim.id} className="border-border/20 bg-card/20">
            <button
              onClick={() => setExpandedDim(expandedDim === dim.id ? null : dim.id)}
              className="w-full text-left"
            >
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe size={14} className={DIMENSION_COLORS[dim.id]?.split(" ")[0] ?? "text-muted-foreground"} />
                    <CardTitle className="text-sm">{dim.name}</CardTitle>
                  </div>
                  <ChevronDown
                    size={14}
                    className={cn(
                      "text-muted-foreground/40 transition-transform duration-200",
                      expandedDim === dim.id && "rotate-180"
                    )}
                  />
                </div>
              </CardHeader>
            </button>
            {expandedDim === dim.id && (
              <CardContent className="pt-0 pb-3">
                <p className="text-xs text-muted-foreground leading-relaxed">{dim.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {legends
                    .filter((p) => p.dimension === dim.id)
                    .map((p) => (
                      <Badge key={p.id} variant="outline" className="text-[9px] border-border/30">
                        {p.displayName}
                      </Badge>
                    ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
