import { useCallback, useMemo } from 'react'
import { useTeamRoster } from '../../hooks/useTeamToggle'
import { defaultFrontSpriteUrl, formatPokemonDisplayName } from '../../lib/pokeapi'
import type { PokemonSummary } from '../../lib/pokeapi'
import { teamConstraints } from '../../lib/teamStorage'
import { useBattleStore } from '../../stores/battleStore'
import { cn } from '../../lib/cn'

type BattlePanelProps = {
  selected: PokemonSummary | null
  nameById: Map<number, string>
}

function BattleSlotRow({
  label,
  tone,
  teamIds,
  nameById,
  onRemove,
}: {
  label: string
  tone: 'A' | 'B'
  teamIds: number[]
  nameById: Map<number, string>
  onRemove: (slot: number) => void
}) {
  const border =
    tone === 'A'
      ? 'border-sky-500/50 bg-sky-500/5 dark:border-sky-400/40'
      : 'border-rose-500/50 bg-rose-500/5 dark:border-rose-400/40'
  return (
    <div className={cn('rounded-lg border p-2', border)}>
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

function HpBar({ current, max, tiny }: { current: number; max: number; tiny?: boolean }) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((100 * current) / max))
  return (
    <div
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-border/50', tiny && 'h-1')}
      title={`${current} / ${max} HP`}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width]',
          pct > 50 ? 'bg-emerald-500/90' : pct > 20 ? 'bg-amber-500/90' : 'bg-rose-500/90',
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function BattlePanel({ selected, nameById }: BattlePanelProps) {
  const { data: savedTeam = [] } = useTeamRoster()
  const partyAIds = useBattleStore((s) => s.partyAIds)
  const partyBIds = useBattleStore((s) => s.partyBIds)
  const turns = useBattleStore((s) => s.turns)
  const maxHpA = useBattleStore((s) => s.maxHpA)
  const maxHpB = useBattleStore((s) => s.maxHpB)
  const playhead = useBattleStore((s) => s.playhead)
  const status = useBattleStore((s) => s.status)
  const errorMessage = useBattleStore((s) => s.errorMessage)
  const addToParty = useBattleStore((s) => s.addToParty)
  const removeFromParty = useBattleStore((s) => s.removeFromParty)
  const clearParty = useBattleStore((s) => s.clearParty)
  const setTeamAFromIds = useBattleStore((s) => s.setTeamAFromIds)
  const setTeamBFromIds = useBattleStore((s) => s.setTeamBFromIds)
  const resetLog = useBattleStore((s) => s.resetLog)
  const runBattle = useBattleStore((s) => s.runBattle)
  const setPlayhead = useBattleStore((s) => s.setPlayhead)
  const step = useBattleStore((s) => s.step)
  const toStart = useBattleStore((s) => s.toStart)
  const toEnd = useBattleStore((s) => s.toEnd)

  const onAddA = useCallback(() => {
    if (selected) {
      addToParty('A', selected.id)
    }
  }, [addToParty, selected])

  const onAddB = useCallback(() => {
    if (selected) {
      addToParty('B', selected.id)
    }
  }, [addToParty, selected])

  const turnLen = turns?.length ?? 0
  const canRun = partyAIds.length > 0 && partyBIds.length > 0 && status !== 'running'
  const selectedLabel = selected
    ? formatPokemonDisplayName(selected.name)
    : null
  const addDisabled = !selected
  const partyFullA = partyAIds.length >= teamConstraints.max
  const partyFullB = partyBIds.length >= teamConstraints.max

  const { hpA, hpB } = useMemo(() => {
    if (!turns || playhead === 0) {
      if (!maxHpA || !maxHpB) {
        return { hpA: null as number[] | null, hpB: null as number[] | null }
      }
      return {
        hpA: maxHpA.map((m) => m),
        hpB: maxHpB.map((m) => m),
      }
    }
    const t = turns[playhead - 1]!
    return {
      hpA: t.hpAfterA,
      hpB: t.hpAfterB,
    }
  }, [turns, playhead, maxHpA, maxHpB])

  const showWinnerLine =
    turnLen > 0 && playhead === turnLen && (turns![turnLen - 1]!.winner !== null) ? turns![turnLen - 1]!.winner : null

  return (
    <div
      className="flex w-full min-w-0 flex-col gap-3 text-sm text-foreground"
      data-slot="battle-panel"
    >
      <p className="m-0 text-xs leading-relaxed text-muted-foreground">
        Simplified turn-based sim: each round the faster lead attacks first, then the other. Move names
        come from the PokéAPI; damage uses a small formula, not the real game. Pick Pokémon on the
        list on the left, then add them to team A (blue) or B (red).
      </p>

      <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
        <BattleSlotRow
          label="Team A"
          tone="A"
          teamIds={partyAIds}
          nameById={nameById}
          onRemove={(slot) => removeFromParty('A', slot)}
        />
        <BattleSlotRow
          label="Team B"
          tone="B"
          teamIds={partyBIds}
          nameById={nameById}
          onRemove={(slot) => removeFromParty('B', slot)}
        />
      </div>

      <div className="flex min-w-0 flex-col flex-wrap gap-2 min-[400px]:flex-row min-[400px]:items-center">
        <button
          type="button"
          className="rounded-md border border-sky-500/50 bg-sky-500/10 px-2.5 py-1.5 text-xs font-medium text-foreground"
          onClick={onAddA}
          disabled={addDisabled || partyFullA}
          title={selected ? `Add ${selectedLabel} to team A` : 'Select a Pokémon on the list first'}
        >
          {addDisabled
            ? 'Add selected to A'
            : partyFullA
              ? 'Team A is full'
              : `Add ${selectedLabel} to A`}
        </button>
        <button
          type="button"
          className="rounded-md border border-rose-500/50 bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-foreground"
          onClick={onAddB}
          disabled={addDisabled || partyFullB}
        >
          {addDisabled
            ? 'Add selected to B'
            : partyFullB
              ? 'Team B is full'
              : `Add ${selectedLabel} to B`}
        </button>
        <button
          type="button"
          className="rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground"
          onClick={() => setTeamAFromIds(savedTeam)}
          disabled={savedTeam.length === 0}
        >
          Copy saved party to A
        </button>
        <button
          type="button"
          className="rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground"
          onClick={() => setTeamBFromIds(savedTeam)}
          disabled={savedTeam.length === 0}
        >
          Copy saved party to B
        </button>
        <button
          type="button"
          className="rounded-md border border-border bg-muted/20 px-2.5 py-1.5 text-xs"
          onClick={() => {
            clearParty('A')
            clearParty('B')
            resetLog()
          }}
        >
          Clear both teams
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="rounded-md border border-border bg-foreground/10 px-3 py-2 text-xs font-semibold text-foreground"
          onClick={() => void runBattle()}
          disabled={!canRun}
        >
          {status === 'running' ? 'Simulating…' : 'Run simulation'}
        </button>
        {turnLen > 0 ? (
          <button type="button" className="text-xs text-muted-foreground underline" onClick={resetLog}>
            Clear battle log
          </button>
        ) : null}
      </div>

      {errorMessage ? (
        <p className="m-0 text-xs text-rose-700 dark:text-rose-200" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {turns && turnLen > 0 && maxHpA && maxHpB ? (
        <div className="rounded-md border border-border/60 bg-muted/10 p-2">
          <p className="m-0 mb-2 text-xs font-medium text-foreground">HP at this point in the log</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <p className="m-0 mb-1 text-[10px] text-sky-700 dark:text-sky-200">Team A</p>
              <ul className="m-0 space-y-0.5 p-0">
                {maxHpA.map((max, i) => {
                  const cur = hpA?.[i] ?? 0
                  if (i >= partyAIds.length) {
                    return null
                  }
                  return (
                    <li key={`hp-a-${i}`} className="text-[10px]">
                      <div className="mb-0.5 flex justify-between gap-1">
                        <span className="truncate">
                          {formatPokemonDisplayName(nameById.get(partyAIds[i] ?? 0) ?? '—')}
                        </span>
                        <span className="shrink-0 text-muted-foreground">
                          {cur} / {max}
                        </span>
                      </div>
                      <HpBar current={cur} max={max} tiny />
                    </li>
                  )
                })}
              </ul>
            </div>
            <div>
              <p className="m-0 mb-1 text-[10px] text-rose-700 dark:text-rose-200">Team B</p>
              <ul className="m-0 space-y-0.5 p-0">
                {maxHpB.map((max, i) => {
                  const cur = hpB?.[i] ?? 0
                  if (i >= partyBIds.length) {
                    return null
                  }
                  return (
                    <li key={`hp-b-${i}`} className="text-[10px]">
                      <div className="mb-0.5 flex justify-between gap-1">
                        <span className="truncate">
                          {formatPokemonDisplayName(nameById.get(partyBIds[i] ?? 0) ?? '—')}
                        </span>
                        <span className="shrink-0 text-muted-foreground">
                          {cur} / {max}
                        </span>
                      </div>
                      <HpBar current={cur} max={max} tiny />
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
          {showWinnerLine ? (
            <p className="m-0 mt-2 text-xs font-medium text-foreground" role="status">
              {showWinnerLine === 'A' ? 'Team A' : 'Team B'} wins
            </p>
          ) : null}
        </div>
      ) : null}

      {turns && turnLen > 0 ? (
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <p className="m-0 text-xs font-medium text-foreground">Turn timeline</p>
            <span className="text-[10px] text-muted-foreground">
              {playhead === 0
                ? 'Start'
                : playhead === turnLen
                  ? `End (${turnLen} moves)`
                  : `After turn ${playhead} of ${turnLen}`}
            </span>
          </div>
          <div className="mb-2 flex flex-wrap items-center gap-1">
            <button
              type="button"
              className="rounded border border-border bg-card px-2 py-0.5 text-xs"
              onClick={toStart}
              disabled={playhead === 0}
            >
              |◀
            </button>
            <button
              type="button"
              className="rounded border border-border bg-card px-2 py-0.5 text-xs"
              onClick={() => step(-1)}
              disabled={playhead === 0}
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded border border-border bg-card px-2 py-0.5 text-xs"
              onClick={() => step(1)}
              disabled={playhead >= turnLen}
            >
              Next
            </button>
            <button
              type="button"
              className="rounded border border-border bg-card px-2 py-0.5 text-xs"
              onClick={toEnd}
              disabled={playhead === turnLen}
            >
              ▶|
            </button>
          </div>
          <input
            type="range"
            className="mb-2 w-full"
            min={0}
            max={turnLen}
            value={playhead}
            onChange={(e) => setPlayhead(Number(e.target.value))}
            aria-label="Scrub through battle turns"
          />
          <ul className="m-0 max-h-56 list-none space-y-1 overflow-y-auto rounded border border-border/50 bg-card/20 p-2 text-xs" aria-label="Battle log">
            {turns.map((t, i) => {
              const isPast = i < playhead
              const isCurrent = i === playhead - 1
              const side = t.side === 'A' ? 'A' : 'B'
              return (
                <li
                  key={`${t.turnIndex}-${i}`}
                  className={cn(
                    'rounded border border-transparent px-1 py-0.5',
                    isPast && 'text-foreground/90',
                    !isPast && 'text-foreground/40',
                    isCurrent && 'border-border/80 bg-muted/30',
                  )}
                >
                  <span
                    className={cn('mr-1 font-mono text-[10px] text-muted-foreground', t.side === 'A' && 'text-sky-600 dark:text-sky-300', t.side === 'B' && 'text-rose-600 dark:text-rose-300')}
                  >
                    {side}
                  </span>
                  {formatPokemonDisplayName(t.actorName)} used <strong className="font-medium">{t.moveNameDisplay}</strong> on{' '}
                  {formatPokemonDisplayName(t.targetName)} for {t.damage} damage
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
