/** Plain-language copy for in-app errors (everyone, not just developers). */

export function listLoadErrorCopy(raw: unknown): {
  heading: string
  body: string
  technical?: string
} {
  const technical =
    raw instanceof Error ? raw.message : typeof raw === 'string' ? raw : undefined
  return {
    heading: 'The Pokémon list on the left didn’t load',
    body: 'That’s the scrollable list of cards (not the details on the right). Check your connection, then tap Try again, or wait a bit — the public Pokédex can be slow.',
    technical: technical?.trim() ? technical : undefined,
  }
}

export const detailSectionErrorCopy = {
  heading: 'This details panel didn’t load',
  body: 'Use the Pokémon list on the left to tap the same Pokémon again, or pick a different one.',
} as const

export const evolutionUnavailableCopy =
  'We couldn’t show this Pokémon’s evolution line. Check your connection and try again in a moment.'
