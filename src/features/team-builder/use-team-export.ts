import type { TeamSlotState } from "./use-team-store";
import type { EVSpread, IVSpread } from "~/types/team";

const STAT_ABBR: Record<keyof EVSpread, string> = {
  hp: "HP",
  attack: "Atk",
  defense: "Def",
  specialAttack: "SpA",
  specialDefense: "SpD",
  speed: "Spe",
};

const STAT_ORDER: Array<keyof EVSpread> = [
  "hp",
  "attack",
  "defense",
  "specialAttack",
  "specialDefense",
  "speed",
];

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatEVs(evs: EVSpread): string {
  const parts = STAT_ORDER.filter((k) => evs[k] > 0).map(
    (k) => `${evs[k]} ${STAT_ABBR[k]}`
  );
  return parts.join(" / ");
}

function formatIVs(ivs: IVSpread): string {
  const parts = STAT_ORDER.filter((k) => ivs[k] !== 31).map(
    (k) => `${ivs[k]} ${STAT_ABBR[k]}`
  );
  return parts.join(" / ");
}

function slotToShowdown(slot: TeamSlotState): string {
  if (!slot.pokemonData) return "";
  const { pokemonData, nature, ability, heldItem, evs, ivs } = slot;

  const lines: string[] = [];

  const itemPart = heldItem ? ` @ ${heldItem}` : "";
  lines.push(`${pokemonData.displayName}${itemPart}`);

  if (ability) {
    const abilityObj = pokemonData.abilities.find((a) => a.name === ability);
    lines.push(`Ability: ${abilityObj?.displayName ?? ability}`);
  }

  const evStr = formatEVs(evs);
  if (evStr) lines.push(`EVs: ${evStr}`);

  if (nature) lines.push(`${capitalize(nature)} Nature`);

  const ivStr = formatIVs(ivs);
  if (ivStr) lines.push(`IVs: ${ivStr}`);

  // Empty move slots — no moves stored yet
  lines.push("- ", "- ", "- ", "- ");

  return lines.join("\n");
}

export function buildShowdownExport(slots: TeamSlotState[]): string {
  return slots
    .filter((s) => s.pokemonData !== null)
    .map(slotToShowdown)
    .join("\n\n");
}

type MinimalSlot = {
  p: string;
  n: string | null;
  a: string | null;
  i: string | null;
  ev: EVSpread;
  iv: IVSpread;
};

export function buildShareableUrl(slots: TeamSlotState[]): string {
  const data: MinimalSlot[] = slots
    .filter((s) => s.pokemonData !== null)
    .map((s) => ({
      p: s.pokemonData!.id,
      n: s.nature,
      a: s.ability,
      i: s.heldItem,
      ev: s.evs,
      iv: s.ivs,
    }));

  const encoded = encodeURIComponent(JSON.stringify(data));
  const base = `${window.location.origin}/team-builder`;
  return `${base}?team=${encoded}`;
}
