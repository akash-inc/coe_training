import { cn } from '../../lib/cn'

type TeamStripProps = {
  teamIds: number[]
  /** id → display name from loaded summaries (optional) */
  nameById: Map<number, string>
  busy: boolean
}

export function TeamStrip({ teamIds, nameById, busy }: TeamStripProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-card/30 px-3 py-2"
      data-slot="team-strip"
    >
      <span className="text-xs font-medium text-muted-foreground">Team (max 6)</span>
      {busy ? (
        <span className="text-xs text-muted-foreground">Saving…</span>
      ) : null}
      <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
        {teamIds.length === 0 ? (
          <li className="text-xs text-muted-foreground">Empty — use + Team on a card.</li>
        ) : (
          teamIds.map((id) => (
            <li
              key={id}
              className={cn(
                'rounded border border-border bg-background px-2 py-0.5 font-mono text-xs text-foreground',
              )}
            >
              #{String(id).padStart(3, '0')}{' '}
              <span className="capitalize">
                {nameById.get(id) ?? '—'}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
