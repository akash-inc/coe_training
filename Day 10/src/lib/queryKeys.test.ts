import { describe, expect, it, vi } from 'vitest'
import { taskKeys } from './queryKeys'

vi.mock('../api/unified', () => ({
  getWorkspaceId: () => '20000000-0000-4000-8000-000000000001',
}))

describe('taskKeys', () => {
  it('builds stable infinite key with workspace', () => {
    expect(taskKeys.infinite(8)).toEqual([
      'tasks',
      '20000000-0000-4000-8000-000000000001',
      'infinite',
      8,
    ])
  })
})
