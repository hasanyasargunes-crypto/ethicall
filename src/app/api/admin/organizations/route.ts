import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET: List all organizations (SUPER_ADMIN only)
export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const organizations = await prisma.organization.findMany({
    include: {
      _count: { select: { users: true, reports: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(organizations);
}

// POST: Create new organization with admin user (SUPER_ADMIN only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      orgName, slug, domain, emailDomain, plan, billingPeriod,
      adminName, adminEmail, adminPassword, products,
    } = body;

    if (!orgName || !slug || !domain || !emailDomain || !plan || !adminName || !adminEmail || !adminPassword) {
      return NextResponse.json({ error: "Tüm alanlar zorunludur" }, { status: 400 });
    }

    const existing = await prisma.organization.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Bu slug zaten kullanılmakta" }, { status: 400 });
    }

    const adminEmailDomain = adminEmail.split("@")[1];
    if (adminEmailDomain !== emailDomain) {
      return NextResponse.json(
        { error: "Admin e-posta adresi belirtilen mail uzantısı ile eşleşmiyor" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(adminPassword, 12);

    // Calculate plan dates
    const planStartDate = new Date();
    const planEndDate = new Date();
    if (billingPeriod === "YEARLY") {
      planEndDate.setFullYear(planEndDate.getFullYear() + 1);
    } else {
      planEndDate.setMonth(planEndDate.getMonth() + 1);
    }

    // Check if domain already taken
    const existingDomain = await prisma.organization.findUnique({ where: { domain } });
    if (existingDomain) {
      return NextResponse.json({ error: "Bu domain zaten kullanılmakta" }, { status: 400 });
    }

    const org = await prisma.organization.create({
      data: {
        name: orgName,
        slug,
        domain,
        emailDomain,
        plan,
        products: products && products.length > 0 ? products : ["ETHICS"],
        billingPeriod: billingPeriod || "MONTHLY",
        planStartDate,
        planEndDate,
        users: {
          create: {
            email: adminEmail,
            name: adminName,
            passwordHash,
            role: "ADMIN",
          },
        },
        categories: {
          createMany: {
            data: [
              { name_tr: "Finansal Suistimal", name_en: "Financial Fraud", icon: "Banknote", sortOrder: 0 },
              { name_tr: "Yolsuzluk ve Rüşvet", name_en: "Corruption & Bribery", icon: "Scale", sortOrder: 1 },
              { name_tr: "İş Sağlığı ve Güvenliği", name_en: "Workplace Safety", icon: "HardHat", sortOrder: 2 },
              { name_tr: "Ayrımcılık ve Taciz", name_en: "Discrimination & Harassment", icon: "ShieldAlert", sortOrder: 3 },
              { name_tr: "Çıkar Çatışması", name_en: "Conflict of Interest", icon: "Swords", sortOrder: 4 },
              { name_tr: "Veri Gizliliği İhlali", name_en: "Data Privacy Breach", icon: "Lock", sortOrder: 5 },
              { name_tr: "Çevresel İhlal", name_en: "Environmental Violation", icon: "TreePine", sortOrder: 6 },
              { name_tr: "Diğer", name_en: "Other", icon: "MoreHorizontal", sortOrder: 7 },
            ],
          },
        },
      },
      include: {
        users: true,
        _count: { select: { categories: true } },
      },
    });

    return NextResponse.json(org);
  } catch (error: any) {
    console.error("Create org error:", error);
    if (error?.code === "P2002") {
      const target = error.meta?.target;
      if (target?.includes("domain")) {
        return NextResponse.json({ error: "Bu domain zaten kullanılmakta" }, { status: 400 });
      }
      if (target?.includes("slug")) {
        return NextResponse.json({ error: "Bu slug zaten kullanılmakta" }, { status: 400 });
      }
      if (target?.includes("email")) {
        return NextResponse.json({ error: "Bu e-posta adresi zaten kayıtlı" }, { status: 400 });
      }
      return NextResponse.json({ error: "Bu kayıt zaten mevcut" }, { status: 400 });
    }
    return NextResponse.json({ error: "Sunucu hatası: " + (error?.message || "Bilinmeyen hata") }, { status: 500 });
  }
}
