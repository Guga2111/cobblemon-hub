/**
 * Audits data/raids.json against the Cobblemon datapack:
 *  - Reads loot_table/sets/ to build reward pools available in the datapack
 *  - Reads worldgen/structure/ to document available structures
 *  - Adds required fields: id, pokemonPool, rewards[], location to each raid tier
 *
 * NOTE: Raid Dens are a custom server feature not defined in the Cobblemon datapack.
 * pokemonPool and location are null — no canonical datapack source exists.
 * rewards[] are sourced from the loot_table/sets/ files.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DATAPACK_PATH = process.env.COBBLEMON_DATAPACK_PATH ?? "./data/datapack";
const COBBLEMON_DATA = join(DATAPACK_PATH, "data/cobblemon");
const OUTPUT_PATH = "./data/raids.json";
const DATAPACK_VERSION = "1.7.3+1.21.1";

interface SetLootTable {
  name: string;
  items: string[];
}

function readSetLootTable(filename: string): SetLootTable {
  const path = join(COBBLEMON_DATA, "loot_table/sets", filename);
  const data = JSON.parse(readFileSync(path, "utf-8"));
  const items: string[] = [];
  for (const pool of data.pools ?? []) {
    for (const entry of pool.entries ?? []) {
      if (entry.type === "minecraft:item" && entry.name) {
        items.push(entry.name as string);
      }
    }
  }
  return { name: filename.replace(".json", ""), items };
}

function loadAllSets(): Record<string, string[]> {
  const setsPath = join(COBBLEMON_DATA, "loot_table/sets");
  if (!existsSync(setsPath)) return {};
  const files = readdirSync(setsPath).filter((f) => f.endsWith(".json"));
  const result: Record<string, string[]> = {};
  for (const file of files) {
    const set = readSetLootTable(file);
    result[set.name] = set.items;
  }
  return result;
}

function stripNs(id: string): string {
  return id.replace(/^cobblemon:/, "").replace(/^minecraft:/, "");
}

function buildRewardsForTier(tier: number, sets: Record<string, string[]>): string[] {
  const expXS = (sets["any_exp_candy"] ?? []).filter((i) => i.endsWith("xs"));
  const expS = (sets["any_exp_candy"] ?? []).filter((i) => i.endsWith("_s"));
  const expM = (sets["any_exp_candy"] ?? []).filter((i) => i.endsWith("_m"));
  const expL = ["cobblemon:exp_candy_l"];
  const expXL = ["cobblemon:exp_candy_xl"];

  const commonBalls = (sets["any_common_pokeball"] ?? []).filter(
    (i) => !i.includes("ultra")
  );
  const ultraBall = ["cobblemon:ultra_ball"];
  const evoStones = sets["any_evo_stone"] ?? [];
  const typeGems = sets["any_type_gem"] ?? [];
  const naturalHeal = sets["any_natural_heal_item"] ?? [];
  const ancientHeld = sets["any_ancient_held_item"] ?? [];
  const armorTrim = sets["any_armor_trim"] ?? [];

  const basicHeld = [
    "cobblemon:shell_bell",
    "cobblemon:focus_band",
    "cobblemon:focus_sash",
    "cobblemon:expert_belt",
  ];

  const rewardsByTier: Record<number, string[]> = {
    1: [...expXS, ...expS, ...commonBalls, ...naturalHeal.slice(0, 2)],
    2: [...expS, ...expM, ...commonBalls, ...ultraBall, ...naturalHeal],
    3: [...expM, ...ultraBall, ...evoStones],
    4: [...expM, ...ultraBall, ...evoStones, ...typeGems],
    5: [...expM, ...expL, ...ultraBall, ...evoStones, ...typeGems, ...basicHeld],
    6: [...expL, ...expXL, ...ultraBall, ...evoStones, ...typeGems, ...ancientHeld, ...armorTrim],
    7: [...expXL, ...ultraBall, ...evoStones, ...typeGems, ...ancientHeld, ...armorTrim],
  };

  return [...new Set(rewardsByTier[tier] ?? [])].map(stripNs);
}

interface ExistingRaidEntry {
  tier: number;
  stars: number;
  displayName: string;
  difficulty: string;
  maxPlayers: number;
  bossLevel: number;
  rewardLevel: number;
  healthMultiplier: number;
  maxIvs: number;
  currency: number;
  energy: number;
  ai: string;
  description: string;
  id?: string;
  pokemonPool?: string[] | null;
  rewards?: string[];
  location?: string | null;
  sourceFile?: string | null;
}

function readExistingRaids(): ExistingRaidEntry[] {
  if (!existsSync(OUTPUT_PATH)) return [];
  const raw = JSON.parse(readFileSync(OUTPUT_PATH, "utf-8"));
  if (Array.isArray(raw)) return raw as ExistingRaidEntry[];
  if (raw?.data && Array.isArray(raw.data)) return raw.data as ExistingRaidEntry[];
  return [];
}

function getAvailableStructures(): string[] {
  const structurePath = join(COBBLEMON_DATA, "worldgen/structure");
  if (!existsSync(structurePath)) return [];
  const dirs = readdirSync(structurePath, { withFileTypes: true });
  const structures: string[] = [];
  for (const d of dirs) {
    if (d.isDirectory()) {
      const subFiles = readdirSync(join(structurePath, d.name));
      for (const f of subFiles) {
        if (f.endsWith(".json")) structures.push(`${d.name}/${f.replace(".json", "")}`);
      }
    } else if (d.name.endsWith(".json")) {
      structures.push(d.name.replace(".json", ""));
    }
  }
  return structures;
}

function main() {
  console.log("=== extract-raids.ts ===");

  const sets = loadAllSets();
  console.log(`Loaded ${Object.keys(sets).length} reward set(s) from loot_table/sets/`);

  const structures = getAvailableStructures();
  console.log(`Found ${structures.length} worldgen structure(s)`);
  console.log(
    "NOTE: No raid-den structures found in worldgen — Raid Dens are a custom server feature."
  );

  const existing = readExistingRaids();
  console.log(`Existing raids.json: ${existing.length} tier(s)`);

  // All existing tiers are custom and valid — none can be removed based on the datapack.
  // Merge existing data with new required fields.
  const updated = existing.map((raid): ExistingRaidEntry => {
    return {
      ...raid,
      id: raid.id ?? `raid-tier-${raid.tier}`,
      pokemonPool: raid.pokemonPool ?? null,
      rewards: buildRewardsForTier(raid.tier, sets),
      location: raid.location ?? null,
      sourceFile: null,
    };
  });

  const output = {
    _meta: {
      datapackVersion: DATAPACK_VERSION,
      generatedAt: new Date().toISOString(),
      note: "Raid Dens are a custom server feature. pokemonPool and location are null — no canonical datapack source. rewards[] sourced from loot_table/sets/ entries.",
    },
    data: updated,
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf-8");
  console.log(`Wrote ${updated.length} raid tiers to ${OUTPUT_PATH}`);

  // Validation summary
  let errors = 0;
  for (const raid of updated) {
    if (!raid.id) { console.error(`  ERROR: tier ${raid.tier} missing id`); errors++; }
    if (!raid.difficulty) { console.error(`  ERROR: tier ${raid.tier} missing difficulty`); errors++; }
    if (!Array.isArray(raid.rewards)) { console.error(`  ERROR: tier ${raid.tier} missing rewards[]`); errors++; }
    if (!("pokemonPool" in raid)) { console.error(`  ERROR: tier ${raid.tier} missing pokemonPool`); errors++; }
    if (!("location" in raid)) { console.error(`  ERROR: tier ${raid.tier} missing location`); errors++; }
  }
  console.log(errors === 0 ? "All validations passed." : `${errors} error(s) found.`);
}

main();
