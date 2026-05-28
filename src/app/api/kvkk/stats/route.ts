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
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, newThisMonth, slaBreaches, byStatus, byRight] = await Promise.all([
      prisma.dataRequest.count({ where: { organizationId: orgId } }),
      prisma.dataRequest.count({
        where: { organizationId: orgId, createdAt: { gte: startOfMonth } },
      }),
      prisma.dataRequest.count({
        where: {
          organizationId: orgId,
          slaDeadline: { lt: now },
          status: { notIn: ["COMPLETED", "REJECTED"] },
        },
      }),
      prisma.dataRequest.groupBy({
        by: ["status"],
        where: { organizationId: orgId },
        _count: true,
      }),
      prisma.dataRequest.groupBy({
        by: ["rightType"],
        where: { organizationId: orgId },
        _count: true,
      }),
    ]);

    const completed = await prisma.dataRequest.count({
      where: { organizationId: orgId, status: { in: ["COMPLETED", "APPROVED", "PARTIALLY_APPROVED"] } },
    });
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return NextResponse.json({
      total,
      newThisMonth,
      slaBreaches,
      completionRate,
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
      byRight: byRight.map((r) => ({ rightType: r.rightType, count: r._count })),
    });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
