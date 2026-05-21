import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const body = await req.json();
  const { action, newEmail, otp } = body;

  if (action === "send_otp") {
    if (!newEmail) {
      return NextResponse.json({ error: "E-posta adresi gerekli" }, { status: 400 });
    }

    // Generate 6 digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP (reuse VerificationCode model)
    await prisma.verificationCode.create({
      data: {
        email: newEmail,
        code,
        orgSlug: "email-change",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // In dev/demo mode, return the code
    const isDev = !process.env.RESEND_API_KEY;
    if (isDev) {
      return NextResponse.json({ success: true, demoCode: code });
    }

    // TODO: Send email with code
    return NextResponse.json({ success: true });
  }

  if (action === "verify_otp") {
    if (!newEmail || !otp) {
      return NextResponse.json({ error: "E-posta ve kod gerekli" }, { status: 400 });
    }

    const verification = await prisma.verificationCode.findFirst({
      where: {
        email: newEmail,
        code: otp,
        orgSlug: "email-change",
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verification) {
      return NextResponse.json({ error: "Gecersiz veya suresi dolmus kod" }, { status: 400 });
    }

    // Mark code as used
    await prisma.verificationCode.update({
      where: { id: verification.id },
      data: { used: true },
    });

    // Update user email
    await prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Gecersiz islem" }, { status: 400 });
}
