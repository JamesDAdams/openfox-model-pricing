import { describe, expect, it } from 'vitest'
import {
  parseDiscount,
  calculateDiscountedRate,
  calculateTokenCost,
  formatPriceRate,
  formatCost,
  getCostTier,
  getThresholdsForCurrency,
} from './calculations.js'
import { DEFAULT_SETTINGS } from './settings.js'

describe('pricing calculations', () => {
  describe('parseDiscount', () => {
    it('parses numeric discounts', () => {
      expect(parseDiscount(50)).toBe(50)
      expect(parseDiscount(0)).toBeNull()
      expect(parseDiscount(150)).toBeNull()
    })

    it('parses string percentage discounts', () => {
      expect(parseDiscount('60%')).toBe(60)
      expect(parseDiscount('40% off')).toBe(40)
      expect(parseDiscount('30.5%')).toBe(30.5)
    })

    it('returns null for invalid or missing values', () => {
      expect(parseDiscount(undefined)).toBeNull()
      expect(parseDiscount('')).toBeNull()
      expect(parseDiscount('invalid')).toBeNull()
    })
  })

  describe('calculateDiscountedRate', () => {
    it('applies discount percentage correctly', () => {
      expect(calculateDiscountedRate(10.0, 50)).toBe(5.0)
      expect(calculateDiscountedRate(2.5, 20)).toBe(2.0)
      expect(calculateDiscountedRate(0.06, 60)).toBe(0.024)
    })
  })

  describe('calculateTokenCost', () => {
    it('calculates prompt and completion cost accurately', () => {
      const pricing = { input: 2.5, output: 10.0 }
      const usage = { promptTokens: 100_000, completionTokens: 10_000 }
      // (100k / 1M) * 2.5 = 0.25
      // (10k / 1M) * 10 = 0.10
      // Total = 0.35
      const cost = calculateTokenCost(usage, pricing)
      expect(cost).toBeCloseTo(0.35, 6)
    })

    it('applies discount to token cost calculation', () => {
      const pricing = { input: 1.0, output: 2.0, discount: 50 }
      const usage = { promptTokens: 1_000_000, completionTokens: 1_000_000 }
      // Discounted input = 0.5, discounted output = 1.0
      // Total = 1.5
      const cost = calculateTokenCost(usage, pricing)
      expect(cost).toBeCloseTo(1.5, 6)
    })

    it('includes cache read and write tokens', () => {
      const pricing = { input: 3.0, output: 15.0, cacheRead: 0.3, cacheWrite: 3.75 }
      const usage = {
        promptTokens: 10_000,
        completionTokens: 1_000,
        cacheReadTokens: 500_000,
        cacheWriteTokens: 100_000,
      }
      // prompt: 0.03
      // completion: 0.015
      // cacheRead: (500k/1M)*0.3 = 0.15
      // cacheWrite: (100k/1M)*3.75 = 0.375
      // Total = 0.57
      const cost = calculateTokenCost(usage, pricing)
      expect(cost).toBeCloseTo(0.57, 6)
    })

    it('returns 0 for zero-cost free models', () => {
      const pricing = { input: 0, output: 0 }
      const usage = { promptTokens: 500_000, completionTokens: 200_000 }
      expect(calculateTokenCost(usage, pricing)).toBe(0)
    })
  })

  describe('formatPriceRate', () => {
    it('formats integer and token rates without trailing .00', () => {
      expect(formatPriceRate(500, 'tokens')).toBe('500 tk / 1M')
      expect(formatPriceRate(2500, 'tokens')).toBe('2500 tk / 1M')
      expect(formatPriceRate(5, 'USD')).toBe('$5 / 1M')
      expect(formatPriceRate(2.5, 'USD')).toBe('$2.5 / 1M')
      expect(formatPriceRate(0.15, 'USD')).toBe('$0.15 / 1M')
      expect(formatPriceRate(0.075, 'USD')).toBe('$0.075 / 1M')
    })
  })

  describe('formatCost', () => {
    it('formats USD currency correctly', () => {
      expect(formatCost(0, 'USD')).toBe('$0.00')
      expect(formatCost(0.00005, 'USD')).toBe('< $0.0001')
      expect(formatCost(0.0051, 'USD')).toBe('$0.0051')
      expect(formatCost(1.23456, 'USD')).toBe('$1.235')
    })

    it('formats EUR and GBP currency', () => {
      expect(formatCost(1.5, 'EUR')).toBe('1.500 €')
      expect(formatCost(0.75, 'GBP')).toBe('£0.750')
    })
  })

  describe('getCostTier', () => {
    it('identifies free models', () => {
      expect(getCostTier({ input: 0, output: 0 })).toBe('free')
    })

    it('identifies eco models', () => {
      expect(getCostTier({ input: 0.15, output: 0.6 }, 0.5, 2.0)).toBe('low')
    })

    it('identifies medium / standard models', () => {
      expect(getCostTier({ input: 1.1, output: 4.4 }, 0.5, 2.0)).toBe('medium')
    })

    it('identifies premium models', () => {
      expect(getCostTier({ input: 3.0, output: 15.0 }, 0.5, 2.0)).toBe('high')
    })
  })

  describe('getThresholdsForCurrency', () => {
    it('returns USD thresholds by default', () => {
      const th = getThresholdsForCurrency(DEFAULT_SETTINGS, 'USD')
      expect(th.inputLow).toBe(0.5)
      expect(th.outputLow).toBe(1.5)
      expect(th.inputMed).toBe(2.0)
      expect(th.outputMed).toBe(6.0)
    })

    it('returns EUR thresholds when currency is EUR', () => {
      const settings = {
        ...DEFAULT_SETTINGS,
        inputLowThresholdEur: 0.4,
        outputLowThresholdEur: 1.2,
      }
      const th = getThresholdsForCurrency(settings, 'EUR')
      expect(th.inputLow).toBe(0.4)
      expect(th.outputLow).toBe(1.2)
    })

    it('returns Tokens thresholds when currency is TOKENS', () => {
      const settings = {
        ...DEFAULT_SETTINGS,
        inputLowThresholdTokens: 600,
        outputLowThresholdTokens: 1800,
      }
      const th = getThresholdsForCurrency(settings, 'tokens')
      expect(th.inputLow).toBe(600)
      expect(th.outputLow).toBe(1800)
    })
  })
})
