const BASE = 'https://pokeapi.co/api/v2'

export async function pokeapiGet<T>(path: string): Promise<T> {
  const normalized = path.startsWith('http')
    ? path
    : `${BASE}/${path.replace(/^\//, '')}`
  const res = await fetch(normalized)
  if (!res.ok) {
    throw new Error(`PokéAPI ${res.status} for ${normalized}`)
  }
  return res.json() as Promise<T>
}
