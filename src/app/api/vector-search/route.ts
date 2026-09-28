import { logger } from "@/lib/logger";

import { NextRequest, NextResponse } from "next/server";

import {
  admitRequest,
  fetchWithTimeout,
  readJsonBody,
  requireFirebaseUser,
} from "@/lib/server/apiSecurity";

type VectorSearchBody = { query?: unknown; comp?: unknown; mot?: unknown; prof?: unknown };

export async function POST(request: NextRequest) {
  const admission = admitRequest(request, {
    route: "vector-search",
    maxRequests: 20,
    windowMs: 60_000,
    maxConcurrent: 4,
    maxBodyBytes: 16 * 1024,
  });
  if (admission instanceof NextResponse) return admission;
  try {
    const user = await requireFirebaseUser(request);
    if (user instanceof NextResponse) return user;
    const body = await readJsonBody<VectorSearchBody>(request, 16 * 1024);
    if (body instanceof NextResponse) return body;
    if (typeof body.query !== "string" || typeof body.comp !== "string" || body.query.length > 2_000 || body.comp.length > 500) {
      return NextResponse.json({ error: "Invalid search parameters" }, { status: 400 });
    }
    const payload = new URLSearchParams({ query: body.query, comp: body.comp });
    if (body.mot !== undefined) payload.set("mot", String(body.mot));
    if (body.prof !== undefined) payload.set("prof", String(body.prof));
    const response = await fetchWithTimeout(
      "https://us-central1-skill-trait-rwubkx.cloudfunctions.net/vectorSearch",
      { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: payload },
      10_000,
    );
    if (!response.ok) return NextResponse.json({ error: "Search failed" }, { status: 502 });
    return NextResponse.json(await response.json(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    logger.error("Vector-search request failed", { error: error instanceof Error ? error.message : "unknown" });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    admission.release();
  }
}
