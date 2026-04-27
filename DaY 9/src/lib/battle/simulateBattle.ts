import type { PokemonResourceDto } from '../pokeapi/types'
import { statMap, uniqueSortedMoves } from '../pokeapi/queries'

/** Deterministic PRNG (mulberry32). */
export function hashSeed(partyA: number[], partyB: number[], salt = 0x2f8d9a1b): number {
  let s = (salt ^ partyA.length * 0x1f) >>> 0
  for (const id of partyA) {
    s = Math.imul(s ^ id, 0x7feb352d) >>> 0
  }
  s = (s ^ 0x6a09e667) >>> 0
  for (const id of partyB) {
    s = Math.imul(s ^ id, 0x7feb352d) >>> 0
  }
  return s >>> 0
}

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5) >>> 0
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const FALLBACK_MOVES = ['tackle', 'swift', 'quick-attack', 'hidden-power'] as const
const FALLBACK_MOVE_LEN = FALLBACK_MOVES.length

export type BattleFighter = {
  id: number
  name: string
  maxHp: number
  attack: number
  defense: number
  specialAttack: number
  specialDefense: number
  speed: number
  /** Exactly four move names (slug form from API). */
  moves: [string, string, string, string]
}

function statsByKey(stats: ReturnType<typeof statMap>): Record<string, number> {
  return Object.fromEntries(stats.map((s) => [s.key, s.base] as const))
}

export function fighterFromResource(dto: PokemonResourceDto): BattleFighter {
  const sm = statMap(dto.stats)
  const s = statsByKey(sm)
  const hp = Math.max(1, s.hp ?? 0)
  const rawMoves = uniqueSortedMoves(dto.moves)
  const moves: [string, string, string, string] = [0, 1, 2, 3].map(
    (i) => rawMoves[i] ?? FALLBACK_MOVES[i % FALLBACK_MOVE_LEN],
  ) as [string, string, string, string]
  return {
    id: dto.id,
    name: dto.name,
    maxHp: Math.max(20, hp * 2 + 20),
    attack: Math.max(1, s.attack ?? 0),
    defense: Math.max(1, s.defense ?? 0),
    specialAttack: Math.max(1, s['special-attack'] ?? 0),
    specialDefense: Math.max(1, s['special-defense'] ?? 0),
    speed: Math.max(1, s.speed ?? 0),
    moves,
  }
}

type TeamRuntime = { fighter: BattleFighter; currentHp: number }[]

function firstLivingIndex(team: TeamRuntime): number | null {
  for (let i = 0; i < team.length; i += 1) {
    if (team[i].currentHp > 0) {
      return i
    }
  }
  return null
}

function cloneHpLine(team: TeamRuntime): number[] {
  return team.map((t) => t.currentHp)
}

function displayMoveName(slug: string): string {
  return slug.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
}

export type BattleTurn = {
  turnIndex: number
  side: 'A' | 'B'
  actorName: string
  targetName: string
  moveName: string
  moveNameDisplay: string
  damage: number
  hpAfterA: number[]
  hpAfterB: number[]
  winner: 'A' | 'B' | null
}

/**
 * Simplified turn-based damage: not a real Pokémon game — uses base stats and move names for flavor only.
 */
function computeDamage(attacker: BattleFighter, defender: BattleFighter, rng: () => number): number {
  const usePhysical = rng() < 0.55
  const atk = usePhysical ? attacker.attack : attacker.specialAttack
  const def = usePhysical ? defender.defense : defender.specialDefense
  const power = 55 + Math.floor(rng() * 45)
  const variance = 0.85 + rng() * 0.15
  const level = 50
  const base = (2 * level) / 5 + 2
  const raw = (base * power * atk) / Math.max(1, def) / 50 + 2
  return Math.max(1, Math.floor(raw * variance))
}

export function simulateBattle(teamA: BattleFighter[], teamB: BattleFighter[], seed: number): BattleTurn[] {
  if (teamA.length === 0 || teamB.length === 0) {
    return []
  }

  const rng = mulberry32(seed)
  const a: TeamRuntime = teamA.map((f) => ({ fighter: f, currentHp: f.maxHp }))
  const b: TeamRuntime = teamB.map((f) => ({ fighter: f, currentHp: f.maxHp }))

  const out: BattleTurn[] = []
  let turnIndex = 0
  const maxRounds = 500

  for (let r = 0; r < maxRounds; r += 1) {
    const iA = firstLivingIndex(a)
    const iB = firstLivingIndex(b)
    if (iA === null) {
      if (out.length > 0) {
        out[out.length - 1] = { ...out[out.length - 1], winner: 'B' }
      }
      break
    }
    if (iB === null) {
      if (out.length > 0) {
        out[out.length - 1] = { ...out[out.length - 1], winner: 'A' }
      }
      break
    }

    const fA = a[iA]!.fighter
    const fB = b[iB]!.fighter
    const aFirst = fA.speed > fB.speed || (fA.speed === fB.speed && rng() < 0.5)

    const subOrder: Array<'A' | 'B'> = aFirst ? ['A', 'B'] : ['B', 'A']

    for (const first of subOrder) {
      const iAtk = first === 'A' ? firstLivingIndex(a) : firstLivingIndex(b)
      const iDef = first === 'A' ? firstLivingIndex(b) : firstLivingIndex(a)
      if (iAtk === null || iDef === null) {
        break
      }

      const attackerSlot = first === 'A' ? a : b
      const defenderSlot = first === 'A' ? b : a
      const atk = attackerSlot[iAtk]!
      const def = defenderSlot[iDef]!
      if (atk.currentHp <= 0) {
        continue
      }

      const moveIdx = Math.floor(rng() * 4) % 4
      const moveSlug = atk.fighter.moves[moveIdx]!
      const damage = computeDamage(atk.fighter, def.fighter, rng)
      def.currentHp = Math.max(0, def.currentHp - damage)

      const winA = firstLivingIndex(b) === null
      const winB = firstLivingIndex(a) === null
      const winner: 'A' | 'B' | null = winA ? 'A' : winB ? 'B' : null

      out.push({
        turnIndex,
        side: first,
        actorName: atk.fighter.name,
        targetName: def.fighter.name,
        moveName: moveSlug,
        moveNameDisplay: displayMoveName(moveSlug),
        damage: Math.round(damage),
        hpAfterA: cloneHpLine(a),
        hpAfterB: cloneHpLine(b),
        winner,
      })
      turnIndex += 1

      if (winner !== null) {
        return out
      }
    }
  }

  const lastA = firstLivingIndex(a) !== null
  const lastB = firstLivingIndex(b) !== null
  if (out.length > 0 && !lastA && !lastB) {
    return out
  }
  if (out.length > 0 && !lastA) {
    out[out.length - 1] = { ...out[out.length - 1], winner: 'B' }
  } else if (out.length > 0 && !lastB) {
    out[out.length - 1] = { ...out[out.length - 1], winner: 'A' }
  }
  return out
}
