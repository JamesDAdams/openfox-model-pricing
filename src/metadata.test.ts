import { describe, expect, it } from 'vitest'
import { createModelMetadataProvider } from './metadata.js'
import { DEFAULT_SETTINGS } from './settings.js'

describe('metadata provider', () => {
  const provider = createModelMetadataProvider(() => ({
    ...DEFAULT_SETTINGS,
    showPopover: true,
    showPricesUnderModelNames: true,
    showModelPriceInBar: true,
    priceColorTiers: true,
    colorModelNameByOutputPrice: true,
  }))

  it('provides metadata when pricing is configured on model', async () => {
    const meta = await provider.getMetadata({
      providerId: 'openai-prod',
      modelId: 'gpt-4o',
      model: { name: 'GPT-4o', pricing: { input: 2.5, output: 10.0, currency: 'USD' } },
    })
    expect(meta).toBeDefined()
    expect(meta?.pricing?.input).toBe(2.5)
    expect(meta?.pricing?.output).toBe(10.0)
    expect(meta?.pricing?.currency).toBe('USD')

    // gpt-4o output is 10 > 6 -> danger tone (red)
    expect(meta?.nameTone).toBe('danger')

    // Popover contains title, rows, footer
    expect(meta?.popover).toBeDefined()
    expect(meta?.popover?.rows?.length).toBeGreaterThan(0)
    expect(meta?.popover?.rows?.[0]?.label.en).toBe('Input:')
    expect(meta?.popover?.rows?.[0]?.value).toContain('$2.5')

    // Subline contains In / Out rates
    expect(meta?.subline).toBeDefined()
    expect(meta?.subline?.[0]?.text).toContain('In: $2.5')
    expect(meta?.bottomSubline).toBeDefined()
    expect(meta?.bottomSubline?.[0]?.text).toContain('In: $2.5')

    // No Eco / Premium badges
    expect(meta?.badges).toBeUndefined()
  })

  it('provides success nameTone for cheap models', async () => {
    const meta = await provider.getMetadata({
      providerId: 'openai-prod',
      modelId: 'gpt-4o-mini',
      model: { pricing: { input: 0.15, output: 0.6 } },
    })
    // output 0.60 <= 1.5 -> success tone (green)
    expect(meta?.nameTone).toBe('success')
  })

  it('provides discount badge and popover strikeThrough for discounted models', async () => {
    const meta = await provider.getMetadata({
      providerId: 'zhipu-prod',
      modelId: 'glm-5.3-flash',
      model: { pricing: { input: 0.06, output: 0.2, discount: 60 } },
    })
    expect(meta?.pricing?.discountPercent).toBe(60)
    const discountBadge = meta?.badges?.find((b) => b.label.en === '60% off')
    expect(discountBadge).toBeDefined()
    expect(discountBadge?.tone).toBe('warning')

    // Popover shows original and discounted rates
    const inputRow = meta?.popover?.rows?.find((r) => r.label.en === 'Input:')
    expect(inputRow?.strikeThroughValue).toContain('$0.06')
    expect(inputRow?.value).toContain('$0.024')
  })

  it('provides free tone for free models', async () => {
    const meta = await provider.getMetadata({
      providerId: 'openrouter-free',
      modelId: 'meta-llama/llama-3.3-70b-instruct:free',
      model: { pricing: { input: 0, output: 0 } },
    })
    expect(meta?.pricing?.input).toBe(0)
    expect(meta?.nameTone).toBe('success')
  })

  it('hides subline when showPricesUnderModelNames is disabled', async () => {
    const customProvider = createModelMetadataProvider(() => ({
      ...DEFAULT_SETTINGS,
      showPricesUnderModelNames: false,
      showModelPriceInBar: true,
    }))
    const meta = await customProvider.getMetadata({
      providerId: 'openai-prod',
      modelId: 'gpt-4o',
      model: { name: 'GPT-4o', pricing: { input: 2.5, output: 10.0 } },
    })
    expect(meta?.subline).toBeUndefined()
    expect(meta?.bottomSubline).toBeDefined()
    expect(meta?.bottomSubline?.[0]?.text).toContain('In: $2.5')
  })

  it('returns empty array [] for bottomSubline when showModelPriceInBar is disabled', async () => {
    const customProvider = createModelMetadataProvider(() => ({
      ...DEFAULT_SETTINGS,
      showPricesUnderModelNames: true,
      showModelPriceInBar: false,
    }))
    const meta = await customProvider.getMetadata({
      providerId: 'openai-prod',
      modelId: 'gpt-4o',
      model: { name: 'GPT-4o', pricing: { input: 2.5, output: 10.0 } },
    })
    expect(meta?.subline).toBeDefined()
    expect(meta?.bottomSubline).toEqual([])
  })

  it('hides both subline and bottomSubline when both toggles are disabled', async () => {
    const customProvider = createModelMetadataProvider(() => ({
      ...DEFAULT_SETTINGS,
      showPricesUnderModelNames: false,
      showModelPriceInBar: false,
    }))
    const meta = await customProvider.getMetadata({
      providerId: 'openai-prod',
      modelId: 'gpt-4o',
      model: { name: 'GPT-4o', pricing: { input: 2.5, output: 10.0 } },
    })
    expect(meta?.subline).toBeUndefined()
    expect(meta?.bottomSubline).toEqual([])
  })

  it('returns undefined for models without pricing configured', async () => {
    const meta = await provider.getMetadata({
      providerId: 'custom-backend',
      modelId: 'unknown-local-model',
      model: {},
    })
    expect(meta).toBeUndefined()

    const unconfiguredGemini = await provider.getMetadata({
      providerId: 'google-ai',
      modelId: 'gemini-3.8-flash-tiered',
      model: {},
    })
    expect(unconfiguredGemini).toBeUndefined()
  })

  it('uses currency-specific thresholds for color tiers (EUR and Tokens)', async () => {
    const customProvider = createModelMetadataProvider(() => ({
      ...DEFAULT_SETTINGS,
      outputLowThresholdTokens: 1500,
      outputMedThresholdTokens: 6000,
      outputLowThresholdEur: 1.0,
      outputMedThresholdEur: 5.0,
    }))

    // Token model with output 2000 tk (between 1500 and 6000 -> warning)
    const tokenMeta = await customProvider.getMetadata({
      providerId: 'token-provider',
      modelId: 'token-model',
      model: { pricing: { input: 500, output: 2000, currency: 'TOKENS' } },
    })
    expect(tokenMeta?.nameTone).toBe('warning')
    expect(tokenMeta?.subline?.[0]?.text).toContain('500 tk / 1M')

    // EUR model with output 0.8 € (<= 1.0 -> success)
    const eurMeta = await customProvider.getMetadata({
      providerId: 'eur-provider',
      modelId: 'eur-model',
      model: { pricing: { input: 0.2, output: 0.8, currency: 'EUR' } },
    })
    expect(eurMeta?.nameTone).toBe('success')
    expect(eurMeta?.subline?.[0]?.text).toContain('0.2 € / 1M')
  })
})
