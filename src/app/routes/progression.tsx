import { useState } from "react";
import type { MetaFunction } from "react-router";
import { RouteErrorBoundary } from "~/components/layout/route-error-boundary";
import { cn } from "~/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  Trophy,
  Lock,
  ChevronDown,
  Lightbulb,
  ArrowRight,
  Crown,
  Shield,
} from "lucide-react";

import progressionData from "../../../data/progression.json";

export const meta: MetaFunction = () => [
  { title: "Progressao — Cobbleverse Hub" },
  { name: "description", content: "Guia de progressao do Cobbleverse — regioes, ginasios, level caps e como desbloquear tudo" },
];

export function ErrorBoundary() {
  return <RouteErrorBoundary routeName="Progressao" />;
}

const REGION_COLORS: Record<string, string> = {
  kanto: "text-red-500 bg-red-500/10 border-red-500/20",
  johto: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  hoenn: "text-green-500 bg-green-500/10 border-green-500/20",
  sinnoh: "text-blue-500 bg-blue-500/10 border-blue-500/20",
};

const REGION_ORDER_COLORS: Record<number, string> = {
  1: "from-red-500/20 to-red-500/5",
  2: "from-amber-500/20 to-amber-500/5",
  3: "from-green-500/20 to-green-500/5",
  4: "from-blue-500/20 to-blue-500/5",
};

interface Milestone {
  step: number;
  title: string;
  description: string;
  levelCap: number | null;
}

interface Region {
  id: string;
  name: string;
  order: number;
  unlockRequirement: string | null;
  description: string;
  levelCap: number;
  gyms: number;
  eliteFour: number;
  champion: string;
  milestones: Milestone[];
}

function RegionCard({ region }: { region: Region }) {
  const [expanded, setExpanded] = useState(region.order === 1);
  const colorClass = REGION_COLORS[region.id] ?? "";
  const gradientClass = REGION_ORDER_COLORS[region.order] ?? "";

  return (
    <Card className="border-border/30 bg-card/40 backdrop-blur-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset rounded-t-xl"
      >
        <CardHeader className={cn("bg-gradient-to-r", gradientClass)}>
          <div className="flex items-center gap-3">
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl border shrink-0", colorClass)}>
              <span className="text-lg font-extrabold">{region.order}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{region.name}</CardTitle>
                {region.unlockRequirement && (
                  <Lock size={12} className="text-muted-foreground/40" />
                )}
              </div>
              <CardDescription className="text-xs mt-0.5">
                {region.gyms} Gyms + E4 + Champion {region.champion} — Level cap: {region.levelCap}
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

          {region.unlockRequirement && (
            <div className="flex items-center gap-2 mt-2 rounded-lg border border-border/20 bg-background/50 px-3 py-1.5">
              <Lock size={10} className="text-muted-foreground/50 shrink-0" />
              <span className="text-[10px] text-muted-foreground">
                Requisito: <strong className="text-foreground">{region.unlockRequirement}</strong>
              </span>
            </div>
          )}
        </CardHeader>
      </button>

      {expanded && (
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            {region.description}
          </p>

          {/* Region stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="rounded-lg border border-border/20 bg-muted/10 px-3 py-2 text-center">
              <Shield size={14} className="mx-auto text-muted-foreground/40 mb-1" />
              <div className="text-xs font-bold text-foreground">{region.gyms}</div>
              <div className="text-[9px] text-muted-foreground/50">Ginasios</div>
            </div>
            <div className="rounded-lg border border-border/20 bg-muted/10 px-3 py-2 text-center">
              <Trophy size={14} className="mx-auto text-muted-foreground/40 mb-1" />
              <div className="text-xs font-bold text-foreground">{region.eliteFour}</div>
              <div className="text-[9px] text-muted-foreground/50">Elite Four</div>
            </div>
            <div className="rounded-lg border border-border/20 bg-muted/10 px-3 py-2 text-center">
              <Crown size={14} className="mx-auto text-amber-500/60 mb-1" />
              <div className="text-xs font-bold text-foreground">{region.champion}</div>
              <div className="text-[9px] text-muted-foreground/50">Champion</div>
            </div>
          </div>

          <Separator className="mb-4 opacity-30" />

          {/* Timeline */}
          <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 mb-3">
            Progressao
          </h4>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border/30" />

            <div className="space-y-3">
              {region.milestones.map((milestone, i) => {
                const isLast = i === region.milestones.length - 1;
                return (
                  <div key={milestone.step} className="relative flex gap-3">
                    <div
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold shrink-0 z-10",
                        isLast
                          ? cn("bg-amber-500/15 border-amber-500/30 text-amber-500")
                          : cn(colorClass)
                      )}
                    >
                      {isLast ? <Crown size={10} /> : milestone.step}
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-foreground">{milestone.title}</span>
                        {milestone.levelCap && (
                          <Badge variant="outline" className="text-[9px] border-border/30 text-muted-foreground/60 tabular-nums">
                            Lv.{milestone.levelCap}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function ProgressionPage() {
  const regions = progressionData.regions as Region[];
  const tips = progressionData.tips as string[];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
          Progressao
        </h1>
        <p className="text-sm text-muted-foreground">
          4 regioes, 32 ginasios, 4 ligas — seu caminho de Kanto a Sinnoh
        </p>
      </div>

      {/* Region flow overview */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {regions.map((region, i) => (
          <div key={region.id} className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn("text-xs font-bold", REGION_COLORS[region.id])}
            >
              {region.name}
            </Badge>
            {i < regions.length - 1 && (
              <ArrowRight size={14} className="text-muted-foreground/30" />
            )}
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {regions.map((region) => (
          <RegionCard key={region.id} region={region} />
        ))}
      </div>

      {/* Tips */}
      <Card className="mt-6 border-border/20 bg-card/20 border-dashed">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Lightbulb size={14} className="text-amber-500/60 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-xs font-bold text-foreground mb-2">Dicas de Progressao</h3>
              <ul className="space-y-1.5">
                {tips.map((tip) => (
                  <li key={tip} className="text-[11px] text-muted-foreground/60 leading-relaxed flex items-start gap-2">
                    <span className="text-primary/40 mt-0.5 shrink-0">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
