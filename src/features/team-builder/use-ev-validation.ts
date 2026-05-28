import { useMemo } from "react";
import type { EVSpread } from "~/types/team";
import { MAX_EVS_PER_STAT, MAX_TOTAL_EVS } from "~/lib/constants";

export interface EVValidation {
  isValid: boolean;
  totalEvs: number;
  remaining: number;
  statErrors: Partial<Record<keyof EVSpread, string>>;
}

export function useEvValidation(evs: EVSpread): EVValidation {
  return useMemo(() => {
    const total =
      evs.hp +
      evs.attack +
      evs.defense +
      evs.specialAttack +
      evs.specialDefense +
      evs.speed;

    const errors: Partial<Record<keyof EVSpread, string>> = {};

    for (const k of Object.keys(evs) as (keyof EVSpread)[]) {
      if (evs[k] > MAX_EVS_PER_STAT) {
        errors[k] = `Máx. ${MAX_EVS_PER_STAT}`;
      }
    }

    return {
      isValid: total <= MAX_TOTAL_EVS && Object.keys(errors).length === 0,
      totalEvs: total,
      remaining: MAX_TOTAL_EVS - total,
      statErrors: errors,
    };
  }, [evs]);
}
