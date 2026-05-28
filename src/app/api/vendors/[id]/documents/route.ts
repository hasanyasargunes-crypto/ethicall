import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: List vendor documents
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id: vendorId } = await params;
  const orgId = (session.user as any).organizationId;

  const vendor = await prisma.vendor.findFirst({ where: { id: vendorId, organizationId: orgId } });
  if (!vendor) return NextResponse.json({ error: "Tedarikçi bulunamadı" }, { status: 404 });

  const documents = await prisma.vendorDocument.findMany({
    where: { vendorId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(documents);
}
