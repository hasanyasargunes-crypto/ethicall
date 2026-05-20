import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { otpVerificationSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = otpVerificationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
    }

    const { email, code, orgSlug } = parsed.data;

    const verification = await prisma.verificationCode.findFirst({
      where: {
        email,
        code,
        orgSlug,
        used: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "Geçersiz veya süresi dolmuş kod" },
        { status: 400 }
      );
    }

    await prisma.verificationCode.update({
      where: { id: verification.id },
      data: { used: true },
    });

    return NextResponse.json({ success: true, email, orgSlug });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
