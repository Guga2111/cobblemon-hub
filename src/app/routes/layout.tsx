import { Outlet, NavLink } from "react-router";
import { useState, useCallback } from "react";
import {
  Home,
  BookOpen,
  Swords,
  Package,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  Menu,
  Hexagon,
} from "lucide-react";
import { cn } from "~/lib/utils";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "~/components/ui/sheet";
import { ThemeToggle } from "~/components/layout/theme-toggle";
import { CommandSearch } from "~/components/search/command-search";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  end: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/pokedex", label: "Pokédex", icon: BookOpen, end: false },
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
      className="flex flex-col gap-0.5 px-2"
      aria-label="Navegação principal"
    >
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          title={collapsed ? item.label : undefined}
          onClick={onItemClick}
          className={({ isActive }) =>
            cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
              collapsed && "justify-center",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && !collapsed && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              {isActive && collapsed && (
                <span className="absolute bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-primary" />
              )}
              <item.icon size={18} className="shrink-0" />
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
        "flex items-center gap-3 border-b border-border py-4 px-4",
        collapsed && "justify-center px-2"
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 ring-1 ring-primary/30">
        <Hexagon size={16} className="text-primary" fill="currentColor" fillOpacity={0.2} />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-tight text-foreground">
            Cobblemon
          </p>
          <p className="truncate text-xs leading-tight text-muted-foreground">
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
        {/* Accessibility: skip to main content */}
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
          Ir para o conteúdo
        </a>

        {/* Desktop Sidebar — hidden below lg */}
        <aside
          className={cn(
            "hidden lg:flex flex-col shrink-0 overflow-hidden",
            "border-r border-border bg-[hsl(var(--sidebar-background))]",
            "transition-[width] duration-300 ease-in-out",
            sidebarCollapsed ? "w-[4.5rem]" : "w-64"
          )}
          aria-label="Menu lateral"
        >
          <BrandLogo collapsed={sidebarCollapsed} />

          <div className="flex-1 overflow-y-auto py-3">
            <NavItems collapsed={sidebarCollapsed} />
          </div>

          {/* Collapse toggle */}
          <div className="border-t border-border p-2">
            <button
              onClick={toggleSidebar}
              aria-label={
                sidebarCollapsed ? "Expandir menu" : "Recolher menu"
              }
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2",
                "text-sm text-muted-foreground transition-colors duration-200",
                "hover:bg-muted/50 hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
            </button>
          </div>
        </aside>

        {/* Right column: header + main + bottom-nav */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-sm">
            {/* Tablet menu trigger — visible md to lg only */}
            <SheetTrigger
              className={cn(
                "hidden md:flex lg:hidden h-9 w-9 items-center justify-center",
                "rounded-lg text-muted-foreground transition-colors duration-200",
                "hover:bg-muted hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
              aria-label="Abrir menu de navegação"
            >
              <Menu size={20} />
            </SheetTrigger>

            {/* Brand — hidden on desktop (sidebar has it) */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/20 ring-1 ring-primary/30">
                <Hexagon size={14} className="text-primary" fill="currentColor" fillOpacity={0.2} />
              </div>
              <span className="text-sm font-bold text-foreground">
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
            <Outlet />
          </main>

          {/* Mobile bottom navigation — visible below md only */}
          <nav
            className="flex md:hidden shrink-0 items-stretch justify-around border-t border-border bg-background/95 backdrop-blur-sm"
            aria-label="Navegação inferior"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "relative flex flex-1 flex-col items-center justify-center gap-1 py-3 px-1",
                    "text-xs font-medium transition-colors duration-200",
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
                      <span className="absolute top-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-b-full bg-primary" />
                    )}
                    <item.icon
                      size={20}
                      className={cn(
                        "shrink-0 transition-transform duration-200",
                        isActive && "scale-110"
                      )}
                    />
                    <span className="max-w-[56px] truncate text-center leading-tight">
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Tablet sidebar drawer — rendered via portal */}
      <SheetContent>
        <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
        <BrandLogo collapsed={false} />
        <div className="flex-1 overflow-y-auto py-3">
          <NavItems onItemClick={() => setDrawerOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
