const KEY = 'day9-pokedex-team-ids'
const MAX = 6

function parseIds(raw: string | null): number[] {
  if (!raw) {
    return []
  }
  try {
    const v = JSON.parse(raw) as unknown
    if (!Array.isArray(v)) {
      return []
    }
    return v.filter((x): x is number => typeof x === 'number' && Number.isFinite(x))
  } catch {
    return []
  }
}

export function readTeamFromStorage(): number[] {
  if (typeof localStorage === 'undefined') {
    return []
  }
  const row = localStorage.getItem(KEY)
  return parseIds(row).slice(0, MAX)
}

export function writeTeamToStorage(ids: number[]): void {
  if (typeof localStorage === 'undefined') {
    return
  }
  const next = ids.slice(0, MAX)
  localStorage.setItem(KEY, JSON.stringify(next))
}

export const teamConstraints = { max: MAX, storageKey: KEY } as const

export function applyTeamToggle(pokemonId: number, current: number[]): number[] {
  const has = current.includes(pokemonId)
  if (has) {
    return current.filter((x) => x !== pokemonId)
  }
  if (current.length >= teamConstraints.max) {
    return current
  }
  return [...current, pokemonId]
}
