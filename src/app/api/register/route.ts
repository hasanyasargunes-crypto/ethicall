import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";
import bcrypt from "bcryptjs";

const DEFAULT_CATEGORIES = [
  { name_tr: "Finansal Suistimal", name_en: "Financial Fraud", icon: "Banknote", sortOrder: 0 },
  { name_tr: "Yolsuzluk ve Rüşvet", name_en: "Corruption & Bribery", icon: "Scale", sortOrder: 1 },
  { name_tr: "İş Sağlığı ve Güvenliği", name_en: "Workplace Safety", icon: "HardHat", sortOrder: 2 },
  { name_tr: "Ayrımcılık ve Taciz", name_en: "Discrimination & Harassment", icon: "ShieldAlert", sortOrder: 3 },
  { name_tr: "Çıkar Çatışması", name_en: "Conflict of Interest", icon: "Swords", sortOrder: 4 },
  { name_tr: "Veri Gizliliği İhlali", name_en: "Data Privacy Breach", icon: "Lock", sortOrder: 5 },
  { name_tr: "Çevresel İhlal", name_en: "Environmental Violation", icon: "TreePine", sortOrder: 6 },
  { name_tr: "Diğer", name_en: "Other", icon: "MoreHorizontal", sortOrder: 7 },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Geçersiz veri", details: parsed.error.flatten() }, { status: 400 });
    }

    const { orgName, orgSlug, domain, name, email, password } = parsed.data;

    const existingOrg = await prisma.organization.findFirst({
      where: { OR: [{ slug: orgSlug }, { domain }] },
    });
    if (existingOrg) {
      return NextResponse.json(
        { error: "Bu slug veya domain zaten kullanılıyor" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const org = await prisma.organization.create({
      data: {
        name: orgName,
        slug: orgSlug,
        domain,
        users: {
          create: {
            email,
            name,
            passwordHash,
            role: "ADMIN",
          },
        },
        categories: {
          create: DEFAULT_CATEGORIES,
        },
      },
      include: { users: true },
    });

    return NextResponse.json({ success: true, orgSlug: org.slug });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
