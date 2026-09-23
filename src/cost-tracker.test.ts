import { describe, expect, it, vi } from 'vitest'
import { SessionCostTracker } from './cost-tracker.js'
import { DEFAULT_SETTINGS } from './settings.js'

describe('SessionCostTracker', () => {
  it('accumulates LLM token completions and calculates total cost when model has pricing', () => {
    const publishMock = vi.fn()
    const tracker = new SessionCostTracker(() => DEFAULT_SETTINGS, publishMock, {
      get: (id: string) => {
        if (id === 'gpt-4o') return { input: 2.5, output: 10.0, currency: 'USD' }
        if (id === 'gpt-4o-mini') return { input: 0.15, output: 0.60, currency: 'USD' }
        return undefined
      },
    })

    // First call: 100k prompt tokens, 10k completion tokens on gpt-4o ($2.5 / $10) -> $0.35
    const res1 = tracker.recordCompletion({
      sessionId: 'session-1',
      data: {
        model: 'gpt-4o',
        promptTokens: 100_000,
        completionTokens: 10_000,
      },
    })
    expect(res1).toBeDefined()
    expect(res1?.totalCost).toBeCloseTo(0.35, 6)
    expect(res1?.callsCount).toBe(1)

    // Second call: 200k prompt tokens, 20k completion tokens on gpt-4o-mini ($0.15 / $0.60) -> 0.03 + 0.012 = 0.042
    const res2 = tracker.recordCompletion({
      sessionId: 'session-1',
      data: {
        model: 'gpt-4o-mini',
        promptTokens: 200_000,
        completionTokens: 20_000,
      },
    })
    expect(res2?.totalCost).toBeCloseTo(0.392, 6)
    expect(res2?.callsCount).toBe(2)
    expect(res2?.promptTokens).toBe(300_000)
    expect(res2?.completionTokens).toBe(30_000)

    // Check retrieval
    const retrieved = tracker.getSessionCost('session-1')
    expect(retrieved?.totalCost).toBeCloseTo(0.392, 6)

    // Check publish was called with formatted values
    expect(publishMock).toHaveBeenCalledWith('session-cost', 'totalCost', '$0.392')
    expect(publishMock).toHaveBeenCalledWith('session-cost', 'callsCount', 2)
  })

  it('ignores tracking if disabled in settings', () => {
    const tracker = new SessionCostTracker(() => ({
      ...DEFAULT_SETTINGS,
      trackSessionCost: false,
    }))

    const res = tracker.recordCompletion({
      sessionId: 'session-disabled',
      data: {
        model: 'gpt-4o',
        promptTokens: 100_000,
        completionTokens: 10_000,
      },
    })
    expect(res).toBeUndefined()
    expect(tracker.getSessionCost('session-disabled')).toBeUndefined()
  })

  it('clears session costs', () => {
    const tracker = new SessionCostTracker(() => DEFAULT_SETTINGS, undefined, {
      get: () => ({ input: 2.5, output: 10.0 }),
    })
    tracker.recordCompletion({
      sessionId: 'session-to-clear',
      data: { model: 'gpt-4o', promptTokens: 1000, completionTokens: 100 },
    })
    expect(tracker.getSessionCost('session-to-clear')).toBeDefined()
    tracker.clearSession('session-to-clear')
    expect(tracker.getSessionCost('session-to-clear')).toBeUndefined()
  })
})
