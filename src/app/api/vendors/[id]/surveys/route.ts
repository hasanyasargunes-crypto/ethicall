import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v4 as uuid } from "uuid";

// POST: Assign survey to vendor
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id: vendorId } = await params;
  const orgId = (session.user as any).organizationId;
  const userId = (session.user as any).id;

  try {
    const { templateId, expiresInDays } = await req.json();
    if (!templateId) return NextResponse.json({ error: "Anket sablonu secilmeli" }, { status: 400 });

    const vendor = await prisma.vendor.findFirst({ where: { id: vendorId, organizationId: orgId } });
    if (!vendor) return NextResponse.json({ error: "Tedarikci bulunamadi" }, { status: 404 });

    const template = await prisma.complianceSurveyTemplate.findFirst({
      where: { id: templateId, organizationId: orgId },
    });
    if (!template) return NextResponse.json({ error: "Sablon bulunamadi" }, { status: 404 });

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
    return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500 });
  }
}
