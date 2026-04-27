import { defaultFrontSpriteUrl, formatPokemonDisplayName } from '../../lib/pokeapi'
import { teamConstraints } from '../../lib/teamStorage'
import { cn } from '../../lib/cn'

export type BattleTeamTone = 'A' | 'B'

export type BattleTeamRowProps = {
  label: string
  tone: BattleTeamTone
  teamIds: number[]
  nameById: Map<number, string>
  onRemove: (slotIndex: number) => void
}

const toneClass: Record<BattleTeamTone, string> = {
  A: 'border-sky-500/50 bg-sky-500/5 dark:border-sky-400/40',
  B: 'border-rose-500/50 bg-rose-500/5 dark:border-rose-400/40',
}

export function BattleTeamRow({ label, tone, teamIds, nameById, onRemove }: BattleTeamRowProps) {
  return (
    <div className={cn('rounded-lg border p-2', toneClass[tone])}>
      <p className="m-0 mb-2 text-xs font-semibold text-foreground">{label}</p>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {Array.from({ length: teamConstraints.max }, (_, i) => {
          const id = teamIds[i]
          if (id == null) {
            return (
              <li key={`e-${i}`} className="flex w-14 flex-col items-center gap-0.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-dashed border-border/70 text-lg text-muted-foreground/50">
                  +
                </div>
                <span className="text-[10px] text-muted-foreground">—</span>
              </li>
            )
          }
          const raw = nameById.get(id)
          const display = raw ? formatPokemonDisplayName(raw) : `#${id}`
          return (
            <li key={`p-${id}-${i}`} className="flex w-14 flex-col items-center gap-0.5">
              <button
                type="button"
                className="group relative overflow-hidden rounded-lg border-2 border-border bg-card p-0.5"
                onClick={() => onRemove(i)}
                title="Remove from team"
                aria-label={`Remove ${display} from team`}
              >
                <img
                  src={defaultFrontSpriteUrl(id)}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 object-contain [image-rendering:pixelated]"
                />
                <span className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-background/80 to-transparent pb-0.5 text-[9px] font-medium text-foreground opacity-0 transition group-hover:opacity-100">
                  remove
                </span>
              </button>
              <span className="line-clamp-1 w-full text-center text-[10px] font-medium text-foreground">
                {display}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
