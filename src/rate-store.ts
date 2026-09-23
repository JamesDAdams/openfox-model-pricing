import * as fs from 'node:fs'
import * as path from 'node:path'
import type { ModelPricing } from './types.js'

export class CustomRateStore {
  private rates: Record<string, ModelPricing> = {}
  private readonly filePath: string

  constructor(storageDir: string) {
    this.filePath = path.join(storageDir, 'rates.json')
    this.load()
  }

  private load(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8')
        this.rates = JSON.parse(raw) as Record<string, ModelPricing>
      }
    } catch {
      this.rates = {}
    }
  }

  private save(): void {
    try {
      const dir = path.dirname(this.filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.rates, null, 2), 'utf8')
    } catch {
      // Ignore write errors in readonly environments
    }
  }

  get(modelId: string): ModelPricing | undefined {
    return this.rates[modelId]
  }

  getAll(): Record<string, ModelPricing> {
    return { ...this.rates }
  }

  updateField(modelId: string, fieldId: string, value: unknown): ModelPricing {
    const existing = this.rates[modelId] ?? {}
    const updated: ModelPricing = { ...existing, lastUpdatedAt: new Date().toISOString() }

    const strVal = String(value ?? '').trim()

    switch (fieldId) {
      case 'input-price': {
        const num = parseFloat(strVal)
        if (!isNaN(num) && num >= 0 && strVal !== '') updated.input = num
        else delete updated.input
        break
      }
      case 'output-price': {
        const num = parseFloat(strVal)
        if (!isNaN(num) && num >= 0 && strVal !== '') updated.output = num
        else delete updated.output
        break
      }
      case 'cache-read-price': {
        const num = parseFloat(strVal)
        if (!isNaN(num) && num >= 0 && strVal !== '') updated.cacheRead = num
        else delete updated.cacheRead
        break
      }
      case 'cache-write-price': {
        const num = parseFloat(strVal)
        if (!isNaN(num) && num >= 0 && strVal !== '') updated.cacheWrite = num
        else delete updated.cacheWrite
        break
      }
      case 'discount-percent': {
        const num = parseFloat(strVal.replace(/%$/, ''))
        if (!isNaN(num) && num >= 0 && num <= 100 && strVal !== '') updated.discount = num
        else if (strVal !== '' && !isNaN(num) && (num < 0 || num > 100)) delete updated.discount
        else if (strVal !== '') updated.discount = strVal
        else delete updated.discount
        break
      }
      case 'pricing-currency': {
        if (strVal) updated.currency = strVal
        else delete updated.currency
        break
      }
    }

    const hasPricingFields =
      updated.input !== undefined ||
      updated.output !== undefined ||
      updated.cacheRead !== undefined ||
      updated.cacheWrite !== undefined ||
      updated.discount !== undefined ||
      updated.currency !== undefined

    if (hasPricingFields) {
      this.rates[modelId] = updated
    } else {
      delete this.rates[modelId]
    }

    this.save()
    return hasPricingFields ? updated : {}
  }
}
