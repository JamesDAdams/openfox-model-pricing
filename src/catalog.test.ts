import { describe, expect, it } from 'vitest'
import { matchModelPricing, normalizeModelId } from './catalog.js'

describe('catalog and model matcher', () => {
  it('normalizes model identifiers correctly', () => {
    expect(normalizeModelId('openai/gpt-4o-2024-08-06')).toBe('gpt-4o')
    expect(normalizeModelId('anthropic/claude-3-5-sonnet-20241022')).toBe('claude-3-5-sonnet')
    expect(normalizeModelId('deepseek/deepseek-chat-fast')).toBe('deepseek-chat')
    expect(normalizeModelId('google/gemini-2.0-flash-latest')).toBe('gemini-2.0-flash')
  })

  it('returns undefined when no user pricing is set and default catalog is empty', () => {
    expect(matchModelPricing('gpt-4o')).toBeUndefined()
    expect(matchModelPricing('gemini-3.8-flash-tiered')).toBeUndefined()
    expect(matchModelPricing('claude-3-5-sonnet')).toBeUndefined()
  })

  it('returns user pricing when provided', () => {
    const custom = matchModelPricing('gpt-4o', undefined, { input: 1.8, output: 5.0, discount: 20 })
    expect(custom?.input).toBe(1.8)
    expect(custom?.output).toBe(5.0)
    expect(custom?.discount).toBe(20)
  })

  it('returns custom overrides for any configured model', () => {
    const unknownWithOverride = matchModelPricing('my-custom-model', undefined, {
      input: 0.5,
      output: 1.0,
      currency: 'EUR',
    })
    expect(unknownWithOverride?.input).toBe(0.5)
    expect(unknownWithOverride?.output).toBe(1.0)
    expect(unknownWithOverride?.currency).toBe('EUR')
  })
})
