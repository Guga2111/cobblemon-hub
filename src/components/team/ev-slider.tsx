import { useState } from "react";
import { cn } from "~/lib/utils";
import { NATURES, MAX_EVS_PER_STAT, MAX_TOTAL_EVS, MAX_IVS } from "~/lib/constants";
import { useEvValidation } from "~/features/team-builder/use-ev-validation";
import type { EVSpread, IVSpread, StatBlock } from "~/types/team";

type Mode = "ev" | "iv";

interface StatConfig {
  key: keyof StatBlock;
  shortLabel: string;
  color: string;
}

const STAT_CONFIG: StatConfig[] = [
  { key: "hp", shortLabel: "HP", color: "#ef4444" },
  { key: "attack", shortLabel: "Atk", color: "#f97316" },
  { key: "defense", shortLabel: "Def", color: "#eab308" },
  { key: "specialAttack", shortLabel: "SpA", color: "#3b82f6" },
  { key: "specialDefense", shortLabel: "SpD", color: "#14b8a6" },
  { key: "speed", shortLabel: "Vel", color: "#22c55e" },
];

const EV_PRESETS: Array<{ label: string; evs: EVSpread }> = [
  {
    label: "Max Atk/Spe",
    evs: { hp: 4, attack: 252, defense: 0, specialAttack: 0, specialDefense: 0, speed: 252 },
  },
  {
    label: "Max SpA/Spe",
    evs: { hp: 4, attack: 0, defense: 0, specialAttack: 252, specialDefense: 0, speed: 252 },
  },
  {
    label: "Bulky Physical",
    evs: { hp: 252, attack: 4, defense: 252, specialAttack: 0, specialDefense: 0, speed: 0 },
  },
  {
    label: "Bulky Special",
    evs: { hp: 252, attack: 0, defense: 0, specialAttack: 0, specialDefense: 252, speed: 4 },
  },
];

function StatRow({
  cfg,
  mode,
  evValue,
  ivValue,
  hasError,
  isIncreased,
  isDecreased,
  onEvChange,
  onIvChange,
}: {
  cfg: StatConfig;
  mode: Mode;
  evValue: number;
  ivValue: number;
  hasError: boolean;
  isIncreased: boolean;
  isDecreased: boolean;
  onEvChange: (v: number) => void;
  onIvChange: (v: number) => void;
}) {
  const { shortLabel, color } = cfg;
  const max = mode === "ev" ? MAX_EVS_PER_STAT : MAX_IVS;
  const value = mode === "ev" ? evValue : ivValue;
  const isError = mode === "ev" && hasError;
  const fillPct = (value / max) * 100;
  const barColor = isError ? "#ef4444" : color;
  const labelColor = isIncreased
    ? color
    : isDecreased
      ? "#ef4444"
      : "rgba(255,255,255,0.28)";

  function handleChange(raw: string) {
    const v = parseInt(raw, 10);
    if (isNaN(v)) return;
    const clamped = Math.max(0, Math.min(max, v));
    if (mode === "ev") onEvChange(clamped);
    else onIvChange(clamped);
  }

  return (
    <div className="flex items-center gap-2 h-[22px]">
      {/* Stat label */}
      <div className="w-[38px] shrink-0 flex items-center gap-0.5">
        <span className="text-[10px] font-bold font-mono" style={{ color: labelColor }}>
          {shortLabel}
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

      {/* Interactive slider */}
      <div className="relative flex-1 h-full flex items-center group">
        {/* Track */}
        <div className="w-full h-[3px] rounded-full bg-white/[0.06]" />
        {/* Fill */}
        <div
          className="absolute left-0 h-[3px] rounded-full pointer-events-none transition-all duration-100"
          style={{ width: `${fillPct}%`, backgroundColor: barColor, opacity: 0.9 }}
        />
        {/* Glowing thumb */}
        {value > 0 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full pointer-events-none transition-all duration-100"
            style={{
              left: `${fillPct}%`,
              backgroundColor: barColor,
              boxShadow: `0 0 5px 1px ${barColor}66`,
            }}
          />
        )}
        {/* Invisible range input */}
        <input
          type="range"
          min={0}
          max={max}
          step={1}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label={`${shortLabel} ${mode.toUpperCase()}`}
        />
      </div>

      {/* Numeric input */}
      <input
        type="number"
        min={0}
        max={max}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className={cn(
          "w-9 text-right text-[11px] font-mono bg-transparent focus:outline-none tabular-nums",
          "border-b pb-px transition-colors duration-100",
          isError
            ? "border-destructive/50 text-destructive font-bold"
            : "border-white/[0.09] text-foreground/55 focus:border-primary/50 focus:text-foreground/90"
        )}
      />
    </div>
  );
}

export interface EvSliderProps {
  evs: EVSpread;
  ivs: IVSpread;
  onEvsChange: (evs: EVSpread) => void;
  onIvsChange: (ivs: IVSpread) => void;
  natureName: string | null;
}

export function EvSlider({ evs, ivs, onEvsChange, onIvsChange, natureName }: EvSliderProps) {
  const [mode, setMode] = useState<Mode>("ev");
  const validation = useEvValidation(evs);
  const selectedNature = natureName ? (NATURES.find((n) => n.name === natureName) ?? null) : null;

  const isOverTotal = validation.totalEvs > MAX_TOTAL_EVS;
  const totalPct = Math.min(100, (validation.totalEvs / MAX_TOTAL_EVS) * 100);

  return (
    <div className="px-3 py-2.5 space-y-2">
      {/* Mode toggle + EV bar */}
      <div className="flex items-center gap-2.5">
        <div className="flex rounded border border-white/[0.07] overflow-hidden text-[9px] font-bold tracking-[0.08em]">
          <button
            type="button"
            onClick={() => setMode("ev")}
            className={cn(
              "px-2.5 py-[5px] transition-colors duration-100",
              mode === "ev"
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground/35 hover:text-muted-foreground/55"
            )}
          >
            EVs
          </button>
          <button
            type="button"
            onClick={() => setMode("iv")}
            className={cn(
              "px-2.5 py-[5px] border-l border-white/[0.07] transition-colors duration-100",
              mode === "iv"
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground/35 hover:text-muted-foreground/55"
            )}
          >
            IVs
          </button>
        </div>

        {mode === "ev" ? (
          <>
            <div className="flex-1 relative h-[3px] rounded-full bg-white/[0.05] overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${totalPct}%`,
                  backgroundColor: isOverTotal ? "#ef4444" : "hsl(var(--primary))",
                  opacity: 0.75,
                }}
              />
            </div>
            <span
              className={cn(
                "text-[10px] font-mono tabular-nums shrink-0 transition-colors",
                isOverTotal ? "text-destructive font-bold" : "text-muted-foreground/35"
              )}
            >
              {validation.totalEvs}/510
            </span>
          </>
        ) : (
          <span className="text-[9px] text-muted-foreground/25 flex-1 italic">
            0 – 31 por stat
          </span>
        )}
      </div>

      {/* Stat rows */}
      <div className="space-y-[5px]">
        {STAT_CONFIG.map((cfg) => (
          <StatRow
            key={cfg.key}
            cfg={cfg}
            mode={mode}
            evValue={evs[cfg.key]}
            ivValue={ivs[cfg.key]}
            hasError={evs[cfg.key] > MAX_EVS_PER_STAT || isOverTotal}
            isIncreased={selectedNature?.effect.increased === cfg.key}
            isDecreased={selectedNature?.effect.decreased === cfg.key}
            onEvChange={(v) => onEvsChange({ ...evs, [cfg.key]: v })}
            onIvChange={(v) => onIvsChange({ ...ivs, [cfg.key]: v })}
          />
        ))}
      </div>

      {/* Presets (EV mode only) */}
      {mode === "ev" && (
        <div className="flex flex-wrap gap-1 pt-0.5">
          {EV_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onEvsChange({ ...preset.evs })}
              className="px-1.5 py-[3px] rounded text-[9px] font-medium border border-white/[0.07] text-muted-foreground/35 hover:border-primary/30 hover:text-primary/55 transition-colors duration-100"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
