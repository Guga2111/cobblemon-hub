import { useState, useCallback } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "~/lib/utils";

type Theme = "dark" | "light";

function getInitialTheme(): Theme {
  try {
    if (typeof window === "undefined") return "dark";
    const stored = localStorage.getItem("theme") as Theme | null;
    return stored === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const toggle = useCallback(() => {
    const root = document.documentElement;
    root.classList.add("theme-transitioning");
    setTimeout(() => root.classList.remove("theme-transitioning"), 300);

    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      try { localStorage.setItem("theme", next); } catch { /* ignore */ }
      if (next === "light") {
        root.classList.add("light");
      } else {
        root.classList.remove("light");
      }
      return next;
    });
  }, []);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={!isDark}
      onClick={toggle}
      aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      className={cn(
        "group relative h-7 w-[3.25rem] shrink-0 cursor-pointer overflow-hidden",
        "rounded-full border transition-colors duration-500",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isDark
          ? "border-primary/25 bg-primary/10 hover:bg-primary/15"
          : "border-amber-300/60 bg-amber-50 hover:bg-amber-100"
      )}
    >
      {/* Sliding thumb */}
      <span
        aria-hidden
        className={cn(
          "absolute top-0.5 h-6 w-6 rounded-full",
          "flex items-center justify-center",
          "transition-[left,background-color,box-shadow] duration-500",
          "ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isDark
            ? [
                "left-0.5",
                "bg-primary/80",
                "shadow-[0_0_8px_2px_hsl(var(--primary)/0.45)]",
              ]
            : [
                "left-[calc(100%-1.625rem)]",
                "bg-amber-400",
                "shadow-[0_0_8px_2px_rgb(251_191_36/0.55)]",
              ]
        )}
      >
        <Moon
          size={11}
          strokeWidth={2.5}
          aria-hidden
          className={cn(
            "absolute text-primary-foreground",
            "transition-[opacity,transform] duration-300",
            isDark ? "opacity-100 scale-100" : "opacity-0 scale-50"
          )}
        />
        <Sun
          size={12}
          strokeWidth={2.5}
          aria-hidden
          className={cn(
            "absolute text-amber-900",
            "transition-[opacity,transform] duration-300",
            !isDark ? "opacity-100 scale-100" : "opacity-0 scale-50"
          )}
        />
      </span>

      {/* Decorative dots — dark mode side */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2",
          "flex flex-col gap-[3px] transition-opacity duration-300",
          isDark ? "opacity-35" : "opacity-0"
        )}
      >
        <span className="block h-[2px] w-[2px] rounded-full bg-primary-foreground" />
        <span className="ml-[3px] block h-[2px] w-[2px] rounded-full bg-primary-foreground" />
        <span className="block h-[2px] w-[2px] rounded-full bg-primary-foreground" />
      </span>
    </button>
  );
}
