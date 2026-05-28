import { cookies } from "next/headers";
import { auth } from "./auth";
import { prisma } from "./prisma";

export type SessionContext = {
  userId: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  impersonating: boolean;
};

export async function getSessionContext(): Promise<SessionContext | null> {
  const session = await auth();
  if (!session?.user) return null;

  const user = session.user as any;
  const ctx: SessionContext = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    organizationId: user.organizationId,
    organizationName: user.organizationName,
    organizationSlug: user.organizationSlug,
    impersonating: false,
  };

  if (user.role !== "SUPER_ADMIN") return ctx;

  const cookieStore = await cookies();
  const impersonateOrgId = cookieStore.get("ethicall_impersonate")?.value;
  if (!impersonateOrgId) return ctx;

  const org = await prisma.organization.findUnique({
    where: { id: impersonateOrgId },
    select: { id: true, name: true, slug: true, allowSupportAccess: true },
  });

  if (!org || !org.allowSupportAccess) return ctx;

  ctx.organizationId = org.id;
  ctx.organizationName = org.name;
  ctx.organizationSlug = org.slug;
  ctx.impersonating = true;

  return ctx;
}
