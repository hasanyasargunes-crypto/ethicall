import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { emailVerificationSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = emailVerificationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
    }

    const { email, orgSlug } = parsed.data;

    const org = await prisma.organization.findUnique({
      where: { slug: orgSlug },
    });
    if (!org) {
      return NextResponse.json({ error: "Organizasyon bulunamadı" }, { status: 404 });
    }

    // TRIAL planında domain kontrolünü atla (demo modu)
    if (org.plan !== "TRIAL") {
      const emailDomain = email.split("@")[1];
      if (emailDomain !== org.domain) {
        return NextResponse.json(
          { error: "Bu e-posta adresi bu organizasyona ait değil" },
          { status: 400 }
        );
      }
    }

    const recentCode = await prisma.verificationCode.findFirst({
      where: {
        email,
        orgSlug,
        createdAt: { gte: new Date(Date.now() - 60 * 1000) },
      },
    });
    if (recentCode) {
      return NextResponse.json(
        { error: "Lütfen 1 dakika bekleyin" },
        { status: 429 }
      );
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.verificationCode.create({
      data: {
        email,
        code,
        orgSlug,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await sendVerificationEmail(email, code, org.name);

    // TRIAL planındaki organizasyonlarda kodu yanıtta döndür (demo modu)
    if (org.plan === "TRIAL") {
      return NextResponse.json({ success: true, demoCode: code });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
