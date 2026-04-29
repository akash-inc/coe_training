import { describe, expect, it, vi } from 'vitest'
import { taskKeys, userKeys, workspaceKeys } from './queryKeys'
import { TEST_WORKSPACE_ID } from '../test/fixtures'

vi.mock('../api/unified', () => ({
  getWorkspaceId: () => TEST_WORKSPACE_ID,
}))

const EXPLICIT_WS = 'aaaaaaaa-0000-4000-8000-000000000099'

describe('taskKeys', () => {
  describe('.all', () => {
    it('uses mocked workspace id by default', () => {
      expect(taskKeys.all()).toEqual(['tasks', TEST_WORKSPACE_ID])
    })

    it('uses provided workspaceId when given', () => {
      expect(taskKeys.all(EXPLICIT_WS)).toEqual(['tasks', EXPLICIT_WS])
    })
  })

  describe('.rootPrefix', () => {
    it('returns the same key shape as .all', () => {
      expect(taskKeys.rootPrefix()).toEqual(taskKeys.all())
      expect(taskKeys.rootPrefix(EXPLICIT_WS)).toEqual(taskKeys.all(EXPLICIT_WS))
    })
  })

  describe('.infinite', () => {
    it('builds stable infinite key with workspace', () => {
      expect(taskKeys.infinite(8)).toEqual(['tasks', TEST_WORKSPACE_ID, 'infinite', 8])
    })

    it('embeds pageSize in the key', () => {
      expect(taskKeys.infinite(20)).toEqual(['tasks', TEST_WORKSPACE_ID, 'infinite', 20])
      expect(taskKeys.infinite(5)).toEqual(['tasks', TEST_WORKSPACE_ID, 'infinite', 5])
    })

    it('accepts explicit workspaceId override', () => {
      expect(taskKeys.infinite(8, EXPLICIT_WS)).toEqual(['tasks', EXPLICIT_WS, 'infinite', 8])
    })
  })

  describe('.detail', () => {
    it('includes task id and workspace', () => {
      expect(taskKeys.detail('task-123')).toEqual(['tasks', TEST_WORKSPACE_ID, 'detail', 'task-123'])
    })

    it('accepts explicit workspaceId override', () => {
      expect(taskKeys.detail('task-123', EXPLICIT_WS)).toEqual(['tasks', EXPLICIT_WS, 'detail', 'task-123'])
    })
  })

  describe('.comments', () => {
    it('includes task id and workspace', () => {
      expect(taskKeys.comments('task-456')).toEqual(['tasks', TEST_WORKSPACE_ID, 'comments', 'task-456'])
    })

    it('accepts explicit workspaceId override', () => {
      expect(taskKeys.comments('task-456', EXPLICIT_WS)).toEqual(['tasks', EXPLICIT_WS, 'comments', 'task-456'])
    })
  })
})

describe('userKeys', () => {
  describe('.me', () => {
    it('returns stable key independent of workspace', () => {
      expect(userKeys.me()).toEqual(['user', 'me'])
    })
  })
})

describe('workspaceKeys', () => {
  describe('.summary', () => {
    it('includes the workspace id', () => {
      expect(workspaceKeys.summary(TEST_WORKSPACE_ID)).toEqual(['workspace', 'summary', TEST_WORKSPACE_ID])
    })
  })

  describe('.stats', () => {
    it('includes the workspace id', () => {
      expect(workspaceKeys.stats(TEST_WORKSPACE_ID)).toEqual(['workspace', 'stats', TEST_WORKSPACE_ID])
    })
  })
})
