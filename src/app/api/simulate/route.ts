import { NextRequest, NextResponse } from "next/server";
import { runDemoSimulation, type ExperimentInput } from "@/lib/simulation";

export const runtime = "nodejs";
export const maxDuration = 30;

function validInput(value: unknown): value is ExperimentInput {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.product === "string" && item.product.trim().length > 0
    && typeof item.market === "string" && item.market.trim().length > 0
    && typeof item.audience === "string" && item.audience.trim().length > 0
    && typeof item.price === "number" && Number.isFinite(item.price) && item.price >= 0
    && typeof item.sampleSize === "number" && item.sampleSize >= 20 && item.sampleSize <= 5000;
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    if (!validInput(body)) {
      return NextResponse.json({ error: "Please provide a product, market, audience, valid price and sample size between 20 and 5,000." }, { status: 400 });
    }

    const input: ExperimentInput = {
      product: body.product.trim().slice(0, 120),
      description: String(body.description || "").slice(0, 800),
      market: body.market.trim().slice(0, 100),
      audience: body.audience.trim().slice(0, 160),
      price: body.price,
      currency: String(body.currency || "USD").slice(0, 8),
      sampleSize: body.sampleSize,
      message: String(body.message || "").slice(0, 800),
    };

    const result = runDemoSimulation(input);
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json(result);

    const prompt = `You are SYNTHORA's cautious qualitative research analyst. You are analysing a synthetic scenario, not real respondents. Do not claim statistical representativeness, factual population knowledge, or predictive accuracy. Return only JSON with keys summary (string), recommendations (array of 3 short strings), and caveats (array of 3 short strings). Be specific to the supplied brief and clearly label interpretations as hypotheses. Brief: ${JSON.stringify(input)}. Heuristic segment results: ${JSON.stringify(result.segments)}.`;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are a rigorous synthetic-research analyst. Never present generated data as actual survey evidence." },
          { role: "user", content: prompt },
        ],
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!response.ok) {
      console.error("OpenAI analysis request failed:", response.status);
      return NextResponse.json({ ...result, caveats: [...result.caveats, "AI-assisted analysis was unavailable; results are shown in demo mode."] });
    }
    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content === "string") {
      const analysis = JSON.parse(content);
      return NextResponse.json({
        ...result,
        mode: "ai-assisted",
        summary: typeof analysis.summary === "string" ? analysis.summary : result.summary,
        recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations.slice(0, 3) : result.recommendations,
        caveats: Array.isArray(analysis.caveats) ? [...result.caveats, ...analysis.caveats.slice(0, 3)] : result.caveats,
      });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("Simulation error:", error);
    return NextResponse.json({ error: "The simulation could not be completed. Please try again." }, { status: 500 });
  }
}
