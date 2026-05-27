# Data Extraction Scripts

These scripts extract and transform data from the Cobblemon Minecraft mod datapack into the JSON files used by the Cobblemon Hub application.

## Prerequisites

- Node.js 20+
- The Cobblemon v1.7.x mod/datapack extracted to a local directory
- Internet access (for `extract-moves.ts` which calls PokeAPI)

## Setup

1. Download the Cobblemon v1.7.3 mod `.jar` file from [Modrinth](https://modrinth.com/mod/cobblemon) or [CurseForge](https://www.curseforge.com/minecraft/mc-mods/cobblemon).
2. Extract the `.jar` (it's a zip file) to a directory, e.g. `~/cobblemon-datapack/`.
3. Set the environment variable:

```bash
export COBBLEMON_DATAPACK_PATH=~/cobblemon-datapack
```

## Running extraction

```bash
npm run extract
```

This runs all four scripts in sequence:

1. `extract-pokemon.ts` → `data/pokemon.json`
2. `extract-spawns.ts` → `data/spawns.json`
3. `extract-items.ts` → `data/items.json`
4. `extract-moves.ts` → `data/moves.json`

### Running individual scripts

```bash
tsx scripts/extract-pokemon.ts
tsx scripts/extract-spawns.ts
tsx scripts/extract-items.ts
tsx scripts/extract-moves.ts
```

## Output files

| File | Description |
|------|-------------|
| `data/pokemon.json` | Array of `Pokemon` objects with base stats, abilities, moves, evolutions, and drops |
| `data/spawns.json` | Array of `SpawnEntry` objects with biome, bucket, conditions |
| `data/items.json` | Deduplicated item catalog built from Pokémon drop data |
| `data/moves.json` | Move database with power/accuracy/PP/type fetched from PokeAPI |

## Caching behaviour

`extract-moves.ts` preserves existing `data/moves.json` entries — only missing moves are fetched from PokeAPI. Re-running is safe and incremental.

## Re-extraction for a new Cobblemon version

1. Point `COBBLEMON_DATAPACK_PATH` at the new version's extracted jar.
2. Delete `data/moves.json` if move data has changed (or let the script fetch only the new moves).
3. Run `npm run extract`.
4. Run `npm run seed` to re-populate the database.

## Datapack structure expected

```
{COBBLEMON_DATAPACK_PATH}/
  data/
    cobblemon/
      species/
        gen1/
          bulbasaur.json
          ...
        gen2/
          chikorita.json
          ...
      spawn_pool_world/
        bulbasaur.json
        ...
```

## Validation errors

Scripts log validation errors with context (file path + field path + message) but continue processing. A non-zero error count in the output indicates data quality issues — inspect the logged errors for details.
