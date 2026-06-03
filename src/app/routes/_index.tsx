import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import { RouteErrorBoundary } from "~/components/layout/route-error-boundary";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "~/features/auth/use-auth-store";
import {
  BookOpen,
  Swords,
  Package,
  ScrollText,
  MapPin,
  ChevronDown,
  Compass,
  UserPlus,
  LogIn,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { API_BASE, STALE_TIMES } from "~/lib/api";
import { getPokemonSprite } from "~/lib/sprites";
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
import { Progress } from "~/components/ui/progress";

export const meta: MetaFunction = () => [
  { title: "Cobbleverse Hub" },
  { name: "description", content: "Plataforma para jogadores do modpack Cobbleverse" },
];

export function ErrorBoundary() {
  return <RouteErrorBoundary routeName="Home" />;
}

// ── Floating Particles (firefly effect) ──────────────────────────────
const PARTICLES = [
  { top: "18%", left: "12%", delay: "0s", size: 4 },
  { top: "32%", left: "78%", delay: "1.2s", size: 3 },
  { top: "55%", left: "25%", delay: "0.6s", size: 5 },
  { top: "22%", left: "60%", delay: "2s", size: 3 },
  { top: "45%", left: "90%", delay: "0.3s", size: 4 },
  { top: "65%", left: "45%", delay: "1.8s", size: 3 },
  { top: "10%", left: "40%", delay: "2.5s", size: 4 },
];

// ── Sprite Ticker ────────────────────────────────────────────────────
function SpriteTicker() {
  const { data: pokemonList } = useQuery({
    queryKey: ["home-pokemon-ticker"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/pokemon?limit=20&page=1`);
      if (!res.ok) throw new Error("Failed");
      const json = (await res.json()) as { data: { name: string; dexNumber: number }[] };
      return json.data;
    },
    staleTime: STALE_TIMES.STATIC,
  });

  if (!pokemonList || pokemonList.length === 0) return null;

  const sprites = pokemonList.map((p) => ({
    name: p.name,
    src: getPokemonSprite(p.dexNumber),
  }));

  // Duplicate for seamless loop
  const doubled = [...sprites, ...sprites];

  return (
    <section className="relative overflow-hidden border-y border-border/30 py-4">
      {/* Fade edges */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      />
      <div className="group flex animate-scroll-left hover:[animation-play-state:paused]">
        {doubled.map((sprite, i) => (
          <img
            key={`${sprite.name}-${i}`}
            src={sprite.src}
            alt={sprite.name}
            className="w-12 h-12 mx-3 object-contain shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            loading="lazy"
          />
        ))}
      </div>
    </section>
  );
}

// ── Stats HUD Item ───────────────────────────────────────────────────
function StatHudItem({
  icon: Icon,
  value,
  label,
  isLoading,
}: {
  icon: React.ElementType;
  value: number | string;
  label: string;
  isLoading: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 border border-primary/20 shrink-0">
        <Icon size={16} className="text-primary" />
      </div>
      <div className="flex flex-col">
        {isLoading ? (
          <div className="h-5 w-10 rounded bg-muted/50 animate-pulse" />
        ) : (
          <span className="text-lg font-bold text-foreground tabular-nums leading-none">
            {value}
          </span>
        )}
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          {label}
        </span>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────
export default function Index() {
  const { user } = useAuthStore();
  const { data: pokemonData, isLoading: pokemonLoading } = useQuery({
    queryKey: ["home-pokemon-count"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/pokemon?limit=1&page=1`);
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ pagination: { total: number } }>;
    },
    staleTime: STALE_TIMES.STATIC,
  });

  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ["home-items-count"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/items`);
      if (!res.ok) throw new Error("Failed");
      const json = (await res.json()) as { data: unknown[] };
      return json.data.length;
    },
    staleTime: STALE_TIMES.STATIC,
  });

  const pokemonCount = pokemonData?.pagination.total ?? 0;
  const itemsCount = itemsData ?? 0;

  return (
    <div className="relative">
      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <section className="relative min-h-[65vh] flex flex-col items-center justify-center overflow-hidden px-4">
        {/* Atmospheric radial glow */}
        <div
          className="absolute inset-0 -z-20"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 35%, hsl(var(--primary) / 0.1) 0%, transparent 70%)",
          }}
        />

        {/* Pokeball watermark */}
        <svg
          className="absolute -top-20 -right-20 w-[420px] h-[420px] opacity-[0.04] -z-10"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="3" />
          <rect x="2" y="48.5" width="96" height="3" />
          <circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="3" />
          <circle cx="50" cy="50" r="6" />
        </svg>

        {/* Terrain silhouette layers */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 -z-10 hidden sm:block"
          style={{
            clipPath: "polygon(0% 70%, 8% 55%, 20% 65%, 35% 40%, 50% 55%, 65% 35%, 80% 50%, 92% 42%, 100% 60%, 100% 100%, 0% 100%)",
            background: "hsl(var(--secondary) / 0.4)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-28 -z-10 hidden sm:block"
          style={{
            clipPath: "polygon(0% 80%, 10% 65%, 25% 75%, 40% 55%, 55% 70%, 70% 50%, 85% 65%, 95% 55%, 100% 70%, 100% 100%, 0% 100%)",
            background: "hsl(var(--muted) / 0.5)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-24 -z-10 hidden sm:block"
          style={{
            clipPath: "polygon(0% 85%, 12% 75%, 28% 82%, 45% 68%, 60% 78%, 75% 65%, 88% 75%, 100% 80%, 100% 100%, 0% 100%)",
            background: "hsl(var(--background))",
          }}
        />

        {/* Floating particles */}
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/50 animate-drift"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
            }}
          />
        ))}

        {/* Hero content */}
        <div className="text-center max-w-2xl">
          <div
            className="animate-fade-in opacity-0 mb-5"
            style={{ animationDelay: "0ms" }}
          >
            <Badge variant="outline" className="border-primary/40 text-primary text-xs px-3 py-1">
              Cobbleverse v1.7.31
            </Badge>
          </div>

          <h1 className="mb-4">
            <span
              className="block text-5xl sm:text-7xl font-bold tracking-tight text-foreground animate-fade-in opacity-0"
              style={{ animationDelay: "100ms" }}
            >
              Cobbleverse
            </span>
            <span
              className="block text-6xl sm:text-8xl font-bold tracking-tight text-primary animate-fade-in opacity-0"
              style={{ animationDelay: "250ms" }}
            >
              Hub
            </span>
          </h1>

          <p
            className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed animate-fade-in opacity-0"
            style={{ animationDelay: "400ms" }}
          >
            Sua base de conhecimento para o modpack Cobbleverse.
            Descubra, monte, domine.
          </p>

          <div
            className="flex flex-col sm:flex-row justify-center gap-3 mt-8 animate-fade-in opacity-0"
            style={{ animationDelay: "550ms" }}
          >
            {user ? (
              <>
                <Button size="lg" asChild>
                  <Link to="/pokedex">
                    <BookOpen />
                    Explorar Pokedex
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/team-builder">
                    <Swords />
                    Montar Time
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link to="/register">
                    <UserPlus />
                    Criar Conta
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">
                    <LogIn />
                    Entrar
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-6 animate-float opacity-50"
        >
          <ChevronDown size={24} className="text-muted-foreground" />
        </div>
      </section>

      {/* ═══════════════════ SPRITE TICKER ═══════════════════ */}
      <SpriteTicker />

      {/* ═══════════════════ FEATURE SHOWCASE (Bento Grid) ═══════════════════ */}
      <section className="max-w-5xl mx-auto px-4 py-14 space-y-4">
        <h2
          className="text-sm font-semibold uppercase tracking-widest text-muted-foreground animate-fade-in opacity-0"
          style={{ animationDelay: "100ms" }}
        >
          Explorar
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr">
          {/* Pokedex — tall card, spans 2 rows */}
          <Link to="/pokedex" className="group md:row-span-2">
            <Card
              className={cn(
                "h-full border-border/30 bg-card/40 backdrop-blur-sm overflow-hidden relative",
                "transition-all duration-300",
                "hover:border-primary/40 hover:bg-card/60",
                "hover:shadow-[0_0_28px_-4px_hsl(var(--primary)/0.2)]",
                "hover:-translate-y-0.5"
              )}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 shrink-0">
                    <BookOpen size={18} className="text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm group-hover:text-primary transition-colors">Pokedex</CardTitle>
                    <CardDescription className="text-xs">
                      {pokemonLoading ? (
                        <span className="inline-block h-3 w-16 rounded bg-muted/50 animate-pulse" />
                      ) : (
                        `${pokemonCount} Pokemon registrados`
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                {/* Mini sprite grid */}
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[
                    { name: "bulbasaur", dex: 1 },
                    { name: "charmander", dex: 4 },
                    { name: "squirtle", dex: 7 },
                    { name: "pikachu", dex: 25 },
                    { name: "eevee", dex: 133 },
                    { name: "snorlax", dex: 143 },
                    { name: "gengar", dex: 94 },
                    { name: "lucario", dex: 448 },
                  ].map((p) => (
                    <img
                      key={p.name}
                      src={getPokemonSprite(p.dex)}
                      alt={p.name}
                      className="w-full aspect-square object-contain opacity-50 group-hover:opacity-80 transition-opacity"
                      loading="lazy"
                    />
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Abrir Pokedex
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Team Builder */}
          <Link to="/team-builder" className="group">
            <Card
              className={cn(
                "h-full border-border/30 bg-card/40 backdrop-blur-sm overflow-hidden relative",
                "transition-all duration-300",
                "hover:border-primary/40 hover:bg-card/60",
                "hover:shadow-[0_0_28px_-4px_hsl(var(--primary)/0.2)]",
                "hover:-translate-y-0.5"
              )}
            >
              {/* Watermark icon */}
              <Swords
                size={80}
                className="absolute -bottom-4 -right-4 text-primary/[0.04] pointer-events-none"
              />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 shrink-0">
                    <Swords size={18} className="text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm group-hover:text-primary transition-colors">Team Builder</CardTitle>
                    <CardDescription className="text-xs">Monte seu time competitivo</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* 6-slot indicator */}
                <div className="flex gap-2 mt-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 border-dashed",
                        i < 3
                          ? "border-primary/40 bg-primary/5"
                          : "border-border/40 bg-muted/20"
                      )}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Items */}
          <Link to="/items" className="group">
            <Card
              className={cn(
                "h-full border-border/30 bg-card/40 backdrop-blur-sm overflow-hidden relative",
                "transition-all duration-300",
                "hover:border-primary/40 hover:bg-card/60",
                "hover:shadow-[0_0_28px_-4px_hsl(var(--primary)/0.2)]",
                "hover:-translate-y-0.5"
              )}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 shrink-0">
                    <Package size={18} className="text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm group-hover:text-primary transition-colors">Item Codex</CardTitle>
                    <CardDescription className="text-xs">
                      {itemsLoading ? (
                        <span className="inline-block h-3 w-16 rounded bg-muted/50 animate-pulse" />
                      ) : (
                        `${itemsCount} itens catalogados`
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1 mt-1">
                  {["potion", "pokeball", "rare-candy", "oran-berry", "revive"].map((item) => (
                    <img
                      key={item}
                      src={`/sprites/items/${item}.png`}
                      alt={item}
                      className="w-8 h-8 object-contain opacity-50 group-hover:opacity-80 transition-opacity"
                      loading="lazy"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Guias */}
          <Link to="/guides" className="group">
            <Card
              className={cn(
                "h-full border-border/30 bg-card/40 backdrop-blur-sm overflow-hidden relative",
                "transition-all duration-300",
                "hover:border-primary/40 hover:bg-card/60",
                "hover:shadow-[0_0_28px_-4px_hsl(var(--primary)/0.2)]",
                "hover:-translate-y-0.5"
              )}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 shrink-0">
                    <ScrollText size={18} className="text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm group-hover:text-primary transition-colors">Guias</CardTitle>
                    <CardDescription className="text-xs">6 tutoriais disponíveis</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={60} className="mt-1 h-1.5" />
                <p className="text-[10px] text-muted-foreground mt-1.5">60% do conteúdo completo</p>
              </CardContent>
            </Card>
          </Link>

          {/* Em Breve */}
          <div>
            <Card
              className={cn(
                "h-full border-dashed border-border/30 bg-card/20",
                "flex items-center justify-center"
              )}
            >
              <CardContent className="text-center py-6">
                <p className="text-sm text-muted-foreground/60">
                  Mais funcionalidades em breve...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS HUD BAR ═══════════════════ */}
      <section className="max-w-5xl mx-auto px-4 pb-10">
        <Card
          className={cn(
            "border-border/30 bg-card/40 backdrop-blur-sm",
            "bg-gradient-to-r from-card/60 via-card/40 to-card/60"
          )}
        >
          <CardContent className="py-0">
            <div className="grid grid-cols-2 md:flex md:items-center md:justify-around md:divide-x md:divide-border/30">
              <StatHudItem
                icon={BookOpen}
                value={pokemonCount}
                label="Pokemon"
                isLoading={pokemonLoading}
              />
              <StatHudItem
                icon={Package}
                value={itemsCount}
                label="Itens"
                isLoading={itemsLoading}
              />
              <StatHudItem
                icon={ScrollText}
                value={6}
                label="Guias"
                isLoading={false}
              />
              <StatHudItem
                icon={MapPin}
                value="—"
                label="Spawns"
                isLoading={false}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ═══════════════════ CALL TO ADVENTURE ═══════════════════ */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        {/* Decorative separator with badge */}
        <div className="relative flex items-center justify-center py-8">
          <Separator className="bg-border/40" />
          <Badge
            variant="outline"
            className="absolute bg-background border-border/50 text-muted-foreground text-[10px] px-3"
          >
            <Compass size={10} className="mr-1" />
            Cobbleverse Hub
          </Badge>
        </div>

        <div className="text-center space-y-5">
          <h2
            className="text-2xl sm:text-3xl font-bold text-foreground animate-fade-in opacity-0"
            style={{ animationDelay: "100ms" }}
          >
            Pronto para a aventura?
          </h2>
          {user ? (
            <Button size="lg" asChild>
              <Link to="/home">
                <Compass />
                Ir para o Hub
              </Link>
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button size="lg" asChild>
                <Link to="/register">
                  <UserPlus />
                  Criar Conta
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">
                  <LogIn />
                  Entrar
                </Link>
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground/50 pt-2">
            Cobbleverse Hub v1.7.31 — Dados extraidos do modpack Cobbleverse para Minecraft
          </p>
        </div>
      </section>
    </div>
  );
}
