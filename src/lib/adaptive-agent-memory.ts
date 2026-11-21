export type AdaptiveMemoryRecord = {
  id: string;
  createdAt: string;
  product: string;
  question: string;
  summary: string;
  hypotheses: string[];
  recurringGaps: string[];
  contradictions: string[];
  mode: "ai_multi_agent" | "deterministic_fallback";
  feedback: "useful" | "not_useful" | "unrated";
};

export type AdaptiveMemoryNote = {
  product: string;
  question: string;
  summary: string;
  feedback: AdaptiveMemoryRecord["feedback"];
  createdAt: string;
  mode: AdaptiveMemoryRecord["mode"];
};

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
const stop = new Set(["about","after","before","between","could","should","would","their","there","these","those","which","where","while","with","from","that","this","into","your","have","will","only","more","than","what","when","does","under","over","across","based","using","real","world","data","evidence","research"]);

export function selectRelevantMemory(records: AdaptiveMemoryRecord[], product: string, question: string, limit = 5): AdaptiveMemoryNote[] {
  const query = new Set(normalize(product + " " + question).filter(x => !stop.has(x)));
  return records.map(record => {
    const words = normalize(record.product + " " + record.question + " " + record.summary + " " + record.hypotheses.join(" ")).filter(x => !stop.has(x));
    const overlap = words.reduce((score, word) => score + (query.has(word) ? 1 : 0), 0);
    const ageDays = Math.max(0, (Date.now() - Date.parse(record.createdAt)) / 86400000);
    const recency = Math.max(0, 1 - ageDays / 90);
    const feedbackBoost = record.feedback === "useful" ? 3 : record.feedback === "not_useful" ? -2 : 0;
    return { score: overlap + recency + feedbackBoost, note: { product: record.product, question: record.question, summary: record.summary.slice(0, 700), feedback: record.feedback, createdAt: record.createdAt, mode: record.mode } };
  }).filter(x => x.score > 0).sort((a,b) => b.score - a.score).slice(0, limit).map(x => x.note);
}

export function buildCollectiveMemoryInsights(records: AdaptiveMemoryRecord[]) {
  const gapCounts = new Map<string, number>();
  const hypothesisCounts = new Map<string, number>();
  for (const record of records) {
    for (const gap of record.recurringGaps) {
      const key = gap.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 180);
      if (key) gapCounts.set(key, (gapCounts.get(key) || 0) + 1);
    }
    for (const hypothesis of record.hypotheses) {
      const key = hypothesis.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 180);
      if (key) hypothesisCounts.set(key, (hypothesisCounts.get(key) || 0) + 1);
    }
  }
  const repeatedGaps = [...gapCounts].filter(([,count]) => count > 1).sort((a,b) => b[1]-a[1]).slice(0,5).map(([text,count]) => ({text,count}));
  const repeatedHypotheses = [...hypothesisCounts].filter(([,count]) => count > 1).sort((a,b) => b[1]-a[1]).slice(0,5).map(([text,count]) => ({text,count}));
  const rated = records.filter(x => x.feedback !== "unrated");
  return {
    runs: records.length,
    aiRuns: records.filter(x => x.mode === "ai_multi_agent").length,
    fallbackRuns: records.filter(x => x.mode === "deterministic_fallback").length,
    useful: records.filter(x => x.feedback === "useful").length,
    notUseful: records.filter(x => x.feedback === "not_useful").length,
    feedbackCoverage: rated.length,
    repeatedGaps,
    repeatedHypotheses,
  };
}
