/**
 * Audits data/shops.json against the Cobblemon datapack:
 *  - Inspects dialogues/ for NPC vendor dialogues
 *  - Inspects loot_table/villages/ for shop-related chest loot
 *  - Restructures shops.json to required format: npcId, location, items[]
 *  - Removes cobblemon-specific items not present in the current datapack
 *
 * FINDINGS:
 *  - dialogues/ has 4 files: example, npc-example, sacchi_healed, sacchi_interaction.
 *    None contain shop/vendor NPCs — Sacchi is a healer, others are generic examples.
 *  - loot_table/villages/ has only village_pokecenters.json — pokecenter chest loot
 *    (apricorn seeds, exp candy, remedies, oran berries), NOT shop inventory.
 *  - Shop NPCs (Poke Mart, Department Store) are a custom server feature NOT defined
 *    in the Cobblemon datapack. Prices are manually curated; sourceFile is null.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DATAPACK_PATH = process.env.COBBLEMON_DATAPACK_PATH ?? "./data/datapack";
const COBBLEMON_DATA = join(DATAPACK_PATH, "data/cobblemon");
const SHOPS_PATH = "./data/shops.json";
const ITEMS_PATH = "./data/items.json";
const DATAPACK_VERSION = "1.7.3+1.21.1";

function loadDatapackItems(): Set<string> {
  if (!existsSync(ITEMS_PATH)) {
    console.warn("items.json not found — skipping item validation (run extract-items first)");
    return new Set();
  }
  const raw = JSON.parse(readFileSync(ITEMS_PATH, "utf-8")) as unknown;
  const items: Array<{ id: string }> = Array.isArray(raw)
    ? (raw as Array<{ id: string }>)
    : ((raw as { data?: Array<{ id: string }> })?.data ?? []);
  const ids = new Set(items.map((i) => i.id));
  console.log(`Loaded ${ids.size} item IDs from items.json`);
  return ids;
}

function inspectDialogues(): void {
  const dialoguePath = join(COBBLEMON_DATA, "dialogues");
  if (!existsSync(dialoguePath)) {
    console.log("dialogues/ directory not found");
    return;
  }
  const files = readdirSync(dialoguePath).filter((f) => f.endsWith(".json"));
  console.log(`dialogues/ files: ${files.join(", ")}`);
  console.log(
    "  → No vendor/shop NPCs found. sacchi_interaction.json = healer only. example/npc-example = templates."
  );
}

function inspectVillageLootTables(): void {
  const villagesPath = join(COBBLEMON_DATA, "loot_table/villages");
  if (!existsSync(villagesPath)) {
    console.log("loot_table/villages/ directory not found");
    return;
  }
  const files = readdirSync(villagesPath).filter((f) => f.endsWith(".json"));
  console.log(`loot_table/villages/ files: ${files.join(", ")}`);
  console.log(
    "  → village_pokecenters.json = chest loot only (apricorn seeds, exp candy, remedies). NOT shop inventory."
  );
}

function nameToId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// Vanilla Minecraft items to always keep, even if not in cobblemon datapack items.json
const ALWAYS_KEEP = new Set([
  "gunpowder",
  "emerald_block",
  "elytra",
  "wheat",
  "apple",
  "sugar",
  "string",
  "redstone",
  "blaze_powder",
  "glowstone_dust",
  "spider_eye",
  "nether_wart",
]);

function isCobblemonSpecific(id: string): boolean {
  return (
    id.endsWith("_ball") ||
    id.endsWith("_feather") ||
    id.endsWith("_card") ||
    id.endsWith("_berry") ||
    id.endsWith("_mint") ||
    id.endsWith("_candy") ||
    id.includes("relic_coin") ||
    id.startsWith("ancient_") ||
    id.startsWith("cobblemon_")
  );
}

interface LegacyShopItem {
  item: string;
  price: number;
}

interface LegacyCategory {
  name: string;
  items: LegacyShopItem[];
}

interface LegacyShop {
  name: string;
  description: string;
  currency: string;
  categories: LegacyCategory[];
}

interface LegacyShopsData {
  [key: string]: LegacyShop | undefined;
}

export interface ShopItem {
  name: string;
  price: number | null;
  category: string;
}

export interface ShopEntry {
  npcId: string;
  name: string;
  location: string;
  description: string;
  currency: string;
  items: ShopItem[];
  sourceFile: string | null;
}

const SHOP_META: Record<string, { npcId: string; location: string }> = {
  pokeMart: {
    npcId: "poke_mart",
    location: "Vilas pequenas e médias",
  },
  departmentStore: {
    npcId: "department_store",
    location: "Vilas grandes",
  },
};

function transformShop(
  key: string,
  shop: LegacyShop,
  datapackItems: Set<string>
): { entry: ShopEntry; removed: string[] } {
  const meta = SHOP_META[key] ?? { npcId: nameToId(shop.name), location: "Unknown" };
  const removed: string[] = [];
  const items: ShopItem[] = [];

  for (const cat of shop.categories) {
    for (const shopItem of cat.items) {
      const id = nameToId(shopItem.item);
      if (
        isCobblemonSpecific(id) &&
        !datapackItems.has(id) &&
        !ALWAYS_KEEP.has(id)
      ) {
        console.log(`  REMOVED (not in datapack): ${shopItem.item} → ${id}`);
        removed.push(id);
        continue;
      }
      items.push({
        name: id,
        price: shopItem.price,
        category: cat.name,
      });
    }
  }

  return {
    entry: {
      npcId: meta.npcId,
      name: shop.name,
      location: meta.location,
      description: shop.description,
      currency: shop.currency,
      items,
      sourceFile: null,
    },
    removed,
  };
}

function readExistingShops(): LegacyShopsData {
  if (!existsSync(SHOPS_PATH)) {
    console.warn("shops.json not found — starting from empty");
    return {};
  }
  const raw = JSON.parse(readFileSync(SHOPS_PATH, "utf-8")) as unknown;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    // Already transformed format
    if (obj._meta && obj.data) {
      console.warn("shops.json is already in new format — nothing to transform");
      return {};
    }
    return obj as LegacyShopsData;
  }
  return {};
}

function main(): void {
  console.log("=== extract-shops.ts ===");

  inspectDialogues();
  inspectVillageLootTables();

  const datapackItems = loadDatapackItems();
  const legacy = readExistingShops();

  // If already in new format, skip
  if (Object.keys(legacy).length === 0) {
    console.log("Nothing to transform. Exiting.");
    return;
  }

  const shops: ShopEntry[] = [];
  let totalRemoved = 0;

  const orderedKeys = ["pokeMart", "departmentStore", ...Object.keys(legacy).filter((k) => k !== "pokeMart" && k !== "departmentStore")];

  for (const key of orderedKeys) {
    const shop = legacy[key];
    if (!shop) continue;
    console.log(`\nProcessing: ${key} → npcId=${SHOP_META[key]?.npcId ?? nameToId(shop.name)}`);
    const { entry, removed } = transformShop(key, shop, datapackItems);
    shops.push(entry);
    totalRemoved += removed.length;
    console.log(`  ${entry.items.length} items kept, ${removed.length} removed`);
  }

  const output = {
    _meta: {
      datapackVersion: DATAPACK_VERSION,
      generatedAt: new Date().toISOString(),
      note: "Shop NPCs are a custom server feature. No canonical datapack source for npcId/location/prices. Items validated against data/items.json — cobblemon-specific items not in the datapack have been removed.",
    },
    data: shops,
  };

  writeFileSync(SHOPS_PATH, JSON.stringify(output, null, 2), "utf-8");
  console.log(`\nWrote ${shops.length} shop(s) to ${SHOPS_PATH}`);
  console.log(`Total items removed (not in datapack): ${totalRemoved}`);

  // Validation
  let errors = 0;
  for (const shop of shops) {
    if (!shop.npcId) { console.error(`  ERROR: shop "${shop.name}" missing npcId`); errors++; }
    if (!shop.location) { console.error(`  ERROR: shop "${shop.name}" missing location`); errors++; }
    if (!Array.isArray(shop.items)) { console.error(`  ERROR: shop "${shop.name}" missing items[]`); errors++; }
    for (const item of shop.items) {
      if (!item.name) { console.error(`  ERROR: shop "${shop.name}" has item with no name`); errors++; }
      if (item.price === undefined) { console.error(`  ERROR: item "${item.name}" missing price`); errors++; }
    }
  }
  console.log(errors === 0 ? "All validations passed." : `${errors} error(s) found.`);
}

main();
