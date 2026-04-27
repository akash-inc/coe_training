/**
 * Public sprite art from the PokéAPI GitHub mirror (no extra fetch; URL pattern only).
 * Falls back in `onError` on the `img` if a future game slot has no art.
 */
export function defaultFrontSpriteUrl(nationalId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${nationalId}.png`
}
