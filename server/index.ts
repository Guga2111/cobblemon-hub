import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { db } from "./db/client.ts";
import { pokemonSchema } from "../src/lib/schemas.ts";

const app = new Hono();

app.use(
  "/api/*",
  cors({
    origin: "http://localhost:5173",
    allowMethods: ["GET"],
    allowHeaders: ["Content-Type"],
  })
);

// ── Helpers ─────────────────────────────────────────────────────────

function rowToPokemon(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    dexNumber: row.dex_number as number,
    name: row.name as string,
    displayName: row.display_name as string,
    types: JSON.parse(row.types as string) as unknown,
    baseStats: JSON.parse(row.base_stats as string) as unknown,
    abilities: JSON.parse(row.abilities as string) as unknown,
    moves: JSON.parse(row.moves as string) as unknown,
    evolutions: JSON.parse(row.evolutions as string) as unknown,
    forms: JSON.parse(row.forms as string) as unknown,
    drops: JSON.parse(row.drops as string) as unknown,
    catchRate: row.catch_rate as number,
    baseExp: row.base_exp as number,
    growthRate: row.growth_rate as string,
    eggGroups: JSON.parse(row.egg_groups as string) as unknown,
    genderRatio: row.gender_ratio as number | null,
    generation: row.generation as number,
  };
}

function rowToListItem(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    dexNumber: row.dex_number as number,
    name: row.name as string,
    displayName: row.display_name as string,
    types: JSON.parse(row.types as string) as unknown,
    generation: row.generation as number,
  };
}

// ── Pokemon routes ──────────────────────────────────────────────────

// GET /api/pokemon — list with optional filters (type, generation) and pagination
app.get("/api/pokemon", async (c) => {
  const query = c.req.query();
  const page = Math.max(1, parseInt(query.page ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? "20", 10)));
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const args: (string | number)[] = [];

  if (query.type) {
    conditions.push("types LIKE ?");
    args.push(`%"${query.type}"%`);
  }
  if (query.generation) {
    conditions.push("generation = ?");
    args.push(parseInt(query.generation, 10));
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const [countResult, dataResult] = await Promise.all([
    db.execute({ sql: `SELECT COUNT(*) as total FROM pokemon ${where}`, args }),
    db.execute({
      sql: `SELECT id, dex_number, name, display_name, types, generation FROM pokemon ${where} ORDER BY dex_number LIMIT ? OFFSET ?`,
      args: [...args, limit, offset],
    }),
  ]);

  const total = Number((countResult.rows[0] as Record<string, unknown>).total);

  return c.json({
    data: dataResult.rows.map((r) => rowToListItem(r as Record<string, unknown>)),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// GET /api/pokemon/search?q= — fuzzy search by name (must be before /:id)
app.get("/api/pokemon/search", async (c) => {
  const q = (c.req.query("q") ?? "").trim();
  if (!q) return c.json({ data: [] });

  const result = await db.execute({
    sql: "SELECT id, dex_number, name, display_name, types, generation FROM pokemon WHERE name LIKE ? OR display_name LIKE ? ORDER BY dex_number LIMIT 20",
    args: [`%${q}%`, `%${q}%`],
  });

  return c.json({
    data: result.rows.map((r) => rowToListItem(r as Record<string, unknown>)),
  });
});

// GET /api/pokemon/:id — full data including spawns
app.get("/api/pokemon/:id", async (c) => {
  const id = c.req.param("id");

  const [pokemonResult, spawnResult] = await Promise.all([
    db.execute({
      sql: "SELECT * FROM pokemon WHERE id = ? OR name = ?",
      args: [id, id],
    }),
    db.execute({
      sql: "SELECT * FROM spawn_entries WHERE pokemon_id = ?",
      args: [id],
    }),
  ]);

  if (pokemonResult.rows.length === 0) {
    return c.json({ error: "Pokemon not found" }, 404);
  }

  const pokemon = rowToPokemon(pokemonResult.rows[0] as Record<string, unknown>);

  const spawns = spawnResult.rows.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: r.id,
      pokemonId: r.pokemon_id,
      bucket: r.bucket,
      context: r.context,
      biomes: JSON.parse(r.biomes as string),
      weight: r.weight,
      levelMin: r.level_min,
      levelMax: r.level_max,
      conditions: JSON.parse(r.conditions as string),
      anticonditions: JSON.parse(r.anticonditions as string),
    };
  });

  const validated = pokemonSchema.safeParse(pokemon);
  if (!validated.success) {
    console.error(`[/api/pokemon/:id] Validation warning for ${id}:`, validated.error.issues);
  }

  return c.json({ data: { ...pokemon, spawns } });
});

// ── Health ──────────────────────────────────────────────────────────

app.get("/api/health", (c) => c.json({ status: "ok" }));

// ── Start ───────────────────────────────────────────────────────────

const port = 3001;
serve({ fetch: app.fetch, port }, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
