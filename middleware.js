import { NextResponse } from "next/server";

// Best-effort in-memory rate limiting per Edge isolate. Not perfectly
// consistent across all edge nodes/cold starts, but meaningfully raises
// the cost of brute-forcing login or hammering public API routes since
// no external store (Redis) is wired into this deployment.
const RULES = [
  // Tight budget only on credentials login POST — other /api/auth/* routes
  // (session, csrf, providers, signout) are used by SessionProvider and must
  // not share this bucket or normal traffic can lock out login.
  { prefix: "/api/auth/callback/credentials", limit: 10, windowMs: 60_000 },
];
const DEFAULT_RULE = { prefix: "default", limit: 60, windowMs: 60_000 };

const buckets = new Map();
let lastSweep = Date.now();

function sweep(now) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}

function getClientIp(request) {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

function getRule(pathname) {
  return RULES.find((rule) => pathname.startsWith(rule.prefix)) || DEFAULT_RULE;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const rule = getRule(pathname);
  const ip = getClientIp(request);
  const key = `${ip}:${rule.prefix}`;
  const now = Date.now();

  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + rule.windowMs });
  } else {
    bucket.count += 1;
    if (bucket.count > rule.limit) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please try again shortly." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((bucket.resetAt - now) / 1000).toString(),
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
