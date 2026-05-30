/**
 * Extracts Pokémon species data from the Cobblemon v1.7.x datapack.
 * Reads JSON files from COBBLEMON_DATAPACK_PATH/data/cobblemon/species/ and writes data/pokemon.json.
 * Set COBBLEMON_DATAPACK_PATH env var to the root of the extracted datapack jar.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, basename } from "node:path";
import { pokemonSchema } from "../src/lib/schemas";
import type { Pokemon, PokemonType, GrowthRate, EggGroup } from "../src/types/pokemon";
import { normalizePokemonName } from "../src/lib/utils";

const DATAPACK_PATH = process.env.COBBLEMON_DATAPACK_PATH ?? "./data/datapack";
const DATAPACK_VERSION = "1.7.3+1.21.1";
const SPECIES_DIR = join(DATAPACK_PATH, "data", "cobblemon", "species");
const OUTPUT_PATH = "./data/pokemon.json";

// ── Raw Cobblemon species format ────────────────────────────────────────────

interface RawStats {
  hp: number;
  attack: number;
  defence: number;
  special_attack: number;
  special_defence: number;
  speed: number;
}

interface RawLevelMove {
  level: number;
  move: string;
}

interface RawDropEntry {
  item: string;
  quantityRange?: string;
  percentage?: number;
  chance?: number;
}

interface RawDrops {
  entries?: RawDropEntry[];
}

interface RawEvolution {
  result?: string;
  to?: string;
  variant?: string;
  level?: number;
  item?: string;
  trigger?: string;
}

interface RawSpecies {
  nationalPokedexNumber: number;
  name: string;
  implemented?: boolean;
  primaryType: string;
  secondaryType?: string;
  abilities?: string[] | Record<string, string>;
  hiddenAbility?: string;
  baseStats: RawStats;
  catchRate?: number;
  maleRatio?: number;
  isGenderless?: boolean;
  baseExperience?: number;
  primaryEggGroup?: string;
  secondaryEggGroup?: string;
  eggGroups?: string[];
  growthRate?: string;
  moves?: RawLevelMove[] | string[];
  evolutions?: RawEvolution[];
  drops?: RawDrops;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getGeneration(dexNumber: number): number {
  if (dexNumber <= 151) return 1;
  if (dexNumber <= 251) return 2;
  if (dexNumber <= 386) return 3;
  if (dexNumber <= 493) return 4;
  if (dexNumber <= 649) return 5;
  if (dexNumber <= 721) return 6;
  if (dexNumber <= 809) return 7;
  if (dexNumber <= 905) return 8;
  return 9;
}

function normalizeType(raw: string): PokemonType | null {
  const valid: PokemonType[] = [
    "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison",
    "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy",
  ];
  const lower = raw.toLowerCase();
  return valid.includes(lower as PokemonType) ? (lower as PokemonType) : null;
}

function normalizeGrowthRate(raw: string): GrowthRate {
  const map: Record<string, GrowthRate> = {
    slow: "slow",
    medium_slow: "medium-slow",
    mediumslow: "medium-slow",
    medium_fast: "medium-fast",
    mediumfast: "medium-fast",
    fast: "fast",
    erratic: "erratic",
    fluctuating: "fluctuating",
  };
  return map[raw.toLowerCase()] ?? "medium-fast";
}

function normalizeEggGroup(raw: string): EggGroup | null {
  const map: Record<string, EggGroup> = {
    monster: "monster",
    water1: "water1",
    bug: "bug",
    flying: "flying",
    field: "field",
    fairy: "fairy",
    grass: "grass",
    "human-like": "human-like",
    humanlike: "human-like",
    water3: "water3",
    mineral: "mineral",
    amorphous: "amorphous",
    water2: "water2",
    ditto: "ditto",
    dragon: "dragon",
    "no-eggs": "no-eggs",
    noeggs: "no-eggs",
    undiscovered: "no-eggs",
  };
  return map[raw.toLowerCase()] ?? null;
}

function formatDisplayName(name: string): string {
  return name
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseQuantityRange(range?: string): { min: number; max: number } {
  if (!range) return { min: 1, max: 1 };
  const [minStr, maxStr] = range.split("-");
  const min = parseInt(minStr ?? "1", 10) || 1;
  const max = parseInt(maxStr ?? minStr ?? "1", 10) || 1;
  return { min, max };
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

function transformSpecies(raw: RawSpecies, filePath: string): Pokemon | null {
  if (raw.implemented === false) return null;

  const primaryType = normalizeType(raw.primaryType);
  if (!primaryType) {
    console.warn(`[skip] ${filePath}: unknown primaryType "${raw.primaryType}"`);
    return null;
  }

  const secondaryType = raw.secondaryType ? normalizeType(raw.secondaryType) : null;
  const types: [PokemonType] | [PokemonType, PokemonType] = secondaryType
    ? [primaryType, secondaryType]
    : [primaryType];

  // Abilities
  const abilities = (() => {
    const raw_abilities = raw.abilities;
    const names: string[] = [];
    if (Array.isArray(raw_abilities)) {
      names.push(...raw_abilities);
    } else if (raw_abilities && typeof raw_abilities === "object") {
      // e.g. {"0": "overgrow", "1": "chlorophyll"}
      for (const key of Object.keys(raw_abilities).filter((k) => k !== "H")) {
        const val = raw_abilities[key];
        if (val) names.push(val);
      }
    }
    if (raw.hiddenAbility) names.push(raw.hiddenAbility);

    return names.map((name, idx) => {
      const isHidden = raw.hiddenAbility
        ? name === raw.hiddenAbility && idx === names.length - 1
        : false;
      return {
        name,
        displayName: formatDisplayName(name),
        description: "",
        isHidden,
      };
    });
  })();

  // Level-up moves
  const moves = (() => {
    if (!raw.moves) return [];
    if (Array.isArray(raw.moves) && raw.moves.length > 0) {
      // Could be RawLevelMove[] or string[]
      const first = raw.moves[0];
      if (typeof first === "string") {
        // "level:movename" format
        return (raw.moves as string[]).map((entry) => {
          const [levelStr, moveName] = entry.split(":");
          const level = parseInt(levelStr ?? "1", 10) || 1;
          return {
            name: moveName ?? entry,
            displayName: formatDisplayName(moveName ?? entry),
            type: "normal" as PokemonType,
            category: "physical" as const,
            power: null,
            accuracy: null,
            pp: 10,
            method: "level-up" as const,
            level,
          };
        });
      }
      return (raw.moves as RawLevelMove[]).map((entry) => ({
        name: entry.move,
        displayName: formatDisplayName(entry.move),
        type: "normal" as PokemonType,
        category: "physical" as const,
        power: null,
        accuracy: null,
        pp: 10,
        method: "level-up" as const,
        level: entry.level,
      }));
    }
    return [];
  })();

  // Evolutions
  const evolutions = (raw.evolutions ?? []).map((evo) => {
    const toName = evo.result ?? evo.to ?? "";
    const variant = evo.variant ?? evo.trigger ?? "other";
    return {
      to: normalizePokemonName(toName),
      trigger:
        variant === "level" || variant === "level-up" ? ("level-up" as const)
        : variant === "trade" ? ("trade" as const)
        : variant === "use-item" || variant === "item" ? ("use-item" as const)
        : ("other" as const),
      level: evo.level ?? null,
      item: evo.item ? normalizePokemonName(evo.item) : null,
      condition: null,
    };
  });

  // Drops
  const drops = (raw.drops?.entries ?? []).map((entry) => {
    const itemName = entry.item.replace(/^cobblemon:|^minecraft:/, "");
    const qty = parseQuantityRange(entry.quantityRange);
    const chance = entry.chance ?? (entry.percentage != null ? entry.percentage / 100 : 0.5);
    return {
      item: itemName,
      displayName: formatDisplayName(itemName),
      chance,
      minCount: qty.min,
      maxCount: qty.max,
    };
  });

  // Egg groups
  const eggGroupNames = raw.eggGroups
    ? raw.eggGroups
    : [raw.primaryEggGroup, raw.secondaryEggGroup].filter(Boolean) as string[];
  const eggGroups: EggGroup[] = eggGroupNames
    .map(normalizeEggGroup)
    .filter((g): g is EggGroup => g !== null);

  const genderRatio = raw.isGenderless ? null : (raw.maleRatio != null ? raw.maleRatio : null);

  return {
    id: normalizePokemonName(raw.name),
    dexNumber: raw.nationalPokedexNumber,
    name: normalizePokemonName(raw.name),
    displayName: formatDisplayName(raw.name),
    types,
    baseStats: {
      hp: raw.baseStats.hp,
      attack: raw.baseStats.attack,
      defense: raw.baseStats.defence,
      specialAttack: raw.baseStats.special_attack,
      specialDefense: raw.baseStats.special_defence,
      speed: raw.baseStats.speed,
    },
    abilities,
    moves,
    evolutions,
    forms: [],
    drops,
    catchRate: raw.catchRate ?? 45,
    baseExp: raw.baseExperience ?? 64,
    growthRate: normalizeGrowthRate(raw.growthRate ?? "medium_fast"),
    eggGroups,
    genderRatio,
    generation: getGeneration(raw.nationalPokedexNumber),
    sourceFile: basename(filePath),
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  mkdirSync("./data", { recursive: true });

  if (!existsSync(SPECIES_DIR)) {
    console.warn(`[warn] Datapack not found at "${SPECIES_DIR}". Writing empty pokemon.json.`);
    console.warn("       Set COBBLEMON_DATAPACK_PATH to re-extract from the real datapack.");
    const emptyOutput = {
      _meta: { datapackVersion: DATAPACK_VERSION, generatedAt: new Date().toISOString() },
      data: [],
    };
    writeFileSync(OUTPUT_PATH, JSON.stringify(emptyOutput, null, 2));
    console.log(`[done] ${OUTPUT_PATH} (0 pokemon)`);
    return;
  }

  const files = collectJsonFiles(SPECIES_DIR);
  console.log(`[info] Found ${files.length} species files`);

  const pokemon: Pokemon[] = [];
  let errors = 0;

  for (const file of files) {
    try {
      const raw = JSON.parse(readFileSync(file, "utf-8")) as RawSpecies;
      const transformed = transformSpecies(raw, file);
      if (!transformed) continue;

      const result = pokemonSchema.safeParse(transformed);
      if (!result.success) {
        console.error(`[error] Validation failed for ${file}:`);
        for (const issue of result.error.issues) {
          console.error(`  ${issue.path.join(".")}: ${issue.message}`);
        }
        errors++;
        continue;
      }

      pokemon.push(result.data);
    } catch (err) {
      console.error(`[error] Failed to parse ${file}: ${String(err)}`);
      errors++;
    }
  }

  // Sort by dex number
  pokemon.sort((a, b) => a.dexNumber - b.dexNumber);

  const output = {
    _meta: { datapackVersion: DATAPACK_VERSION, generatedAt: new Date().toISOString() },
    data: pokemon,
  };
  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`[done] ${OUTPUT_PATH} (${pokemon.length} pokemon, ${errors} errors)`);
}

main();
