import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

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
  const { fields, name, description, status } = body;

  // Verify category belongs to this org
  const category = await prisma.category.findFirst({
    where: { id: categoryId, organizationId },
  });
  if (!category) {
    return NextResponse.json({ error: "Kategori bulunamadi" }, { status: 404 });
  }

  // Check if existing template has a publicToken
  const existing = await prisma.formTemplate.findUnique({
    where: { categoryId },
  });

  // Generate publicToken when going LIVE for the first time
  let publicToken = existing?.publicToken || null;
  if (status === "LIVE" && !publicToken) {
    publicToken = randomUUID().slice(0, 12);
  }

  const template = await prisma.formTemplate.upsert({
    where: { categoryId },
    update: {
      fields,
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(status && { status }),
      ...(publicToken && { publicToken }),
    },
    create: {
      categoryId,
      organizationId,
      fields,
      name: name || category.name_tr,
      description: description || null,
      status: status || "DRAFT",
      publicToken,
    },
  });

  return NextResponse.json(template);
}
