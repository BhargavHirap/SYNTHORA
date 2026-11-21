import "server-only";
import { neon } from "@neondatabase/serverless";

export function getDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured for this deployment.");
  return neon(connectionString);
}

export async function getBrowserOwnerId() {
  const { cookies } = await import("next/headers");
  const jar = await cookies();
  const existing = jar.get("synthora-browser-id")?.value;
  if (existing && /^[0-9a-f-]{36}$/i.test(existing)) return existing;
  const { randomUUID } = await import("node:crypto");
  const id = randomUUID();
  jar.set("synthora-browser-id", id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return id;
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    throw new Error("Cross-origin requests are not allowed.");
  }
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    throw new Error("Cross-site requests are not allowed.");
  }
}
