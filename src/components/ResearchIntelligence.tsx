"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, BookOpen, Download, ExternalLink, Loader2, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";

type Observation = { id: string; market: string; country: string; indicatorCode: string; indicator: string; year: number; value: number; unit: string; observationStatus: string };
type Dataset = { provider: string; sourceId: string; sourceUrl: string; apiUrl: string; lastUpdated: string | null; retrievedAt: string; markets: { code: string; name: string }[]; indicators: { code: string; label: string; unit: string }[]; data: Observation[]; caveat: string };
type Finding = { claim: string; evidenceIds: string[]; strength: string; caveat: string };
type Report = { id: string; createdAt: string; question: string; source: string; sourceUrl: string; model: string; executiveSummary: string; findings: Finding[]; crossMarketPatterns: { pattern: string; evidenceIds: string[]; caveat: string }[]; researchQuestions: string[]; cannotConclude: string[]; evidence: Observation[]; methodology: string[] };
const marketOptions = [["IN","India"],["US","United States"],["GB","United Kingdom"],["DE","Germany"],["JP","Japan"],["BR","Brazil"]];
const historyKey = "synthora-research-history-v05";
const number = (value: number, unit: string) => unit === "people" ? new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 }).format(value) : new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(value) + (unit.startsWith("%") ? "%" : "");

export default function ResearchIntelligence() {
  const [markets, setMarkets] = useState(["IN","US","GB","DE","JP","BR"]);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("Compare digital access and economic context across these markets. What can the data support, and what should a product researcher investigate next?");
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [history, setHistory] = useState<Report[]>([]);
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem(historyKey) || "[]")); } catch {}
    fetch("/api/llm-cognitive").then(r => r.json()).then(x => setConfigured(Boolean(x.configured))).catch(() => {});
    void load();
  }, []);

  async function load() {
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/research-data?markets=${markets.join(",")}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load public indicators.");
      setDataset(result); setReport(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Dataset request failed."); }
    finally { setLoading(false); }
  }

  function toggleMarket(code: string) {
    setMarkets(current => current.includes(code) ? current.filter(x => x !== code) : current.length < 6 ? [...current, code] : current);
  }

  const latest = useMemo(() => {
    if (!dataset) return [];
    const map = new Map<string, Observation>();
    for (const row of dataset.data) {
      const key = `${row.market}-${row.indicatorCode}`;
      if (!map.has(key) || row.year > map.get(key)!.year) map.set(key, row);
    }
    return [...map.values()].sort((a,b) => a.market.localeCompare(b.market) || a.indicator.localeCompare(b.indicator));
  }, [dataset]);

  async function synthesize() {
    if (!dataset || !question.trim()) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/research-synthesis", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, evidence: latest }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Evidence synthesis failed.");
      setReport(result);
      const next = [result, ...history].slice(0, 10); setHistory(next); localStorage.setItem(historyKey, JSON.stringify(next));
    } catch (e) { setError(e instanceof Error ? e.message : "Synthesis failed."); }
    finally { setBusy(false); }
  }

  function exportReport() {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `synthora-research-${report.id.slice(0,8)}.json`; a.click(); URL.revokeObjectURL(url);
  }

  return <section id="research-intelligence" className="mt-10 space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><div className="eyebrow flex items-center gap-2"><BookOpen size={13}/> V0.5 / Research intelligence</div><h2 className="mt-2 text-2xl font-semibold tracking-tight">Evidence before simulation.</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Bring public, cited indicators into the experiment. Inspect source years, compare markets, then ask the model to explain only what the evidence can support.</p></div><span className="rounded-xl border border-emerald-300/20 px-3 py-2 text-[10px] text-emerald-200">WORLD BANK · PUBLIC DATA</span></div>
    <div className="panel rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="eyebrow">01 / Market scope</div><h3 className="mt-1 text-sm font-semibold">Choose countries to compare</h3></div><button onClick={load} disabled={loading || !markets.length} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-emerald-200 disabled:opacity-40">{loading ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14}/>}Refresh dataset</button></div>
      <div className="mt-4 flex flex-wrap gap-2">{marketOptions.map(([code,name])=><button key={code} onClick={()=>toggleMarket(code)} className={`rounded-lg border px-3 py-2 text-xs ${markets.includes(code) ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : "border-white/10 text-slate-500"}`}>{name}</button>)}</div>
      {error && <p className="mt-3 text-xs text-rose-300">{error}</p>}
      {dataset && <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-black/20 p-3"><div className="text-[10px] text-slate-500">OBSERVATIONS</div><div className="mt-1 text-xl font-semibold">{latest.length}</div></div><div className="rounded-xl bg-black/20 p-3"><div className="text-[10px] text-slate-500">COUNTRIES</div><div className="mt-1 text-xl font-semibold">{dataset.markets.length}</div></div><div className="rounded-xl bg-black/20 p-3"><div className="text-[10px] text-slate-500">DATASET UPDATED</div><div className="mt-1 text-xl font-semibold">{dataset.lastUpdated || "Not supplied"}</div></div></div>}
    </div>
    {dataset && <div className="panel rounded-2xl p-5"><div className="flex items-center gap-2 text-sm font-semibold"><Activity size={15} className="text-emerald-300"/> Latest available observations</div><p className="mt-1 text-[11px] text-slate-500">One latest non-empty observation per market and indicator. The observation year is shown; years can differ across indicators and countries.</p>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-[11px]"><thead className="text-slate-500"><tr>{["Market","Indicator","Year","Value"].map(x=><th key={x} className="border-b border-white/10 px-3 py-3 font-medium">{x}</th>)}</tr></thead><tbody>{latest.map(row=><tr key={row.id} className="border-b border-white/[.05]"><td className="px-3 py-3 text-slate-200">{row.country}</td><td className="px-3 py-3 text-slate-400">{row.indicator}</td><td className="px-3 py-3">{row.year}</td><td className="px-3 py-3 font-medium text-emerald-100">{number(row.value,row.unit)}</td></tr>)}</tbody></table></div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500"><span>{dataset.provider} · retrieved {new Date(dataset.retrievedAt).toLocaleString()}</span><a className="flex items-center gap-1 text-emerald-200" href={dataset.sourceUrl} target="_blank" rel="noreferrer">Open source <ExternalLink size={11}/></a></div>
      <p className="mt-3 text-[10px] leading-5 text-amber-100/70">{dataset.caveat}</p>
    </div>}
    {dataset && <div className="panel rounded-2xl p-5"><div className="eyebrow">02 / Evidence-grounded analysis</div><div className="mt-2 flex items-center justify-between gap-3"><h3 className="text-base font-semibold">Ask a research question</h3><span className={`rounded-full border px-2 py-1 text-[9px] ${configured ? "border-emerald-300/20 text-emerald-200" : "border-amber-300/20 text-amber-200"}`}>{configured ? "AI READY" : "AI KEY REQUIRED"}</span></div>
      <textarea value={question} onChange={e=>setQuestion(e.target.value)} maxLength={700} className="field mt-4 min-h-24" placeholder="What does the evidence say?"/>
      <button onClick={synthesize} disabled={busy || !configured || !latest.length || !question.trim()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-3 text-sm font-semibold text-[#07110e] disabled:opacity-40">{busy ? <><Loader2 size={15} className="animate-spin"/>Analysing cited evidence…</> : <><Sparkles size={15}/>Generate evidence-grounded brief</>}</button>
      {!configured && <p className="mt-2 text-[10px] text-amber-100/60">The data explorer is free to use. Add the server-side AI Gateway key to enable synthesis.</p>}
    </div>}
    {report && <div className="panel space-y-5 rounded-2xl p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="eyebrow">03 / Research brief</div><h3 className="mt-1 text-lg font-semibold">Evidence-linked findings</h3></div><button onClick={exportReport} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-emerald-200"><Download size={13}/>Export JSON</button></div>
      <p className="text-sm leading-6 text-slate-300">{report.executiveSummary}</p>
      <div className="space-y-3">{report.findings.map((finding,i)=><div key={i} className="rounded-xl border border-white/[.07] bg-black/20 p-4"><div className="flex items-center justify-between gap-2"><span className="text-[10px] uppercase tracking-wider text-emerald-200">{finding.strength}</span><span className="text-[9px] text-slate-500">{finding.evidenceIds.length} linked observations</span></div><p className="mt-2 text-sm">{finding.claim}</p><p className="mt-2 text-[11px] leading-5 text-slate-500">{finding.caveat}</p><div className="mt-2 flex flex-wrap gap-1">{finding.evidenceIds.map(id=><span key={id} className="rounded bg-white/[.05] px-2 py-1 font-mono text-[9px] text-slate-400">{id}</span>)}</div></div>)}</div>
      {report.crossMarketPatterns.length>0 && <div><h4 className="mb-2 text-xs font-semibold">Cross-market patterns</h4>{report.crossMarketPatterns.map((p,i)=><p key={i} className="mb-2 text-xs leading-5 text-slate-300">{p.pattern} <span className="text-slate-500">— {p.caveat}</span></p>)}</div>}
      <div className="grid gap-4 md:grid-cols-2"><div className="rounded-xl border border-white/[.06] p-4"><h4 className="text-xs font-semibold">What to investigate next</h4><ul className="mt-2 space-y-2">{report.researchQuestions.map((x,i)=><li key={i} className="text-[11px] leading-5 text-slate-400">• {x}</li>)}</ul></div><div className="rounded-xl border border-amber-300/10 p-4"><h4 className="flex items-center gap-2 text-xs font-semibold text-amber-100"><ShieldCheck size={13}/> What this cannot conclude</h4><ul className="mt-2 space-y-2">{report.cannotConclude.map((x,i)=><li key={i} className="text-[11px] leading-5 text-amber-100/60">• {x}</li>)}</ul></div></div>
      <p className="text-[10px] leading-5 text-slate-500">Model: {report.model}. Source: {report.source}. This is an AI-assisted interpretation, not a validated statistical estimate.</p>
    </div>}
    {history.length>0 && <div className="panel rounded-2xl p-5"><div className="eyebrow">Local archive · latest 10</div><div className="mt-3 space-y-2">{history.map(item=><button key={item.id} onClick={()=>setReport(item)} className="flex w-full items-center justify-between gap-3 rounded-lg border border-white/[.06] p-3 text-left text-xs hover:border-emerald-300/20"><span className="line-clamp-2">{item.question}</span><span className="shrink-0 text-[10px] text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</span></button>)}</div></div>}
    <p className="text-[10px] leading-5 text-slate-600">Macro-level country data is not a substitute for representative surveys, segment-level evidence, local research, or causal analysis.</p>
  </section>;
}
