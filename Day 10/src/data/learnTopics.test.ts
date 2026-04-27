import { describe, expect, it } from 'vitest'
import { learnTopics, type DemoFocus } from './learnTopics'

const FOCUS_SET = new Set<DemoFocus>([
  'header',
  'list',
  'detail',
  'cache',
  'banner',
  'optimistic',
  'prefetch',
  'background-refetch',
  'all',
  'none',
])

describe('learnTopics', () => {
  it('has unique slugs and valid focus for every entry', () => {
    const slugs = new Set<string>()
    for (const t of learnTopics) {
      expect(t.slug).toMatch(/^[a-z0-9-]+$/)
      expect(slugs.has(t.slug)).toBe(false)
      slugs.add(t.slug)
      expect(FOCUS_SET.has(t.focus)).toBe(true)
      expect(t.tryItIntro.length).toBeGreaterThan(0)
      expect(t.tryItSteps.length).toBeGreaterThanOrEqual(2)
    }
    expect(learnTopics.length).toBe(9)
  })
})
