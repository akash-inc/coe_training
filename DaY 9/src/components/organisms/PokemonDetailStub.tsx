import { Disclosure, DisclosureButton, DisclosurePanel, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import type { PokemonSummary } from '../../lib/pokeapi'
import { formatPokemonDisplayName } from '../../lib/pokeapi/formatPokemonDisplayName'
import { headlessTabClass, headlessTabListClass } from '../../lib/headlessTabClass'
import { cn } from '../../lib/cn'
import { usePokemonDetails, type PokemonDetailsState } from '../../hooks/usePokemonDetails'
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

function StatTable({ state }: { state: PokemonDetailsState }) {
  if (state.status === 'loading') {
    return <p className="m-0 text-sm text-muted-foreground" role="status">Loading base stats…</p>
  }
  if (state.status === 'error') {
    return <p className="m-0 text-sm text-foreground" role="alert">{state.error}</p>
  }
  const { stats } = state.data
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[240px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="py-1.5 pr-2 font-medium">Stat</th>
            <th className="py-1.5 font-mono">Base</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((row) => (
            <tr key={row.key} className="border-b border-border/50">
              <td className="py-1.5 pr-2 capitalize text-foreground/95">
                {formatPokemonDisplayName(row.key)}
              </td>
              <td className="py-1.5 font-mono text-foreground">{row.base}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MovesBlock({ state }: { state: PokemonDetailsState }) {
  if (state.status === 'loading') {
    return <p className="m-0 text-sm text-muted-foreground" role="status">Loading moves…</p>
  }
  if (state.status === 'error') {
    return <p className="m-0 text-sm text-foreground" role="alert">{state.error}</p>
  }
  const { moves } = state.data
  if (moves.length === 0) {
    return <p className="m-0 text-sm text-muted-foreground">No moves in this list.</p>
  }
  return (
    <ul className="m-0 max-h-[min(50vh,22rem)] list-none space-y-1.5 overflow-y-auto p-0 text-sm" aria-label="Move names">
      {moves.map((m) => (
        <li key={m} className="border-b border-border/40 pb-1.5 last:border-0 last:pb-0">
          {formatPokemonDisplayName(m)}
        </li>
      ))}
    </ul>
  )
}

function EvolutionBlock({ state }: { state: PokemonDetailsState }) {
  if (state.status === 'loading') {
    return <p className="m-0 text-sm text-muted-foreground" role="status">Loading evolution…</p>
  }
  if (state.status === 'error') {
    return <p className="m-0 text-sm text-foreground" role="alert">{state.error}</p>
  }
  const { evolution, evolutionError } = state.data
  if (evolutionError) {
    return <p className="m-0 text-sm text-muted-foreground">Evolution data could not be loaded.</p>
  }
  if (evolution.length === 0) {
    return <p className="m-0 text-sm text-muted-foreground">No evolution line returned.</p>
  }
  return (
    <div
      className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-foreground/95"
      aria-label="Evolution line"
    >
      {evolution.map((slug, i) => (
        <span key={slug} className="inline-flex items-center gap-1.5">
          {i > 0 ? <span className="text-muted-foreground" aria-hidden>→</span> : null}
          <span className="capitalize">{formatPokemonDisplayName(slug)}</span>
        </span>
      ))}
    </div>
  )
}

function PokemonDetailWithData({ pokemon }: { pokemon: PokemonSummary }) {
  const display = formatPokemonDisplayName(pokemon.name)
  const details = usePokemonDetails(pokemon)

  return (
    <TabGroup className="w-full" defaultIndex={0}>
      <TabList className={headlessTabListClass} aria-label="Pokémon details">
        <Tab className={headlessTabClass}>Summary</Tab>
        <Tab className={headlessTabClass}>Stats</Tab>
        <Tab className={headlessTabClass}>Moves</Tab>
        <Tab className={headlessTabClass}>Evolution</Tab>
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
        <TabPanel className="pt-2 focus:outline-none" aria-label="Base stats">
          <StatTable state={details} />
        </TabPanel>
        <TabPanel className="pt-2 focus:outline-none" aria-label="Move list">
          <MovesBlock state={details} />
        </TabPanel>
        <TabPanel className="pt-2 focus:outline-none" aria-label="Evolution">
          <EvolutionBlock state={details} />
        </TabPanel>
        <TabPanel className="pt-2 focus:outline-none">
          <RecordDisclosures pokemon={pokemon} display={display} />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  )
}

export function PokemonDetailStub({ pokemon }: PokemonDetailStubProps) {
  if (!pokemon) {
    return (
      <DetailSelectPrompt>
        <p className="m-0 max-w-sm text-center text-[0.95rem] text-muted-foreground">
          Select a Pokémon from the list to see its sprite, types, stats, moves, and evolution.
        </p>
      </DetailSelectPrompt>
    )
  }

  return <PokemonDetailWithData key={pokemon.id} pokemon={pokemon} />
}
