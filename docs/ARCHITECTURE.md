# Architecture

## v0.1 request flow

Browser (Next.js client) → Next.js route handler → deterministic scenario engine → optional server-side OpenAI qualitative analysis → browser results.

## Trust boundaries

- OpenAI credentials remain server-side in environment variables.
- User-provided briefs are length-limited and validated.
- The model is not asked to invent population statistics or numeric forecasts.
- Numeric scenario indicators are produced by transparent illustrative heuristics.
- No personal data is needed for the initial experiment flow.

## Planned services

- Population registry: versioned country/region segment distributions with provenance.
- Agent runtime: bounded agent state, memory policy, scenario environment and deterministic replay.
- Experiment orchestrator: queues, concurrency, cancellation and cost budgets.
- Evidence store: approved aggregate datasets and licensed research material.
- Evaluation service: holdout comparisons, calibration, uncertainty and drift.
- Workspace service: authentication, ownership, audit events and retention controls.

## Important design rule

Do not turn an LLM's fluent answer into a probability. Statistical estimates must come from explicit, evaluated methods and suitable evidence.

## v0.5 evidence flow

Browser research workspace → `/api/research-data` → World Bank Indicators API v2 (World Development Indicators, source 2) → normalized observations with market, indicator, year and value → browser evidence table.

Optional synthesis flow: browser sends the selected observations and research question → `/api/research-synthesis` validates the observation set → server-side Vercel AI Gateway → structured findings with evidence IDs → response validator removes references not present in the input → browser report and local JSON archive.

### Evidence and safety rules

- Only allowlisted World Bank indicators and market codes are queried; the route does not fetch arbitrary user-supplied URLs.
- The server does not accept or expose user API keys; AI Gateway credentials remain server-side.
- Every synthesized evidence reference must match an observation ID supplied to the model.
- Country-level aggregates must not be used to infer individual-level preferences (ecological fallacy) or causality.
- Latest non-empty observations can have different reference years; the UI displays years alongside values.
- AI summaries are interpretation aids, not validated statistical models or representative consumer research.

## v0.6 benchmark and validation flow

Researcher selects a SYNTHORA prediction and records a comparable published outcome with market, outcome definition, observation year, sample size, source URL and comparability notes. The browser validates fields and stores up to 500 benchmark pairs in localStorage. CSV/JSON import is validated before records enter the registry; CSV/JSON export supports backup and review.

For the selected benchmark set the client calculates:
- MAE and RMSE in percentage points.
- Signed bias (positive means model overestimation).
- Share of pairs within ±5 and ±10 percentage points.
- A percentile bootstrap interval for MAE when at least three pairs exist.
- Linear slope, intercept and correlation as descriptive diagnostics.

These metrics do not establish validity if the compared measures, sampling frames, questions, segments or field periods are not comparable. The bootstrap resamples only the entered pairs and must not be described as a population confidence interval. Keep a separate holdout set for evaluation. No real-world ground truth is bundled or fabricated.
