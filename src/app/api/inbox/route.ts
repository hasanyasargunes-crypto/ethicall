import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// GET: list messages grouped by report for the user's org
export async function GET(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const organizationId = ctx.organizationId;
  const url = new URL(req.url);
  const filter = url.searchParams.get("filter") || "all"; // all, unread, reporter, staff
  const search = url.searchParams.get("search") || "";

  const whereClause: any = {
    report: { organizationId },
  };

  if (filter === "unread") {
    whereClause.isRead = false;
    whereClause.senderType = "REPORTER";
  } else if (filter === "reporter") {
    whereClause.senderType = "REPORTER";
  } else if (filter === "staff") {
    whereClause.senderType = "STAFF";
  }

  if (search) {
    whereClause.OR = [
      { content: { contains: search, mode: "insensitive" } },
      { report: { title: { contains: search, mode: "insensitive" } } },
      { report: { trackingCode: { contains: search, mode: "insensitive" } } },
    ];
  }

  const messages = await prisma.message.findMany({
    where: whereClause,
    include: {
      report: {
        select: {
          id: true,
          trackingCode: true,
          title: true,
          status: true,
          category: { select: { name_tr: true } },
        },
      },
      sender: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Unread count
  const unreadCount = await prisma.message.count({
    where: {
      report: { organizationId },
      isRead: false,
      senderType: "REPORTER",
    },
  });

  return NextResponse.json({ messages, unreadCount });
}
