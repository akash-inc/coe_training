import type { PokemonSummary } from '../../lib/pokeapi'

export const mockPikachu: PokemonSummary = {
  id: 25,
  name: 'pikachu',
  spriteUrl:
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
  types: ['electric'],
}

export const mockCharizard: PokemonSummary = {
  id: 6,
  name: 'charizard',
  spriteUrl:
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png',
  types: ['fire', 'flying'],
}

export const mockNoSprite: PokemonSummary = {
  id: 132,
  name: 'ditto',
  spriteUrl: null,
  types: ['normal'],
}
