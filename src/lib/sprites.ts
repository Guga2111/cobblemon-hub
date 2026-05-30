const OFFICIAL_ARTWORK_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

const HOME_SPRITES_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home";

export function getPokemonSprite(dexNumber: number): string {
  return `${OFFICIAL_ARTWORK_BASE}/${dexNumber}.png`;
}

export function getPokemonSpriteFallback(dexNumber: number): string {
  return `${HOME_SPRITES_BASE}/${dexNumber}.png`;
}
