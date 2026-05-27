import { index, route } from "@react-router/dev/routes";
import type { RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("pokedex", "routes/pokedex/index.tsx"),
  route("pokedex/:id", "routes/pokedex/$id.tsx"),
  route("team-builder", "routes/team-builder.tsx"),
  route("items", "routes/items.tsx"),
  route("guides", "routes/guides/index.tsx"),
  route("guides/:slug", "routes/guides/$slug.tsx"),
] satisfies RouteConfig;
