export function parseSampleRate(value, fallback = 0) {
  const parsed = Number.parseFloat(value)
  if (Number.isNaN(parsed)) {
    return fallback
  }
  return Math.min(1, Math.max(0, parsed))
}
