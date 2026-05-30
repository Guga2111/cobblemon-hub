export type SpawnBucket = "common" | "uncommon" | "rare" | "ultra-rare";

export type SpawnContext =
  | "grounded"
  | "submerged"
  | "seafloor"
  | "surface"
  | "underground";

export interface NearbyBlock {
  blocks: string[];
  minCount: number | null;
  maxCount: number | null;
}

export interface SpawnCondition {
  minY: number | null;
  maxY: number | null;
  minSkyLight: number | null;
  maxSkyLight: number | null;
  isRaining: boolean | null;
  isThundering: boolean | null;
  isDay: boolean | null;
  timeRange: string | null;
  structures: string[];
  nearbyBlocks: NearbyBlock[];
}

export interface WeightMultiplier {
  multiplier: number;
  condition: Record<string, unknown>;
}

export interface SpawnEntry {
  id: string;
  pokemonId: string;
  bucket: SpawnBucket;
  context: SpawnContext;
  biomes: string[];
  weight: number;
  weightMultiplier: WeightMultiplier | null;
  levelRange: { min: number; max: number };
  conditions: SpawnCondition;
  anticonditions: SpawnCondition;
  sourceFile?: string;
}
