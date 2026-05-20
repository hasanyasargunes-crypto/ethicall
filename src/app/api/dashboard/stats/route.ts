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
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, newThisMonth, slaBreaches, resolved, byStatus, byCategory] =
      await Promise.all([
        prisma.report.count({ where: { organizationId: orgId } }),
        prisma.report.count({
          where: { organizationId: orgId, createdAt: { gte: startOfMonth } },
        }),
        prisma.report.count({
          where: {
            organizationId: orgId,
            status: { notIn: ["RESOLVED", "CLOSED", "DISMISSED"] },
            slaAckDeadline: { lt: now },
            acknowledgedAt: null,
          },
        }),
        prisma.report.count({
          where: { organizationId: orgId, status: "RESOLVED" },
        }),
        prisma.report.groupBy({
          by: ["status"],
          where: { organizationId: orgId },
          _count: true,
        }),
        prisma.report.groupBy({
          by: ["categoryId"],
          where: { organizationId: orgId },
          _count: true,
        }),
      ]);

    const categories = await prisma.category.findMany({
      where: { organizationId: orgId },
      select: { id: true, name_tr: true, name_en: true },
    });

    const byCategoryWithNames = byCategory.map((item) => {
      const cat = categories.find((c) => c.id === item.categoryId);
      return {
        category: cat?.name_tr || "Bilinmiyor",
        count: item._count,
      };
    });

    return NextResponse.json({
      total,
      newThisMonth,
      slaBreaches,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
      byCategory: byCategoryWithNames,
    });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
