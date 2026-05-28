import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ctx = await getSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const organizationId = ctx.organizationId;

  const categories = await prisma.category.findMany({
    where: { organizationId, isActive: true },
    include: { formTemplate: true },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(categories);
}
