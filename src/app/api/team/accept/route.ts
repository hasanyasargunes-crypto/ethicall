import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || !password || password.length < 8) {
      return NextResponse.json(
        { error: "Token ve en az 8 karakter sifre zorunludur" },
        { status: 400 }
      );
    }

    const invite = await prisma.teamInvite.findUnique({
      where: { token },
      include: { organization: true },
    });

    if (!invite) {
      return NextResponse.json({ error: "Gecersiz davet linki" }, { status: 404 });
    }

    if (invite.acceptedAt) {
      return NextResponse.json({ error: "Bu davet zaten kabul edilmis" }, { status: 400 });
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json({ error: "Bu davetin suresi dolmus" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Create user and mark invite as accepted in transaction
    await prisma.$transaction([
      prisma.user.create({
        data: {
          email: invite.email,
          name: invite.name,
          passwordHash,
          role: invite.role,
          organizationId: invite.organizationId,
        },
      }),
      prisma.teamInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ success: true, organizationName: invite.organization.name });
  } catch (error) {
    console.error("Accept invite error:", error);
    return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500 });
  }
}
