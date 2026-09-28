import { NextRequest, NextResponse } from "next/server";

type RateBucket = { count: number; resetAt: number };

type SecurityState = {
  active: Map<string, number>;
  buckets: Map<string, RateBucket>;
};

type RequestPolicy = {
  maxBodyBytes?: number;
  maxConcurrent: number;
  maxRequests: number;
  route: string;
  windowMs: number;
};

export type FirebaseUser = {
  email?: string;
  localId: string;
};

const securityState = (() => {
  const root = globalThis as typeof globalThis & {
    __skillTraitApiSecurity?: SecurityState;
  };
  root.__skillTraitApiSecurity ??= {
    active: new Map(),
    buckets: new Map(),
  };
  return root.__skillTraitApiSecurity;
})();

function clientAddress(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function jsonError(message: string, status: number, retryAfter?: number) {
  const response = NextResponse.json({ error: message }, { status });
  if (retryAfter !== undefined) {
    response.headers.set("Retry-After", String(retryAfter));
  }
  response.headers.set("Cache-Control", "no-store");
  return response;
}

/**
 * Applies bounded, per-instance admission control before an expensive handler.
 * Production should also enforce distributed quotas at the hosting edge. This
 * guard provides a deterministic final line of defense inside each instance.
 */
export function admitRequest(
  request: NextRequest,
  policy: RequestPolicy,
): NextResponse | { release: () => void } {
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (
    policy.maxBodyBytes !== undefined &&
    Number.isFinite(contentLength) &&
    contentLength > policy.maxBodyBytes
  ) {
    return jsonError("Request body is too large", 413);
  }

  const now = Date.now();
  const rateKey = `${policy.route}:${clientAddress(request)}`;
  const currentBucket = securityState.buckets.get(rateKey);
  const bucket =
    !currentBucket || currentBucket.resetAt <= now
      ? { count: 0, resetAt: now + policy.windowMs }
      : currentBucket;
  bucket.count += 1;
  securityState.buckets.set(rateKey, bucket);

  if (bucket.count > policy.maxRequests) {
    return jsonError(
      "Too many requests",
      429,
      Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    );
  }

  const active = securityState.active.get(policy.route) || 0;
  if (active >= policy.maxConcurrent) {
    return jsonError("Service is busy; try again shortly", 503, 2);
  }

  securityState.active.set(policy.route, active + 1);
  let released = false;
  return {
    release: () => {
      if (released) return;
      released = true;
      const remaining = (securityState.active.get(policy.route) || 1) - 1;
      if (remaining <= 0) securityState.active.delete(policy.route);
      else securityState.active.set(policy.route, remaining);
    },
  };
}

export async function requireFirebaseUser(
  request: NextRequest,
): Promise<FirebaseUser | NextResponse> {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) {
    return jsonError("Authentication required", 401);
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return jsonError("Authentication is unavailable", 503);

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: authorization.slice(7) }),
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      },
    );
    if (!response.ok) return jsonError("Invalid authentication token", 401);
    const body = (await response.json()) as { users?: FirebaseUser[] };
    const user = body.users?.[0];
    if (!user?.localId) return jsonError("Invalid authentication token", 401);
    return user;
  } catch {
    return jsonError("Authentication service unavailable", 503);
  }
}

export async function readJsonBody<T>(
  request: NextRequest,
  maxBytes: number,
): Promise<T | NextResponse> {
  const raw = await request.text();
  if (Buffer.byteLength(raw, "utf8") > maxBytes) {
    return jsonError("Request body is too large", 413);
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return jsonError("Invalid JSON body", 400);
  }
}

export async function fetchWithTimeout(
  input: string | URL,
  init: RequestInit = {},
  timeoutMs = 10_000,
) {
  return fetch(input, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });
}
