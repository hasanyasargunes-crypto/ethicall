import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint - no auth required
// Returns organization branding info by slug
export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get("slug");
    if (!slug) {
      return NextResponse.json({ error: "slug parametresi gerekli" }, { status: 400 });
    }

    const org = await prisma.organization.findUnique({
      where: { slug },
      select: {
        name: true,
        slug: true,
        logoUrl: true,
        primaryColor: true,
        secondaryColor: true,
        fontFamily: true,
      },
    });

    if (!org) {
      return NextResponse.json({ error: "Organizasyon bulunamadi" }, { status: 404 });
    }

    return NextResponse.json(org);
  } catch {
    return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500 });
  }
}
