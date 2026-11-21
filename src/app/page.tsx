"use client";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Activity, ArrowRight, BarChart3, BrainCircuit, Clock3, Globe2, Layers3, Loader2, Plus, Radar, ShieldCheck, Trash2, Users, X } from "lucide-react";
import { COUNTRY_PROFILES, type CountryCode, type PopulationInput, type PopulationResult, type ScenarioInput, type SyntheticAgent } from "@/lib/population";
import { loadExperiments, saveExperiment, deleteExperiment } from "@/lib/experiment-store";
import CognitiveLab from "@/components/CognitiveLab";
import LLMAgentLab from "@/components/LLMAgentLab";
import ResearchIntelligence from "@/components/ResearchIntelligence";
import BehaviouralValidation from "@/components/BehaviouralValidation";
import CalibrationLab from "@/components/CalibrationLab";
import AdvancedSimulationIntelligence from "@/components/AdvancedSimulationIntelligence";
import AutonomousResearchAgents from "@/components/AutonomousResearchAgents";
import ResearchPlatform from "@/components/ResearchPlatform";
import ResearchExecutionStudio from "@/components/ResearchExecutionStudio";
import ExperimentalValidationStudio from "@/components/ExperimentalValidationStudio";
import ScientificBenchmarkStudio from "@/components/ScientificBenchmarkStudio";
import ResearchControlPlane from "@/components/ResearchControlPlane";

const countries: {code:CountryCode;name:string}[]=[{code:"IN",name:"India"},{code:"US",name:"United States"},{code:"GB",name:"United Kingdom"},{code:"DE",name:"Germany"},{code:"JP",name:"Japan"},{code:"BR",name:"Brazil"}];
const currency:Record<CountryCode,string>={IN:"INR",US:"USD",GB:"GBP",DE:"EUR",JP:"JPY",BR:"BRL"};
const starter=():ScenarioInput[]=>[{id:"baseline",label:"Baseline",price:19,message:"A reliable product that makes everyday life easier."},{id:"value",label:"Value positioning",price:14,message:"More everyday value, with transparent pricing."},{id:"premium",label:"Premium positioning",price:29,message:"A distinctive, high-quality experience you can trust."}];

export default function Home(){
 const [product,setProduct]=useState("Everyday hydration drink");
 const [description,setDescription]=useState("A low-sugar drink with familiar flavours and recyclable packaging.");
 const [audience,setAudience]=useState("Adults aged 18–54 who buy ready-to-drink beverages");
 const [country,setCountry]=useState<CountryCode>("IN");
 const [language,setLanguage]=useState("English");
 const [sampleSize,setSampleSize]=useState(500);
 const [scenarios,setScenarios]=useState<ScenarioInput[]>(starter);
 const [reuse,setReuse]=useState(true);
 const [result,setResult]=useState<PopulationResult|null>(null);
 const [runs,setRuns]=useState<PopulationResult[]>([]);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [tab,setTab]=useState<"overview"|"agents"|"compare"|"memory">("overview");
 const [compareRunId,setCompareRunId]=useState("");
 const [storageReady,setStorageReady]=useState(false);
 useEffect(()=>{loadExperiments().then(setRuns).catch(()=>setError("Browser storage is unavailable.")).finally(()=>setStorageReady(true));},[]);
 const profile=COUNTRY_PROFILES[country];
 const current=result||runs[0]||null;
 const compareRun=current?runs.find(r=>r.id===compareRunId&&r.id!==current.id):undefined;
 const fmt=(n:number)=>new Intl.NumberFormat("en-IN").format(n);

 async function run(){
  setBusy(true);setError("");
  try{
   const previous = reuse ? runs.find(r => r.country === country) : undefined;
   let remote: {agent_id:string;memory:SyntheticAgent["memory"]}[] = [];
   const cloudProject = typeof window !== "undefined" ? localStorage.getItem("synthora-active-project") : null;
   if (reuse && cloudProject) { try { const mr=await fetch("/api/cloud/agent-memory?project_id="+encodeURIComponent(cloudProject)); if(mr.ok){const mj=await mr.json();remote=Array.isArray(mj.memories)?mj.memories.filter((x:{agent_id?:string})=>String(x.agent_id||"").startsWith("cohort-"+country+"-")):[];} } catch { /* Cloud memory is optional; keep local cohort memory available. */ } }
   const remoteSeed=remote[0]?.agent_id.split("-agent-")[0];
   const seed=previous?.cohortId || remoteSeed || `cohort-${country}-${Date.now()}`;
   const memoryMap=new Map(remote.map(x=>[x.agent_id,x.memory]));
   const remembered=previous?.agents?.map(a=>({...a,memory:memoryMap.get(a.id)||a.memory})) || remote.map(x=>({id:x.agent_id,memory:x.memory} as SyntheticAgent));
   const payload:PopulationInput={product,description,audience,country,language,sampleSize,seed,scenarios,...(remembered.length?{previousAgents:remembered}:{})};
   const response=await fetch("/api/population",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   const data=await response.json();if(!response.ok)throw new Error(data.error||"Population run failed.");
   await saveExperiment(data,payload);setResult(data);setTab("overview");setRuns(await loadExperiments());
  }catch(e){setError(e instanceof Error?e.message:"Unexpected error while running the engine.");}
  finally{setBusy(false);}
 }
 async function remove(id:string){await deleteExperiment(id);const all=await loadExperiments();setRuns(all);if(result?.id===id)setResult(null);}
 function updateScenario(id:string,patch:Partial<ScenarioInput>){setScenarios(rows=>rows.map(s=>s.id===id?{...s,...patch}:s));}
 function addScenario(){if(scenarios.length<6)setScenarios(rows=>[...rows,{id:crypto.randomUUID(),label:`Scenario ${rows.length+1}`,price:19,message:"Test another positioning."}]);}

 return <main className="min-h-screen bg-[#080b10] text-slate-100"><div className="grid-noise pointer-events-none fixed inset-x-0 top-0 h-[500px]"/><div className="relative mx-auto max-w-[1480px] px-4 pb-16 md:px-8">
  <header className="flex h-[76px] items-center justify-between border-b border-white/[.08]"><a href="#" className="flex items-center gap-3 no-underline"><div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-300/30 bg-emerald-300/10"><Radar size={21} className="text-emerald-300"/></div><div><div className="text-[15px] font-bold tracking-[.24em]">SYNTHORA</div><div className="text-[9px] tracking-[.2em] text-slate-500">SCIENTIFIC INTELLIGENCE PLATFORM</div></div></a><div className="hidden items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[.06] px-3 py-2 text-[10px] tracking-wider text-emerald-200 md:flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300"/> ENGINE v0.7 · GLOBAL DATA CONTEXT</div><button onClick={()=>{setResult(null);setScenarios(starter());}} className="rounded-lg border border-white/10 px-3 py-2 text-xs hover:border-emerald-300/40">New experiment <Plus size={13} className="ml-1 inline"/></button></header>
  <section className="grid gap-8 pb-8 pt-11 lg:grid-cols-[1.2fr_.8fr] lg:items-end"><div><div className="eyebrow mb-4 flex items-center gap-2"><Globe2 size={13}/> Multi-market synthetic research</div><h1 className="max-w-4xl text-4xl font-semibold leading-[1.04] tracking-[-.05em] md:text-6xl">Model populations.<br/><span className="text-emerald-300">Explore what moves them.</span></h1><p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400">Generate synthetic cohorts with demographic priors, individual behavioural traits, persistent browser memory and network effects. Compare multiple scenario variants against the same population.</p></div><div className="panel rounded-2xl p-5"><div className="flex items-center justify-between text-[10px] tracking-widest text-slate-400"><span>ENGINE CAPABILITIES</span><span className="text-emerald-200">V0.7</span></div><div className="mt-5 grid grid-cols-2 gap-4">{[["06","Country profiles"],["2,500","Agents per cohort"],["06","Scenario variants"],["∞","Saved local runs"]].map(([v,l])=><div key={l}><div className="text-2xl font-semibold">{v}</div><div className="muted mt-1 text-[10px]">{l}</div></div>)}</div><p className="mt-4 text-[10px] text-slate-500">Saved runs are limited by available browser storage.</p></div></section>
  <div className="grid gap-6 xl:grid-cols-[370px_minmax(0,1fr)]">
   <aside className="space-y-4"><div className="panel rounded-2xl p-5"><div className="eyebrow">01 / Experiment setup</div><h2 className="mt-2 text-lg font-semibold">Population definition</h2>
    <Field label="Product / concept"><input value={product} onChange={e=>setProduct(e.target.value)} className="field" maxLength={120}/></Field>
    <Field label="Description"><textarea value={description} onChange={e=>setDescription(e.target.value)} className="field min-h-20" maxLength={700}/></Field>
    <Field label="Audience"><textarea value={audience} onChange={e=>setAudience(e.target.value)} className="field min-h-16" maxLength={180}/></Field>
    <Field label="Country"><select value={country} onChange={e=>{const c=e.target.value as CountryCode;setCountry(c);setLanguage(COUNTRY_PROFILES[c].languages[0]);}} className="field">{countries.map(c=><option key={c.code} value={c.code}>{c.name}</option>)}</select></Field>
    <Field label="Language configuration"><select value={language} onChange={e=>setLanguage(e.target.value)} className="field">{profile.languages.map(l=><option key={l}>{l}</option>)}</select></Field>
    <div className="grid grid-cols-2 gap-3"><Field label="Synthetic agents"><select value={sampleSize} onChange={e=>setSampleSize(Number(e.target.value))} className="field"><option value={100}>100</option><option value={250}>250</option><option value={500}>500</option><option value={1000}>1,000</option><option value={2500}>2,500</option></select></Field><Field label="Currency"><div className="field flex items-center">{currency[country]}</div></Field></div>
    <div className="mt-1 flex items-center justify-between"><div><div className="text-xs font-medium">Reuse cohort memory</div><div className="mt-1 text-[10px] text-slate-500">Carry agent exposure history into next run</div></div><button aria-label="Toggle cohort memory" onClick={()=>setReuse(!reuse)} className={`h-6 w-11 rounded-full p-1 transition ${reuse?"bg-emerald-300":"bg-slate-700"}`}><span className={`block h-4 w-4 rounded-full bg-[#07110e] transition ${reuse?"translate-x-5":"translate-x-0"}`}/></button></div>
   </div>
   <div className="panel rounded-2xl p-5"><div className="flex items-center justify-between"><div><div className="eyebrow">02 / Parallel tests</div><h3 className="mt-2 text-base font-semibold">Scenario matrix</h3></div><button onClick={addScenario} disabled={scenarios.length>=6} className="rounded-lg border border-white/10 p-2 text-emerald-200 disabled:opacity-30"><Plus size={15}/></button></div>
    <div className="mt-4 space-y-3">{scenarios.map((s,i)=><div key={s.id} className="rounded-xl border border-white/[.08] bg-black/20 p-3"><div className="mb-2 flex items-center justify-between"><span className="text-[10px] text-emerald-200">TEST {String(i+1).padStart(2,"0")}</span>{scenarios.length>1&&<button onClick={()=>setScenarios(rows=>rows.filter(x=>x.id!==s.id))} className="text-slate-600 hover:text-rose-300"><X size={13}/></button>}</div><input value={s.label} onChange={e=>updateScenario(s.id,{label:e.target.value})} className="field mb-2" placeholder="Scenario label"/><div className="grid grid-cols-[90px_1fr] gap-2"><input type="number" min="0" value={s.price} onChange={e=>updateScenario(s.id,{price:Number(e.target.value)})} className="field"/><input value={s.message} onChange={e=>updateScenario(s.id,{message:e.target.value})} className="field" placeholder="Message / positioning"/></div></div>)}</div>
    {error&&<p className="mt-3 text-xs text-rose-300">{error}</p>}<button disabled={busy||!product.trim()||!audience.trim()} onClick={run} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-3.5 text-sm font-semibold text-[#07110e] hover:bg-emerald-200 disabled:opacity-50">{busy?<><Loader2 size={16} className="animate-spin"/>Generating population…</>:<>Run population engine <ArrowRight size={15}/></>}</button><p className="mt-3 text-center text-[10px] leading-4 text-slate-500">Same cohort · paired scenarios · reproducible seed</p>
   </div>
   <div className="panel rounded-2xl p-4"><div className="flex items-center gap-2 text-xs font-medium"><ShieldCheck size={14} className="text-emerald-300"/> Model transparency</div><p className="mt-2 text-[11px] leading-5 text-slate-400">Country profiles are starter priors for prototyping, not official census data. Agents are synthetic records, not real people.</p></div>
   </aside>
   <section className="min-w-0 space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="eyebrow">03 / Population intelligence</div><h2 className="mt-2 text-xl font-semibold">Cohort analysis</h2></div><div className="flex flex-wrap gap-1 rounded-lg border border-white/10 p-1">{(["overview","agents","compare","memory"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className={`rounded-md px-3 py-2 text-[10px] capitalize ${tab===t?"bg-white/10 text-white":"text-slate-500 hover:text-white"}`}>{t}</button>)}</div></div>
   {!current?<div className="panel flex min-h-[510px] flex-col items-center justify-center rounded-2xl px-8 text-center"><div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/[.07]"><Users size={27} className="text-emerald-300"/></div><div className="eyebrow">Awaiting population</div><h3 className="mt-3 text-2xl font-semibold">Generate your first cohort.</h3><p className="mt-3 max-w-md text-sm leading-6 text-slate-400">Choose a country, language, audience and scenario matrix. SYNTHORA will generate individual agents, simulate peer influence and save the cohort in this browser.</p></div>:
   <>
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-300/20 bg-emerald-300/[.045] px-4 py-3"><div className="flex items-center gap-2 text-xs text-emerald-100"><span className="h-2 w-2 rounded-full bg-emerald-300"/>{current.countryName} · {current.language} cohort</div><div className="flex items-center gap-2 text-[10px] text-slate-500"><Clock3 size={12}/>{new Date(current.createdAt).toLocaleString()}</div></div>
    {tab==="overview"&&<><div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4"><Metric label="Synthetic agents" value={fmt(current.population.generated)} detail="Individual agent records" icon={Users}/><Metric label="Urban population" value={`${Math.round(current.population.urban/current.population.generated*100)}%`} detail={`${fmt(current.population.urban)} synthetic agents`} icon={Globe2}/><Metric label="Scenario tests" value={String(current.scenarios.length)} detail="Same cohort across tests" icon={Layers3}/><Metric label="Agent memory" value={`${current.agents[0]?.memory.exposures||0}×`} detail="Exposure count · agent 001" icon={BrainCircuit}/></div>
     <div className="grid gap-4 lg:grid-cols-2"><Panel title="Age distribution" icon={<Activity size={15}/>}><Bars rows={current.population.ageBands.map(x=>({label:x.label,value:x.count,total:current.population.generated}))}/></Panel><Panel title="Residence & income" icon={<Globe2 size={15}/>}><Bars rows={[{label:"Urban",value:current.population.urban,total:current.population.generated},{label:"Rural",value:current.population.rural,total:current.population.generated},...current.population.income.map(x=>({label:x.label+" income",value:x.count,total:current.population.generated}))]}/></Panel></div>
     <Panel title="Scenario intent signals" icon={<BarChart3 size={15}/>}><div className="space-y-4">{current.scenarios.map(s=><div key={s.id}><div className="flex items-center justify-between text-xs"><span>{s.label}</span><span className="text-emerald-200">{s.intentIndex}/100 <span className="text-slate-500">({s.uncertainty[0]}–{s.uncertainty[1]})</span></span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-emerald-300" style={{width:`${s.intentIndex}%`}}/></div><p className="mt-2 text-[10px] leading-4 text-slate-500">{s.summary}</p></div>)}</div></Panel>
    </>}
    {tab==="agents"&&<Panel title="Individual synthetic agents" icon={<Users size={15}/>}><p className="mb-4 text-[11px] text-slate-500">A sample of the generated cohort. Traits are synthetic variables, not inferred facts about real people.</p><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-[11px]"><thead className="text-slate-500"><tr>{["Agent","Age","Residence","Income","Price sensitivity","Trust","Memory"].map(x=><th key={x} className="border-b border-white/10 px-3 py-3 font-medium">{x}</th>)}</tr></thead><tbody>{current.agents.slice(0,30).map(a=><tr key={a.id} className="border-b border-white/[.05]"><td className="px-3 py-3 font-mono text-emerald-200">{a.id.slice(-10)}</td><td className="px-3 py-3">{a.age}</td><td className="px-3 py-3">{a.residence}</td><td className="px-3 py-3">{a.income}</td><td className="px-3 py-3">{a.priceSensitivity}/100</td><td className="px-3 py-3">{a.trustPropensity}/100</td><td className="px-3 py-3">{a.memory.exposures} exposures</td></tr>)}</tbody></table></div></Panel>}
    {tab==="compare"&&<Panel title="Experiment & scenario comparison" icon={<BarChart3 size={15}/>}><div className="mb-4 grid gap-3 md:grid-cols-[1fr_1.2fr]"><div><label className="mb-2 block text-[11px] text-slate-400">Compare with a saved experiment</label><select value={compareRunId} onChange={e=>setCompareRunId(e.target.value)} className="field mb-0"><option value="">Select a previous run…</option>{runs.filter(r=>r.id!==current.id).map(r=><option key={r.id} value={r.id}>{r.countryName} · {new Date(r.createdAt).toLocaleDateString()} · {r.population.generated} agents</option>)}</select></div><div className="rounded-xl border border-white/[.07] bg-black/20 p-3 text-[11px] leading-5 text-slate-400">{compareRun?<>Current baseline: <span className="text-emerald-200">{current.scenarios[0]?.intentIndex ?? "—"}/100</span> · Previous baseline: <span className="text-slate-200">{compareRun.scenarios[0]?.intentIndex ?? "—"}/100</span> · Difference: <span className="text-emerald-200">{(current.scenarios[0]?.intentIndex??0)-(compareRun.scenarios[0]?.intentIndex??0)>0?"+":""}{(current.scenarios[0]?.intentIndex??0)-(compareRun.scenarios[0]?.intentIndex??0)}</span>{current.country!==compareRun.country?" · Different countries — treat as directional, not paired.":" · Same country profile."}</>: "Choose a saved run to compare its baseline signal with this experiment. Save at least two runs to unlock historical comparison."}</div></div><p className="mb-4 text-[11px] text-slate-500">Scenario variants below use the same cohort. Historical run comparisons use their own saved cohorts.</p><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead className="text-slate-500"><tr>{["Scenario","Price","Intent index","Network lift","Top objection"].map(x=><th key={x} className="border-b border-white/10 px-3 py-3">{x}</th>)}</tr></thead><tbody>{current.scenarios.map(s=><tr key={s.id} className="border-b border-white/[.05]"><td className="px-3 py-3 font-medium">{s.label}</td><td className="px-3 py-3">{currency[current.country]} {s.price}</td><td className="px-3 py-3 text-emerald-200">{s.intentIndex}/100</td><td className="px-3 py-3">{s.interactionLift>0?"+":""}{s.interactionLift}</td><td className="px-3 py-3 text-slate-400">{s.objections[0]?.label}</td></tr>)}</tbody></table></div></Panel>}
    {tab==="memory"&&<Panel title="Persistent agent memory" icon={<BrainCircuit size={15}/>}><div className="mb-4 rounded-xl border border-emerald-300/15 bg-emerald-300/[.04] p-4 text-xs leading-5 text-emerald-100">Agent exposure history is saved with each experiment in this this browser IndexedDB. Reuse the cohort to carry memory into a later run.</div><div className="space-y-3">{current.agents.slice(0,12).map(a=><div key={a.id} className="flex items-start justify-between gap-4 rounded-lg border border-white/[.06] p-3"><div><div className="font-mono text-[10px] text-emerald-200">{a.id.slice(-12)}</div><div className="mt-1 text-[11px] text-slate-400">{a.memory.notes.at(-1)||"No previous exposure"}</div></div><div className="text-right text-[10px] text-slate-500">{a.memory.exposures} exposures<br/>Affinity {Math.round(a.memory.learnedAffinity)}</div></div>)}</div></Panel>}
    <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[.035] p-5"><div className="flex items-center gap-2 text-xs font-semibold text-amber-100"><ShieldCheck size={15}/> Limitations & validation</div><ul className="mt-3 space-y-2">{current.caveats.map(c=><li key={c} className="text-[11px] leading-5 text-amber-100/65">• {c}</li>)}</ul></div>
   </>}
   </section>
  </div>
  <section className="mt-10"><div className="mb-4 flex items-center justify-between"><div><div className="eyebrow">04 / Research archive</div><h2 className="mt-2 text-lg font-semibold">Saved experiments</h2></div><span className="text-[10px] text-slate-500">{storageReady?runs.length:"…"} stored in this browser</span></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{runs.slice(0,6).map(r=><div key={r.id} className="panel rounded-xl p-4"><div className="flex items-start justify-between"><div><div className="text-sm font-medium">{r.countryName} · {fmt(r.population.generated)} agents</div><div className="mt-1 text-[10px] text-slate-500">{new Date(r.createdAt).toLocaleString()}</div></div><button onClick={()=>remove(r.id)} aria-label="Delete saved experiment" className="text-slate-600 hover:text-rose-300"><Trash2 size={14}/></button></div><div className="mt-3 flex items-center justify-between"><span className="text-[11px] text-slate-400">{r.scenarios.length} scenarios</span><button onClick={()=>{setResult(r);setTab("overview");}} className="text-[11px] text-emerald-200">Open run <ArrowRight size={12} className="ml-1 inline"/></button></div></div>)}</div></section>
  <ResearchControlPlane />
  <CognitiveLab />
  <AdvancedSimulationIntelligence />
  <AutonomousResearchAgents />
  <ResearchExecutionStudio />
  <ExperimentalValidationStudio />
  <ScientificBenchmarkStudio />
  <LLMAgentLab />
  <ResearchIntelligence />
  <BehaviouralValidation />
  <CalibrationLab runs={runs} />
  <ResearchPlatform runs={runs} />
  <footer className="mt-12 flex flex-col justify-between gap-3 border-t border-white/[.08] pt-6 text-[10px] text-slate-600 sm:flex-row"><span>© 2026 SYNTHORA · POPULATION INTELLIGENCE ENGINE</span><span>Research prototype · Synthetic scenarios are not real-world evidence</span></footer>
 </div></main>;
}
function Field({label,children}:{label:string;children:ReactNode}){return <label className="mb-1 block"><span className="mb-2 block text-[11px] text-slate-400">{label}</span>{children}</label>}
function Metric({label,value,detail,icon:Icon}:{label:string;value:string;detail:string;icon:typeof Activity}){return <div className="panel rounded-2xl p-5"><div className="flex items-center justify-between"><span className="muted text-xs">{label}</span><Icon size={16} className="text-emerald-300"/></div><div className="mt-4 text-3xl font-semibold tracking-tight">{value}</div><div className="muted mt-2 text-[10px]">{detail}</div></div>}
function Panel({title,icon,children}:{title:string;icon:React.ReactNode;children:React.ReactNode}){return <div className="panel rounded-2xl p-5"><div className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-200">{icon}{title}</div>{children}</div>}
function Bars({rows}:{rows:{label:string;value:number;total:number}[]}){return <div className="space-y-4">{rows.map(r=><div key={r.label}><div className="mb-2 flex justify-between text-[11px]"><span className="text-slate-400">{r.label}</span><span>{Math.round(r.value/r.total*100)}% · {r.value}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-emerald-300" style={{width:`${r.value/r.total*100}%`}}/></div></div>)}</div>}
