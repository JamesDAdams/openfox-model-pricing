import { join } from 'node:path'
import type { PluginRegistry, PricingSettings } from './types.js'
import { SETTINGS_SCHEMA, resolveSettings } from './settings.js'
import { createModelMetadataProvider } from './metadata.js'
import { SessionCostTracker } from './cost-tracker.js'
import { matchModelPricing } from './catalog.js'
import { formatCost } from './calculations.js'
import { CustomRateStore } from './rate-store.js'

export * from './types.js'
export * from './catalog.js'
export * from './calculations.js'
export * from './metadata.js'
export * from './settings.js'
export * from './cost-tracker.js'
export * from './rate-store.js'

export function register(registry: PluginRegistry): void {
  const context = registry.context

  const getSettings = (): PricingSettings => {
    try {
      const stored = context?.settings ? context.settings() : {}
      return resolveSettings(stored as Record<string, unknown>)
    } catch {
      return resolveSettings()
    }
  }

  const storageDir = join(registry.runtime.configDirectory, 'plugins', 'openfox-model-pricing')
  const rateStore = new CustomRateStore(storageDir)

  // 1. Register Settings Schema
  if (typeof registry.registerSettings === 'function') {
    registry.registerSettings(SETTINGS_SCHEMA)
  }

  // 2. Register Model Metadata Provider
  if (typeof registry.registerModelMetadataProvider === 'function') {
    registry.registerModelMetadataProvider(createModelMetadataProvider(getSettings, rateStore))
  }

  // 3. Register Model Configuration Component in Provider Modal (Collapsible details style matching Advanced params)
  if (typeof (registry as any).registerUiComponent === 'function') {
    ;(registry as any).registerUiComponent({
      id: 'model-pricing-config-card',
      zone: 'provider.modal.model_config',
      position: 'inside',
      component: {
        type: 'details',
        title: { en: 'API Price & Discount (/ 1M tokens)', fr: 'Tarifs API et remises (/ 1M jetons)' },
        children: [
          {
            type: 'stack',
            direction: 'row',
            gap: 'sm',
            children: [
              {
                type: 'input',
                id: 'input-price',
                label: { en: 'Input price', fr: 'Prix d’entrée (Input)' },
                placeholder: { en: 'e.g. 0.15', fr: 'ex. 0.15' },
                inputType: 'number',
                onChange: { kind: 'rpc', method: 'pricing.updateField' },
                onBlur: { kind: 'rpc', method: 'pricing.updateField' },
              },
              {
                type: 'input',
                id: 'output-price',
                label: { en: 'Output price', fr: 'Prix de sortie (Output)' },
                placeholder: { en: 'e.g. 0.60', fr: 'ex. 0.60' },
                inputType: 'number',
                onChange: { kind: 'rpc', method: 'pricing.updateField' },
                onBlur: { kind: 'rpc', method: 'pricing.updateField' },
              },
            ],
          },
          {
            type: 'stack',
            direction: 'row',
            gap: 'sm',
            children: [
              {
                type: 'input',
                id: 'cache-read-price',
                label: { en: 'Cache read price', fr: 'Prix de lecture cache' },
                placeholder: { en: 'e.g. 0.075', fr: 'ex. 0.075' },
                inputType: 'number',
                onChange: { kind: 'rpc', method: 'pricing.updateField' },
                onBlur: { kind: 'rpc', method: 'pricing.updateField' },
              },
              {
                type: 'input',
                id: 'cache-write-price',
                label: { en: 'Cache write price', fr: 'Prix d’écriture cache' },
                placeholder: { en: 'e.g. 0.30', fr: 'ex. 0.30' },
                inputType: 'number',
                onChange: { kind: 'rpc', method: 'pricing.updateField' },
                onBlur: { kind: 'rpc', method: 'pricing.updateField' },
              },
            ],
          },
          {
            type: 'stack',
            direction: 'row',
            gap: 'sm',
            children: [
              {
                type: 'input',
                id: 'discount-percent',
                label: { en: 'Discount (%)', fr: 'Remise (%)' },
                placeholder: { en: 'e.g. 60', fr: 'ex. 60' },
                inputType: 'text',
                onChange: { kind: 'rpc', method: 'pricing.updateField' },
                onBlur: { kind: 'rpc', method: 'pricing.updateField' },
              },
              {
                type: 'select',
                id: 'pricing-currency',
                label: { en: 'Currency / Unit', fr: 'Devise / Unité' },
                defaultValue: 'USD',
                onChange: { kind: 'rpc', method: 'pricing.updateField' },
                onBlur: { kind: 'rpc', method: 'pricing.updateField' },
                options: [
                  { value: 'USD', label: { en: 'Dollar ($)', fr: 'Dollar ($)' } },
                  { value: 'EUR', label: { en: 'Euro (€)', fr: 'Euro (€)' } },
                  { value: 'tokens', label: { en: 'Tokens / Credits (tk)', fr: 'Jetons / Crédits (tk)' } },
                ],
              },
            ],
          },
        ],
      },
    })
  }

  // 4. Setup Cost Tracker
  const publish = context?.publish ? context.publish.bind(context) : undefined
  const costTracker = new SessionCostTracker(getSettings, publish, rateStore)

  // 5. Register Hook for LLM completion to track live token cost
  if (typeof registry.registerHook === 'function') {
    registry.registerHook('llm.completed', (payload) => {
      if (payload && payload.sessionId && payload.data) {
        costTracker.recordCompletion({
          sessionId: payload.sessionId,
          data: payload.data as {
            model?: string
            providerId?: string
            promptTokens?: number
            completionTokens?: number
          },
        })
      }
    })
  }

  // 6. Register UI Badge on session header
  if (typeof registry.registerUiBadge === 'function') {
    registry.registerUiBadge({
      id: 'session-cost-badge',
      slot: 'session.header.badges',
      label: { en: 'Cost', fr: 'Coût' },
      tone: 'info',
      tooltip: { en: 'Active session estimated token cost', fr: 'Coût estimé en jetons de la session active' },
      source: {
        kind: 'rpc',
        method: 'pricing.getSessionCost',
      },
    })
  }

  // 9. Register RPC Methods
  if (typeof registry.registerRpc === 'function') {
    registry.registerRpc('pricing.updateField', async (params) => {
      const modelId = typeof params?.['modelId'] === 'string' ? params['modelId'] : ''
      const fieldId = typeof params?.['fieldId'] === 'string' ? params['fieldId'] : ''
      const value = params?.['value']
      if (modelId && fieldId) {
        const updated = rateStore.updateField(modelId, fieldId, value)
        return { success: true, pricing: updated }
      }
      return { success: false, error: 'Missing modelId or fieldId' }
    })

    registry.registerRpc('pricing.getRates', async (params) => {
      const modelId = typeof params?.['modelId'] === 'string' ? params['modelId'] : ''
      const providerId = typeof params?.['providerId'] === 'string' ? params['providerId'] : undefined
      const customRate = rateStore.get(modelId)
      const pricing = matchModelPricing(modelId, providerId, customRate)
      return { pricing: pricing ?? null }
    })

    registry.registerRpc('pricing.getSessionCost', async (_params, context) => {
      const sessionId = (context?.['sessionId'] as string | undefined) ?? ''
      const cost = costTracker.getSessionCost(sessionId)
      const currency = 'USD'
      return {
        cost: cost ?? null,
        formattedCost: formatCost(cost?.totalCost, currency),
      }
    })
  }

  // 10. Register Tool for Assistant querying
  if (typeof registry.registerTool === 'function') {
    registry.registerTool({
      name: 'get_model_pricing',
      description: 'Get rate card pricing and promotional discount details for a given LLM model ID.',
      parameters: {
        type: 'object',
        properties: {
          modelId: {
            type: 'string',
            description: 'The model identifier to lookup (e.g. "gpt-4o", "claude-3-5-sonnet", "deepseek-r1").',
          },
        },
        required: ['modelId'],
      },
      execute: async (args) => {
        const modelId = String(args['modelId'] ?? '')
        const customRate = rateStore.get(modelId)
        const pricing = matchModelPricing(modelId, undefined, customRate)
        if (!pricing) {
          return { success: false, error: `No pricing rate card found for model '${modelId}'.` }
        }
        return {
          success: true,
          output: JSON.stringify(pricing, null, 2),
        }
      },
    })
  }
}
