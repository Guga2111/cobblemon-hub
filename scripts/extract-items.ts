/**
 * Extracts item data from the Cobblemon datapack:
 *  - recipe/  (crafting_shaped, crafting_shapeless, smelting, stonecutting, brewing_stand, campfire_pot)
 *  - held_items/  (.js filenames → held-item IDs)
 *  - bag_items/   (.js filenames → bag-item IDs)
 *  - pokemon.json drops
 * Writes data/items.json with id, name, obtainMethod, recipe, effect, and sourceFile.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { itemSchema } from "../src/lib/schemas";
import type { Item, ItemCategory, ObtainMethod, ItemRecipe, RecipeIngredient } from "../src/types/item";
import type { Pokemon } from "../src/types/pokemon";

const DATAPACK_PATH = process.env.COBBLEMON_DATAPACK_PATH ?? "./data/datapack";
const COBBLEMON_DATA = join(DATAPACK_PATH, "data/cobblemon");
const POKEMON_JSON = "./data/pokemon.json";
const DATAPACK_VERSION = "1.7.3+1.21.1";
const OUTPUT_PATH = "./data/items.json";
const SPRITES_DIR = "./public/sprites/items";

// ── Category detection ────────────────────────────────────────────────────────

const CATEGORY_PATTERNS: Array<{ pattern: RegExp; category: ItemCategory }> = [
  { pattern: /poke_ball|great_ball|ultra_ball|master_ball|premier_ball|friend_ball|fast_ball|level_ball|lure_ball|heavy_ball|love_ball|moon_ball|dream_ball|beast_ball|sport_ball|safari_ball|heal_ball|net_ball|nest_ball|dive_ball|repeat_ball|timer_ball|luxury_ball|dusk_ball|quick_ball|cherish_ball|park_ball|azure_ball|citrine_ball|verdant_ball|roseate_ball|slate_ball|gigaton_ball|feather_ball|wing_ball|jet_ball|leaden_ball|ivory_ball|ancient_poke_ball|ancient_great_ball|ancient_ultra_ball|ancient_azure_ball|ancient_citrine_ball|ancient_verdant_ball|ancient_roseate_ball|ancient_slate_ball|ancient_heavy_ball|ancient_leaden_ball|ancient_gigaton_ball|ancient_feather_ball|ancient_wing_ball|ancient_ivory_ball|ancient_jet_ball/, category: "ball" },
  { pattern: /potion|revive|antidote|burn_heal|ice_heal|awakening|paralyze_heal|full_heal|max_potion|full_restore|elixir|ether|remedy|berry_juice|big_malasada|moomoo_milk|heal_powder|fine_remedy|superb_remedy/, category: "medicine" },
  { pattern: /berry$|_berry$/, category: "berry" },
  { pattern: /fire_stone|water_stone|thunder_stone|leaf_stone|moon_stone|sun_stone|shiny_stone|dusk_stone|dawn_stone|ice_stone|link_cable|black_augurite|peat_block|dubious_disc|electirizer|magmarizer|protector|reaper_cloth|upgrade|sachet|galarica_cuff|galarica_wreath|oval_stone|prism_scale|dragon_scale|deep_sea_tooth|deep_sea_scale|metal_coat|kings_rock/, category: "evolution-item" },
  { pattern: /apricorn|tumblestone|sky_tumblestone|black_tumblestone|exp_candy|rare_candy|vivichoke|hearty_grain|roasted_leek|seaweed|medicinal_leek|pep_up_flower/, category: "ingredient" },
  { pattern: /choice_band|choice_specs|choice_scarf|leftovers|life_orb|focus_sash|assault_vest|rocky_helmet|eviolite|held|ability_shield|air_balloon|binding_band|black_belt|black_glasses|black_sludge|blunder_policy|bright_powder|cell_battery|charcoal|cleanse_tag|clear_amulet|covert_cloak|damp_rock|destiny_knot|dragon_fang|eject_button|eject_pack|expert_belt|fairy_feather|flame_orb|float_stone|focus_band|hard_stone|heat_rock|heavy_duty_boots|icy_rock|iron_ball|kings_rock|lagging_tail|lax_incense|light_ball|light_clay|loaded_dice|luminous_moss|magnet|mental_herb|metronome|miracle_seed|muscle_band|mystic_water|never_melt_ice|poison_barb|power_anklet|power_band|power_belt|power_bracer|power_lens|power_weight|protective_pads|punching_glove|quick_claw|razor_claw|razor_fang|red_card|ring_target|rocky_helmet|room_service|safety_goggles|scope_lens|shell_bell|silk_scarf|silver_powder|smooth_rock|soft_sand|soothe_bell|spell_tag|sticky_barb|terrain_extender|toxic_orb|twisted_spoon|utility_umbrella|weakness_policy|white_herb|wide_lens|wise_glasses|zoom_lens|adamant_mint|bold_mint|brave_mint|calm_mint|careful_mint|gentle_mint|hasty_mint|impish_mint|jolly_mint|lax_mint|lonely_mint|mild_mint|modest_mint|naive_mint|naughty_mint|quiet_mint|rash_mint|relaxed_mint|sassy_mint|serious_mint|timid_mint|clever_feather|genius_feather|health_feather|muscle_feather|resist_feather|swift_feather/, category: "held-item" },
];

function detectCategory(itemId: string): ItemCategory {
  for (const { pattern, category } of CATEGORY_PATTERNS) {
    if (pattern.test(itemId)) return category;
  }
  return "other";
}

function formatDisplayName(name: string): string {
  return name
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// ── Sprite resolution ─────────────────────────────────────────────────────────

function buildSpriteIndex(): Set<string> {
  if (!existsSync(SPRITES_DIR)) return new Set();
  return new Set(readdirSync(SPRITES_DIR).filter((f) => f.endsWith(".png")));
}

function resolveSprite(itemId: string, spriteIndex: Set<string>): string | null {
  const filename = `${itemId}.png`;
  if (spriteIndex.has(filename)) return `/sprites/items/${filename}`;
  return null;
}

// ── Item ID normalization ─────────────────────────────────────────────────────

function normalizeItemId(rawId: string): string {
  // Strip namespace prefix (e.g. "cobblemon:choice_band" → "choice_band")
  return rawId.includes(":") ? rawId.split(":")[1] : rawId;
}

// ── Recipe parsing ────────────────────────────────────────────────────────────

interface RawRecipeFile {
  type?: string;
  pattern?: string[];
  key?: Record<string, { item?: string; tag?: string }>;
  ingredients?: Array<{ item?: string; tag?: string } | Array<{ item?: string; tag?: string }>>;
  ingredient?: { item?: string; tag?: string };
  base?: { item?: string; tag?: string };
  addition?: { item?: string; tag?: string };
  template?: { item?: string; tag?: string };
  input?: { item?: string; tag?: string };
  bottle?: { item?: string; tag?: string };
  result?: { id?: string; count?: number } | string;
  group?: string;
  seasoningTag?: string;
  seasoningProcessors?: unknown[];
}

function extractIngredients(raw: RawRecipeFile): RecipeIngredient[] {
  const ingredients: RecipeIngredient[] = [];

  function addIngredient(src: { item?: string; tag?: string } | undefined) {
    if (!src) return;
    if (src.item) ingredients.push({ type: "item", id: normalizeItemId(src.item) });
    else if (src.tag) ingredients.push({ type: "tag", id: src.tag });
  }

  if (raw.key) {
    for (const v of Object.values(raw.key)) addIngredient(v);
  }

  if (raw.ingredients) {
    for (const ing of raw.ingredients) {
      if (Array.isArray(ing)) {
        for (const choice of ing) addIngredient(choice);
      } else {
        addIngredient(ing);
      }
    }
  }

  if (raw.ingredient) addIngredient(raw.ingredient);
  if (raw.input) addIngredient(raw.input);
  if (raw.bottle) addIngredient(raw.bottle);
  if (raw.base) addIngredient(raw.base);
  if (raw.addition) addIngredient(raw.addition);
  if (raw.template) addIngredient(raw.template);

  return ingredients;
}

function getResultId(raw: RawRecipeFile): string | null {
  if (!raw.result) return null;
  if (typeof raw.result === "string") return normalizeItemId(raw.result);
  if (raw.result.id) return normalizeItemId(raw.result.id);
  return null;
}

function getResultCount(raw: RawRecipeFile): number {
  if (!raw.result || typeof raw.result === "string") return 1;
  return raw.result.count ?? 1;
}

function recipeTypeToObtainMethod(type: string): ObtainMethod {
  if (type.includes("crafting_shaped") || type.includes("crafting_shapeless")) return "crafting";
  if (type.includes("brewing_stand")) return "brewing_stand";
  if (type.includes("cooking_pot") || type.includes("campfire")) return "campfire_pot";
  if (type.includes("smelting") || type.includes("blasting")) return "smelting";
  if (type.includes("stonecutting")) return "stonecutting";
  if (type.includes("smithing")) return "crafting";
  return "crafting";
}

// Parses all recipe files and returns a map: itemId → first recipe found
function parseRecipes(): Map<string, ItemRecipe> {
  const recipeMap = new Map<string, ItemRecipe>();
  const recipeDir = join(COBBLEMON_DATA, "recipe");

  if (!existsSync(recipeDir)) {
    console.warn("[warn] recipe/ directory not found");
    return recipeMap;
  }

  function processRecipeFile(filePath: string, subdir: string) {
    let raw: RawRecipeFile;
    try {
      raw = JSON.parse(readFileSync(filePath, "utf-8")) as RawRecipeFile;
    } catch {
      return;
    }

    const type = raw.type ?? "unknown";
    const resultId = getResultId(raw);
    if (!resultId) return;

    if (!recipeMap.has(resultId)) {
      const ingredients = extractIngredients(raw);
      const recipe: ItemRecipe = {
        type,
        ingredients,
        resultCount: getResultCount(raw),
        sourceFile: subdir ? `recipe/${subdir}/${filePath.split("/").pop()}` : `recipe/${filePath.split("/").pop()}`,
      };
      recipeMap.set(resultId, recipe);
    }
  }

  // Process top-level recipe files
  const entries = readdirSync(recipeDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith(".json")) {
      processRecipeFile(join(recipeDir, entry.name), "");
    } else if (entry.isDirectory()) {
      const subEntries = readdirSync(join(recipeDir, entry.name), { withFileTypes: true });
      for (const sub of subEntries) {
        if (sub.isFile() && sub.name.endsWith(".json")) {
          processRecipeFile(join(recipeDir, entry.name, sub.name), entry.name);
        }
      }
    }
  }

  return recipeMap;
}

// ── held_items / bag_items scanning ─────────────────────────────────────────

function scanItemIds(dir: string): Set<string> {
  const ids = new Set<string>();
  if (!existsSync(dir)) return ids;
  for (const f of readdirSync(dir)) {
    if (f.endsWith(".js") || f.endsWith(".json")) {
      const id = f.replace(/\.(js|json)$/, "");
      ids.add(id);
    }
  }
  return ids;
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  mkdirSync("./data", { recursive: true });

  const spriteIndex = buildSpriteIndex();
  console.log(`[info] Sprite index: ${spriteIndex.size} textures available`);

  // Parse recipes
  const recipeMap = parseRecipes();
  console.log(`[info] Recipe map: ${recipeMap.size} unique craftable items`);

  // Scan held_items and bag_items
  const heldItemIds = scanItemIds(join(COBBLEMON_DATA, "held_items"));
  const bagItemIds = scanItemIds(join(COBBLEMON_DATA, "bag_items"));
  console.log(`[info] held_items: ${heldItemIds.size}, bag_items: ${bagItemIds.size}`);

  // Build item map: itemId → partial item data
  const itemMap = new Map<string, { item: Item; pokemonSet: Set<string> }>();

  function upsertItem(
    id: string,
    pokemonId: string | null,
    obtainMethod: ObtainMethod,
    recipe: ItemRecipe | null,
    sourceFile: string,
  ) {
    const existing = itemMap.get(id);
    if (existing) {
      if (pokemonId) existing.pokemonSet.add(pokemonId);
      // Prefer more specific obtain methods over "drop"
      if (existing.item.obtainMethod === "drop" && obtainMethod !== "drop") {
        existing.item.obtainMethod = obtainMethod;
      }
      if (!existing.item.recipe && recipe) existing.item.recipe = recipe;
    } else {
      const newItem: Item = {
        id,
        name: id,
        displayName: formatDisplayName(id),
        category: detectCategory(id),
        description: "",
        sprite: resolveSprite(id, spriteIndex),
        droppedBy: [],
        obtainMethod,
        recipe,
        effect: null,
        sourceFile,
      };
      itemMap.set(id, { item: newItem, pokemonSet: pokemonId ? new Set([pokemonId]) : new Set() });
    }
  }

  // Add all craftable items from recipes
  for (const [id, recipe] of recipeMap) {
    const method = recipeTypeToObtainMethod(recipe.type);
    upsertItem(id, null, method, recipe, recipe.sourceFile);
  }

  // Add held_items
  for (const id of heldItemIds) {
    upsertItem(id, null, "held", null, `held_items/${id}.js`);
  }

  // Add bag_items
  for (const id of bagItemIds) {
    upsertItem(id, null, "bag", null, `bag_items/${id}.js`);
  }

  // Add pokemon drop items
  if (existsSync(POKEMON_JSON)) {
    const pokemonFile = JSON.parse(readFileSync(POKEMON_JSON, "utf-8")) as { data: Pokemon[] } | Pokemon[];
    const pokemon = Array.isArray(pokemonFile) ? pokemonFile : pokemonFile.data;
    console.log(`[info] Scanning drops from ${pokemon.length} pokemon`);

    for (const poke of pokemon) {
      for (const drop of poke.drops) {
        const recipeForDrop = recipeMap.get(drop.item) ?? null;
        // If item has a recipe, use that obtain method, else "drop"
        const method: ObtainMethod = recipeForDrop ? recipeTypeToObtainMethod(recipeForDrop.type) : "drop";
        upsertItem(drop.item, poke.id, method, recipeForDrop, "derived:pokemon-drops");
      }
    }
  } else {
    console.warn("[warn] data/pokemon.json not found. Run extract-pokemon first.");
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

  const output = {
    _meta: { datapackVersion: DATAPACK_VERSION, generatedAt: new Date().toISOString() },
    data: items,
  };
  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`[done] ${OUTPUT_PATH} (${items.length} items, ${errors} errors)`);
}

main();
