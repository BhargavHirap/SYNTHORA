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
