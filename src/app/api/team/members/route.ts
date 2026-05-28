import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ctx = await getSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const organizationId = ctx.organizationId;

  const [members, pendingInvites] = await Promise.all([
    prisma.user.findMany({
      where: { organizationId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.teamInvite.findMany({
      where: { organizationId, acceptedAt: null, expiresAt: { gte: new Date() } },
      select: { id: true, email: true, name: true, role: true, createdAt: true, expiresAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({ members, pendingInvites });
}
