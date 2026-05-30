CREATE TABLE IF NOT EXISTS pokemon (
  id TEXT PRIMARY KEY,
  dex_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  types TEXT NOT NULL,         -- JSON: [PokemonType] | [PokemonType, PokemonType]
  base_stats TEXT NOT NULL,    -- JSON: BaseStats object
  abilities TEXT NOT NULL,     -- JSON: Ability[]
  moves TEXT NOT NULL,         -- JSON: LearnableMove[]
  evolutions TEXT NOT NULL,    -- JSON: Evolution[]
  forms TEXT NOT NULL,         -- JSON: PokemonForm[]
  drops TEXT NOT NULL,         -- JSON: ItemDrop[]
  catch_rate INTEGER NOT NULL,
  base_exp INTEGER NOT NULL,
  growth_rate TEXT NOT NULL,
  egg_groups TEXT NOT NULL,    -- JSON: EggGroup[]
  gender_ratio REAL,           -- null = genderless
  generation INTEGER NOT NULL,
  source_file TEXT             -- datapack source file for traceability
);

CREATE TABLE IF NOT EXISTS spawn_entries (
  id TEXT PRIMARY KEY,
  pokemon_id TEXT NOT NULL,
  bucket TEXT NOT NULL,
  context TEXT NOT NULL,
  biomes TEXT NOT NULL,        -- JSON: string[]
  weight REAL NOT NULL,
  level_min INTEGER NOT NULL,
  level_max INTEGER NOT NULL,
  conditions TEXT NOT NULL,    -- JSON: SpawnCondition
  anticonditions TEXT NOT NULL, -- JSON: SpawnCondition
  source_file TEXT              -- datapack source file for traceability
);

CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  sprite TEXT,                 -- nullable
  dropped_by TEXT NOT NULL,    -- JSON: string[] of pokemon IDs
  source_file TEXT             -- datapack source file for traceability
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS gym_leaders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  role TEXT NOT NULL,              -- gym-leader, elite-four, champion
  type_specialty TEXT NOT NULL,
  badge_name TEXT,                 -- nullable for E4
  level_cap INTEGER NOT NULL,
  order_in_region INTEGER NOT NULL,
  biome TEXT,
  team TEXT NOT NULL,              -- JSON: TrainerPokemon[]
  rewards TEXT NOT NULL,           -- JSON: string[]
  unlock_requirement TEXT,
  locate_command TEXT
);

CREATE TABLE IF NOT EXISTS moves (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  power INTEGER,               -- nullable
  accuracy INTEGER,            -- nullable
  pp INTEGER NOT NULL,
  source_file TEXT             -- datapack source file for traceability
);
