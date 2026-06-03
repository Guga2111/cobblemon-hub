import {
  Home,
  BookOpen,
  Swords,
  Package,
  ScrollText,
  Map,
  Trophy,
  ShoppingCart,
  Star,
  Crosshair,
  Sparkles,
  Route,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  end: boolean;
  disabled?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Plataforma",
    items: [
      { to: "/home", label: "Home", icon: Home, end: true },
      { to: "/pokedex", label: "Pokedex", icon: BookOpen, end: false },
      { to: "/team-builder", label: "Team Builder", icon: Swords, end: false },
      { to: "/items", label: "Itens", icon: Package, end: false },
      { to: "/guides", label: "Guias", icon: ScrollText, end: false },
    ],
  },
  {
    label: "Cobbleverse",
    items: [
      { to: "/gym-leaders", label: "Gym Leaders", icon: Trophy, end: false },
      { to: "/raids", label: "Raids", icon: Crosshair, end: false },
      { to: "/shops", label: "Lojas", icon: ShoppingCart, end: false },
      { to: "/battle-mechanics", label: "Mecanicas", icon: Sparkles, end: false },
      { to: "/legendaries", label: "Lendarios", icon: Star, end: false },
      { to: "/map", label: "Mapa", icon: Map, end: false },
      { to: "/progression", label: "Progressao", icon: Route, end: false },
    ],
  },
];

export const NAV_ITEMS_FLAT = NAV_GROUPS.flatMap((g) => g.items).filter((i) => !i.disabled);
