import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { queryKeys } from '../../lib/queryKeys'
import { POKEDEX_PAGE_SIZE } from '../../lib/queryOptions'
import { getSimulateTeamMutationFailure, setSimulateTeamMutationFailure } from '../../hooks/useTeamToggle'
import { cn } from '../../lib/cn'

type PokedexCacheControlsProps = {
  listLive: boolean
  onListLiveChange: (on: boolean) => void
}

const actionBtn =
  'rounded-lg border border-border bg-card px-3 py-2 text-left text-xs font-medium text-foreground transition-colors hover:bg-muted/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/45'

const togglePill = (pressed: boolean, danger?: boolean) =>
  cn(
    'inline-flex min-h-[2.5rem] max-w-full items-center gap-2 rounded-full border-2 pl-1 pr-3 text-left text-xs font-medium transition-colors',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    danger
      ? pressed
        ? 'border-destructive/70 bg-destructive/10 text-destructive focus-visible:ring-destructive/30'
        : 'border-border bg-background/90 text-muted-foreground hover:border-border'
      : pressed
        ? 'border-accent bg-accent/15 text-foreground shadow-sm focus-visible:ring-accent/40'
        : 'border-border bg-background/90 text-muted-foreground hover:border-border/90',
  )

const toggleKnob = (on: boolean, danger?: boolean) => (
  <span
    className={cn(
      'inline-block h-4 w-4 shrink-0 rounded-full border-2',
      on
        ? danger
          ? 'border-destructive/80 bg-destructive/40'
          : 'border-accent/90 bg-accent/50'
        : 'border-border bg-muted/40',
    )}
    aria-hidden
  />
)

export function PokedexCacheControls({ listLive, onListLiveChange }: PokedexCacheControlsProps) {
  const qc = useQueryClient()
  const [simFail, setSimFail] = useState(getSimulateTeamMutationFailure)

  return (
    <details
      className="rounded-lg border border-border/60 bg-card/25 px-3 py-2 text-sm text-muted-foreground"
      data-slot="cache-controls"
    >
      <summary className="cursor-pointer list-none text-foreground/90">
        <span className="text-xs font-medium">Extra options (for learning)</span>
        <span className="ml-1 text-xs text-muted-foreground">— optional</span>
      </summary>
      <div className="mt-3 flex flex-col gap-3 text-xs">
        <p className="m-0 leading-relaxed text-muted-foreground">
          There are <strong className="font-medium text-foreground/85">two lists/areas</strong>: the
          scrollable <strong className="font-medium text-foreground/85">Pokémon list on the left</strong> (the
          cards), and the <strong className="font-medium text-foreground/85">details panel on the right</strong>.
          The buttons below say which one they target.
        </p>

        <div>
          <p className="m-0 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/90">
            Toggle — stays on or off
          </p>
          <div className="flex flex-col gap-2 min-[400px]:flex-row min-[400px]:flex-wrap">
            <button
              type="button"
              role="button"
              aria-pressed={listLive}
              aria-label={
                listLive
                  ? 'Auto-refresh for the left Pokémon list is on, every 30 seconds'
                  : 'Auto-refresh for the left Pokémon list is off'
              }
              className={cn(togglePill(listLive))}
              onClick={() => onListLiveChange(!listLive)}
            >
              {toggleKnob(listLive)}
              <span className="min-w-0">
                {listLive
                  ? 'On: refresh the left-hand Pokémon list every 30s'
                  : 'Off: don’t auto-refresh the left-hand list'}
              </span>
            </button>
            <button
              type="button"
              role="button"
              aria-pressed={simFail}
              aria-label={
                simFail
                  ? 'Party save error demo is on'
                  : 'Party save error demo is off; saves behave normally'
              }
              className={cn(togglePill(simFail, true))}
              onClick={() => {
                const n = !simFail
                setSimFail(n)
                setSimulateTeamMutationFailure(n)
              }}
            >
              {toggleKnob(simFail, true)}
              <span className="min-w-0">
                {simFail
                  ? 'On: demo a failed “save my party” (for learning)'
                  : 'Off: saving your party works normally'}
              </span>
            </button>
          </div>
        </div>

        <div>
          <p className="m-0 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/90">
            One-time actions
          </p>
          <div className="flex flex-col gap-2 min-[400px]:flex-row min-[400px]:flex-wrap">
            <button
              type="button"
              className={actionBtn}
              onClick={() => {
                void qc.invalidateQueries({
                  queryKey: queryKeys.listInfinite(POKEDEX_PAGE_SIZE),
                  refetchType: 'active',
                })
              }}
            >
              Refresh the left-hand Pokémon list now
            </button>
            <button
              type="button"
              className={actionBtn}
              onClick={() => {
                void qc.resetQueries({
                  queryKey: queryKeys.listInfinite(POKEDEX_PAGE_SIZE),
                })
              }}
            >
              Clear cache for the left list, then reload
            </button>
            <button
              type="button"
              className={actionBtn}
              onClick={() => {
                void qc.invalidateQueries({
                  queryKey: ['pokemon', 'resource'],
                  refetchType: 'none',
                })
              }}
            >
              Mark the right-hand details as outdated
            </button>
          </div>
        </div>
      </div>
    </details>
  )
}
