import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// PUT: Update survey template
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getSessionContext();
  if (!ctx) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const orgId = ctx.organizationId;

  try {
    const body = await req.json();
    const { name, description, questions, category, isDefault } = body;

    const existing = await prisma.complianceSurveyTemplate.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!existing) return NextResponse.json({ error: "Şablon bulunamadı" }, { status: 404 });

    if (isDefault) {
      await prisma.complianceSurveyTemplate.updateMany({
        where: { organizationId: orgId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const template = await prisma.complianceSurveyTemplate.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(questions && { questions }),
        ...(category !== undefined && { category }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    return NextResponse.json(template);
  } catch (error: any) {
    console.error("Update template error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// DELETE: Remove survey template
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getSessionContext();
  if (!ctx) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const orgId = ctx.organizationId;

  try {
    const existing = await prisma.complianceSurveyTemplate.findFirst({
      where: { id, organizationId: orgId },
      include: { _count: { select: { surveys: true } } },
    });
    if (!existing) return NextResponse.json({ error: "Şablon bulunamadı" }, { status: 404 });
    if (existing._count.surveys > 0) {
      return NextResponse.json({ error: "Bu şablon kullanılmakta, silinemez" }, { status: 400 });
    }

    await prisma.complianceSurveyTemplate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete template error:", error);
    return NextResponse.json({ error: "Silme başarısız" }, { status: 500 });
  }
}
