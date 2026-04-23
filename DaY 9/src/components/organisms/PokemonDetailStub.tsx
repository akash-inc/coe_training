import { Disclosure, DisclosureButton, DisclosurePanel, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import type { PokemonSummary } from '../../lib/pokeapi'
import { formatPokemonDisplayName } from '../../lib/pokeapi/formatPokemonDisplayName'
import { headlessTabClass, headlessTabListClass } from '../../lib/headlessTabClass'
import { cn } from '../../lib/cn'
import { DetailSelectPrompt } from '../pokedex/pokedexShells'
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

const disclosureButtonClass = cn(
  'flex w-full items-center justify-between gap-2 border-b border-border bg-card px-3 py-2 text-left text-sm font-medium text-foreground',
  'data-[hover]:bg-border/10',
  'focus:outline-none focus:ring-2 focus:ring-accent/50',
)

const disclosureButtonClassLast = cn(
  'flex w-full items-center justify-between gap-2 border-b-0 bg-card px-3 py-2 text-left text-sm font-medium text-foreground',
  'data-[hover]:bg-border/10',
  'focus:outline-none focus:ring-2 focus:ring-accent/50',
)

function RecordDisclosures({ pokemon, display }: { pokemon: PokemonSummary; display: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Disclosure defaultOpen>
        {({ open }) => (
          <>
            <DisclosureButton className={disclosureButtonClass}>
              <span>Identifiers</span>
              <span
                className={cn('text-xs text-muted-foreground', open && 'rotate-180')}
                aria-hidden
              >
                ▼
              </span>
            </DisclosureButton>
            <DisclosurePanel
              transition
              className="border-b border-border bg-card/40 px-3 pb-3 text-sm"
            >
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
            </DisclosurePanel>
          </>
        )}
      </Disclosure>

      <Disclosure>
        {({ open }) => (
          <>
            <DisclosureButton className={disclosureButtonClassLast}>
              <span>Type line</span>
              <span
                className={cn('text-xs text-muted-foreground', open && 'rotate-180')}
                aria-hidden
              >
                ▼
              </span>
            </DisclosureButton>
            <DisclosurePanel transition className="bg-card/40 px-3 pb-3 text-sm">
              <TypeLineText types={pokemon.types} />
            </DisclosurePanel>
          </>
        )}
      </Disclosure>
    </div>
  )
}

export function PokemonDetailStub({ pokemon }: PokemonDetailStubProps) {
  if (!pokemon) {
    return (
      <DetailSelectPrompt>
        <p className="m-0 max-w-sm text-center text-[0.95rem] text-muted-foreground">
          Select a Pokémon from the list to see its sprite and types.
        </p>
      </DetailSelectPrompt>
    )
  }

  const display = formatPokemonDisplayName(pokemon.name)

  return (
    <TabGroup className="w-full" defaultIndex={0}>
      <TabList className={headlessTabListClass} aria-label="Pokémon details">
        <Tab className={headlessTabClass}>Summary</Tab>
        <Tab className={headlessTabClass}>Record</Tab>
      </TabList>
      <TabPanels>
        <TabPanel className="pt-2 focus:outline-none">
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
        </TabPanel>
        <TabPanel className="pt-2 focus:outline-none">
          <RecordDisclosures pokemon={pokemon} display={display} />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  )
}
