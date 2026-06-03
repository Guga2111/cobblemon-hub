declare global {
  interface ImportMeta {
    env: Record<string, string | undefined>;
  }
}

export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

export const STALE_TIMES = {
  STATIC: 10 * 60 * 1000,  // 10 min — pokemon, items, gym-leaders
  DYNAMIC: 1 * 60 * 1000,  // 1 min — search results
  AUTH: 5 * 60 * 1000,      // 5 min — auth state
} as const;
