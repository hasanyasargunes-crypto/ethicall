import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const organizationId = (session.user as any).organizationId;

  const categories = await prisma.category.findMany({
    where: { organizationId, isActive: true },
    include: { formTemplate: true },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(categories);
}
