import { useState, useMemo } from "react";
import type { MetaFunction } from "react-router";
import { RouteErrorBoundary } from "~/components/layout/route-error-boundary";
import { cn } from "~/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { ShoppingCart, Store, ChevronDown, Coins } from "lucide-react";

import shopsRaw from "../../../data/shops.json";

export const meta: MetaFunction = () => [
  { title: "Lojas — Cobbleverse Hub" },
  { name: "description", content: "Catalogo completo de Poke Marts e Department Stores do Cobbleverse" },
];

export function ErrorBoundary() {
  return <RouteErrorBoundary routeName="Lojas" />;
}

interface ShopItem {
  name: string;
  price: number | null;
  category: string;
}

interface ShopEntry {
  npcId: string;
  name: string;
  location: string;
  description: string;
  currency: string;
  items: ShopItem[];
  sourceFile: string | null;
}

interface ShopsData {
  _meta?: { datapackVersion: string; generatedAt: string; note?: string };
  data: ShopEntry[];
}

function formatItemName(id: string): string {
  return id
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const SHOP_ICONS: Record<string, React.ElementType> = {
  poke_mart: ShoppingCart,
  department_store: Store,
};

function ShopSection({ shop }: { shop: ShopEntry }) {
  const categories = useMemo(() => {
    const map = new Map<string, ShopItem[]>();
    for (const item of shop.items) {
      const cat = item.category ?? "Outros";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    }
    return Array.from(map.entries()).map(([name, items]) => ({ name, items }));
  }, [shop.items]);

  const [expandedCat, setExpandedCat] = useState<string | null>(categories[0]?.name ?? null);

  const Icon = SHOP_ICONS[shop.npcId] ?? Store;

  return (
    <Card className="border-border/30 bg-card/40 backdrop-blur-sm overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shrink-0">
            <Icon size={18} className="text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base">{shop.name}</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {shop.items.length} itens — Moeda: {shop.currency}
            </CardDescription>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mt-2">
          {shop.description}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          📍 {shop.location}
        </p>
      </CardHeader>

      <CardContent className="pt-0 space-y-2">
        {categories.map((cat) => {
          const isExpanded = expandedCat === cat.name;
          return (
            <div key={cat.name} className="rounded-lg border border-border/20 overflow-hidden">
              <button
                onClick={() => setExpandedCat(isExpanded ? null : cat.name)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{cat.name}</span>
                  <Badge variant="outline" className="text-[9px] border-border/30 text-muted-foreground/60">
                    {cat.items.length}
                  </Badge>
                </div>
                <ChevronDown
                  size={14}
                  className={cn(
                    "text-muted-foreground/40 transition-transform duration-200",
                    isExpanded && "rotate-180"
                  )}
                />
              </button>

              {isExpanded && (
                <div className="border-t border-border/20">
                  <div className="divide-y divide-border/10">
                    {cat.items.map((shopItem) => (
                      <div
                        key={shopItem.name}
                        className="flex items-center justify-between px-3 py-2 hover:bg-muted/10 transition-colors"
                      >
                        <span className="text-xs text-foreground">{formatItemName(shopItem.name)}</span>
                        {shopItem.price !== null ? (
                          <div className="flex items-center gap-1 text-xs font-bold tabular-nums text-amber-500">
                            <Coins size={10} />
                            {shopItem.price.toLocaleString()}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/40 italic">preço indisponível</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default function ShopsPage() {
  const shopsData = shopsRaw as unknown as ShopsData;
  const shops: ShopEntry[] = Array.isArray(shopsData)
    ? (shopsData as unknown as ShopEntry[])
    : (shopsData.data ?? []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
          Lojas
        </h1>
        <p className="text-sm text-muted-foreground">
          Catalogo completo de itens e precos dos Poke Marts e Department Stores
        </p>
      </div>

      {/* Currency info */}
      <Card className="mb-6 border-border/20 bg-card/20 border-dashed">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Coins size={14} className="text-amber-500 mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground/70 leading-relaxed space-y-1">
              <p><strong className="text-foreground">PokeDollars</strong> — Moeda principal. Ganha-se derrotando treinadores, vendendo itens, e completando raids.</p>
              <p><strong className="text-foreground">Relic Coins</strong> — Moeda secundaria. Drops de Pokemon selvagens. Podem ser trocadas por PokeDollars na loja.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {shops.map((shop) => (
          <ShopSection key={shop.npcId} shop={shop} />
        ))}
      </div>
    </div>
  );
}
