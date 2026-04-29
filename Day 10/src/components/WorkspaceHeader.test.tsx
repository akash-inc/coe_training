import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { WorkspaceHeader } from './WorkspaceHeader'
import { renderWithProviders } from '../test/renderWithProviders'
import {
  makeUserProfile,
  makeWorkspaceSummary,
  makeWorkspaceStats,
} from '../test/fixtures'
import { getUserProfile, getWorkspace, getWorkspaceStats } from '../api/unified'

vi.mock('../api/unified', () => ({
  getWorkspaceId: () => '20000000-0000-4000-8000-000000000001',
  getUserProfile: vi.fn(),
  getWorkspace: vi.fn(),
  getWorkspaceStats: vi.fn(),
}))

describe('WorkspaceHeader', () => {
  beforeEach(() => {
    vi.mocked(getUserProfile).mockResolvedValue(makeUserProfile())
    vi.mocked(getWorkspace).mockResolvedValue(makeWorkspaceSummary())
    vi.mocked(getWorkspaceStats).mockResolvedValue(makeWorkspaceStats())
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    renderWithProviders(<WorkspaceHeader />)
    expect(screen.getByText('Loading workspace…')).toBeInTheDocument()
  })

  it('shows workspace name after data loads', async () => {
    renderWithProviders(<WorkspaceHeader />)
    await waitFor(() => {
      expect(screen.getByText('Test Workspace')).toBeInTheDocument()
    })
  })

  it('shows user displayName after data loads', async () => {
    renderWithProviders(<WorkspaceHeader />)
    await waitFor(() => {
      expect(screen.getByText('Alice Tester')).toBeInTheDocument()
    })
  })

  it('shows task counts in stat chips', async () => {
    renderWithProviders(<WorkspaceHeader />)
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })
  })

  it('shows error state when getUserProfile rejects', async () => {
    vi.mocked(getUserProfile).mockRejectedValue(new Error('Auth failed'))
    renderWithProviders(<WorkspaceHeader />)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/Auth failed/)).toBeInTheDocument()
    })
  })
})
