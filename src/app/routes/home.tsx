import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import { RouteErrorBoundary } from "~/components/layout/route-error-boundary";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Swords,
  Package,
  ScrollText,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { cn } from "~/lib/utils";

export const meta: MetaFunction = () => [
  { title: "Cobbleverse Hub — Home" },
  { name: "description", content: "Plataforma para jogadores do modpack Cobbleverse" },
];

export function ErrorBoundary() {
  return <RouteErrorBoundary routeName="Home" />;
}

const FEATURED_LINK = {
  to: "/pokedex",
  icon: BookOpen,
  title: "Pokedex",
  description: "Explore todos os Pokemon disponíveis no Cobbleverse. Estatísticas, tipos, habilidades e locais de spawn.",
  accent: "from-amber-500/8 to-orange-500/5",
  borderAccent: "hover:border-amber-500/30",
};

const SECONDARY_LINKS = [
  {
    to: "/team-builder",
    icon: Swords,
    title: "Team Builder",
    description: "Monte seu time competitivo de 6 Pokemon",
  },
  {
    to: "/items",
    icon: Package,
    title: "Item Codex",
    description: "Consulte itens, drops e localizacoes",
  },
  {
    to: "/guides",
    icon: ScrollText,
    title: "Guias",
    description: "Tutoriais para dominar o Cobbleverse",
  },
];

const FLOATING_SPRITES = [
  { src: "/sprites/items/sitrus_berry.png", style: { top: "12%", right: "8%", animationDelay: "0s" } },
  { src: "/sprites/items/oran_berry.png", style: { top: "35%", right: "3%", animationDelay: "1.5s" } },
  { src: "/sprites/items/leppa_berry.png", style: { bottom: "20%", right: "12%", animationDelay: "3s" } },
  { src: "/sprites/items/cheri_berry.png", style: { top: "8%", right: "22%", animationDelay: "0.8s" } },
  { src: "/sprites/items/rawst_berry.png", style: { bottom: "35%", right: "5%", animationDelay: "2.2s" } },
];

export default function HomePage() {
  const { data: pokemonData } = useQuery({
    queryKey: ["home-pokemon-count"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3001/api/pokemon?limit=1&page=1");
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ pagination: { total: number } }>;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: itemsData } = useQuery({
    queryKey: ["home-items-count"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3001/api/items");
      if (!res.ok) throw new Error("Failed");
      const json = (await res.json()) as { data: unknown[] };
      return json.data.length;
    },
    staleTime: 5 * 60 * 1000,
  });

  const pokemonCount = pokemonData?.pagination.total ?? 0;
  const itemCount = itemsData ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-5 py-8 md:py-14">
      {/* Hero — asymmetric, no card wrapper */}
      <section className="relative mb-16 md:mb-20">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70 mb-4">
            v1.7.31 &middot; Cobbleverse Modpack
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-5">
            Tudo sobre Cobbleverse,{" "}
            <span className="text-primary">num so lugar.</span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg mb-8">
            Pokedex completa, team builder, catalogo de itens, gym leaders e guias
            detalhados para voce dominar o modpack.
          </p>

          <div className="flex items-center gap-6">
            <Link
              to="/pokedex"
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold",
                "bg-primary text-primary-foreground",
                "hover:brightness-110 active:scale-[0.98] transition-all duration-150"
              )}
            >
              Explorar Pokedex
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/guides"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Ver guias
            </Link>
          </div>
        </div>

        {/* Floating berry sprites — decorative, hidden on small screens */}
        <div className="hidden lg:block absolute inset-y-0 right-0 w-1/3 pointer-events-none select-none" aria-hidden>
          {FLOATING_SPRITES.map((sprite) => (
            <img
              key={sprite.src}
              src={sprite.src}
              alt=""
              className="absolute w-8 h-8 opacity-[0.18] animate-drift"
              style={sprite.style}
            />
          ))}
        </div>
      </section>

      {/* Stats — inline, not cards */}
      <section className="flex flex-wrap gap-x-10 gap-y-3 mb-16 md:mb-20">
        {[
          { label: "Pokemon", value: pokemonCount },
          { label: "Itens", value: itemCount },
          { label: "Guias", value: 6 },
        ].map((stat) => (
          <div key={stat.label} className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-bold text-foreground tabular-nums">
              {stat.value || "---"}
            </span>
            <span className="text-sm text-muted-foreground/70 font-medium">
              {stat.label}
            </span>
          </div>
        ))}
      </section>

      {/* Feature grid — asymmetric hierarchy */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Featured card — spans 3 cols */}
          <Link
            to={FEATURED_LINK.to}
            className={cn(
              "group lg:col-span-3 relative overflow-hidden rounded-xl p-6 md:p-8",
              "border border-border/40 bg-gradient-to-br",
              FEATURED_LINK.accent,
              FEATURED_LINK.borderAccent,
              "transition-all duration-200 hover:shadow-lg hover:shadow-primary/5"
            )}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/15">
                  <FEATURED_LINK.icon size={20} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  {FEATURED_LINK.title}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md mb-6">
                {FEATURED_LINK.description}
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:gap-2.5 transition-all duration-200">
                Abrir Pokedex
                <ChevronRight size={13} />
              </span>
            </div>

            {/* Subtle corner decoration */}
            <div
              className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full opacity-[0.04]"
              style={{ background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)" }}
            />
          </Link>

          {/* Secondary cards — span 2 cols, stacked */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {SECONDARY_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "group flex items-center gap-4 rounded-xl p-4",
                    "border border-border/30 bg-card/30",
                    "hover:border-border/60 hover:bg-card/50",
                    "transition-all duration-200"
                  )}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/40 shrink-0">
                    <Icon size={17} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground mb-0.5">
                      {link.title}
                    </h3>
                    <p className="text-xs text-muted-foreground/70 leading-relaxed truncate">
                      {link.description}
                    </p>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-muted-foreground/30 group-hover:text-muted-foreground shrink-0 transition-colors"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
