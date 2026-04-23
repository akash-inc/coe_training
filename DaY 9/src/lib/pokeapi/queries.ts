import { pokeapiGet } from './client'
import type { PokemonDto, PokemonListResponse } from './types'

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
