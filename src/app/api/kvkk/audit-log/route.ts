import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const orgId = (session.user as any).organizationId;
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
