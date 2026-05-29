import { Link, useParams } from "react-router";
import { RouteErrorBoundary } from "~/components/layout/route-error-boundary";
import * as Accordion from "@radix-ui/react-accordion";
import {
  ArrowLeft,
  ChevronDown,
  Clock,
  Lightbulb,
  AlertTriangle,
  List,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { cn } from "~/lib/utils";
import {
  getGuideBySlug,
  type GuideSection,
  type Difficulty,
} from "~/content/guides/index";

// Re-export DIFFICULTY_CONFIG is not in content file yet — define locally
const DIFF_CONFIG: Record<Difficulty, { label: string; className: string }> = {
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

// ── Google Fonts ───────────────────────────────────────────────────────────

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

// ── Sub-components ─────────────────────────────────────────────────────────

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const cfg = DIFF_CONFIG[difficulty];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5",
        "text-[11px] font-bold uppercase tracking-widest",
        cfg.className
      )}
    >
      {cfg.label}
    </span>
  );
}

function Section({ section }: { section: GuideSection }) {
  return (
    <div className="space-y-3">
      {section.heading && (
        <h2
          className="text-base font-semibold text-foreground/90"
          style={{ fontFamily: "'Cinzel', Georgia, serif" }}
        >
          {section.heading}
        </h2>
      )}

      <p className="text-sm text-muted-foreground leading-relaxed">{section.body}</p>

      {section.list && section.list.length > 0 && (
        <ul className="space-y-1.5 pl-1">
          {section.list.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
              <List
                size={13}
                className="mt-0.5 shrink-0 text-primary/50"
              />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      )}

      {section.tip && (
        <div className="flex gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/8 px-3.5 py-3">
          <Lightbulb
            size={14}
            className="mt-0.5 shrink-0 text-emerald-400"
            strokeWidth={1.5}
          />
          <p className="text-xs text-emerald-300/80 leading-relaxed">
            <strong className="text-emerald-300 font-semibold">Dica: </strong>
            {section.tip}
          </p>
        </div>
      )}

      {section.warning && (
        <div className="flex gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/8 px-3.5 py-3">
          <AlertTriangle
            size={14}
            className="mt-0.5 shrink-0 text-rose-400"
            strokeWidth={1.5}
          />
          <p className="text-xs text-rose-300/80 leading-relaxed">
            <strong className="text-rose-300 font-semibold">Atenção: </strong>
            {section.warning}
          </p>
        </div>
      )}
    </div>
  );
}

function FaqAccordion({
  items,
}: {
  items: NonNullable<ReturnType<typeof getGuideBySlug>>["faq"];
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mt-8 space-y-3">
      <div className="flex items-center gap-2.5 mb-4">
        <HelpCircle size={16} className="text-primary/60" strokeWidth={1.5} />
        <h2
          className="text-base font-semibold text-foreground/90"
          style={{ fontFamily: "'Cinzel', Georgia, serif" }}
        >
          Perguntas Frequentes
        </h2>
      </div>

      <Accordion.Root type="multiple" className="space-y-2">
        {items.map((item) => (
          <Accordion.Item
            key={item.id}
            value={item.id}
            className={cn(
              "rounded-lg border border-border/40 bg-card/20 overflow-hidden",
              "data-[state=open]:border-primary/30 data-[state=open]:bg-card/40",
              "transition-colors duration-200"
            )}
          >
            <Accordion.Header>
              <Accordion.Trigger
                className={cn(
                  "group flex w-full items-center justify-between gap-3",
                  "px-4 py-3 text-left text-sm font-medium text-foreground/80",
                  "hover:text-foreground transition-colors duration-200",
                  "data-[state=open]:text-foreground"
                )}
              >
                <span className="leading-snug">{item.question}</span>
                <ChevronDown
                  size={14}
                  className={cn(
                    "shrink-0 text-muted-foreground/50 transition-transform duration-300",
                    "group-data-[state=open]:rotate-180 group-data-[state=open]:text-primary/60"
                  )}
                />
              </Accordion.Trigger>
            </Accordion.Header>

            <Accordion.Content
              className={cn(
                "overflow-hidden text-sm text-muted-foreground",
                "data-[state=open]:animate-accordion-down",
                "data-[state=closed]:animate-accordion-up"
              )}
            >
              <div className="border-t border-border/30 px-4 py-3 leading-relaxed">
                {item.answer}
              </div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
}

// ── Not found state ────────────────────────────────────────────────────────

function GuideNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <BookOpen size={40} className="text-muted-foreground/20" strokeWidth={1} />
      <div className="space-y-1">
        <p className="text-base font-medium text-foreground/60">
          Guia não encontrado
        </p>
        <p className="text-sm text-muted-foreground">
          O guia que você procura não existe ou foi movido.
        </p>
      </div>
      <Link
        to="/guides"
        className="inline-flex items-center gap-1.5 text-sm text-primary/70 hover:text-primary underline underline-offset-2 transition-colors"
      >
        <ArrowLeft size={13} /> Voltar aos guias
      </Link>
    </div>
  );
}

// ── Page component ─────────────────────────────────────────────────────────

export default function GuideDetail() {
  const { slug } = useParams<{ slug: string }>();
  const guide = slug ? getGuideBySlug(slug) : undefined;

  if (!guide) {
    return (
      <div className="px-4 py-6 md:px-6 lg:px-8">
        <GuideNotFound />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] px-4 py-6 md:px-6 lg:px-8">
      {/* Subtle background texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Ccircle cx='30' cy='30' r='28' fill='none' stroke='%23ffffff' stroke-width='0.5'/%3E%3Ccircle cx='30' cy='30' r='14' fill='none' stroke='%23ffffff' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-2xl mx-auto">
        {/* Back nav */}
        <Link
          to="/guides"
          className={cn(
            "mb-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground/60",
            "hover:text-muted-foreground transition-colors uppercase tracking-wider"
          )}
        >
          <ArrowLeft size={12} />
          Compêndio de Guias
        </Link>

        {/* Header */}
        <div className="mb-8 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-4xl select-none" role="img" aria-hidden>
              {guide.thumbnail}
            </div>
            <DifficultyBadge difficulty={guide.difficulty} />
          </div>

          <h1
            className="text-2xl font-bold text-foreground/95 leading-tight"
            style={{ fontFamily: "'Cinzel', Georgia, serif" }}
          >
            {guide.title}
          </h1>

          <p
            className="text-sm text-muted-foreground/70 leading-relaxed"
            style={{
              fontFamily: "'IM Fell English', Georgia, serif",
              fontStyle: "italic",
            }}
          >
            {guide.description}
          </p>

          <div className="flex items-center gap-4 pt-1">
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50 uppercase tracking-wider">
              <Clock size={11} strokeWidth={1.5} />
              {guide.estimatedTime}
            </span>
            <div className="h-3 w-px bg-border/40" />
            <span className="text-[11px] text-muted-foreground/40 uppercase tracking-wider">
              {guide.tags.join(" · ")}
            </span>
          </div>

          <div className="h-px bg-gradient-to-r from-primary/20 via-primary/5 to-transparent mt-2" />
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {guide.sections.map((section, i) => (
            <Section key={i} section={section} />
          ))}
        </div>

        {/* FAQ Accordion (if present) */}
        {guide.faq && guide.faq.length > 0 && (
          <FaqAccordion items={guide.faq} />
        )}

        {/* Footer nav */}
        <div className="mt-10 pt-6 border-t border-border/20">
          <Link
            to="/guides"
            className={cn(
              "inline-flex items-center gap-1.5 text-xs text-primary/60",
              "hover:text-primary transition-colors uppercase tracking-wider"
            )}
          >
            <ArrowLeft size={12} />
            Voltar ao Compêndio
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return <RouteErrorBoundary routeName="Guia" />;
}
