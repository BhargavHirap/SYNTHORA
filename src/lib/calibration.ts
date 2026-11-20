import type { SyntheticAgent } from "@/lib/population";
export type MarginalTargets = Record<string,Record<string,number>>;
export type CalibrationResult = {weights:number[];iterations:number;converged:boolean;maxResidual:number;effectiveSampleSize:number;before:Record<string,Record<string,number>>;after:Record<string,Record<string,number>>;unsupported:string[]};
const dims:Record<string,(a:SyntheticAgent)=>string>={ageBand:a=>a.ageBand,gender:a=>a.gender,residence:a=>a.residence,income:a=>a.income};
function distribution(agents:SyntheticAgent[],weights:number[],targets:MarginalTargets){const out:Record<string,Record<string,number>>={};for(const [dim,cats] of Object.entries(targets)){const get=dims[dim];if(!get)continue;const totals:Record<string,number>={};for(let i=0;i<agents.length;i++){const c=get(agents[i]);totals[c]=(totals[c]||0)+weights[i];}const total=weights.reduce((a,b)=>a+b,0)||1;out[dim]={};for(const c of Object.keys(cats))out[dim][c]=(totals[c]||0)/total*100;}return out;}
export function rakePopulation(agents:SyntheticAgent[],targets:MarginalTargets,maxIterations=200,tolerance=0.05):CalibrationResult{
 const weights=agents.map(()=>1),unsupported:string[]=[];const before=distribution(agents,weights,targets);let converged=false,iterations=0,maxResidual=100;
 const entries=Object.entries(targets).filter(([d])=>d in dims);
 for(let iter=0;iter<maxIterations;iter++){iterations=iter+1;for(const [dim,cats] of entries){const get=dims[dim];const sumTarget=Object.values(cats).reduce((a,b)=>a+b,0);if(Math.abs(sumTarget-100)>0.5)throw new Error(dim+" target percentages must sum to 100.");for(const cat of Object.keys(cats)){const idx:number[]=[];for(let i=0;i<agents.length;i++)if(get(agents[i])===cat)idx.push(i);if(!idx.length){unsupported.push(dim+":"+cat);continue;}const current=idx.reduce((s,i)=>s+weights[i],0)/weights.reduce((a,b)=>a+b,0)*100;const target=cats[cat];if(current>0){const factor=Math.max(0.05,Math.min(20,target/current));for(const i of idx)weights[i]*=factor;}}}
 const after=distribution(agents,weights,targets);maxResidual=0;for(const [d,cats] of entries)for(const [c,t] of Object.entries(cats))maxResidual=Math.max(maxResidual,Math.abs((after[d]?.[c]||0)-t));if(maxResidual<=tolerance){converged=true;break;}}
 const sum=weights.reduce((a,b)=>a+b,0),sq=weights.reduce((a,b)=>a+b*b,0),effectiveSampleSize=sq?sum*sum/sq:0;
 return{weights,iterations,converged,maxResidual,effectiveSampleSize,before,after:distribution(agents,weights,targets),unsupported:[...new Set(unsupported)]};
}
