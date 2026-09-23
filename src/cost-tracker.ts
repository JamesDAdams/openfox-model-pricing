import type { SessionCostSummary, PricingSettings, ModelPricing } from './types.js'
import { matchModelPricing } from './catalog.js'
import { calculateTokenCost, formatCost } from './calculations.js'

export class SessionCostTracker {
  private readonly sessionCosts = new Map<string, SessionCostSummary>()

  constructor(
    private readonly getSettings: () => PricingSettings,
    private readonly publish?: (panelId: string | undefined, key: string, value: unknown) => void,
    private readonly rateStore?: { get(modelId: string): ModelPricing | undefined },
  ) {}

  recordCompletion(payload: {
    sessionId: string
    data: {
      model?: string
      providerId?: string
      promptTokens?: number
      completionTokens?: number
      cacheReadTokens?: number
      cacheWriteTokens?: number
      pricing?: ModelPricing
    }
  }): SessionCostSummary | undefined {
    const settings = this.getSettings()
    if (!settings.trackSessionCost) return undefined

    const { sessionId, data } = payload
    if (!sessionId || !data.model) return undefined

    const modelId = data.model
    const providerId = data.providerId
    const rawPricing = this.rateStore?.get(modelId) ?? data.pricing
    const pricing = matchModelPricing(modelId, providerId, rawPricing)
    if (!pricing) return undefined

    const promptTokens = data.promptTokens ?? 0
    const completionTokens = data.completionTokens ?? 0
    const cacheReadTokens = data.cacheReadTokens ?? 0
    const cacheWriteTokens = data.cacheWriteTokens ?? 0

    const callCost = calculateTokenCost(
      { promptTokens, completionTokens, cacheReadTokens, cacheWriteTokens },
      pricing,
    )

    const existing = this.sessionCosts.get(sessionId) ?? {
      sessionId,
      totalCost: 0,
      promptTokens: 0,
      completionTokens: 0,
      callsCount: 0,
      lastUpdated: new Date().toISOString(),
    }

    existing.totalCost += callCost
    existing.promptTokens += promptTokens
    existing.completionTokens += completionTokens
    existing.callsCount += 1
    existing.lastUpdated = new Date().toISOString()

    this.sessionCosts.set(sessionId, existing)

    // Publish state to UI panel / badge if available
    if (this.publish) {
      const formatted = formatCost(existing.totalCost, pricing.currency ?? 'USD')
      this.publish('session-cost', 'totalCost', formatted)
      this.publish('session-cost', 'promptTokens', existing.promptTokens)
      this.publish('session-cost', 'completionTokens', existing.completionTokens)
      this.publish('session-cost', 'callsCount', existing.callsCount)
    }

    return existing
  }

  getSessionCost(sessionId: string): SessionCostSummary | undefined {
    return this.sessionCosts.get(sessionId)
  }

  getAllCosts(): SessionCostSummary[] {
    return Array.from(this.sessionCosts.values())
  }

  clearSession(sessionId: string): void {
    this.sessionCosts.delete(sessionId)
  }
}
