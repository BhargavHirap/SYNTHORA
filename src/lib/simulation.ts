export type ExperimentInput = {
  product: string;
  description: string;
  market: string;
  audience: string;
  price: number;
  currency: string;
  sampleSize: number;
  message: string;
};

export type Segment = {
  name: string;
  share: number;
  intent: number;
  rationale: string;
  barrier: string;
};

export type SimulationResult = {
  id: string;
  mode: "demo" | "ai-assisted";
  headline: string;
  summary: string;
  estimatedIntent: number;
  intentRange: [number, number];
  segments: Segment[];
  drivers: { label: string; score: number; note: string }[];
  recommendations: string[];
  caveats: string[];
  createdAt: string;
};

const segmentTemplates = [
  { name: "Value-first pragmatists", share: 24, base: 48, rationale: "Compare utility against the price paid.", barrier: "Unclear value for money" },
  { name: "Convenience seekers", share: 19, base: 61, rationale: "Respond to time-saving and easy access.", barrier: "Availability or friction" },
  { name: "Trust-led evaluators", share: 18, base: 45, rationale: "Look for proof, reviews and credible guarantees.", barrier: "Insufficient trust signals" },
  { name: "Early adopters", share: 14, base: 72, rationale: "Enjoy trying differentiated new offers.", barrier: "Product relevance" },
  { name: "Quality-conscious planners", share: 15, base: 57, rationale: "Balance durability, quality and long-term value.", barrier: "Unproven quality" },
  { name: "Socially influenced explorers", share: 10, base: 59, rationale: "Use peer recommendations as one input.", barrier: "Low social proof" },
];

function stableNoise(seed: string, index: number) {
  let hash = 0;
  for (const char of seed + index) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return Math.abs(hash % 13) - 6;
}

export function runDemoSimulation(input: ExperimentInput): SimulationResult {
  const priceFactor = input.price <= 10 ? 9 : input.price <= 25 ? 5 : input.price <= 50 ? 1 : input.price <= 100 ? -4 : -9;
  const context = (input.product + input.description + input.audience + input.message).toLowerCase();
  const trustFactor = /certif|guarantee|review|trusted|proof|return/.test(context) ? 5 : 0;
  const convenienceFactor = /delivery|fast|easy|instant|nearby|simple/.test(context) ? 4 : 0;
  const seed = [input.product, input.market, input.audience, input.price].join("|");
  const segments = segmentTemplates.map((segment, index) => ({
    name: segment.name,
    share: segment.share,
    intent: Math.max(8, Math.min(92, segment.base + priceFactor + trustFactor + convenienceFactor + stableNoise(seed, index))),
    rationale: segment.rationale,
    barrier: segment.barrier,
  }));
  const estimatedIntent = Math.round(segments.reduce((sum, segment) => sum + segment.intent * segment.share, 0) / 100);
  const spread = 9 + Math.round((100 - estimatedIntent) / 25);
  const currency = input.currency || "USD";
  return {
    id: crypto.randomUUID(),
    mode: "demo",
    headline: estimatedIntent >= 65 ? "Promising simulated response" : estimatedIntent >= 48 ? "Mixed simulated response" : "Meaningful adoption barriers",
    summary: `In this illustrative scenario, ${input.audience.toLowerCase()} in ${input.market} show a mixed response to ${input.product}. The strongest next step is to test the value proposition and the largest stated objection with real participants.`,
    estimatedIntent,
    intentRange: [Math.max(0, estimatedIntent - spread), Math.min(100, estimatedIntent + spread)],
    segments,
    drivers: [
      { label: "Price-value fit", score: Math.max(18, Math.min(88, 52 + priceFactor * 3)), note: `Scenario price: ${currency} ${input.price}` },
      { label: "Trust signals", score: Math.max(20, Math.min(86, 46 + trustFactor * 5)), note: trustFactor ? "Trust cues detected in the brief." : "Add proof, reviews or a clear guarantee." },
      { label: "Convenience", score: Math.max(20, Math.min(86, 48 + convenienceFactor * 5)), note: convenienceFactor ? "Convenience cues detected in the brief." : "Clarify access, delivery and effort." },
      { label: "Differentiation", score: /unique|first|new|different|exclusive/.test(context) ? 70 : 49, note: "Based on language in the experiment brief, not competitor research." },
    ],
    recommendations: [
      "Run a price-cell test with at least three realistic price points.",
      "Interview a small sample from the segments showing the strongest objections.",
      "Test one trust-led message against one convenience-led message.",
    ],
    caveats: [
      "Demo mode uses illustrative heuristic priors, not measured population data.",
      "The segment shares are deliberately generic and are not country-specific estimates.",
      "Intent scores are scenario indicators—not purchase probabilities or forecasts.",
      "No actual people were surveyed and no real-world behaviour was observed.",
    ],
    createdAt: new Date().toISOString(),
  };
}
