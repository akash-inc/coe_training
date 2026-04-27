import { useQueryClient } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { queryKeys } from '../../lib/queryKeys'
import { POKEDEX_PAGE_SIZE } from '../../lib/queryOptions'
import { getSimulateTeamMutationFailure, setSimulateTeamMutationFailure } from '../../hooks/useTeamToggle'
import { cn } from '../../lib/cn'

type PokedexCacheControlsProps = {
  listLive: boolean
  onListLiveChange: (on: boolean) => void
}

const oneTimeActionClass =
  'pokedex-cache-action-btn relative rounded-lg border border-border bg-card px-3 py-2 text-left text-xs font-medium text-foreground transition-colors hover:bg-[color-mix(in_srgb,var(--border)_12%,var(--card-bg))] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40'

const toggleBase =
  'inline-flex min-h-[2.5rem] max-w-full items-center gap-2 rounded-full border-2 pl-1 pr-3 text-left text-xs font-medium transition-[color,background-color,border-color,box-shadow] duration-200 ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background'

/** Auto-refresh: on = green, off = red (both states are explicit). */
const toggleRefreshPill = (on: boolean) =>
  cn(
    toggleBase,
    on
      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-950 shadow-sm focus-visible:ring-emerald-500/45 dark:border-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-50'
      : 'border-rose-400 bg-rose-500/10 text-rose-950 focus-visible:ring-rose-400/40 dark:border-rose-500/50 dark:bg-rose-950/20 dark:text-rose-100',
  )

const knobRefresh = (on: boolean) => (
  <span
    className={cn(
      'inline-block h-4 w-4 shrink-0 rounded-full border-2',
      on
        ? 'border-emerald-600 bg-emerald-500/50 dark:border-emerald-300 dark:bg-emerald-400/50'
        : 'border-rose-500 bg-rose-400/40 dark:border-rose-400 dark:bg-rose-500/35',
    )}
    aria-hidden
  />
)

/** Demo-fail: on = red (bad), off = green (normal) — “safe” is green. */
const toggleDemoPill = (on: boolean) =>
  cn(
    toggleBase,
    on
      ? 'border-rose-600 bg-rose-500/15 text-rose-950 shadow-sm focus-visible:ring-rose-500/40 dark:border-rose-500 dark:bg-rose-950/25 dark:text-rose-100'
      : 'border-emerald-500 bg-emerald-500/10 text-emerald-950 focus-visible:ring-emerald-500/45 dark:border-emerald-400 dark:bg-emerald-500/15 dark:text-emerald-50',
  )

const knobDemo = (on: boolean) => (
  <span
    className={cn(
      'inline-block h-4 w-4 shrink-0 rounded-full border-2',
      on
        ? 'border-rose-600 bg-rose-500/50 dark:border-rose-400 dark:bg-rose-500/40'
        : 'border-emerald-600 bg-emerald-500/40 dark:border-emerald-300 dark:bg-emerald-400/45',
    )}
    aria-hidden
  />
)

function WaveActionButton({ onAction, children }: { onAction: () => void; children: ReactNode }) {
  const [wave, setWave] = useState(false)
  return (
    <button
      type="button"
      className={cn(oneTimeActionClass, wave && 'pokedex-cache-action-btn--wave')}
      onClick={() => {
        onAction()
        setWave(false)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setWave(true))
        })
      }}
      onAnimationEnd={() => setWave(false)}
    >
      {children}
    </button>
  )
}

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
          <p className="m-0 mb-2 text-[10px] text-muted-foreground/90">Green = good / on · Red = off (auto-refresh) or “demo error” (second toggle)</p>
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
              className={cn(toggleRefreshPill(listLive))}
              onClick={() => onListLiveChange(!listLive)}
            >
              {knobRefresh(listLive)}
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
              className={cn(toggleDemoPill(simFail))}
              onClick={() => {
                const n = !simFail
                setSimFail(n)
                setSimulateTeamMutationFailure(n)
              }}
            >
              {knobDemo(simFail)}
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
          <p className="m-0 mb-2 text-[10px] text-muted-foreground/90">Tap: emerald border rings pulse from the button edge</p>
          <div className="flex flex-col gap-2 min-[400px]:flex-row min-[400px]:flex-wrap">
            <WaveActionButton
              onAction={() => {
                void qc.invalidateQueries({
                  queryKey: queryKeys.listInfinite(POKEDEX_PAGE_SIZE),
                  refetchType: 'active',
                })
              }}
            >
              Refresh the left-hand Pokémon list now
            </WaveActionButton>
            <WaveActionButton
              onAction={() => {
                void qc.resetQueries({
                  queryKey: queryKeys.listInfinite(POKEDEX_PAGE_SIZE),
                })
              }}
            >
              Clear cache for the left list, then reload
            </WaveActionButton>
            <WaveActionButton
              onAction={() => {
                void qc.invalidateQueries({
                  queryKey: ['pokemon', 'resource'],
                  refetchType: 'none',
                })
              }}
            >
              Mark the right-hand details as outdated
            </WaveActionButton>
          </div>
        </div>
      </div>
    </details>
  )
}
