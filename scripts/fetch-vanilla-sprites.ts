/**
 * Downloads vanilla Minecraft item sprites for items missing Cobblemon textures.
 * Uses InventivetalentDev/minecraft-assets on GitHub (1.21.1 textures).
 * Tries /item/ first, then /block/ for block-type items.
 * Writes to public/sprites/items/.
 */

import { writeFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SPRITES_DIR = "./public/sprites/items";
const ITEMS_JSON = "./data/items.json";
const BASE = "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21.1/assets/minecraft/textures";

// Items whose texture filename differs from the item id
const NAME_OVERRIDES: Record<string, string> = {
  beef: "raw_beef",
  chicken: "raw_chicken",
  cod: "raw_cod",
  mutton: "raw_mutton",
  porkchop: "raw_porkchop",
  rabbit: "raw_rabbit",
  salmon: "raw_salmon",
};

async function fetchSprite(itemName: string): Promise<Buffer | null> {
  const textureName = NAME_OVERRIDES[itemName] ?? itemName;

  // Try item texture, then block texture
  const urls = [
    `${BASE}/item/${textureName}.png`,
    `${BASE}/block/${textureName}.png`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return Buffer.from(await res.arrayBuffer());
      }
    } catch {
      // try next
    }
  }
  return null;
}

async function main() {
  mkdirSync(SPRITES_DIR, { recursive: true });

  if (!existsSync(ITEMS_JSON)) {
    console.error("[error] data/items.json not found. Run extract-items first.");
    process.exit(1);
  }

  const items = JSON.parse(readFileSync(ITEMS_JSON, "utf-8")) as Array<{
    id: string;
    name: string;
    sprite: string | null;
  }>;

  const missing = items.filter(
    (i) => !i.sprite && !existsSync(join(SPRITES_DIR, `${i.name}.png`))
  );

  console.log(`[info] ${missing.length} items missing sprites`);

  let fetched = 0;
  let failed = 0;
  const notFound: string[] = [];

  for (const item of missing) {
    const data = await fetchSprite(item.name);
    if (data) {
      writeFileSync(join(SPRITES_DIR, `${item.name}.png`), data);
      fetched++;
    } else {
      failed++;
      notFound.push(item.name);
    }
    process.stdout.write(`\r[fetch] ${fetched + failed}/${missing.length}`);
  }

  console.log(`\n[done] Fetched ${fetched} sprites, ${failed} not found`);
  if (notFound.length > 0) {
    console.log(`[miss] ${notFound.join(", ")}`);
  }
}

main();
