import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import { RouteErrorBoundary } from "~/components/layout/route-error-boundary";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Swords,
  Package,
  ScrollText,
  MapPin,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { cn } from "~/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";

export const meta: MetaFunction = () => [
  { title: "Cobblemon Hub" },
  { name: "description", content: "Plataforma para jogadores do mod Cobblemon" },
];

export function ErrorBoundary() {
  return <RouteErrorBoundary routeName="Home" />;
}

function StatCard({
  label,
  value,
  icon: Icon,
  isLoading,
  delay,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  isLoading: boolean;
  delay: number;
}) {
  return (
    <Card
      className={cn(
        "animate-fade-in opacity-0 border-border/30 bg-card/40 backdrop-blur-sm",
        "transition-all duration-300 hover:border-primary/40",
        "hover:shadow-[0_0_24px_-4px_hsl(var(--primary)/0.2)]"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="flex items-center gap-4 py-0">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-lg shrink-0",
            "bg-primary/10 border border-primary/20",
            "shadow-[0_0_12px_-2px_hsl(var(--primary)/0.15)]"
          )}
        >
          <Icon size={20} className="text-primary" />
        </div>
        <div className="flex flex-col gap-0.5">
          {isLoading ? (
            <div className="h-7 w-14 rounded bg-muted/50 animate-pulse" />
          ) : (
            <span className="text-2xl font-bold text-foreground tabular-nums leading-none">
              {value}
            </span>
          )}
          <Badge variant="ghost" className="px-0 text-muted-foreground text-[11px] font-medium">
            {label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

const QUICK_LINKS = [
  {
    to: "/pokedex",
    icon: BookOpen,
    title: "Pokedex",
    description: "Explore todos os Pokemon disponíveis no Cobblemon",
  },
  {
    to: "/team-builder",
    icon: Swords,
    title: "Team Builder",
    description: "Monte e exporte seu time competitivo de 6 Pokemon",
  },
  {
    to: "/items",
    icon: Package,
    title: "Item Codex",
    description: "Consulte itens, drops e suas localizacoes",
  },
  {
    to: "/guides",
    icon: ScrollText,
    title: "Guias",
    description: "Tutoriais completos para dominar o Cobblemon",
  },
];

export default function Index() {
  const { data: pokemonData, isLoading: pokemonLoading } = useQuery({
    queryKey: ["home-pokemon-count"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3001/api/pokemon?limit=1&page=1");
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ pagination: { total: number } }>;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ["home-items-count"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3001/api/items");
      if (!res.ok) throw new Error("Failed");
      const json = (await res.json()) as { data: unknown[] };
      return json.data.length;
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">
      {/* Hero Section */}
      <section
        className={cn(
          "relative text-center py-16 rounded-2xl overflow-hidden",
          "animate-fade-in opacity-0"
        )}
        style={{ animationDelay: "0ms" }}
      >
        {/* Gradient background effect */}
        <div
          className="absolute inset-0 -z-10 rounded-2xl"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%, hsl(var(--primary) / 0.08) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 -z-10 rounded-2xl border border-primary/10"
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--primary) / 0.03) 0%, transparent 60%)",
          }}
        />

        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles size={16} className="text-primary animate-glow-pulse" />
          <Badge variant="outline" className="border-primary/30 text-primary text-xs">
            Plataforma Cobblemon
          </Badge>
          <Sparkles size={16} className="text-primary animate-glow-pulse" />
        </div>

        <h1
          className={cn(
            "text-5xl sm:text-6xl font-bold tracking-tight text-foreground mb-4",
            "animate-fade-in opacity-0"
          )}
          style={{
            animationDelay: "100ms",
            textShadow: "0 0 40px hsl(var(--primary) / 0.3), 0 0 80px hsl(var(--primary) / 0.1)",
          }}
        >
          Cobblemon{" "}
          <span className="text-primary">Hub</span>
        </h1>

        <p
          className={cn(
            "text-base text-muted-foreground max-w-lg mx-auto leading-relaxed",
            "animate-fade-in opacity-0"
          )}
          style={{ animationDelay: "200ms" }}
        >
          Sua plataforma de referencia para o mod Cobblemon.
          Pokedex, itens, guias e muito mais.
        </p>

        <div
          className="flex justify-center gap-3 mt-8 animate-fade-in opacity-0"
          style={{ animationDelay: "300ms" }}
        >
          <Button asChild>
            <Link to="/pokedex">
              <BookOpen />
              Explorar Pokedex
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/guides">
              <ScrollText />
              Ver Guias
            </Link>
          </Button>
        </div>
      </section>

      <Separator className="bg-border/40" />

      {/* Stats Row */}
      <section className="space-y-4">
        <h2
          className="text-sm font-semibold uppercase tracking-widest text-muted-foreground animate-fade-in opacity-0"
          style={{ animationDelay: "350ms" }}
        >
          Dados do Cobblemon
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Pokemon"
            value={pokemonData?.pagination.total ?? 0}
            icon={BookOpen}
            isLoading={pokemonLoading}
            delay={400}
          />
          <StatCard
            label="Itens"
            value={itemsData ?? 0}
            icon={Package}
            isLoading={itemsLoading}
            delay={475}
          />
          <StatCard
            label="Spawns"
            value="-"
            icon={MapPin}
            isLoading={false}
            delay={550}
          />
          <StatCard
            label="Guias"
            value={6}
            icon={ScrollText}
            isLoading={false}
            delay={625}
          />
        </div>
      </section>

      <Separator className="bg-border/40" />

      {/* Quick Access Cards */}
      <section className="space-y-4">
        <h2
          className="text-sm font-semibold uppercase tracking-widest text-muted-foreground animate-fade-in opacity-0"
          style={{ animationDelay: "650ms" }}
        >
          Acesso Rapido
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {QUICK_LINKS.map((link, index) => {
            const Icon = link.icon;
            return (
              <Link key={link.to} to={link.to} className="group">
                <Card
                  className={cn(
                    "animate-fade-in opacity-0 h-full border-border/30 bg-card/40 backdrop-blur-sm",
                    "transition-all duration-300",
                    "hover:border-primary/40 hover:bg-card/60",
                    "hover:shadow-[0_0_28px_-4px_hsl(var(--primary)/0.2)]",
                    "hover:-translate-y-0.5"
                  )}
                  style={{ animationDelay: `${700 + index * 75}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "flex h-11 w-11 items-center justify-center rounded-lg shrink-0",
                          "bg-primary/10 border border-primary/20",
                          "group-hover:bg-primary/15 group-hover:shadow-[0_0_16px_-2px_hsl(var(--primary)/0.2)]",
                          "transition-all duration-300"
                        )}
                      >
                        <Icon size={20} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm group-hover:text-primary transition-colors duration-200">
                          {link.title}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1 leading-relaxed">
                          {link.description}
                        </CardDescription>
                      </div>
                      <ArrowRight
                        size={16}
                        className={cn(
                          "text-muted-foreground/40 shrink-0 mt-0.5",
                          "transition-all duration-200",
                          "group-hover:text-primary group-hover:translate-x-0.5"
                        )}
                      />
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
