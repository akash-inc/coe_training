import type { PokemonSummary } from '../../lib/pokeapi'
import { formatPokemonDisplayName } from '../../lib/pokeapi/formatPokemonDisplayName'
import { Accordion } from '../ui/accordion/Accordion'
import { Tabs } from '../ui/tabs/Tabs'
import { IdChip } from '../atoms/IdChip'
import { PokemonName } from '../atoms/PokemonName'
import { TypeBadge } from '../atoms/TypeBadge'

type PokemonDetailStubProps = {
  pokemon: PokemonSummary | null
}

function TypeLineText({ types }: { types: string[] }) {
  if (types.length === 0) {
    return <p className="m-0 text-foreground/90">No types reported.</p>
  }
  if (types.length === 1) {
    return (
      <p className="m-0 text-foreground/90">
        This species is only <span className="capitalize text-foreground">{types[0]}</span> type.
      </p>
    )
  }
  return (
    <p className="m-0 text-foreground/90">
      Primary: <span className="capitalize text-foreground">{types[0]}</span> · Secondary:{' '}
      <span className="capitalize text-foreground">{types[1]}</span>
    </p>
  )
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

  const display = formatPokemonDisplayName(pokemon.name)

  return (
    <Tabs defaultValue="summary" className="w-full">
      <Tabs.List aria-label="Pokémon details">
        <Tabs.Tab value="summary">Summary</Tabs.Tab>
        <Tabs.Tab value="record">Record</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="summary" className="pt-2">
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
      </Tabs.Panel>
      <Tabs.Panel value="record" className="pt-2">
        <Accordion type="single" defaultValue="identifiers" collapsible>
          <Accordion.Item value="identifiers">
            <Accordion.Trigger>Identifiers</Accordion.Trigger>
            <Accordion.Content>
              <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-xs">
                <dt className="font-mono text-muted-foreground">National</dt>
                <dd className="m-0 font-mono text-foreground">
                  {String(pokemon.id).padStart(3, '0')}
                </dd>
                <dt className="font-mono text-muted-foreground">Display name</dt>
                <dd className="m-0 text-foreground">{display}</dd>
                <dt className="font-mono text-muted-foreground">API slug</dt>
                <dd className="m-0 break-all font-mono text-foreground">{pokemon.name}</dd>
              </dl>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="type-line">
            <Accordion.Trigger>Type line</Accordion.Trigger>
            <Accordion.Content>
              <TypeLineText types={pokemon.types} />
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </Tabs.Panel>
    </Tabs>
  )
}
