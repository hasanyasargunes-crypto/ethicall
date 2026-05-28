import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { v4 as uuid } from "uuid";

// POST: Assign survey to vendor
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getSessionContext();
  if (!ctx) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id: vendorId } = await params;
  const orgId = ctx.organizationId;
  const userId = ctx.userId;

  try {
    const { templateId, expiresInDays } = await req.json();
    if (!templateId) return NextResponse.json({ error: "Anket şablonu seçilmeli" }, { status: 400 });

    const vendor = await prisma.vendor.findFirst({ where: { id: vendorId, organizationId: orgId } });
    if (!vendor) return NextResponse.json({ error: "Tedarikçi bulunamadı" }, { status: 404 });

    const template = await prisma.complianceSurveyTemplate.findFirst({
      where: { id: templateId, organizationId: orgId },
    });
    if (!template) return NextResponse.json({ error: "Şablon bulunamadı" }, { status: 404 });

    const accessToken = uuid().replace(/-/g, "").substring(0, 32);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (expiresInDays || 30));

    const survey = await prisma.complianceSurvey.create({
      data: {
        vendorId,
        templateId,
        accessToken,
        status: "SENT",
        expiresAt,
      },
      include: { template: { select: { name: true } } },
    });

    await prisma.vendorAuditLog.create({
      data: {
        vendorId,
        userId,
        action: "SURVEY_ASSIGNED",
        details: { templateName: template.name, surveyId: survey.id },
        organizationId: orgId,
      },
    });

    // TODO: Send email to vendor with survey link
    // const surveyLink = `${process.env.APP_URL}/vendor-portal/${vendor.portalToken}?survey=${survey.accessToken}`;

    return NextResponse.json(survey);
  } catch (error: any) {
    console.error("Assign survey error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
