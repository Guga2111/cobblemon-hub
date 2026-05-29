import React, { useState } from "react";
import { Link } from "react-router";
import { RouteErrorBoundary } from "~/components/layout/route-error-boundary";
import { Trees, Mountain, Leaf, Dumbbell, Sparkles, Settings, ScrollText, Clock, ChevronRight, Filter } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  GUIDES,
  ALL_CATEGORIES,
  type Guide,
  type Difficulty,
  type GuideCategory,
} from "~/content/guides/index";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

// ── Constants ─────────────────────────────────────────────────────────────

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; className: string }> = {
  Easy: { label: "Facil", className: "bg-emerald-500/15 text-emerald-400 border-emerald-400/30" },
  Medium: { label: "Medio", className: "bg-primary/15 text-primary border-primary/30" },
  Hard: { label: "Dificil", className: "bg-rose-500/15 text-rose-400 border-rose-400/30" },
};

const CATEGORY_CONFIG: Record<GuideCategory, { icon: React.ComponentType<{ size?: number; className?: string }>; color: string }> = {
  Apricorns: { icon: Trees, color: "text-emerald-400" },
  Tumblestones: { icon: Mountain, color: "text-muted-foreground" },
  "Berry Farming": { icon: Leaf, color: "text-rose-400" },
  "EV Training Spots": { icon: Dumbbell, color: "text-blue-400" },
  "Shiny Hunting": { icon: Sparkles, color: "text-primary" },
  "Instalação": { icon: Settings, color: "text-violet-400" },
};

// ── Sub-components ────────────────────────────────────────────────────────

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  return (
    <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded", cfg.className)}>
      {cfg.label}
    </Badge>
  );
}

function CategoryTag({ tag }: { tag: GuideCategory }) {
  const cfg = CATEGORY_CONFIG[tag];
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
      <Icon size={10} className={cfg.color} />
      {tag}
    </span>
  );
}

function GuideCard({ guide, index }: { guide: Guide; index: number }) {
  return (
    <Link
      to={`/guides/${guide.slug}`}
      className="animate-fade-in opacity-0"
      style={{ animationDelay: `${index * 75}ms` }}
    >
      <Card className={cn(
        "group h-full overflow-hidden transition-all duration-300 py-0",
        "hover:border-primary/30 hover:shadow-[0_0_24px_-6px_hsl(var(--primary)/0.2)]",
        "bg-card/60"
      )}>
        <div className="relative flex h-32 items-center justify-center overflow-hidden border-b border-border/30 bg-gradient-to-br from-muted/15 to-muted/5">
          <img
            src={guide.thumbnail}
            alt=""
            className="w-16 h-16 object-contain transition-transform duration-500 group-hover:scale-110"
            style={{ imageRendering: "pixelated", filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.25))" }}
            aria-hidden
          />
          <div className="absolute right-2.5 top-2.5">
            <DifficultyBadge difficulty={guide.difficulty} />
          </div>
        </div>

        <CardContent className="flex flex-1 flex-col gap-2.5 p-4">
          <h3 className="text-sm font-bold text-foreground/90 leading-snug group-hover:text-primary transition-colors">
            {guide.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">
            {guide.description}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {guide.tags.map((tag) => <CategoryTag key={tag} tag={tag} />)}
          </div>
          <div className="flex items-center justify-between border-t border-border/20 pt-2.5 mt-0.5">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground/50 font-medium">
              <Clock size={10} />
              {guide.estimatedTime}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-primary/60 font-semibold group-hover:text-primary transition-colors">
              Ler guia
              <ChevronRight size={11} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ── Page component ────────────────────────────────────────────────────────

export default function Guides() {
  const [activeCategory, setActiveCategory] = useState<GuideCategory | null>(null);

  const filtered = activeCategory === null
    ? GUIDES
    : GUIDES.filter((g) => g.tags.includes(activeCategory));

  return (
    <div className="relative min-h-[calc(100vh-4rem)] px-4 py-6 md:px-6 lg:px-8">
      <div className="relative mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 border border-primary/20 shadow-[0_0_10px_-2px_hsl(var(--primary)/0.15)]">
            <ScrollText size={16} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground leading-tight tracking-tight">Guias</h1>
            <p className="text-xs text-muted-foreground font-medium">{GUIDES.length} guias disponiveis</p>
          </div>
        </div>
      </div>

      <div className="relative mb-6">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter size={11} className="text-muted-foreground/40 shrink-0 mr-0.5" />
          <Button
            variant={activeCategory === null ? "default" : "outline"}
            size="xs"
            onClick={() => setActiveCategory(null)}
            className={cn(
              "uppercase tracking-wider font-bold text-[11px]",
              activeCategory === null && "bg-primary/15 text-primary border border-primary/30 shadow-none hover:bg-primary/25"
            )}
          >
            Todos
          </Button>
          {ALL_CATEGORIES.map((cat) => {
            const cfg = CATEGORY_CONFIG[cat];
            const isActive = activeCategory === cat;
            const Icon = cfg.icon;
            return (
              <Button
                key={cat}
                variant={isActive ? "default" : "outline"}
                size="xs"
                onClick={() => setActiveCategory(isActive ? null : cat)}
                className={cn(
                  "uppercase tracking-wider font-bold text-[11px] gap-1.5",
                  isActive && "bg-primary/15 text-primary border border-primary/30 shadow-none hover:bg-primary/25"
                )}
              >
                <Icon size={11} className={isActive ? "" : cfg.color} />
                {cat}
              </Button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed py-16">
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <ScrollText size={32} className="text-muted-foreground/20" strokeWidth={1} />
            <p className="text-sm text-muted-foreground">Nenhum guia encontrado para esta categoria.</p>
            <Button variant="link" size="sm" onClick={() => setActiveCategory(null)} className="text-primary">
              Ver todos os guias
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((guide, i) => (
            <GuideCard key={guide.slug} guide={guide} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ErrorBoundary() {
  return <RouteErrorBoundary routeName="Guias" />;
}
