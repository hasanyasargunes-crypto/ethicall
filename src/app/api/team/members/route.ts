import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const organizationId = (session.user as any).organizationId;

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
