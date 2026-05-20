import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const orgSlug = req.nextUrl.searchParams.get("orgSlug");
    if (!orgSlug) {
      return NextResponse.json({ error: "orgSlug gerekli" }, { status: 400 });
    }

    const org = await prisma.organization.findUnique({
      where: { slug: orgSlug },
    });
    if (!org) {
      return NextResponse.json({ error: "Organizasyon bulunamadı" }, { status: 404 });
    }

    const categories = await prisma.category.findMany({
      where: { organizationId: org.id, isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
