import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Vendor detail
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const orgId = (session.user as any).organizationId;

  const vendor = await prisma.vendor.findFirst({
    where: { id, organizationId: orgId },
    include: {
      surveys: {
        include: { template: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      documents: { orderBy: { createdAt: "desc" } },
      _count: { select: { surveys: true, documents: true } },
    },
  });

  if (!vendor) return NextResponse.json({ error: "Tedarikci bulunamadi" }, { status: 404 });

  return NextResponse.json(vendor);
}

// PUT: Update vendor
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const orgId = (session.user as any).organizationId;
  const userId = (session.user as any).id;

  try {
    const body = await req.json();
    const { companyName, contactName, contactEmail, contactPhone, taxId, address, sector, notes, status } = body;

    const existing = await prisma.vendor.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) return NextResponse.json({ error: "Tedarikci bulunamadi" }, { status: 404 });

    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        ...(companyName && { companyName }),
        ...(contactName && { contactName }),
        ...(contactEmail && { contactEmail }),
        ...(contactPhone !== undefined && { contactPhone }),
        ...(taxId !== undefined && { taxId }),
        ...(address !== undefined && { address }),
        ...(sector !== undefined && { sector }),
        ...(notes !== undefined && { notes }),
        ...(status && { status }),
      },
    });

    await prisma.vendorAuditLog.create({
      data: {
        vendorId: id,
        userId,
        action: status && status !== existing.status ? "VENDOR_STATUS_CHANGED" : "VENDOR_UPDATED",
        details: status && status !== existing.status
          ? { from: existing.status, to: status }
          : { fields: Object.keys(body) },
        organizationId: orgId,
      },
    });

    return NextResponse.json(vendor);
  } catch (error: any) {
    console.error("Update vendor error:", error);
    return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500 });
  }
}

// DELETE: Remove vendor
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const orgId = (session.user as any).organizationId;

  try {
    const vendor = await prisma.vendor.findFirst({ where: { id, organizationId: orgId } });
    if (!vendor) return NextResponse.json({ error: "Tedarikci bulunamadi" }, { status: 404 });

    // Delete related data
    await prisma.vendorDocument.deleteMany({ where: { vendorId: id } });
    await prisma.complianceSurvey.deleteMany({ where: { vendorId: id } });
    await prisma.vendorAuditLog.deleteMany({ where: { vendorId: id } });
    await prisma.vendor.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete vendor error:", error);
    return NextResponse.json({ error: "Silme islemi basarisiz" }, { status: 500 });
  }
}
