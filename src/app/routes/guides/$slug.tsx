import { Link, useParams } from "react-router";
import type { MetaFunction } from "react-router";
import { RouteErrorBoundary } from "~/components/layout/route-error-boundary";

export const meta: MetaFunction = () => [
  { title: "Guia — Cobbleverse Hub" },
  { name: "description", content: "Guia detalhado do Cobbleverse" },
];
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
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";

const DIFF_CONFIG: Record<Difficulty, { label: string; className: string }> = {
  Easy: { label: "Facil", className: "bg-emerald-500/15 text-emerald-400 border-emerald-400/30" },
  Medium: { label: "Medio", className: "bg-primary/15 text-primary border-primary/30" },
  Hard: { label: "Dificil", className: "bg-rose-500/15 text-rose-400 border-rose-400/30" },
};

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const cfg = DIFF_CONFIG[difficulty];
  return (
    <Badge variant="outline" className={cn("text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded", cfg.className)}>
      {cfg.label}
    </Badge>
  );
}

function Section({ section }: { section: GuideSection }) {
  return (
    <div className="space-y-3">
      {section.heading && (
        <h2 className="text-base font-bold text-foreground/90">{section.heading}</h2>
      )}

      <p className="text-sm text-muted-foreground leading-relaxed">{section.body}</p>

      {section.list && section.list.length > 0 && (
        <ul className="space-y-1.5 pl-1">
          {section.list.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
              <List size={13} className="mt-0.5 shrink-0 text-primary/50" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      )}

      {section.tip && (
        <Card className="border-emerald-500/20 bg-emerald-500/5 py-3">
          <CardContent className="flex gap-2.5 px-3.5 py-0">
            <Lightbulb size={14} className="mt-0.5 shrink-0 text-emerald-400" strokeWidth={1.5} />
            <p className="text-xs text-emerald-300/80 leading-relaxed">
              <strong className="text-emerald-300 font-bold">Dica: </strong>
              {section.tip}
            </p>
          </CardContent>
        </Card>
      )}

      {section.warning && (
        <Card className="border-rose-500/20 bg-rose-500/5 py-3">
          <CardContent className="flex gap-2.5 px-3.5 py-0">
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-rose-400" strokeWidth={1.5} />
            <p className="text-xs text-rose-300/80 leading-relaxed">
              <strong className="text-rose-300 font-bold">Atencao: </strong>
              {section.warning}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function FaqAccordion({ items }: { items: NonNullable<ReturnType<typeof getGuideBySlug>>["faq"] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mt-8 space-y-3">
      <div className="flex items-center gap-2.5 mb-4">
        <HelpCircle size={16} className="text-primary/60" strokeWidth={1.5} />
        <h2 className="text-base font-bold text-foreground/90">Perguntas Frequentes</h2>
      </div>

      <Accordion.Root type="multiple" className="space-y-2">
        {items.map((item) => (
          <Accordion.Item
            key={item.id}
            value={item.id}
            className={cn(
              "rounded-xl border border-border/40 bg-card/30 overflow-hidden",
              "data-[state=open]:border-primary/25 data-[state=open]:bg-card/50",
              "transition-colors duration-200"
            )}
          >
            <Accordion.Header>
              <Accordion.Trigger
                className={cn(
                  "group flex w-full items-center justify-between gap-3",
                  "px-4 py-3 text-left text-sm font-semibold text-foreground/80",
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

function GuideNotFound() {
  return (
    <Card className="border-dashed py-20 max-w-sm mx-auto">
      <CardContent className="flex flex-col items-center gap-4 text-center">
        <BookOpen size={40} className="text-muted-foreground/20" strokeWidth={1} />
        <div className="space-y-1">
          <p className="text-base font-bold text-foreground/60">Guia nao encontrado</p>
          <p className="text-sm text-muted-foreground">O guia que voce procura nao existe ou foi movido.</p>
        </div>
        <Button variant="link" size="sm" asChild className="text-primary">
          <Link to="/guides">
            <ArrowLeft size={13} /> Voltar aos guias
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

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
      <div className="relative max-w-2xl mx-auto">
        {/* Back nav */}
        <Button variant="ghost" size="xs" asChild className="mb-6 text-muted-foreground/60 hover:text-muted-foreground uppercase tracking-wider font-bold">
          <Link to="/guides">
            <ArrowLeft size={12} />
            Compendio de Guias
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <img src={guide.thumbnail} alt="" className="w-12 h-12 object-contain" style={{ imageRendering: "pixelated" }} aria-hidden />
            <DifficultyBadge difficulty={guide.difficulty} />
          </div>

          <h1 className="text-2xl font-extrabold text-foreground/95 leading-tight tracking-tight">
            {guide.title}
          </h1>

          <p className="text-sm text-muted-foreground/70 leading-relaxed">
            {guide.description}
          </p>

          <div className="flex items-center gap-4 pt-1">
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50 uppercase tracking-wider font-bold">
              <Clock size={11} strokeWidth={1.5} />
              {guide.estimatedTime}
            </span>
            <Separator orientation="vertical" className="h-3" />
            <span className="text-[11px] text-muted-foreground/40 uppercase tracking-wider font-semibold">
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

        {/* FAQ */}
        {guide.faq && guide.faq.length > 0 && <FaqAccordion items={guide.faq} />}

        {/* Footer nav */}
        <div className="mt-10 pt-6 border-t border-border/20">
          <Button variant="ghost" size="xs" asChild className="text-primary/60 hover:text-primary uppercase tracking-wider font-bold">
            <Link to="/guides">
              <ArrowLeft size={12} />
              Voltar ao Compendio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return <RouteErrorBoundary routeName="Guia" />;
}
