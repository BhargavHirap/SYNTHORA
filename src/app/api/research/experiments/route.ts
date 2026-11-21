import { NextResponse } from "next/server";
import { createHash, randomUUID } from "node:crypto";
import { assertSameOrigin, getBrowserOwnerId, getDatabase } from "@/lib/neon";
import type { PopulationInput, PopulationResult } from "@/lib/population";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonSize(value: unknown) {
  return Buffer.byteLength(JSON.stringify(value), "utf8");
}

export async function GET() {
  try {
    const ownerId = await getBrowserOwnerId();
    const sql = getDatabase();
    const rows = await sql`
      SELECT r.id, p.population AS result
      FROM experiment_runs r
      INNER JOIN population_snapshots p ON p.run_id = r.id
      WHERE r.created_by = ${ownerId}
      ORDER BY r.created_at DESC
      LIMIT 30
    `;
    return NextResponse.json(
      { experiments: rows.map((row) => row.result).filter(Boolean), persistence: "neon" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load research history." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = await request.json() as { result?: PopulationResult; input?: PopulationInput };
    const result = body.result;
    if (!result || typeof result !== "object" || !result.id || !Array.isArray(result.agents) || !Array.isArray(result.scenarios)) {
      return NextResponse.json({ error: "A valid population simulation result is required." }, { status: 400 });
    }
    if (jsonSize(body) > 5_000_000) {
      return NextResponse.json({ error: "This experiment exceeds the 5 MB save limit." }, { status: 413 });
    }

    const ownerId = await getBrowserOwnerId();
    const sql = getDatabase();
    const [project] = await sql`
      INSERT INTO research_projects (name, description, owner_id)
      VALUES ('My SYNTHORA research', 'Private browser research workspace', ${ownerId})
      ON CONFLICT (owner_id) DO UPDATE SET updated_at = now()
      RETURNING id
    `;
    const runId = randomUUID();
    const cohortSeed = String(result.cohortId || result.id);
    let seedHash = 2166136261;
    for (const character of cohortSeed + "|" + result.country) seedHash = Math.imul(seedHash ^ character.charCodeAt(0), 16777619);
    const randomSeed = String(seedHash >>> 0);
    const input = body.input || {};
    const manifest = {
      schema: "synthora.reproducibility-manifest.v2",
      runId,
      resultId: result.id,
      generatedAt: new Date().toISOString(),
      engineVersion: "synthora-population-v0.7",
      gitCommit: process.env.VERCEL_GIT_COMMIT_SHA || null,
      randomSeed,
      seedSource: "cohortId + country",
      randomGenerator: "FNV-1a 32-bit seed + Mulberry32",
      parameters: input,
      country: result.country,
      countryProfile: result.countryName,
      populationSize: result.population?.generated ?? result.agents.length,
      scenarioCount: result.scenarios.length,
      modelProvider: "deterministic local simulation engine",
      reproducibilityNote: "This run uses the population engine seeded from cohortId and country; the stored seed matches the engine seed derivation.",
      resultCreatedAt: result.createdAt,
      caveats: result.caveats || [],
    };
    const manifestHash = createHash("sha256").update(JSON.stringify(manifest)).digest("hex");

    await sql`
      INSERT INTO experiment_runs (
        id, project_id, run_name, status, engine_version, git_commit, random_seed,
        parameters, population_config, agent_config, scenario_config, validation_config,
        summary, created_by, started_at, completed_at
      ) VALUES (
        ${runId}, ${project.id}, ${"Population simulation · " + result.countryName},
        'completed', 'synthora-population-v0.7', ${process.env.VERCEL_GIT_COMMIT_SHA || null},
        ${randomSeed}, ${JSON.stringify(input)}::jsonb,
        ${JSON.stringify({ country: result.country, population: result.population })}::jsonb,
        ${JSON.stringify({ agentCount: result.agents.length, memoryPersisted: true })}::jsonb,
        ${JSON.stringify(result.scenarios)}::jsonb,
        ${JSON.stringify({ caveats: result.caveats || [], scientificValidation: "not_claimed", technicalIntegrityPassed: integrityPassed })}::jsonb,
        ${JSON.stringify({ generated: result.population?.generated, scenarios: result.scenarios.length })}::jsonb,
        ${ownerId}, now(), now()
      )
    `;
    const uniqueAgentIds = new Set(result.agents.map((agent) => agent.id)).size;
    const scenarioOutputsValid = result.scenarios.every((scenario) =>
      Number.isFinite(scenario.intentIndex) && scenario.intentIndex >= 0 && scenario.intentIndex <= 100
    );
    const populationCountMatches = result.population?.generated === result.agents.length;
    const integrityChecks = [
      { key: "unique_agent_ids", label: "Agent identifiers are unique", passed: uniqueAgentIds === result.agents.length },
      { key: "scenario_bounds", label: "Scenario intent outputs are within 0–100", passed: scenarioOutputsValid },
      { key: "population_count", label: "Population count matches generated agents", passed: populationCountMatches },
    ];
    const integrityPassed = integrityChecks.every((check) => check.passed);

    await sql.transaction([
      sql`INSERT INTO population_snapshots (run_id, population, distribution_metadata)
          VALUES (${runId}, ${JSON.stringify(result)}::jsonb,
          ${JSON.stringify({ country: result.country, profile: "illustrative starter priors" })}::jsonb)`,
      sql`INSERT INTO agent_records (run_id, external_agent_id, attributes, goals, memory)
          SELECT ${runId}, agent->>'id', agent - 'id' - 'memory', '[]'::jsonb,
                 COALESCE(agent->'memory', '{}'::jsonb)
          FROM jsonb_array_elements(${JSON.stringify(result.agents)}::jsonb) AS agent`,
      ...result.scenarios.map((scenario) => sql`
        INSERT INTO scenario_results (run_id, scenario_key, inputs, outputs)
        VALUES (${runId}, ${String(scenario.id)}, ${JSON.stringify({ label: scenario.label, price: scenario.price, message: scenario.message })}::jsonb,
                ${JSON.stringify(scenario)}::jsonb)
      `),
      ...result.scenarios.map((scenario) => sql`
        INSERT INTO agent_interactions (run_id, round_number, participant_ids, interaction)
        VALUES (${runId}, 0, '[]'::jsonb,
                ${JSON.stringify({ type: "aggregate_network_effect", scenarioKey: scenario.id, interactionLift: scenario.interactionLift, note: "Aggregate scenario network effect; individual interaction traces are not generated by this engine." })}::jsonb)
      `),
      sql`INSERT INTO validation_results (run_id, benchmark_name, metrics, confidence_intervals, quality_gates, passed)
          VALUES (${runId}, 'synthetic-run-integrity',
                  ${JSON.stringify({ agentCount: result.agents.length, uniqueAgentIds, scenarioCount: result.scenarios.length, scenarioOutputsValid, populationCountMatches })}::jsonb,
                  '{}'::jsonb, ${JSON.stringify(integrityChecks)}::jsonb, ${integrityPassed})`,
      sql`INSERT INTO reproducibility_manifests (run_id, manifest, manifest_sha256)
          VALUES (${runId}, ${JSON.stringify(manifest)}::jsonb, ${manifestHash})`,
      sql`INSERT INTO research_audit_events (project_id, run_id, actor_id, action, detail)
          VALUES (${project.id}, ${runId}, ${ownerId}, 'experiment.completed',
                  ${JSON.stringify({ resultId: result.id, randomSeed, agentCount: result.agents.length })}::jsonb)`,
    ]);

    return NextResponse.json({ saved: true, runId, manifestHash, persistence: "neon" }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save experiment." },
      { status: 503 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Experiment id is required." }, { status: 400 });
    const ownerId = await getBrowserOwnerId();
    const sql = getDatabase();
    const rows = await sql`
      DELETE FROM experiment_runs
      WHERE id = ${id}::uuid AND created_by = ${ownerId}
      RETURNING id
    `;
    return NextResponse.json({ deleted: rows.length > 0 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete experiment." },
      { status: 503 },
    );
  }
}
