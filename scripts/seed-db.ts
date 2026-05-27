import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { createClient } from "@libsql/client";
import { pokemonSchema, spawnEntrySchema, itemSchema, moveSchema } from "../src/lib/schemas";
import type { Pokemon } from "../src/types/pokemon";
import type { SpawnEntry } from "../src/types/spawn";
import type { Item } from "../src/types/item";
import type { Move } from "../src/types/move";

const url = process.env.TURSO_DATABASE_URL ?? "file:./data/cobblemon.db";
const authToken = process.env.TURSO_AUTH_TOKEN;
const db = createClient(url.startsWith("file:") ? { url } : { url, authToken });

function readJson<T>(filename: string): T[] {
  const path = resolve("./data", filename);
  if (!existsSync(path)) {
    console.warn(`[seed] ${filename} not found — skipping`);
    return [];
  }
  return JSON.parse(readFileSync(path, "utf-8")) as T[];
}

async function applySchema(): Promise<void> {
  const schemaPath = resolve("./server/db/schema.sql");
  const sql = readFileSync(schemaPath, "utf-8");
  for (const stmt of sql.split(";").map((s) => s.trim()).filter(Boolean)) {
    await db.execute(stmt);
  }
  console.log("[seed] Schema applied");
}

async function seedPokemon(): Promise<void> {
  const rows = readJson<Pokemon>("pokemon.json");
  let ok = 0;
  let skip = 0;
  for (const row of rows) {
    const result = pokemonSchema.safeParse(row);
    if (!result.success) {
      console.error(`[seed] pokemon '${row.id}' validation error:`, result.error.flatten());
      skip++;
      continue;
    }
    const p = result.data;
    await db.execute({
      sql: `INSERT OR REPLACE INTO pokemon
        (id, dex_number, name, display_name, types, base_stats, abilities, moves,
         evolutions, forms, drops, catch_rate, base_exp, growth_rate, egg_groups,
         gender_ratio, generation)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        p.id, p.dexNumber, p.name, p.displayName,
        JSON.stringify(p.types),
        JSON.stringify(p.baseStats),
        JSON.stringify(p.abilities),
        JSON.stringify(p.moves),
        JSON.stringify(p.evolutions),
        JSON.stringify(p.forms),
        JSON.stringify(p.drops),
        p.catchRate, p.baseExp, p.growthRate,
        JSON.stringify(p.eggGroups),
        p.genderRatio ?? null, p.generation,
      ],
    });
    ok++;
  }
  console.log(`[seed] pokemon: ${ok} inserted, ${skip} skipped`);
}

async function seedSpawns(): Promise<void> {
  const rows = readJson<SpawnEntry>("spawns.json");
  let ok = 0;
  let skip = 0;
  for (const row of rows) {
    const result = spawnEntrySchema.safeParse(row);
    if (!result.success) {
      console.error(`[seed] spawn '${row.id}' validation error:`, result.error.flatten());
      skip++;
      continue;
    }
    const s = result.data;
    await db.execute({
      sql: `INSERT OR REPLACE INTO spawn_entries
        (id, pokemon_id, bucket, context, biomes, weight, level_min, level_max,
         conditions, anticonditions)
        VALUES (?,?,?,?,?,?,?,?,?,?)`,
      args: [
        s.id, s.pokemonId, s.bucket, s.context,
        JSON.stringify(s.biomes),
        s.weight, s.levelRange.min, s.levelRange.max,
        JSON.stringify(s.conditions),
        JSON.stringify(s.anticonditions),
      ],
    });
    ok++;
  }
  console.log(`[seed] spawn_entries: ${ok} inserted, ${skip} skipped`);
}

async function seedItems(): Promise<void> {
  const rows = readJson<Item>("items.json");
  let ok = 0;
  let skip = 0;
  for (const row of rows) {
    const result = itemSchema.safeParse(row);
    if (!result.success) {
      console.error(`[seed] item '${row.id}' validation error:`, result.error.flatten());
      skip++;
      continue;
    }
    const it = result.data;
    await db.execute({
      sql: `INSERT OR REPLACE INTO items
        (id, name, display_name, category, description, sprite, dropped_by)
        VALUES (?,?,?,?,?,?,?)`,
      args: [
        it.id, it.name, it.displayName, it.category,
        it.description, it.sprite ?? null,
        JSON.stringify(it.droppedBy),
      ],
    });
    ok++;
  }
  console.log(`[seed] items: ${ok} inserted, ${skip} skipped`);
}

async function seedMoves(): Promise<void> {
  const rows = readJson<Move>("moves.json");
  let ok = 0;
  let skip = 0;
  for (const row of rows) {
    const result = moveSchema.safeParse(row);
    if (!result.success) {
      console.error(`[seed] move '${row.id}' validation error:`, result.error.flatten());
      skip++;
      continue;
    }
    const m = result.data;
    await db.execute({
      sql: `INSERT OR REPLACE INTO moves
        (id, name, display_name, type, category, power, accuracy, pp)
        VALUES (?,?,?,?,?,?,?,?)`,
      args: [
        m.id, m.name, m.displayName, m.type, m.category,
        m.power ?? null, m.accuracy ?? null, m.pp,
      ],
    });
    ok++;
  }
  console.log(`[seed] moves: ${ok} inserted, ${skip} skipped`);
}

async function main(): Promise<void> {
  console.log(`[seed] Connecting to: ${url}`);
  await applySchema();
  await seedPokemon();
  await seedSpawns();
  await seedItems();
  await seedMoves();
  console.log("[seed] Done");
  db.close();
}

main().catch((err) => {
  console.error("[seed] Fatal error:", err);
  process.exit(1);
});
