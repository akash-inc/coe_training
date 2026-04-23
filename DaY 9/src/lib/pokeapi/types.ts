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
