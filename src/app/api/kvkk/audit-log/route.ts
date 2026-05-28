import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionContext } from "@/lib/session";

export async function GET() {
  try {
    const ctx = await getSessionContext();
    if (!ctx) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const orgId = ctx.organizationId;
    const logs = await prisma.dataRequestAuditLog.findMany({
      where: { organizationId: orgId },
      include: {
        user: { select: { id: true, name: true } },
        dataRequest: { select: { id: true, trackingCode: true, applicantName: true, applicantSurname: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json(logs);
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
