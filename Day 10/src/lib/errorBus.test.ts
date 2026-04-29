import { describe, expect, it, vi, afterEach } from 'vitest'
import { apiErrorBus } from './errorBus'

const cleanups: Array<() => void> = []

afterEach(() => {
  cleanups.forEach((fn) => fn())
  cleanups.length = 0
})

describe('apiErrorBus', () => {
  it('calls listener when an error is emitted', () => {
    const listener = vi.fn()
    cleanups.push(apiErrorBus.subscribe(listener))

    const err = new Error('something failed')
    apiErrorBus.emit(err)

    expect(listener).toHaveBeenCalledOnce()
    expect(listener).toHaveBeenCalledWith(err)
  })

  it('does not call listener after unsubscribe', () => {
    const listener = vi.fn()
    const unsub = apiErrorBus.subscribe(listener)
    unsub()

    apiErrorBus.emit(new Error('after unsub'))

    expect(listener).not.toHaveBeenCalled()
  })

  it('calls multiple listeners when multiple are subscribed', () => {
    const listenerA = vi.fn()
    const listenerB = vi.fn()
    cleanups.push(apiErrorBus.subscribe(listenerA))
    cleanups.push(apiErrorBus.subscribe(listenerB))

    const err = new Error('broadcast')
    apiErrorBus.emit(err)

    expect(listenerA).toHaveBeenCalledWith(err)
    expect(listenerB).toHaveBeenCalledWith(err)
  })

  it('does not throw when emitting with no listeners', () => {
    expect(() => apiErrorBus.emit(new Error('no listeners'))).not.toThrow()
  })

  it('supports multiple independent subscriptions from the same listener', () => {
    const listener = vi.fn()
    cleanups.push(apiErrorBus.subscribe(listener))
    cleanups.push(apiErrorBus.subscribe(listener))

    apiErrorBus.emit(new Error('duplicate sub'))

    expect(listener).toHaveBeenCalledTimes(1)
  })
})
