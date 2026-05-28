import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateRiskScore } from "@/lib/vendor-constants";

// POST: Submit survey responses (public, no auth)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string; surveyId: string }> }
) {
  const { token, surveyId } = await params;

  try {
    const vendor = await prisma.vendor.findUnique({
      where: { portalToken: token },
      select: { id: true, organizationId: true },
    });
    if (!vendor) return NextResponse.json({ error: "Portal bulunamadı" }, { status: 404 });

    const survey = await prisma.complianceSurvey.findFirst({
      where: { id: surveyId, vendorId: vendor.id, status: { in: ["SENT", "IN_PROGRESS"] } },
      include: { template: true },
    });
    if (!survey) return NextResponse.json({ error: "Anket bulunamadı" }, { status: 404 });

    if (survey.expiresAt < new Date()) {
      await prisma.complianceSurvey.update({ where: { id: surveyId }, data: { status: "EXPIRED" } });
      return NextResponse.json({ error: "Anketin süresi dolmuş" }, { status: 400 });
    }

    const { responses } = await req.json();
    if (!responses) return NextResponse.json({ error: "Cevaplar gerekli" }, { status: 400 });

    const questions = (survey.template.questions as any[]) || [];
    const { score, level } = calculateRiskScore(questions, responses);

    // Update survey
    const updated = await prisma.complianceSurvey.update({
      where: { id: surveyId },
      data: {
        responses,
        status: "COMPLETED",
        completedAt: new Date(),
        riskScore: score,
        riskLevel: level as any,
      },
    });

    // Recalculate vendor overall risk score (average of all completed surveys)
    const allSurveys = await prisma.complianceSurvey.findMany({
      where: { vendorId: vendor.id, status: "COMPLETED", riskScore: { not: null } },
      select: { riskScore: true, riskLevel: true },
    });

    if (allSurveys.length > 0) {
      const avgScore = Math.round(
        allSurveys.reduce((sum, s) => sum + (s.riskScore || 0), 0) / allSurveys.length
      );
      let overallLevel: string;
      if (avgScore >= 80) overallLevel = "LOW";
      else if (avgScore >= 60) overallLevel = "MEDIUM";
      else if (avgScore >= 40) overallLevel = "HIGH";
      else overallLevel = "CRITICAL";

      await prisma.vendor.update({
        where: { id: vendor.id },
        data: { overallRiskScore: avgScore, riskLevel: overallLevel as any },
      });
    }

    // Audit log
    await prisma.vendorAuditLog.create({
      data: {
        vendorId: vendor.id,
        action: "SURVEY_COMPLETED",
        details: { surveyId, riskScore: score, riskLevel: level },
        organizationId: vendor.organizationId,
      },
    });

    return NextResponse.json({ success: true, riskScore: score, riskLevel: level });
  } catch (error: any) {
    console.error("Submit survey error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
