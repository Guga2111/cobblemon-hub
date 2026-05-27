import type { PokemonType, MoveCategory } from "./pokemon";

export interface Move {
  id: string;
  name: string;
  displayName: string;
  type: PokemonType;
  category: MoveCategory;
  power: number | null;
  accuracy: number | null;
  pp: number;
}
