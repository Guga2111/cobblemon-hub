import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { spawnSync } from "child_process";
import { createClient } from "@libsql/client";
import { pokemonSchema, spawnEntrySchema, itemSchema, moveSchema } from "../src/lib/schemas";
import type { Pokemon } from "../src/types/pokemon";
import type { SpawnEntry } from "../src/types/spawn";
import type { Item } from "../src/types/item";
import type { Move } from "../src/types/move";
import type { GymLeader } from "../src/types/gym-leader";

const url = process.env.TURSO_DATABASE_URL ?? "file:./data/cobblemon.db";
const authToken = process.env.TURSO_AUTH_TOKEN;
const db = createClient(url.startsWith("file:") ? { url } : { url, authToken });

const DATAPACK_VERSION = "1.7.3+1.21.1";

interface DataFile<T> {
  _meta?: { datapackVersion: string; generatedAt: string };
  data: T[];
}

function readJson<T>(filename: string): DataFile<T> {
  const path = resolve("./data", filename);
  if (!existsSync(path)) {
    console.warn(`[seed] ${filename} not found — skipping`);
    return { data: [] };
  }
  const raw = JSON.parse(readFileSync(path, "utf-8")) as DataFile<T> | T[];
  if (Array.isArray(raw)) {
    return { data: raw };
  }
  return raw;
}

function runExtract(script: string): void {
  const tsxBin = resolve("./node_modules/.bin/tsx");
  const result = spawnSync(tsxBin, [script], { stdio: "inherit", cwd: resolve(".") });
  if (result.status !== 0) {
    throw new Error(`[seed] Extract script ${script} failed with status ${String(result.status)}`);
  }
}

async function applySchema(): Promise<void> {
  const schemaPath = resolve("./server/db/schema.sql");
  const sql = readFileSync(schemaPath, "utf-8");
  for (const stmt of sql.split(";").map((s) => s.trim()).filter(Boolean)) {
    await db.execute(stmt);
  }

  // Add columns to existing tables if not present (idempotent migration)
  const alterStmts = [
    "ALTER TABLE pokemon ADD COLUMN source_file TEXT",
    "ALTER TABLE spawn_entries ADD COLUMN source_file TEXT",
    "ALTER TABLE spawn_entries ADD COLUMN weight_multiplier TEXT",
    "ALTER TABLE items ADD COLUMN source_file TEXT",
    "ALTER TABLE items ADD COLUMN obtain_method TEXT",
    "ALTER TABLE items ADD COLUMN recipe TEXT",
    "ALTER TABLE items ADD COLUMN effect TEXT",
    "ALTER TABLE moves ADD COLUMN source_file TEXT",
  ];
  for (const stmt of alterStmts) {
    try {
      await db.execute(stmt);
    } catch {
      // Column already exists — safe to ignore
    }
  }

  console.log("[seed] Schema applied");
}

async function seedPokemon(): Promise<void> {
  const file = readJson<Pokemon>("pokemon.json");
  const rows = file.data;
  const datapackVersion = file._meta?.datapackVersion ?? DATAPACK_VERSION;
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
         gender_ratio, generation, source_file)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
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
        p.sourceFile ?? datapackVersion,
      ],
    });
    ok++;
  }
  console.log(`[seed] pokemon: ${ok} inserted, ${skip} skipped`);
}

async function seedSpawns(): Promise<void> {
  const file = readJson<SpawnEntry>("spawns.json");
  const rows = file.data;
  const datapackVersion = file._meta?.datapackVersion ?? DATAPACK_VERSION;
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
        (id, pokemon_id, bucket, context, biomes, weight, weight_multiplier, level_min, level_max,
         conditions, anticonditions, source_file)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        s.id, s.pokemonId, s.bucket, s.context,
        JSON.stringify(s.biomes),
        s.weight,
        s.weightMultiplier !== null ? JSON.stringify(s.weightMultiplier) : null,
        s.levelRange.min, s.levelRange.max,
        JSON.stringify(s.conditions),
        JSON.stringify(s.anticonditions),
        s.sourceFile ?? datapackVersion,
      ],
    });
    ok++;
  }
  console.log(`[seed] spawn_entries: ${ok} inserted, ${skip} skipped`);
}

async function seedItems(): Promise<void> {
  const file = readJson<Item>("items.json");
  const rows = file.data;
  const datapackVersion = file._meta?.datapackVersion ?? DATAPACK_VERSION;
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
        (id, name, display_name, category, description, sprite, dropped_by, obtain_method, recipe, effect, source_file)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        it.id, it.name, it.displayName, it.category,
        it.description, it.sprite ?? null,
        JSON.stringify(it.droppedBy),
        it.obtainMethod ?? null,
        it.recipe !== null ? JSON.stringify(it.recipe) : null,
        it.effect ?? null,
        it.sourceFile ?? datapackVersion,
      ],
    });
    ok++;
  }
  console.log(`[seed] items: ${ok} inserted, ${skip} skipped`);
}

async function seedMoves(): Promise<void> {
  const file = readJson<Move>("moves.json");
  const rows = file.data;
  const datapackVersion = file._meta?.datapackVersion ?? DATAPACK_VERSION;
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
        (id, name, display_name, type, category, power, accuracy, pp, source_file)
        VALUES (?,?,?,?,?,?,?,?,?)`,
      args: [
        m.id, m.name, m.displayName, m.type, m.category,
        m.power ?? null, m.accuracy ?? null, m.pp,
        m.sourceFile ?? datapackVersion,
      ],
    });
    ok++;
  }
  console.log(`[seed] moves: ${ok} inserted, ${skip} skipped`);
}

async function seedGymLeaders(): Promise<void> {
  const file = readJson<GymLeader>("gym-leaders.json");
  const rows = file.data;
  let ok = 0;
  for (const g of rows) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO gym_leaders
        (id, name, region, role, type_specialty, badge_name, level_cap,
         order_in_region, biome, team, rewards, unlock_requirement, locate_command)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        g.id, g.name, g.region, g.role, g.typeSpecialty,
        g.badgeName ?? null, g.levelCap, g.orderInRegion,
        g.biome ?? null,
        JSON.stringify(g.team),
        JSON.stringify(g.rewards),
        g.unlockRequirement ?? null,
        g.locateCommand ?? null,
      ],
    });
    ok++;
  }
  console.log(`[seed] gym_leaders: ${ok} inserted`);
}

async function main(): Promise<void> {
  console.log(`[seed] Connecting to: ${url}`);

  // Regenerate data files from canonical datapack sources
  console.log("[seed] Extracting pokemon from datapack...");
  runExtract("scripts/extract-pokemon.ts");

  console.log("[seed] Extracting spawns from datapack...");
  runExtract("scripts/extract-spawns.ts");

  console.log("[seed] Extracting items from pokemon drops...");
  runExtract("scripts/extract-items.ts");

  await applySchema();
  await seedPokemon();
  await seedSpawns();
  await seedItems();
  await seedMoves();
  await seedGymLeaders();
  console.log("[seed] Done");
  db.close();
}

main().catch((err) => {
  console.error("[seed] Fatal error:", err);
  process.exit(1);
});
