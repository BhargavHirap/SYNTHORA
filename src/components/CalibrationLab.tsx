"use client";

import { useMemo, useState } from "react";
import { Activity, AlertTriangle, Download, FileSpreadsheet, Info, ShieldCheck, Upload } from "lucide-react";

type Pair = { market: string; scenario: string; predicted: number; observed: number; source: string; year: number; n: number };
type Metrics = { mae: number; rmse: number; bias: number; correlation: number | null; slope: number | null; count: number };
const example = [
  { market:"IN", scenario:"Value message", predicted:62, observed:58, source:"Example only — replace with a published survey", year:2025, n:420 },
  { market:"IN", scenario:"Premium message", predicted:54, observed:49, source:"Example only — replace with a published survey", year:2025, n:420 },
  { market:"US", scenario:"Value message", predicted:57, observed:61, source:"Example only — replace with a published survey", year:2025, n:510 },
  { market:"US", scenario:"Premium message", predicted:68, observed:64, source:"Example only — replace with a published survey", year:2025, n:510 },
  { market:"GB", scenario:"Value message", predicted:59, observed:55, source:"Example only — replace with a published survey", year:2025, n:380 },
  { market:"GB", scenario:"Premium message", predicted:64, observed:66, source:"Example only — replace with a published survey", year:2025, n:380 }
];
const template = "market,scenario,predicted,observed,source,year,n\nIN,Value message,62,58,Published survey title or URL,2025,420\n";
function csvParse(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let cell = ""; let quoted = false;
  for (let i=0;i<text.length;i++) { const c=text[i]; if (c === '"') { if (quoted && text[i+1] === '"') { cell += '"'; i++; } else quoted = !quoted; } else if (c === "," && !quoted) { row.push(cell.trim()); cell = ""; } else if ((c === "\n" || c === "\r") && !quoted) { if (c === "\r" && text[i+1] === "\n") i++; row.push(cell.trim()); if (row.some(x=>x)) rows.push(row); row=[]; cell=""; } else cell += c; }
  row.push(cell.trim()); if (row.some(x=>x)) rows.push(row); return rows;
}
function parseRows(text: string): Pair[] {
  const matrix=csvParse(text); if(matrix.length<2) throw new Error("CSV needs a header and at least one data row.");
  const headers=matrix[0].map(x=>x.toLowerCase().trim()); const required=["market","scenario","predicted","observed","source","year","n"];
  const indexes=required.map(x=>headers.indexOf(x)); if(indexes.some(x=>x<0)) throw new Error("Required columns: market, scenario, predicted, observed, source, year, n.");
  if(matrix.length>501) throw new Error("Maximum 500 benchmark rows per import.");
  return matrix.slice(1).map((r,i)=>{
    const get=(name:string)=>r[indexes[required.indexOf(name)]]||"";
    const predicted=Number(get("predicted")), observed=Number(get("observed")), year=Number(get("year")), n=Number(get("n"));
    const market=get("market").toUpperCase().slice(0,12), scenario=get("scenario").slice(0,100), source=get("source").slice(0,300);
    if(!market || !scenario || !source || !Number.isFinite(predicted) || !Number.isFinite(observed) || predicted<0 || predicted>100 || observed<0 || observed>100 || !Number.isInteger(year) || year<1900 || year>2100 || !Number.isInteger(n) || n<1 || n>10000000) throw new Error("Invalid row "+(i+2)+". Scores must be 0–100, year 1900–2100, sample n at least 1, and source/labels cannot be blank.");
    return {market,scenario,predicted,observed,source,year,n};
  });
}
function metrics(rows:Pair[]):Metrics {
  const n=rows.length, errors=rows.map(x=>x.predicted-x.observed), mae=errors.reduce((s,x)=>s+Math.abs(x),0)/n, rmse=Math.sqrt(errors.reduce((s,x)=>s+x*x,0)/n), bias=errors.reduce((s,x)=>s+x,0)/n;
  const px=rows.reduce((s,x)=>s+x.predicted,0)/n, oy=rows.reduce((s,x)=>s+x.observed,0)/n;
  const cov=rows.reduce((s,x)=>s+(x.predicted-px)*(x.observed-oy),0), vx=rows.reduce((s,x)=>s+(x.predicted-px)**2,0), vy=rows.reduce((s,x)=>s+(x.observed-oy)**2,0);
  const correlation=vx>0&&vy>0?cov/Math.sqrt(vx*vy):null, slope=vx>0?cov/vx:null;
  return {mae,rmse,bias,correlation,slope,count:n};
}
function download(name:string,content:string,type:string) { const url=URL.createObjectURL(new Blob([content],{type})); const a=document.createElement("a"); a.href=url; a.download=name; a.click(); URL.revokeObjectURL(url); }

export default function CalibrationLab() {
  const [rows,setRows]=useState<Pair[]>(example);
  const [notice,setNotice]=useState("Example values are illustrative placeholders, not actual survey findings. Replace them before interpreting any score.");
  const [error,setError]=useState("");
  const [showRows,setShowRows]=useState(false);
  const result=useMemo(()=>rows.length?metrics(rows):null,[rows]);
  const bins=useMemo(()=>{ if(!rows.length)return []; const sorted=[...rows].sort((a,b)=>a.predicted-b.predicted); const groups=Math.min(5,sorted.length); return Array.from({length:groups},(_,i)=>{const part=sorted.slice(Math.floor(i*sorted.length/groups),Math.floor((i+1)*sorted.length/groups));return {label:"Band "+(i+1),predicted:part.reduce((s,x)=>s+x.predicted,0)/part.length,observed:part.reduce((s,x)=>s+x.observed,0)/part.length,n:part.length};});},[rows]);
  function importFile(file?:File) { if(!file)return; setError(""); const reader=new FileReader(); reader.onload=()=>{try{const parsed=parseRows(String(reader.result||""));setRows(parsed);setNotice("Imported "+parsed.length+" benchmark pairs. Verify every source and confirm that predicted and observed values use the same outcome definition and scale.");}catch(e){setError(e instanceof Error?e.message:"Could not parse CSV.");}}; reader.readAsText(file); }
  function exportReport() { if(!result)return; download("synthora-calibration-report.json",JSON.stringify({generatedAt:new Date().toISOString(),method:"Descriptive holdout comparison",metrics:result,rows,limitations:["Metrics describe only the supplied matched pairs; they do not establish generalisation.","Example data are synthetic placeholders and must not be reported as real validation.","Predicted and observed scores must measure the same outcome on the same 0–100 scale.","A high correlation does not imply agreement; inspect MAE and bias too.","Small or selected benchmark samples may be unrepresentative."],bins},null,2),"application/json"); }
  return <section id="calibration-lab" className="mt-12 space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><div className="eyebrow flex items-center gap-2"><Activity size={13}/> V0.6 / Behavioural calibration</div><h2 className="mt-2 text-2xl font-semibold tracking-tight">Test the model against reality.</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Compare SYNTHORA's predicted outcomes with matched, observed outcomes from external surveys or experiments. Keep the benchmark source attached to every row.</p></div><span className="rounded-xl border border-emerald-300/20 px-3 py-2 text-[10px] text-emerald-200">HOLDOUT EVALUATION</span></div>
    <div className="panel rounded-2xl p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="eyebrow">01 / Benchmark data</div><h3 className="mt-1 text-sm font-semibold">Import matched prediction–observation pairs</h3></div><div className="flex flex-wrap gap-2"><button onClick={()=>download("synthora-benchmark-template.csv",template,"text/csv")} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-emerald-200"><Download size={13}/>CSV template</button><label className="flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-300 px-3 py-2 text-xs font-semibold text-[#07110e]"><Upload size={13}/>Import CSV<input type="file" accept=".csv,text/csv" className="hidden" onChange={e=>importFile(e.target.files?.[0])}/></label></div></div>
      <div className="mt-4 rounded-xl border border-amber-300/15 bg-amber-300/[.04] p-3 text-[11px] leading-5 text-amber-100/80"><AlertTriangle size={13} className="mr-2 inline"/> {notice}</div>
      {error&&<p className="mt-3 text-xs text-rose-300">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-2"><button onClick={()=>{setRows(example);setNotice("Example values are illustrative placeholders, not actual survey findings. Replace them before interpreting any score.");setError("");}} className="rounded-lg border border-white/10 px-3 py-2 text-[11px] text-slate-300">Load demo rows</button><button onClick={()=>{setRows([]);setNotice("Dataset cleared. Import your benchmark CSV to calculate metrics.");setError("");}} className="rounded-lg border border-white/10 px-3 py-2 text-[11px] text-slate-300">Clear dataset</button><button onClick={()=>setShowRows(v=>!v)} className="rounded-lg border border-white/10 px-3 py-2 text-[11px] text-slate-300">{showRows?"Hide":"Show"} benchmark rows ({rows.length})</button></div>
      {showRows&&<div className="mt-4 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-[10px]"><thead className="text-slate-500"><tr>{["Market","Scenario","Predicted","Observed","Year","n","Source"].map(x=><th key={x} className="border-b border-white/10 px-2 py-2">{x}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i} className="border-b border-white/[.05]"><td className="px-2 py-2">{r.market}</td><td className="px-2 py-2">{r.scenario}</td><td className="px-2 py-2">{r.predicted}</td><td className="px-2 py-2">{r.observed}</td><td className="px-2 py-2">{r.year}</td><td className="px-2 py-2">{r.n}</td><td className="max-w-[220px] truncate px-2 py-2 text-slate-500">{r.source}</td></tr>)}</tbody></table></div>}
    </div>
    {result&&<><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[{label:"Mean absolute error",value:result.mae.toFixed(2),unit:"points",hint:"Lower is better"},{label:"Root mean squared error",value:result.rmse.toFixed(2),unit:"points",hint:"Penalises large misses"},{label:"Mean signed bias",value:(result.bias>0?"+":"")+result.bias.toFixed(2),unit:"points",hint:"Positive = model overpredicts"},{label:"Pearson correlation",value:result.correlation===null?"N/A":result.correlation.toFixed(3),unit:"r",hint:"Association, not agreement"}].map(m=><div key={m.label} className="panel rounded-xl p-4"><div className="text-[10px] text-slate-500">{m.label}</div><div className="mt-2 text-2xl font-semibold text-emerald-100">{m.value}<span className="ml-1 text-[10px] font-normal text-slate-500">{m.unit}</span></div><div className="mt-1 text-[10px] text-slate-500">{m.hint}</div></div>)}</div>
      <div className="panel rounded-2xl p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="eyebrow">02 / Calibration profile</div><h3 className="mt-1 text-sm font-semibold">Predicted vs observed by score band</h3></div><button onClick={exportReport} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-emerald-200"><Download size={13}/>Export evaluation JSON</button></div>
        <div className="mt-4 space-y-3">{bins.map(b=><div key={b.label}><div className="mb-1 flex flex-wrap justify-between gap-2 text-[10px]"><span className="text-slate-300">{b.label} · {b.n} pairs</span><span className="text-slate-400">Predicted {b.predicted.toFixed(1)} / Observed {b.observed.toFixed(1)}</span></div><div className="relative h-2 overflow-hidden rounded-full bg-white/[.06]"><div className="absolute left-0 top-0 h-full rounded-full bg-emerald-300/80" style={{width:b.predicted+"%"}}/><div className="absolute top-0 h-full w-[2px] bg-white" style={{left:b.observed+"%"}}/></div></div>)}</div>
        <div className="mt-4 flex flex-wrap gap-4 text-[10px] text-slate-500"><span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-emerald-300"/>Predicted average</span><span><span className="mr-1 inline-block h-2 w-[2px] bg-white"/>Observed average</span><span>{result.count} matched pairs</span></div>
      </div>
      <div className="panel rounded-2xl p-5"><div className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck size={15} className="text-emerald-300"/> Evaluation guardrails</div><ul className="mt-3 grid gap-2 text-[11px] leading-5 text-slate-400 md:grid-cols-2"><li>• Compare the same outcome definition, population, market, time window and 0–100 scale.</li><li>• Keep benchmark rows separate from data used to tune the simulator; evaluate on holdout observations.</li><li>• MAE measures average absolute disagreement; bias reveals systematic over- or under-prediction.</li><li>• Correlation measures co-movement, not agreement. A model can correlate strongly and still be wrong.</li><li>• A single published study does not validate performance across all countries or audiences.</li><li>• Do not treat these metrics as statistical proof or a representative population estimate.</li></ul><div className="mt-4 flex items-center gap-2 text-[10px] text-slate-500"><Info size={12}/> Descriptive evaluation only · no training or calibration parameters are changed by this tool.</div></div>
    </>}
  </section>;
}
