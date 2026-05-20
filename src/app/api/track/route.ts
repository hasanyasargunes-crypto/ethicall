import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { trackingCode } = body;

    if (!trackingCode || typeof trackingCode !== "string") {
      return NextResponse.json({ error: "Takip kodu gerekli" }, { status: 400 });
    }

    const report = await prisma.report.findUnique({
      where: { trackingCode: trackingCode.toUpperCase().trim() },
      include: {
        category: true,
        organization: { select: { name: true, slug: true, primaryColor: true, logoUrl: true } },
        messages: {
          select: {
            id: true,
            content: true,
            senderType: true,
            createdAt: true,
            isRead: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "İhbar bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({
      id: report.id,
      trackingCode: report.trackingCode,
      title: report.title,
      status: report.status,
      severity: report.severity,
      category: { name_tr: report.category.name_tr, name_en: report.category.name_en },
      organization: report.organization,
      messages: report.messages,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
