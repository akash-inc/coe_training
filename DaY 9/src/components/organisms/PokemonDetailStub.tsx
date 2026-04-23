import type { PokemonSummary } from '../../lib/pokeapi'
import { IdChip } from '../atoms/IdChip'
import { PokemonName } from '../atoms/PokemonName'
import { TypeBadge } from '../atoms/TypeBadge'

type PokemonDetailStubProps = {
  pokemon: PokemonSummary | null
}

export function PokemonDetailStub({ pokemon }: PokemonDetailStubProps) {
  if (!pokemon) {
    return (
      <div className="flex min-h-40 flex-col items-center justify-center gap-4">
        <p className="text-[0.95rem] text-muted-foreground">
          Select a Pokémon from the list to see its sprite and types.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        {pokemon.spriteUrl ? (
          <img
            src={pokemon.spriteUrl}
            alt=""
            width={160}
            height={160}
            className="h-40 w-40 shrink-0 [image-rendering:pixelated]"
          />
        ) : (
          <div
            className="h-40 w-40 shrink-0 rounded-md bg-[color-mix(in_srgb,var(--border)_80%,transparent)]"
            aria-hidden
          />
        )}
        <div className="flex min-w-0 flex-col gap-2">
          <PokemonName
            name={pokemon.name}
            as="h2"
            className="text-2xl"
          />
          <IdChip id={pokemon.id} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {pokemon.types.map((t) => (
          <TypeBadge key={t} type={t} />
        ))}
      </div>
    </div>
  )
}
