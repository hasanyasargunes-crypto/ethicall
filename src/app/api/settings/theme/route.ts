import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ctx = await getSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const organizationId = ctx.organizationId;
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
  const ctx = await getSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  if (ctx.role !== "ADMIN" && ctx.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const organizationId = ctx.organizationId;
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
