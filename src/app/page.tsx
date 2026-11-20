"use client";

import { useMemo, useState } from "react";
import { Activity, ArrowDownRight, ArrowUpRight, BarChart3, BrainCircuit, ChevronDown, CircleHelp, FlaskConical, Globe2, Layers3, Loader2, Network, Play, Plus, Radar, ShieldCheck, Sparkles, Target, Users, X } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ExperimentInput, SimulationResult } from "@/lib/simulation";

const initialInput: ExperimentInput = {
  product: "Everyday hydration drink",
  description: "A low-sugar drink with locally familiar flavours and recyclable packaging.",
  market: "United States",
  audience: "Urban adults aged 18–34 who buy ready-to-drink beverages",
  price: 2.49,
  currency: "USD",
  sampleSize: 500,
  message: "Refreshment that fits your everyday routine.",
};

const markets = ["United States", "United Kingdom", "India", "Germany", "Japan", "Brazil", "Canada", "Australia", "Global / multi-market"];
const money: Record<string, string> = { "United States": "USD", "United Kingdom": "GBP", India: "INR", Germany: "EUR", Japan: "JPY", Brazil: "BRL", Canada: "CAD", Australia: "AUD", "Global / multi-market": "USD" };

function Metric({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof Activity }) {
  return <div className="panel rounded-2xl p-5"><div className="flex items-center justify-between"><span className="text-xs muted">{label}</span><Icon size={16} className="text-emerald-300" /></div><div className="mt-4 text-3xl font-semibold tracking-tight">{value}</div><div className="mt-2 text-xs muted">{detail}</div></div>;
}

export default function Home() {
  const [input, setInput] = useState<ExperimentInput>(initialInput);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showBuilder, setShowBuilder] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");
  const update = (key: keyof ExperimentInput, value: string | number) => setInput((current) => ({ ...current, [key]: value }));
  const chartData = useMemo(() => result ? result.segments.map((segment) => ({ segment: segment.name.split(" ")[0], intent: segment.intent, share: segment.share })) : [], [result]);

  async function runSimulation() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/simulate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to run simulation.");
      setResult(data); setShowBuilder(false); setActiveTab("Overview");
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setBusy(false); }
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="grid-noise pointer-events-none absolute inset-x-0 top-0 h-[560px]" />
      <div className="relative mx-auto max-w-[1440px] px-5 pb-16 md:px-9">
        <header className="flex h-[76px] items-center justify-between border-b border-white/[0.08]">
          <a href="#" className="flex items-center gap-3 no-underline">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-300/30 bg-emerald-300/10"><Radar size={20} className="text-emerald-300" /></div>
            <div><div className="text-[15px] font-bold tracking-[.22em]">SYNTHORA</div><div className="text-[9px] tracking-[.22em] text-slate-500">HUMAN SIMULATION INTELLIGENCE</div></div>
          </a>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] text-slate-400 md:flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> RESEARCH PREVIEW <span className="text-slate-600">/</span> v0.1</div>
          <button onClick={() => { setShowBuilder(true); setError(""); }} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:border-emerald-300/40 hover:text-white"><Plus size={14} /> New experiment</button>
        </header>

        <section className="grid gap-10 pb-9 pt-12 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
          <div><div className="eyebrow mb-4 flex items-center gap-2"><Sparkles size={12} /> Global behavioural intelligence</div><h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-.045em] md:text-6xl">Explore the <span className="text-emerald-300">possible.</span><br />Before the real world.</h1><p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">A research workspace for exploring how synthetic population segments may respond to products, prices and messages across markets.</p></div>
          <div className="panel rounded-2xl p-5 lg:ml-auto lg:w-full lg:max-w-md"><div className="flex items-center justify-between"><span className="text-xs text-slate-400">SIMULATION WORKSPACE</span><span className="rounded-full bg-emerald-300/10 px-2.5 py-1 text-[10px] text-emerald-200">EXPERIMENTAL</span></div><div className="mt-5 grid grid-cols-3 gap-3"><div><div className="text-2xl font-semibold">06</div><div className="mt-1 text-[10px] muted">Starter segments</div></div><div><div className="text-2xl font-semibold">09</div><div className="mt-1 text-[10px] muted">Market presets</div></div><div><div className="text-2xl font-semibold">01</div><div className="mt-1 text-[10px] muted">Engine mode</div></div></div><div className="mt-5 h-px bg-white/[0.08]" /><div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400"><ShieldCheck size={14} className="text-emerald-300" /> Synthetic data · Transparent assumptions · No real respondents</div></div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[350px_minmax(0,1fr)]">
          <aside className="space-y-4">
            {showBuilder ? <div className="panel rounded-2xl p-5">
              <div className="mb-5 flex items-center justify-between"><div><div className="eyebrow">01 / Configure</div><h2 className="mt-2 text-lg font-semibold">New simulation</h2></div><button onClick={() => setShowBuilder(false)} className="rounded-lg p-2 text-slate-500 hover:bg-white/5"><X size={16} /></button></div>
              <label className="mb-2 block text-[11px] text-slate-400">Product or concept</label><input value={input.product} onChange={(e) => update("product", e.target.value)} className="mb-4 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-sm outline-none focus:border-emerald-300/60" placeholder="e.g. Subscription fitness app" />
              <label className="mb-2 block text-[11px] text-slate-400">What is it? (optional)</label><textarea value={input.description} onChange={(e) => update("description", e.target.value)} rows={3} className="mb-4 w-full resize-none rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-xs leading-5 outline-none focus:border-emerald-300/60" />
              <label className="mb-2 block text-[11px] text-slate-400">Target market</label><div className="relative mb-4"><select value={input.market} onChange={(e) => { update("market", e.target.value); update("currency", money[e.target.value] || "USD"); }} className="w-full appearance-none rounded-lg border border-white/10 bg-[#111722] px-3 py-3 text-sm outline-none focus:border-emerald-300/60">{markets.map((market) => <option key={market}>{market}</option>)}</select><ChevronDown size={15} className="pointer-events-none absolute right-3 top-3.5 text-slate-500" /></div>
              <label className="mb-2 block text-[11px] text-slate-400">Audience definition</label><textarea value={input.audience} onChange={(e) => update("audience", e.target.value)} rows={2} className="mb-4 w-full resize-none rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-xs leading-5 outline-none focus:border-emerald-300/60" />
              <div className="mb-4 grid grid-cols-2 gap-3"><div><label className="mb-2 block text-[11px] text-slate-400">Price ({input.currency})</label><input type="number" min="0" step="0.01" value={input.price} onChange={(e) => update("price", Number(e.target.value))} className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-sm outline-none focus:border-emerald-300/60" /></div><div><label className="mb-2 block text-[11px] text-slate-400">Synthetic sample</label><select value={input.sampleSize} onChange={(e) => update("sampleSize", Number(e.target.value))} className="w-full rounded-lg border border-white/10 bg-[#111722] px-3 py-3 text-sm outline-none"><option value={100}>100 agents</option><option value={250}>250 agents</option><option value={500}>500 agents</option><option value={1000}>1,000 agents</option><option value={2500}>2,500 agents</option><option value={5000}>5,000 agents</option></select></div></div>
              <label className="mb-2 block text-[11px] text-slate-400">Message / positioning (optional)</label><textarea value={input.message} onChange={(e) => update("message", e.target.value)} rows={2} className="mb-5 w-full resize-none rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-xs leading-5 outline-none focus:border-emerald-300/60" />
              {error && <p className="mb-3 text-xs text-rose-300">{error}</p>}
              <button disabled={busy || !input.product.trim() || !input.audience.trim()} onClick={runSimulation} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-3.5 text-sm font-semibold text-[#07110e] transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-50">{busy ? <><Loader2 size={16} className="animate-spin" /> Running experiment…</> : <><Play size={15} fill="currentColor" /> Run simulation</>}</button>
              <p className="mt-3 text-center text-[10px] leading-4 text-slate-500">Illustrative synthetic research · Not a survey or forecast</p>
            </div> : <button onClick={() => setShowBuilder(true)} className="panel flex w-full items-center justify-between rounded-2xl p-5 text-left hover:border-emerald-300/30"><div><div className="eyebrow">Experiment builder</div><div className="mt-1 text-sm font-medium">Edit simulation inputs</div></div><Plus size={18} className="text-emerald-300" /></button>}
            <div className="panel rounded-2xl p-5"><div className="flex items-center gap-2 text-xs font-medium"><CircleHelp size={15} className="text-emerald-300" /> How to read this</div><p className="mt-3 text-xs leading-5 text-slate-400">Scores are scenario signals from synthetic agents. They are not measured market shares, survey percentages or validated purchase probabilities.</p></div>
          </aside>

          <section className="min-w-0 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="eyebrow">02 / Intelligence</div><h2 className="mt-2 text-xl font-semibold">Simulation analysis</h2></div><div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-1">{["Overview", "Segments", "Insights"].map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-md px-3 py-2 text-[11px] transition ${activeTab === tab ? "bg-white/10 text-white" : "text-slate-500 hover:text-white"}`}>{tab}</button>)}</div></div>
            {!result ? <div className="panel flex min-h-[510px] flex-col items-center justify-center rounded-2xl px-8 text-center"><div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.07]"><FlaskConical size={27} className="text-emerald-300" /></div><div className="eyebrow">Awaiting experiment</div><h3 className="mt-3 text-2xl font-semibold tracking-tight">Your next insight starts here.</h3><p className="mt-3 max-w-md text-sm leading-6 text-slate-400">Configure a product, audience and market. SYNTHORA will create an illustrative synthetic scenario and surface the assumptions behind it.</p><button onClick={runSimulation} disabled={busy} className="mt-7 flex items-center gap-2 rounded-lg border border-emerald-300/30 px-4 py-3 text-xs text-emerald-200 hover:bg-emerald-300/10"><Play size={14} /> Run example experiment</button></div> :
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.045] px-4 py-3"><div className="flex items-center gap-2 text-xs text-emerald-100"><span className="h-2 w-2 rounded-full bg-emerald-300" /> {result.mode === "ai-assisted" ? "AI-assisted qualitative analysis" : "Demo simulation engine"}</div><span className="text-[10px] text-slate-500">{new Date(result.createdAt).toLocaleString()}</span></div>
                {activeTab === "Overview" && <>
                  <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3"><Metric label="Simulated intent signal" value={`${result.estimatedIntent}/100`} detail={`Illustrative range ${result.intentRange[0]}–${result.intentRange[1]}`} icon={Target} /><Metric label="Synthetic agents requested" value={input.sampleSize.toLocaleString()} detail="Scenario size, not survey sample" icon={Users} /><Metric label="Population segments" value={String(result.segments.length)} detail="Illustrative archetypes" icon={Layers3} /></div>
                  <div className="panel rounded-2xl p-5"><div className="flex items-center justify-between"><div><div className="text-sm font-medium">Segment response landscape</div><div className="mt-1 text-[11px] muted">Relative scenario intent signal by archetype</div></div><BarChart3 size={17} className="text-emerald-300" /></div><div className="mt-5 h-[245px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}><defs><linearGradient id="intentFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7ce0bd" stopOpacity={0.28} /><stop offset="95%" stopColor="#7ce0bd" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="rgba(148,163,184,.1)" vertical={false} /><XAxis dataKey="segment" tick={{ fill: "#8993a4", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis domain={[0,100]} tick={{ fill: "#647084", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: "#111722", border: "1px solid #263244", borderRadius: 10, fontSize: 11 }} /><Area type="monotone" dataKey="intent" stroke="#7ce0bd" strokeWidth={2} fill="url(#intentFill)" /></AreaChart></ResponsiveContainer></div></div>
                  <div className="panel rounded-2xl p-5"><div className="flex items-center gap-2 text-sm font-medium"><BrainCircuit size={16} className="text-emerald-300" /> Analysis</div><p className="mt-3 text-sm leading-7 text-slate-300">{result.summary}</p></div>
                </>}
                {activeTab === "Segments" && <div className="panel rounded-2xl p-5"><div className="mb-5 text-sm font-medium">Synthetic population segments</div><div className="space-y-5">{result.segments.map((segment) => <div key={segment.name}><div className="flex flex-wrap items-center justify-between gap-2"><div className="text-sm font-medium">{segment.name}</div><div className="text-xs text-emerald-200">{segment.intent}/100 signal <span className="text-slate-500">· {segment.share}% illustrative mix</span></div></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-emerald-300" style={{ width: `${segment.intent}%` }} /></div><div className="mt-2 grid gap-2 text-[11px] leading-5 text-slate-400 sm:grid-cols-2"><div>Motivation: {segment.rationale}</div><div>Potential barrier: {segment.barrier}</div></div></div>)}</div></div>}
                {activeTab === "Insights" && <div className="space-y-4"><div className="panel rounded-2xl p-5"><div className="flex items-center gap-2 text-sm font-medium"><Activity size={16} className="text-emerald-300" /> Scenario drivers</div><div className="mt-5 grid gap-4 sm:grid-cols-2">{result.drivers.map((driver) => <div key={driver.label} className="rounded-xl border border-white/[0.07] bg-black/10 p-4"><div className="flex items-center justify-between text-xs"><span>{driver.label}</span><span className="text-emerald-200">{driver.score}/100</span></div><div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-300" style={{ width: `${driver.score}%` }} /></div><p className="mt-2 text-[10px] leading-4 text-slate-500">{driver.note}</p></div>)}</div></div><div className="panel rounded-2xl p-5"><div className="flex items-center gap-2 text-sm font-medium"><Sparkles size={16} className="text-emerald-300" /> Suggested next experiments</div><ul className="mt-4 space-y-3">{result.recommendations.map((item) => <li key={item} className="flex gap-3 text-xs leading-5 text-slate-300"><ArrowUpRight size={14} className="mt-0.5 shrink-0 text-emerald-300" />{item}</li>)}</ul></div></div>}
                <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.035] p-5"><div className="flex items-center gap-2 text-xs font-semibold text-amber-100"><ShieldCheck size={15} /> Limitations & validation</div><ul className="mt-3 space-y-2">{result.caveats.map((caveat) => <li key={caveat} className="text-[11px] leading-5 text-amber-100/65">• {caveat}</li>)}</ul></div>
              </>}
          </section>
        </div>
        <footer className="mt-14 flex flex-col justify-between gap-3 border-t border-white/[0.08] pt-6 text-[10px] text-slate-600 sm:flex-row"><span>© 2026 SYNTHORA · HUMAN SIMULATION INTELLIGENCE</span><span>Research preview · Synthetic scenarios are not real-world evidence</span></footer>
      </div>
    </main>
  );
}
