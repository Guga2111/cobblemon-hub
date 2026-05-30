import type { PokemonType } from "./pokemon";

export type Region = "kanto" | "johto" | "hoenn" | "sinnoh";

export type TrainerRole = "gym-leader" | "elite-four" | "champion";

export interface TrainerPokemon {
  species: string;
  displayName: string;
  level: number;
  types: [PokemonType] | [PokemonType, PokemonType];
}

export interface GymLeader {
  id: string;
  name: string;
  region: Region;
  role: TrainerRole;
  typeSpecialty: PokemonType;
  badgeName: string | null;
  levelCap: number;
  orderInRegion: number;
  biome: string | null;
  team: TrainerPokemon[];
  rewards: string[];
  unlockRequirement: string | null;
  locateCommand: string | null;
}

export const REGION_DISPLAY_NAMES: Record<Region, string> = {
  kanto: "Kanto",
  johto: "Johto",
  hoenn: "Hoenn",
  sinnoh: "Sinnoh",
};

export const REGION_ORDER: Region[] = ["kanto", "johto", "hoenn", "sinnoh"];

export const ROLE_DISPLAY_NAMES: Record<TrainerRole, string> = {
  "gym-leader": "Gym Leader",
  "elite-four": "Elite Four",
  champion: "Champion",
};
