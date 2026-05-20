import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { reportSchema } from "@/lib/validation";
import { generateTrackingCode } from "@/lib/tracking-code";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Geçersiz veri", details: parsed.error.flatten() }, { status: 400 });
    }

    const { title, description, categoryId, severity, formData, orgSlug, reporterEmail } = parsed.data;

    const org = await prisma.organization.findUnique({
      where: { slug: orgSlug },
    });
    if (!org) {
      return NextResponse.json({ error: "Organizasyon bulunamadı" }, { status: 404 });
    }

    let trackingCode: string;
    let exists = true;
    do {
      trackingCode = generateTrackingCode();
      const existing = await prisma.report.findUnique({ where: { trackingCode } });
      exists = !!existing;
    } while (exists);

    const now = new Date();
    const report = await prisma.report.create({
      data: {
        trackingCode,
        reporterEmail,
        reporterEmailVerified: true,
        categoryId,
        title,
        description,
        formData: formData || undefined,
        severity: severity as any,
        organizationId: org.id,
        slaAckDeadline: new Date(now.getTime() + org.slaAcknowledgeDays * 24 * 60 * 60 * 1000),
        slaResDeadline: new Date(now.getTime() + org.slaResolveDays * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.auditLog.create({
      data: {
        reportId: report.id,
        action: "report.created",
        details: { trackingCode },
      },
    });

    return NextResponse.json({ trackingCode });
  } catch (error) {
    console.error("Report creation error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const orgId = (session.user as any).organizationId;
    const reports = await prisma.report.findMany({
      where: { organizationId: orgId },
      include: {
        category: true,
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reports);
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
