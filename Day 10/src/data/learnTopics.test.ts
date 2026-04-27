import { describe, expect, it } from 'vitest'
import { learnTopics } from './learnTopics'

describe('learnTopics', () => {
  it('has unique slugs and try-it copy for every entry', () => {
    const slugs = new Set<string>()
    for (const t of learnTopics) {
      expect(t.slug).toMatch(/^[a-z0-9-]+$/)
      expect(slugs.has(t.slug)).toBe(false)
      slugs.add(t.slug)
      expect(t.tryItIntro.length).toBeGreaterThan(0)
      expect(t.tryItSteps.length).toBeGreaterThanOrEqual(2)
    }
    expect(learnTopics.length).toBe(9)
  })
})
