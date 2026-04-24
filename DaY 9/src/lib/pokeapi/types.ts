export type PokemonListItem = {
  name: string
  url: string
}

export type PokemonListResponse = {
  count: number
  next: string | null
  previous: string | null
  results: PokemonListItem[]
}

export type PokemonDto = {
  id: number
  name: string
  sprites: {
    front_default: string | null
  }
  types: { slot: number; type: { name: string } }[]
}

export type PokemonResourceDto = {
  id: number
  name: string
  species: { name: string; url: string }
  stats: { base_stat: number; stat: { name: string } }[]
  moves: { move: { name: string } }[]
}

export type SpeciesResourceDto = {
  evolution_chain: { url: string }
}

export type EvolutionChainLink = {
  species: { name: string }
  evolves_to: EvolutionChainLink[]
}

export type EvolutionChainResourceDto = {
  chain: EvolutionChainLink
}
