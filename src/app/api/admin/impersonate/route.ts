import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const IMPERSONATE_PASSWORD = "198286";

// POST: Start impersonation
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const { organizationId, password } = await req.json();

  if (password !== IMPERSONATE_PASSWORD) {
    return NextResponse.json({ error: "Şifre hatalı" }, { status: 401 });
  }

  if (!organizationId) {
    return NextResponse.json({ error: "Organizasyon seçilmedi" }, { status: 400 });
  }

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, name: true, slug: true, allowSupportAccess: true },
  });

  if (!org) {
    return NextResponse.json({ error: "Organizasyon bulunamadı" }, { status: 404 });
  }

  if (!org.allowSupportAccess) {
    return NextResponse.json(
      { error: "Bu organizasyon destek erişimini kapatmış" },
      { status: 403 }
    );
  }

  const cookieStore = await cookies();
  cookieStore.set("ethicall_impersonate", org.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 4, // 4 hours
  });

  return NextResponse.json({
    success: true,
    organization: { id: org.id, name: org.name, slug: org.slug },
  });
}

// DELETE: End impersonation
export async function DELETE() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const cookieStore = await cookies();
  cookieStore.delete("ethicall_impersonate");

  return NextResponse.json({ success: true });
}

// GET: Current impersonation status
export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const cookieStore = await cookies();
  const impersonateOrgId = cookieStore.get("ethicall_impersonate")?.value;

  if (!impersonateOrgId) {
    return NextResponse.json({ impersonating: false });
  }

  const org = await prisma.organization.findUnique({
    where: { id: impersonateOrgId },
    select: { id: true, name: true, slug: true },
  });

  if (!org) {
    cookieStore.delete("ethicall_impersonate");
    return NextResponse.json({ impersonating: false });
  }

  return NextResponse.json({
    impersonating: true,
    organization: { id: org.id, name: org.name, slug: org.slug },
  });
}
