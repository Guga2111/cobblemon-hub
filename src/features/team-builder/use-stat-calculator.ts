import { useMemo } from "react";
import type { StatBlock, EVSpread, IVSpread } from "~/types/team";
import { NATURES } from "~/lib/constants";

function getNatureMultiplier(stat: keyof StatBlock, natureName: string | null): number {
  if (!natureName) return 1.0;
  const nature = NATURES.find((n) => n.name === natureName);
  if (!nature) return 1.0;
  if (nature.effect.increased === stat) return 1.1;
  if (nature.effect.decreased === stat) return 0.9;
  return 1.0;
}

function calcOneStat(
  base: number,
  iv: number,
  ev: number,
  level: number,
  mult: number,
  isHp: boolean
): number {
  const inner = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100);
  return isHp ? inner + level + 10 : Math.floor((inner + 5) * mult);
}

export interface CalculatedStats {
  lv50: StatBlock;
  lv100: StatBlock;
}

const STAT_KEYS: (keyof StatBlock)[] = [
  "hp",
  "attack",
  "defense",
  "specialAttack",
  "specialDefense",
  "speed",
];

export function useStatCalculator(params: {
  baseStats: StatBlock | null;
  evs: EVSpread;
  ivs: IVSpread;
  natureName: string | null;
}): CalculatedStats | null {
  const { baseStats, evs, ivs, natureName } = params;

  return useMemo(() => {
    if (!baseStats) return null;

    const calc = (level: number): StatBlock => {
      const result = {} as StatBlock;
      for (const k of STAT_KEYS) {
        result[k] = calcOneStat(
          baseStats[k],
          ivs[k],
          evs[k],
          level,
          getNatureMultiplier(k, natureName),
          k === "hp"
        );
      }
      return result;
    };

    return { lv50: calc(50), lv100: calc(100) };
  }, [baseStats, evs, ivs, natureName]);
}
