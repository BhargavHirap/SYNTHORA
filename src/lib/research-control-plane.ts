export type ResearchStage = "discovery" | "design" | "data_collection" | "analysis" | "review" | "archived";
export type EvidenceClass = "peer_reviewed" | "official_statistics" | "preprint" | "technical_report" | "dataset" | "other";
export type ResearchProtocol = {
  id: string;
  title: string;
  question: string;
  hypothesis: string;
  domain: string;
  targetPopulation: string;
  geography: string;
  primaryOutcome: string;
  secondaryOutcomes: string[];
  method: string;
  sampling: string;
  inclusionCriteria: string;
  exclusionCriteria: string;
  analysisPlan: string;
  limitations: string;
  ethicsReview: "not_applicable" | "required" | "in_review" | "approved";
  dataSensitivity: "public" | "internal" | "personal" | "sensitive";
  stage: ResearchStage;
  owner: string;
  version: number;
  createdAt: string;
  updatedAt: string;
};
export type EvidenceItem = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  evidenceClass: EvidenceClass;
  publishedDate: string;
  accessDate: string;
  claim: string;
  supports: "supports" | "challenges" | "context" | "unknown";
  quality: "high" | "moderate" | "low" | "unassessed";
  notes: string;
};
export type AuditEvent = { id: string; at: string; action: string; detail: string; actor: string };
export type QualityCheck = { key: string; label: string; passed: boolean; severity: "critical" | "important" | "recommended"; detail: string };
export type ProtocolAssessment = { score: number; grade: string; checks: QualityCheck[]; blocked: boolean; warnings: string[] };

export const emptyProtocol = (): ResearchProtocol => ({
  id: crypto.randomUUID(), title: "New research protocol", question: "", hypothesis: "", domain: "",
  targetPopulation: "", geography: "", primaryOutcome: "", secondaryOutcomes: [], method: "",
  sampling: "", inclusionCriteria: "", exclusionCriteria: "", analysisPlan: "", limitations: "",
  ethicsReview: "required", dataSensitivity: "public", stage: "discovery", owner: "",
  version: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
});

export function assessProtocol(p: ResearchProtocol, evidence: EvidenceItem[] = []): ProtocolAssessment {
  const checks: QualityCheck[] = [
    { key: "question", label: "Research question is specific", passed: p.question.trim().length >= 25 && p.question.trim().endsWith("?"), severity: "critical", detail: "Write one bounded, answerable question ending in a question mark." },
    { key: "hypothesis", label: "Testable hypothesis or explicit exploratory design", passed: p.hypothesis.trim().length >= 20 || p.method.toLowerCase().includes("exploratory"), severity: "critical", detail: "State a falsifiable expectation or explain why the study is exploratory." },
    { key: "population", label: "Target population defined", passed: p.targetPopulation.trim().length >= 8, severity: "critical", detail: "Define who or what the findings are intended to describe." },
    { key: "outcome", label: "Primary outcome operationalised", passed: p.primaryOutcome.trim().length >= 8, severity: "critical", detail: "Specify the primary outcome and how it will be measured." },
    { key: "method", label: "Methodology recorded", passed: p.method.trim().length >= 15, severity: "important", detail: "Describe the design, instruments and measurement procedure." },
    { key: "sampling", label: "Sampling strategy recorded", passed: p.sampling.trim().length >= 12, severity: "important", detail: "Document sampling frame, recruitment or data inclusion process." },
    { key: "analysis", label: "Analysis plan recorded", passed: p.analysisPlan.trim().length >= 20, severity: "important", detail: "Record planned transformations, statistical tests and missing-data handling." },
    { key: "criteria", label: "Inclusion and exclusion criteria recorded", passed: p.inclusionCriteria.trim().length >= 5 && p.exclusionCriteria.trim().length >= 5, severity: "recommended", detail: "State what is included and excluded before examining results." },
    { key: "limitations", label: "Limitations documented", passed: p.limitations.trim().length >= 20, severity: "important", detail: "Record expected bias, confounding, coverage and generalisability limits." },
    { key: "ethics", label: "Ethics and data sensitivity reviewed", passed: p.ethicsReview !== "required" && p.dataSensitivity !== "sensitive", severity: "critical", detail: "Resolve ethics review and sensitive-data handling before collection. This checklist is not ethics approval." },
    { key: "evidence", label: "Evidence provenance attached", passed: evidence.some(e => /^https?:\/\//i.test(e.url) && e.publisher.trim() && e.title.trim()), severity: "recommended", detail: "Attach at least one traceable source with publisher and URL." },
    { key: "geography", label: "Geographic scope recorded", passed: p.geography.trim().length >= 2, severity: "recommended", detail: "Specify geography or explain that the research is not geographically bounded." },
  ];
  const critical = checks.filter(c => c.severity === "critical");
  const blocked = critical.some(c => !c.passed);
  const score = Math.round(checks.filter(c => c.passed).length / checks.length * 100);
  const warnings = checks.filter(c => !c.passed).map(c => c.detail);
  return { score, grade: blocked ? "Not ready for data collection" : score >= 90 ? "Protocol review-ready" : score >= 70 ? "Protocol developing" : "Early-stage protocol", checks, blocked, warnings };
}

export function createAuditEvent(action: string, detail: string, actor = "workspace user"): AuditEvent {
  return { id: crypto.randomUUID(), at: new Date().toISOString(), action, detail, actor };
}

export function buildReproducibilityManifest(protocol: ResearchProtocol, evidence: EvidenceItem[], assessment: ProtocolAssessment) {
  return {
    schema: "synthora.reproducibility-manifest.v2",
    generatedAt: new Date().toISOString(),
    platform: "SYNTHORA v2.0",
    protocol: { ...protocol, version: protocol.version },
    evidence: evidence.map(item => ({ ...item })),
    qualityAssessment: assessment,
    execution: {
      runId: null,
      randomSeed: null,
      softwareCommit: null,
      modelProvider: null,
      modelIdentifier: null,
      parameterSnapshot: {},
      rawDataLocation: null,
      analysisCodeLocation: null,
      note: "Populate execution identifiers after a real run. Null fields are intentionally not fabricated.",
    },
    provenance: {
      evidenceCount: evidence.length,
      evidenceUrls: evidence.map(item => item.url).filter(Boolean),
      createdAt: protocol.createdAt,
      lastUpdatedAt: protocol.updatedAt,
    },
    limitations: [
      "A complete manifest documents provenance; it does not prove that a study is valid, unbiased or independently reproduced.",
      "Evidence quality labels are researcher assessments and are not automatically verified by SYNTHORA.",
      "Do not upload personal, confidential or sensitive participant data into this browser-local workspace.",
      "Synthetic agent outputs are simulations and must not be described as observations from real participants.",
    ],
  };
}

export function decisionReadiness(protocol: ResearchProtocol, assessment: ProtocolAssessment, evidence: EvidenceItem[]) {
  const highOrModerate = evidence.filter(e => e.quality === "high" || e.quality === "moderate").length;
  const opposing = evidence.filter(e => e.supports === "challenges").length;
  const supporting = evidence.filter(e => e.supports === "supports").length;
  const balanced = supporting > 0 && opposing > 0;
  return {
    protocolReady: !assessment.blocked,
    evidenceCount: evidence.length,
    assessedEvidenceCount: evidence.filter(e => e.quality !== "unassessed").length,
    strongerEvidenceCount: highOrModerate,
    hasCounterEvidence: opposing > 0,
    evidenceBalance: balanced ? "Support and challenge evidence recorded" : supporting > 0 ? "Support evidence only — actively seek counter-evidence" : opposing > 0 ? "Challenge evidence only" : "No directional evidence classified",
    stage: protocol.stage,
    canMoveToAnalysis: !assessment.blocked && evidence.length >= 2 && evidence.every(e => Boolean(e.url)),
    recommendation: assessment.blocked ? "Complete critical protocol gates before collecting or analysing data." : evidence.length < 2 ? "Build an evidence base with traceable, independent sources, including counter-evidence." : !balanced ? "Search for and record evidence that could challenge the current hypothesis." : "Protocol and evidence inventory are documented. Human scientific review is still required.",
  };
}
