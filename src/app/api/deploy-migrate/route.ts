import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const bypass = req.headers.get("x-vercel-protection-bypass");
  if (bypass !== "9Y4637mTbWSTuPYkYXPqb1IUtw10H8R8") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Organization"
      ADD COLUMN IF NOT EXISTS "allowSupportAccess" BOOLEAN NOT NULL DEFAULT true
    `);

    return NextResponse.json({ success: true, message: "allowSupportAccess column added" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
