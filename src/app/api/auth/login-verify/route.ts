import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendLoginOtpEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "E-posta ve şifre gerekli" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { email },
      include: { organization: true },
    });

    if (!user) {
      return NextResponse.json({ error: "E-posta veya şifre hatalı" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "E-posta veya şifre hatalı" }, { status: 401 });
    }

    const recentCode = await prisma.verificationCode.findFirst({
      where: {
        email,
        orgSlug: "_login",
        createdAt: { gte: new Date(Date.now() - 60 * 1000) },
      },
    });
    if (recentCode) {
      return NextResponse.json({ error: "Lütfen 1 dakika bekleyin" }, { status: 429 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.verificationCode.create({
      data: {
        email,
        code,
        orgSlug: "_login",
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    await sendLoginOtpEmail(email, code, user.name);

    return NextResponse.json({ success: true, userName: user.name });
  } catch (err) {
    console.error("Login verify error:", err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
