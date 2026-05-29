import { memo } from "react";
import {
  Sun,
  Moon,
  CloudRain,
  Zap,
  Footprints,
  Waves,
  Anchor,
  Navigation,
  Mountain,
  Layers,
  Lightbulb,
  Building2,
  Blocks,
  TrendingUp,
  X,
} from "lucide-react";
import { cn } from "~/lib/utils";
import type { SpawnBucket, SpawnContext } from "~/types/spawn";

// ── Types ─────────────────────────────────────────────────────────────────

export interface SpawnConditionData {
  minY: number | null;
  maxY: number | null;
  minLight: number | null;
  maxLight: number | null;
  isRaining: boolean | null;
  isThundering: boolean | null;
  isDay: boolean | null;
  structures: string[];
  nearbyBlocks: { blocks: string[]; minCount: number | null; maxCount: number | null }[];
}

export interface SpawnEntryData {
  id: string;
  bucket: SpawnBucket;
  context: SpawnContext;
  biomes: string[];
  weight: number;
  levelMin: number;
  levelMax: number;
  conditions: SpawnConditionData;
  anticonditions: SpawnConditionData;
}

// ── Config ────────────────────────────────────────────────────────────────

const BUCKET_CONFIG: Record<SpawnBucket, { label: string; barColor: string; badgeClass: string }> =
  {
    common: {
      label: "Common",
      barColor: "bg-zinc-500",
      badgeClass: "bg-zinc-700/40 text-zinc-400 border-zinc-600/40",
    },
    uncommon: {
      label: "Uncommon",
      barColor: "bg-emerald-500",
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    },
    rare: {
      label: "Rare",
      barColor: "bg-sky-500",
      badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/25",
    },
    "ultra-rare": {
      label: "Ultra Rare",
      barColor: "bg-amber-500",
      badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/25",
    },
  };

const CONTEXT_ICONS: Record<SpawnContext, React.ElementType> = {
  grounded: Footprints,
  submerged: Waves,
  seafloor: Anchor,
  surface: Navigation,
  underground: Mountain,
};

const CONTEXT_LABELS: Record<SpawnContext, string> = {
  grounded: "Grounded",
  submerged: "Submerged",
  seafloor: "Seafloor",
  surface: "Surface",
  underground: "Underground",
};

// ── Helpers ───────────────────────────────────────────────────────────────

export function formatBiomeName(biome: string): string {
  const name = biome.replace(/^[^:]+:/, "");
  return name
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatBlockName(block: string): string {
  const name = block.replace(/^[^:]+:/, "");
  return name
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatStructureName(s: string): string {
  const name = s.replace(/^[^:]+:/, "");
  return name
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function hasConditions(cond: SpawnConditionData): boolean {
  return (
    cond.isDay !== null ||
    cond.isRaining !== null ||
    cond.isThundering !== null ||
    cond.minY !== null ||
    cond.maxY !== null ||
    cond.minLight !== null ||
    cond.maxLight !== null ||
    cond.structures.length > 0 ||
    cond.nearbyBlocks.length > 0
  );
}

// ── Condition chip ────────────────────────────────────────────────────────

function ConditionChip({
  icon: Icon,
  label,
  forbidden = false,
}: {
  icon: React.ElementType;
  label: string;
  forbidden?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold border leading-none",
        forbidden
          ? "bg-red-950/30 text-red-400/80 border-red-900/40"
          : "bg-zinc-800/60 text-zinc-300 border-zinc-700/50"
      )}
    >
      <Icon className="w-3 h-3 shrink-0" />
      {forbidden && <X className="w-2.5 h-2.5 shrink-0 opacity-70" />}
      {label}
    </span>
  );
}

// ── Conditions list ───────────────────────────────────────────────────────

function ConditionsList({
  cond,
  forbidden = false,
}: {
  cond: SpawnConditionData;
  forbidden?: boolean;
}) {
  const chips: { icon: React.ElementType; label: string }[] = [];

  if (cond.isDay === true) chips.push({ icon: Sun, label: "Daytime" });
  if (cond.isDay === false) chips.push({ icon: Moon, label: "Nighttime" });
  if (cond.isThundering) chips.push({ icon: Zap, label: "Thunderstorm" });
  if (cond.isRaining) chips.push({ icon: CloudRain, label: "Rain" });

  if (cond.minY !== null || cond.maxY !== null) {
    const yLabel =
      cond.minY !== null && cond.maxY !== null
        ? `Y ${cond.minY}–${cond.maxY}`
        : cond.minY !== null
          ? `Y ≥ ${cond.minY}`
          : `Y ≤ ${cond.maxY}`;
    chips.push({ icon: Layers, label: yLabel });
  }

  if (cond.minLight !== null || cond.maxLight !== null) {
    const lLabel =
      cond.minLight !== null && cond.maxLight !== null
        ? `Light ${cond.minLight}–${cond.maxLight}`
        : cond.minLight !== null
          ? `Light ≥ ${cond.minLight}`
          : `Light ≤ ${cond.maxLight}`;
    chips.push({ icon: Lightbulb, label: lLabel });
  }

  cond.structures.forEach((s) => chips.push({ icon: Building2, label: formatStructureName(s) }));

  cond.nearbyBlocks.forEach(({ blocks, minCount, maxCount }) => {
    const blockLabel =
      blocks.length === 1 ? formatBlockName(blocks[0]) : `${blocks.length} block types`;
    const countPart =
      minCount !== null && maxCount !== null
        ? ` ×${minCount}–${maxCount}`
        : minCount !== null
          ? ` ×${minCount}+`
          : "";
    chips.push({ icon: Blocks, label: `Near ${blockLabel}${countPart}` });
  });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((chip, i) => (
        <ConditionChip key={i} icon={chip.icon} label={chip.label} forbidden={forbidden} />
      ))}
    </div>
  );
}

// ── SpawnCard ─────────────────────────────────────────────────────────────

export const SpawnCard = memo(function SpawnCard({ spawn }: { spawn: SpawnEntryData }) {
  const bucket = BUCKET_CONFIG[spawn.bucket];
  const CtxIcon = CONTEXT_ICONS[spawn.context] ?? Footprints;
  const ctxLabel = CONTEXT_LABELS[spawn.context] ?? spawn.context;
  const showConditions = hasConditions(spawn.conditions);
  const showAntiConditions = hasConditions(spawn.anticonditions);

  return (
    <div className="relative flex rounded-xl overflow-hidden bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700/60 transition-colors">
      {/* Bucket accent bar */}
      <div className={cn("w-1 shrink-0 self-stretch", bucket.barColor)} />

      <div className="flex-1 p-4 min-w-0">
        {/* Top row: bucket, context, weight, level */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border tracking-wide",
              bucket.badgeClass
            )}
          >
            {bucket.label}
          </span>

          <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 font-medium">
            <CtxIcon className="w-3 h-3" />
            {ctxLabel}
          </span>

          <span className="ml-auto flex items-center gap-1 text-[11px] text-zinc-600 font-medium">
            <TrendingUp className="w-3 h-3" />
            {spawn.weight % 1 === 0 ? spawn.weight : spawn.weight.toFixed(2)}
          </span>

          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-violet-900/30 border border-violet-800/40 text-[11px] font-bold text-violet-300 tabular-nums">
            Lv. {spawn.levelMin}–{spawn.levelMax}
          </span>
        </div>

        {/* Biomes */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {spawn.biomes.map((biome) => (
            <span
              key={biome}
              className="text-[11px] text-zinc-400 bg-zinc-800/50 border border-zinc-700/40 px-2 py-0.5 rounded-md font-medium"
            >
              {formatBiomeName(biome)}
            </span>
          ))}
        </div>

        {/* Conditions */}
        {showConditions && (
          <div className={showAntiConditions ? "mb-2" : undefined}>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">
              Requires
            </p>
            <ConditionsList cond={spawn.conditions} />
          </div>
        )}

        {/* Anti-conditions */}
        {showAntiConditions && (
          <div className={showConditions ? "mt-2" : undefined}>
            <p className="text-[10px] font-bold text-red-900/80 uppercase tracking-wider mb-1.5">
              Forbidden
            </p>
            <ConditionsList cond={spawn.anticonditions} forbidden />
          </div>
        )}
      </div>
    </div>
  );
});
