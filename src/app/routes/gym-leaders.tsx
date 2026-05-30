import { useState } from "react";
import type { MetaFunction } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { RouteErrorBoundary } from "~/components/layout/route-error-boundary";
import { TypeBadge } from "~/components/pokemon/type-badge";
import { cn } from "~/lib/utils";
const SHOWDOWN_SPRITE_BASE = "https://play.pokemonshowdown.com/sprites/gen5/";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import {
  Trophy,
  Shield,
  Crown,
  ChevronDown,
  MapPin,
  Terminal,
  Lock,
  Copy,
  Check,
} from "lucide-react";
import type { GymLeader, Region, TrainerRole } from "~/types/gym-leader";
import { REGION_DISPLAY_NAMES, REGION_ORDER, ROLE_DISPLAY_NAMES } from "~/types/gym-leader";
import type { PokemonType } from "~/types/pokemon";

export const meta: MetaFunction = () => [
  { title: "Gym Leaders — Cobbleverse Hub" },
  { name: "description", content: "Todos os Gym Leaders, Elite Four e Champions do Cobbleverse" },
];

export function ErrorBoundary() {
  return <RouteErrorBoundary routeName="Gym Leaders" />;
}

const ROLE_ICONS: Record<TrainerRole, React.ElementType> = {
  "gym-leader": Shield,
  "elite-four": Trophy,
  champion: Crown,
};

function RegionTab({
  region,
  isActive,
  onClick,
  count,
}: {
  region: Region;
  isActive: boolean;
  onClick: () => void;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "bg-primary/12 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.2)]"
          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
      )}
    >
      {isActive && (
        <span className="absolute bottom-0 left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-t-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.4)]" />
      )}
      <span>{REGION_DISPLAY_NAMES[region]}</span>
      <span className={cn(
        "text-[10px] font-bold tabular-nums rounded-full px-1.5 py-0.5",
        isActive ? "bg-primary/20 text-primary" : "bg-muted/40 text-muted-foreground/60"
      )}>
        {count}
      </span>
    </button>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-md border border-border/50 bg-muted/30 px-2 py-1 text-[10px] font-mono text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
      title="Copiar comando"
    >
      <Terminal size={10} />
      <span className="truncate max-w-[180px]">{text}</span>
      {copied ? <Check size={10} className="text-green-500 shrink-0" /> : <Copy size={10} className="shrink-0" />}
    </button>
  );
}

function GymLeaderCard({
  leader,
  isExpanded,
  onToggle,
}: {
  leader: GymLeader;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const RoleIcon = ROLE_ICONS[leader.role];

  return (
    <Card
      className={cn(
        "border-border/30 bg-card/40 backdrop-blur-sm overflow-hidden transition-all duration-300",
        isExpanded && "border-primary/30 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.15)]"
      )}
    >
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset rounded-t-xl"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            {/* Order badge */}
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl shrink-0 border",
              leader.role === "champion"
                ? "bg-amber-500/15 border-amber-500/30 text-amber-500"
                : leader.role === "elite-four"
                  ? "bg-purple-500/15 border-purple-500/30 text-purple-500"
                  : "bg-primary/10 border-primary/20 text-primary"
            )}>
              <RoleIcon size={18} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{leader.name}</CardTitle>
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold border-border/40"
                >
                  {ROLE_DISPLAY_NAMES[leader.role]}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <TypeBadge type={leader.typeSpecialty as PokemonType} size="sm" />
                {leader.badgeName && (
                  <span className="text-xs text-muted-foreground">{leader.badgeName}</span>
                )}
              </div>
            </div>

            {/* Level cap */}
            <div className="text-right shrink-0">
              <div className="text-lg font-bold tabular-nums text-foreground">
                Lv.{leader.levelCap}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium">
                Cap
              </div>
            </div>

            {/* Expand chevron */}
            <ChevronDown
              size={16}
              className={cn(
                "shrink-0 text-muted-foreground/40 transition-transform duration-200",
                isExpanded && "rotate-180"
              )}
            />
          </div>
        </CardHeader>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <CardContent className="pt-0">
          <Separator className="mb-4 opacity-40" />

          {/* Team */}
          <div className="mb-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 mb-2">
              Time
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {leader.team.map((mon, i) => (
                <div
                  key={`${mon.pokemon}-${i}`}
                  className="flex items-center gap-2 rounded-lg border border-border/30 bg-muted/10 px-2.5 py-2"
                >
                  <img
                    src={`${SHOWDOWN_SPRITE_BASE}${mon.pokemon}.png`}
                    alt={mon.displayName}
                    className="w-8 h-8 object-contain shrink-0"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate">{mon.displayName}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[10px] text-muted-foreground font-mono">Lv.{mon.level}</span>
                      {mon.types.map((t) => (
                        <TypeBadge key={t} type={t as PokemonType} size="sm" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {leader.biome && (
              <div className="flex items-center gap-1">
                <MapPin size={11} />
                <span>{leader.biome}</span>
              </div>
            )}
            {leader.unlockRequirement && (
              <div className="flex items-center gap-1">
                <Lock size={11} />
                <span>{leader.unlockRequirement}</span>
              </div>
            )}
          </div>

          {/* Locate command */}
          {leader.locateCommand && (
            <div className="mt-3">
              <CopyButton text={leader.locateCommand} />
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function GymLeadersPage() {
  const [selectedRegion, setSelectedRegion] = useState<Region>("kanto");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: gymLeaders, isLoading } = useQuery({
    queryKey: ["gym-leaders"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3001/api/gym-leaders");
      if (!res.ok) throw new Error("Failed to fetch gym leaders");
      const json = (await res.json()) as { data: GymLeader[] };
      return json.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const allLeaders = gymLeaders ?? [];
  const regionLeaders = allLeaders.filter((l) => l.region === selectedRegion);
  const regionCounts = REGION_ORDER.reduce<Record<Region, number>>((acc, r) => {
    acc[r] = allLeaders.filter((l) => l.region === r).length;
    return acc;
  }, {} as Record<Region, number>);

  const gymLeadersList = regionLeaders.filter((l) => l.role === "gym-leader");
  const eliteFour = regionLeaders.filter((l) => l.role === "elite-four");
  const champion = regionLeaders.find((l) => l.role === "champion");

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
          Gym Leaders
        </h1>
        <p className="text-sm text-muted-foreground">
          {allLeaders.length} treinadores em 4 regioes — derrote todos para se tornar o campeao
        </p>
      </div>

      {/* Region tabs */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
        {REGION_ORDER.map((region) => (
          <RegionTab
            key={region}
            region={region}
            isActive={selectedRegion === region}
            onClick={() => {
              setSelectedRegion(region);
              setExpandedId(null);
            }}
            count={regionCounts[region]}
          />
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-muted/20 animate-shimmer bg-gradient-to-r from-muted/20 via-muted/10 to-muted/20"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      )}

      {/* Gym Leaders section */}
      {!isLoading && gymLeadersList.length > 0 && (
        <section className="mb-8">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 mb-3 px-1">
            Gym Leaders
          </h2>
          <div className="space-y-2">
            {gymLeadersList.map((leader) => (
              <GymLeaderCard
                key={leader.id}
                leader={leader}
                isExpanded={expandedId === leader.id}
                onToggle={() => toggleExpand(leader.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Elite Four section */}
      {!isLoading && eliteFour.length > 0 && (
        <section className="mb-8">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-purple-500/60 mb-3 px-1">
            Elite Four
          </h2>
          <div className="space-y-2">
            {eliteFour.map((leader) => (
              <GymLeaderCard
                key={leader.id}
                leader={leader}
                isExpanded={expandedId === leader.id}
                onToggle={() => toggleExpand(leader.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Champion section */}
      {!isLoading && champion && (
        <section className="mb-8">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-500/60 mb-3 px-1">
            Champion
          </h2>
          <GymLeaderCard
            leader={champion}
            isExpanded={expandedId === champion.id}
            onToggle={() => toggleExpand(champion.id)}
          />
        </section>
      )}

      {/* Progression info */}
      {!isLoading && (
        <Card className="border-border/20 bg-card/20 border-dashed">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Lock size={14} className="text-muted-foreground/40 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground/60 leading-relaxed">
                  As regioes desbloqueiam sequencialmente. Derrote o campeao de uma regiao
                  para acessar a proxima: Kanto → Johto → Hoenn → Sinnoh.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
