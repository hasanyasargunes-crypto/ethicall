import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { messageSchema } from "@/lib/validation";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await req.json();
    const parsed = messageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
    }

    const report = await prisma.report.findUnique({
      where: { trackingCode: code.toUpperCase().trim() },
    });
    if (!report) {
      return NextResponse.json({ error: "İhbar bulunamadı" }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        reportId: report.id,
        content: parsed.data.content,
        senderType: "REPORTER",
      },
    });

    return NextResponse.json(message);
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
