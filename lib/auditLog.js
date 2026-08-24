import { prismaDB } from "@/lib/prismaDB";

// This app shares its database with the main INSTA-BOT app. Both schemas are
// kept identical (see prisma/schema.prisma), and this app has its own
// InstaSiteAuditLog table/model so its admin log viewer only ever shows this
// app's own events, not INSTA-BOT's.

export function getIpFromHeaders(headers) {
  if (!headers) return null;
  const get = typeof headers.get === "function"
    ? (name) => headers.get(name)
    : (name) => headers[name] ?? headers[name?.toLowerCase()];
  const forwarded = get("x-forwarded-for");
  if (forwarded) return String(forwarded).split(",")[0].trim();
  return get("x-real-ip") || "unknown";
}

export function getUserAgentFromHeaders(headers) {
  if (!headers) return null;
  const get = typeof headers.get === "function"
    ? (name) => headers.get(name)
    : (name) => headers[name] ?? headers[name?.toLowerCase()];
  return get("user-agent") || null;
}

// Fire-and-forget audit trail write. Never throws — a logging failure must
// not block the underlying action (e.g. admin login).
export async function logAuditEvent({ eventType, userId, email, ip, userAgent, metadata }) {
  try {
    await prismaDB.instaSiteAuditLog.create({
      data: {
        eventType,
        userId: userId ?? null,
        email: email ?? null,
        ip: ip ?? null,
        userAgent: userAgent ?? null,
        metadata: metadata ?? undefined,
      },
    });
  } catch (error) {
    console.error("Failed to write security audit log:", error);
  }
}

export async function queryAuditEvents({ eventType, q, page = 1, pageSize = 25 } = {}) {
  const currentPage = Math.max(1, page);
  const limit = Math.min(100, Math.max(1, pageSize));

  const where = {};
  if (eventType) where.eventType = eventType;
  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { userId: { contains: q, mode: "insensitive" } },
      { ip: { contains: q, mode: "insensitive" } },
    ];
  }

  const [rows, total] = await Promise.all([
    prismaDB.instaSiteAuditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * limit,
      take: limit,
    }),
    prismaDB.instaSiteAuditLog.count({ where }),
  ]);

  return { rows, total };
}
