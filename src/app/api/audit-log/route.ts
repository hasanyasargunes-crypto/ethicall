import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// GET: List audit logs for the organization (read-only)
export async function GET(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  if (!["ADMIN", "SUPER_ADMIN", "MANAGER"].includes(ctx.role)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const organizationId = ctx.organizationId;
  const isSuperAdmin = ctx.role === "SUPER_ADMIN" && !ctx.impersonating;

  const url = req.nextUrl;
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
  const action = url.searchParams.get("action") || undefined;
  const reportId = url.searchParams.get("reportId") || undefined;
  const skip = (page - 1) * limit;

  // Build filter: show logs for org's reports and org's users
  const where: any = {};

  if (!isSuperAdmin) {
    // Non-super-admins see only their org's logs
    where.OR = [
      { report: { organizationId } },
      { user: { organizationId } },
      { report: null, user: null }, // System logs with no report/user
    ];
  }

  if (action) {
    where.action = { contains: action };
  }

  if (reportId) {
    where.reportId = reportId;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        report: { select: { id: true, trackingCode: true, title: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return NextResponse.json({
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
