import { useState } from "react";
import type { MetaFunction } from "react-router";
import { RouteErrorBoundary } from "~/components/layout/route-error-boundary";
import { cn } from "~/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  MapPin,
  Building2,
  ShoppingCart,
  Landmark,
  Sparkles,
  Home,
  ChevronDown,
  Layers,
} from "lucide-react";

import structuresData from "../../../data/structures.json";

export const meta: MetaFunction = () => [
  { title: "Mapa & Estruturas — Cobbleverse Hub" },
  { name: "description", content: "Todas as estruturas do Cobbleverse — ginasios, lojas, santuarios e vilas" },
];

export function ErrorBoundary() {
  return <RouteErrorBoundary routeName="Mapa" />;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  gyms: Building2,
  league: Sparkles,
  commercial: ShoppingCart,
  legendary: Landmark,
  special: Sparkles,
  villages: Home,
};

const CATEGORY_COLORS: Record<string, string> = {
  gyms: "text-red-500 bg-red-500/10 border-red-500/20",
  league: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  commercial: "text-green-500 bg-green-500/10 border-green-500/20",
  legendary: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  special: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
  villages: "text-blue-500 bg-blue-500/10 border-blue-500/20",
};

const REGION_LABELS: Record<string, string> = {
  kanto: "Kanto",
  johto: "Johto",
  hoenn: "Hoenn",
  sinnoh: "Sinnoh",
};

interface Structure {
  name: string;
  biome: string;
  region: string | null;
  npc: string | null;
  type: string | null;
}

interface StructureCategory {
  id: string;
  name: string;
  description: string;
  structures: Structure[];
}

function CategorySection({ category }: { category: StructureCategory }) {
  const [expanded, setExpanded] = useState(true);
  const Icon = CATEGORY_ICONS[category.id] ?? Layers;
  const colorClass = CATEGORY_COLORS[category.id] ?? "";

  return (
    <Card className="border-border/30 bg-card/40 backdrop-blur-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset rounded-t-xl"
      >
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl border shrink-0", colorClass)}>
              <Icon size={18} />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">{category.name}</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {category.structures.length} estruturas
              </CardDescription>
            </div>
            <ChevronDown
              size={16}
              className={cn(
                "shrink-0 text-muted-foreground/40 transition-transform duration-200",
                expanded && "rotate-180"
              )}
            />
          </div>
        </CardHeader>
      </button>

      {expanded && (
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            {category.description}
          </p>

          <div className="rounded-lg border border-border/20 overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_auto] gap-2 px-3 py-2 bg-muted/10 border-b border-border/10">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-bold">Estrutura</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-bold">Bioma</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-bold">Regiao</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-bold">NPC</span>
            </div>
            <div className="divide-y divide-border/10">
              {category.structures.map((structure) => (
                <div
                  key={structure.name}
                  className="flex flex-col sm:grid sm:grid-cols-[1fr_1fr_auto_auto] gap-1 sm:gap-2 px-3 py-2.5 hover:bg-muted/10 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{structure.name}</span>
                    {structure.type && (
                      <Badge variant="outline" className="text-[8px] border-border/30 text-muted-foreground/60 hidden sm:inline-flex">
                        {structure.type}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin size={10} className="shrink-0 sm:hidden" />
                    {structure.biome}
                  </div>
                  <div className="text-xs text-muted-foreground/60 sm:text-center min-w-[60px]">
                    {structure.region ? REGION_LABELS[structure.region] : "—"}
                  </div>
                  <div className="text-xs text-muted-foreground/60 sm:text-right min-w-[80px]">
                    {structure.npc ?? "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function MapPage() {
  const categories = structuresData.categories as StructureCategory[];
  const totalStructures = categories.reduce((sum, cat) => sum + cat.structures.length, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
          Mapa & Estruturas
        </h1>
        <p className="text-sm text-muted-foreground">
          {totalStructures} estruturas em {categories.length} categorias — ginasios, lojas, santuarios e mais
        </p>
      </div>

      {/* Category badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.id] ?? Layers;
          return (
            <Badge key={cat.id} variant="outline" className={cn("text-[10px]", CATEGORY_COLORS[cat.id]?.split(" ").slice(0, 2).join(" "))}>
              <Icon size={10} className="mr-1" />
              {cat.name} ({cat.structures.length})
            </Badge>
          );
        })}
      </div>

      <div className="space-y-4">
        {categories.map((category) => (
          <CategorySection key={category.id} category={category} />
        ))}
      </div>

      <Card className="mt-6 border-border/20 bg-card/20 border-dashed">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <MapPin size={14} className="text-muted-foreground/40 mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground/60 leading-relaxed space-y-1">
              <p>Use <strong className="text-foreground">/locate structure cobbleverse:nome</strong> no chat do Minecraft para encontrar estruturas especificas.</p>
              <p>Vilas geram naturalmente durante a geracao do mundo. Ginasios e santuarios tambem geram automaticamente em seus biomas correspondentes.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
