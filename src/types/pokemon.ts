export type PokemonType =
  | "normal"
  | "fire"
  | "water"
  | "electric"
  | "grass"
  | "ice"
  | "fighting"
  | "poison"
  | "ground"
  | "flying"
  | "psychic"
  | "bug"
  | "rock"
  | "ghost"
  | "dragon"
  | "dark"
  | "steel"
  | "fairy";

export type GrowthRate =
  | "slow"
  | "medium-slow"
  | "medium-fast"
  | "fast"
  | "erratic"
  | "fluctuating";

export type EggGroup =
  | "monster"
  | "water1"
  | "bug"
  | "flying"
  | "field"
  | "fairy"
  | "grass"
  | "human-like"
  | "water3"
  | "mineral"
  | "amorphous"
  | "water2"
  | "ditto"
  | "dragon"
  | "no-eggs";

export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface Ability {
  name: string;
  displayName: string;
  description: string;
  isHidden: boolean;
}

export type MoveLearnMethod = "level-up" | "tm" | "egg" | "tutor";
export type MoveCategory = "physical" | "special" | "status";

export interface LearnableMove {
  name: string;
  displayName: string;
  type: PokemonType;
  category: MoveCategory;
  power: number | null;
  accuracy: number | null;
  pp: number;
  method: MoveLearnMethod;
  level: number | null;
}

export type EvolutionTrigger =
  | "level-up"
  | "trade"
  | "use-item"
  | "other";

export interface Evolution {
  to: string;
  trigger: EvolutionTrigger;
  level: number | null;
  item: string | null;
  condition: string | null;
}

export interface ItemDrop {
  item: string;
  displayName: string;
  chance: number;
  minCount: number;
  maxCount: number;
}

export interface PokemonForm {
  name: string;
  displayName: string;
  types: [PokemonType] | [PokemonType, PokemonType];
  baseStats: BaseStats;
}

export interface PokemonListItem {
  id: string;
  dexNumber: number;
  name: string;
  displayName: string;
  types: PokemonType[];
  baseStats: BaseStats | null;
  generation: number;
  primaryBucket: string | null;
  primaryBiomes: string[] | null;
  primaryContext: string | null;
  primaryWeather: string | null;
  bst: number;
}

export interface PokemonSearchResult {
  id: string;
  dexNumber: number;
  name: string;
  displayName: string;
  types: [PokemonType] | [PokemonType, PokemonType];
  generation: number;
}

export interface Pokemon {
  id: string;
  dexNumber: number;
  name: string;
  displayName: string;
  types: [PokemonType] | [PokemonType, PokemonType];
  baseStats: BaseStats;
  abilities: Ability[];
  moves: LearnableMove[];
  evolutions: Evolution[];
  forms: PokemonForm[];
  drops: ItemDrop[];
  catchRate: number;
  baseExp: number;
  growthRate: GrowthRate;
  eggGroups: EggGroup[];
  genderRatio: number | null;
  generation: number;
  sourceFile?: string;
}
