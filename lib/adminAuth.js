import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { prismaDB } from "@/lib/prismaDB";

export async function requireAuthPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session;
}

export async function requireAdminPage() {
  const session = await requireAuthPage();
  if (!session) return { session: null, reason: "unauthenticated" };

  const user = await prismaDB.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    return { session: null, reason: "forbidden" };
  }

  session.user.role = "ADMIN";
  return { session, reason: null };
}

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  const user = await prismaDB.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      ),
    };
  }

  session.user.role = "ADMIN";
  return { session };
}
