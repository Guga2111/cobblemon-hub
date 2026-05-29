# Cobblemon Hub

A full-stack web application serving as a reference hub for the [Cobblemon](https://cobblemon.com/) Minecraft mod. Browse Pokemon, plan teams, look up items, and read guides — all extracted directly from the mod's datapack.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router 7, TypeScript |
| UI | Tailwind CSS 4, Radix UI, shadcn/ui, Lucide icons |
| State | Zustand (client), TanStack React Query (server) |
| Tables | TanStack React Table, TanStack Virtual |
| Backend | Hono (Node.js) |
| Database | LibSQL / Turso (SQLite-compatible) |
| Build | Vite 6, tsx |
| Validation | Zod |

## Getting Started

### Prerequisites

- Node.js 20+
- The Cobblemon mod JAR (for data extraction)

### Installation

```bash
npm install
cp .env.example .env
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TURSO_DATABASE_URL` | `file:./data/cobblemon.db` | SQLite file path or Turso cloud URL |
| `TURSO_AUTH_TOKEN` | _(empty)_ | Auth token for Turso cloud (not needed for local) |

### Data Pipeline

Extract data from the Cobblemon datapack and seed the database:

```bash
npm run extract   # Extract pokemon, spawns, items, and moves
npm run seed      # Populate the SQLite database
```

The extraction pipeline:

```
Cobblemon JAR / datapack
  |
  +--> extract-pokemon.ts --> data/pokemon.json
  |      |
  |      +--> extract-items.ts  --> data/items.json
  |      +--> extract-moves.ts  --> data/moves.json (fetches from PokeAPI)
  |
  +--> extract-spawns.ts  --> data/spawns.json

All JSON files --> seed-db.ts --> data/cobblemon.db
```

### Running the App

```bash
npm run dev       # Starts both client (:5173) and server (:3001) concurrently
npm run client    # Frontend only (React Router dev server)
npm run server    # Backend only (Hono API server)
npm run typecheck # Run TypeScript type checking
```

---

## Project Structure

```
cobblemon-hub/
├── server/                  # Backend API
│   ├── index.ts             # Hono app, API routes, CORS config
│   └── db/
│       ├── client.ts        # LibSQL database client
│       └── schema.sql       # Database schema (4 tables)
├── src/                     # Frontend application
│   ├── app/
│   │   ├── root.tsx         # App root, QueryClient provider, fonts
│   │   ├── routes.ts        # Route definitions
│   │   └── routes/          # Page components
│   ├── components/
│   │   ├── ui/              # shadcn/ui primitives
│   │   ├── layout/          # Theme toggle, error boundary
│   │   ├── pokemon/         # Pokemon-specific components
│   │   ├── team/            # Team builder components
│   │   └── search/          # Command palette (Cmd+K)
│   ├── features/
│   │   ├── pokedex/         # Pokedex filter logic
│   │   └── team-builder/    # Zustand store, stat calculator, export
│   ├── types/               # TypeScript interfaces
│   ├── lib/                 # Utilities, constants, Zod schemas
│   ├── content/             # Static guide content
│   └── styles/              # Global CSS, type colors
├── scripts/                 # Data extraction & seeding scripts
├── data/                    # Extracted JSON + SQLite database
└── public/                  # Static assets (sprites, images)
```

---

## Frontend

### Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Home | Stats overview, quick access cards |
| `/pokedex` | Pokedex | Virtualized, filterable, sortable Pokemon table |
| `/pokedex/:id` | Pokemon Detail | Stats, spawns, moves, evolutions (tabbed view) |
| `/team-builder` | Team Builder | 6-slot team planner with EV/IV editor and export |
| `/items` | Items | Searchable item catalog with category filters |
| `/guides` | Guides | Guide cards with difficulty and category filters |
| `/guides/:slug` | Guide Detail | Full guide with sections, tips, and FAQ |

All routes share a common layout (`layout.tsx`) with:
- Desktop: collapsible sidebar navigation
- Tablet: drawer-based navigation
- Mobile: bottom navigation bar
- Header with global search (Cmd+K) and theme toggle

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `command-search.tsx` | `components/search/` | Global search palette with Pokemon preview panel and history |
| `type-badge.tsx` | `components/pokemon/` | Colored Pokemon type badge |
| `stat-bar.tsx` | `components/pokemon/` | Animated base stat visualization |
| `evolution-chain.tsx` | `components/pokemon/` | Evolution tree with conditions |
| `spawn-card.tsx` | `components/pokemon/` | Spawn location with biome, rarity, conditions |
| `moves-table.tsx` | `components/pokemon/` | Move table with method filtering (level-up/TM/egg/tutor) |
| `team-slot.tsx` | `components/team/` | Team member card with Pokemon/nature/ability/item selection |
| `ev-slider.tsx` | `components/team/` | EV/IV adjustment sliders with validation |
| `stat-calculator.tsx` | `components/team/` | Stat calculator for Lv50 and Lv100 |
| `export-dialog.tsx` | `components/team/` | Export team (Showdown format or shareable URL) |
| `filter-sheet.tsx` | `features/pokedex/` | Advanced filter modal (type, generation, biome, weather, rarity) |
| `route-error-boundary.tsx` | `components/layout/` | Error boundary with retro terminal styling |
| `theme-toggle.tsx` | `components/layout/` | Dark/light mode toggle |

### UI Primitives (shadcn/ui)

`button`, `card`, `badge`, `tabs`, `input`, `separator`, `accordion`, `sheet`, `progress`

### Custom Hooks

| Hook | File | Purpose |
|------|------|---------|
| `usePokedexFilters` | `features/pokedex/use-pokedex-filters.ts` | URL-based filter state (types, generation, biome, weather, rarity) |
| `useTeamStore` | `features/team-builder/use-team-store.ts` | Zustand store for team data with localStorage persistence |
| `useStatCalculator` | `features/team-builder/use-stat-calculator.ts` | Battle stat calculation (base stats + EVs + IVs + nature) |
| `useEvValidation` | `features/team-builder/use-ev-validation.ts` | EV spread validation (252 per stat, 510 total) |
| `useTeamExport` | `features/team-builder/use-team-export.ts` | Showdown format and shareable URL export |

### State Management

| State | Strategy | Persistence |
|-------|----------|-------------|
| Server data | TanStack React Query (60s stale time, 1 retry) | In-memory cache |
| Team data | Zustand | localStorage |
| Pokedex filters | URL search params | URL (shareable/bookmarkable) |
| Theme | React state | localStorage |
| Sidebar | React state | localStorage |
| Search history | Direct read/write | localStorage |

### Styling

- **Tailwind CSS 4** with `tailwindcss-animate` plugin
- **CSS custom properties** for theming (HSL values in `globals.css`)
- **Dark mode** by default, light mode via `.light` class
- **Type colors** in `type-colors.css` for all 18 Pokemon types
- **Font**: Plus Jakarta Sans (Google Fonts)
- Custom animations: fade-in, shimmer, float, glow-pulse, accordion

---

## Backend

### Server

- **Framework**: Hono on `@hono/node-server`
- **Port**: 3001
- **CORS**: Allows GET from `http://localhost:5173`
- **Rendering**: Client-side only (`ssr: false`)

### API Endpoints

| Method | Endpoint | Query Params | Description |
|--------|----------|-------------|-------------|
| GET | `/api/health` | — | Health check (`{ status: "ok" }`) |
| GET | `/api/pokemon` | `page`, `limit`, `type`, `generation` | Paginated Pokemon list with spawn context |
| GET | `/api/pokemon/search` | `q` | Fuzzy search by name (max 20 results) |
| GET | `/api/pokemon/:id` | — | Full Pokemon detail + spawns + prev/next navigation |
| GET | `/api/spawns/:pokemonId` | — | Spawn entries grouped by biome |
| GET | `/api/items` | `q`, `category` | Items list with search and category filter |
| GET | `/api/items/:id` | — | Item detail with Pokemon drop sources |

### Database Schema

Four tables in SQLite (via LibSQL/Turso):

**`pokemon`** — Core species data
- `id`, `dex_number`, `name`, `display_name`, `generation`
- JSON columns: `types`, `base_stats`, `abilities`, `moves`, `evolutions`, `forms`, `drops`, `egg_groups`
- Numeric: `catch_rate`, `base_exp`, `gender_ratio`
- Text: `growth_rate`

**`spawn_entries`** — World spawn locations
- `id`, `pokemon_id` (FK), `bucket` (common/uncommon/rare/ultra-rare), `context` (grounded/submerged/etc.)
- JSON columns: `biomes`, `conditions`, `anticonditions`
- Numeric: `weight`, `level_min`, `level_max`

**`items`** — Loot and held items
- `id`, `name`, `display_name`, `category`, `description`, `sprite`
- JSON: `dropped_by` (array of Pokemon IDs)

**`moves`** — Move definitions
- `id`, `name`, `display_name`, `type`, `category` (physical/special/status)
- Numeric: `power`, `accuracy`, `pp`

### Data Extraction Scripts

| Script | Input | Output | Notes |
|--------|-------|--------|-------|
| `extract-pokemon.ts` | Cobblemon datapack species JSONs | `data/pokemon.json` | Normalizes types, abilities, moves, evolutions, drops |
| `extract-spawns.ts` | Datapack spawn pool JSONs | `data/spawns.json` | Parses biomes, buckets, conditions |
| `extract-items.ts` | `data/pokemon.json` + sprite index | `data/items.json` | Deduplicates from drop tables, auto-categorizes |
| `extract-moves.ts` | `data/pokemon.json` + PokeAPI v2 | `data/moves.json` | Fetches from PokeAPI with caching and rate limiting |
| `seed-db.ts` | All 4 JSON files | `data/cobblemon.db` | Creates tables and inserts with validation |

---

## Type System

Core types are defined in `src/types/` and validated at runtime with Zod schemas (`src/lib/schemas.ts`).

| Type | Key Fields |
|------|-----------|
| `Pokemon` | dex_number, types, base_stats, abilities, moves, evolutions, forms, drops |
| `BaseStats` | hp, attack, defense, specialAttack, specialDefense, speed |
| `Ability` | name, displayName, description, isHidden |
| `LearnableMove` | name, type, category, power, accuracy, pp, method, level |
| `Evolution` | to, trigger, level, item, condition |
| `SpawnEntry` | pokemonId, bucket, context, biomes, weight, levelMin/Max, conditions |
| `SpawnCondition` | minY, maxY, minLight, maxLight, isRaining, isThundering, structures, nearbyBlocks |
| `Item` | name, category, description, sprite, droppedBy |
| `Move` | name, type, category, power, accuracy, pp |

**Enumerations**: 18 `PokemonType`s, 6 `GrowthRate`s, 14 `EggGroup`s, 4 `SpawnBucket`s, 5 `SpawnContext`s, 25 `Nature`s

---

## Updating Data

When a new Cobblemon mod version is released:

1. Replace the mod JAR / extract the datapack to `data/datapack/`
2. Run `npm run extract` to regenerate JSON files
3. Run `npm run seed` to repopulate the database
4. Restart the server
