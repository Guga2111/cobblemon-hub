import { index, layout, route } from "@react-router/dev/routes";
import type { RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  layout("routes/layout.tsx", [
    route("home", "routes/home.tsx"),
    route("pokedex", "routes/pokedex/index.tsx"),
    route("pokedex/:id", "routes/pokedex/$id.tsx"),
    route("team-builder", "routes/team-builder.tsx"),
    route("items", "routes/items.tsx"),
    route("guides", "routes/guides/index.tsx"),
    route("guides/:slug", "routes/guides/$slug.tsx"),
    route("gym-leaders", "routes/gym-leaders.tsx"),
    route("raids", "routes/raids.tsx"),
    route("shops", "routes/shops.tsx"),
    route("battle-mechanics", "routes/battle-mechanics.tsx"),
    route("legendaries", "routes/legendaries.tsx"),
    route("map", "routes/map.tsx"),
    route("progression", "routes/progression.tsx"),
  ]),
] satisfies RouteConfig;
