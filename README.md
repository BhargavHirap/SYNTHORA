# SYNTHORA

**Simulate Humanity. Understand Tomorrow.**

SYNTHORA is an early-stage global population and behavioural simulation workspace. It helps teams explore how statistically described synthetic population segments might react to products, prices and messages.

> Research tool, not a crystal ball. Simulated responses are hypotheses—not representative survey results, causal evidence, or guaranteed forecasts. Validate important decisions with real people and observed outcomes.

## Current MVP

- Create a market experiment with a product, price, market and audience.
- Generate a transparent synthetic segment mix.
- Explore simulated purchase-intent bands, objections and messaging opportunities.
- Run with a deterministic local demo engine, or add an OpenAI API key for AI-generated qualitative analysis.
- Review limitations and validation guidance alongside every result.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Recharts
- OpenAI Chat Completions API (optional server-side integration)

## Run locally

Requirements: Node.js 20.9+.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

The app works without credentials in **Demo mode**. To enable AI-assisted qualitative analysis, set `OPENAI_API_KEY` in `.env.local`. The key is used only by the server route and must never be prefixed with `NEXT_PUBLIC_`.

## Deploy

Import this repository into Vercel. Set `OPENAI_API_KEY` as a server-side environment variable if AI-assisted analysis is wanted. The demo engine works without it.

## Product principles

1. **Synthetic ≠ real:** Never present generated agents as actual people or survey respondents.
2. **Show uncertainty:** Report ranges and assumptions, not false precision.
3. **Ground populations:** Replace illustrative segment weights with documented, current, country-specific datasets before commercial use.
4. **Calibrate:** Compare results with independent real-world studies and disclose performance by segment.
5. **Protect people:** Do not infer sensitive traits about identifiable individuals or use simulations to target or exclude protected groups.
6. **Human validation:** High-stakes decisions require real research and domain review.

## Roadmap

- [x] Experiment builder and responsive research dashboard
- [x] Synthetic segment generator with transparent illustrative priors
- [x] Demo simulation API
- [x] Optional OpenAI qualitative analysis
- [ ] Country-specific statistical population packs with citations and versioning
- [ ] Real-world calibration and holdout evaluation
- [ ] Saved experiments, authentication and team workspaces
- [ ] Network/contagion simulation with explicit assumptions
- [ ] Batch execution, budgets and audit logs

## License

Proprietary project. All rights reserved.
