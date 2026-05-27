import type { PokemonType } from "~/types/pokemon";
import { cn } from "~/lib/utils";

interface TypeBadgeProps {
  type: PokemonType;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Light-background types that need dark text for readable contrast.
 * All others use white text.
 */
const LIGHT_TYPES: ReadonlySet<PokemonType> = new Set([
  "electric",
  "ice",
  "normal",
  "bug",
  "fairy",
  "steel",
] satisfies PokemonType[]);

export function TypeBadge({ type, size = "md", className }: TypeBadgeProps) {
  const label = type.charAt(0).toUpperCase() + type.slice(1);
  const isLight = LIGHT_TYPES.has(type);

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center shrink-0 select-none",
        "rounded-full font-bold tracking-wider uppercase",
        size === "sm"
          ? "px-2 py-0.5 text-[10px] leading-[1.4] min-w-[52px]"
          : "px-3 py-1 text-xs min-w-[64px]",
        className,
      )}
      style={
        {
          background: `rgb(var(--type-${type}))`,
          color: isLight ? "rgba(0,0,0,0.72)" : "white",
          textShadow: isLight ? "none" : "0 1px 2px rgba(0,0,0,0.45)",
          boxShadow: [
            `0 1px 3px rgb(var(--type-${type}) / 0.45)`,
            `inset 0 1px 0 rgba(255,255,255,0.28)`,
            `inset 0 -1px 0 rgba(0,0,0,0.12)`,
          ].join(", "),
        } as React.CSSProperties
      }
    >
      {label}
    </span>
  );
}
