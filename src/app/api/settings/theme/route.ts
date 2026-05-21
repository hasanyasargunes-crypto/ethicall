import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const organizationId = (session.user as any).organizationId;
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      primaryColor: true,
      secondaryColor: true,
      fontFamily: true,
      logoUrl: true,
      name: true,
    },
  });

  return NextResponse.json(org);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const organizationId = (session.user as any).organizationId;
  const body = await req.json();

  const { primaryColor, secondaryColor, fontFamily } = body;

  const org = await prisma.organization.update({
    where: { id: organizationId },
    data: {
      ...(primaryColor && { primaryColor }),
      ...(secondaryColor && { secondaryColor }),
      ...(fontFamily && { fontFamily }),
    },
  });

  return NextResponse.json(org);
}
