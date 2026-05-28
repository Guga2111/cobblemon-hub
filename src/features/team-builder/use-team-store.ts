import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PokemonType } from "~/types/pokemon";

export interface StoredPokemonData {
  id: string;
  name: string;
  displayName: string;
  types: [PokemonType] | [PokemonType, PokemonType];
  abilities: Array<{ name: string; displayName: string; isHidden: boolean }>;
}

export interface TeamSlotState {
  slotId: string;
  pokemonData: StoredPokemonData | null;
  nature: string | null;
  ability: string | null;
  heldItem: string | null;
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
  clearSlot: (index: number) => void;
  clearTeam: () => void;
}

const makeEmpty = (index: number): TeamSlotState => ({
  slotId: `slot-${index}`,
  pokemonData: null,
  nature: null,
  ability: null,
  heldItem: null,
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
          slots: patchSlot(slots, index, { pokemonData, ability: null }),
        })),
      setNature: (index, nature) =>
        set(({ slots }) => ({ slots: patchSlot(slots, index, { nature }) })),
      setAbility: (index, ability) =>
        set(({ slots }) => ({ slots: patchSlot(slots, index, { ability }) })),
      setHeldItem: (index, heldItem) =>
        set(({ slots }) => ({ slots: patchSlot(slots, index, { heldItem }) })),
      clearSlot: (index) =>
        set(({ slots }) => ({
          slots: patchSlot(slots, index, makeEmpty(index)),
        })),
      clearTeam: () => set(() => ({ slots: EMPTY_TEAM })),
    }),
    { name: "cobblemon-team" }
  )
);
