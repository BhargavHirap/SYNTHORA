# SYNTHORA

## v1.9–v2.1 — Scientific Intelligence & Research Benchmarking

- Import user-supplied benchmark datasets in CSV or JSON; normalize prediction/observation pairs and retain dataset/model version, market, metric, unit, split, source provenance, sample size, observation date, evaluation method and run seed.
- Generate a CSV template for reproducible dataset intake. The template is a schema example, not ground truth; no fabricated benchmark observations are bundled.
- Evaluate holdout predictions with MAE, RMSE, signed bias, MAPE (excluding zero observations), Pearson correlation, descriptive calibration slope/intercept and Brier score for probability rows.
- Inspect probability reliability bins, prediction-versus-observation ledger, per-market metrics and cross-country comparisons using the same metric filter.
- Score reproducibility metadata completeness across dataset/model versions, source, date, method, seed and holdout availability. The score is a checklist, not a scientific-validity grade.
- Export a complete JSON research report containing source records, aggregate diagnostics, country comparisons, calibration bins, metadata and explicit limitations.
- Keep up to 1,000 benchmark records in browser-local storage. Import/export runs entirely in the browser; no participant-level personal data is required.

### Scientific and data safeguards

The system does not silently fetch or invent benchmark truth. Researchers must supply documented, comparable observations. A holdout set only counts as holdout if it was not used for model tuning. Metrics across countries are descriptive unless outcome definitions, units, time windows and sampling frames are harmonised. Correlation is not agreement; MAPE is undefined at zero; Brier interpretation requires probability forecasts and binary outcomes. Calibration regression is a descriptive diagnostic, not a substitute for proper calibration assessment. This release is a benchmarking workflow, not proof that SYNTHORA predicts real populations.


**GitHub repository:** https://github.com/BhargavHirap/SYNTHORA  
**Open the project:** [BhargavHirap/SYNTHORA](https://github.com/BhargavHirap/SYNTHORA)  
**Latest development:** [Pull request #8](https://github.com/BhargavHirap/SYNTHORA/pull/8)

**Simulate Humanity. Understand Tomorrow.**

SYNTHORA is a research workspace for exploring how explicitly synthetic population cohorts may respond to products, prices and messages across markets.

> Research tool, not a crystal ball. Synthetic agents are not real people. Model outputs are hypotheses—not representative survey results, causal evidence, or guaranteed forecasts.

## v1.6 — Multi-Agent Research Collaboration

- Replaces the single-call council path with five independent, role-prompted specialist model calls: Research Director, Skeptic, Evidence Auditor, Behavioural Scientist and Experiment Designer.
- Runs the five specialists in parallel before sharing their contributions with a separate Research Coordinator.
- The coordinator performs a second orchestration round: identifies disagreements, records positions and resolutions, preserves open questions, and creates an evidence ledger.
- Every returned source ID is filtered against evidence identifiers actually supplied in the request; unsupported claims cannot acquire invented source references.
- Displays specialist contributions, round summaries, disagreements, evidence status and coordinator synthesis in the research workspace.
- Keeps a deterministic collaboration-shaped fallback when the AI Gateway is absent or any specialist/coordinator call fails. It explicitly states that no live debate took place.
- Includes historical adaptive memory as continuity context while preventing repeated generated notes from being treated as independent corroboration.

### Cost, limits and safeguards

AI mode makes six model requests per collaboration run (five specialist calls plus one coordinator call). Provider charges depend on the configured model and token usage. The five role prompts are distinct, but the agents are not independent human experts or independently trained models. The coordinator is another model call, not an external fact-checker. This is a bounded two-round workflow; agents do not autonomously browse the web, call external tools, contact participants or execute experiments.

Before enabling a paid Gateway key on a public deployment, add authentication, durable rate limiting, per-user quotas and usage visibility. The endpoint currently lacks those production controls. Treat all synthetic simulation outputs as hypotheses, not real-world demand evidence or validated forecasts.

## v1.5 — Adaptive Agent Memory & Collective Intelligence

- Persist the latest 30 research council reports and up to 50 compact memory records in browser-local storage.
- Retrieve up to five relevant prior notes for a new research question using lightweight lexical relevance, recency and explicit user feedback.
- Feed bounded historical notes into the AI research council as continuity context; the prompt explicitly treats memory as untrusted context, not evidence, and repeated claims do not increase confidence.
- Surface recurring evidence gaps and hypotheses across archived reports, with counts and a split between AI council and deterministic fallback runs.
- Let researchers rate reports as useful/not useful; ratings influence later memory retrieval.
- Provide an explicit clear-memory action and disclose that memory is local to the browser and selected notes are sent to the research endpoint on a new run.

Collective insights are descriptive patterns in one browser's saved reports, not consensus among independent researchers, model training, or empirical validation. The feature does not sync across devices or team accounts. Deterministic fallback mode can display archive-level patterns but does not perform semantic reasoning over historical notes. The AI route still requires authentication, durable rate limiting and usage quotas before an unrestricted public launch; do not configure a paid Gateway key on a publicly callable endpoint without those controls.

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
- [x] Browser-local adaptive agent memory, report feedback and collective pattern summaries
- [x] Bounded multi-agent research collaboration with specialist calls, coordinator critique, disagreement tracking and evidence ledger
- [x] Heuristic multi-round agent conversations and behavioural adaptation
- [x] Dynamic network rewiring and group consensus indicators
- [x] Cross-country what-if simulation and Monte Carlo model-sensitivity intervals
- [x] Seeded experiment history and JSON export
- [ ] Batch execution workers, run budgets and audit logs
- [x] Scientific benchmark studio: CSV/JSON dataset intake, holdout validation, probability calibration diagnostics, cross-market comparison and reproducibility scoring\n- [x] Exportable research execution records (browser-local JSON)\n- [x] Human-approved external source intake and execution history\n- [ ] Durable background workers, team-shared execution logs and auditable cloud storage

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


### v1.7 — Autonomous Research Execution & Tool Intelligence

- Research question discovery through the optional Tavily Search API (TAVILY_API_KEY, server-side only).
- Human approval is required before retrieving selected public source URLs; users may also provide URLs manually without a search key.
- Bounded source intake: up to five URLs per run, HTTP(S) only, private/local host checks, redirects refused, content-type checks, per-request timeout and response-size limits.
- Source snippets are discovery leads, not verified evidence. Retrieved page text is untrusted and must be checked for publisher, publication date, methodology and claim provenance.
- Browser-local execution history (latest 20 runs), source inspection and JSON export.
- No automatic consequential actions, no participant contact, no experiment claims of real-world validation and no cross-device sync.

To enable search, set TAVILY_API_KEY as a server-side Vercel environment variable. Without it, paste up to five public URLs into Manual source URLs and approve collection. Do not use private, authenticated or confidential URLs. The collector is a lightweight HTML/text intake tool; PDF text extraction is not included. It does not establish factual accuracy or publisher authority.


## v1.8 — Experimental Intelligence & Automated Validation

- Preregistered experiment plans with research question, falsifiable hypothesis, control/treatment, primary metric, target population, allocation, sample plan, duration and stopping/success rule.
- Sample-size planning for a two-arm difference in proportions using an approximate normal-theory calculation (two-sided alpha 0.05; 80% power default).
- Aggregate two-arm outcome analysis: rates, absolute risk difference, approximate 95% confidence interval, pooled two-proportion z-test, p-value, Cohen's h and relative lift.
- Explicit evidence provenance fields and a descriptive simulation-versus-observed comparison; no automatic model validation claims.
- Transparent plan-completeness checklist and reproducible JSON report export.
- Browser-local experiment registry (up to 50 plans); no participant-level records are collected or stored.

### Statistical and operational limits

The v1.8 calculations use normal approximations and are not suitable for every small-sample, clustered, stratified, sequential or multiple-testing design. The quality score describes documentation completeness, not scientific validity. SYNTHORA does not recruit, randomize, contact or monitor participants, run interventions, verify supplied data, or grant ethics approval. Researchers remain responsible for study design, consent, privacy, preregistration and appropriate statistical review. Simulation/observed differences are descriptive until populations, measures and collection methods are aligned and independent validation is performed.
