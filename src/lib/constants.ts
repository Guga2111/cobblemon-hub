import type { PokemonType, GrowthRate, EggGroup } from "~/types/pokemon";
import type { SpawnBucket, SpawnContext } from "~/types/spawn";
import type { Nature } from "~/types/team";

export const POKEMON_TYPES: PokemonType[] = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

export const GROWTH_RATES: GrowthRate[] = [
  "slow",
  "medium-slow",
  "medium-fast",
  "fast",
  "erratic",
  "fluctuating",
];

export const EGG_GROUPS: EggGroup[] = [
  "monster",
  "water1",
  "bug",
  "flying",
  "field",
  "fairy",
  "grass",
  "human-like",
  "water3",
  "mineral",
  "amorphous",
  "water2",
  "ditto",
  "dragon",
  "no-eggs",
];

export const SPAWN_CONTEXTS: SpawnContext[] = [
  "grounded",
  "submerged",
  "seafloor",
  "surface",
  "underground",
];

export const SPAWN_BUCKETS: SpawnBucket[] = [
  "common",
  "uncommon",
  "rare",
  "ultra-rare",
];

export const NATURES: Nature[] = [
  { name: "hardy", displayName: "Hardy", effect: { increased: null, decreased: null } },
  { name: "lonely", displayName: "Lonely", effect: { increased: "attack", decreased: "defense" } },
  { name: "brave", displayName: "Brave", effect: { increased: "attack", decreased: "speed" } },
  { name: "adamant", displayName: "Adamant", effect: { increased: "attack", decreased: "specialAttack" } },
  { name: "naughty", displayName: "Naughty", effect: { increased: "attack", decreased: "specialDefense" } },
  { name: "bold", displayName: "Bold", effect: { increased: "defense", decreased: "attack" } },
  { name: "docile", displayName: "Docile", effect: { increased: null, decreased: null } },
  { name: "relaxed", displayName: "Relaxed", effect: { increased: "defense", decreased: "speed" } },
  { name: "impish", displayName: "Impish", effect: { increased: "defense", decreased: "specialAttack" } },
  { name: "lax", displayName: "Lax", effect: { increased: "defense", decreased: "specialDefense" } },
  { name: "timid", displayName: "Timid", effect: { increased: "speed", decreased: "attack" } },
  { name: "hasty", displayName: "Hasty", effect: { increased: "speed", decreased: "defense" } },
  { name: "serious", displayName: "Serious", effect: { increased: null, decreased: null } },
  { name: "jolly", displayName: "Jolly", effect: { increased: "speed", decreased: "specialAttack" } },
  { name: "naive", displayName: "Naive", effect: { increased: "speed", decreased: "specialDefense" } },
  { name: "modest", displayName: "Modest", effect: { increased: "specialAttack", decreased: "attack" } },
  { name: "mild", displayName: "Mild", effect: { increased: "specialAttack", decreased: "defense" } },
  { name: "quiet", displayName: "Quiet", effect: { increased: "specialAttack", decreased: "speed" } },
  { name: "bashful", displayName: "Bashful", effect: { increased: null, decreased: null } },
  { name: "rash", displayName: "Rash", effect: { increased: "specialAttack", decreased: "specialDefense" } },
  { name: "calm", displayName: "Calm", effect: { increased: "specialDefense", decreased: "attack" } },
  { name: "gentle", displayName: "Gentle", effect: { increased: "specialDefense", decreased: "defense" } },
  { name: "sassy", displayName: "Sassy", effect: { increased: "specialDefense", decreased: "speed" } },
  { name: "careful", displayName: "Careful", effect: { increased: "specialDefense", decreased: "specialAttack" } },
  { name: "quirky", displayName: "Quirky", effect: { increased: null, decreased: null } },
];

export const TYPE_DISPLAY_NAMES: Record<PokemonType, string> = {
  normal: "Normal",
  fire: "Fire",
  water: "Water",
  electric: "Electric",
  grass: "Grass",
  ice: "Ice",
  fighting: "Fighting",
  poison: "Poison",
  ground: "Ground",
  flying: "Flying",
  psychic: "Psychic",
  bug: "Bug",
  rock: "Rock",
  ghost: "Ghost",
  dragon: "Dragon",
  dark: "Dark",
  steel: "Steel",
  fairy: "Fairy",
};

export const SPAWN_BUCKET_DISPLAY_NAMES: Record<SpawnBucket, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  "ultra-rare": "Ultra Rare",
};

export const SPAWN_CONTEXT_DISPLAY_NAMES: Record<SpawnContext, string> = {
  grounded: "Grounded",
  submerged: "Submerged",
  seafloor: "Seafloor",
  surface: "Surface",
  underground: "Underground",
};

export const MAX_EVS_PER_STAT = 252;
export const MAX_TOTAL_EVS = 510;
export const MAX_IVS = 31;
