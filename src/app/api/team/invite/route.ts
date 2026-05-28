import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { sendTeamInviteEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  if (ctx.role !== "ADMIN" && ctx.role !== "SUPER_ADMIN" && ctx.role !== "MANAGER") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { email, name, role } = body;
    const organizationId = ctx.organizationId;

    if (!email || !name || !role) {
      return NextResponse.json({ error: "Tüm alanlar zorunludur" }, { status: 400 });
    }

    if (!["ADMIN", "MANAGER", "REVIEWER"].includes(role)) {
      return NextResponse.json({ error: "Geçersiz rol" }, { status: 400 });
    }

    // Get organization to validate email domain
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!org) {
      return NextResponse.json({ error: "Organizasyon bulunamadı" }, { status: 404 });
    }

    // Validate email domain matches organization
    const emailDomain = email.split("@")[1];
    if (emailDomain !== org.domain) {
      return NextResponse.json(
        { error: `E-posta adresi şirket domainle eşleşmiyor (${org.domain})` },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email, organizationId },
    });
    if (existingUser) {
      return NextResponse.json({ error: "Bu e-posta zaten kayıtlı" }, { status: 400 });
    }

    // Check for existing pending invite
    const existingInvite = await prisma.teamInvite.findFirst({
      where: { email, organizationId, acceptedAt: null, expiresAt: { gte: new Date() } },
    });
    if (existingInvite) {
      return NextResponse.json({ error: "Bu e-posta için zaten bekleyen bir davet var" }, { status: 400 });
    }

    const token = uuidv4();
    const invite = await prisma.teamInvite.create({
      data: {
        email,
        name,
        role,
        token,
        organizationId,
        invitedById: ctx.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Send invite email
    const appUrl = process.env.APP_URL || process.env.AUTH_URL || "http://localhost:3000";
    await sendTeamInviteEmail(email, name, org.name, token, appUrl);

    return NextResponse.json({ success: true, invite });
  } catch (error) {
    console.error("Invite error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
