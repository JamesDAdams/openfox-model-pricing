import type { ModelPricing, ModelPricingEntry } from './types.js'

export const DEFAULT_CATALOG: ModelPricingEntry[] = []

export function normalizeModelId(id: string): string {
  let cleaned = id.trim().toLowerCase()
  cleaned = cleaned.replace(/^(openai|anthropic|google|deepseek|mistralai|qwen|zhipu|meta-llama)\//i, '')
  cleaned = cleaned.replace(/-\d{4}-\d{2}-\d{2}$/, '')
  cleaned = cleaned.replace(/-\d{8}$/, '')
  cleaned = cleaned.replace(/@\d{8}$/, '')
  cleaned = cleaned.replace(/-(fast|thinking|latest|tiered)$/, '')
  return cleaned
}

export function matchModelPricing(
  modelId: string,
  _providerId?: string,
  userOverrides?: ModelPricing,
  catalog: ModelPricingEntry[] = DEFAULT_CATALOG,
): ModelPricing | undefined {
  if (userOverrides && Object.keys(userOverrides).length > 0) {
    return userOverrides
  }

  if (catalog.length > 0) {
    const normalized = normalizeModelId(modelId)
    for (const entry of catalog) {
      if (entry.patterns.some((p) => p.test(modelId) || p.test(normalized))) {
        return { ...entry.pricing }
      }
    }
  }

  return undefined
}
