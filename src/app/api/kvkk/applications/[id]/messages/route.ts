import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionContext } from "@/lib/session";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getSessionContext();
    if (!ctx) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const { id } = await params;
    const orgId = ctx.organizationId;
    const userId = ctx.userId;
    const { content } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Mesaj içeriği gerekli" }, { status: 400 });
    }

    const dataRequest = await prisma.dataRequest.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!dataRequest) {
      return NextResponse.json({ error: "Başvuru bulunamadı" }, { status: 404 });
    }

    const message = await prisma.dataRequestMessage.create({
      data: {
        dataRequestId: id,
        content: content.trim(),
        senderType: "STAFF",
        senderId: userId,
      },
      include: { sender: { select: { id: true, name: true } } },
    });

    return NextResponse.json(message);
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
