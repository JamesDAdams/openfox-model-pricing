import type { ModelPricing, PluginBadgeTone, PricingSettings } from './types.js'

export function parseDiscount(discount: number | string | undefined): number | null {
  if (discount === undefined || discount === null || discount === '') return null
  if (typeof discount === 'number') {
    return discount > 0 && discount <= 100 ? discount : null
  }
  const match = String(discount).match(/(\d+(?:\.\d+)?)/)
  if (!match || !match[1]) return null
  const num = parseFloat(match[1])
  return !isNaN(num) && num > 0 && num <= 100 ? num : null
}

export function calculateDiscountedRate(rate: number, discountPercent: number): number {
  const discounted = rate * (1 - discountPercent / 100)
  return Number(discounted.toPrecision(6))
}

export interface TokenUsage {
  promptTokens?: number
  completionTokens?: number
  cacheReadTokens?: number
  cacheWriteTokens?: number
}

export function calculateTokenCost(usage: TokenUsage, pricing: ModelPricing): number {
  const discountPercent = parseDiscount(pricing.discount)
  const promptTokens = usage.promptTokens ?? 0
  const completionTokens = usage.completionTokens ?? 0
  const cacheReadTokens = usage.cacheReadTokens ?? 0
  const cacheWriteTokens = usage.cacheWriteTokens ?? 0

  let cost = 0

  if (pricing.input !== undefined) {
    const rate = discountPercent !== null ? calculateDiscountedRate(pricing.input, discountPercent) : pricing.input
    cost += (promptTokens / 1_000_000) * rate
  }

  if (pricing.output !== undefined) {
    const rate = discountPercent !== null ? calculateDiscountedRate(pricing.output, discountPercent) : pricing.output
    cost += (completionTokens / 1_000_000) * rate
  }

  if (pricing.cacheRead !== undefined) {
    const rate = discountPercent !== null ? calculateDiscountedRate(pricing.cacheRead, discountPercent) : pricing.cacheRead
    cost += (cacheReadTokens / 1_000_000) * rate
  }

  if (pricing.cacheWrite !== undefined) {
    const rate = discountPercent !== null ? calculateDiscountedRate(pricing.cacheWrite, discountPercent) : pricing.cacheWrite
    cost += (cacheWriteTokens / 1_000_000) * rate
  }

  return Math.max(0, cost)
}

export function formatPriceRate(value: number, currency = 'USD', perMillion = true): string {
  const curr = currency.toUpperCase()
  const suffix = perMillion ? (curr === 'TOKENS' ? ' tk / 1M' : ' / 1M') : curr === 'TOKENS' ? ' tk' : ''
  let formatted: string
  if (Number.isInteger(value)) {
    formatted = String(value)
  } else if (value >= 1) {
    formatted = value.toFixed(2).replace(/\.00$/, '').replace(/(\.\d+?)0+$/, '$1')
  } else {
    formatted = value.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')
  }

  switch (curr) {
    case 'USD':
      return `$${formatted}${suffix}`
    case 'EUR':
      return `${formatted} €${suffix}`
    case 'GBP':
      return `£${formatted}${suffix}`
    case 'TOKENS':
      return `${formatted}${suffix}`
    default:
      return `${curr} ${formatted}${suffix}`
  }
}

export function getThresholdsForCurrency(
  settings: PricingSettings,
  currency: string = 'USD',
): {
  inputLow: number
  inputMed: number
  outputLow: number
  outputMed: number
  cacheReadLow: number
  cacheReadMed: number
  cacheWriteLow: number
  cacheWriteMed: number
} {
  const curr = (currency || 'USD').toUpperCase()
  if (curr === 'EUR') {
    return {
      inputLow: settings.inputLowThresholdEur ?? settings.inputLowThreshold,
      outputLow: settings.outputLowThresholdEur ?? settings.outputLowThreshold,
      inputMed: settings.inputMedThresholdEur ?? settings.inputMedThreshold,
      outputMed: settings.outputMedThresholdEur ?? settings.outputMedThreshold,
      cacheReadLow: settings.cacheReadLowThreshold,
      cacheReadMed: settings.cacheReadMedThreshold,
      cacheWriteLow: settings.cacheWriteLowThreshold,
      cacheWriteMed: settings.cacheWriteMedThreshold,
    }
  }
  if (curr === 'TOKENS') {
    return {
      inputLow: settings.inputLowThresholdTokens ?? (settings.inputLowThreshold * 1000),
      outputLow: settings.outputLowThresholdTokens ?? (settings.outputLowThreshold * 1000),
      inputMed: settings.inputMedThresholdTokens ?? (settings.inputMedThreshold * 1000),
      outputMed: settings.outputMedThresholdTokens ?? (settings.outputMedThreshold * 1000),
      cacheReadLow: settings.cacheReadLowThreshold * 1000,
      cacheReadMed: settings.cacheReadMedThreshold * 1000,
      cacheWriteLow: settings.cacheWriteLowThreshold * 1000,
      cacheWriteMed: settings.cacheWriteMedThreshold * 1000,
    }
  }
  return {
    inputLow: settings.inputLowThreshold,
    outputLow: settings.outputLowThreshold,
    inputMed: settings.inputMedThreshold,
    outputMed: settings.outputMedThreshold,
    cacheReadLow: settings.cacheReadLowThreshold,
    cacheReadMed: settings.cacheReadMedThreshold,
    cacheWriteLow: settings.cacheWriteLowThreshold,
    cacheWriteMed: settings.cacheWriteMedThreshold,
  }
}

export function getRateTier(rate: number, low = 0.5, med = 2.0): 'low' | 'medium' | 'high' {
  if (rate <= low) return 'low'
  if (rate <= med) return 'medium'
  return 'high'
}

export function tierToTone(tier: 'low' | 'medium' | 'high' | 'free'): PluginBadgeTone {
  switch (tier) {
    case 'free':
    case 'low':
      return 'success'
    case 'medium':
      return 'warning'
    case 'high':
      return 'danger'
  }
}

export function formatCost(cost: number | null | undefined, currency = 'USD'): string {
  if (cost === null || cost === undefined) return '0.00'
  const curr = currency.toUpperCase()
  const isFree = cost === 0

  if (isFree) {
    switch (curr) {
      case 'USD':
        return '$0.00'
      case 'EUR':
        return '0.00 €'
      case 'GBP':
        return '£0.00'
      case 'TOKENS':
        return '0.00 tk'
      default:
        return `${curr} 0.00`
    }
  }

  if (cost < 0.0001) {
    switch (curr) {
      case 'USD':
        return '< $0.0001'
      case 'EUR':
        return '< 0.0001 €'
      case 'GBP':
        return '< £0.0001'
      case 'TOKENS':
        return '< 0.0001 tk'
      default:
        return `< ${curr} 0.0001`
    }
  }

  const numStr = cost < 0.01 ? cost.toFixed(4) : cost.toFixed(3)

  switch (curr) {
    case 'USD':
      return `$${numStr}`
    case 'EUR':
      return `${numStr} €`
    case 'GBP':
      return `£${numStr}`
    case 'TOKENS':
      return `${numStr} tk`
    default:
      return `${curr} ${numStr}`
  }
}

export function getCostTier(
  pricing: ModelPricing,
  lowThreshold = 0.5,
  highThreshold = 2.0,
): 'free' | 'low' | 'medium' | 'high' {
  const discountPercent = parseDiscount(pricing.discount)
  const inputRate = pricing.input !== undefined
    ? (discountPercent !== null ? calculateDiscountedRate(pricing.input, discountPercent) : pricing.input)
    : undefined
  const outputRate = pricing.output !== undefined
    ? (discountPercent !== null ? calculateDiscountedRate(pricing.output, discountPercent) : pricing.output)
    : undefined

  if (inputRate === 0 && outputRate === 0) return 'free'
  const effectiveRate = inputRate ?? outputRate ?? 0

  if (effectiveRate <= lowThreshold) return 'low'
  if (effectiveRate <= highThreshold) return 'medium'
  return 'high'
}
