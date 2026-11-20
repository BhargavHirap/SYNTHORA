"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, ClipboardCheck, Download, FileText, Plus, ShieldCheck, Trash2 } from "lucide-react";
import {
  assessProtocol, buildReproducibilityManifest, createAuditEvent, decisionReadiness, emptyProtocol,
  type AuditEvent, type EvidenceItem, type ResearchProtocol,
} from "@/lib/research-control-plane";

const STORAGE = "synthora-v20-research-control-plane";
type Workspace = { protocol: ResearchProtocol; evidence: EvidenceItem[]; audit: AuditEvent[] };
const blankEvidence = (): EvidenceItem => ({
  id: crypto.randomUUID(), title: "", publisher: "", url: "", evidenceClass: "other",
  publishedDate: "", accessDate: new Date().toISOString().slice(0, 10), claim: "",
  supports: "unknown", quality: "unassessed", notes: "",
});
const blankWorkspace = (): Workspace => ({ protocol: emptyProtocol(), evidence: [], audit: [] });

function downloadJson(filename: string, data: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = filename; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ResearchControlPlane() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [showAllChecks, setShowAllChecks] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) {
        const parsed = JSON.parse(raw) as Workspace;
        if (parsed?.protocol?.id && Array.isArray(parsed.evidence) && Array.isArray(parsed.audit)) setWorkspace(parsed);
        else setWorkspace(blankWorkspace());
      } else setWorkspace(blankWorkspace());
    } catch { setWorkspace(blankWorkspace()); setNotice("Saved workspace could not be read; a fresh local workspace was opened."); }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !workspace) return;
    try { localStorage.setItem(STORAGE, JSON.stringify(workspace)); }
    catch { setNotice("Browser storage is full or unavailable. Export the manifest to keep a copy."); }
  }, [ready, workspace]);

  const assessment = useMemo(() => workspace ? assessProtocol(workspace.protocol, workspace.evidence) : null, [workspace]);
  const readiness = useMemo(() => workspace && assessment ? decisionReadiness(workspace.protocol, assessment, workspace.evidence) : null, [workspace, assessment]);

  function updateProtocol(patch: Partial<ResearchProtocol>) {
    setWorkspace(current => current ? ({
      ...current,
      protocol: { ...current.protocol, ...patch, updatedAt: new Date().toISOString() },
    }) : current);
  }
  function record(action: string, detail: string) {
    setWorkspace(current => current ? ({ ...current, audit: [createAuditEvent(action, detail), ...current.audit].slice(0, 100) }) : current);
  }
  function addEvidence() {
    const item = blankEvidence();
    setWorkspace(current => current ? ({ ...current, evidence: [item, ...current.evidence] }) : current);
    record("Evidence record created", "A new source record was added to the evidence ledger.");
  }
  function updateEvidence(id: string, patch: Partial<EvidenceItem>) {
    setWorkspace(current => current ? ({ ...current, evidence: current.evidence.map(item => item.id === id ? { ...item, ...patch } : item) }) : current);
  }
  function removeEvidence(id: string) {
    setWorkspace(current => current ? ({ ...current, evidence: current.evidence.filter(item => item.id !== id) }) : current);
    record("Evidence record removed", "An evidence item was removed from the local ledger.");
  }
  function changeStage(stage: ResearchProtocol["stage"]) {
    updateProtocol({ stage });
    record("Research stage changed", "Workspace moved to " + stage.replaceAll("_", " ") + ".");
  }
  function resetWorkspace() {
    if (!window.confirm("Start a new protocol? Export your current manifest first if you need to keep it.")) return;
    setWorkspace(blankWorkspace());
    setNotice("New research workspace created.");
  }

  if (!workspace || !assessment || !readiness) return <section className="panel rounded-2xl p-6 text-sm text-slate-400">Loading research control plane…</section>;
  const p = workspace.protocol;
  const Field = ({ label, value, onChange, placeholder = "", multiline = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; multiline?: boolean }) => (
    <label className="block">
      <span className="mb-2 block text-[11px] text-slate-400">{label}</span>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="field min-h-20" />
        : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="field" />}
    </label>
  );

  return <section className="mt-10 space-y-5" id="research-control-plane">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><div className="eyebrow flex items-center gap-2"><Activity size={13}/> SYNTHORA v2.0 / Research operating system</div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Research control plane</h2>
        <p className="mt-2 max-w-3xl text-xs leading-6 text-slate-400">A structured workspace connecting research questions, preregistered methods, source provenance, quality gates, decision readiness and reproducibility records. It coordinates the scientific workflow; it does not replace expert review.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => downloadJson("synthora-v2-reproducibility-manifest.json", buildReproducibilityManifest(p, workspace.evidence, assessment))} className="rounded-lg border border-emerald-300/30 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-300/10"><Download size={13} className="mr-1 inline"/> Export manifest</button>
        <button onClick={resetWorkspace} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:border-white/30">New protocol</button>
      </div>
    </div>

    {notice && <div role="status" className="rounded-lg border border-amber-300/20 bg-amber-300/[.05] px-4 py-3 text-xs text-amber-100">{notice}</div>}

    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div className="panel rounded-xl p-4"><div className="text-[10px] uppercase tracking-widest text-slate-500">Protocol completeness</div><div className="mt-2 text-3xl font-semibold">{assessment.score}%</div><div className="mt-1 text-[10px] text-emerald-200">{assessment.grade}</div></div>
      <div className="panel rounded-xl p-4"><div className="text-[10px] uppercase tracking-widest text-slate-500">Evidence ledger</div><div className="mt-2 text-3xl font-semibold">{workspace.evidence.length}</div><div className="mt-1 text-[10px] text-slate-400">{readiness.assessedEvidenceCount} quality-assessed records</div></div>
      <div className="panel rounded-xl p-4"><div className="text-[10px] uppercase tracking-widest text-slate-500">Counter-evidence</div><div className="mt-2 text-xl font-semibold">{readiness.hasCounterEvidence ? "Present" : "Missing"}</div><div className="mt-1 text-[10px] text-slate-400">{readiness.evidenceBalance}</div></div>
      <div className="panel rounded-xl p-4"><div className="text-[10px] uppercase tracking-widest text-slate-500">Research stage</div><div className="mt-2 text-xl font-semibold capitalize">{p.stage.replaceAll("_", " ")}</div><div className="mt-1 text-[10px] text-slate-400">{workspace.audit.length} audit events</div></div>
    </div>

    <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
      <div className="panel rounded-2xl p-5">
        <div className="mb-5 flex items-center justify-between gap-3"><div><div className="eyebrow">01 / Study design</div><h3 className="mt-2 text-lg font-semibold">Research protocol</h3></div><span className="rounded-full border border-white/10 px-3 py-1 text-[10px] text-slate-400">v{p.version}</span></div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2"><Field label="Protocol title" value={p.title} onChange={title => updateProtocol({ title })} placeholder="A concise title for this study"/></div>
          <div className="md:col-span-2"><Field label="Research question" value={p.question} onChange={question => updateProtocol({ question })} placeholder="What relationship or outcome will this study investigate?" multiline/></div>
          <div className="md:col-span-2"><Field label="Hypothesis / exploratory rationale" value={p.hypothesis} onChange={hypothesis => updateProtocol({ hypothesis })} placeholder="State what evidence would support or challenge the expectation." multiline/></div>
          <Field label="Research domain" value={p.domain} onChange={domain => updateProtocol({ domain })} placeholder="Public health, economics, climate…"/>
          <Field label="Geography" value={p.geography} onChange={geography => updateProtocol({ geography })} placeholder="India / Maharashtra / global"/>
          <Field label="Target population" value={p.targetPopulation} onChange={targetPopulation => updateProtocol({ targetPopulation })} placeholder="Population or units the study describes"/>
          <Field label="Primary outcome and measurement" value={p.primaryOutcome} onChange={primaryOutcome => updateProtocol({ primaryOutcome })} placeholder="Outcome, unit and measurement procedure"/>
          <div className="md:col-span-2"><Field label="Methodology / study design" value={p.method} onChange={method => updateProtocol({ method })} placeholder="Observational cohort, controlled experiment, systematic review…" multiline/></div>
          <Field label="Sampling frame and strategy" value={p.sampling} onChange={sampling => updateProtocol({ sampling })} placeholder="Sampling frame, selection and sample size"/>
          <Field label="Inclusion criteria" value={p.inclusionCriteria} onChange={inclusionCriteria => updateProtocol({ inclusionCriteria })} placeholder="What qualifies for inclusion?"/>
          <Field label="Exclusion criteria" value={p.exclusionCriteria} onChange={exclusionCriteria => updateProtocol({ exclusionCriteria })} placeholder="What is excluded and why?"/>
          <div className="md:col-span-2"><Field label="Pre-specified analysis plan" value={p.analysisPlan} onChange={analysisPlan => updateProtocol({ analysisPlan })} placeholder="Outcomes, statistical methods, missing data, sensitivity analysis…" multiline/></div>
          <div className="md:col-span-2"><Field label="Known limitations, bias and confounders" value={p.limitations} onChange={limitations => updateProtocol({ limitations })} placeholder="Coverage gaps, confounding, measurement error, generalisability…" multiline/></div>
          <Field label="Protocol owner / team" value={p.owner} onChange={owner => updateProtocol({ owner })} placeholder="Researcher or team"/>
          <label className="block"><span className="mb-2 block text-[11px] text-slate-400">Workflow stage</span><select value={p.stage} onChange={e => changeStage(e.target.value as ResearchProtocol["stage"])} className="field"><option value="discovery">Discovery</option><option value="design">Design</option><option value="data_collection">Data collection</option><option value="analysis">Analysis</option><option value="review">Review</option><option value="archived">Archived</option></select></label>
          <label className="block"><span className="mb-2 block text-[11px] text-slate-400">Ethics review status</span><select value={p.ethicsReview} onChange={e => updateProtocol({ ethicsReview: e.target.value as ResearchProtocol["ethicsReview"] })} className="field"><option value="required">Required / not resolved</option><option value="not_applicable">Not applicable (document rationale separately)</option><option value="in_review">In review</option><option value="approved">Approved by relevant body</option></select></label>
          <label className="block"><span className="mb-2 block text-[11px] text-slate-400">Data sensitivity</span><select value={p.dataSensitivity} onChange={e => updateProtocol({ dataSensitivity: e.target.value as ResearchProtocol["dataSensitivity"] })} className="field"><option value="public">Public / non-personal</option><option value="internal">Internal</option><option value="personal">Personal data</option><option value="sensitive">Sensitive personal data</option></select></label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2"><button onClick={() => { updateProtocol({ version: p.version + 1 }); record("Protocol version incremented", "Protocol version advanced to v" + (p.version + 1) + "."); }} className="rounded-lg border border-white/10 px-3 py-2 text-xs hover:border-emerald-300/40">Save protocol version v{p.version + 1}</button><span className="self-center text-[10px] text-slate-500">Autosaved locally · last edit {new Date(p.updatedAt).toLocaleString()}</span></div>
      </div>

      <div className="space-y-5">
        <div className="panel rounded-2xl p-5">
          <div className="eyebrow">02 / Quality gates</div><div className="mt-2 flex items-center justify-between"><h3 className="text-lg font-semibold">Protocol assessment</h3><button onClick={() => setShowAllChecks(v => !v)} className="text-[10px] text-emerald-200">{showAllChecks ? "Show failures" : "Show all checks"}</button></div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-emerald-300 transition-all" style={{ width: assessment.score + "%" }}/></div>
          <div className="mt-4 space-y-3">{assessment.checks.filter(c => showAllChecks || !c.passed).map(check => <div key={check.key} className="flex gap-3 text-[11px]"><span className={check.passed ? "text-emerald-300" : check.severity === "critical" ? "text-rose-300" : "text-amber-200"}>{check.passed ? "✓" : "!"}</span><div><div className="text-slate-200">{check.label}<span className="ml-2 text-[9px] uppercase tracking-wider text-slate-500">{check.severity}</span></div>{!check.passed && <p className="mt-1 leading-5 text-slate-500">{check.detail}</p>}</div></div>)}</div>
          {assessment.blocked && <div className="mt-4 rounded-lg border border-rose-300/20 bg-rose-300/[.05] p-3 text-[11px] leading-5 text-rose-100">Critical protocol gates remain open. This workspace flags readiness; it does not authorize research or ethics approval.</div>}
        </div>

        <div className="panel rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3"><div><div className="eyebrow">03 / Evidence ledger</div><h3 className="mt-2 text-lg font-semibold">Source provenance</h3></div><button onClick={addEvidence} className="rounded-lg border border-emerald-300/30 p-2 text-emerald-200 hover:bg-emerald-300/10" aria-label="Add evidence source"><Plus size={15}/></button></div>
          <p className="mt-2 text-[10px] leading-5 text-slate-500">Record traceable sources and whether they support, challenge or contextualise the hypothesis. URLs are researcher-entered and not automatically verified.</p>
          <div className="mt-4 space-y-3">{workspace.evidence.length === 0 && <div className="rounded-lg border border-dashed border-white/10 p-4 text-center text-[11px] text-slate-500">No sources recorded. Add peer-reviewed research, official statistics or datasets.</div>}
            {workspace.evidence.map(item => <div key={item.id} className="rounded-xl border border-white/[.08] bg-black/20 p-3">
              <div className="mb-2 flex items-center justify-between"><span className="text-[10px] text-emerald-200">SOURCE RECORD</span><button onClick={() => removeEvidence(item.id)} className="text-slate-600 hover:text-rose-300" aria-label="Remove source"><Trash2 size={13}/></button></div>
              <input value={item.title} onChange={e => updateEvidence(item.id, { title: e.target.value })} className="field mb-2" placeholder="Publication / dataset title"/>
              <div className="grid grid-cols-2 gap-2"><input value={item.publisher} onChange={e => updateEvidence(item.id, { publisher: e.target.value })} className="field mb-2" placeholder="Publisher"/><input value={item.url} onChange={e => updateEvidence(item.id, { url: e.target.value })} className="field mb-2" placeholder="https://…"/></div>
              <textarea value={item.claim} onChange={e => updateEvidence(item.id, { claim: e.target.value })} className="field min-h-16" placeholder="What claim or result is relevant?"/>
              <div className="grid grid-cols-2 gap-2">
                <select value={item.evidenceClass} onChange={e => updateEvidence(item.id, { evidenceClass: e.target.value as EvidenceItem["evidenceClass"] })} className="field"><option value="peer_reviewed">Peer reviewed</option><option value="official_statistics">Official statistics</option><option value="preprint">Preprint</option><option value="technical_report">Technical report</option><option value="dataset">Dataset</option><option value="other">Other</option></select>
                <select value={item.supports} onChange={e => updateEvidence(item.id, { supports: e.target.value as EvidenceItem["supports"] })} className="field"><option value="unknown">Unclassified</option><option value="supports">Supports hypothesis</option><option value="challenges">Challenges hypothesis</option><option value="context">Context only</option></select>
                <select value={item.quality} onChange={e => updateEvidence(item.id, { quality: e.target.value as EvidenceItem["quality"] })} className="field"><option value="unassessed">Quality unassessed</option><option value="high">High (researcher-rated)</option><option value="moderate">Moderate (researcher-rated)</option><option value="low">Low (researcher-rated)</option></select>
                <input type="date" value={item.publishedDate} onChange={e => updateEvidence(item.id, { publishedDate: e.target.value })} className="field"/>
              </div>
            </div>)}
          </div>
        </div>

        <div className="panel rounded-2xl p-5">
          <div className="eyebrow">04 / Decision support</div><h3 className="mt-2 text-lg font-semibold">Research readiness</h3>
          <div className="mt-4 flex items-center gap-2 text-xs"><ShieldCheck size={15} className={readiness.protocolReady ? "text-emerald-300" : "text-rose-300"}/>{readiness.protocolReady ? "Critical protocol gates passed" : "Critical protocol gates incomplete"}</div>
          <p className="mt-3 text-[11px] leading-5 text-slate-400">{readiness.recommendation}</p>
          <div className="mt-3 rounded-lg border border-white/[.07] bg-black/20 p-3 text-[10px] leading-5 text-slate-500">{readiness.evidenceBalance}. Stronger evidence records: {readiness.strongerEvidenceCount}. Analysis readiness requires a documented protocol and at least two traceable evidence records; it is a workflow check, not scientific endorsement.</div>
        </div>

        <div className="panel rounded-2xl p-5">
          <div className="flex items-center gap-2"><ClipboardCheck size={15} className="text-emerald-300"/><h3 className="text-sm font-semibold">Audit trail</h3></div>
          <div className="mt-3 space-y-2">{workspace.audit.length === 0 ? <p className="text-[10px] text-slate-500">Protocol edits are autosaved. Stage and ledger actions appear here.</p> : workspace.audit.slice(0, 8).map(event => <div key={event.id} className="border-l border-white/10 pl-3"><div className="text-[10px] text-slate-300">{event.action}</div><div className="mt-1 text-[9px] text-slate-500">{new Date(event.at).toLocaleString()} · {event.detail}</div></div>)}</div>
        </div>
      </div>
    </div>
    <div className="rounded-xl border border-amber-300/15 bg-amber-300/[.035] p-4 text-[10px] leading-5 text-amber-100/70"><FileText size={13} className="mr-2 inline"/>Scientific integrity: evidence classifications are user assessments; source URLs are not verified; no ethics approval is granted; no human-subject data should be stored here; synthetic simulation outputs are not empirical observations. Workspace data is browser-local until a separately configured authenticated cloud workspace is enabled.</div>
  </section>;
}
