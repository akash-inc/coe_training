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

  it('O: creates an IntersectionObserver and starts observing sentinel', () => {
    render(
      <InfiniteScrollAnnouncer {...defaultProps}>
        <div>Results</div>
      </InfiniteScrollAnnouncer>,
    )

    expect(MockIntersectionObserver.instances).toHaveLength(1)
    const observer = MockIntersectionObserver.instances[0]
    expect(observer.observe).toHaveBeenCalledTimes(1)
  })
  it('M: calls onLoadMore when sentinel intersects and hasMore is true', () => {
    const onLoadMore = vi.fn()

    render(
      <InfiniteScrollAnnouncer {...defaultProps} onLoadMore={onLoadMore}>
        <div>Results</div>
      </InfiniteScrollAnnouncer>,
    )

    const observer = MockIntersectionObserver.instances[0]

    act(() => {
      observer.trigger([{ isIntersecting: true }])
    })

    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })

  it('B: does not load when hasMore is false', () => {
    const onLoadMore = vi.fn()

    render(
      <InfiniteScrollAnnouncer
        {...defaultProps}
        hasMore={false}
        onLoadMore={onLoadMore}
      >
        <div>Results</div>
      </InfiniteScrollAnnouncer>,
    )

    const observer = MockIntersectionObserver.instances[0]

    act(() => {
      observer.trigger([{ isIntersecting: true }])
    })

    expect(onLoadMore).not.toHaveBeenCalled()
  })

  it('B: does not load while isLoading is true', () => {
    const onLoadMore = vi.fn()

    render(
      <InfiniteScrollAnnouncer
        {...defaultProps}
        isLoading
        onLoadMore={onLoadMore}
      >
        <div>Results</div>
      </InfiniteScrollAnnouncer>,
    )

    const observer = MockIntersectionObserver.instances[0]

    act(() => {
      observer.trigger([{ isIntersecting: true }])
    })

    expect(onLoadMore).not.toHaveBeenCalled()
  })

  it('I: announces loading message when isLoading becomes true', () => {
    const { rerender } = render(
      <InfiniteScrollAnnouncer {...defaultProps} isLoading={false}>
        <div>Results</div>
      </InfiniteScrollAnnouncer>,
    )

    rerender(
      <InfiniteScrollAnnouncer {...defaultProps} isLoading>
        <div>Results</div>
      </InfiniteScrollAnnouncer>,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Loading more results...')
  })

  it('I: announces loaded message when loading finishes', () => {
    const { rerender } = render(
      <InfiniteScrollAnnouncer
        {...defaultProps}
        isLoading
        loadedAnnouncement=""
      >
        <div>Results</div>
      </InfiniteScrollAnnouncer>,
    )

    rerender(
      <InfiniteScrollAnnouncer
        {...defaultProps}
        isLoading={false}
        loadedAnnouncement="12 more results loaded."
      >
        <div>Results</div>
      </InfiniteScrollAnnouncer>,
    )

    expect(screen.getByRole('status')).toHaveTextContent('12 more results loaded.')
  })

  it('E: disconnects observer on unmount to avoid leaks', () => {
    const { unmount } = render(
      <InfiniteScrollAnnouncer {...defaultProps}>
        <div>Results</div>
      </InfiniteScrollAnnouncer>,
    )

    const observer = MockIntersectionObserver.instances[0]

    unmount()

    expect(observer.disconnect).toHaveBeenCalledTimes(1)
  })
})
