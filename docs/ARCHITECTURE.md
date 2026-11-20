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

## v0.6 benchmark evaluation flow

User-supplied CSV → strict header/range/source/year/sample-size validation in browser → matched prediction/observation pairs → descriptive error metrics (MAE, RMSE, signed bias, Pearson correlation) and predicted-vs-observed score bands → downloadable JSON report.

The evaluation tool does not train or tune the simulator. Every benchmark row retains its source label and reference year. Demo rows are explicitly illustrative and cannot be cited as empirical validation. For credible holdout testing, the benchmark must match the simulator outcome definition, target population, market and time period. Aggregate scores are not proof of generalisation.
