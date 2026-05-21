import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const { categoryId } = await params;
  const organizationId = (session.user as any).organizationId;
  const body = await req.json();
  const { fields } = body;

  // Verify category belongs to this org
  const category = await prisma.category.findFirst({
    where: { id: categoryId, organizationId },
  });
  if (!category) {
    return NextResponse.json({ error: "Kategori bulunamadi" }, { status: 404 });
  }

  const template = await prisma.formTemplate.upsert({
    where: { categoryId },
    update: { fields },
    create: { categoryId, organizationId, fields },
  });

  return NextResponse.json(template);
}
