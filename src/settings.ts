import type { PluginSettingsSchema, PricingSettings } from './types.js'

export const DEFAULT_SETTINGS: PricingSettings = {
  showPopover: true,
  showPricesUnderModelNames: true,
  showInputPriceInList: true,
  showOutputPriceInList: true,
  showCacheReadPriceInList: true,
  showCacheWritePriceInList: true,
  showModelPriceInBar: true,
  showInputPriceInBar: true,
  showOutputPriceInBar: true,
  showCacheReadPriceInBar: true,
  showCacheWritePriceInBar: true,
  priceColorTiers: true,
  colorModelNameByOutputPrice: true,
  showDiscountBadge: true,
  inputLowThreshold: 0.5,
  inputMedThreshold: 2.0,
  outputLowThreshold: 1.5,
  outputMedThreshold: 6.0,
  inputLowThresholdEur: 0.5,
  inputMedThresholdEur: 2.0,
  outputLowThresholdEur: 1.5,
  outputMedThresholdEur: 6.0,
  inputLowThresholdTokens: 500,
  inputMedThresholdTokens: 2000,
  outputLowThresholdTokens: 1500,
  outputMedThresholdTokens: 6000,
  cacheReadLowThreshold: 0.1,
  cacheReadMedThreshold: 0.5,
  cacheWriteLowThreshold: 0.5,
  cacheWriteMedThreshold: 2.0,
  trackSessionCost: true,
}

export const SETTINGS_SCHEMA: PluginSettingsSchema = {
  fields: [
    {
      key: 'showPopover',
      type: 'boolean',
      label: { en: 'Show pricing hover popover', fr: 'Afficher l’infobulle de tarification au survol' },
      description: {
        en: 'Display detailed pricing card tooltip when hovering over a model row.',
        fr: 'Affiche une carte détaillée des tarifs lors du survol d’une ligne de modèle.',
      },
      default: true,
    },
    {
      key: 'showPricesUnderModelNames',
      type: 'boolean',
      label: {
        en: 'Show prices under model names',
        fr: 'Afficher les prix sous les noms de modèles',
      },
      description: {
        en: 'Display configured rates and discounts below model names in the selector and lists.',
        fr: 'Affiche les tarifs et remises configurés sous les noms de modèles dans le sélecteur et les listes.',
      },
      default: true,
    },
    {
      key: 'showInputPriceInList',
      type: 'boolean',
      parentKey: 'showPricesUnderModelNames',
      label: { en: 'Input price in list', fr: 'Prix d’entrée dans la liste' },
      description: { en: 'Show input token rate in the model selector list', fr: 'Afficher le tarif d’entrée dans la liste' },
      default: true,
    },
    {
      key: 'showOutputPriceInList',
      type: 'boolean',
      parentKey: 'showPricesUnderModelNames',
      label: { en: 'Output price in list', fr: 'Prix de sortie dans la liste' },
      description: { en: 'Show output token rate in the model selector list', fr: 'Afficher le tarif de sortie dans la liste' },
      default: true,
    },
    {
      key: 'showCacheReadPriceInList',
      type: 'boolean',
      parentKey: 'showPricesUnderModelNames',
      label: { en: 'Cache read price in list', fr: 'Prix lecture cache dans la liste' },
      description: { en: 'Show cache read rate in the model selector list', fr: 'Afficher le tarif de lecture cache dans la liste' },
      default: true,
    },
    {
      key: 'showCacheWritePriceInList',
      type: 'boolean',
      parentKey: 'showPricesUnderModelNames',
      label: { en: 'Cache write price in list', fr: 'Prix écriture cache dans la liste' },
      description: { en: 'Show cache write rate in the model selector list', fr: 'Afficher le tarif d’écriture cache dans la liste' },
      default: true,
    },
    {
      key: 'showModelPriceInBar',
      type: 'boolean',
      label: {
        en: 'Show model price in bottom bar',
        fr: 'Afficher le prix du modèle dans la barre inférieure',
      },
      description: {
        en: 'Display rates of the active model in the bottom provider/model indicator.',
        fr: 'Affiche les tarifs du modèle actif dans l’indicateur en bas d’écran.',
      },
      default: true,
    },
    {
      key: 'showInputPriceInBar',
      type: 'boolean',
      parentKey: 'showModelPriceInBar',
      label: { en: 'Input price in bar', fr: 'Prix d’entrée dans la barre' },
      description: {
        en: 'Show active model input token rate in the bottom bar',
        fr: 'Affiche le tarif des jetons d’entrée dans la barre inférieure',
      },
      default: true,
    },
    {
      key: 'showOutputPriceInBar',
      type: 'boolean',
      parentKey: 'showModelPriceInBar',
      label: { en: 'Output price in bar', fr: 'Prix de sortie dans la barre' },
      description: {
        en: 'Show active model output token rate in the bottom bar',
        fr: 'Affiche le tarif des jetons de sortie dans la barre inférieure',
      },
      default: true,
    },
    {
      key: 'showCacheReadPriceInBar',
      type: 'boolean',
      parentKey: 'showModelPriceInBar',
      label: { en: 'Cache read price in bar', fr: 'Prix de lecture cache dans la barre' },
      description: {
        en: 'Show active model cache read rate in the bottom bar',
        fr: 'Affiche le tarif de lecture cache dans la barre inférieure',
      },
      default: true,
    },
    {
      key: 'showCacheWritePriceInBar',
      type: 'boolean',
      parentKey: 'showModelPriceInBar',
      label: { en: 'Cache write price in bar', fr: 'Prix d’écriture cache dans la barre' },
      description: {
        en: 'Show active model cache write rate in the bottom bar',
        fr: 'Affiche le tarif d’écriture cache dans la barre inférieure',
      },
      default: true,
    },
    {
      key: 'priceColorTiers',
      type: 'boolean',
      label: { en: 'Price color tiers (Low / Medium / High)', fr: 'Paliers de couleur des prix (Bas / Moyen / Élevé)' },
      description: {
        en: 'Color-code price rates based on configured thresholds (green/yellow/red).',
        fr: 'Colore les tarifs selon les seuils configurés (vert/jaune/rouge).',
      },
      default: true,
    },
    {
      key: 'colorModelNameByOutputPrice',
      type: 'boolean',
      parentKey: 'priceColorTiers',
      label: { en: 'Color model name by output price', fr: 'Colorer le nom du modèle selon le prix de sortie' },
      description: {
        en: 'Display model names in color tier of output price (green/yellow/red).',
        fr: 'Affiche les noms des modèles avec la couleur correspondant au palier de prix de sortie (vert/jaune/rouge).',
      },
      default: true,
    },
    {
      key: 'showDiscountBadge',
      type: 'boolean',
      label: { en: 'Show Discount Badges', fr: 'Afficher les badges de remise' },
      description: {
        en: 'Display a promotional discount badge on discounted models (e.g. "60% off").',
        fr: 'Afficher un badge de remise sur les modèles en promotion (ex. « -60% »).',
      },
      default: true,
    },
    {
      key: 'trackSessionCost',
      type: 'boolean',
      label: { en: 'Track Session Cost', fr: 'Suivre le coût des sessions' },
      description: {
        en: 'Calculate accumulated token costs per session and expose cost summary badges and panels.',
        fr: 'Calculer le coût cumulé en jetons par session et afficher les badges et volets récapitulatifs.',
      },
      default: true,
    },
    // USD ($) Section
    {
      key: 'inputLowThreshold',
      type: 'number',
      section: { en: 'USD ($) Thresholds', fr: 'Seuils Dollar ($)' },
      width: 'half',
      label: { en: 'Input Low (≤)', fr: 'Seuil Bas Entrée (≤)' },
      description: { en: 'Max input price rate for Low/Green tier ($)', fr: 'Tarif maximal d’entrée pour le palier Bas/Vert ($)' },
      default: 0.5,
    },
    {
      key: 'outputLowThreshold',
      type: 'number',
      width: 'half',
      label: { en: 'Output Low (≤)', fr: 'Seuil Bas Sortie (≤)' },
      description: { en: 'Max output price rate for Low/Green tier ($)', fr: 'Tarif maximal de sortie pour le palier Bas/Vert ($)' },
      default: 1.5,
    },
    {
      key: 'inputMedThreshold',
      type: 'number',
      width: 'half',
      label: { en: 'Input Medium (≤)', fr: 'Seuil Moyen Entrée (≤)' },
      description: { en: 'Max input price rate for Medium/Yellow tier ($)', fr: 'Tarif maximal d’entrée pour le palier Moyen/Jaune ($)' },
      default: 2.0,
    },
    {
      key: 'outputMedThreshold',
      type: 'number',
      width: 'half',
      label: { en: 'Output Medium (≤)', fr: 'Seuil Moyen Sortie (≤)' },
      description: { en: 'Max output price rate for Medium/Yellow tier ($)', fr: 'Tarif maximal de sortie pour le palier Moyen/Jaune ($)' },
      default: 6.0,
    },
    // EUR (€) Section
    {
      key: 'inputLowThresholdEur',
      type: 'number',
      section: { en: 'EUR (€) Thresholds', fr: 'Seuils Euro (€)' },
      width: 'half',
      label: { en: 'Input Low (≤)', fr: 'Seuil Bas Entrée (≤)' },
      description: { en: 'Max input price rate for Low/Green tier (€)', fr: 'Tarif maximal d’entrée pour le palier Bas/Vert (€)' },
      default: 0.5,
    },
    {
      key: 'outputLowThresholdEur',
      type: 'number',
      width: 'half',
      label: { en: 'Output Low (≤)', fr: 'Seuil Bas Sortie (≤)' },
      description: { en: 'Max output price rate for Low/Green tier (€)', fr: 'Tarif maximal de sortie pour le palier Bas/Vert (€)' },
      default: 1.5,
    },
    {
      key: 'inputMedThresholdEur',
      type: 'number',
      width: 'half',
      label: { en: 'Input Medium (≤)', fr: 'Seuil Moyen Entrée (≤)' },
      description: { en: 'Max input price rate for Medium/Yellow tier (€)', fr: 'Tarif maximal d’entrée pour le palier Moyen/Jaune (€)' },
      default: 2.0,
    },
    {
      key: 'outputMedThresholdEur',
      type: 'number',
      width: 'half',
      label: { en: 'Output Medium (≤)', fr: 'Seuil Moyen Sortie (≤)' },
      description: { en: 'Max output price rate for Medium/Yellow tier (€)', fr: 'Tarif maximal de sortie pour le palier Moyen/Jaune (€)' },
      default: 6.0,
    },
    // Tokens (tk) Section
    {
      key: 'inputLowThresholdTokens',
      type: 'number',
      section: { en: 'Token (tk) Thresholds', fr: 'Seuils Jetons (tk)' },
      width: 'half',
      label: { en: 'Input Low (≤)', fr: 'Seuil Bas Entrée (≤)' },
      description: { en: 'Max input token rate for Low/Green tier (tk)', fr: 'Tarif maximal d’entrée pour le palier Bas/Vert (tk)' },
      default: 500,
    },
    {
      key: 'outputLowThresholdTokens',
      type: 'number',
      width: 'half',
      label: { en: 'Output Low (≤)', fr: 'Seuil Bas Sortie (≤)' },
      description: { en: 'Max output token rate for Low/Green tier (tk)', fr: 'Tarif maximal de sortie pour le palier Bas/Vert (tk)' },
      default: 1500,
    },
    {
      key: 'inputMedThresholdTokens',
      type: 'number',
      width: 'half',
      label: { en: 'Input Medium (≤)', fr: 'Seuil Moyen Entrée (≤)' },
      description: { en: 'Max input token rate for Medium/Yellow tier (tk)', fr: 'Tarif maximal d’entrée pour le palier Moyen/Jaune (tk)' },
      default: 2000,
    },
    {
      key: 'outputMedThresholdTokens',
      type: 'number',
      width: 'half',
      label: { en: 'Output Medium (≤)', fr: 'Seuil Moyen Sortie (≤)' },
      description: { en: 'Max output token rate for Medium/Yellow tier (tk)', fr: 'Tarif maximal de sortie pour le palier Moyen/Jaune (tk)' },
      default: 6000,
    },
  ],
}

export function resolveSettings(stored?: Record<string, unknown>): PricingSettings {
  if (!stored) return { ...DEFAULT_SETTINGS }

  const showPopover = typeof stored['showPopover'] === 'boolean' ? stored['showPopover'] : DEFAULT_SETTINGS.showPopover
  const showPricesUnderModelNames =
    typeof stored['showPricesUnderModelNames'] === 'boolean'
      ? stored['showPricesUnderModelNames']
      : typeof stored['showSublineInDropdown'] === 'boolean'
        ? stored['showSublineInDropdown']
        : DEFAULT_SETTINGS.showPricesUnderModelNames
  const showInputPriceInList =
    typeof stored['showInputPriceInList'] === 'boolean'
      ? stored['showInputPriceInList']
      : DEFAULT_SETTINGS.showInputPriceInList
  const showOutputPriceInList =
    typeof stored['showOutputPriceInList'] === 'boolean'
      ? stored['showOutputPriceInList']
      : DEFAULT_SETTINGS.showOutputPriceInList
  const showCacheReadPriceInList =
    typeof stored['showCacheReadPriceInList'] === 'boolean'
      ? stored['showCacheReadPriceInList']
      : DEFAULT_SETTINGS.showCacheReadPriceInList
  const showCacheWritePriceInList =
    typeof stored['showCacheWritePriceInList'] === 'boolean'
      ? stored['showCacheWritePriceInList']
      : DEFAULT_SETTINGS.showCacheWritePriceInList

  const showModelPriceInBar =
    typeof stored['showModelPriceInBar'] === 'boolean'
      ? stored['showModelPriceInBar']
      : typeof stored['showSublineInBottomBar'] === 'boolean'
        ? stored['showSublineInBottomBar']
        : DEFAULT_SETTINGS.showModelPriceInBar
  const showInputPriceInBar =
    typeof stored['showInputPriceInBar'] === 'boolean'
      ? stored['showInputPriceInBar']
      : DEFAULT_SETTINGS.showInputPriceInBar
  const showOutputPriceInBar =
    typeof stored['showOutputPriceInBar'] === 'boolean'
      ? stored['showOutputPriceInBar']
      : DEFAULT_SETTINGS.showOutputPriceInBar
  const showCacheReadPriceInBar =
    typeof stored['showCacheReadPriceInBar'] === 'boolean'
      ? stored['showCacheReadPriceInBar']
      : DEFAULT_SETTINGS.showCacheReadPriceInBar
  const showCacheWritePriceInBar =
    typeof stored['showCacheWritePriceInBar'] === 'boolean'
      ? stored['showCacheWritePriceInBar']
      : DEFAULT_SETTINGS.showCacheWritePriceInBar

  const priceColorTiers =
    typeof stored['priceColorTiers'] === 'boolean' ? stored['priceColorTiers'] : DEFAULT_SETTINGS.priceColorTiers
  const colorModelNameByOutputPrice =
    typeof stored['colorModelNameByOutputPrice'] === 'boolean'
      ? stored['colorModelNameByOutputPrice']
      : DEFAULT_SETTINGS.colorModelNameByOutputPrice
  const showDiscountBadge =
    typeof stored['showDiscountBadge'] === 'boolean'
      ? stored['showDiscountBadge']
      : DEFAULT_SETTINGS.showDiscountBadge

  const inputLowThreshold =
    typeof stored['inputLowThreshold'] === 'number' && !isNaN(stored['inputLowThreshold'])
      ? stored['inputLowThreshold']
      : DEFAULT_SETTINGS.inputLowThreshold
  const inputMedThreshold =
    typeof stored['inputMedThreshold'] === 'number' && !isNaN(stored['inputMedThreshold'])
      ? stored['inputMedThreshold']
      : DEFAULT_SETTINGS.inputMedThreshold
  const outputLowThreshold =
    typeof stored['outputLowThreshold'] === 'number' && !isNaN(stored['outputLowThreshold'])
      ? stored['outputLowThreshold']
      : DEFAULT_SETTINGS.outputLowThreshold
  const outputMedThreshold =
    typeof stored['outputMedThreshold'] === 'number' && !isNaN(stored['outputMedThreshold'])
      ? stored['outputMedThreshold']
      : DEFAULT_SETTINGS.outputMedThreshold

  const inputLowThresholdEur =
    typeof stored['inputLowThresholdEur'] === 'number' && !isNaN(stored['inputLowThresholdEur'])
      ? stored['inputLowThresholdEur']
      : DEFAULT_SETTINGS.inputLowThresholdEur
  const inputMedThresholdEur =
    typeof stored['inputMedThresholdEur'] === 'number' && !isNaN(stored['inputMedThresholdEur'])
      ? stored['inputMedThresholdEur']
      : DEFAULT_SETTINGS.inputMedThresholdEur
  const outputLowThresholdEur =
    typeof stored['outputLowThresholdEur'] === 'number' && !isNaN(stored['outputLowThresholdEur'])
      ? stored['outputLowThresholdEur']
      : DEFAULT_SETTINGS.outputLowThresholdEur
  const outputMedThresholdEur =
    typeof stored['outputMedThresholdEur'] === 'number' && !isNaN(stored['outputMedThresholdEur'])
      ? stored['outputMedThresholdEur']
      : DEFAULT_SETTINGS.outputMedThresholdEur

  const inputLowThresholdTokens =
    typeof stored['inputLowThresholdTokens'] === 'number' && !isNaN(stored['inputLowThresholdTokens'])
      ? stored['inputLowThresholdTokens']
      : DEFAULT_SETTINGS.inputLowThresholdTokens
  const inputMedThresholdTokens =
    typeof stored['inputMedThresholdTokens'] === 'number' && !isNaN(stored['inputMedThresholdTokens'])
      ? stored['inputMedThresholdTokens']
      : DEFAULT_SETTINGS.inputMedThresholdTokens
  const outputLowThresholdTokens =
    typeof stored['outputLowThresholdTokens'] === 'number' && !isNaN(stored['outputLowThresholdTokens'])
      ? stored['outputLowThresholdTokens']
      : DEFAULT_SETTINGS.outputLowThresholdTokens
  const outputMedThresholdTokens =
    typeof stored['outputMedThresholdTokens'] === 'number' && !isNaN(stored['outputMedThresholdTokens'])
      ? stored['outputMedThresholdTokens']
      : DEFAULT_SETTINGS.outputMedThresholdTokens

  const cacheReadLowThreshold =
    typeof stored['cacheReadLowThreshold'] === 'number' && !isNaN(stored['cacheReadLowThreshold'])
      ? stored['cacheReadLowThreshold']
      : DEFAULT_SETTINGS.cacheReadLowThreshold
  const cacheReadMedThreshold =
    typeof stored['cacheReadMedThreshold'] === 'number' && !isNaN(stored['cacheReadMedThreshold'])
      ? stored['cacheReadMedThreshold']
      : DEFAULT_SETTINGS.cacheReadMedThreshold
  const cacheWriteLowThreshold =
    typeof stored['cacheWriteLowThreshold'] === 'number' && !isNaN(stored['cacheWriteLowThreshold'])
      ? stored['cacheWriteLowThreshold']
      : DEFAULT_SETTINGS.cacheWriteLowThreshold
  const cacheWriteMedThreshold =
    typeof stored['cacheWriteMedThreshold'] === 'number' && !isNaN(stored['cacheWriteMedThreshold'])
      ? stored['cacheWriteMedThreshold']
      : DEFAULT_SETTINGS.cacheWriteMedThreshold

  const trackSessionCost =
    typeof stored['trackSessionCost'] === 'boolean'
      ? stored['trackSessionCost']
      : DEFAULT_SETTINGS.trackSessionCost

  return {
    showPopover,
    showPricesUnderModelNames,
    showInputPriceInList,
    showOutputPriceInList,
    showCacheReadPriceInList,
    showCacheWritePriceInList,
    showModelPriceInBar,
    showInputPriceInBar,
    showOutputPriceInBar,
    showCacheReadPriceInBar,
    showCacheWritePriceInBar,
    priceColorTiers,
    colorModelNameByOutputPrice,
    showDiscountBadge,
    inputLowThreshold,
    inputMedThreshold,
    outputLowThreshold,
    outputMedThreshold,
    inputLowThresholdEur,
    inputMedThresholdEur,
    outputLowThresholdEur,
    outputMedThresholdEur,
    inputLowThresholdTokens,
    inputMedThresholdTokens,
    outputLowThresholdTokens,
    outputMedThresholdTokens,
    cacheReadLowThreshold,
    cacheReadMedThreshold,
    cacheWriteLowThreshold,
    cacheWriteMedThreshold,
    trackSessionCost,
  }
}
