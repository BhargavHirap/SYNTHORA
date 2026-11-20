"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Download, FileUp, Plus, ShieldCheck, Trash2 } from "lucide-react";

type Market = "IN" | "US" | "GB" | "DE" | "JP" | "BR";
type Benchmark = {
  id: string; market: Market; metric: string; predicted: number; observed: number;
  year: number; sampleSize: number; sourceName: string; sourceUrl: string; notes: string;
  addedAt: string;
};
const markets: [Market,string][] = [["IN","India"],["US","United States"],["GB","United Kingdom"],["DE","Germany"],["JP","Japan"],["BR","Brazil"]];
const key = "synthora-validation-benchmarks-v06";
const metrics = ["Purchase intention (%)","Product support (%)","Brand awareness (%)","Adoption / conversion (%)","Other comparable proportion (%)"];
const asNumber = (x: unknown) => Number.isFinite(Number(x)) ? Number(x) : NaN;
function parseCsv(text: string): Record<string,string>[] {
  const rows: string[][]=[]; let row:string[]=[], cell="", quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i]; if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===","&&!quoted){row.push(cell);cell="";}else if((c==="\n"||c==="\r")&&!quoted){if(c==="\r"&&text[i+1]==="\n")i++;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell="";}else cell+=c;}
  row.push(cell);if(row.some(v=>v.trim()))rows.push(row);
  if(rows.length<2)return [];
  const headers=rows[0].map(x=>x.trim().toLowerCase());
  return rows.slice(1).map(r=>Object.fromEntries(headers.map((h,i)=>[h,(r[i]||"").trim()])));
}
function csvCell(x: unknown) { const s=String(x??""); return /[",\r\n]/.test(s) ? '"'+s.replace(/"/g,'""')+'"' : s; }
function regression(rows: Benchmark[]) {
  const n=rows.length, mx=rows.reduce((s,r)=>s+r.predicted,0)/n, my=rows.reduce((s,r)=>s+r.observed,0)/n;
  const xx=rows.reduce((s,r)=>s+(r.predicted-mx)**2,0), yy=rows.reduce((s,r)=>s+(r.observed-my)**2,0);
  const xy=rows.reduce((s,r)=>s+(r.predicted-mx)*(r.observed-my),0);
  return { slope:xx?xy/xx:NaN, intercept:my-(xx?xy/xx:0)*mx, correlation:xx&&yy?xy/Math.sqrt(xx*yy):NaN };
}
function bootstrapMae(rows: Benchmark[]) {
  if(rows.length<3)return null;
  let seed=0x5f3759df; const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const estimates:number[]=[];
  for(let b=0;b<1200;b++){let sum=0;for(let i=0;i<rows.length;i++){const r=rows[Math.floor(rand()*rows.length)];sum+=Math.abs(r.predicted-r.observed);}estimates.push(sum/rows.length);}
  estimates.sort((a,b)=>a-b);return [estimates[Math.floor(estimates.length*.025)],estimates[Math.floor(estimates.length*.975)]] as [number,number];
}
export default function BehaviouralValidation() {
  const [rows,setRows]=useState<Benchmark[]>([]);
  const [market,setMarket]=useState<Market>("IN"),[metric,setMetric]=useState(metrics[0]);
  const [predicted,setPredicted]=useState(""),[observed,setObserved]=useState(""),[year,setYear]=useState(String(new Date().getFullYear()-1));
  const [sampleSize,setSampleSize]=useState(""),[sourceName,setSourceName]=useState(""),[sourceUrl,setSourceUrl]=useState(""),[notes,setNotes]=useState("");
  const [error,setError]=useState(""),[filter,setFilter]=useState("all"),[metricFilter,setMetricFilter]=useState(metrics[0]);
  const fileRef=useRef<HTMLInputElement>(null);
  useEffect(()=>{try{const parsed=JSON.parse(localStorage.getItem(key)||"[]");if(Array.isArray(parsed))setRows(parsed);}catch{}},[]);
  function persist(next:Benchmark[]){setRows(next);try{localStorage.setItem(key,JSON.stringify(next));}catch{setError("Browser storage is full. Export your data and remove older records.");}}
  function add(){
    const p=asNumber(predicted),o=asNumber(observed),y=asNumber(year),n=asNumber(sampleSize);
    if(!Number.isFinite(p)||p<0||p>100||!Number.isFinite(o)||o<0||o>100){setError("Predicted and observed values must both be between 0 and 100.");return;}
    if(!Number.isInteger(y)||y<1900||y>new Date().getFullYear()||!Number.isInteger(n)||n<1){setError("Enter a valid observation year and a positive sample size.");return;}
    if(!sourceName.trim()||!/^https?:\/\//i.test(sourceUrl.trim())){setError("Add a source name and a valid http(s) source URL for traceability.");return;}
    const item:Benchmark={id:crypto.randomUUID(),market,metric,predicted:p,observed:o,year:y,sampleSize:n,sourceName:sourceName.trim().slice(0,120),sourceUrl:sourceUrl.trim().slice(0,500),notes:notes.trim().slice(0,500),addedAt:new Date().toISOString()};
    persist([item,...rows]);setPredicted("");setObserved("");setSampleSize("");setSourceName("");setSourceUrl("");setNotes("");setError("");
  }
  async function importFile(file:File){
    setError("");
    try{
      const text=await file.text();let imported:Record<string,unknown>[];
      if(file.name.toLowerCase().endsWith(".json")){const j=JSON.parse(text);imported=Array.isArray(j)?j:Array.isArray(j.benchmarks)?j.benchmarks:[];}
      else imported=parseCsv(text);
      const clean:Benchmark[]=imported.map((r)=>({
        id:crypto.randomUUID(),market:String(r.market||"").toUpperCase() as Market,metric:String(r.metric||metrics[0]),
        predicted:asNumber(r.predicted),observed:asNumber(r.observed),year:asNumber(r.year),sampleSize:asNumber(r.samplesize??r.sampleSize),
        sourceName:String(r.sourcename??r.sourceName??""),sourceUrl:String(r.sourceurl??r.sourceUrl??""),notes:String(r.notes||""),addedAt:new Date().toISOString()
      })).filter(r=>markets.some(m=>m[0]===r.market)&&r.metric.length>0&&Number.isFinite(r.predicted)&&r.predicted>=0&&r.predicted<=100&&Number.isFinite(r.observed)&&r.observed>=0&&r.observed<=100&&Number.isInteger(r.year)&&r.year>=1900&&r.year<=new Date().getFullYear()&&Number.isInteger(r.sampleSize)&&r.sampleSize>0&&r.sourceName.trim()&&/^https?:\/\//i.test(r.sourceUrl));
      if(!clean.length)throw new Error("No valid rows found. Check the CSV/JSON template and required source fields.");
      persist([...clean,...rows].slice(0,500));setError("Imported "+clean.length+" validated benchmark records.");
    }catch(e){setError(e instanceof Error?e.message:"Could not import this file.");}
    if(fileRef.current)fileRef.current.value="";
  }
  const visible=useMemo(()=>rows.filter(r=>(filter==="all"||r.market===filter)&&r.metric===metricFilter),[rows,filter,metricFilter]);
  const groups=useMemo(()=>{const map=new Map<string,Benchmark[]>();for(const r of visible){const k=r.metric;map.set(k,[...(map.get(k)||[]),r]);}return [...map.entries()];},[visible]);
  const summary=useMemo(()=>{const n=visible.length;if(!n)return null;const errors=visible.map(r=>r.predicted-r.observed),abs=errors.map(Math.abs),mae=abs.reduce((a,b)=>a+b,0)/n,rmse=Math.sqrt(errors.reduce((a,b)=>a+b*b,0)/n),bias=errors.reduce((a,b)=>a+b,0)/n;return{n,mae,rmse,bias,within5:abs.filter(x=>x<=5).length/n*100,within10:abs.filter(x=>x<=10).length/n*100,interval:bootstrapMae(visible),reg:visible.length>=3?regression(visible):null};},[visible]);
  function exportJson(){const blob=new Blob([JSON.stringify({schema:"synthora-benchmark-v0.6",exportedAt:new Date().toISOString(),benchmarks:rows},null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="synthora-validation-benchmarks.json";a.click();URL.revokeObjectURL(url);}
  function exportCsv(){const headers=["market","metric","predicted","observed","year","sampleSize","sourceName","sourceUrl","notes"];const body=[headers.join(","),...rows.map(r=>headers.map(h=>csvCell((r as unknown as Record<string,unknown>)[h])).join(","))].join("\n");const blob=new Blob([body],{type:"text/csv"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="synthora-validation-benchmarks.csv";a.click();URL.revokeObjectURL(url);}
  return <section id="behavioural-validation" className="mt-12 space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><div className="eyebrow flex items-center gap-2"><ShieldCheck size={13}/> V0.6 / Behavioural validation</div><h2 className="mt-2 text-2xl font-semibold tracking-tight">Test the model against reality.</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Pair SYNTHORA outputs with comparable published survey or outcome data. Measure error, bias and calibration diagnostics—without pretending a synthetic score is already validated.</p></div><span className="rounded-xl border border-amber-300/20 px-3 py-2 text-[10px] text-amber-100">BENCHMARKS REQUIRED</span></div>
    <div className="panel rounded-2xl p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="eyebrow">01 / Benchmark registry</div><h3 className="mt-1 text-sm font-semibold">Add a paired observation</h3></div><div className="flex flex-wrap gap-2"><button onClick={()=>fileRef.current?.click()} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-emerald-200"><FileUp size={13}/>Import CSV / JSON</button><button onClick={exportJson} disabled={!rows.length} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs disabled:opacity-30"><Download size={13}/>JSON</button><button onClick={exportCsv} disabled={!rows.length} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs disabled:opacity-30"><Download size={13}/>CSV</button><input ref={fileRef} type="file" accept=".csv,.json,application/json,text/csv" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)void importFile(f);}}/></div></div>
      <p className="mt-2 text-[11px] leading-5 text-slate-500">Each row is one matched experiment: same market, population segment, product/question, outcome definition and reasonably aligned time period. Enter SYNTHORA&apos;s predicted index and the published observed percentage. Source URL is mandatory.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-[11px] text-slate-400">Market<select className="field mt-2 mb-0" value={market} onChange={e=>setMarket(e.target.value as Market)}>{markets.map(m=><option key={m[0]} value={m[0]}>{m[1]}</option>)}</select></label>
        <label className="text-[11px] text-slate-400">Comparable outcome<select className="field mt-2 mb-0" value={metric} onChange={e=>setMetric(e.target.value)}>{metrics.map(m=><option key={m}>{m}</option>)}</select></label>
        <label className="text-[11px] text-slate-400">SYNTHORA predicted (%)<input className="field mt-2 mb-0" type="number" min="0" max="100" step="0.1" value={predicted} onChange={e=>setPredicted(e.target.value)} placeholder="e.g. 62"/></label>
        <label className="text-[11px] text-slate-400">Observed published result (%)<input className="field mt-2 mb-0" type="number" min="0" max="100" step="0.1" value={observed} onChange={e=>setObserved(e.target.value)} placeholder="e.g. 55"/></label>
        <label className="text-[11px] text-slate-400">Observation year<input className="field mt-2 mb-0" type="number" min="1900" max={new Date().getFullYear()} value={year} onChange={e=>setYear(e.target.value)}/></label>
        <label className="text-[11px] text-slate-400">Survey / study sample size<input className="field mt-2 mb-0" type="number" min="1" value={sampleSize} onChange={e=>setSampleSize(e.target.value)} placeholder="e.g. 1200"/></label>
        <label className="text-[11px] text-slate-400">Source / publisher<input className="field mt-2 mb-0" maxLength={120} value={sourceName} onChange={e=>setSourceName(e.target.value)} placeholder="Publisher or study title"/></label>
        <label className="text-[11px] text-slate-400 sm:col-span-2">Source URL<input className="field mt-2 mb-0" value={sourceUrl} onChange={e=>setSourceUrl(e.target.value)} placeholder="https://..."/></label>
        <label className="text-[11px] text-slate-400 sm:col-span-3">Comparability notes<textarea className="field mt-2 mb-0 min-h-16" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Question wording, segment, field dates, weighting, differences from model assumptions…"/></label>
      </div>
      {error&&<p className="mt-3 text-xs text-amber-200">{error}</p>}
      <button onClick={add} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-3 text-sm font-semibold text-[#07110e]"><Plus size={15}/>Add benchmark pair</button>
      <div className="mt-3 rounded-xl border border-white/[.06] bg-black/20 p-3 text-[10px] leading-5 text-slate-500">CSV columns: <code>market,metric,predicted,observed,year,sampleSize,sourceName,sourceUrl,notes</code>. JSON import accepts an array or an object with a <code>benchmarks</code> array. Imports are validated; maximum 500 saved rows.</div>
    </div>
    <div className="panel rounded-2xl p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="eyebrow">02 / Validation diagnostics</div><h3 className="mt-1 text-sm font-semibold">Out-of-sample agreement summary</h3></div><div className="flex flex-wrap gap-2"><select className="field mb-0 max-w-[190px]" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All markets</option>{markets.map(m=><option key={m[0]} value={m[0]}>{m[1]}</option>)}</select><select className="field mb-0 max-w-[220px]" value={metricFilter} onChange={e=>setMetricFilter(e.target.value)}>{metrics.map(m=><option key={m}>{m}</option>)}</select></div></div>
      {!summary?<div className="mt-5 rounded-xl border border-dashed border-white/10 p-8 text-center text-xs text-slate-500">No benchmark pairs yet. Add or import real published observations to calculate validation metrics.</div>:<>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{[["PAIRS",String(summary.n)],["MAE",summary.mae.toFixed(2)+" pp"],["RMSE",summary.rmse.toFixed(2)+" pp"],["BIAS",((summary.bias>0?"+":"")+summary.bias.toFixed(2))+" pp"],["WITHIN ±5",summary.within5.toFixed(0)+"%"],["WITHIN ±10",summary.within10.toFixed(0)+"%"]].map(([label,value])=><div key={label} className="rounded-xl bg-black/20 p-3"><div className="text-[9px] tracking-wider text-slate-500">{label}</div><div className="mt-1 text-lg font-semibold text-emerald-100">{value}</div></div>)}</div>
        <p className="mt-3 text-[10px] leading-5 text-slate-500">MAE and RMSE are in percentage points. Positive bias means SYNTHORA tends to overestimate. Within-threshold rates describe this uploaded benchmark set only.</p>
        {summary.interval&&<p className="mt-2 text-[10px] text-slate-400">Bootstrap 95% interval for MAE: {summary.interval[0].toFixed(2)}–{summary.interval[1].toFixed(2)} pp (resampling these matched rows; not a population confidence interval).</p>}
        {summary.reg&&<p className="mt-2 text-[10px] text-slate-400">Linear diagnostic: slope {summary.reg.slope.toFixed(2)} · intercept {summary.reg.intercept.toFixed(2)} · correlation {Number.isFinite(summary.reg.correlation)?summary.reg.correlation.toFixed(2):"not defined"}. Descriptive only; requires more diverse, independent pairs.</p>}
        {groups.map(([name,items])=>{const mae=items.reduce((s,r)=>s+Math.abs(r.predicted-r.observed),0)/items.length;return <div key={name} className="mt-4"><div className="mb-2 flex justify-between text-[11px]"><span>{name}</span><span className="text-slate-400">{items.length} pairs · MAE {mae.toFixed(2)} pp</span></div><div className="space-y-2">{items.map(r=><div key={r.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 rounded-lg border border-white/[.05] p-3 text-[10px]"><div className="min-w-0"><div className="truncate text-slate-200">{markets.find(m=>m[0]===r.market)?.[1]} · {r.year} · n={r.sampleSize}</div><a href={r.sourceUrl} target="_blank" rel="noreferrer" className="block truncate text-emerald-200">{r.sourceName}</a></div><span className="text-slate-400">P {r.predicted}</span><span className="text-slate-400">O {r.observed}</span><span className={Math.abs(r.predicted-r.observed)<=5?"text-emerald-200":"text-amber-200"}>{Math.abs(r.predicted-r.observed).toFixed(1)} pp</span><button aria-label="Delete benchmark" onClick={()=>persist(rows.filter(x=>x.id!==r.id))} className="col-span-4 flex items-center justify-end gap-1 text-slate-600 hover:text-rose-300"><Trash2 size={11}/>Remove</button></div>)}</div></div>;})}
      </>}
    </div>
    <div className="rounded-xl border border-amber-300/15 bg-amber-300/[.04] p-4"><div className="flex items-center gap-2 text-xs font-semibold text-amber-100"><AlertTriangle size={14}/> Calibration is not a badge</div><p className="mt-2 text-[10px] leading-5 text-amber-100/70">No real benchmark dataset is bundled, and no calibration score is pre-filled. A small or mismatched sample can produce misleading metrics. Keep a separate holdout set, document question wording and sampling method, and compare only like-for-like outcomes. Current metrics are descriptive diagnostics—not proof of predictive validity, causality or population representativeness.</p></div>
    <p className="text-[10px] leading-5 text-slate-600">Saved locally in this browser. Nothing is uploaded to a SYNTHORA server. Use the JSON/CSV export to back up or move your benchmark registry.</p>
  </section>;
}
