import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import { CustomRateStore } from './rate-store.js'

describe('CustomRateStore', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rate-store-test-'))
  })

  afterEach(() => {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    } catch {
      // cleanup ignore
    }
  })

  it('updates valid price fields and persists them', () => {
    const store = new CustomRateStore(tmpDir)
    store.updateField('test-model', 'input-price', '2.5')
    store.updateField('test-model', 'output-price', '10')
    store.updateField('test-model', 'pricing-currency', 'EUR')

    const rates = store.get('test-model')
    expect(rates).toBeDefined()
    expect(rates?.input).toBe(2.5)
    expect(rates?.output).toBe(10)
    expect(rates?.currency).toBe('EUR')

    // Reload from new instance to verify file persistence
    const reloaded = new CustomRateStore(tmpDir)
    expect(reloaded.get('test-model')?.input).toBe(2.5)
  })

  it('rejects negative numeric values', () => {
    const store = new CustomRateStore(tmpDir)
    store.updateField('test-model', 'input-price', '-5')
    store.updateField('test-model', 'output-price', '-10')
    store.updateField('test-model', 'discount-percent', '-20%')

    expect(store.get('test-model')).toBeUndefined()
  })

  it('handles percentage stripping and discount range', () => {
    const store = new CustomRateStore(tmpDir)
    store.updateField('test-model', 'discount-percent', '50%')
    expect(store.get('test-model')?.discount).toBe(50)

    store.updateField('test-model', 'discount-percent', '150%')
    expect(store.get('test-model')?.discount).toBeUndefined()
  })

  it('prunes empty model entry when all fields are cleared', () => {
    const store = new CustomRateStore(tmpDir)
    store.updateField('test-model', 'input-price', '2.5')
    expect(store.get('test-model')).toBeDefined()

    // Clear input price
    store.updateField('test-model', 'input-price', '')
    expect(store.get('test-model')).toBeUndefined()
    expect(store.getAll()).toEqual({})
  })

  it('handles corrupt json gracefully without crashing', () => {
    fs.writeFileSync(path.join(tmpDir, 'rates.json'), 'not-valid-json{{{', 'utf8')
    const store = new CustomRateStore(tmpDir)
    expect(store.getAll()).toEqual({})
  })
})
