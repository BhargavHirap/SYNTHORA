"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { BarChart3, ClipboardCheck, Download, FlaskConical, Plus, ShieldAlert, Trash2 } from "lucide-react";
import {
  analyzeTwoArm, createExperimentReport, experimentQuality, requiredSamplePerArm,
  type ExperimentPlan, type TwoArmAnalysis,
} from "@/lib/experiment-validation";

const KEY = "synthora-v18-experiment-registry";
const blankPlan = (): ExperimentPlan => ({
  id: crypto.randomUUID(), title: "New controlled experiment", question: "", hypothesis: "",
  control: "Current experience / baseline", treatment: "Proposed change",
  primaryMetric: "Conversion or completion rate", market: "India", population: "",
  allocation: "Random 1:1 assignment", plannedPerArm: 100, baselineRate: 0.2,
  minimumDetectableEffect: 0.05, durationDays: 14,
  successRule: "Two-sided p < 0.05 and effect meets the predeclared practical threshold.",
  preregisteredAt: "", createdAt: new Date().toISOString(), status: "planned",
  sourceUrl: "", sourceDate: "", sourceMethod: "", simulationEstimate: null,
  observedControl: null, observedTreatment: null, controlN: null, treatmentN: null, notes: "",
});

const inputClass = "field w-full";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-[11px] text-slate-400">{label}<div className="mt-1.5">{children}</div></label>;
}

export default function ExperimentalValidationStudio() {
  const [plans, setPlans] = useState<ExperimentPlan[]>([]);
  const [activeId, setActiveId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (Array.isArray(saved)) {
        setPlans(saved.slice(0, 50));
        setActiveId(saved[0]?.id || "");
      }
    } catch {
      setError("Could not read the local experiment registry.");
    }
  }, []);

  const active = plans.find((plan) => plan.id === activeId) || null;
  const analysis = useMemo<TwoArmAnalysis | null>(() => {
    if (!active || active.controlN == null || active.treatmentN == null ||
        active.observedControl == null || active.observedTreatment == null) return null;
    try {
      return analyzeTwoArm({
        controlN: active.controlN, controlSuccesses: active.observedControl,
        treatmentN: active.treatmentN, treatmentSuccesses: active.observedTreatment,
      });
    } catch { return null; }
  }, [active]);
  const quality = active ? experimentQuality(active) : null;
  const sampleEstimate = active ? requiredSamplePerArm(active.baselineRate, active.minimumDetectableEffect) : null;

  function persist(next: ExperimentPlan[]) {
    setPlans(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); }
    catch { setError("Browser storage is full or unavailable. Export your data before continuing."); }
  }
  function addPlan() {
    const plan = blankPlan();
    persist([plan, ...plans].slice(0, 50));
    setActiveId(plan.id);
    setError("");
  }
  function patch(values: Partial<ExperimentPlan>) {
    if (!active) return;
    persist(plans.map((plan) => plan.id === active.id ? { ...plan, ...values } : plan));
  }
  function setNumber(key: "plannedPerArm" | "baselineRate" | "minimumDetectableEffect" | "durationDays" | "simulationEstimate" | "observedControl" | "observedTreatment" | "controlN" | "treatmentN", value: string) {
    patch({ [key]: value.trim() === "" ? null : Number(value) } as Partial<ExperimentPlan>);
  }
  function exportReport() {
    if (!active) return;
    const blobUrl = URL.createObjectURL(new Blob([JSON.stringify(createExperimentReport(active, analysis), null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = "synthora-experiment-" + active.id + ".json";
    anchor.click();
    URL.revokeObjectURL(blobUrl);
  }
  function removePlan() {
    if (!active || !window.confirm("Delete this experiment and its local record?")) return;
    const next = plans.filter((plan) => plan.id !== active.id);
    persist(next);
    setActiveId(next[0]?.id || "");
  }
  function completeAnalysis() {
    if (!analysis) { setError("Enter valid aggregate counts for both arms before completing."); return; }
    patch({ status: "completed" });
    setError("");
  }

  return (
    <section id="experimental-validation" className="mt-12 space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow flex items-center gap-2"><FlaskConical size={13} /> V1.8 / Experimental intelligence & validation</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Turn hypotheses into reproducible experiments.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Pre-register a controlled study, capture aggregate outcomes, calculate effect sizes and uncertainty, and compare observed results with a simulation estimate. This is an analysis workspace—not a participant recruitment or randomization service.</p>
        </div>
        <button onClick={addPlan} className="inline-flex items-center gap-2 rounded-lg bg-emerald-300 px-4 py-2.5 text-xs font-semibold text-[#07110e]"><Plus size={14} /> New experiment</button>
      </header>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <aside className="panel rounded-2xl p-4">
          <div className="eyebrow">Experiment registry · {plans.length}/50</div>
          {plans.length ? <div className="mt-3 space-y-2">
            {plans.map((plan) => (
              <button key={plan.id} onClick={() => { setActiveId(plan.id); setError(""); }}
                className={"w-full rounded-xl border p-3 text-left " + (plan.id === activeId ? "border-emerald-300/40 bg-emerald-300/[.06]" : "border-white/[.07]")}>
                <span className="block truncate text-xs text-slate-200">{plan.title || "Untitled experiment"}</span>
                <span className="mt-1 block text-[10px] text-slate-500">{plan.status} · {new Date(plan.createdAt).toLocaleDateString()}</span>
              </button>
            ))}
          </div> : <p className="mt-3 text-xs text-slate-500">Create your first experiment plan.</p>}
        </aside>

        {active ? <div className="space-y-4">
          <div className="panel rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><div className="eyebrow">Design & preregistration</div><h3 className="mt-1 text-lg font-semibold">{active.title}</h3></div>
              <div className="flex gap-2">
                <button onClick={exportReport} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-[10px]"><Download size={12} /> Report JSON</button>
                <button onClick={removePlan} aria-label="Delete experiment" className="rounded-lg border border-white/10 p-2 text-slate-500"><Trash2 size={13} /></button>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Experiment title"><input className={inputClass} value={active.title} onChange={(e) => patch({ title: e.target.value })} /></Field>
              <Field label="Research question"><input className={inputClass} value={active.question} onChange={(e) => patch({ question: e.target.value })} /></Field>
              <div className="sm:col-span-2"><Field label="Falsifiable hypothesis"><textarea className={inputClass + " min-h-20"} value={active.hypothesis} onChange={(e) => patch({ hypothesis: e.target.value })} /></Field></div>
              <Field label="Control condition"><input className={inputClass} value={active.control} onChange={(e) => patch({ control: e.target.value })} /></Field>
              <Field label="Treatment condition"><input className={inputClass} value={active.treatment} onChange={(e) => patch({ treatment: e.target.value })} /></Field>
              <Field label="Primary metric"><input className={inputClass} value={active.primaryMetric} onChange={(e) => patch({ primaryMetric: e.target.value })} /></Field>
              <Field label="Market / geography"><input className={inputClass} value={active.market} onChange={(e) => patch({ market: e.target.value })} /></Field>
              <Field label="Target population"><input className={inputClass} value={active.population} onChange={(e) => patch({ population: e.target.value })} /></Field>
              <Field label="Allocation method"><input className={inputClass} value={active.allocation} onChange={(e) => patch({ allocation: e.target.value })} /></Field>
              <Field label="Planned sample per arm"><input type="number" min="1" className={inputClass} value={active.plannedPerArm} onChange={(e) => setNumber("plannedPerArm", e.target.value)} /></Field>
              <Field label="Study duration (days)"><input type="number" min="1" className={inputClass} value={active.durationDays} onChange={(e) => setNumber("durationDays", e.target.value)} /></Field>
              <Field label="Baseline rate (0–1)"><input type="number" min="0.001" max="0.999" step="0.01" className={inputClass} value={active.baselineRate} onChange={(e) => setNumber("baselineRate", e.target.value)} /></Field>
              <Field label="Minimum detectable absolute effect (0–1)"><input type="number" min="0.001" max="0.5" step="0.01" className={inputClass} value={active.minimumDetectableEffect} onChange={(e) => setNumber("minimumDetectableEffect", e.target.value)} /></Field>
              <div className="sm:col-span-2"><Field label="Predeclared success / stopping rule"><textarea className={inputClass + " min-h-16"} value={active.successRule} onChange={(e) => patch({ successRule: e.target.value })} /></Field></div>
              <Field label="Preregistration date"><input type="date" className={inputClass} value={active.preregisteredAt} onChange={(e) => patch({ preregisteredAt: e.target.value })} /></Field>
              <Field label="Simulation estimate for treatment rate (optional)"><input type="number" min="0" max="1" step="0.01" placeholder="e.g. 0.27" className={inputClass} value={active.simulationEstimate ?? ""} onChange={(e) => setNumber("simulationEstimate", e.target.value)} /></Field>
            </div>

            <div className="mt-4 rounded-xl border border-white/[.08] p-3">
              <div className="flex items-center justify-between"><span className="text-xs font-medium">Plan completeness</span><span className="text-sm text-emerald-200">{quality?.score}%</span></div>
              <div className="mt-2 h-1.5 rounded-full bg-white/10"><div className="h-1.5 rounded-full bg-emerald-300" style={{ width: (quality?.score || 0) + "%" }} /></div>
              <p className="mt-2 text-[10px] text-slate-500">{quality?.grade} · completeness checklist, not a scientific-validity rating.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">{quality?.checks.map(([label, ok]) => <div key={label} className="flex items-center gap-2 text-[10px] text-slate-400"><span className={ok ? "text-emerald-300" : "text-amber-300"}>{ok ? "✓" : "○"}</span>{label}</div>)}</div>
              <p className="mt-3 text-[10px] text-slate-400">Estimated sample size: {sampleEstimate ? sampleEstimate.toLocaleString() + " per arm (approx. 80% power)" : "Enter a valid baseline and effect."}</p>
              <button onClick={() => patch({ preregisteredAt: active.preregisteredAt || new Date().toISOString().slice(0, 10) })} className="mt-3 rounded-lg border border-emerald-300/30 px-3 py-2 text-[10px] text-emerald-200">Record preregistration date</button>
            </div>
          </div>

          <div className="panel rounded-2xl p-5">
            <div className="eyebrow flex items-center gap-2"><BarChart3 size={13} /> Aggregate outcome analysis</div>
            <p className="mt-2 text-xs leading-5 text-slate-400">Enter counts from a completed study. Do not enter names, contact details or individual-level records.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Control participants (n)"><input type="number" min="1" className={inputClass} value={active.controlN ?? ""} onChange={(e) => setNumber("controlN", e.target.value)} /></Field>
              <Field label="Control successes"><input type="number" min="0" className={inputClass} value={active.observedControl ?? ""} onChange={(e) => setNumber("observedControl", e.target.value)} /></Field>
              <Field label="Treatment participants (n)"><input type="number" min="1" className={inputClass} value={active.treatmentN ?? ""} onChange={(e) => setNumber("treatmentN", e.target.value)} /></Field>
              <Field label="Treatment successes"><input type="number" min="0" className={inputClass} value={active.observedTreatment ?? ""} onChange={(e) => setNumber("observedTreatment", e.target.value)} /></Field>
            </div>
            {analysis ? <>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-white/[.04] p-3"><div className="text-[10px] text-slate-500">Control rate</div><div className="mt-1 text-xl">{(analysis.controlRate * 100).toFixed(1)}%</div></div>
                <div className="rounded-xl bg-white/[.04] p-3"><div className="text-[10px] text-slate-500">Treatment rate</div><div className="mt-1 text-xl">{(analysis.treatmentRate * 100).toFixed(1)}%</div></div>
                <div className="rounded-xl bg-white/[.04] p-3"><div className="text-[10px] text-slate-500">Absolute effect</div><div className="mt-1 text-xl">{(analysis.riskDifference * 100).toFixed(1)} pp</div></div>
              </div>
              <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                <div className="rounded-lg border border-white/[.07] p-3">95% CI: [{(analysis.confidenceInterval[0] * 100).toFixed(1)}, {(analysis.confidenceInterval[1] * 100).toFixed(1)}] percentage points</div>
                <div className="rounded-lg border border-white/[.07] p-3">Two-sided p-value: {analysis.pValue.toFixed(4)} {analysis.significantAt05 ? "· below 0.05" : "· not below 0.05"}</div>
                <div className="rounded-lg border border-white/[.07] p-3">Cohen's h: {analysis.cohensH.toFixed(3)}</div>
                <div className="rounded-lg border border-white/[.07] p-3">Relative lift: {analysis.relativeLift === null ? "not defined" : (analysis.relativeLift * 100).toFixed(1) + "%"}</div>
              </div>
              <button onClick={completeAnalysis} className="mt-3 rounded-lg bg-emerald-300 px-4 py-2 text-xs font-semibold text-[#07110e]">Mark analysis complete</button>
              <div className="mt-3 space-y-1">{analysis.limitations.map((item) => <p key={item} className="text-[10px] leading-5 text-slate-500">• {item}</p>)}</div>
            </> : <p className="mt-3 text-xs text-slate-500">Enter valid sample sizes and success counts for both arms to calculate the analysis.</p>}
            {error && <p className="mt-3 text-xs text-rose-300">{error}</p>}
          </div>

          <div className="panel rounded-2xl p-5">
            <div className="eyebrow flex items-center gap-2"><ClipboardCheck size={13} /> Evidence provenance & simulation comparison</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Observed evidence source URL"><input className={inputClass} value={active.sourceUrl} onChange={(e) => patch({ sourceUrl: e.target.value })} placeholder="https://..." /></Field>
              <Field label="Source publication / collection date"><input type="date" className={inputClass} value={active.sourceDate} onChange={(e) => patch({ sourceDate: e.target.value })} /></Field>
              <div className="sm:col-span-2"><Field label="Method, sample frame and limitations"><textarea className={inputClass + " min-h-20"} value={active.sourceMethod} onChange={(e) => patch({ sourceMethod: e.target.value })} /></Field></div>
              <div className="sm:col-span-2"><Field label="Research notes / simulation seed"><textarea className={inputClass + " min-h-16"} value={active.notes} onChange={(e) => patch({ notes: e.target.value })} /></Field></div>
            </div>
            {analysis && active.simulationEstimate !== null && <div className="mt-3 rounded-xl border border-sky-300/20 bg-sky-300/[.04] p-3 text-xs">
              <div className="text-sky-200">Simulation vs observed treatment rate</div>
              <div className="mt-1 text-lg">{(active.simulationEstimate * 100).toFixed(1)}% vs {(analysis.treatmentRate * 100).toFixed(1)}%</div>
              <p className="mt-1 text-[10px] leading-5 text-slate-400">Gap: {((analysis.treatmentRate - active.simulationEstimate) * 100).toFixed(1)} percentage points. Descriptive comparison only—not model validation. Check population, metric and context alignment.</p>
            </div>}
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-amber-300/15 bg-amber-300/[.04] p-3 text-[10px] leading-5 text-amber-100/80">
            <ShieldAlert size={14} className="mt-0.5 shrink-0" />
            SYNTHORA does not run field experiments or verify participant data. Statistical calculations use aggregate counts and approximate methods. Obtain ethics approval and informed consent where applicable. Avoid high-stakes decisions based solely on this output.
          </div>
        </div> : <div className="panel rounded-2xl p-8 text-center text-sm text-slate-500">Select an experiment or create a new one.</div>}
      </div>
    </section>
  );
}
