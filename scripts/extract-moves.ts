/**
 * Fetches move data (power, accuracy, PP, type, category) from PokeAPI for all moves
 * referenced in data/pokemon.json and writes the deduplicated catalog to data/moves.json.
 *
 * Results are cached — re-run only when a new Cobblemon version adds new moves.
 * Existing data/moves.json entries are preserved; only missing moves are fetched.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { moveSchema } from "../src/lib/schemas";
import type { Move } from "../src/types/move";
import type { Pokemon, PokemonType, MoveCategory } from "../src/types/pokemon";

const POKEMON_JSON = "./data/pokemon.json";
const DATAPACK_VERSION = "1.7.3+1.21.1";
const OUTPUT_PATH = "./data/moves.json";
const POKEAPI_BASE = "https://pokeapi.co/api/v2";

// ── PokeAPI response types ────────────────────────────────────────────────────

interface PokeApiName {
  name: string;
  language: { name: string };
}

interface PokeApiMoveResponse {
  id: number;
  name: string;
  names: PokeApiName[];
  type: { name: string };
  damage_class: { name: string };
  power: number | null;
  accuracy: number | null;
  pp: number | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDisplayName(name: string): string {
  return name
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const VALID_TYPES: PokemonType[] = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison",
  "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy",
];

function normalizeType(raw: string): PokemonType {
  const lower = raw.toLowerCase();
  return VALID_TYPES.includes(lower as PokemonType) ? (lower as PokemonType) : "normal";
}

function normalizeCategory(raw: string): MoveCategory {
  if (raw === "physical" || raw === "special" || raw === "status") {
    return raw;
  }
  return "status";
}

async function fetchMove(moveName: string): Promise<Move | null> {
  const url = `${POKEAPI_BASE}/move/${encodeURIComponent(moveName)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[warn] PokeAPI returned ${res.status} for move "${moveName}"`);
      return null;
    }
    const data = (await res.json()) as PokeApiMoveResponse;

    const englishName = data.names.find((n) => n.language.name === "en")?.name;

    return {
      id: data.name,
      name: data.name,
      displayName: englishName ?? formatDisplayName(data.name),
      type: normalizeType(data.type.name),
      category: normalizeCategory(data.damage_class.name),
      power: data.power,
      accuracy: data.accuracy,
      pp: data.pp ?? 1,
      sourceFile: "pokeapi",
    };
  } catch (err) {
    console.warn(`[warn] Failed to fetch move "${moveName}": ${String(err)}`);
    return null;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  mkdirSync("./data", { recursive: true });

  if (!existsSync(POKEMON_JSON)) {
    console.warn("[warn] data/pokemon.json not found. Run extract-pokemon first.");
    console.warn("       Writing empty moves.json.");
    const emptyOutput = {
      _meta: { datapackVersion: DATAPACK_VERSION, generatedAt: new Date().toISOString() },
      data: [],
    };
    writeFileSync(OUTPUT_PATH, JSON.stringify(emptyOutput, null, 2));
    console.log(`[done] ${OUTPUT_PATH} (0 moves)`);
    return;
  }

  const pokemonFile = JSON.parse(readFileSync(POKEMON_JSON, "utf-8")) as { data: Pokemon[] } | Pokemon[];
  const pokemon = Array.isArray(pokemonFile) ? pokemonFile : pokemonFile.data;

  // Collect unique move names
  const moveNames = new Set<string>();
  for (const poke of pokemon) {
    for (const m of poke.moves) {
      moveNames.add(m.name);
    }
  }
  console.log(`[info] Found ${moveNames.size} unique moves across ${pokemon.length} pokemon`);

  // Load existing cache
  const cached = new Map<string, Move>();
  if (existsSync(OUTPUT_PATH)) {
    try {
      const raw = JSON.parse(readFileSync(OUTPUT_PATH, "utf-8")) as { data: Move[] } | Move[];
      const existing = Array.isArray(raw) ? raw : raw.data;
      for (const move of existing) {
        cached.set(move.name, move);
      }
      console.log(`[info] Loaded ${cached.size} moves from cache`);
    } catch {
      console.warn("[warn] Could not read existing moves.json — will re-fetch all");
    }
  }

  const missing = [...moveNames].filter((name) => !cached.has(name));
  console.log(`[info] ${missing.length} moves need fetching from PokeAPI`);

  if (missing.length === 0) {
    console.log("[info] All moves already cached — skipping PokeAPI fetch");
  } else {
    let fetched = 0;
    let failed = 0;
    const BATCH_SIZE = 20;

    for (let i = 0; i < missing.length; i += BATCH_SIZE) {
      const batch = missing.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(batch.map(fetchMove));

      for (let j = 0; j < results.length; j++) {
        const move = results[j];
        const name = batch[j];
        if (move) {
          cached.set(move.name, move);
          fetched++;
        } else if (name) {
          // Create a stub for unknown moves so the catalog stays complete
          const stub: Move = {
            id: name,
            name,
            displayName: formatDisplayName(name),
            type: "normal",
            category: "status",
            power: null,
            accuracy: null,
            pp: 1,
            sourceFile: "stub",
          };
          cached.set(name, stub);
          failed++;
        }
      }

      if (i + BATCH_SIZE < missing.length) {
        // Small delay to be polite to PokeAPI
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log(`[info] Fetched ${fetched} moves, ${failed} stubs created for unknown moves`);
  }

  // Validate and collect
  const moves: Move[] = [];
  let errors = 0;

  for (const move of cached.values()) {
    const result = moveSchema.safeParse(move);
    if (!result.success) {
      console.error(`[error] Validation failed for move "${move.name}":`);
      for (const issue of result.error.issues) {
        console.error(`  ${issue.path.join(".")}: ${issue.message}`);
      }
      errors++;
      continue;
    }
    moves.push(result.data);
  }

  moves.sort((a, b) => a.name.localeCompare(b.name));

  const output = {
    _meta: { datapackVersion: DATAPACK_VERSION, generatedAt: new Date().toISOString() },
    data: moves,
  };
  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`[done] ${OUTPUT_PATH} (${moves.length} moves, ${errors} errors)`);
}

main().catch((err: unknown) => {
  console.error("[fatal]", err);
  process.exit(1);
});
