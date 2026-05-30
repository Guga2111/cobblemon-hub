import type { MetaFunction } from "react-router";
import { RouteErrorBoundary } from "~/components/layout/route-error-boundary";
import { cn } from "~/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  Star,
  Users,
  Zap,
  Shield,
  Coins,
  Cpu,
  Heart,
  Sparkles,
} from "lucide-react";

import raidsData from "../../../data/raids.json";

export const meta: MetaFunction = () => [
  { title: "Raids — Cobbleverse Hub" },
  { name: "description", content: "Guia completo de Raids do Cobbleverse — tiers, recompensas e mecanicas" },
];

export function ErrorBoundary() {
  return <RouteErrorBoundary routeName="Raids" />;
}

interface RaidTier {
  id: string;
  tier: number;
  stars: number;
  displayName: string;
  difficulty: string;
  maxPlayers: number;
  bossLevel: number;
  rewardLevel: number;
  healthMultiplier: number;
  maxIvs: number;
  currency: number;
  energy: number;
  ai: string;
  description: string;
  pokemonPool: string[] | null;
  rewards: string[];
  location: string | null;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  "Facil": "text-green-500 border-green-500/30 bg-green-500/10",
  "Medio": "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
  "Dificil": "text-orange-500 border-orange-500/30 bg-orange-500/10",
  "Muito Dificil": "text-red-500 border-red-500/30 bg-red-500/10",
  "Extremo": "text-purple-500 border-purple-500/30 bg-purple-500/10",
};

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 7 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={cn(
            "transition-colors",
            i < count ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"
          )}
        />
      ))}
    </div>
  );
}

function StatItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={12} className="text-muted-foreground/60 shrink-0" />
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50">{label}</span>
      <span className="text-xs font-bold tabular-nums text-foreground ml-auto">{value}</span>
    </div>
  );
}

function RaidCard({ raid }: { raid: RaidTier }) {
  const difficultyClass = DIFFICULTY_COLORS[raid.difficulty] ?? "";

  return (
    <Card className="border-border/30 bg-card/40 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl border shrink-0",
              raid.tier >= 6 ? "bg-purple-500/15 border-purple-500/30" : raid.tier >= 4 ? "bg-amber-500/15 border-amber-500/30" : "bg-primary/10 border-primary/20"
            )}>
              <span className={cn(
                "text-lg font-bold",
                raid.tier >= 6 ? "text-purple-500" : raid.tier >= 4 ? "text-amber-500" : "text-primary"
              )}>
                {raid.tier}
              </span>
            </div>
            <div>
              <CardTitle className="text-sm">{raid.displayName}</CardTitle>
              <StarRating count={raid.stars} />
            </div>
          </div>
          <Badge variant="outline" className={cn("text-[10px] font-bold", difficultyClass)}>
            {raid.difficulty}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          {raid.description}
        </p>

        <Separator className="mb-3 opacity-30" />

        <div className="grid grid-cols-2 gap-2">
          <StatItem icon={Zap} label="Boss" value={`Lv.${raid.bossLevel}`} />
          <StatItem icon={Users} label="Jogadores" value={raid.maxPlayers} />
          <StatItem icon={Heart} label="HP" value={`x${raid.healthMultiplier}`} />
          <StatItem icon={Sparkles} label="IVs Max" value={raid.maxIvs} />
          <StatItem icon={Coins} label="Reward" value={`$${raid.currency.toLocaleString()}`} />
          <StatItem icon={Cpu} label="IA" value={raid.ai === "strong" ? "Forte" : "Aleatoria"} />
        </div>

        {raid.tier >= 5 && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
            <Shield size={12} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[10px] text-amber-500/80 leading-relaxed">
              Boss usa mecanicas de Shield e Reset durante a batalha
            </p>
          </div>
        )}

        {raid.rewards && raid.rewards.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-1.5">
              Recompensas possíveis
            </p>
            <div className="flex flex-wrap gap-1">
              {raid.rewards.slice(0, 8).map((item) => (
                <span
                  key={item}
                  className="inline-block rounded px-1.5 py-0.5 text-[9px] font-mono bg-muted/40 text-muted-foreground/70 border border-border/20"
                >
                  {item.replace(/_/g, " ")}
                </span>
              ))}
              {raid.rewards.length > 8 && (
                <span className="inline-block rounded px-1.5 py-0.5 text-[9px] font-mono bg-muted/20 text-muted-foreground/40 border border-border/10">
                  +{raid.rewards.length - 8} mais
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function RaidsPage() {
  const raw = raidsData as { data?: RaidTier[] } | RaidTier[];
  const raids: RaidTier[] = Array.isArray(raw) ? raw : (raw.data ?? []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
          Raids
        </h1>
        <p className="text-sm text-muted-foreground">
          7 tiers de dificuldade — de raids solo a desafios extremos em grupo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {raids.map((raid) => (
          <RaidCard key={raid.tier} raid={raid} />
        ))}
      </div>

      <Card className="mt-6 border-border/20 bg-card/20 border-dashed">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Zap size={14} className="text-muted-foreground/40 mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground/60 leading-relaxed space-y-1">
              <p>Raid Dens aparecem naturalmente no mundo. Interaja com o cristal para iniciar.</p>
              <p>Cada den pode ser limpo ate 3 vezes antes de desativar. Voce precisa contribuir com pelo menos 16-20% do dano para receber recompensas.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
