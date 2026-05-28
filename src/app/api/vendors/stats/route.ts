import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ctx = await getSessionContext();
  if (!ctx) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const orgId = ctx.organizationId;

  const [vendors, surveys, expiringDocs] = await Promise.all([
    prisma.vendor.findMany({
      where: { organizationId: orgId },
      select: { id: true, status: true, overallRiskScore: true, riskLevel: true },
    }),
    prisma.complianceSurvey.findMany({
      where: { vendor: { organizationId: orgId } },
      select: { status: true, riskScore: true },
    }),
    prisma.vendorDocument.findMany({
      where: {
        vendor: { organizationId: orgId },
        expiryDate: { lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
      },
      select: { id: true, expiryDate: true },
    }),
  ]);

  const totalVendors = vendors.length;
  const activeVendors = vendors.filter((v) => v.status === "ACTIVE").length;
  const pendingSurveys = surveys.filter((s) => s.status === "SENT" || s.status === "IN_PROGRESS").length;
  const completedSurveys = surveys.filter((s) => s.status === "COMPLETED").length;

  const avgRiskScore = vendors.filter((v) => v.overallRiskScore !== null).length > 0
    ? Math.round(
        vendors
          .filter((v) => v.overallRiskScore !== null)
          .reduce((sum, v) => sum + (v.overallRiskScore || 0), 0) /
          vendors.filter((v) => v.overallRiskScore !== null).length
      )
    : null;

  const byRiskLevel = {
    LOW: vendors.filter((v) => v.riskLevel === "LOW").length,
    MEDIUM: vendors.filter((v) => v.riskLevel === "MEDIUM").length,
    HIGH: vendors.filter((v) => v.riskLevel === "HIGH").length,
    CRITICAL: vendors.filter((v) => v.riskLevel === "CRITICAL").length,
    UNSCORED: vendors.filter((v) => !v.riskLevel).length,
  };

  const byStatus = {
    ACTIVE: vendors.filter((v) => v.status === "ACTIVE").length,
    PENDING: vendors.filter((v) => v.status === "PENDING").length,
    INACTIVE: vendors.filter((v) => v.status === "INACTIVE").length,
    BLOCKED: vendors.filter((v) => v.status === "BLOCKED").length,
  };

  const now = new Date();
  const expiringDocCount = expiringDocs.filter(
    (d) => d.expiryDate && d.expiryDate > now
  ).length;
  const expiredDocCount = expiringDocs.filter(
    (d) => d.expiryDate && d.expiryDate <= now
  ).length;

  return NextResponse.json({
    totalVendors,
    activeVendors,
    pendingSurveys,
    completedSurveys,
    avgRiskScore,
    byRiskLevel,
    byStatus,
    expiringDocCount,
    expiredDocCount,
  });
}
