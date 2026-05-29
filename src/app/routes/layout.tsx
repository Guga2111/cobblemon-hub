import { Outlet, NavLink } from "react-router";
import { useState, useCallback, Suspense } from "react";
import {
  Home,
  BookOpen,
  Swords,
  Package,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "~/components/ui/sheet";
import { ThemeToggle } from "~/components/layout/theme-toggle";
import { CommandSearch } from "~/components/search/command-search";

function RouteSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="h-8 w-48 rounded-lg bg-muted/40 animate-shimmer bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40" />
      <Separator />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-muted/20 animate-shimmer bg-gradient-to-r from-muted/20 via-muted/10 to-muted/20"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  end: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/pokedex", label: "Pokedex", icon: BookOpen, end: false },
  { to: "/team-builder", label: "Team Builder", icon: Swords, end: false },
  { to: "/items", label: "Itens", icon: Package, end: false },
  { to: "/guides", label: "Guias", icon: ScrollText, end: false },
];

function NavItems({
  collapsed = false,
  onItemClick,
}: {
  collapsed?: boolean;
  onItemClick?: () => void;
}) {
  return (
    <nav
      className="flex flex-col gap-1 px-3"
      aria-label="Navegacao principal"
    >
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          prefetch="intent"
          title={collapsed ? item.label : undefined}
          onClick={onItemClick}
          className={({ isActive }) =>
            cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
              collapsed && "justify-center px-2",
              isActive
                ? "bg-primary/12 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.2)]"
                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && !collapsed && (
                <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
              )}
              {isActive && collapsed && (
                <span className="absolute bottom-0.5 left-1/2 h-[3px] w-5 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
              )}
              <item.icon size={18} className={cn("shrink-0", isActive && "drop-shadow-[0_0_4px_hsl(var(--primary)/0.4)]")} />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function BrandLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-b border-border/60 py-5 px-4",
        collapsed && "justify-center px-2"
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/25 shadow-[0_0_12px_hsl(var(--primary)/0.15)]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-primary">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold leading-tight text-foreground tracking-tight">
            Cobblemon
          </p>
          <p className="truncate text-[11px] font-semibold leading-tight text-primary/70 tracking-wider uppercase">
            Hub
          </p>
        </div>
      )}
    </div>
  );
}

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar-collapsed") === "true";
    }
    return false;
  });

  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("sidebar-collapsed", String(next));
      }
      return next;
    });
  }, []);

  return (
    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <div className="flex h-screen overflow-hidden bg-background">
        <a
          href="#main-content"
          className={cn(
            "sr-only focus:not-sr-only",
            "focus:absolute focus:left-4 focus:top-4 focus:z-[200]",
            "focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2",
            "focus:text-sm focus:font-medium focus:text-primary-foreground",
            "focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
          )}
        >
          Ir para o conteudo
        </a>

        {/* Desktop Sidebar */}
        <aside
          className={cn(
            "hidden lg:flex flex-col shrink-0 overflow-hidden",
            "border-r border-border/60 bg-[hsl(var(--sidebar-background))]",
            "transition-[width] duration-300 ease-in-out",
            sidebarCollapsed ? "w-[4.5rem]" : "w-64"
          )}
          aria-label="Menu lateral"
        >
          <BrandLogo collapsed={sidebarCollapsed} />

          <div className="flex-1 overflow-y-auto py-4">
            <NavItems collapsed={sidebarCollapsed} />
          </div>

          <Separator className="opacity-60" />
          <div className="p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              aria-label={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
              className={cn(
                "w-full text-muted-foreground hover:text-foreground",
                sidebarCollapsed && "justify-center"
              )}
            >
              {sidebarCollapsed ? (
                <ChevronRight size={16} />
              ) : (
                <>
                  <ChevronLeft size={16} />
                  <span>Recolher</span>
                </>
              )}
            </Button>
          </div>
        </aside>

        {/* Right column: header + main + bottom-nav */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md">
            {/* Tablet menu trigger */}
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="hidden md:flex lg:hidden text-muted-foreground"
                aria-label="Abrir menu de navegacao"
              >
                <Menu size={20} />
              </Button>
            </SheetTrigger>

            {/* Brand — hidden on desktop */}
            <div className="flex items-center gap-2.5 lg:hidden">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/25">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-primary">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                </svg>
              </div>
              <span className="text-sm font-extrabold text-foreground tracking-tight">
                Cobblemon Hub
              </span>
            </div>

            <div className="flex-1" />

            <div id="header-actions" className="flex items-center gap-2">
              <CommandSearch />
              <ThemeToggle />
            </div>
          </header>

          {/* Main content area */}
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 overflow-auto focus-visible:outline-none"
          >
            <Suspense fallback={<RouteSkeleton />}>
              <Outlet />
            </Suspense>
          </main>

          {/* Mobile bottom navigation */}
          <nav
            className="flex md:hidden shrink-0 items-stretch justify-around border-t border-border/60 bg-background/90 backdrop-blur-md"
            aria-label="Navegacao inferior"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                prefetch="intent"
                className={({ isActive }) =>
                  cn(
                    "relative flex flex-1 flex-col items-center justify-center gap-1 py-3 px-1",
                    "text-[10px] font-bold transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute top-0 left-1/2 h-[3px] w-7 -translate-x-1/2 rounded-b-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.4)]" />
                    )}
                    <item.icon
                      size={20}
                      className={cn(
                        "shrink-0 transition-transform duration-200",
                        isActive && "scale-110 drop-shadow-[0_0_4px_hsl(var(--primary)/0.4)]"
                      )}
                    />
                    <span className="max-w-[56px] truncate text-center leading-tight tracking-wide uppercase">
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Tablet sidebar drawer */}
      <SheetContent>
        <SheetTitle className="sr-only">Menu de navegacao</SheetTitle>
        <BrandLogo collapsed={false} />
        <div className="flex-1 overflow-y-auto py-4">
          <NavItems onItemClick={() => setDrawerOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
