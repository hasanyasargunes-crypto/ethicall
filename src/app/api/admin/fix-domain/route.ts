import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const orgId = (session.user as any).organizationId;

  const org = await prisma.organization.update({
    where: { id: orgId },
    data: { emailDomain: "gmail.com" },
  });

  return NextResponse.json({ success: true, emailDomain: org.emailDomain, orgName: org.name });
}
