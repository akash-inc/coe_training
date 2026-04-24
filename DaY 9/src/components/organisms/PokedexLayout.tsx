import type { ReactNode } from 'react'
import { PokedexPanel } from './PokedexPanel'

type PokedexLayoutProps = {
  headerAside?: ReactNode
  list: ReactNode
  detail: ReactNode
}

export function PokedexLayout({
  headerAside,
  list,
  detail,
}: PokedexLayoutProps) {
  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-4 px-4 pb-6 pt-2">
      <header className="flex flex-col gap-2 border-b border-border/80 pb-3">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="font-heading text-[clamp(1.85rem,4vw,2.45rem)] font-bold tracking-tight text-foreground">
            Pokédex
          </h1>
          {headerAside ? <div className="min-w-0">{headerAside}</div> : null}
        </div>
        <p className="max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">
          Full national list from the open PokéAPI—search, sort, and filter by type. The shell picks up
          your selection’s primary type; adjust display in the app bar to match your setup.
        </p>
      </header>
      <main className="grid min-h-0 flex-1 grid-cols-1 items-start gap-5 min-[841px]:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
        <PokedexPanel aria-label="Pokémon list">{list}</PokedexPanel>
        <PokedexPanel aria-label="Selected Pokémon">{detail}</PokedexPanel>
      </main>
    </div>
  )
}
