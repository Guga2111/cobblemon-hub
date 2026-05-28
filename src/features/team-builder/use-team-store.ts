import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PokemonType } from "~/types/pokemon";
import type { EVSpread, IVSpread, StatBlock } from "~/types/team";

export interface StoredPokemonData {
  id: string;
  name: string;
  displayName: string;
  types: [PokemonType] | [PokemonType, PokemonType];
  abilities: Array<{ name: string; displayName: string; isHidden: boolean }>;
  baseStats: StatBlock;
}

export interface TeamSlotState {
  slotId: string;
  pokemonData: StoredPokemonData | null;
  nature: string | null;
  ability: string | null;
  heldItem: string | null;
  evs: EVSpread;
  ivs: IVSpread;
}

export type SixSlots = [
  TeamSlotState,
  TeamSlotState,
  TeamSlotState,
  TeamSlotState,
  TeamSlotState,
  TeamSlotState,
];

interface TeamStore {
  slots: SixSlots;
  setPokemon: (index: number, data: StoredPokemonData) => void;
  setNature: (index: number, nature: string | null) => void;
  setAbility: (index: number, ability: string | null) => void;
  setHeldItem: (index: number, item: string | null) => void;
  setEvs: (index: number, evs: EVSpread) => void;
  setIvs: (index: number, ivs: IVSpread) => void;
  clearSlot: (index: number) => void;
  clearTeam: () => void;
}

const DEFAULT_EVS: EVSpread = {
  hp: 0,
  attack: 0,
  defense: 0,
  specialAttack: 0,
  specialDefense: 0,
  speed: 0,
};

const DEFAULT_IVS: IVSpread = {
  hp: 31,
  attack: 31,
  defense: 31,
  specialAttack: 31,
  specialDefense: 31,
  speed: 31,
};

const makeEmpty = (index: number): TeamSlotState => ({
  slotId: `slot-${index}`,
  pokemonData: null,
  nature: null,
  ability: null,
  heldItem: null,
  evs: { ...DEFAULT_EVS },
  ivs: { ...DEFAULT_IVS },
});

function patchSlot(
  slots: SixSlots,
  index: number,
  patch: Partial<TeamSlotState>
): SixSlots {
  return slots.map((s, i) => (i === index ? { ...s, ...patch } : s)) as SixSlots;
}

const EMPTY_TEAM: SixSlots = [
  makeEmpty(0),
  makeEmpty(1),
  makeEmpty(2),
  makeEmpty(3),
  makeEmpty(4),
  makeEmpty(5),
];

export const useTeamStore = create<TeamStore>()(
  persist(
    (set) => ({
      slots: EMPTY_TEAM,
      setPokemon: (index, pokemonData) =>
        set(({ slots }) => ({
          slots: patchSlot(slots, index, {
            pokemonData,
            ability: null,
            evs: { ...DEFAULT_EVS },
            ivs: { ...DEFAULT_IVS },
          }),
        })),
      setNature: (index, nature) =>
        set(({ slots }) => ({ slots: patchSlot(slots, index, { nature }) })),
      setAbility: (index, ability) =>
        set(({ slots }) => ({ slots: patchSlot(slots, index, { ability }) })),
      setHeldItem: (index, heldItem) =>
        set(({ slots }) => ({ slots: patchSlot(slots, index, { heldItem }) })),
      setEvs: (index, evs) =>
        set(({ slots }) => ({ slots: patchSlot(slots, index, { evs }) })),
      setIvs: (index, ivs) =>
        set(({ slots }) => ({ slots: patchSlot(slots, index, { ivs }) })),
      clearSlot: (index) =>
        set(({ slots }) => ({
          slots: patchSlot(slots, index, makeEmpty(index)),
        })),
      clearTeam: () => set(() => ({ slots: EMPTY_TEAM })),
    }),
    { name: "cobblemon-team", version: 2 }
  )
);
