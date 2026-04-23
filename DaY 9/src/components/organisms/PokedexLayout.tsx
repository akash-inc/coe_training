import type { ReactNode } from 'react'

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
    <div className="flex min-h-svh flex-col gap-5 px-4 pb-6 pt-5">
      <header className="flex flex-col gap-2 border-b border-border pb-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="text-[clamp(1.75rem,4vw,2.25rem)] tracking-tight">
            Pokédex
          </h1>
          {headerAside ? <div className="min-w-0">{headerAside}</div> : null}
        </div>
        <p className="max-w-2xl text-[0.95rem] text-muted-foreground">
          Browse species from the open PokéAPI — theme controls land in a later
          phase.
        </p>
      </header>
      <main className="grid flex-1 grid-cols-1 items-start gap-5 min-[841px]:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
        <section
          className="min-h-[200px] rounded-lg border border-border bg-card p-4"
          aria-label="Pokémon list"
        >
          {list}
        </section>
        <section
          className="min-h-[200px] rounded-lg border border-border bg-card p-4"
          aria-label="Selected Pokémon"
        >
          {detail}
        </section>
      </main>
    </div>
  )
}
