# AGENTS.md — openfox-model-pricing

Paths relative to `openfox-plugins/openfox-model-pricing/`.

## Purpose

OpenFox plugin displaying model pricing, promotional discount badges, cost tiers in the model picker, and tracking real-time session costs.

## Stack

- TypeScript, ESM, tsup, vitest 3.x
- peerDep: `openfox >=2.0.0 <3`

## Commands

```bash
npm run build      # tsup
npm test           # vitest run --passWithNoTests
npm run typecheck  # tsc --noEmit
```

## Project Map

```
src/
├── index.ts        # Plugin entry point (register)
├── types.ts        # Type definitions
├── settings.ts     # Settings management
├── metadata.ts     # createModelMetadataProvider
├── cost-tracker.ts # SessionCostTracker (session cost tracking)
├── catalog.ts      # matchModelPricing (model catalog)
├── calculations.ts # formatCost (cost calculations)
├── rate-store.ts   # CustomRateStore (rate storage)
└── rates.json      # Built-in pricing catalog (at root)
```

## Where to Look What

- **Modify pricing catalog** → `rates.json` (at project root)
- **Modify cost calculations** → `src/calculations.ts`
- **Modify session cost tracking** → `src/cost-tracker.ts`
- **Add a setting** → `src/settings.ts`
- **Modify model metadata** → `src/metadata.ts`

## Conventions

- `apiVersion: 2`, capabilities: `models`, `settings`, `hooks`, `ui`, `tools`, `rpc`
- ESM build only via tsup (sourcemap: false, target: node20)
- `openfox` and `openfox/plugin` are externalized

## Cross-Project Dependencies

**Consumes**: `openfox/plugin` (PluginRegistry, PricingSettings).

**Consumed by**: OpenFox (loaded as plugin).

**Touchpoints**:

- `src/index.ts` (register)
- `src/metadata.ts` (createModelMetadataProvider)
- `src/cost-tracker.ts` (SessionCostTracker)

## Known Gotchas

- `dist/index.js` is the entry point loaded by OpenFox, not `src/`.
- `rates.json` is at the project root, not in `src/`.
- The plugin exposes a LLM tool `get_model_pricing` and RPC methods.

## Do Not Read / Do Not Touch

- `node_modules/`, `dist/`, `.git/`

## Further Reading

- [README.md](README.md) — overview

---

> After any change affecting structure, a command, a convention, an inter-project contract, or a primary flow, update this file in the same commit. If any information here is inaccurate, fix it.
