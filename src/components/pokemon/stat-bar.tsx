import { useState, useEffect } from "react";
import type { BaseStats } from "~/types/pokemon";

const MAX_STAT = 255;

function getStatColor(value: number): string {
  if (value >= 150) return "hsl(var(--chart-1))";
  if (value >= 120) return "hsl(var(--primary))";
  if (value >= 100) return "hsl(var(--foreground))";
  if (value >= 80) return "hsl(var(--muted-foreground))";
  if (value >= 50) return "hsl(var(--warning))";
  return "hsl(var(--destructive))";
}

const STAT_ROWS: Array<{ key: keyof BaseStats; label: string }> = [
  { key: "hp", label: "HP" },
  { key: "attack", label: "Atk" },
  { key: "defense", label: "Def" },
  { key: "specialAttack", label: "Sp. Atk" },
  { key: "specialDefense", label: "Sp. Def" },
  { key: "speed", label: "Speed" },
];

interface StatRowProps {
  label: string;
  value: number;
  animated: boolean;
}

function StatRow({ label, value, animated }: StatRowProps) {
  const color = getStatColor(value);
  const pct = Math.min(100, Math.round((value / MAX_STAT) * 100));

  return (
    <div
      className="grid items-center gap-3"
      style={{ gridTemplateColumns: "88px 44px 1fr" }}
    >
      <span className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider truncate">
        {label}
      </span>
      <span
        className="text-sm font-bold tabular-nums text-right"
        style={{ color }}
      >
        {value}
      </span>
      {/* Bar track — no overflow-hidden so glow bleeds outside */}
      <div className="relative h-2 rounded-full bg-muted/40">
        {/* Glow layer */}
        <div
          className="absolute left-0 rounded-full transition-all duration-700 ease-out"
          style={{
            width: animated ? `${pct}%` : "0%",
            height: "200%",
            top: "-50%",
            backgroundColor: color,
            filter: "blur(6px)",
            opacity: 0.45,
          }}
        />
        {/* Solid bar */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
          style={{
            width: animated ? `${pct}%` : "0%",
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

interface StatBarProps {
  stats: BaseStats;
}

export function StatBar({ stats }: StatBarProps) {
  const [animated, setAnimated] = useState(false);

  // Double RAF ensures browser paints the zero-width state before transitioning
  useEffect(() => {
    setAnimated(false);
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimated(true));
    });
    return () => cancelAnimationFrame(raf1);
  }, [stats]);

  const bst =
    stats.hp +
    stats.attack +
    stats.defense +
    stats.specialAttack +
    stats.specialDefense +
    stats.speed;

  return (
    <div className="flex flex-col gap-3.5">
      {STAT_ROWS.map(({ key, label }) => (
        <StatRow key={key} label={label} value={stats[key]} animated={animated} />
      ))}

      {/* BST total */}
      <div
        className="mt-1 pt-4 border-t border-border/60 grid items-center gap-3"
        style={{ gridTemplateColumns: "88px 44px 1fr" }}
      >
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          BST
        </span>
        <span className="text-sm font-black tabular-nums text-right text-foreground/90">
          {bst}
        </span>
        <span className="text-[10px] text-muted-foreground/50 font-medium">
          Base Stat Total
        </span>
      </div>
    </div>
  );
}
