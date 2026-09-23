import type {
  PluginModelMetadataProvider,
  PluginModelMetadata,
  PluginModelPopoverRow,
  PluginModelSublineItem,
  PricingSettings,
  ModelPricing,
} from './types.js'
import { matchModelPricing } from './catalog.js'
import {
  parseDiscount,
  calculateDiscountedRate,
  formatPriceRate,
  getThresholdsForCurrency,
  getRateTier,
  tierToTone,
} from './calculations.js'
import type { CustomRateStore } from './rate-store.js'

export function createModelMetadataProvider(
  getSettings: () => PricingSettings,
  rateStore?: CustomRateStore,
): PluginModelMetadataProvider {
  return {
    id: 'openfox-model-pricing',
    getMetadata(context: { providerId: string; modelId: string; model: Record<string, unknown> }): PluginModelMetadata | undefined {
      const settings = getSettings()
      const rawUserPricing =
        (rateStore?.get(context.modelId) ??
        (context.model['pricing'] as ModelPricing | undefined))
      const matched = matchModelPricing(context.modelId, context.providerId, rawUserPricing)

      if (!matched) return undefined

      const discountPercent = parseDiscount(matched.discount) ?? undefined
      const currency = rawUserPricing?.currency || matched.currency || 'USD'
      const thresholds = getThresholdsForCurrency(settings, currency)
      const lastUpdatedAt = matched.lastUpdatedAt ?? new Date().toISOString().split('T')[0]
      const isFree = matched.input === 0 && matched.output === 0

      // 1. Model Name Tone (Color model name by output price)
      let nameTone: PluginModelMetadata['nameTone'] = undefined
      if (settings.priceColorTiers && settings.colorModelNameByOutputPrice) {
        if (isFree) {
          nameTone = 'success'
        } else if (matched.output !== undefined) {
          const effectiveOutput =
            discountPercent !== undefined
              ? calculateDiscountedRate(matched.output, discountPercent)
              : matched.output
          const tier = getRateTier(effectiveOutput, thresholds.outputLow, thresholds.outputMed)
          nameTone = tierToTone(tier)
        } else if (matched.input !== undefined) {
          const effectiveInput =
            discountPercent !== undefined
              ? calculateDiscountedRate(matched.input, discountPercent)
              : matched.input
          const tier = getRateTier(effectiveInput, thresholds.inputLow, thresholds.inputMed)
          nameTone = tierToTone(tier)
        }
      }

      // 2. Promotional Badges (ONLY discount or free - NO Eco/Premium tags)
      const badges: NonNullable<PluginModelMetadata['badges']> = []
      if (settings.showDiscountBadge && discountPercent && discountPercent > 0 && !isFree) {
        badges.push({
          label: { en: `${discountPercent}% off`, fr: `-${discountPercent}%` },
          tooltip: { en: `Promotional discount: ${discountPercent}%`, fr: `Remise promotionnelle : ${discountPercent}%` },
          tone: 'warning',
        })
      }

      // 3. Dropdown Subline Items (Under model name in dropdown list)
      const subline: PluginModelSublineItem[] = []
      if (settings.showPricesUnderModelNames) {
        if (settings.showInputPriceInList && matched.input !== undefined) {
          const effective = discountPercent ? calculateDiscountedRate(matched.input, discountPercent) : matched.input
          const tone = settings.priceColorTiers
            ? tierToTone(getRateTier(effective, thresholds.inputLow, thresholds.inputMed))
            : undefined
          subline.push({ text: `In: ${formatPriceRate(effective, currency)}`, tone })
        }
        if (settings.showOutputPriceInList && matched.output !== undefined) {
          const effective = discountPercent ? calculateDiscountedRate(matched.output, discountPercent) : matched.output
          const tone = settings.priceColorTiers
            ? tierToTone(getRateTier(effective, thresholds.outputLow, thresholds.outputMed))
            : undefined
          subline.push({ text: `Out: ${formatPriceRate(effective, currency)}`, tone })
        }
        if (settings.showCacheReadPriceInList && matched.cacheRead !== undefined) {
          const effective = discountPercent ? calculateDiscountedRate(matched.cacheRead, discountPercent) : matched.cacheRead
          const tone = settings.priceColorTiers
            ? tierToTone(getRateTier(effective, thresholds.cacheReadLow, thresholds.cacheReadMed))
            : undefined
          subline.push({ text: `Cache R: ${formatPriceRate(effective, currency)}`, tone })
        }
        if (settings.showCacheWritePriceInList && matched.cacheWrite !== undefined) {
          const effective = discountPercent ? calculateDiscountedRate(matched.cacheWrite, discountPercent) : matched.cacheWrite
          const tone = settings.priceColorTiers
            ? tierToTone(getRateTier(effective, thresholds.cacheWriteLow, thresholds.cacheWriteMed))
            : undefined
          subline.push({ text: `Cache W: ${formatPriceRate(effective, currency)}`, tone })
        }
      }

      // 4. Bottom Bar Subline Items (Under chat / active model in bottom bar)
      const bottomSubline: PluginModelSublineItem[] = []
      if (settings.showModelPriceInBar) {
        if (settings.showInputPriceInBar && matched.input !== undefined) {
          const effective = discountPercent ? calculateDiscountedRate(matched.input, discountPercent) : matched.input
          const tone = settings.priceColorTiers
            ? tierToTone(getRateTier(effective, thresholds.inputLow, thresholds.inputMed))
            : undefined
          bottomSubline.push({ text: `In: ${formatPriceRate(effective, currency)}`, tone })
        }
        if (settings.showOutputPriceInBar && matched.output !== undefined) {
          const effective = discountPercent ? calculateDiscountedRate(matched.output, discountPercent) : matched.output
          const tone = settings.priceColorTiers
            ? tierToTone(getRateTier(effective, thresholds.outputLow, thresholds.outputMed))
            : undefined
          bottomSubline.push({ text: `Out: ${formatPriceRate(effective, currency)}`, tone })
        }
        if (settings.showCacheReadPriceInBar && matched.cacheRead !== undefined) {
          const effective = discountPercent ? calculateDiscountedRate(matched.cacheRead, discountPercent) : matched.cacheRead
          const tone = settings.priceColorTiers
            ? tierToTone(getRateTier(effective, thresholds.cacheReadLow, thresholds.cacheReadMed))
            : undefined
          bottomSubline.push({ text: `Cache R: ${formatPriceRate(effective, currency)}`, tone })
        }
        if (settings.showCacheWritePriceInBar && matched.cacheWrite !== undefined) {
          const effective = discountPercent ? calculateDiscountedRate(matched.cacheWrite, discountPercent) : matched.cacheWrite
          const tone = settings.priceColorTiers
            ? tierToTone(getRateTier(effective, thresholds.cacheWriteLow, thresholds.cacheWriteMed))
            : undefined
          bottomSubline.push({ text: `Cache W: ${formatPriceRate(effective, currency)}`, tone })
        }
      }

      // 5. Hover Popover View (Image 3 layout)
      let popover: PluginModelMetadata['popover'] = undefined
      if (settings.showPopover) {
        const rows: PluginModelPopoverRow[] = []

        if (matched.input !== undefined) {
          const effective = discountPercent ? calculateDiscountedRate(matched.input, discountPercent) : matched.input
          const tone = tierToTone(getRateTier(effective, thresholds.inputLow, thresholds.inputMed))
          rows.push({
            label: { en: 'Input:', fr: 'Entrée :' },
            value: formatPriceRate(effective, currency),
            strikeThroughValue: discountPercent ? formatPriceRate(matched.input, currency) : undefined,
            tone,
          })
        }

        if (matched.output !== undefined) {
          const effective = discountPercent ? calculateDiscountedRate(matched.output, discountPercent) : matched.output
          const tone = tierToTone(getRateTier(effective, thresholds.outputLow, thresholds.outputMed))
          rows.push({
            label: { en: 'Output:', fr: 'Sortie :' },
            value: formatPriceRate(effective, currency),
            strikeThroughValue: discountPercent ? formatPriceRate(matched.output, currency) : undefined,
            tone,
          })
        }

        if (matched.cacheRead !== undefined) {
          const effective = discountPercent ? calculateDiscountedRate(matched.cacheRead, discountPercent) : matched.cacheRead
          const tone = tierToTone(getRateTier(effective, thresholds.cacheReadLow, thresholds.cacheReadMed))
          rows.push({
            label: { en: 'Cache read:', fr: 'Lecture cache :' },
            value: formatPriceRate(effective, currency),
            strikeThroughValue: discountPercent ? formatPriceRate(matched.cacheRead, currency) : undefined,
            tone,
          })
        }

        if (matched.cacheWrite !== undefined) {
          const effective = discountPercent ? calculateDiscountedRate(matched.cacheWrite, discountPercent) : matched.cacheWrite
          const tone = tierToTone(getRateTier(effective, thresholds.cacheWriteLow, thresholds.cacheWriteMed))
          rows.push({
            label: { en: 'Cache write:', fr: 'Écriture cache :' },
            value: formatPriceRate(effective, currency),
            strikeThroughValue: discountPercent ? formatPriceRate(matched.cacheWrite, currency) : undefined,
            tone,
          })
        }

        const modelName = String(context.model['name'] ?? context.modelId)
        popover = {
          title: { en: modelName, fr: modelName },
          badge: discountPercent
            ? {
                label: { en: `${discountPercent}% off`, fr: `-${discountPercent}%` },
                tone: 'warning',
              }
            : undefined,
          rows,
          footer: {
            en: `Updated: ${lastUpdatedAt}`,
            fr: `Mis à jour : ${lastUpdatedAt}`,
          },
        }
      }

      return {
        pricing: {
          input: matched.input,
          output: matched.output,
          cacheRead: matched.cacheRead,
          cacheWrite: matched.cacheWrite,
          currency,
          discountPercent,
          lastUpdatedAt,
        },
        nameTone,
        popover,
        subline: subline.length > 0 ? subline : undefined,
        bottomSubline: settings.showModelPriceInBar && bottomSubline.length > 0 ? bottomSubline : [],
        badges: badges.length > 0 ? badges : undefined,
      }
    },
  }
}
