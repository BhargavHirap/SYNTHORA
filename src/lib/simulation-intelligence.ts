import type { CognitiveResult, CognitiveCountryResult } from "@/lib/cognitive-engine";

export type MarketIntelligence = {
  country: string; countryName: string; support: number; intervalWidth: number;
  confidenceBand: "Higher model stability" | "Moderate model stability" | "Lower model stability";
  consensusStability: number; polarization: number; momentum: number;
  networkExposure: number; risks: string[];
};
export type IntelligenceReport = {
  runId: string; generatedAt: string; seed: string; markets: MarketIntelligence[];
  strongestMarket: string; mostUncertainMarket: string; crossMarketSpread: number;
  robustSupport: number; recommendation: string; caveats: string[];
};
function clamp(n:number,min=0,max=100){return Math.max(min,Math.min(max,n));}
function analyzeMarket(c:CognitiveCountryResult):MarketIntelligence{
  const width=Math.max(0,c.interval[1]-c.interval[0]);
  const roundSupport=c.rounds.map(r=>r.support);
  const changes=roundSupport.slice(1).map((v,i)=>v-roundSupport[i]);
  const momentum=changes.length?Number((changes.reduce((a,b)=>a+b,0)/changes.length).toFixed(1)):0;
  const stability=roundSupport.length>1?clamp(100-(Math.max(...roundSupport)-Math.min(...roundSupport))*1.5):50;
  const confidenceBand=width<=12?"Higher model stability":width<=22?"Moderate model stability":"Lower model stability";
  const risks:string[]=[];
  if(width>22)risks.push("Wide Monte Carlo sensitivity interval");
  if(c.undecided>=30)risks.push("Large undecided synthetic cohort");
  if(c.polarization>=65)risks.push("High modelled opinion polarization");
  if(stability<55)risks.push("Support shifts materially between discussion rounds");
  if(c.network.averageDegree<2.5)risks.push("Low average network connectivity");
  if(!risks.length)risks.push("No threshold-based warning; this is not proof of real-world readiness");
  return {country:c.country,countryName:c.countryName,support:c.support,intervalWidth:Number(width.toFixed(1)),confidenceBand,consensusStability:Number(stability.toFixed(1)),polarization:c.polarization,momentum,networkExposure:Number(clamp(c.network.averageDegree*12.5).toFixed(1)),risks};
}
export function buildIntelligenceReport(result:CognitiveResult):IntelligenceReport{
  const markets=result.countries.map(analyzeMarket);
  const ordered=[...markets].sort((a,b)=>b.support-a.support);
  const uncertain=[...markets].sort((a,b)=>b.intervalWidth-a.intervalWidth);
  const values=markets.map(m=>m.support);
  const spread=values.length?Math.max(...values)-Math.min(...values):0;
  const robust=markets.length?Math.min(...markets.map(m=>m.support-m.intervalWidth/2)):0;
  const weakest=ordered.at(-1);
  const strongest=ordered[0];
  const recommendation=markets.length===1
    ? "Treat this as a single-market hypothesis. Run alternative propositions and compare against independent, market-specific evidence before making a decision."
    : spread<=10
      ? "The synthetic model shows relatively similar support across selected markets. Prioritise a small real-world pilot and validate local differences before scaling."
      : `${strongest.countryName} has the strongest simulated support, while ${weakest?.countryName||"another market"} is weakest. Consider a market-specific proposition test rather than a single global rollout.`;
  return {runId:result.id,generatedAt:new Date().toISOString(),seed:result.seed,markets,strongestMarket:strongest?.countryName||"—",mostUncertainMarket:uncertain[0]?.countryName||"—",crossMarketSpread:spread,robustSupport:Number(robust.toFixed(1)),recommendation,caveats:["All measures are derived from synthetic agents and the simulator's own assumptions; they are not survey estimates or validated forecasts.","Monte Carlo interval width measures sensitivity to the model's perturbations, not a confidence interval for a real population.","Network exposure is a simple transformation of average graph degree, not a measured social diffusion rate.","Threshold warnings are triage signals for further research, not causal explanations or proof of market demand."]};
}
