import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendPasswordChangedEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const body = await req.json();
  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Tum alanlar zorunludur" }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Sifre en az 8 karakter olmalidir" }, { status: 400 });
  }

  // Get current user
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "Kullanici bulunamadi" }, { status: 404 });
  }

  // Verify current password
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Mevcut sifre hatali" }, { status: 400 });
  }

  // Hash and update
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  // Send password change notification (non-blocking)
  sendPasswordChangedEmail(user.email, user.name).catch((err) =>
    console.error("Password change email error:", err)
  );

  return NextResponse.json({ success: true });
}
