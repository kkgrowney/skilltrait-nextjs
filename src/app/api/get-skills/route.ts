import { logger } from "@/lib/logger";

import { NextRequest, NextResponse } from "next/server";

import {
  admitRequest,
  fetchWithTimeout,
  readJsonBody,
  requireFirebaseUser,
} from "@/lib/server/apiSecurity";

export async function POST(request: NextRequest) {
  const admission = admitRequest(request, {
    route: "get-skills",
    maxRequests: 10,
    windowMs: 60_000,
    maxConcurrent: 3,
    maxBodyBytes: 256 * 1024,
  });
  if (admission instanceof NextResponse) return admission;
  try {
    const user = await requireFirebaseUser(request);
    if (user instanceof NextResponse) return user;
    const body = await readJsonBody<{ value?: unknown }>(request, 256 * 1024);
    if (body instanceof NextResponse) return body;
    if (typeof body.value !== "string" || body.value.length > 200_000) {
      return NextResponse.json({ error: "Invalid value" }, { status: 400 });
    }
    const response = await fetchWithTimeout(
      "https://us-central1-skill-trait-rwubkx.cloudfunctions.net/getSkillsForWebsite",
      { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ value: body.value }) },
      15_000,
    );
    if (!response.ok) return NextResponse.json({ error: "Skill analysis failed" }, { status: 502 });
    return NextResponse.json({ success: true, skills: await response.text() });
  } catch (error) {
    logger.error("Get-skills request failed", { error: error instanceof Error ? error.message : "unknown" });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    admission.release();
  }
}
