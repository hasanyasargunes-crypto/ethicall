import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionContext } from "@/lib/session";

function generateKVKKCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KVK-${code}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orgSlug,
      applicantName,
      applicantSurname,
      applicantTCKN,
      applicantPassport,
      applicantNationality,
      applicantAddress,
      applicantEmail,
      applicantPhone,
      applicantFax,
      isProxy,
      proxyName,
      proxyDocument,
      rightType,
      subject,
      description,
      formData,
    } = body;

    if (!orgSlug || !applicantName || !applicantSurname || !applicantAddress || !rightType || !subject || !description) {
      return NextResponse.json({ error: "Zorunlu alanlar eksik" }, { status: 400 });
    }

    const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
    if (!org) {
      return NextResponse.json({ error: "Organizasyon bulunamadı" }, { status: 404 });
    }

    let trackingCode: string;
    let exists = true;
    do {
      trackingCode = generateKVKKCode();
      const existing = await prisma.dataRequest.findUnique({ where: { trackingCode } });
      exists = !!existing;
    } while (exists);

    const now = new Date();
    const slaDeadline = new Date(now.getTime() + (org.kvkkSlaResponseDays || 30) * 24 * 60 * 60 * 1000);

    const dataRequest = await prisma.dataRequest.create({
      data: {
        trackingCode,
        organizationId: org.id,
        applicantName,
        applicantSurname,
        applicantTCKN: applicantTCKN || null,
        applicantPassport: applicantPassport || null,
        applicantNationality: applicantNationality || null,
        applicantAddress,
        applicantEmail: applicantEmail || null,
        applicantPhone: applicantPhone || null,
        applicantFax: applicantFax || null,
        applicantEmailVerified: false,
        isProxy: isProxy || false,
        proxyName: proxyName || null,
        proxyDocument: proxyDocument || null,
        rightType,
        subject,
        description,
        formData: formData || undefined,
        slaDeadline,
      },
    });

    await prisma.dataRequestAuditLog.create({
      data: {
        dataRequestId: dataRequest.id,
        organizationId: org.id,
        action: "data_request.created",
        details: { trackingCode, rightType },
      },
    });

    return NextResponse.json({ trackingCode });
  } catch (error) {
    console.error("Data request creation error:", error);
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
    const requests = await prisma.dataRequest.findMany({
      where: { organizationId: orgId },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
