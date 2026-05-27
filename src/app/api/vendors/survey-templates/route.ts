import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SURVEY_QUESTIONS } from "@/lib/vendor-constants";

// GET: List survey templates
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const orgId = (session.user as any).organizationId;

  const templates = await prisma.complianceSurveyTemplate.findMany({
    where: { organizationId: orgId },
    include: { _count: { select: { surveys: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(templates);
}

// POST: Create survey template
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const orgId = (session.user as any).organizationId;

  try {
    const body = await req.json();
    const { name, description, questions, category, isDefault, useDefaultQuestions } = body;

    if (!name) return NextResponse.json({ error: "Sablon adi zorunludur" }, { status: 400 });

    // If useDefaultQuestions, load default KVKK & Security questions
    const templateQuestions = useDefaultQuestions ? DEFAULT_SURVEY_QUESTIONS : (questions || []);

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.complianceSurveyTemplate.updateMany({
        where: { organizationId: orgId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const template = await prisma.complianceSurveyTemplate.create({
      data: {
        organizationId: orgId,
        name,
        description,
        questions: templateQuestions,
        category,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json(template);
  } catch (error: any) {
    console.error("Create template error:", error);
    return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500 });
  }
}
