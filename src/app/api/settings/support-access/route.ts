import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Get current support access setting
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const organizationId = (session.user as any).organizationId;
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { allowSupportAccess: true },
  });

  return NextResponse.json({ allowSupportAccess: org?.allowSupportAccess ?? true });
}

// PUT: Toggle support access
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const organizationId = (session.user as any).organizationId;
  const { allowSupportAccess } = await req.json();

  const org = await prisma.organization.update({
    where: { id: organizationId },
    data: { allowSupportAccess: Boolean(allowSupportAccess) },
    select: { allowSupportAccess: true },
  });

  return NextResponse.json({ allowSupportAccess: org.allowSupportAccess });
}
