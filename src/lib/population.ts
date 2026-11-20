export type CountryCode = "IN" | "US" | "GB" | "DE" | "JP" | "BR";
export type ScenarioInput = { id: string; label: string; price: number; message: string };
export type AgentMemory = { exposures: number; lastIntent: number; learnedAffinity: number; lastSeenAt: string; notes: string[] };
export type SyntheticAgent = {
  id: string; age: number; ageBand: string; gender: "Female" | "Male" | "Non-binary"; residence: "Urban" | "Rural";
  income: "Lower" | "Middle" | "Higher"; language: string; priceSensitivity: number; noveltySeeking: number;
  trustPropensity: number; socialInfluence: number; qualityOrientation: number; memory: AgentMemory;
};
export type PopulationInput = {
  product: string; description: string; country: CountryCode; language: string; audience: string;
  sampleSize: number; seed: string; scenarios: ScenarioInput[]; previousAgents?: SyntheticAgent[];
};
export type PopulationScenarioResult = {
  id: string; label: string; price: number; message: string; intentIndex: number;
  uncertainty: [number, number]; segmentBreakdown: { name: string; count: number; intent: number }[];
  objections: { label: string; count: number }[]; interactionLift: number; summary: string;
};
export type PopulationResult = {
  id: string; createdAt: string; country: CountryCode; countryName: string; language: string;
  population: { generated: number; urban: number; rural: number; ageBands: { label: string; count: number }[]; gender: { label: string; count: number }[]; income: { label: string; count: number }[] };
  cohortId: string; agents: SyntheticAgent[]; scenarios: PopulationScenarioResult[]; caveats: string[];
};
type Profile = { name: string; languages: string[]; age: [number, number, number, number]; female: number; urban: number; income: [number, number, number]; priceFactor: number };
export const COUNTRY_PROFILES: Record<CountryCode, Profile> = {
  IN: { name: "India", languages: ["English", "Hindi", "Marathi", "Bengali", "Tamil", "Telugu"], age: [27, 25, 31, 17], female: 49, urban: 37, income: [35, 50, 15], priceFactor: 0.35 },
  US: { name: "United States", languages: ["English", "Spanish"], age: [22, 22, 27, 29], female: 50.5, urban: 83, income: [28, 47, 25], priceFactor: 2.2 },
  GB: { name: "United Kingdom", languages: ["English", "Welsh", "Polish"], age: [21, 23, 27, 29], female: 50.5, urban: 84, income: [25, 50, 25], priceFactor: 2.4 },
  DE: { name: "Germany", languages: ["German", "English", "Turkish"], age: [19, 21, 28, 32], female: 50.5, urban: 78, income: [22, 53, 25], priceFactor: 2.1 },
  JP: { name: "Japan", languages: ["Japanese", "English"], age: [15, 16, 25, 44], female: 51, urban: 92, income: [25, 50, 25], priceFactor: 0.025 },
  BR: { name: "Brazil", languages: ["Portuguese", "English", "Spanish"], age: [23, 24, 29, 24], female: 51, urban: 87, income: [35, 50, 15], priceFactor: 0.45 },
};
// These are transparent starter priors for product prototyping, not official census estimates.
function rng(seed: string) { let h = 2166136261; for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619); let s = h >>> 0; return () => { s += 0x6D2B79F5; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function pick<T>(items: T[], weights: number[], random: () => number): T { const n = random() * weights.reduce((a,b)=>a+b,0); let sum=0; for(let i=0;i<items.length;i++){sum+=weights[i]; if(n<=sum)return items[i];} return items[items.length-1]; }
const ageLabels = ["18–24", "25–34", "35–54", "55+"];
const ageRanges: Record<string,[number,number]> = {"18–24":[18,24],"25–34":[25,34],"35–54":[35,54],"55+":[55,78]};
function audienceAgeBounds(audience:string):[number,number]{const match=audience.match(/(\d{1,2})\s*(?:-|–|to)\s*(\d{1,2})/i);if(!match)return [18,78];const low=Math.max(18,Math.min(78,Number(match[1])));const high=Math.max(low,Math.min(78,Number(match[2])));return [low,high];}
function makeAgents(input: PopulationInput, profile: Profile): SyntheticAgent[] {
  const random = rng(input.seed + "|" + input.country);
  const [audienceMin, audienceMax] = audienceAgeBounds(input.audience);
  const bandWeights = ageLabels.map((label, index) => { const [lo, hi] = ageRanges[label]; const overlap = Math.max(0, Math.min(hi, audienceMax) - Math.max(lo, audienceMin) + 1); return profile.age[index] * overlap / (hi - lo + 1); });
  const old = new Map<string, SyntheticAgent>((input.previousAgents || []).map(a => [a.id, a] as const));
  return Array.from({length: input.sampleSize}, (_, i) => {
    const id = input.seed + "-agent-" + String(i+1).padStart(5,"0");
    const prior = old.get(id);
    const ageBand = pick(ageLabels, bandWeights, random);
    const [bandLow, bandHigh] = ageRanges[ageBand];
    const lo = Math.max(bandLow, audienceMin);
    const hi = Math.min(bandHigh, audienceMax);
    return {
      id, age: lo + Math.floor(random()*(hi-lo+1)), ageBand,
      gender: pick(["Female","Male","Non-binary"], [profile.female, 100-profile.female-1, 1], random) as SyntheticAgent["gender"],
      residence: pick(["Urban","Rural"], [profile.urban,100-profile.urban], random) as SyntheticAgent["residence"],
      income: pick(["Lower","Middle","Higher"], profile.income, random) as SyntheticAgent["income"],
      language: input.language || profile.languages[0],
      priceSensitivity: Math.round(random()*100), noveltySeeking: Math.round(random()*100),
      trustPropensity: Math.round(random()*100), socialInfluence: Math.round(random()*100),
      qualityOrientation: Math.round(random()*100),
      memory: prior?.memory || { exposures: 0, lastIntent: 50, learnedAffinity: 0, lastSeenAt: "", notes: [] },
    };
  });
}
function clamp(n:number, lo=0, hi=100){return Math.max(lo,Math.min(hi,n));}
function inputPriceFactor(country:CountryCode){return COUNTRY_PROFILES[country].priceFactor;}
function scoreAgent(agent:SyntheticAgent, scenario:ScenarioInput, input:PopulationInput) {
  const text = (input.product+" "+input.description+" "+scenario.message).toLowerCase();
  const valueCue = /affordable|value|save|budget|low.price|discount/.test(text) ? 9 : 0;
  const trustCue = /certif|guarantee|review|trusted|proof|secure|transparent/.test(text) ? 8 : 0;
  const convenienceCue = /fast|easy|delivery|nearby|simple|instant/.test(text) ? 6 : 0;
  const innovationCue = /new|unique|first|innovative|different/.test(text) ? 6 : 0;
  const affordability = clamp(100 - scenario.price * inputPriceFactor(input.country) * (agent.priceSensitivity / 100));
  const baseline = 30 + affordability*.24 + agent.noveltySeeking*.13 + agent.trustPropensity*.1 + agent.qualityOrientation*.12 + valueCue + trustCue*(agent.trustPropensity/100) + convenienceCue + innovationCue*(agent.noveltySeeking/100) + agent.memory.learnedAffinity*.12;
  const incomeAdjust = agent.income === "Lower" ? -8 : agent.income === "Higher" ? 6 : 0;
  return clamp(baseline + incomeAdjust);
}
function counts<T extends string>(agents:SyntheticAgent[], get:(a:SyntheticAgent)=>T) { const map=new Map<string,number>(); for(const a of agents){const k=get(a);map.set(k,(map.get(k)||0)+1);} return [...map].map(([label,count])=>({label,count})); }
export function runPopulationSimulation(input: PopulationInput): PopulationResult {
  const profile=COUNTRY_PROFILES[input.country]; const agents=makeAgents(input,profile);
  const network=agents.map((_,i)=>[(i+1)%agents.length,(i+7)%agents.length,(i+19)%agents.length,(i+43)%agents.length]);
  const scenarios=input.scenarios.slice(0,6).map(s=>{
    const raw=agents.map(a=>scoreAgent(a,s,input));
    const interacted=raw.map((score,i)=>{const peers=network[i];const peerMean=peers.reduce((sum,p)=>sum+raw[p],0)/Math.max(1,peers.length);return clamp(score+(peerMean-score)*(agents[i].socialInfluence/100)*.16);});
    const intentIndex=Math.round(interacted.reduce((a,b)=>a+b,0)/interacted.length);
    const interactionLift=Number((interacted.reduce((sum,v,i)=>sum+v-raw[i],0)/interacted.length).toFixed(1));
    const segments=["Value-led","Trust-led","Novelty-led","Quality-led"].map((name,j)=>{const subset=agents.map((a,i)=>({a,v:interacted[i]})).filter(({a})=>j===0?a.priceSensitivity>=65:j===1?a.trustPropensity>=65:j===2?a.noveltySeeking>=65:a.qualityOrientation>=65);return {name,count:subset.length,intent:Math.round(subset.reduce((x,y)=>x+y.v,0)/Math.max(1,subset.length))};});
    const objections=[{label:"Price / value mismatch",count:agents.filter(a=>a.priceSensitivity>70&&s.price>20).length},{label:"Insufficient trust signals",count:agents.filter(a=>a.trustPropensity>70&&!/review|trusted|proof|guarantee|secure/i.test(s.message)).length},{label:"Low perceived differentiation",count:agents.filter(a=>a.noveltySeeking<30&&!/unique|new|different|first/i.test(s.message)).length}].sort((a,b)=>b.count-a.count);
    return {id:s.id,label:s.label,price:s.price,message:s.message,intentIndex,uncertainty:[Math.max(0,intentIndex-7),Math.min(100,intentIndex+7)] as [number,number],segmentBreakdown:segments,objections,interactionLift,summary:`In this synthetic ${profile.name} scenario, the ${s.label.toLowerCase()} configuration produced an intent index of ${intentIndex}/100. This is a model signal, not a measured purchase probability. The largest simulated friction is ${objections[0].label.toLowerCase()}.`};
  });
  const updated=agents.map(a=>{const ownIntent=scoreAgent(a,input.scenarios[0],input);return {...a,memory:{exposures:a.memory.exposures+1,lastIntent:Math.round(ownIntent),learnedAffinity:clamp(a.memory.learnedAffinity+(ownIntent-50)*.08,-30,30),lastSeenAt:new Date().toISOString(),notes:[...a.memory.notes.slice(-2),`Exposure ${a.memory.exposures+1}: ${input.product} scenario`]}};});
  const ageBands=ageLabels.map(label=>({label,count:agents.filter(a=>a.ageBand===label).length}));
  return {id:crypto.randomUUID(),createdAt:new Date().toISOString(),country:input.country,countryName:profile.name,language:input.language,population:{generated:agents.length,urban:agents.filter(a=>a.residence==="Urban").length,rural:agents.filter(a=>a.residence==="Rural").length,ageBands,gender:counts(agents,a=>a.gender),income:counts(agents,a=>a.income)},cohortId:input.seed,agents:updated,scenarios,caveats:["Country profiles are transparent illustrative priors for prototype testing, not official census estimates or representative sampling frames.","Agents are generated synthetic records. They do not correspond to real people.","Intent indices and scenario differences are hypotheses, not forecasts or measured purchase probabilities.","Social influence is a simplified ring-network interaction model; it is not validated human behaviour.","Agent memory is persisted by this browser when you save a run; it is not shared across devices or users."]};
}
