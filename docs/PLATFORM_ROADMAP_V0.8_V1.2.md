# SYNTHORA platform release v0.8–v1.2

## v0.8 — Realistic Population Calibration
Use published marginal distributions and independent benchmarks. Compare only compatible population universes, definitions, geographies and reference years. The current country priors remain illustrative until source benchmarks are imported and reviewed. A later calibration pass can use iterative proportional fitting with convergence and residual diagnostics.

## v0.9 — Advanced Agent Intelligence
Persist agent exposure, prior stance, confidence, learned affinity and decision notes across cloud experiments. Long-running production jobs still require durable queue workers and explicit compute budgets. Synthetic memory is not evidence of real human psychology.

## v1.0 — Research Cloud
Email/password accounts, private workspaces, projects, experiment records and private object storage. Database row-level security scopes access. Configure Supabase Auth redirect URLs and email confirmation.

## v1.1 — Global Simulation API
Workspace API keys are random, shown once and stored as SHA-256 hashes. POST /api/v1/simulations initially accepts 50–2,500 agents per request, with a 60 requests/minute key limit. This first endpoint is synchronous; asynchronous queueing and metered billing are future work.

## v1.2 — Enterprise Research Studio
Compare saved experiment counts, market coverage, agent volume and baseline indices. Metrics describe synthetic runs, not predictive accuracy, market share or population estimates.

## Required Vercel environment
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SERVICE_ROLE_KEY (server only; never prefix with NEXT_PUBLIC_)

Review and apply supabase/schema.sql to the intended Supabase project. Repository changes do not activate or migrate a Supabase project automatically.
