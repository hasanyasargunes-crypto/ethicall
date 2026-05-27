import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;

    const template = await prisma.kVKKFormTemplate.findFirst({
      where: { publicToken: token, status: "LIVE" },
      include: {
        organization: {
          select: {
            name: true,
            slug: true,
            primaryColor: true,
            logoUrl: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: "Form bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({
      id: template.id,
      name: template.name,
      fields: template.fields,
      description: template.description,
      locale: template.locale,
      orgSlug: template.organization.slug,
      organization: {
        name: template.organization.name,
        primaryColor: template.organization.primaryColor,
        logoUrl: template.organization.logoUrl,
      },
    });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
