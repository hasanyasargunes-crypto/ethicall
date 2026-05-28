import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ctx = await getSessionContext();
  if (!ctx) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const orgId = ctx.organizationId;

  const logs = await prisma.vendorAuditLog.findMany({
    where: { organizationId: orgId },
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(logs);
}
