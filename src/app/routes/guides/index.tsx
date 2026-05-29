import { useState } from "react";
import { Link } from "react-router";
import {
  ScrollText,
  Clock,
  ChevronRight,
  Filter,
  Sparkles,
} from "lucide-react";
import { cn } from "~/lib/utils";
import {
  GUIDES,
  ALL_CATEGORIES,
  type Guide,
  type Difficulty,
  type GuideCategory,
} from "~/content/guides/index";

// ── Google Fonts ──────────────────────────────────────────────────────────

export function links() {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous" as const,
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=IM+Fell+English:ital@0;1&display=swap",
    },
  ];
}

// ── Constants ─────────────────────────────────────────────────────────────

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; className: string }
> = {
  Easy: {
    label: "Fácil",
    className: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  },
  Medium: {
    label: "Médio",
    className: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  },
  Hard: {
    label: "Difícil",
    className: "bg-rose-500/15 text-rose-300 border-rose-400/30",
  },
};

const CATEGORY_CONFIG: Record<
  GuideCategory,
  { emoji: string; color: string }
> = {
  Apricorns: { emoji: "🌳", color: "text-emerald-400" },
  Tumblestones: { emoji: "🪨", color: "text-zinc-400" },
  "Berry Farming": { emoji: "🍒", color: "text-rose-400" },
  "EV Training Spots": { emoji: "💪", color: "text-blue-400" },
  "Shiny Hunting": { emoji: "✨", color: "text-amber-400" },
  Instalação: { emoji: "⚙️", color: "text-violet-400" },
};

// ── Sub-components ────────────────────────────────────────────────────────

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5",
        "text-[10px] font-bold uppercase tracking-widest",
        cfg.className
      )}
    >
      {cfg.label}
    </span>
  );
}

function CategoryTag({ tag }: { tag: GuideCategory }) {
  const cfg = CATEGORY_CONFIG[tag];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-medium",
        "uppercase tracking-wider text-muted-foreground/60"
      )}
    >
      <span>{cfg.emoji}</span>
      {tag}
    </span>
  );
}

function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link
      to={`/guides/${guide.slug}`}
      className={cn(
        "group relative flex flex-col rounded-lg border border-border/40 bg-card/30 backdrop-blur-sm",
        "overflow-hidden transition-all duration-300",
        "hover:border-primary/35 hover:bg-card/50 hover:shadow-[0_0_24px_-6px_hsl(var(--primary)/0.2)]"
      )}
    >
      {/* Thumbnail strip */}
      <div
        className={cn(
          "relative flex h-32 items-center justify-center overflow-hidden",
          "border-b border-border/30 bg-gradient-to-br from-muted/20 to-muted/5"
        )}
      >
        {/* rune/scroll background texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='18' fill='none' stroke='%23ffffff' stroke-width='0.5'/%3E%3Cline x1='20' y1='2' x2='20' y2='38' stroke='%23ffffff' stroke-width='0.5'/%3E%3Cline x1='2' y1='20' x2='38' y2='20' stroke='%23ffffff' stroke-width='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: "40px 40px",
          }}
        />
        <span
          className="text-5xl transition-transform duration-500 group-hover:scale-110 select-none"
          role="img"
          aria-hidden
        >
          {guide.thumbnail}
        </span>

        {/* difficulty badge pinned top-right */}
        <div className="absolute right-2.5 top-2.5">
          <DifficultyBadge difficulty={guide.difficulty} />
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h3
          className="text-sm font-semibold text-foreground/90 leading-snug group-hover:text-primary transition-colors"
          style={{ fontFamily: "'Cinzel', Georgia, serif" }}
        >
          {guide.title}
        </h3>

        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">
          {guide.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {guide.tags.map((tag) => (
            <CategoryTag key={tag} tag={tag} />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/20 pt-2.5 mt-0.5">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
            <Clock size={10} />
            {guide.estimatedTime}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-primary/60 group-hover:text-primary transition-colors">
            Ler guia
            <ChevronRight
              size={11}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

function GridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-border/30 bg-card/20 overflow-hidden animate-pulse"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="h-32 bg-muted/20" />
          <div className="p-4 flex flex-col gap-3">
            <div className="h-3.5 w-3/4 rounded bg-muted/30" />
            <div className="h-3 w-full rounded bg-muted/20" />
            <div className="h-3 w-2/3 rounded bg-muted/20" />
            <div className="h-3 w-1/4 rounded bg-muted/15 mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page component ────────────────────────────────────────────────────────

export default function Guides() {
  const [activeCategory, setActiveCategory] = useState<GuideCategory | null>(
    null
  );
  const [isLoaded] = useState(true); // static data, always "loaded"

  const filtered =
    activeCategory === null
      ? GUIDES
      : GUIDES.filter((g) => g.tags.includes(activeCategory));

  return (
    <div className="relative min-h-[calc(100vh-4rem)] px-4 py-6 md:px-6 lg:px-8">
      {/* Parchment/rune background texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Ccircle cx='30' cy='30' r='28' fill='none' stroke='%23ffffff' stroke-width='0.5'/%3E%3Ccircle cx='30' cy='30' r='14' fill='none' stroke='%23ffffff' stroke-width='0.5'/%3E%3Cline x1='30' y1='2' x2='30' y2='58' stroke='%23ffffff' stroke-width='0.5'/%3E%3Cline x1='2' y1='30' x2='58' y2='30' stroke='%23ffffff' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Page header */}
      <div className="relative mb-8">
        <div className="mb-2 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
          <span className="text-[10px] uppercase tracking-[0.5em] text-primary/50 font-mono">
            Cobblemon Hub
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2.5">
            <ScrollText
              size={20}
              className="text-primary/60"
              strokeWidth={1.5}
            />
            <h1
              className="text-3xl font-semibold tracking-wide text-foreground/90"
              style={{ fontFamily: "'Cinzel', Georgia, serif" }}
            >
              Compêndio de Guias
            </h1>
            <Sparkles size={16} className="text-amber-400/60" strokeWidth={1.5} />
          </div>
          <p
            className="text-center text-xs text-muted-foreground/50 max-w-md leading-relaxed"
            style={{ fontFamily: "'IM Fell English', Georgia, serif", fontStyle: "italic" }}
          >
            Conhecimento acumulado por aventureiros do mundo Cobblemon
          </p>
        </div>

        <p className="mt-2 text-center text-[11px] uppercase tracking-[0.35em] text-muted-foreground/35 font-mono">
          {GUIDES.length} guias disponíveis
        </p>
      </div>

      {/* Category filter pills */}
      <div className="relative mb-6">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter
            size={11}
            className="text-muted-foreground/40 shrink-0 mr-0.5"
          />
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={cn(
              "rounded border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider transition-all duration-200",
              activeCategory === null
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border/40 bg-muted/10 text-muted-foreground hover:border-border/70 hover:text-foreground"
            )}
          >
            Todos
          </button>
          {ALL_CATEGORIES.map((cat) => {
            const cfg = CATEGORY_CONFIG[cat];
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() =>
                  setActiveCategory(isActive ? null : cat)
                }
                className={cn(
                  "inline-flex items-center gap-1.5 rounded border px-2.5 py-1",
                  "text-[11px] font-medium uppercase tracking-wider transition-all duration-200",
                  isActive
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border/40 bg-muted/10 text-muted-foreground hover:border-border/70 hover:text-foreground"
                )}
              >
                <span className="text-[11px]">{cfg.emoji}</span>
                <span className={isActive ? "" : cfg.color}>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Guide grid */}
      {!isLoaded ? (
        <GridSkeleton />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <ScrollText size={32} className="text-muted-foreground/20" strokeWidth={1} />
          <p className="text-sm text-muted-foreground">
            Nenhum guia encontrado para esta categoria.
          </p>
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className="text-xs text-primary/70 hover:text-primary underline underline-offset-2"
          >
            Ver todos os guias
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((guide) => (
            <GuideCard key={guide.slug} guide={guide} />
          ))}
        </div>
      )}
    </div>
  );
}
