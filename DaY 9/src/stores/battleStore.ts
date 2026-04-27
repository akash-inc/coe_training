import { create } from 'zustand'
import { queryClient } from '../lib/queryClient'
import { teamConstraints } from '../lib/teamStorage'
import { pokemonResourceQuery } from '../lib/queryOptions'
import {
  fighterFromResource,
  hashSeed,
  simulateBattle,
  type BattleTurn,
} from '../lib/battle/simulateBattle'

export type BattleRunStatus = 'idle' | 'running' | 'done' | 'error'

type BattleState = {
  partyAIds: number[]
  partyBIds: number[]
  turns: BattleTurn[] | null
  /** Max HP per slot (set after a successful run) for display at playhead 0. */
  maxHpA: number[] | null
  maxHpB: number[] | null
  playhead: number
  status: BattleRunStatus
  errorMessage: string | null

  addToParty: (side: 'A' | 'B', id: number) => void
  removeFromParty: (side: 'A' | 'B', slotIndex: number) => void
  clearParty: (side: 'A' | 'B') => void
  setTeamAFromIds: (ids: number[]) => void
  setTeamBFromIds: (ids: number[]) => void
  resetLog: () => void
  setPlayhead: (n: number) => void
  step: (delta: -1 | 1) => void
  toStart: () => void
  toEnd: () => void
  runBattle: () => Promise<void>
}

function clampPlayhead(playhead: number, len: number): number {
  if (len <= 0) {
    return 0
  }
  return Math.max(0, Math.min(len, playhead))
}

export const useBattleStore = create<BattleState>((set, get) => ({
  partyAIds: [],
  partyBIds: [],
  turns: null,
  maxHpA: null,
  maxHpB: null,
  playhead: 0,
  status: 'idle',
  errorMessage: null,

  addToParty: (side, id) => {
    if (side === 'A') {
      const cur = get().partyAIds
      if (cur.length >= teamConstraints.max || cur.includes(id)) {
        return
      }
      set({ partyAIds: [...cur, id] })
    } else {
      const cur = get().partyBIds
      if (cur.length >= teamConstraints.max || cur.includes(id)) {
        return
      }
      set({ partyBIds: [...cur, id] })
    }
  },

  removeFromParty: (side, slotIndex) => {
    if (side === 'A') {
      set({ partyAIds: get().partyAIds.filter((_, i) => i !== slotIndex) })
    } else {
      set({ partyBIds: get().partyBIds.filter((_, i) => i !== slotIndex) })
    }
  },

  clearParty: (side) => {
    if (side === 'A') {
      set({ partyAIds: [] })
    } else {
      set({ partyBIds: [] })
    }
  },

  setTeamAFromIds: (ids) => {
    const next = ids.filter((x) => typeof x === 'number').slice(0, teamConstraints.max)
    set({ partyAIds: next })
  },

  setTeamBFromIds: (ids) => {
    const next = ids.filter((x) => typeof x === 'number').slice(0, teamConstraints.max)
    set({ partyBIds: next })
  },

  resetLog: () => {
    set({
      turns: null,
      maxHpA: null,
      maxHpB: null,
      playhead: 0,
      status: 'idle',
      errorMessage: null,
    })
  },

  setPlayhead: (n) => {
    const { turns } = get()
    const len = turns?.length ?? 0
    set({ playhead: clampPlayhead(n, len) })
  },

  step: (delta) => {
    const { turns, playhead } = get()
    const len = turns?.length ?? 0
    set({ playhead: clampPlayhead(playhead + delta, len) })
  },

  toStart: () => {
    set({ playhead: 0 })
  },

  toEnd: () => {
    const { turns } = get()
    const len = turns?.length ?? 0
    set({ playhead: len })
  },

  runBattle: async () => {
    const { partyAIds, partyBIds } = get()
    if (partyAIds.length === 0 || partyBIds.length === 0) {
      set({
        status: 'error',
        errorMessage: 'Add at least one Pokémon to team A and one to team B.',
        turns: null,
        maxHpA: null,
        maxHpB: null,
        playhead: 0,
      })
      return
    }

    set({ status: 'running', errorMessage: null })

    try {
      const fightersA = []
      for (const id of partyAIds) {
        const dto = await queryClient.ensureQueryData(pokemonResourceQuery(id))
        fightersA.push(fighterFromResource(dto))
      }
      const fightersB = []
      for (const id of partyBIds) {
        const dto = await queryClient.ensureQueryData(pokemonResourceQuery(id))
        fightersB.push(fighterFromResource(dto))
      }

      const seed = hashSeed(partyAIds, partyBIds)
      const result = simulateBattle(fightersA, fightersB, seed)
      set({
        turns: result,
        maxHpA: fightersA.map((f) => f.maxHp),
        maxHpB: fightersB.map((f) => f.maxHp),
        playhead: result.length,
        status: 'done',
        errorMessage: null,
      })
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : 'Something went wrong while loading Pokémon for the battle.'
      set({
        status: 'error',
        errorMessage: message,
        turns: null,
        maxHpA: null,
        maxHpB: null,
        playhead: 0,
      })
    }
  },
}))
