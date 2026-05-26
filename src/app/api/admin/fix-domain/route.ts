import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== "ethicall-fix-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const org = await prisma.organization.findFirst({
    where: { users: { some: { role: "SUPER_ADMIN" } } },
  });

  if (!org) {
    return NextResponse.json({ error: "Org not found" }, { status: 404 });
  }

  const updated = await prisma.organization.update({
    where: { id: org.id },
    data: { emailDomain: "gmail.com" },
  });

  return NextResponse.json({
    success: true,
    orgName: updated.name,
    emailDomain: updated.emailDomain,
    domain: updated.domain,
  });
}
