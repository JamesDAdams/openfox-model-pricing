export type LocalizedString = { en: string; fr: string }

export type PluginBadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

export interface ModelPricing {
  /** Cost per 1M input (prompt) tokens */
  input?: number
  /** Cost per 1M output (completion) tokens */
  output?: number
  /** Cost per 1M cache read tokens */
  cacheRead?: number
  /** Cost per 1M cache write tokens */
  cacheWrite?: number
  /** Discount percentage (e.g. 50 or "50%") */
  discount?: number | string
  /** Currency code (USD, EUR, GBP, tokens) */
  currency?: string
  /** ISO timestamp when pricing was checked */
  lastUpdatedAt?: string
}

export interface ModelPricingEntry {
  patterns: RegExp[]
  pricing: ModelPricing
}

export interface PricingSettings {
  showPopover: boolean
  showPricesUnderModelNames: boolean
  showInputPriceInList: boolean
  showOutputPriceInList: boolean
  showCacheReadPriceInList: boolean
  showCacheWritePriceInList: boolean
  showModelPriceInBar: boolean
  showInputPriceInBar: boolean
  showOutputPriceInBar: boolean
  showCacheReadPriceInBar: boolean
  showCacheWritePriceInBar: boolean
  priceColorTiers: boolean
  colorModelNameByOutputPrice: boolean
  showDiscountBadge: boolean
  inputLowThreshold: number
  inputMedThreshold: number
  outputLowThreshold: number
  outputMedThreshold: number
  inputLowThresholdEur: number
  inputMedThresholdEur: number
  outputLowThresholdEur: number
  outputMedThresholdEur: number
  inputLowThresholdTokens: number
  inputMedThresholdTokens: number
  outputLowThresholdTokens: number
  outputMedThresholdTokens: number
  cacheReadLowThreshold: number
  cacheReadMedThreshold: number
  cacheWriteLowThreshold: number
  cacheWriteMedThreshold: number
  trackSessionCost: boolean
}

export interface SessionCostSummary {
  sessionId: string
  totalCost: number
  promptTokens: number
  completionTokens: number
  callsCount: number
  lastUpdated: string
}

export interface PluginModelPopoverRow {
  label: LocalizedString
  value: string
  strikeThroughValue?: string
  tone?: PluginBadgeTone
}

export interface PluginModelPopoverView {
  title?: LocalizedString
  badge?: { label: LocalizedString; tone?: PluginBadgeTone }
  rows?: PluginModelPopoverRow[]
  footer?: LocalizedString
}

export interface PluginModelSublineItem {
  text: string
  tone?: PluginBadgeTone
}

export interface PluginModelMetadata {
  pricing?: {
    input?: number
    output?: number
    cacheRead?: number
    cacheWrite?: number
    currency?: string
    discountPercent?: number
    lastUpdatedAt?: string
  }
  contextWindow?: number
  vision?: boolean
  reasoning?: boolean
  nameTone?: PluginBadgeTone
  popover?: PluginModelPopoverView
  subline?: PluginModelSublineItem[]
  bottomSubline?: PluginModelSublineItem[]
  badges?: { label: LocalizedString; tooltip?: LocalizedString; tone?: PluginBadgeTone; icon?: string }[]
}

export interface PluginModelMetadataProvider {
  id: string
  getMetadata(context: {
    providerId: string
    modelId: string
    model: Record<string, unknown>
  }): PluginModelMetadata | undefined | Promise<PluginModelMetadata | undefined>
  getProviderMetadata?(context: {
    providerId: string
    provider?: Record<string, unknown>
  }): PluginModelMetadata | undefined | Promise<PluginModelMetadata | undefined>
}

export interface PluginActivation {
  kind: 'rpc' | 'openPanel' | 'openUrl'
  method?: string
  panelId?: string
  url?: string
  params?: Record<string, unknown>
}

export interface PluginUiAction {
  id: string
  slot: string
  label: LocalizedString
  icon?: string
  variant?: 'default' | 'primary' | 'danger' | 'ghost'
  tooltip?: LocalizedString
  onActivate: PluginActivation
}

export interface PluginUiBadge {
  id: string
  slot: string
  label: LocalizedString
  tone?: PluginBadgeTone
  tooltip?: LocalizedString
  value?: string
  source?: { kind: 'rpc'; method: string }
}

export type DeclarativeNode =
  | { type: 'text'; text: LocalizedString; muted?: boolean; className?: string }
  | { type: 'keyValue'; items: { key: LocalizedString; value: string }[] }
  | { type: 'table'; columns: LocalizedString[]; rows: string[][] }
  | { type: 'progress'; label: LocalizedString; value: number; max: number; tone?: PluginBadgeTone }
  | { type: 'badge'; label: LocalizedString; tone?: PluginBadgeTone }
  | {
      type: 'button'
      label: LocalizedString
      variant?: 'default' | 'primary' | 'danger' | 'ghost' | 'pill'
      icon?: string
      onActivate: PluginActivation
    }
  | { type: 'divider' }
  | {
      type: 'stack'
      direction?: 'row' | 'column'
      gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg'
      align?: 'start' | 'center' | 'end' | 'stretch'
      justify?: 'start' | 'center' | 'end' | 'between'
      className?: string
      children: DeclarativeNode[]
    }
  | {
      type: 'card'
      title?: LocalizedString
      subtitle?: LocalizedString
      tone?: PluginBadgeTone
      children: DeclarativeNode[]
    }
  | {
      type: 'details'
      title: LocalizedString
      defaultOpen?: boolean
      className?: string
      children: DeclarativeNode[]
    }
  | {
      type: 'callout'
      tone?: PluginBadgeTone
      title?: LocalizedString
      text: LocalizedString
      icon?: string
    }

export interface PluginUiPanel {
  id: string
  title: LocalizedString
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  kind: 'declarative' | 'iframe'
  content?: DeclarativeNode[]
  url?: string
}

export interface PluginSettingsField {
  key: string
  type: 'text' | 'password' | 'number' | 'boolean' | 'select' | 'textarea' | 'path'
  label: LocalizedString
  description?: LocalizedString
  default?: string | number | boolean
  options?: { value: string; label: LocalizedString }[]
  required?: boolean
  secret?: boolean
  parentKey?: string
  width?: 'full' | 'half'
  section?: LocalizedString
}

export interface PluginSettingsSchema {
  fields: PluginSettingsField[]
}

export interface PluginContext {
  readonly id: string
  readonly version: string
  readonly runtime: { mode: 'production' | 'development'; configDirectory: string }
  readonly logger: {
    debug(message: string, context?: Record<string, unknown>): void
    info(message: string, context?: Record<string, unknown>): void
    warn(message: string, context?: Record<string, unknown>): void
    error(message: string, context?: Record<string, unknown>): void
  }
  readonly storage: {
    get(key: string): unknown
    set(key: string, value: unknown): void
  }
  settings(scope?: 'global' | 'project', projectId?: string): Record<string, unknown>
  notify(request: {
    title: LocalizedString
    body?: LocalizedString
    level?: 'info' | 'success' | 'warning' | 'error'
    actions?: { label: LocalizedString; onActivate: PluginActivation }[]
  }): void
  publish(panelId: string | undefined, key: string, value: unknown): void
}

export interface PluginRegistry {
  readonly runtime: { mode: 'production' | 'development'; configDirectory: string }
  readonly context: PluginContext

  registerModelMetadataProvider(provider: PluginModelMetadataProvider): void
  registerTool(tool: {
    name: string
    description: string
    parameters: Record<string, unknown>
    execute(args: Record<string, unknown>, context: Record<string, unknown>): Promise<{ success: boolean; output?: string; error?: string }>
  }): void
  registerSettings(schema: PluginSettingsSchema): void
  registerUiAction(action: PluginUiAction): void
  registerUiBadge(badge: PluginUiBadge): void
  registerUiPanel(panel: PluginUiPanel): void
  registerHook(
    event: string,
    handler: (payload: { event: string; sessionId: string; projectId?: string; timestamp: string; data: Record<string, unknown> }) => void | Promise<void>,
  ): void
  registerRpc(method: string, handler: (params: Record<string, unknown>, context: Record<string, unknown>) => unknown | Promise<unknown>): void
}
