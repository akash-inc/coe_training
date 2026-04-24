const BASE = 'https://pokeapi.co/api/v2'

type PokeapiGetInit = { signal?: AbortSignal }

export async function pokeapiGet<T>(path: string, init?: PokeapiGetInit): Promise<T> {
  const normalized = path.startsWith('http')
    ? path
    : `${BASE}/${path.replace(/^\//, '')}`
  const res = await fetch(normalized, { signal: init?.signal })
  if (!res.ok) {
    throw new Error(`PokéAPI ${res.status} for ${normalized}`)
  }
  return res.json() as Promise<T>
}
