import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch vendor portal info (public, no auth)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const vendor = await prisma.vendor.findUnique({
    where: { portalToken: token },
    select: {
      id: true,
      companyName: true,
      contactName: true,
      contactEmail: true,
      status: true,
      organization: {
        select: {
          name: true,
          logoUrl: true,
          primaryColor: true,
        },
      },
      surveys: {
        where: { status: { in: ["SENT", "IN_PROGRESS"] } },
        include: {
          template: { select: { name: true, description: true, questions: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      documents: {
        select: { id: true, name: true, documentType: true, expiryDate: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!vendor || vendor.status === "BLOCKED") {
    return NextResponse.json({ error: "Portal bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(vendor);
}
