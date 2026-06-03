import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { compress } from "hono/compress";
import { db } from "./db/client.ts";
import { pokemonSchema, itemSchema, spawnEntrySchema } from "../src/lib/schemas.ts";
import { authApp } from "./auth/routes.ts";

const app = new Hono();

// ── Middleware ──────────────────────────────────────────────────────
app.use("*", logger());
app.use("*", compress());

app.onError((err, c) => {
  console.error("[API Error]", err.stack ?? err.message);
  return c.json({ error: "Internal server error" }, 500);
});

app.use(
  "/api/*",
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    allowMethods: ["GET", "POST"],
    allowHeaders: ["Content-Type"],
    credentials: true,
  })
);

// ── Security headers ────────────────────────────────────────────────
app.use("/api/*", async (c, next) => {
  await next();
  c.header(
    "Content-Security-Policy-Report-Only",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; connect-src 'self'"
  );
});

// ── Cache headers ───────────────────────────────────────────────────
app.use("/api/*", async (c, next) => {
  await next();
  const path = c.req.path;
  if (path.startsWith("/api/auth")) {
    c.header("Cache-Control", "no-store");
  } else {
    c.header("Cache-Control", "public, max-age=300");
  }
});

// ── Auth routes ───────────────────────────────────────────────────
app.route("/api/auth", authApp);

// ── Helpers ─────────────────────────────────────────────────────────

const POKEMON_TYPES = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison",
  "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy",
] as const;

function escapeLike(str: string): string {
  return str.replace(/[%_\\]/g, (c) => `\\${c}`);
}

function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function rowToPokemon(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    dexNumber: row.dex_number as number,
    name: row.name as string,
    displayName: row.display_name as string,
    types: safeJsonParse(row.types as string, []),
    baseStats: safeJsonParse(row.base_stats as string, {}),
    abilities: safeJsonParse(row.abilities as string, []),
    moves: safeJsonParse(row.moves as string, []),
    evolutions: safeJsonParse(row.evolutions as string, []),
    forms: safeJsonParse(row.forms as string, []),
    drops: safeJsonParse(row.drops as string, []),
    catchRate: row.catch_rate as number,
    baseExp: row.base_exp as number,
    growthRate: row.growth_rate as string,
    eggGroups: safeJsonParse(row.egg_groups as string, []),
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
    types: safeJsonParse(row.types as string, []),
    baseStats: safeJsonParse(row.base_stats as string, null),
    generation: row.generation as number,
    primaryBucket: (row.primary_bucket as string | null) ?? null,
    primaryBiomes: row.primary_biomes
      ? safeJsonParse<string[]>(row.primary_biomes as string, [])
      : null,
    primaryContext: (row.primary_context as string | null) ?? null,
    primaryWeather: (row.primary_weather as string | null) ?? null,
  };
}

// ── Pokemon routes ──────────────────────────────────────────────────

// GET /api/pokemon — list with optional filters (type, generation) and pagination
app.get("/api/pokemon", async (c) => {
  const query = c.req.query();
  const page = Math.max(1, parseInt(query.page ?? "1", 10));
  const limit = Math.min(500, Math.max(1, parseInt(query.limit ?? "20", 10)));
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const args: (string | number)[] = [];

  if (query.type) {
    if (!POKEMON_TYPES.includes(query.type as typeof POKEMON_TYPES[number])) {
      return c.json({ error: "Invalid type parameter" }, 400);
    }
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
      sql: `WITH ranked_spawns AS (
        SELECT
          pokemon_id, bucket, biomes, context, conditions,
          ROW_NUMBER() OVER (PARTITION BY pokemon_id ORDER BY weight DESC) as rn
        FROM spawn_entries
      )
      SELECT
        p.id, p.dex_number, p.name, p.display_name, p.types, p.base_stats, p.generation,
        rs.bucket as primary_bucket,
        rs.biomes as primary_biomes,
        rs.context as primary_context,
        CASE
          WHEN json_extract(rs.conditions, '$.isThundering') = 1 THEN 'thunderstorm'
          WHEN json_extract(rs.conditions, '$.isRaining') = 1 THEN 'rain'
          ELSE NULL
        END as primary_weather
      FROM pokemon p
      LEFT JOIN ranked_spawns rs ON rs.pokemon_id = p.id AND rs.rn = 1
      ${where} ORDER BY p.dex_number LIMIT ? OFFSET ?`,
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
    sql: "SELECT id, dex_number, name, display_name, types, generation FROM pokemon WHERE name LIKE ? ESCAPE '\\' OR display_name LIKE ? ESCAPE '\\' ORDER BY dex_number LIMIT 20",
    args: [`%${escapeLike(q)}%`, `%${escapeLike(q)}%`],
  });

  return c.json({
    data: result.rows.map((r) => {
      const row = r as Record<string, unknown>;
      return {
        id: row.id as string,
        dexNumber: row.dex_number as number,
        name: row.name as string,
        displayName: row.display_name as string,
        types: safeJsonParse(row.types as string, []),
        generation: row.generation as number,
      };
    }),
  });
});

// GET /api/pokemon/:id — full data including spawns and prev/next navigation
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
  const dexNumber = (pokemonResult.rows[0] as Record<string, unknown>).dex_number as number;

  const [prevResult, nextResult] = await Promise.all([
    db.execute({
      sql: "SELECT id FROM pokemon WHERE dex_number < ? ORDER BY dex_number DESC LIMIT 1",
      args: [dexNumber],
    }),
    db.execute({
      sql: "SELECT id FROM pokemon WHERE dex_number > ? ORDER BY dex_number ASC LIMIT 1",
      args: [dexNumber],
    }),
  ]);

  const prevId = prevResult.rows.length > 0
    ? (prevResult.rows[0] as Record<string, unknown>).id as string
    : null;
  const nextId = nextResult.rows.length > 0
    ? (nextResult.rows[0] as Record<string, unknown>).id as string
    : null;

  const spawns = spawnResult.rows.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: r.id,
      pokemonId: r.pokemon_id,
      bucket: r.bucket,
      context: r.context,
      biomes: safeJsonParse(r.biomes as string, []),
      weight: r.weight,
      weightMultiplier: r.weight_multiplier ? safeJsonParse(r.weight_multiplier as string, null) : null,
      levelMin: r.level_min,
      levelMax: r.level_max,
      conditions: safeJsonParse(r.conditions as string, {}),
      anticonditions: safeJsonParse(r.anticonditions as string, {}),
    };
  });

  const validated = pokemonSchema.safeParse(pokemon);
  if (!validated.success) {
    console.error(`[/api/pokemon/:id] Validation warning for ${id}:`, validated.error.issues);
  }

  return c.json({ data: { ...pokemon, spawns, prevId, nextId } });
});

// ── Spawn routes ────────────────────────────────────────────────────

// GET /api/spawns/:pokemonId — spawn entries grouped by biome
app.get("/api/spawns/:pokemonId", async (c) => {
  const pokemonId = c.req.param("pokemonId");

  const result = await db.execute({
    sql: "SELECT * FROM spawn_entries WHERE pokemon_id = ? ORDER BY weight DESC",
    args: [pokemonId],
  });

  if (result.rows.length === 0) {
    return c.json({ data: { grouped: {}, entries: [] } });
  }

  const entries = result.rows.map((row) => {
    const r = row as Record<string, unknown>;
    const entry = {
      id: r.id as string,
      pokemonId: r.pokemon_id as string,
      bucket: r.bucket as string,
      context: r.context as string,
      biomes: safeJsonParse<string[]>(r.biomes as string, []),
      weight: r.weight as number,
      weightMultiplier: r.weight_multiplier ? safeJsonParse(r.weight_multiplier as string, null) : null,
      levelRange: { min: r.level_min as number, max: r.level_max as number },
      conditions: safeJsonParse(r.conditions as string, {}),
      anticonditions: safeJsonParse(r.anticonditions as string, {}),
    };

    const validated = spawnEntrySchema.safeParse(entry);
    if (!validated.success) {
      console.error(`[/api/spawns/:pokemonId] Validation warning for entry ${entry.id}:`, validated.error.issues);
    }

    return entry;
  });

  // Group entries by biome (an entry with multiple biomes appears in each)
  const grouped: Record<string, typeof entries> = {};
  for (const entry of entries) {
    for (const biome of entry.biomes) {
      if (!grouped[biome]) grouped[biome] = [];
      grouped[biome].push(entry);
    }
  }

  return c.json({ data: { grouped, entries } });
});

// ── Item routes ─────────────────────────────────────────────────────

function rowToItem(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    name: row.name as string,
    displayName: row.display_name as string,
    category: row.category as string,
    description: row.description as string,
    sprite: row.sprite as string | null,
    droppedBy: safeJsonParse<string[]>(row.dropped_by as string, []),
    obtainMethod: (row.obtain_method as string | null) ?? null,
    recipe: row.recipe ? safeJsonParse(row.recipe as string, null) : null,
    effect: (row.effect as string | null) ?? null,
  };
}

// GET /api/items — list with optional text search (q) and category filter
app.get("/api/items", async (c) => {
  const query = c.req.query();
  const q = (query.q ?? "").trim();
  const category = (query.category ?? "").trim();

  const conditions: string[] = [];
  const args: (string | number)[] = [];

  if (q) {
    conditions.push("(name LIKE ? ESCAPE '\\' OR display_name LIKE ? ESCAPE '\\')");
    args.push(`%${escapeLike(q)}%`, `%${escapeLike(q)}%`);
  }
  if (category) {
    conditions.push("category = ?");
    args.push(category);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await db.execute({
    sql: `SELECT * FROM items ${where} ORDER BY display_name`,
    args,
  });

  const items = result.rows.map((r) => rowToItem(r as Record<string, unknown>));

  return c.json({ data: items });
});

// GET /api/items/:id — full item data
app.get("/api/items/:id", async (c) => {
  const id = c.req.param("id");

  const result = await db.execute({
    sql: "SELECT * FROM items WHERE id = ? OR name = ?",
    args: [id, id],
  });

  if (result.rows.length === 0) {
    return c.json({ error: "Item not found" }, 404);
  }

  const item = rowToItem(result.rows[0] as Record<string, unknown>);

  const validated = itemSchema.safeParse(item);
  if (!validated.success) {
    console.error(`[/api/items/:id] Validation warning for ${id}:`, validated.error.issues);
  }

  return c.json({ data: item });
});

// ── Gym Leader routes ───────────────────────────────────────────────

function rowToGymLeader(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    name: row.name as string,
    region: row.region as string,
    role: row.role as string,
    typeSpecialty: row.type_specialty as string,
    badgeName: row.badge_name as string | null,
    levelCap: row.level_cap as number,
    orderInRegion: row.order_in_region as number,
    biome: row.biome as string | null,
    team: safeJsonParse(row.team as string, []),
    rewards: safeJsonParse(row.rewards as string, []),
    unlockRequirement: row.unlock_requirement as string | null,
    locateCommand: row.locate_command as string | null,
  };
}

// GET /api/gym-leaders — all gym leaders, optionally filtered by region
app.get("/api/gym-leaders", async (c) => {
  const region = (c.req.query("region") ?? "").trim();

  let sql = "SELECT * FROM gym_leaders";
  const args: string[] = [];

  if (region) {
    sql += " WHERE region = ?";
    args.push(region);
  }

  sql += " ORDER BY CASE region WHEN 'kanto' THEN 1 WHEN 'johto' THEN 2 WHEN 'hoenn' THEN 3 WHEN 'sinnoh' THEN 4 END, order_in_region";

  const result = await db.execute({ sql, args });
  return c.json({ data: result.rows.map((r) => rowToGymLeader(r as Record<string, unknown>)) });
});

// GET /api/gym-leaders/:id — single gym leader detail
app.get("/api/gym-leaders/:id", async (c) => {
  const id = c.req.param("id");
  const result = await db.execute({
    sql: "SELECT * FROM gym_leaders WHERE id = ?",
    args: [id],
  });

  if (result.rows.length === 0) {
    return c.json({ error: "Gym leader not found" }, 404);
  }

  return c.json({ data: rowToGymLeader(result.rows[0] as Record<string, unknown>) });
});

// ── Health ──────────────────────────────────────────────────────────

app.get("/api/health", (c) => c.json({ status: "ok" }));

// ── Start ───────────────────────────────────────────────────────────

const port = 3001;
serve({ fetch: app.fetch, port }, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
