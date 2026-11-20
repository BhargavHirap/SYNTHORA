# SYNTHORA

**Simulate Humanity. Understand Tomorrow.**

SYNTHORA is a research workspace for exploring how explicitly synthetic population cohorts may respond to products, prices and messages across markets.

> Research tool, not a crystal ball. Synthetic agents are not real people. Model outputs are hypotheses—not representative survey results, causal evidence, or guaranteed forecasts.

## v0.2 — Population Intelligence Engine

- Generate individual synthetic adult agents with reproducible cohort IDs.
- Select country and language configurations for India, United States, United Kingdom, Germany, Japan and Brazil.
- Assign agent-level demographic fields and behavioural traits (price sensitivity, novelty seeking, trust propensity, social influence and quality orientation).
- Run up to six scenario variants against the same cohort for paired comparisons.
- Simulate simplified peer influence over a deterministic network.
- Carry agent exposure history and affinity memory between runs when the cohort is reused.
- Persist experiments and agent memory in browser IndexedDB; inspect, reopen and delete saved runs.
- Compare scenario intent indices, segment signals, objections and interaction lift.

## Important data and model limitations

Country profiles are **illustrative starter priors**, not official census distributions, calibrated population estimates, or probability samples. Replace each profile with documented, versioned sources (national statistics offices and international statistical datasets) before making country-level claims.

Agent traits are generated synthetic variables. They are not inferred from or linked to identifiable people. The interaction model is a simplified network heuristic, not a validated theory of human behaviour. Intent indices are not purchase probabilities or forecasts.

Saved experiments currently live in the browser that created them. They are not synced across devices or shared between team members. A managed database and authentication layer are a separate infrastructure milestone.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Recharts and Lucide
- Deterministic synthetic population engine
- Browser IndexedDB for local experiment persistence

## Run locally

Requirements: Node.js 20.9+.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Deploy

Import this repository into Vercel. Configure server-side environment variables only; never expose provider secrets with a `NEXT_PUBLIC_` prefix.

## Product principles

1. **Synthetic ≠ real:** Never present generated agents as actual people or survey respondents.
2. **Show uncertainty:** Report ranges and assumptions, not false precision.
3. **Ground populations:** Replace illustrative segment weights with documented, current, country-specific datasets before commercial use.
4. **Calibrate:** Compare results with independent real-world studies and disclose performance by segment.
5. **Protect people:** Do not infer sensitive traits about identifiable individuals or use simulations to target or exclude protected groups.
6. **Human validation:** High-stakes decisions require real research and domain review.

## Roadmap

- [x] Experiment builder and research dashboard
- [x] Synthetic population generator with country/language starter profiles
- [x] Individual agent characteristics and deterministic cohort IDs
- [x] Simplified multi-agent network interaction
- [x] Up to six paired scenario comparisons
- [x] Browser-persistent experiment archive and agent memory
- [ ] Official country demographic packs with citations, provenance and versioning
- [ ] Calibrated trait distributions and validation against real-world holdout studies
- [ ] Managed database, authentication and cross-device/team workspaces
- [ ] Richer multi-round agent conversations and auditable memory updates
- [ ] Batch execution workers, run budgets and audit logs
- [ ] Exportable research reports

## License

Proprietary project. All rights reserved.
