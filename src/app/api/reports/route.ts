import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionContext } from "@/lib/session";
import { reportSchema } from "@/lib/validation";
import { generateTrackingCode } from "@/lib/tracking-code";
import { sendReportConfirmationEmail, sendNewReportNotificationEmail } from "@/lib/email";

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

    // Get category name for notification
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { name_tr: true },
    });

    // Send confirmation email to reporter (non-blocking)
    sendReportConfirmationEmail(reporterEmail, trackingCode, org.name).catch((err) =>
      console.error("Report confirmation email error:", err)
    );

    // Send notification to org admins/managers (non-blocking)
    const managers = await prisma.user.findMany({
      where: {
        organizationId: org.id,
        role: { in: ["ADMIN", "MANAGER"] },
      },
      select: { email: true, name: true },
    });
    for (const mgr of managers) {
      sendNewReportNotificationEmail(
        mgr.email,
        mgr.name,
        title,
        category?.name_tr || "Belirtilmemis",
        severity as string,
        org.name
      ).catch((err) =>
        console.error("New report notification email error:", err)
      );
    }

    return NextResponse.json({ trackingCode });
  } catch (error) {
    console.error("Report creation error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const ctx = await getSessionContext();
    if (!ctx) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const orgId = ctx.organizationId;
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
