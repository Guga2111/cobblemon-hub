import { useSearchParams } from "react-router";
import { useMemo, useCallback } from "react";
import type { PokemonType } from "~/types/pokemon";
import type { SpawnBucket, SpawnContext } from "~/types/spawn";
import { POKEMON_TYPES } from "~/lib/constants";

export const SPAWN_BUCKETS_ALL: SpawnBucket[] = [
  "common",
  "uncommon",
  "rare",
  "ultra-rare",
];

export const SPAWN_CONTEXTS_ALL: SpawnContext[] = [
  "grounded",
  "submerged",
  "seafloor",
  "surface",
  "underground",
];

export const WEATHER_OPTIONS = ["clear", "rain", "thunderstorm"] as const;
export type SpawnWeather = (typeof WEATHER_OPTIONS)[number];

export interface PokedexFilters {
  types: PokemonType[];
  generation: number | null;
  biome: string;
  weather: SpawnWeather | null;
  buckets: SpawnBucket[];
  contexts: SpawnContext[];
  sort: string;
  dir: "asc" | "desc";
}

function parseTypes(v: string | null): PokemonType[] {
  if (!v) return [];
  return v
    .split(",")
    .filter((t): t is PokemonType =>
      (POKEMON_TYPES as string[]).includes(t)
    );
}

function parseBuckets(v: string | null): SpawnBucket[] {
  if (!v) return [];
  return v
    .split(",")
    .filter((b): b is SpawnBucket =>
      (SPAWN_BUCKETS_ALL as string[]).includes(b)
    );
}

function parseContexts(v: string | null): SpawnContext[] {
  if (!v) return [];
  return v
    .split(",")
    .filter((c): c is SpawnContext =>
      (SPAWN_CONTEXTS_ALL as string[]).includes(c)
    );
}

export function usePokedexFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo((): PokedexFilters => {
    const weatherRaw = searchParams.get("weather");
    const weather = (WEATHER_OPTIONS as readonly string[]).includes(
      weatherRaw ?? ""
    )
      ? (weatherRaw as SpawnWeather)
      : null;

    return {
      types: parseTypes(searchParams.get("types")),
      generation: searchParams.get("gen")
        ? parseInt(searchParams.get("gen")!, 10)
        : null,
      biome: searchParams.get("biome") ?? "",
      weather,
      buckets: parseBuckets(searchParams.get("bucket")),
      contexts: parseContexts(searchParams.get("context")),
      sort: searchParams.get("sort") ?? "dexNumber",
      dir: (searchParams.get("dir") as "asc" | "desc") ?? "asc",
    };
  }, [searchParams]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.types.length > 0) n++;
    if (filters.generation !== null) n++;
    if (filters.biome) n++;
    if (filters.weather) n++;
    if (filters.buckets.length > 0) n++;
    if (filters.contexts.length > 0) n++;
    return n;
  }, [filters]);

  const hasFilters = activeFilterCount > 0;

  const update = useCallback(
    (patch: Partial<PokedexFilters>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (patch.types !== undefined) {
            if (patch.types.length === 0) next.delete("types");
            else next.set("types", patch.types.join(","));
          }
          if ("generation" in patch) {
            if (patch.generation == null) next.delete("gen");
            else next.set("gen", String(patch.generation));
          }
          if ("biome" in patch) {
            if (!patch.biome) next.delete("biome");
            else next.set("biome", patch.biome!);
          }
          if ("weather" in patch) {
            if (!patch.weather) next.delete("weather");
            else next.set("weather", patch.weather!);
          }
          if (patch.buckets !== undefined) {
            if (patch.buckets.length === 0) next.delete("bucket");
            else next.set("bucket", patch.buckets.join(","));
          }
          if (patch.contexts !== undefined) {
            if (patch.contexts.length === 0) next.delete("context");
            else next.set("context", patch.contexts.join(","));
          }
          if ("sort" in patch) {
            if (!patch.sort || patch.sort === "dexNumber") next.delete("sort");
            else next.set("sort", patch.sort!);
          }
          if ("dir" in patch) {
            if (!patch.dir || patch.dir === "asc") next.delete("dir");
            else next.set("dir", patch.dir!);
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const toggleType = useCallback(
    (type: PokemonType) => {
      update({
        types: filters.types.includes(type)
          ? filters.types.filter((t) => t !== type)
          : [...filters.types, type],
      });
    },
    [filters.types, update]
  );

  const toggleBucket = useCallback(
    (bucket: SpawnBucket) => {
      update({
        buckets: filters.buckets.includes(bucket)
          ? filters.buckets.filter((b) => b !== bucket)
          : [...filters.buckets, bucket],
      });
    },
    [filters.buckets, update]
  );

  const toggleContext = useCallback(
    (ctx: SpawnContext) => {
      update({
        contexts: filters.contexts.includes(ctx)
          ? filters.contexts.filter((c) => c !== ctx)
          : [...filters.contexts, ctx],
      });
    },
    [filters.contexts, update]
  );

  const clearFilters = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams();
        if (prev.get("sort")) next.set("sort", prev.get("sort")!);
        if (prev.get("dir")) next.set("dir", prev.get("dir")!);
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  return {
    filters,
    activeFilterCount,
    hasFilters,
    update,
    toggleType,
    toggleBucket,
    toggleContext,
    clearFilters,
  };
}

// ── Client-side filter predicate ──────────────────────────────────────

export interface FilterablePokemon {
  types: PokemonType[];
  generation: number;
  primaryBucket: string | null;
  primaryBiomes: string[] | null;
  primaryContext: string | null;
  primaryWeather: string | null;
}

export function applyPokedexFilters<T extends FilterablePokemon>(
  items: T[],
  filters: PokedexFilters
): T[] {
  return items.filter((item) => {
    if (
      filters.types.length > 0 &&
      !filters.types.some((t) => item.types.includes(t))
    )
      return false;

    if (filters.generation !== null && item.generation !== filters.generation)
      return false;

    if (filters.biome) {
      const needle = filters.biome.toLowerCase();
      if (!item.primaryBiomes?.some((b) => b.toLowerCase().includes(needle)))
        return false;
    }

    if (filters.weather) {
      if (filters.weather === "rain" && item.primaryWeather !== "rain")
        return false;
      if (
        filters.weather === "thunderstorm" &&
        item.primaryWeather !== "thunderstorm"
      )
        return false;
      if (
        filters.weather === "clear" &&
        item.primaryWeather !== null &&
        item.primaryWeather !== "clear"
      )
        return false;
    }

    if (
      filters.buckets.length > 0 &&
      (!item.primaryBucket ||
        !filters.buckets.includes(item.primaryBucket as SpawnBucket))
    )
      return false;

    if (
      filters.contexts.length > 0 &&
      (!item.primaryContext ||
        !filters.contexts.includes(item.primaryContext as SpawnContext))
    )
      return false;

    return true;
  });
}
