/**
 * Extracts spawn pool data from the Cobblemon v1.7.x datapack.
 * Reads JSON files from COBBLEMON_DATAPACK_PATH/data/cobblemon/spawn_pool_world/ and writes data/spawns.json.
 * Requires data/pokemon.json to already exist (run extract-pokemon first).
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnEntrySchema } from "../src/lib/schemas";
import type { SpawnEntry, SpawnBucket, SpawnContext } from "../src/types/spawn";
import { normalizePokemonName } from "../src/lib/utils";

const DATAPACK_PATH = process.env.COBBLEMON_DATAPACK_PATH ?? "./data/datapack";
const SPAWN_DIR = join(DATAPACK_PATH, "data", "cobblemon", "spawn_pool_world");
const OUTPUT_PATH = "./data/spawns.json";

// ── Raw Cobblemon spawn format ────────────────────────────────────────────────

interface RawSpawnCondition {
  biomes?: string[];
  structures?: string[];
  isDay?: boolean;
  isRaining?: boolean;
  isThundering?: boolean;
  minY?: number;
  maxY?: number;
  minLight?: number;
  maxLight?: number;
  neededNearbyBlocks?: Array<{ blocks: string[]; range?: number }>;
}

interface RawSpawnEntry {
  pokemon: string;
  type?: string;
  context?: string;
  bucket?: string;
  level?: string | number;
  weight?: number;
  condition?: RawSpawnCondition;
  anticondition?: RawSpawnCondition;
}

interface RawSpawnFile {
  enabled?: boolean;
  spawns?: RawSpawnEntry[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalizeBucket(raw?: string): SpawnBucket {
  const map: Record<string, SpawnBucket> = {
    common: "common",
    uncommon: "uncommon",
    rare: "rare",
    "ultra-rare": "ultra-rare",
    ultrarare: "ultra-rare",
  };
  return map[raw?.toLowerCase() ?? ""] ?? "common";
}

function normalizeContext(raw?: string): SpawnContext {
  const valid: SpawnContext[] = ["grounded", "submerged", "seafloor", "surface", "underground"];
  const lower = raw?.toLowerCase() ?? "grounded";
  return valid.includes(lower as SpawnContext) ? (lower as SpawnContext) : "grounded";
}

function parseLevelRange(raw?: string | number): { min: number; max: number } {
  if (typeof raw === "number") return { min: raw, max: raw };
  if (!raw) return { min: 1, max: 60 };
  const [minStr, maxStr] = String(raw).split("-");
  const min = parseInt(minStr ?? "1", 10) || 1;
  const max = parseInt(maxStr ?? minStr ?? "60", 10) || 60;
  return { min, max };
}

function normalizeCondition(raw?: RawSpawnCondition) {
  if (!raw) {
    return {
      minY: null, maxY: null, minLight: null, maxLight: null,
      isRaining: null, isThundering: null, isDay: null,
      structures: [], nearbyBlocks: [],
    };
  }
  return {
    minY: raw.minY ?? null,
    maxY: raw.maxY ?? null,
    minLight: raw.minLight ?? null,
    maxLight: raw.maxLight ?? null,
    isRaining: raw.isRaining ?? null,
    isThundering: raw.isThundering ?? null,
    isDay: raw.isDay ?? null,
    structures: raw.structures ?? [],
    nearbyBlocks: (raw.neededNearbyBlocks ?? []).map((nb) => ({
      blocks: nb.blocks,
      minCount: nb.range ?? null,
      maxCount: nb.range ?? null,
    })),
  };
}

/** Recursively collect all .json files under a directory */
function collectJsonFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...collectJsonFiles(full));
    } else if (entry.endsWith(".json")) {
      results.push(full);
    }
  }
  return results;
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  mkdirSync("./data", { recursive: true });

  if (!existsSync(SPAWN_DIR)) {
    console.warn(`[warn] Spawn pool directory not found at "${SPAWN_DIR}". Writing empty spawns.json.`);
    writeFileSync(OUTPUT_PATH, JSON.stringify([], null, 2));
    console.log(`[done] ${OUTPUT_PATH} (0 entries)`);
    return;
  }

  const files = collectJsonFiles(SPAWN_DIR);
  console.log(`[info] Found ${files.length} spawn pool files`);

  const entries: SpawnEntry[] = [];
  let errors = 0;
  let idCounter = 0;

  for (const file of files) {
    try {
      const spawnFile = JSON.parse(readFileSync(file, "utf-8")) as RawSpawnFile;
      if (spawnFile.enabled === false) continue;

      for (const raw of spawnFile.spawns ?? []) {
        if (raw.type !== undefined && raw.type !== "pokemon") continue;

        const pokemonId = normalizePokemonName(raw.pokemon.split(" ")[0] ?? raw.pokemon);
        const levelRange = parseLevelRange(raw.level);
        const biomes = raw.condition?.biomes ?? [];

        const entry: SpawnEntry = {
          id: `spawn-${++idCounter}`,
          pokemonId,
          bucket: normalizeBucket(raw.bucket),
          context: normalizeContext(raw.context),
          biomes,
          weight: raw.weight ?? 1,
          levelRange,
          conditions: normalizeCondition(raw.condition),
          anticonditions: normalizeCondition(raw.anticondition),
        };

        const result = spawnEntrySchema.safeParse(entry);
        if (!result.success) {
          console.error(`[error] Validation failed for spawn in ${file} (${raw.pokemon}):`);
          for (const issue of result.error.issues) {
            console.error(`  ${issue.path.join(".")}: ${issue.message}`);
          }
          errors++;
          continue;
        }

        entries.push(result.data);
      }
    } catch (err) {
      console.error(`[error] Failed to parse ${file}: ${String(err)}`);
      errors++;
    }
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(entries, null, 2));
  console.log(`[done] ${OUTPUT_PATH} (${entries.length} entries, ${errors} errors)`);
}

main();
