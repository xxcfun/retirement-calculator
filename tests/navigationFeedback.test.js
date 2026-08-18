import { beforeEach, describe, expect, it, vi } from 'vitest'
import { beginNavigation, failNavigation, finishNavigation, navigationFeedback } from '../src/router/navigationFeedback'

describe('navigation feedback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    finishNavigation()
    navigationFeedback.error = ''
    navigationFeedback.stalled = false
  })

  it('finishes a normal navigation without leaving a blocking state', () => {
    const id = beginNavigation()
    expect(navigationFeedback.loading).toBe(true)
    finishNavigation(id)
    vi.advanceTimersByTime(9000)
    expect(navigationFeedback).toMatchObject({ loading: false, stalled: false, error: '' })
  })

  it('exposes a recovery action when navigation stalls', () => {
    beginNavigation(100)
    vi.advanceTimersByTime(101)
    expect(navigationFeedback.loading).toBe(false)
    expect(navigationFeedback.stalled).toBe(true)
    expect(navigationFeedback.error).toContain('刷新')
  })

  it('ignores stale navigation completion and reports current failures', () => {
    const staleId = beginNavigation()
    const currentId = beginNavigation()
    finishNavigation(staleId)
    expect(navigationFeedback.loading).toBe(true)
    failNavigation('加载失败', currentId)
    expect(navigationFeedback).toMatchObject({ loading: false, error: '加载失败' })
  })
})
