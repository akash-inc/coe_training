import { act, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { InfiniteScrollAnnouncer } from '../components/InfiniteScrollAnnouncer'

class MockIntersectionObserver {
  static instances = []

  constructor(callback, options = {}) {
    this.callback = callback
    this.options = options
    this.observe = vi.fn()
    this.unobserve = vi.fn()
    this.disconnect = vi.fn()
    MockIntersectionObserver.instances.push(this)
  }

  trigger(entries) {
    this.callback(entries, this)
  }
}

const defaultProps = {
  hasMore: true,
  isLoading: false,
  onLoadMore: vi.fn(),
  loadingAnnouncement: 'Loading more results...',
  loadedAnnouncement: '12 more results loaded.',
}

describe('InfiniteScrollAnnouncer', () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = []
    globalThis.IntersectionObserver = MockIntersectionObserver
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('Z: renders arbitrary children and a polite live region for announcements', () => {
    render(
      <InfiniteScrollAnnouncer {...defaultProps}>
        <article>Custom card content</article>
      </InfiniteScrollAnnouncer>,
    )

    expect(screen.getByText('Custom card content')).toBeInTheDocument()

    const liveRegion = screen.getByRole('status')
    expect(liveRegion).toHaveAttribute('aria-live', 'polite')
    expect(liveRegion).toHaveTextContent('')
  })

  it.todo('O: creates an IntersectionObserver and starts observing sentinel')
  it.todo('M: calls onLoadMore when sentinel intersects and hasMore is true')
  it.todo('B: does not load when hasMore is false')
  it.todo('B: does not load while isLoading is true')
  it.todo('I: announces loading message when isLoading becomes true')
  it.todo('I: announces loaded message when loading finishes')
  it.todo('E: disconnects observer on unmount to avoid leaks')
})
