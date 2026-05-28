import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v4 as uuid } from "uuid";

// GET: List all vendors for the org
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const orgId = (session.user as any).organizationId;

  const vendors = await prisma.vendor.findMany({
    where: { organizationId: orgId },
    include: {
      _count: { select: { surveys: true, documents: true } },
      surveys: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { status: true, riskScore: true, completedAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(vendors);
}

// POST: Add new vendor
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const orgId = (session.user as any).organizationId;
  const userId = (session.user as any).id;

  try {
    const body = await req.json();
    const { companyName, contactName, contactEmail, contactPhone, taxId, address, sector, notes } = body;

    if (!companyName || !contactName || !contactEmail) {
      return NextResponse.json({ error: "Şirket adı, ilgili kişi ve e-posta zorunludur" }, { status: 400 });
    }

    const portalToken = uuid().replace(/-/g, "").substring(0, 24);

    const vendor = await prisma.vendor.create({
      data: {
        organizationId: orgId,
        companyName,
        contactName,
        contactEmail,
        contactPhone,
        taxId,
        address,
        sector,
        notes,
        portalToken,
        status: "ACTIVE",
      },
    });

    // Audit log
    await prisma.vendorAuditLog.create({
      data: {
        vendorId: vendor.id,
        userId,
        action: "VENDOR_CREATED",
        details: { companyName, contactEmail },
        organizationId: orgId,
      },
    });

    return NextResponse.json(vendor);
  } catch (error: any) {
    console.error("Create vendor error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
