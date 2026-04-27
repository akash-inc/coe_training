import { useState } from 'react'
import { defaultFrontSpriteUrl } from '../../lib/pokeapi'
import { formatPokemonDisplayName } from '../../lib/pokeapi/formatPokemonDisplayName'
import { teamConstraints } from '../../lib/teamStorage'

type TeamStripProps = {
  teamIds: number[]
  nameById: Map<number, string>
  busy: boolean
  lastActionMessage?: string | null
}

function SlotSprite({ id, label }: { id: number; label: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-border bg-muted/30 text-xs text-muted-foreground"
        title={label}
      >
        ?
      </div>
    )
  }
  return (
    <img
      src={defaultFrontSpriteUrl(id)}
      alt=""
      width={56}
      height={56}
      className="h-14 w-14 object-contain [image-rendering:pixelated]"
      loading="lazy"
      decoding="async"
      title={label}
      onError={() => setFailed(true)}
    />
  )
}

function TeamSlot({
  id,
  displayName,
  filled,
}: {
  id: number | null
  displayName: string | null
  filled: boolean
}) {
  if (!filled || id == null) {
    return (
      <li
        className="flex w-[4.5rem] flex-col items-center gap-1.5"
        aria-label="Empty team slot"
      >
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-background/50 text-lg text-muted-foreground/50"
          aria-hidden
        >
          +
        </div>
        <span className="h-3 w-full text-center text-[10px] text-muted-foreground/70">—</span>
      </li>
    )
  }

  const label = displayName
    ? formatPokemonDisplayName(displayName)
    : `Pokémon #${id}`

  return (
    <li className="flex w-[4.5rem] flex-col items-center gap-1.5" title={label}>
      <div className="relative overflow-hidden rounded-2xl border-2 border-border bg-card p-0.5 shadow-sm ring-1 ring-border/40">
        <SlotSprite id={id} label={label} />
      </div>
      <span className="line-clamp-1 w-full text-center text-[10px] font-medium leading-tight text-foreground">
        {label}
      </span>
    </li>
  )
}

export function TeamStrip({ teamIds, nameById, busy, lastActionMessage }: TeamStripProps) {
  const slots: Array<{ id: number | null; name: string | null; filled: boolean }> = []
  for (let i = 0; i < teamConstraints.max; i += 1) {
    const id = teamIds[i] ?? null
    if (id != null) {
      const raw = nameById.get(id)
      slots.push({
        id,
        name: raw ?? null,
        filled: true,
      })
    } else {
      slots.push({ id: null, name: null, filled: false })
    }
  }

  const filled = teamIds.length

  return (
    <div
      className="rounded-xl border border-border/60 bg-gradient-to-b from-card/50 to-card/30 p-3 shadow-sm"
      data-slot="team-strip"
    >
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="m-0 text-sm font-semibold text-foreground">Your party</h3>
          <p className="m-0 text-xs text-muted-foreground">
            {filled === 0
              ? 'Add Pokémon from the left-hand list using the + on each card.'
              : filled < teamConstraints.max
                ? `${filled} of ${teamConstraints.max} — room for more.`
                : 'Party is full. Remove one on a card to swap.'}
          </p>
        </div>
        {busy ? (
          <span className="shrink-0 text-xs text-muted-foreground" aria-live="polite">
            Saving…
          </span>
        ) : null}
      </div>

      <ul
        className="m-0 flex list-none flex-wrap justify-center gap-2 p-0 sm:justify-start"
        aria-label={
          filled === 0
            ? 'Empty party, six slots'
            : `Your party, ${filled} of ${teamConstraints.max} filled`
        }
      >
        {slots.map((slot, i) => (
          <TeamSlot
            key={slot.filled && slot.id != null ? `p-${slot.id}` : `empty-${i}`}
            id={slot.id}
            displayName={slot.name}
            filled={slot.filled}
          />
        ))}
      </ul>

      {lastActionMessage ? (
        <p
          className="m-0 mt-3 border-t border-border/50 pt-2 text-xs leading-relaxed text-amber-800 dark:text-amber-200/90"
          role="status"
        >
          {lastActionMessage}
        </p>
      ) : null}
    </div>
  )
}
