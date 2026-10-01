import { describe, expect, it, vi } from 'vitest'
import { register } from './index.js'
import type { PluginRegistry } from './types.js'

describe('openfox-model-pricing plugin registration', () => {
  it('registers all contributions into PluginRegistry and updates rates via RPC', async () => {
    const registered: Record<string, unknown> = {}
    const rpcHandlers: Record<string, (params: any, context: any) => Promise<any>> = {}
    const hookHandlers: Record<string, (payload: any) => Promise<void> | void> = {}
    let registeredTool: any = null

    const fakeRegistry: PluginRegistry = {
      runtime: { mode: 'development', configDirectory: '/tmp/test-config-pricing' },
      context: {
        id: 'openfox-model-pricing',
        version: '2.0.0',
        runtime: { mode: 'development', configDirectory: '/tmp/test-config-pricing' },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        storage: { get: vi.fn(), set: vi.fn() },
        settings: vi.fn().mockReturnValue({}),
        notify: vi.fn(),
        publish: vi.fn(),
      },
      registerSettings: vi.fn((schema) => {
        registered['settings'] = schema
      }),
      registerModelMetadataProvider: vi.fn((provider) => {
        registered['metadataProvider'] = provider
      }),
      registerHook: vi.fn((event, handler) => {
        hookHandlers[event] = handler
      }),
      registerUiPanel: vi.fn((panel) => {
        registered['uiPanel'] = panel
      }),
      registerUiAction: vi.fn((action) => {
        registered['uiAction'] = action
      }),
      registerUiBadge: vi.fn((badge) => {
        registered['uiBadge'] = badge
      }),
      registerRpc: vi.fn((method, handler) => {
        rpcHandlers[method] = handler
      }),
      registerTool: vi.fn((tool) => {
        registeredTool = tool
      }),
      ...( {
        registerUiComponent: vi.fn((comp) => {
          registered['uiComponent'] = comp
        }),
      } as any ),
    }

    register(fakeRegistry)

    expect(registered['settings']).toBeDefined()
    expect(registered['metadataProvider']).toBeDefined()
    expect(registered['uiBadge']).toBeDefined()
    expect(registered['uiComponent']).toBeDefined()
    expect(hookHandlers['llm.completed']).toBeDefined()
    expect(rpcHandlers['pricing.getRates']).toBeDefined()
    expect(rpcHandlers['pricing.updateField']).toBeDefined()
    expect(rpcHandlers['pricing.getSessionCost']).toBeDefined()
    expect(registeredTool).toBeDefined()
    expect(registeredTool.name).toBe('get_model_pricing')

    // Test RPC pricing.updateField
    const updateRes = await rpcHandlers['pricing.updateField']!(
      { modelId: 'custom-model-test', fieldId: 'input-price', value: '1.25' },
      {},
    )
    expect(updateRes.success).toBe(true)
    expect(updateRes.pricing.input).toBe(1.25)

    // Test RPC pricing.getRates for custom updated model
    const rpcRates = await rpcHandlers['pricing.getRates']!({ modelId: 'custom-model-test' }, {})
    expect(rpcRates.pricing.input).toBe(1.25)

    // Test tool execution
    const toolRes = await registeredTool.execute({ modelId: 'custom-model-test' }, {})
    expect(toolRes.success).toBe(true)
    expect(toolRes.output).toContain('"input": 1.25')

    // Test hook + RPC getSessionCost
    hookHandlers['llm.completed']!({
      event: 'llm.completed',
      sessionId: 'session-rpc-test',
      timestamp: new Date().toISOString(),
      data: { model: 'custom-model-test', promptTokens: 100_000, completionTokens: 10_000 },
    })

    const rpcCost = await rpcHandlers['pricing.getSessionCost']!({}, { sessionId: 'session-rpc-test' })
    expect(rpcCost.cost.totalCost).toBeCloseTo(0.125, 6)
    expect(rpcCost.formattedCost).toBe('$0.125')
  })
})
