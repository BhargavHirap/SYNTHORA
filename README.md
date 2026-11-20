# SYNTHORA

**Simulate Humanity. Understand Tomorrow.**

SYNTHORA is a research workspace for exploring how explicitly synthetic population cohorts may respond to products, prices and messages across markets.

> Research tool, not a crystal ball. Synthetic agents are not real people. Model outputs are hypotheses—not representative survey results, causal evidence, or guaranteed forecasts.

## v1.4 — Autonomous Research Agents

- Five-role research council: Research Director, Skeptic, Evidence Auditor, Behavioural Scientist and Experiment Designer.
- Converts a saved cognitive simulation into falsifiable hypotheses, adversarial challenges, source/evidence gaps, contradictions and prioritized follow-up experiments.
- Adds decision gates, experiment success metrics and explicit limitations to prevent synthetic outputs being mistaken for real-world evidence.
- Uses one bounded Vercel AI Gateway orchestration request when `AI_GATEWAY_API_KEY` is configured; the server validates and bounds generated report fields and filters hypothesis source references against supplied evidence IDs.
- Includes a clearly labelled deterministic fallback research plan when AI Gateway is not configured or unavailable. Fallback mode is useful for workflow testing but is not an LLM agent run.
- Dashboard reads local cognitive experiment history and the latest saved public-evidence synthesis, and exports the complete research council report as JSON.

The research council is an analysis and study-design assistant, not a self-directed system that contacts participants, executes experiments, or makes launch decisions. Synthetic agents are not respondents. Independent data, ethical review, sampling plans and preregistered outcomes remain necessary.

## v1.3 — Advanced Simulation Intelligence

- Analyse saved cognitive simulation runs across selected markets without making additional LLM calls.
- Compare simulated support, Monte Carlo sensitivity interval width, discussion-round stability, opinion momentum and polarization.
- Produce a cross-market robustness view with strongest and most model-sensitive markets, support spread and a conservative synthetic support floor.
- Generate market-level research watchlists from transparent threshold rules (wide model interval, undecided share, polarization, round instability and low network connectivity).
- Export a standalone JSON intelligence report linked to the source run and seed.
- Keep interpretation guardrails visible: all metrics describe model behaviour and sensitivity, not real-world population estimates, causal effects or validated forecasts.

The intelligence layer is deterministic post-processing of a saved v0.3 cognitive run. It does not retrain a model, add evidence, or improve the validity of the underlying simulation. Its risk flags are prompts for further investigation, not automatic go/no-go decisions. No additional provider usage is incurred by analysis or export.

## v0.7 — Global Population Data Foundation

- Expand the public World Bank evidence pack from five to twelve indicators across six markets: India, United States, United Kingdom, Germany, Japan and Brazil.
- Add population age structure (0–14, 15–64, 65+), rural population share, labour-force participation, mobile subscriptions and secondary school enrolment.
- Version the data contract as `SYNTHORA-GLOBAL-2026.1`, preserve source metadata and observation years, and export a timestamped raw JSON snapshot from the browser.
- Ground optional AI synthesis in the expanded server-fetched evidence set; evidence references are validated against fetched observation IDs.
- Continue to omit missing observations instead of filling or fabricating values.

The data pack provides country-level context, not segment-level distributions or individual preferences. Indicator years can differ; gross school enrolment may exceed 100%; mobile subscriptions per 100 people are not the same as unique users. Country context must not be presented as causal evidence or a representative consumer sample.

## v0.6 — Behavioural Validation & Calibration Diagnostics

- Add a benchmark registry for paired SYNTHORA predictions and comparable published outcomes.
- Require source name, source URL, observation year, market, sample size and comparability notes.
- Import and export benchmark records as CSV or JSON; retain up to 500 records in browser-local storage.
- Calculate mean absolute error (MAE), root mean squared error (RMSE), signed bias, within-5/10-percentage-point rates, bootstrap MAE interval and linear calibration diagnostics.
- Filter diagnostics by market and inspect per-metric benchmark pairs.
- Do not bundle fabricated ground truth or claim model calibration before real, comparable observations are entered.

Validation metrics are only meaningful when the synthetic prediction and observed benchmark measure the same outcome for a comparable population, question, market and time period. The bootstrap interval resamples the entered pairs; it is not a population confidence interval. Keep a holdout set and report dataset limitations. This release provides diagnostics and a workflow, not proof of predictive validity.

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
- [x] Public macro and demographic indicator ingestion with source links, observation years and evidence-linked AI research briefs\n- [ ] Official country demographic packs with citations, provenance and versioning
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


## v0.8–v1.2 — Research platform foundation

- v0.8: benchmark-driven demographic calibration lab using iterative proportional fitting (raking), source/year metadata, convergence and residual diagnostics, effective sample size, and exportable agent weights. Calibration is separate from raw synthetic agents and requires user-supplied documented marginals.
- v0.9: persistent agent-memory API for saving/retrieving exposure and decision memory against a cloud project.
- v1.0: Supabase email/password authentication, private workspace/project and experiment APIs, and RLS-backed private storage schema.
- v1.1: versioned POST /api/v1/simulations endpoint with workspace API keys stored as SHA-256 hashes, a 60 requests/minute per-key limit, and 50–2,500 agent synchronous runs.
- v1.2: enterprise overview of experiment volume, market coverage, agent counts and baseline indices, explicitly descriptive of synthetic runs.

### Cloud setup required

Set Vercel environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, and SUPABASE_SERVICE_ROLE_KEY (server-only). Review and apply supabase/schema.sql to the intended Supabase project, then configure Supabase Auth email confirmation and redirect URLs. The repository does not activate a Supabase project or apply the schema automatically. Never expose the service-role key in browser code.

The first API release is synchronous and capped; durable background queues, billing, enterprise SSO, team invitation workflows and audited storage upload UX remain future hardening tasks.
