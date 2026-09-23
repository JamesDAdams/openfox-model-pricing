# openfox-model-pricing

An OpenFox plugin providing rate card pricing, promotional discount badges, cost tier indicators, and real-time session token cost calculations across major AI providers.

## Features

- **Built-in Model Catalog**: Covers OpenAI, Anthropic Claude, DeepSeek, Google Gemini, Qwen, Zhipu GLM, Mistral, and free tier models.
- **Model Picker Indicators**: Displays rates (e.g. `$0.15/0.60`), promotional discount badges (`-60%`), and cost tiers (`Eco`, `Premium`).
- **Live Session Cost Tracking**: Automatically calculates token costs when LLM completions finish and publishes live updates to session header badges and panels.
- **Configurable Settings**: Custom currency (`USD`, `EUR`, `GBP`, `tokens`), customizable cost thresholds, and display toggles.
- **LLM Tool & RPC**: Includes `get_model_pricing` tool and RPC endpoints for querying rates and session costs.

## Installation

Symlink or install into your OpenFox plugins directory:

```bash
# Dev environment
ln -sfn "$(pwd)" "$HOME/Library/Application Support/openfox-dev/plugins/openfox-model-pricing"

# Production environment
ln -sfn "$(pwd)" "$HOME/Library/Application Support/openfox/plugins/openfox-model-pricing"
```
