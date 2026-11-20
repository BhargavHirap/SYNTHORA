# SYNTHORA v2.0 — Platform Architecture

## Product goal

SYNTHORA is a research operating system that connects question formation, study design, evidence provenance, simulation, statistical validation and reproducibility. It must distinguish simulated outputs from empirical observations and make assumptions visible.

## Logical planes

| Plane | Responsibility | Existing / v2.0 modules |
| --- | --- | --- |
| Research control | Protocols, workflow stages, quality gates, audit trail, manifests | Research Control Plane (v2.0) |
| Evidence | Search leads, human-approved retrieval, source records and evidence synthesis | Research Execution Studio, Research Intelligence, Evidence Ledger |
| Simulation | Synthetic populations, behavioural traits, agent memory, network effects and scenario runs | Population engine, Cognitive Lab, LLM Agent Lab |
| Validation | Pre-registration, aggregate outcome analysis, benchmark metrics, calibration and sensitivity | Experimental Validation, Scientific Benchmark Studio, Calibration Lab |
| Execution | Bounded API runs, provider orchestration, run records and exports | Simulation API, Autonomous Research Agents |
| Governance | Data sensitivity, ethics prompts, model limitations, provenance and human review | Quality gates, caveat disclosures, audit records |

## Current v2.0 control-plane data model

- ResearchProtocol: research question, hypothesis, target population, geography, outcomes, method, sampling, criteria, analysis plan, limitations, ethics status, sensitivity classification, workflow stage, owner and version.
- EvidenceItem: title, publisher, URL, evidence class, publication/access dates, relevant claim, evidence direction and researcher-assessed quality.
- AuditEvent: timestamped workspace action and detail.
- ProtocolAssessment: completeness score, per-gate results, critical-block status and warnings.
- ReproducibilityManifest: protocol snapshot, evidence inventory, assessment, provenance and explicit execution metadata placeholders.

## Data lifecycle

1. Researcher drafts a protocol.
2. Quality gates surface missing or unresolved design details.
3. Researcher adds sources and classifies their claims, including counter-evidence.
4. The readiness panel reports workflow completeness and evidence balance.
5. The researcher exports a versioned reproducibility manifest.
6. When a real simulation or empirical study is run, execution identifiers, seeds, model versions, parameters, code commit and data locations should be added to the manifest.
7. Independent human review determines whether findings are fit for interpretation or publication.

## Trust and safety boundaries

- Synthetic agents are not human participants, survey respondents or ground truth.
- A source URL is a reference, not proof that the source is accurate or authoritative.
- Evidence quality is currently researcher-assessed; it is not algorithmically certified.
- A protocol quality score measures documentation completeness, not validity, ethics approval or causal identification.
- Do not store personal, confidential or sensitive participant data in the browser-local control plane.
- Public deployment of AI-backed routes requires server-side secrets, authentication, quotas, rate limits and abuse monitoring.
- Cloud persistence must use authenticated workspace ownership and row-level security; service-role credentials must never reach browser code.

## Current implementation boundary

The v2.0 Research Control Plane uses browser local storage. The broader repository already contains Supabase-backed workspace/API foundations, but the new protocol/evidence control-plane records are not yet synchronized to those cloud tables. Multi-user collaboration, immutable server-side audit history, background execution queues, source verification, role-based approvals and full end-to-end tests remain subsequent milestones.

## Release verification checklist

- [ ] npm install
- [ ] npx tsc --noEmit
- [ ] npm run build
- [ ] Verify protocol autosave and reload behaviour
- [ ] Verify evidence CRUD and counter-evidence calculations
- [ ] Verify critical ethics/data-sensitivity gates
- [ ] Verify manifest JSON export and null execution placeholders
- [ ] Verify existing simulation and validation studios still render
- [ ] Deploy a preview and perform browser smoke tests
- [ ] Promote only after preview verification
