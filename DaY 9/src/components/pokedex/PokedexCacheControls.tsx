import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { queryKeys } from '../../lib/queryKeys'
import { POKEDEX_PAGE_SIZE } from '../../lib/queryOptions'
import {
  getSimulateTeamMutationFailure,
  setSimulateTeamMutationFailure,
} from '../../hooks/useTeamToggle'
import { cn } from '../../lib/cn'

type PokedexCacheControlsProps = {
  listLive: boolean
  onListLiveChange: (on: boolean) => void
}

export function PokedexCacheControls({ listLive, onListLiveChange }: PokedexCacheControlsProps) {
  const qc = useQueryClient()
  const [simFail, setSimFail] = useState(getSimulateTeamMutationFailure)

  return (
    <div
      className="flex flex-col gap-2 rounded-lg border border-dashed border-border/80 bg-card/20 px-3 py-2 text-xs text-muted-foreground"
      data-slot="cache-controls"
    >
      <p className="m-0 font-medium text-foreground/90">Cache workshop</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={cn(
            'rounded border border-border px-2 py-1',
            listLive && 'border-accent text-foreground',
          )}
          onClick={() => onListLiveChange(!listLive)}
        >
          List live refetch (30s)
        </button>
        <button
          type="button"
          className="rounded border border-border px-2 py-1"
          onClick={() => {
            void qc.invalidateQueries({
              queryKey: queryKeys.listInfinite(POKEDEX_PAGE_SIZE),
              refetchType: 'active',
            })
          }}
        >
          Refetch active list
        </button>
        <button
          type="button"
          className="rounded border border-border px-2 py-1"
          onClick={() => {
            void qc.resetQueries({
              queryKey: queryKeys.listInfinite(POKEDEX_PAGE_SIZE),
            })
          }}
        >
          Reset list cache
        </button>
        <button
          type="button"
          className="rounded border border-border px-2 py-1"
          onClick={() => {
            void qc.invalidateQueries({
              queryKey: ['pokemon', 'resource'],
              refetchType: 'none',
            })
          }}
        >
          Mark detail queries stale (no refetch)
        </button>
        <button
          type="button"
          className={cn(
            'rounded border border-border px-2 py-1',
            simFail && 'border-destructive text-destructive',
          )}
          onClick={() => {
            const n = !simFail
            setSimFail(n)
            setSimulateTeamMutationFailure(n)
          }}
        >
          Simulate team save failure
        </button>
      </div>
    </div>
  )
}
