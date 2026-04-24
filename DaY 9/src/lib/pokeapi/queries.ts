import { pokeapiGet } from './client'
import type {
  EvolutionChainLink,
  EvolutionChainResourceDto,
  PokemonDto,
  PokemonListItem,
  PokemonListResponse,
  PokemonResourceDto,
  SpeciesResourceDto,
} from './types'

export type PokemonSummary = {
  id: number
  name: string
  spriteUrl: string | null
  types: string[]
}

function dtoToSummary(dto: PokemonDto): PokemonSummary {
  const types = [...dto.types]
    .sort((a, b) => a.slot - b.slot)
    .map((t) => t.type.name)
  return {
    id: dto.id,
    name: dto.name,
    spriteUrl: dto.sprites.front_default,
    types,
  }
}

export async function fetchPokemonSummaries(
  limit: number,
  offset: number,
): Promise<PokemonSummary[]> {
  const list = await pokeapiGet<PokemonListResponse>(
    `pokemon?limit=${limit}&offset=${offset}`,
  )
  const rows = await Promise.all(
    list.results.map((item) => pokeapiGet<PokemonDto>(item.url)),
  )
  return rows.map(dtoToSummary)
}

const LIST_PAGE = 2000
const DETAIL_BATCH = 48

async function fetchAllPokemonListItems(
  init?: { signal?: AbortSignal },
): Promise<PokemonListItem[]> {
  const meta = await pokeapiGet<PokemonListResponse>('pokemon?limit=1&offset=0', init)
  const total = meta.count
  const out: PokemonListItem[] = []
  let offset = 0
  while (offset < total) {
    if (init?.signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError')
    }
    const page = await pokeapiGet<PokemonListResponse>(
      `pokemon?limit=${Math.min(LIST_PAGE, total - offset)}&offset=${offset}`,
      init,
    )
    out.push(...page.results)
    offset += page.results.length
    if (page.results.length === 0) {
      break
    }
  }
  return out
}

/**
 * Loads every Pokémon resource (national dex as exposed by PokéAPI), with batched detail
 * requests to avoid hundreds of parallel calls. `onProgress` reports loaded count vs total names.
 */
export async function fetchAllPokemonSummaries(
  onProgress?: (loaded: number, total: number) => void,
  init?: { signal?: AbortSignal },
): Promise<PokemonSummary[]> {
  const results = await fetchAllPokemonListItems(init)
  const total = results.length
  onProgress?.(0, total)
  const out: PokemonSummary[] = []
  for (let i = 0; i < results.length; i += DETAIL_BATCH) {
    if (init?.signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError')
    }
    const slice = results.slice(i, i + DETAIL_BATCH)
    const rows = await Promise.all(
      slice.map((item) => pokeapiGet<PokemonDto>(item.url, init)),
    )
    out.push(...rows.map(dtoToSummary))
    onProgress?.(out.length, total)
  }
  return out
}

const STAT_ORDER = [
  'hp',
  'attack',
  'defense',
  'special-attack',
  'special-defense',
  'speed',
] as const

function statMap(stats: { base_stat: number; stat: { name: string } }[]) {
  const m = new Map(stats.map((s) => [s.stat.name, s.base_stat] as const))
  return STAT_ORDER.map((key) => ({ key, base: m.get(key) ?? 0 }))
}

function walkEvolutionChain(n: EvolutionChainLink, out: string[]): void {
  out.push(n.species.name)
  for (const c of n.evolves_to) {
    walkEvolutionChain(c, out)
  }
}

function uniqueSortedMoves(moves: { move: { name: string } }[]) {
  const set = new Set(moves.map((m) => m.move.name))
  return [...set].sort((a, b) => a.localeCompare(b)).slice(0, 40)
}

export type PokemonDetailsPayload = {
  stats: { key: string; base: number }[]
  moves: string[]
  /** Species slugs in rough evolution order (PokéAPI tree walk). */
  evolution: string[]
  evolutionError: boolean
}

export async function fetchPokemonDetailsPayload(
  id: number,
  init?: { signal?: AbortSignal },
): Promise<PokemonDetailsPayload> {
  const p = await pokeapiGet<PokemonResourceDto>(`pokemon/${id}`, init)
  const stats = statMap(p.stats)
  const moves = uniqueSortedMoves(p.moves)
  const evolution: string[] = []
  let evolutionError = false
  try {
    const species = await pokeapiGet<SpeciesResourceDto>(p.species.url, init)
    const chain = await pokeapiGet<EvolutionChainResourceDto>(species.evolution_chain.url, init)
    const raw: string[] = []
    walkEvolutionChain(chain.chain, raw)
    const seen = new Set<string>()
    for (const n of raw) {
      if (seen.has(n)) {
        continue
      }
      seen.add(n)
      evolution.push(n)
    }
  } catch {
    evolutionError = true
  }
  return { stats, moves, evolution, evolutionError }
}
