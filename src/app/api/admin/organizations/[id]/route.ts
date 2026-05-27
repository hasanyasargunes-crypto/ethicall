import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Get single organization details
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const { id } = await params;

  const org = await prisma.organization.findUnique({
    where: { id },
    include: {
      users: { select: { id: true, name: true, email: true, role: true } },
      _count: { select: { users: true, reports: true, categories: true } },
    },
  });

  if (!org) {
    return NextResponse.json({ error: "Organizasyon bulunamadi" }, { status: 404 });
  }

  return NextResponse.json(org);
}

// PUT: Update organization
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const {
      name, slug, domain, emailDomain, plan, billingPeriod,
      primaryColor, secondaryColor, logoUrl, slaAcknowledgeDays, slaResolveDays,
      products,
    } = body;

    // Check org exists
    const existing = await prisma.organization.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Organizasyon bulunamadi" }, { status: 404 });
    }

    // Check slug uniqueness if changed
    if (slug && slug !== existing.slug) {
      const slugTaken = await prisma.organization.findUnique({ where: { slug } });
      if (slugTaken) {
        return NextResponse.json({ error: "Bu slug zaten kullanilmakta" }, { status: 400 });
      }
    }

    // Check domain uniqueness if changed
    if (domain && domain !== existing.domain) {
      const domainTaken = await prisma.organization.findUnique({ where: { domain } });
      if (domainTaken) {
        return NextResponse.json({ error: "Bu domain zaten kullanilmakta" }, { status: 400 });
      }
    }

    // Recalculate plan dates if billingPeriod changed
    let planDates: { planStartDate?: Date; planEndDate?: Date } = {};
    if (billingPeriod && billingPeriod !== existing.billingPeriod) {
      const start = new Date();
      const end = new Date();
      if (billingPeriod === "YEARLY") {
        end.setFullYear(end.getFullYear() + 1);
      } else {
        end.setMonth(end.getMonth() + 1);
      }
      planDates = { planStartDate: start, planEndDate: end };
    }

    const org = await prisma.organization.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(domain && { domain }),
        ...(emailDomain !== undefined && { emailDomain }),
        ...(plan && { plan }),
        ...(billingPeriod && { billingPeriod }),
        ...(primaryColor !== undefined && { primaryColor }),
        ...(secondaryColor !== undefined && { secondaryColor }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(slaAcknowledgeDays !== undefined && { slaAcknowledgeDays: Number(slaAcknowledgeDays) }),
        ...(slaResolveDays !== undefined && { slaResolveDays: Number(slaResolveDays) }),
        ...(products !== undefined && { products }),
        ...planDates,
      },
      include: {
        _count: { select: { users: true, reports: true } },
      },
    });

    return NextResponse.json(org);
  } catch (error: any) {
    console.error("Update org error:", error);
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Bu kayit zaten mevcut (unique constraint)" }, { status: 400 });
    }
    return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500 });
  }
}

// DELETE: Delete organization and all related data
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const org = await prisma.organization.findUnique({
      where: { id },
      include: { _count: { select: { users: true, reports: true } } },
    });

    if (!org) {
      return NextResponse.json({ error: "Organizasyon bulunamadi" }, { status: 404 });
    }

    // Prevent deleting the platform org
    if (org.slug === "ethicall") {
      return NextResponse.json({ error: "Platform organizasyonu silinemez" }, { status: 400 });
    }

    // Delete in order due to foreign keys
    // 1. Delete messages, audit logs, attachments for org reports
    const reportIds = await prisma.report.findMany({
      where: { organizationId: id },
      select: { id: true },
    });
    const rIds = reportIds.map((r) => r.id);

    if (rIds.length > 0) {
      await prisma.message.deleteMany({ where: { reportId: { in: rIds } } });
      await prisma.auditLog.deleteMany({ where: { reportId: { in: rIds } } });
      await prisma.attachment.deleteMany({ where: { reportId: { in: rIds } } });
    }

    // 2. Delete reports
    await prisma.report.deleteMany({ where: { organizationId: id } });

    // 2b. Delete KVKK data requests and related data
    const drIds = await prisma.dataRequest.findMany({
      where: { organizationId: id },
      select: { id: true },
    });
    const dataRequestIds = drIds.map((d) => d.id);
    if (dataRequestIds.length > 0) {
      await prisma.dataRequestMessage.deleteMany({ where: { dataRequestId: { in: dataRequestIds } } });
      await prisma.dataRequestAuditLog.deleteMany({ where: { dataRequestId: { in: dataRequestIds } } });
      await prisma.dataRequestAttachment.deleteMany({ where: { dataRequestId: { in: dataRequestIds } } });
    }
    await prisma.dataRequest.deleteMany({ where: { organizationId: id } });
    await prisma.dataRequestAuditLog.deleteMany({ where: { organizationId: id } });
    await prisma.kVKKFormTemplate.deleteMany({ where: { organizationId: id } });
    await prisma.responseTemplate.deleteMany({ where: { organizationId: id } });

    // 3. Delete form templates
    await prisma.formTemplate.deleteMany({ where: { organizationId: id } });

    // 4. Delete categories
    await prisma.category.deleteMany({ where: { organizationId: id } });

    // 5. Delete team invites
    await prisma.teamInvite.deleteMany({ where: { organizationId: id } });

    // 6. Delete audit logs for org users (not linked to reports)
    const userIds = await prisma.user.findMany({
      where: { organizationId: id },
      select: { id: true },
    });
    if (userIds.length > 0) {
      await prisma.auditLog.deleteMany({
        where: { userId: { in: userIds.map((u) => u.id) }, reportId: null },
      });
    }

    // 7. Delete users
    await prisma.user.deleteMany({ where: { organizationId: id } });

    // 8. Delete organization
    await prisma.organization.delete({ where: { id } });

    return NextResponse.json({ success: true, deletedOrg: org.name });
  } catch (error: any) {
    console.error("Delete org error:", error);
    return NextResponse.json({ error: "Silme islemi basarisiz: " + (error?.message || "") }, { status: 500 });
  }
}
