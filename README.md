# SYNTHORA

**Simulate Humanity. Understand Tomorrow.**

SYNTHORA is a research workspace for exploring how explicitly synthetic population cohorts may respond to products, prices and messages across markets.

> Research tool, not a crystal ball. Synthetic agents are not real people. Model outputs are hypotheses—not representative survey results, causal evidence, or guaranteed forecasts.

## v0.5 — Research Intelligence Layer

- Fetch live public macro indicators from the World Bank World Development Indicators API for India, United States, United Kingdom, Germany, Japan and Brazil.
- Compare the latest available non-empty observations for population, GDP per capita, internet use, urban population and unemployment.
- Preserve indicator codes, observation years, retrieval time and a direct source link; missing observations are omitted rather than fabricated.
- Generate an optional AI-assisted research brief grounded only in the selected observations, with evidence IDs attached to each finding.
- Separate descriptive findings from tentative patterns and explicitly list what the aggregate data cannot establish.
- Export evidence-linked research briefs as JSON and keep the latest 10 reports in browser-local history.

The public data explorer does not require an API key. Evidence synthesis uses the existing server-side `AI_GATEWAY_API_KEY` and can incur model usage charges. The integration reads country-level World Bank data; it does not claim to measure individual preferences, represent sub-populations, or establish causality. Latest available years can differ by indicator and country.

## v0.4 — LLM Agent Simulation

- Optional LLM-powered synthetic agent generation through Vercel AI Gateway.
- Separate country-specific model calls create distinct fictional personas, goals, motivations and reasoning.
- Multi-round natural-language agent debate with opinion shifts and individual memory summaries.
- Structured, validated JSON output with country summaries, disagreement points and decision counts.
- Exportable experiment records and browser-local history (latest 10 LLM runs).
- Deterministic v0.2/v0.3 engines remain available when no AI Gateway key is configured.

To enable LLM mode, set `AI_GATEWAY_API_KEY` in the Vercel project environment variables and redeploy. Optionally set `SYNTHORA_LLM_MODEL` to a model supported by Vercel AI Gateway. Each selected country makes one model request; usage is billed according to the chosen provider/model. Never expose the key to client-side code.

## v0.3 — Cognitive Simulation Core

- Generate synthetic agents with individual goals, motivations, decision variables, confidence and memory adaptation.
- Run multi-round heuristic agent-to-agent discussions and inspect conversation excerpts.
- Adapt agent opinions through a dynamic, rewiring social network.
- Explore country-context what-if scenarios across India, US, UK, Germany, Japan and Brazil.
- Compare support, opposition, undecided groups, consensus signals and polarization.
- Run Monte Carlo perturbation trials and report 95% model-sensitivity intervals and standard error.
- Reproduce a run with its seed, archive the latest 20 runs locally and export a complete JSON experiment record.

## v0.2 — Population Intelligence Engine

- Generate individual synthetic adult agents with reproducible cohort IDs.
- Select country and language configurations for India, United States, United Kingdom, Germany, Japan and Brazil.
- Assign agent-level demographic fields and behavioural traits (price sensitivity, novelty seeking, trust propensity, social influence and quality orientation).
- Run up to six scenario variants against the same cohort for paired comparisons.
- Simulate simplified peer influence over a deterministic network.
- Carry agent exposure history and affinity memory between runs when the cohort is reused.
- Persist experiments and agent memory in browser IndexedDB; inspect, reopen and delete saved runs.
- Compare scenario intent indices, segment signals, objections and interaction lift.

## v0.4 LLM simulation limitations

LLM-generated agents are fictional model outputs and are not validated representatives of real populations. The supplied seed is context for the model but does not guarantee exact repeatability. Country context is a prompt-level scenario lens, not a measured national psychological profile. LLM decision counts are descriptive counts of generated agents only. The latest 10 LLM experiments are saved in browser local storage, not shared cloud storage. Model requests can incur provider charges.

## v0.3 cognitive model limitations

The cognitive core is a deterministic, rule-based simulation. Agent dialogue is generated from structured goals and arguments; it is not free-form LLM conversation or evidence of genuine human cognition. Repeated runs with the same seed can carry forward the prior saved agent stance, confidence and learned-memory state. Country context values are illustrative hypotheses, not measured national cultural scores. The social graph is a simplified rewiring network. Monte Carlo intervals quantify sensitivity to the model's own perturbations, not statistical confidence intervals for real populations. Runs are stored in local browser storage; no cloud sync or team collaboration is provided.

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
- [x] Public macro indicator ingestion with source links, observation years and evidence-linked AI research briefs\n- [ ] Official country demographic packs with citations, provenance and versioning
- [ ] Calibrated trait distributions and validation against real-world holdout studies
- [ ] Managed database, authentication and cross-device/team workspaces
- [x] Heuristic multi-round agent conversations and behavioural adaptation
- [x] Dynamic network rewiring and group consensus indicators
- [x] Cross-country what-if simulation and Monte Carlo model-sensitivity intervals
- [x] Seeded experiment history and JSON export
- [ ] Batch execution workers, run budgets and audit logs
- [ ] Exportable research reports

## License

Proprietary project. All rights reserved.
