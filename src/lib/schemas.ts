import { z } from "zod";
import { POKEMON_TYPES, GROWTH_RATES, EGG_GROUPS, SPAWN_BUCKETS, SPAWN_CONTEXTS, NATURES } from "./constants";

const pokemonTypeSchema = z.enum(POKEMON_TYPES as [string, ...string[]]) as z.ZodEnum<[
  "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison",
  "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"
]>;

const growthRateSchema = z.enum(GROWTH_RATES as [string, ...string[]]) as z.ZodEnum<[
  "slow", "medium-slow", "medium-fast", "fast", "erratic", "fluctuating"
]>;

const eggGroupSchema = z.enum(EGG_GROUPS as [string, ...string[]]) as z.ZodEnum<[
  "monster", "water1", "bug", "flying", "field", "fairy", "grass", "human-like",
  "water3", "mineral", "amorphous", "water2", "ditto", "dragon", "no-eggs"
]>;

export const baseStatsSchema = z.object({
  hp: z.number().int().min(1).max(255),
  attack: z.number().int().min(1).max(255),
  defense: z.number().int().min(1).max(255),
  specialAttack: z.number().int().min(1).max(255),
  specialDefense: z.number().int().min(1).max(255),
  speed: z.number().int().min(1).max(255),
});

export const abilitySchema = z.object({
  name: z.string(),
  displayName: z.string(),
  description: z.string(),
  isHidden: z.boolean(),
});

const moveLearnMethodSchema = z.enum(["level-up", "tm", "egg", "tutor"]);
const moveCategorySchema = z.enum(["physical", "special", "status"]);

export const learnableMoveSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  type: pokemonTypeSchema,
  category: moveCategorySchema,
  power: z.number().int().min(1).nullable(),
  accuracy: z.number().int().min(1).max(100).nullable(),
  pp: z.number().int().min(1),
  method: moveLearnMethodSchema,
  level: z.number().int().min(1).nullable(),
});

const evolutionTriggerSchema = z.enum(["level-up", "trade", "use-item", "other"]);

export const evolutionSchema = z.object({
  to: z.string(),
  trigger: evolutionTriggerSchema,
  level: z.number().int().min(1).nullable(),
  item: z.string().nullable(),
  condition: z.string().nullable(),
});

export const itemDropSchema = z.object({
  item: z.string(),
  displayName: z.string(),
  chance: z.number().min(0).max(1),
  minCount: z.number().int().min(0),
  maxCount: z.number().int().min(0),
});

const typeTupleSchema = z.union([
  z.tuple([pokemonTypeSchema]),
  z.tuple([pokemonTypeSchema, pokemonTypeSchema]),
]);

export const pokemonFormSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  types: typeTupleSchema,
  baseStats: baseStatsSchema,
});

export const pokemonSchema = z.object({
  id: z.string(),
  dexNumber: z.number().int().min(1),
  name: z.string(),
  displayName: z.string(),
  types: typeTupleSchema,
  baseStats: baseStatsSchema,
  abilities: z.array(abilitySchema),
  moves: z.array(learnableMoveSchema),
  evolutions: z.array(evolutionSchema),
  forms: z.array(pokemonFormSchema),
  drops: z.array(itemDropSchema),
  catchRate: z.number().int().min(0).max(255),
  baseExp: z.number().int().min(0),
  growthRate: growthRateSchema,
  eggGroups: z.array(eggGroupSchema),
  genderRatio: z.number().min(0).max(1).nullable(),
  generation: z.number().int().min(1),
  sourceFile: z.string().optional(),
});

const spawnBucketSchema = z.enum(SPAWN_BUCKETS as [string, ...string[]]) as z.ZodEnum<[
  "common", "uncommon", "rare", "ultra-rare"
]>;

const spawnContextSchema = z.enum(SPAWN_CONTEXTS as [string, ...string[]]) as z.ZodEnum<[
  "grounded", "submerged", "seafloor", "surface", "underground"
]>;

export const nearbyBlockSchema = z.object({
  blocks: z.array(z.string()),
  minCount: z.number().int().min(0).nullable(),
  maxCount: z.number().int().min(0).nullable(),
});

export const spawnConditionSchema = z.object({
  minY: z.number().int().nullable(),
  maxY: z.number().int().nullable(),
  minSkyLight: z.number().int().min(0).max(15).nullable(),
  maxSkyLight: z.number().int().min(0).max(15).nullable(),
  isRaining: z.boolean().nullable(),
  isThundering: z.boolean().nullable(),
  isDay: z.boolean().nullable(),
  timeRange: z.string().nullable(),
  structures: z.array(z.string()),
  nearbyBlocks: z.array(nearbyBlockSchema),
});

const weightMultiplierSchema = z.object({
  multiplier: z.number(),
  condition: z.record(z.unknown()),
});

export const spawnEntrySchema = z.object({
  id: z.string(),
  pokemonId: z.string(),
  bucket: spawnBucketSchema,
  context: spawnContextSchema,
  biomes: z.array(z.string()),
  weight: z.number().min(0),
  weightMultiplier: weightMultiplierSchema.nullable(),
  levelRange: z.object({ min: z.number().int().min(1), max: z.number().int().min(1) }),
  conditions: spawnConditionSchema,
  anticonditions: spawnConditionSchema,
  sourceFile: z.string().optional(),
});

const statBlockSchema = z.object({
  hp: z.number().int().min(0),
  attack: z.number().int().min(0),
  defense: z.number().int().min(0),
  specialAttack: z.number().int().min(0),
  specialDefense: z.number().int().min(0),
  speed: z.number().int().min(0),
});

export const evSpreadSchema = statBlockSchema;
export const ivSpreadSchema = statBlockSchema;

const natureNameSchema = z.enum(
  NATURES.map((n) => n.name) as [string, ...string[]]
);

export const teamMemberSchema = z.object({
  pokemonId: z.string(),
  nickname: z.string().nullable(),
  nature: natureNameSchema,
  ability: z.string(),
  heldItem: z.string().nullable(),
  evs: evSpreadSchema,
  ivs: ivSpreadSchema,
  moves: z.tuple([
    z.string().nullable(),
    z.string().nullable(),
    z.string().nullable(),
    z.string().nullable(),
  ]),
  level: z.number().int().min(1).max(100),
  types: typeTupleSchema,
});

export const teamSlotSchema = z.object({
  id: z.string(),
  member: teamMemberSchema.nullable(),
});

const itemCategorySchema = z.enum([
  "ball", "medicine", "berry", "held-item", "evolution-item", "ingredient", "other",
]);

const obtainMethodSchema = z.enum([
  "crafting", "brewing_stand", "campfire_pot", "smelting", "stonecutting", "drop", "held", "bag",
]).nullable();

const recipeIngredientSchema = z.object({
  type: z.enum(["item", "tag"]),
  id: z.string(),
});

const itemRecipeSchema = z.object({
  type: z.string(),
  ingredients: z.array(recipeIngredientSchema),
  resultCount: z.number().int().min(1),
  sourceFile: z.string(),
});

export const itemSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string(),
  category: itemCategorySchema,
  description: z.string(),
  sprite: z.string().nullable(),
  droppedBy: z.array(z.string()),
  obtainMethod: obtainMethodSchema,
  recipe: itemRecipeSchema.nullable(),
  effect: z.string().nullable(),
  sourceFile: z.string().optional(),
});

export const moveSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string(),
  type: pokemonTypeSchema,
  category: moveCategorySchema,
  power: z.number().int().min(1).nullable(),
  accuracy: z.number().int().min(1).max(100).nullable(),
  pp: z.number().int().min(1),
  sourceFile: z.string().optional(),
});

export type PokemonSchema = z.infer<typeof pokemonSchema>;
export type SpawnEntrySchema = z.infer<typeof spawnEntrySchema>;
export type TeamMemberSchema = z.infer<typeof teamMemberSchema>;
export type ItemSchema = z.infer<typeof itemSchema>;
export type MoveSchema = z.infer<typeof moveSchema>;
