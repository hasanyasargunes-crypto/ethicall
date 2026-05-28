import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionContext } from "@/lib/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getSessionContext();
    if (!ctx) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const { id } = await params;
    const orgId = ctx.organizationId;

    const dataRequest = await prisma.dataRequest.findFirst({
      where: { id, organizationId: orgId },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        attachments: true,
        messages: {
          include: { sender: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
        },
        auditLogs: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!dataRequest) {
      return NextResponse.json({ error: "Başvuru bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(dataRequest);
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getSessionContext();
    if (!ctx) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const { id } = await params;
    const orgId = ctx.organizationId;
    const userId = ctx.userId;
    const body = await req.json();

    const existing = await prisma.dataRequest.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Başvuru bulunamadı" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    const changes: string[] = [];

    if (body.status && body.status !== existing.status) {
      updateData.status = body.status;
      changes.push(`Durum: ${existing.status} → ${body.status}`);
      if (body.status === "COMPLETED") {
        updateData.responseDate = new Date();
      }
    }
    if (body.assignedToId !== undefined) {
      updateData.assignedToId = body.assignedToId || null;
      changes.push("Atama güncellendi");
    }
    if (body.responseContent !== undefined) {
      updateData.responseContent = body.responseContent;
      changes.push("Cevap güncellendi");
    }
    if (body.responseType !== undefined) {
      updateData.responseType = body.responseType;
    }
    if (body.pageCount !== undefined) {
      updateData.pageCount = body.pageCount;
      if (body.pageCount > 10) {
        updateData.feeAmount = (body.pageCount - 10) * 1;
      }
    }

    const updated = await prisma.dataRequest.update({
      where: { id },
      data: updateData,
    });

    if (changes.length > 0) {
      await prisma.dataRequestAuditLog.create({
        data: {
          dataRequestId: id,
          userId,
          organizationId: orgId,
          action: "data_request.updated",
          details: { changes },
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Data request update error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
