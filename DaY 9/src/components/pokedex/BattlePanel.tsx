import { useCallback, useEffect, useMemo } from 'react'
import { AnimatePresence, motion, useAnimation, useReducedMotion } from 'framer-motion'
import { HpBar } from '../atoms/HpBar'
import { BattlePlaybackControls } from '../molecules/BattlePlaybackControls'
import { BattleTeamRow } from '../molecules/BattleTeamRow'
import { BattleTurnLine } from '../molecules/BattleTurnLine'
import { useTeamRoster } from '../../hooks/useTeamToggle'
import { formatPokemonDisplayName } from '../../lib/pokeapi'
import type { PokemonSummary } from '../../lib/pokeapi'
import { teamConstraints } from '../../lib/teamStorage'
import { useBattleStore } from '../../stores/battleStore'

type BattlePanelProps = {
  selected: PokemonSummary | null
  nameById: Map<number, string>
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

  const reduced = useReducedMotion()
  const controlsA = useAnimation()
  const controlsB = useAnimation()

  useEffect(() => {
    if (reduced || playhead <= 0 || !turns) return
    const turn = turns[playhead - 1]
    if (!turn) return
    if (turn.side === 'A') {
      void controlsB.start({ x: [0, -8, 4, 0], transition: { duration: 0.25 } })
    } else {
      void controlsA.start({ x: [0, 8, -4, 0], transition: { duration: 0.25 } })
    }
  }, [playhead, turns, reduced, controlsA, controlsB])

  const introTransition = reduced
    ? { duration: 0 }
    : { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }

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

  const positionLabel =
    playhead === 0
      ? 'Start'
      : playhead === turnLen
        ? `End (${turnLen} moves)`
        : `After turn ${playhead} of ${turnLen}`

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
        <BattleTeamRow
          label="Team A"
          tone="A"
          teamIds={partyAIds}
          nameById={nameById}
          onRemove={(slot) => removeFromParty('A', slot)}
        />
        <BattleTeamRow
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

      <AnimatePresence>
        {turns && turnLen > 0 && maxHpA && maxHpB ? (
          <motion.div
            key="battle-result"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={introTransition}
            className="rounded-md border border-border/60 bg-muted/10 p-2"
          >
            <p className="m-0 mb-2 text-xs font-medium text-foreground">HP at this point in the log</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <motion.div animate={controlsA}>
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
              </motion.div>
              <motion.div animate={controlsB}>
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
              </motion.div>
            </div>
            {showWinnerLine ? (
              <p className="m-0 mt-2 text-xs font-medium text-foreground" role="status">
                {showWinnerLine === 'A' ? 'Team A' : 'Team B'} wins
              </p>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {turns && turnLen > 0 ? (
          <motion.div
            key="battle-log"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ ...introTransition, delay: reduced ? 0 : 0.06 }}
            className="min-w-0"
          >
            <BattlePlaybackControls
              playhead={playhead}
              turnLen={turnLen}
              onToStart={toStart}
              onStep={step}
              onToEnd={toEnd}
              onPlayheadChange={setPlayhead}
              positionLabel={positionLabel}
            />
            <ul
              className="m-0 max-h-56 list-none space-y-1 overflow-y-auto rounded border border-border/50 bg-card/20 p-2 text-xs"
              aria-label="Battle log"
            >
              {turns.map((t, i) => (
                <BattleTurnLine
                  key={`${t.turnIndex}-${i}`}
                  side={t.side}
                  actorName={t.actorName}
                  moveNameDisplay={t.moveNameDisplay}
                  targetName={t.targetName}
                  damage={t.damage}
                  dimmed={i >= playhead}
                  current={i === playhead - 1}
                />
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
