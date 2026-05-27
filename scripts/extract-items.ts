/**
 * Extracts item data from Cobblemon drop entries in data/pokemon.json.
 * Reads the already-extracted pokemon data and builds a deduplicated item catalog.
 * Also scans COBBLEMON_DATAPACK_PATH for any item definition files if available.
 * Writes data/items.json.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { itemSchema } from "../src/lib/schemas";
import type { Item, ItemCategory } from "../src/types/item";
import type { Pokemon } from "../src/types/pokemon";

const POKEMON_JSON = "./data/pokemon.json";
const OUTPUT_PATH = "./data/items.json";

// ── Category detection ────────────────────────────────────────────────────────

const CATEGORY_PATTERNS: Array<{ pattern: RegExp; category: ItemCategory }> = [
  { pattern: /poke_ball|great_ball|ultra_ball|master_ball|premier_ball|friend_ball|fast_ball|level_ball|lure_ball|heavy_ball|love_ball|moon_ball|dream_ball|beast_ball|sport_ball|safari_ball/, category: "ball" },
  { pattern: /potion|revive|antidote|burn_heal|ice_heal|awakening|paralyze_heal|full_heal|max_potion|full_restore|elixir|ether/, category: "medicine" },
  { pattern: /berry$|oran_berry|sitrus_berry|leppa_berry|lum_berry|aspear_berry|chesto_berry|pecha_berry|rawst_berry|cheri_berry/, category: "berry" },
  { pattern: /fire_stone|water_stone|thunder_stone|leaf_stone|moon_stone|sun_stone|shiny_stone|dusk_stone|dawn_stone|ice_stone|link_cable|black_augurite|peat_block/, category: "evolution-item" },
  { pattern: /apricorn|tumblestone|sky_tumblestone|black_tumblestone|exp_candy|rare_candy/, category: "ingredient" },
  { pattern: /choice_band|choice_specs|choice_scarf|leftovers|life_orb|focus_sash|assault_vest|rocky_helmet|eviolite|held/, category: "held-item" },
];

function detectCategory(itemName: string): ItemCategory {
  for (const { pattern, category } of CATEGORY_PATTERNS) {
    if (pattern.test(itemName)) return category;
  }
  return "other";
}

function formatDisplayName(name: string): string {
  return name
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  mkdirSync("./data", { recursive: true });

  if (!existsSync(POKEMON_JSON)) {
    console.warn("[warn] data/pokemon.json not found. Run extract-pokemon first.");
    console.warn("       Writing empty items.json.");
    writeFileSync(OUTPUT_PATH, JSON.stringify([], null, 2));
    console.log(`[done] ${OUTPUT_PATH} (0 items)`);
    return;
  }

  const pokemon = JSON.parse(readFileSync(POKEMON_JSON, "utf-8")) as Pokemon[];
  console.log(`[info] Scanning drops from ${pokemon.length} pokemon`);

  // Build item map: item name → {item data + which pokemon drop it}
  const itemMap = new Map<string, { item: Item; pokemonSet: Set<string> }>();

  for (const poke of pokemon) {
    for (const drop of poke.drops) {
      const existing = itemMap.get(drop.item);
      if (existing) {
        existing.pokemonSet.add(poke.id);
      } else {
        itemMap.set(drop.item, {
          item: {
            id: drop.item,
            name: drop.item,
            displayName: drop.displayName || formatDisplayName(drop.item),
            category: detectCategory(drop.item),
            description: "",
            sprite: null,
            droppedBy: [],
          },
          pokemonSet: new Set([poke.id]),
        });
      }
    }
  }

  const items: Item[] = [];
  let errors = 0;

  for (const [, { item, pokemonSet }] of itemMap) {
    const fullItem: Item = { ...item, droppedBy: [...pokemonSet].sort() };

    const result = itemSchema.safeParse(fullItem);
    if (!result.success) {
      console.error(`[error] Validation failed for item "${item.id}":`);
      for (const issue of result.error.issues) {
        console.error(`  ${issue.path.join(".")}: ${issue.message}`);
      }
      errors++;
      continue;
    }

    items.push(result.data);
  }

  items.sort((a, b) => a.name.localeCompare(b.name));

  writeFileSync(OUTPUT_PATH, JSON.stringify(items, null, 2));
  console.log(`[done] ${OUTPUT_PATH} (${items.length} items, ${errors} errors)`);
}

main();
