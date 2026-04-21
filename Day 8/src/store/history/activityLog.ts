import type { activityEntry } from "../../types/store"

export function appendActivityLog(log: readonly activityEntry[], entry: activityEntry): activityEntry[] {
  return [...log, entry].slice(-100)
}