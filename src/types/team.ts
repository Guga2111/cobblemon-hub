import type { PokemonType } from "./pokemon";

export interface NatureEffect {
  increased: keyof StatBlock | null;
  decreased: keyof StatBlock | null;
}

export interface Nature {
  name: string;
  displayName: string;
  effect: NatureEffect;
}

export interface EVSpread {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface IVSpread {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface StatBlock {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface TeamMember {
  pokemonId: string;
  nickname: string | null;
  nature: string;
  ability: string;
  heldItem: string | null;
  evs: EVSpread;
  ivs: IVSpread;
  moves: [string | null, string | null, string | null, string | null];
  level: number;
  types: [PokemonType] | [PokemonType, PokemonType];
}

export interface TeamSlot {
  id: string;
  member: TeamMember | null;
}
