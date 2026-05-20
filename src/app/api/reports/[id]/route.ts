import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const { id } = await params;
    const orgId = (session.user as any).organizationId;

    const report = await prisma.report.findFirst({
      where: { id, organizationId: orgId },
      include: {
        category: true,
        assignedTo: { select: { id: true, name: true, email: true } },
        messages: {
          include: { sender: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
        },
        auditLogs: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
        attachments: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "İhbar bulunamadı" }, { status: 404 });
    }

    const { reporterEmail, ...safeReport } = report;
    return NextResponse.json(safeReport);
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const { id } = await params;
    const orgId = (session.user as any).organizationId;
    const userId = (session.user as any).id;
    const body = await req.json();

    const existing = await prisma.report.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!existing) {
      return NextResponse.json({ error: "İhbar bulunamadı" }, { status: 404 });
    }

    const updateData: any = {};
    const auditDetails: any = {};

    if (body.status && body.status !== existing.status) {
      auditDetails.from = existing.status;
      auditDetails.to = body.status;
      updateData.status = body.status;
      if (body.status === "ACKNOWLEDGED" && !existing.acknowledgedAt) {
        updateData.acknowledgedAt = new Date();
      }
      if (["RESOLVED", "CLOSED"].includes(body.status) && !existing.resolvedAt) {
        updateData.resolvedAt = new Date();
      }
    }
    if (body.priority) updateData.priority = body.priority;
    if (body.severity) updateData.severity = body.severity;
    if (body.assignedToId !== undefined) updateData.assignedToId = body.assignedToId || null;

    const report = await prisma.report.update({
      where: { id },
      data: updateData,
    });

    if (Object.keys(auditDetails).length > 0) {
      await prisma.auditLog.create({
        data: {
          reportId: id,
          userId,
          action: body.status ? "status.changed" : "report.updated",
          details: auditDetails,
        },
      });
    }

    return NextResponse.json(report);
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
