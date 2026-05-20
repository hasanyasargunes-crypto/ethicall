import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { messageSchema } from "@/lib/validation";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = messageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
    }

    const orgId = (session.user as any).organizationId;
    const report = await prisma.report.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!report) {
      return NextResponse.json({ error: "İhbar bulunamadı" }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        reportId: id,
        content: parsed.data.content,
        senderType: "STAFF",
        senderId: (session.user as any).id,
      },
      include: { sender: { select: { id: true, name: true } } },
    });

    return NextResponse.json(message);
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
