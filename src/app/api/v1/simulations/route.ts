import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  runPopulationSimulation,
  type PopulationInput,
  type CountryCode,
} from "@/lib/population";

export const runtime = "nodejs";
export const maxDuration = 60;

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "SYNTHORA API is not configured with a server-side database credential.",
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(req: Request) {
  try {
    const authorization = req.headers.get("authorization") || "";
    const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1] || "";

    if (!token.startsWith("syn_live_")) {
      return NextResponse.json(
        { error: "A SYNTHORA API key is required." },
        { status: 401 },
      );
    }

    const db = admin();
    const hash = createHash("sha256").update(token).digest("hex");
    const { data: keys, error: keyError } = await db
      .from("api_keys")
      .select("id,revoked_at")
      .eq("key_hash", hash)
      .limit(1);

    if (keyError || !keys?.length || keys[0].revoked_at) {
      return NextResponse.json(
        { error: "Invalid or revoked API key." },
        { status: 401 },
      );
    }

    const key = keys[0];
    const since = new Date(Date.now() - 60_000).toISOString();
    const { count, error: countError } = await db
      .from("api_requests")
      .select("id", { count: "exact", head: true })
      .eq("api_key_id", key.id)
      .gte("created_at", since);

    if (countError) throw countError;

    if ((count || 0) >= 60) {
      return NextResponse.json(
        { error: "Rate limit exceeded: 60 requests/minute." },
        { status: 429 },
      );
    }

    const body = (await req.json()) as PopulationInput & {
      countries?: CountryCode[];
    };
    const supported = ["IN", "US", "GB", "DE", "JP", "BR"];
    const requested = Array.isArray(body.countries)
      ? body.countries
      : [body.country];
    const markets = [...new Set(requested)].filter(
      (country): country is CountryCode =>
        supported.includes(String(country)),
    );

    if (
      !markets.length ||
      markets.length > 6 ||
      markets.length !== new Set(requested).size ||
      !Array.isArray(body.scenarios) ||
      body.scenarios.length < 1 ||
      body.scenarios.length > 6 ||
      !Number.isInteger(body.sampleSize) ||
      body.sampleSize < 50 ||
      body.sampleSize > 2500 ||
      !String(body.product || "").trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Provide 1–6 supported countries, 50–2,500 agents per market and 1–6 scenarios.",
        },
        { status: 400 },
      );
    }

    const baseSeed = String(body.seed || crypto.randomUUID()).slice(0, 80);
    const simulations = markets.map((country) => {
      const input: PopulationInput = {
        product: String(body.product).slice(0, 120),
        description: String(body.description || "").slice(0, 700),
        audience: String(
          body.audience || "General adult population",
        ).slice(0, 180),
        country,
        language: String(body.language || "English").slice(0, 40),
        sampleSize: body.sampleSize,
        seed: baseSeed + "-" + country,
        scenarios: body.scenarios.map((scenario, index) => ({
          id: String(scenario.id || index).slice(0, 60),
          label: String(scenario.label || "Scenario " + (index + 1)).slice(
            0,
            60,
          ),
          price: Math.max(0, Math.min(100000, Number(scenario.price) || 0)),
          message: String(scenario.message || "").slice(0, 500),
        })),
      };

      const result = runPopulationSimulation(input);
      const { agents, ...summary } = result;
      return summary;
    });

    const { error: logError } = await db
      .from("api_requests")
      .insert({ api_key_id: key.id, status: 200 });
    if (logError) throw logError;

    const { error: updateError } = await db
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", key.id);
    if (updateError) throw updateError;

    return NextResponse.json(
      {
        simulations,
        meta: {
          apiVersion: "v1",
          synthetic: true,
          validatedPrediction: false,
          markets: markets.length,
          agentsPerMarket: body.sampleSize,
          totalAgents: markets.length * body.sampleSize,
          agentProfilesIncluded: false,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Simulation failed.",
      },
      { status: 503 },
    );
  }
}
