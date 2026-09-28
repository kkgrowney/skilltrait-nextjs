import { logger } from "@/lib/logger";

import { NextRequest, NextResponse } from "next/server";

import {
  admitRequest,
  fetchWithTimeout,
  readJsonBody,
  requireFirebaseUser,
} from "@/lib/server/apiSecurity";

type SkillPayload = { user?: string; name?: string } & Record<string, unknown>;

export async function POST(request: NextRequest) {
  const admission = admitRequest(request, {
    route: "save-skill",
    maxRequests: 30,
    windowMs: 60_000,
    maxConcurrent: 5,
    maxBodyBytes: 32 * 1024,
  });
  if (admission instanceof NextResponse) return admission;
  try {
    const user = await requireFirebaseUser(request);
    if (user instanceof NextResponse) return user;
    const skillData = await readJsonBody<SkillPayload>(request, 32 * 1024);
    if (skillData instanceof NextResponse) return skillData;
    if (!skillData.user || !skillData.name) {
      return NextResponse.json({ error: "Missing required parameters: user and name" }, { status: 400 });
    }
    if (skillData.user !== user.localId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const response = await fetchWithTimeout(
      "https://us-central1-skill-trait-rwubkx.cloudfunctions.net/saveSkill",
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(skillData) },
      10_000,
    );
    if (!response.ok) return NextResponse.json({ error: "Unable to save skill" }, { status: 502 });
    return NextResponse.json(await response.json());
  } catch (error) {
    logger.error("Save-skill request failed", { error: error instanceof Error ? error.message : "unknown" });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    admission.release();
  }
}
