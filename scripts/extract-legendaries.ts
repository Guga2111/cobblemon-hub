/**
 * Extracts legendary and mythical Pokémon data from the Cobblemon datapack.
 * Reads species/ to identify legendary/mythical by labels, checks spawn_pool_world/
 * for any spawn data, and merges with existing legendaries.json.
 * Set COBBLEMON_DATAPACK_PATH env var to the root of the extracted datapack.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const DATAPACK_PATH = process.env.COBBLEMON_DATAPACK_PATH ?? "./data/datapack";
const DATAPACK_VERSION = "1.7.3+1.21.1";
const SPECIES_DIR = join(DATAPACK_PATH, "data", "cobblemon", "species");
const SPAWN_DIR = join(DATAPACK_PATH, "data", "cobblemon", "spawn_pool_world");
const OUTPUT_PATH = "./data/legendaries.json";

// ── Constants ──────────────────────────────────────────────────────────────────

const GEN_FOLDER_REGION: Record<string, { region: string; gen: number }> = {
  generation1: { region: "kanto", gen: 1 },
  generation2: { region: "johto", gen: 2 },
  generation3: { region: "hoenn", gen: 3 },
  generation4: { region: "sinnoh", gen: 4 },
  generation5: { region: "unova", gen: 5 },
  generation6: { region: "kalos", gen: 6 },
  generation7: { region: "alola", gen: 7 },
  generation7b: { region: "alola", gen: 7 },
  generation8: { region: "galar", gen: 8 },
  generation8a: { region: "hisui", gen: 8 },
  generation9: { region: "paldea", gen: 9 },
};

const REGION_LABELS: Record<string, string> = {
  kanto: "Kanto",
  johto: "Johto",
  hoenn: "Hoenn",
  sinnoh: "Sinnoh",
  unova: "Unova",
  kalos: "Kalos",
  alola: "Alola",
  galar: "Galar",
  hisui: "Hisui",
  paldea: "Paldea",
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface SpawnConditions {
  timeRange?: string | null;
  isThundering?: boolean | null;
  minSkyLight?: number | null;
  maxSkyLight?: number | null;
}

interface LegendaryEntry {
  id: string;
  pokemonId: string;
  displayName: string;
  dexNumber: number;
  types: string[];
  generation: number;
  category: "legendary" | "mythical";
  region: string;
  obtainMethod: string;
  spawnMethod: string;
  biome: string | null;
  location: string | null;
  dimension: string;
  conditions: SpawnConditions | null;
  rarity: string | null;
  description: string;
  sourceFile: string;
}

interface RawSpecies {
  nationalPokedexNumber: number;
  name: string;
  primaryType: string;
  secondaryType?: string;
  labels?: string[];
}

interface RawSpawnEntry {
  pokemon?: string;
  bucket?: string;
  condition?: {
    biomes?: string[];
    timeRange?: string;
    isThundering?: boolean;
    minSkyLight?: number;
    maxSkyLight?: number;
    structures?: string[];
  };
  anticondition?: Record<string, unknown>;
}

interface RawSpawnFile {
  spawns?: RawSpawnEntry[];
}

interface ExistingEntry {
  id: string;
  displayName?: string;
  dexNumber?: number;
  types?: string[];
  generation?: number;
  category?: string;
  region?: string;
  obtainMethod?: string;
  biome?: string | null;
  dimension?: string;
  description?: string;
}

interface LegendariesFile {
  _meta?: { datapackVersion: string; generatedAt: string };
  legendaries: ExistingEntry[];
  obtainMethods: Record<string, { name: string; description: string }>;
  dimensions: Array<{ id: string; name: string; description: string }>;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDisplayName(name: string): string {
  return name
    .split(/[-_\s]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function generateDescription(_name: string, category: "legendary" | "mythical", region: string): string {
  const regionLabel = REGION_LABELS[region] ?? region;
  if (category === "mythical") {
    return `Pokemon Mitico de ${regionLabel}. Informacoes de obtencao em verificacao.`;
  }
  return `Pokemon Lendario de ${regionLabel}. Informacoes de obtencao em verificacao.`;
}

// ── Extract legendary/mythical species from datapack ──────────────────────────

function extractSpeciesFromDatapack(): Map<string, { entry: Omit<LegendaryEntry, "conditions" | "rarity">; sourceFile: string }> {
  const result = new Map<string, { entry: Omit<LegendaryEntry, "conditions" | "rarity">; sourceFile: string }>();

  for (const genFolder of readdirSync(SPECIES_DIR)) {
    const genPath = join(SPECIES_DIR, genFolder);
    if (!statSync(genPath).isDirectory()) continue;

    const { region, gen } = GEN_FOLDER_REGION[genFolder] ?? { region: "unknown", gen: 0 };

    for (const fname of readdirSync(genPath)) {
      if (!fname.endsWith(".json")) continue;
      const filePath = join(genPath, fname);
      const raw = JSON.parse(readFileSync(filePath, "utf-8")) as RawSpecies;

      const labels = raw.labels ?? [];
      const isLegendary = labels.includes("legendary");
      const isMythical = labels.includes("mythical");
      if (!isLegendary && !isMythical) continue;

      const id = normalizeId(raw.name);
      const displayName = formatDisplayName(raw.name);
      const types = [raw.primaryType, raw.secondaryType].filter((t): t is string => !!t);
      const category: "legendary" | "mythical" = isMythical ? "mythical" : "legendary";

      result.set(id, {
        sourceFile: filePath.split("/").pop() ?? fname,
        entry: {
          id,
          pokemonId: id,
          displayName,
          dexNumber: raw.nationalPokedexNumber,
          types,
          generation: gen,
          category,
          region,
          obtainMethod: "raid",
          spawnMethod: "raid",
          biome: null,
          location: null,
          dimension: "overworld",
          description: generateDescription(displayName, category, region),
          sourceFile: `species/${genFolder}/${fname}`,
        },
      });
    }
  }

  return result;
}

// ── Check spawn pool for legendary spawn data ──────────────────────────────────

function extractSpawnDataForLegendaries(
  legendaryIds: Set<string>
): Map<string, { bucket: string; conditions: SpawnConditions }> {
  const result = new Map<string, { bucket: string; conditions: SpawnConditions }>();

  for (const fname of readdirSync(SPAWN_DIR)) {
    if (!fname.endsWith(".json")) continue;
    const raw = JSON.parse(readFileSync(join(SPAWN_DIR, fname), "utf-8")) as RawSpawnFile;

    for (const spawn of raw.spawns ?? []) {
      const pokemonName = spawn.pokemon?.split(" ")[0] ?? "";
      const pokemonId = normalizeId(pokemonName);
      if (!legendaryIds.has(pokemonId)) continue;

      const cond = spawn.condition ?? {};
      result.set(pokemonId, {
        bucket: spawn.bucket ?? "ultra_rare",
        conditions: {
          timeRange: cond.timeRange ?? null,
          isThundering: cond.isThundering ?? null,
          minSkyLight: cond.minSkyLight ?? null,
          maxSkyLight: cond.maxSkyLight ?? null,
        },
      });
    }
  }

  return result;
}

// ── Load existing legendaries.json ─────────────────────────────────────────────

function loadExisting(): LegendariesFile {
  try {
    return JSON.parse(readFileSync(OUTPUT_PATH, "utf-8")) as LegendariesFile;
  } catch {
    return {
      legendaries: [],
      obtainMethods: {
        shrine: { name: "Santuario", description: "Estruturas que geram naturalmente no mundo. Interaja com o monumento para iniciar a batalha contra o lendario." },
        raid: { name: "Raid Lendaria", description: "Aparece como boss em Raids de 5-7 estrelas. Requer um grupo forte e coordenacao." },
        quest: { name: "Quest / Evento", description: "Requer completar uma serie de tarefas ou eventos especiais no servidor." },
      },
      dimensions: [
        { id: "overworld", name: "Overworld", description: "O mundo principal do Minecraft. A maioria dos lendarios pode ser encontrada aqui." },
        { id: "nether", name: "Nether", description: "A dimensao infernal." },
        { id: "distortion_world", name: "Distortion World", description: "Dimensao especial do Cobbleverse. Lar de Giratina." },
        { id: "nightmare", name: "Nightmare", description: "A dimensao dos pesadelos. Lar de Darkrai." },
        { id: "origin", name: "Origin", description: "A dimensao de origem. Lar de Arceus." },
      ],
    };
  }
}

// ── Build final legendaries array ──────────────────────────────────────────────

function buildLegendaries(
  datapackSpecies: Map<string, { entry: Omit<LegendaryEntry, "conditions" | "rarity">; sourceFile: string }>,
  spawnData: Map<string, { bucket: string; conditions: SpawnConditions }>,
  existing: LegendariesFile
): LegendaryEntry[] {
  const existingMap = new Map<string, ExistingEntry>(
    existing.legendaries.map((e) => [e.id, e])
  );

  const output: LegendaryEntry[] = [];

  // Only include Pokémon that exist in the datapack
  for (const [id, { entry }] of datapackSpecies) {
    const prev = existingMap.get(id);
    const spawn = spawnData.get(id);

    const finalEntry: LegendaryEntry = {
      ...entry,
      // Preserve manually curated fields from existing data
      obtainMethod: prev?.obtainMethod ?? entry.obtainMethod,
      spawnMethod: prev?.obtainMethod ?? entry.spawnMethod,
      biome: prev?.biome !== undefined ? (prev.biome ?? null) : entry.biome,
      location: prev?.biome !== undefined ? (prev.biome ?? null) : entry.location,
      dimension: prev?.dimension ?? entry.dimension,
      description: prev?.description ?? entry.description,
      // New fields from datapack analysis
      conditions: spawn?.conditions ?? null,
      rarity: spawn?.bucket ?? null,
    };

    output.push(finalEntry);
  }

  // Sort by dex number
  output.sort((a, b) => a.dexNumber - b.dexNumber);
  return output;
}

// ── Main ───────────────────────────────────────────────────────────────────────

function main(): void {
  console.log("Extracting legendary/mythical species from datapack...");
  const datapackSpecies = extractSpeciesFromDatapack();
  console.log(`Found ${datapackSpecies.size} legendary/mythical Pokémon in datapack`);

  const legendaryIds = new Set(datapackSpecies.keys());
  console.log("Checking spawn pool for legendary spawn data...");
  const spawnData = extractSpawnDataForLegendaries(legendaryIds);
  console.log(`Found spawn data for ${spawnData.size} legendaries`);

  const existing = loadExisting();
  const previousCount = existing.legendaries.length;

  const legendaries = buildLegendaries(datapackSpecies, spawnData, existing);

  const removed = existing.legendaries.filter((e) => !legendaryIds.has(e.id)).map((e) => e.id);
  const added = legendaries
    .filter((e) => !existing.legendaries.some((x) => x.id === e.id))
    .map((e) => e.id);

  console.log(`Previous: ${previousCount} entries`);
  console.log(`Removed (not in datapack): ${removed.length} → [${removed.join(", ")}]`);
  console.log(`Added (new from datapack): ${added.length} → [${added.join(", ")}]`);
  console.log(`Final: ${legendaries.length} entries`);

  const output: LegendariesFile & { legendaries: LegendaryEntry[] } = {
    _meta: {
      datapackVersion: DATAPACK_VERSION,
      generatedAt: new Date().toISOString(),
    },
    legendaries,
    obtainMethods: existing.obtainMethods,
    dimensions: existing.dimensions,
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`Written to ${OUTPUT_PATH}`);
}

main();
