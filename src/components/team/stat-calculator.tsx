import { NATURES } from "~/lib/constants";
import { useStatCalculator } from "~/features/team-builder/use-stat-calculator";
import type { StatBlock, EVSpread, IVSpread } from "~/types/team";

interface StatMeta {
  key: keyof StatBlock;
  label: string;
  color: string;
}

const STAT_META: StatMeta[] = [
  { key: "hp", label: "HP", color: "#ef4444" },
  { key: "attack", label: "Atk", color: "#f97316" },
  { key: "defense", label: "Def", color: "#eab308" },
  { key: "specialAttack", label: "SpA", color: "#3b82f6" },
  { key: "specialDefense", label: "SpD", color: "#14b8a6" },
  { key: "speed", label: "Vel", color: "#22c55e" },
];

function getValueColor(v: number): string {
  if (v >= 200) return "#ef4444";
  if (v >= 160) return "#f97316";
  if (v >= 130) return "#eab308";
  if (v >= 110) return "#22c55e";
  if (v >= 90) return "rgba(255,255,255,0.6)";
  return "rgba(255,255,255,0.32)";
}

interface StatCalculatorProps {
  baseStats: StatBlock | null;
  evs: EVSpread;
  ivs: IVSpread;
  natureName: string | null;
}

export function StatCalculator({ baseStats, evs, ivs, natureName }: StatCalculatorProps) {
  const calculated = useStatCalculator({ baseStats, evs, ivs, natureName });
  const selectedNature = natureName ? (NATURES.find((n) => n.name === natureName) ?? null) : null;

  if (!baseStats || !calculated) return null;

  return (
    <div className="px-3 pb-2.5">
      {/* Column headers */}
      <div className="flex items-center mb-1.5">
        <div className="w-[38px] shrink-0" />
        <div className="flex-1" />
        <span className="w-8 text-right text-[9px] font-bold tracking-[0.05em] text-muted-foreground/25 shrink-0">
          Lv50
        </span>
        <div className="w-3 shrink-0" />
        <span className="w-9 text-right text-[9px] font-bold tracking-[0.05em] text-muted-foreground/25 shrink-0">
          Lv100
        </span>
      </div>

      <div className="space-y-[3px]">
        {STAT_META.map(({ key, label, color }) => {
          const isIncreased = selectedNature?.effect.increased === key;
          const isDecreased = selectedNature?.effect.decreased === key;
          const lv50 = calculated.lv50[key];
          const lv100 = calculated.lv100[key];
          const labelColor = isIncreased
            ? color
            : isDecreased
              ? "#ef4444"
              : "rgba(255,255,255,0.28)";

          return (
            <div key={key} className="flex items-center h-[18px]">
              {/* Stat label */}
              <div className="w-[38px] shrink-0 flex items-center gap-0.5">
                <span
                  className="text-[10px] font-bold font-mono"
                  style={{ color: labelColor }}
                >
                  {label}
                </span>
                {isIncreased && (
                  <span className="text-[7px] font-black leading-none" style={{ color }}>
                    ▲
                  </span>
                )}
                {isDecreased && (
                  <span className="text-[7px] font-black leading-none text-red-500/60">▼</span>
                )}
              </div>

              {/* Dot line */}
              <div className="flex-1 h-px bg-white/[0.04]" />

              {/* Lv50 */}
              <span
                className="w-8 text-right text-[11px] font-mono font-bold tabular-nums shrink-0"
                style={{ color: getValueColor(lv50) }}
              >
                {lv50}
              </span>

              {/* Divider */}
              <div className="w-3 shrink-0 flex justify-center">
                <div className="w-px h-3 bg-white/[0.07]" />
              </div>

              {/* Lv100 */}
              <span
                className="w-9 text-right text-[11px] font-mono font-bold tabular-nums shrink-0"
                style={{ color: getValueColor(lv100) }}
              >
                {lv100}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
